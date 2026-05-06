from typing import List, Dict
import numpy as np

class CRTStrategy:
    def __init__(self, candles: List[Dict]):
        self.candles = candles

    # ----------------------------
    # 1. TRENDLINE BIAS (1H + 30M concept)
    # ----------------------------
    def get_bias(self):
        if len(self.candles) < 20:
            return None

        highs = [c["high"] for c in self.candles[-20:]]
        lows = [c["low"] for c in self.candles[-20:]]

        high_slope = np.polyfit(range(20), highs, 1)[0]
        low_slope = np.polyfit(range(20), lows, 1)[0]

        if high_slope > 0 and low_slope > 0:
            return "bullish"
        elif high_slope < 0 and low_slope < 0:
            return "bearish"
        return "range"

    # ----------------------------
    # 2. ORDER BLOCK DETECTION
    # ----------------------------
    def find_order_block(self, direction):
        for i in range(len(self.candles) - 5, 0, -1):
            c = self.candles[i]

            if direction == "buy" and c["close"] < c["open"]:
                return c
            if direction == "sell" and c["close"] > c["open"]:
                return c
        return None

    # ----------------------------
    # 3. PRICE ACTION CONFIRMATION
    # ----------------------------
    def price_action_confirm(self, candle, direction):
        body = abs(candle["close"] - candle["open"])
        rng = candle["high"] - candle["low"]

        if rng == 0:
            return False

        body_ratio = body / rng

        if direction == "buy":
            return candle["close"] > candle["open"] and body_ratio > 0.55
        else:
            return candle["close"] < candle["open"] and body_ratio > 0.55

    # ----------------------------
    # 4. CRT (OPTIONAL BOOST ONLY)
    # ----------------------------
    def crt_confluence(self):
        if len(self.candles) < 10:
            return False

        c = self.candles[-1]
        prev = self.candles[-2]

        return (
            c["high"] > prev["high"] and
            c["low"] < prev["low"]
        )

    # ----------------------------
    # 5. TRADE TYPE
    # ----------------------------
    def classify_trade(self):
        volatility = np.mean([c["high"] - c["low"] for c in self.candles[-20:]])

        if volatility > 5:
            return "swing"
        return "scalp"

    # ----------------------------
    # MAIN ENGINE
    # ----------------------------
    def run(self):
        signals = []

        bias = self.get_bias()
        if not bias or bias == "range":
            return []

        direction = "buy" if bias == "bullish" else "sell"

        ob = self.find_order_block(direction)
        if not ob:
            return []

        last = self.candles[-1]

        # must be at zone + confirmation
        if not self.price_action_confirm(last, direction):
            return []

        crt_bonus = self.crt_confluence()
        trade_type = self.classify_trade()

        entry = last["close"]

        if direction == "buy":
            sl = ob["low"]
            tp = entry + (entry - sl) * (3.5 if crt_bonus else 2.5)
        else:
            sl = ob["high"]
            tp = entry - (sl - entry) * (3.5 if crt_bonus else 2.5)

        signals.append({
            "type": direction,
            "entry_price": entry,
            "sl": sl,
            "tp": tp,
            "trade_type": trade_type,
            "crt_bonus": crt_bonus,
            "entry_index": len(self.candles) - 1
        })

        return signals