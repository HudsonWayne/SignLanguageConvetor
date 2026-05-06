import asyncio
import websockets
import json
from pattern_detector import CRTStrategy

APP_ID = 80707
SYMBOLS = ["R_10", "R_25", "R_50", "R_75", "R_100"]
URL = f"wss://ws.binaryws.com/websockets/v3?app_id={APP_ID}"

# ----------------------------
# SIMPLE CANDLE STORAGE
# ----------------------------
symbol_candles = {s: [] for s in SYMBOLS}
buffers = {
    s: {
        "open": None,
        "high": None,
        "low": None,
        "close": None,
        "start_epoch": None
    } for s in SYMBOLS
}

CANDLE_DURATION = 60  # 1-minute candles


# ----------------------------
# BUILD CANDLES FROM TICKS
# ----------------------------
def update_candle_from_tick(symbol, price, epoch):
    buf = buffers[symbol]

    if buf["open"] is None:
        buf["open"] = buf["high"] = buf["low"] = buf["close"] = price
        buf["start_epoch"] = epoch
        return None

    # update live candle
    buf["high"] = max(buf["high"], price)
    buf["low"] = min(buf["low"], price)
    buf["close"] = price

    # close candle
    if epoch - buf["start_epoch"] >= CANDLE_DURATION:
        candle = {
            "open": buf["open"],
            "high": buf["high"],
            "low": buf["low"],
            "close": buf["close"]
        }

        # reset buffer
        buf["open"] = buf["high"] = buf["low"] = buf["close"] = price
        buf["start_epoch"] = epoch

        return candle

    return None


# ----------------------------
# SIGNAL CHECK
# ----------------------------
def process_candle(symbol, candle):
    candles = symbol_candles[symbol]

    candles.append(candle)
    if len(candles) > 100:
        candles.pop(0)

    strategy = CRTStrategy(candles)
    result = strategy.run()[0]

    if result["type"] == "valid":
        print(f"🔥 SIGNAL {symbol} | SCORE: {result['score']}")


# ----------------------------
# MAIN STREAM FUNCTION
# ----------------------------
async def run():
    print("🚀 CRT ENGINE STARTED (STABLE MODE)")

    while True:
        try:
            async with websockets.connect(
                URL,
                ping_interval=20,
                ping_timeout=20
            ) as ws:

                # subscribe
                for s in SYMBOLS:
                    await ws.send(json.dumps({
                        "ticks": s,
                        "subscribe": 1
                    }))
                    print(f"✅ Subscribed {s}")

                while True:
                    msg = json.loads(await ws.recv())

                    if "tick" not in msg:
                        continue

                    t = msg["tick"]
                    symbol = t["symbol"]
                    price = float(t["quote"])
                    epoch = t["epoch"]

                    candle = update_candle_from_tick(symbol, price, epoch)

                    if candle:
                        process_candle(symbol, candle)

        except Exception as e:
            print("🔄 Reconnecting...", e)
            await asyncio.sleep(5)


# ----------------------------
# ENTRY POINT (CRITICAL)
# ----------------------------
if __name__ == "__main__":
    asyncio.run(run())