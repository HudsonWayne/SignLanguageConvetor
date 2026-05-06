import asyncio
import datetime
import websockets
import json

APP_ID = 80707
SYMBOLS = ["R_10", "R_25", "R_50", "R_75", "R_100"]
URL = f"wss://ws.binaryws.com/websockets/v3?app_id={APP_ID}"

GRANULARITIES = {
    "1h": 3600,
    "30m": 1800,
}

RISK_REWARD = 3

# ----------------------------
# STORAGE
# ----------------------------
data = {
    symbol: {
        tf: {
            "start": None,
            "open": None,
            "high": None,
            "low": None,
            "close": None,
            "history": [],
            "closed": False
        }
        for tf in GRANULARITIES
    }
    for symbol in SYMBOLS
}


# ----------------------------
# TIMEFRAME ALIGNMENT
# ----------------------------
def get_candle_time(epoch, tf_seconds):
    return epoch - (epoch % tf_seconds)


# ----------------------------
# UPDATE CANDLES
# ----------------------------
def update(symbol, epoch, price, tf):
    tf_seconds = GRANULARITIES[tf]
    start = get_candle_time(epoch, tf_seconds)

    c = data[symbol][tf]

    if c["start"] != start:
        if c["open"] is not None:
            c["history"].append({
                "open": c["open"],
                "high": c["high"],
                "low": c["low"],
                "close": c["close"]
            })
            if len(c["history"]) > 50:
                c["history"].pop(0)

        c.update({
            "start": start,
            "open": price,
            "high": price,
            "low": price,
            "close": price,
            "closed": True
        })
    else:
        c["high"] = max(c["high"], price)
        c["low"] = min(c["low"], price)
        c["close"] = price


# ----------------------------
# MARKET STRUCTURE (TREND)
# ----------------------------
def get_bias(history):
    if len(history) < 10:
        return None

    highs = [c["high"] for c in history[-10:]]
    lows = [c["low"] for c in history[-10:]]

    hh = all(highs[i] >= highs[i-1] for i in range(1, len(highs)))
    ll = all(lows[i] >= lows[i-1] for i in range(1, len(lows)))

    lh = all(highs[i] <= highs[i-1] for i in range(1, len(highs)))
    hl = all(lows[i] <= lows[i-1] for i in range(1, len(lows)))

    if hh and hl:
        return "buy"
    if lh and ll:
        return "sell"
    return None


# ----------------------------
# ORDER BLOCK DETECTION
# ----------------------------
def find_order_block(history, direction):
    for i in range(len(history)-2, 0, -1):
        c = history[i]

        if direction == "buy" and c["close"] < c["open"]:
            return c
        if direction == "sell" and c["close"] > c["open"]:
            return c
    return None


# ----------------------------
# PRICE ACTION CONFIRMATION
# ----------------------------
def confirm(candle, direction):
    body = abs(candle["close"] - candle["open"])
    rng = candle["high"] - candle["low"]

    if rng == 0:
        return False

    strength = body / rng

    if direction == "buy":
        return candle["close"] > candle["open"] and strength > 0.55
    else:
        return candle["close"] < candle["open"] and strength > 0.55


# ----------------------------
# TP / SL CALCULATION
# ----------------------------
def risk_model(entry, ob, direction):
    if direction == "buy":
        sl = ob["low"]
        tp = entry + (entry - sl) * RISK_REWARD
    else:
        sl = ob["high"]
        tp = entry - (sl - entry) * RISK_REWARD

    return round(sl, 5), round(tp, 5)


# ----------------------------
# SIGNAL ENGINE
# ----------------------------
def check(symbol):
    h1 = data[symbol]["1h"]["history"]
    m30 = data[symbol]["30m"]["history"]

    if len(h1) < 10 or len(m30) < 10:
        return

    bias = get_bias(h1)
    if not bias:
        return

    ob = find_order_block(m30, bias)
    if not ob:
        return

    last = m30[-1]

    if not confirm(last, bias):
        return

    entry = last["close"]
    sl, tp = risk_model(entry, ob, bias)

    print(f"\n🔥 [{symbol}] SIGNAL")
    print(f"Direction: {bias.upper()}")
    print(f"Entry: {entry}")
    print(f"SL: {sl}")
    print(f"TP: {tp}")
    print(f"Time: {data[symbol]['1h']['start']}\n")


# ----------------------------
# WEBSOCKET
# ----------------------------
async def connect():
    async with websockets.connect(URL) as ws:
        for s in SYMBOLS:
            await ws.send(json.dumps({"ticks": s, "subscribe": 1}))

        while True:
            msg = json.loads(await ws.recv())

            if "tick" in msg:
                t = msg["tick"]

                for tf in GRANULARITIES:
                    update(t["symbol"], t["epoch"], t["quote"], tf)
                    check(t["symbol"])


# ----------------------------
# RUN
# ----------------------------
if __name__ == "__main__":
    print("🚀 SMART MONEY ENGINE LIVE")
    asyncio.run(connect())