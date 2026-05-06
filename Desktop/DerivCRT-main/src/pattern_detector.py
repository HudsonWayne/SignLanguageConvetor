from typing import List, Dict

class CRTStrategy:
    def __init__(self, candles: List[Dict]):
        self.candles = candles

    # ----------------------------
    # MARKET STRUCTURE
    # ----------------------------
    def get_trend(self):
        if len(self.candles) < 20:
            return None

        highs = [c["high"] for c in self.candles[-20:]]
        lows = [c["low"] for c in self.candles[-20:]]

        if highs[-1] > highs[-5] and lows[-1] > lows[-5]:
            return "bullish"
        elif highs[-1] < highs[-5] and lows[-1] < lows[-5]:
            return "bearish"
        return "range"

    # ----------------------------
    # BREAK OF STRUCTURE (BOS)
    # ----------------------------
    def detect_bos(self):
        if len(self.candles) < 5:
            return None

        prev = self.candles[-3]
        last = self.candles[-1]

        if last["close"] > prev["high"]:
            return "bullish"
        elif last["close"] < prev["low"]:
            return "bearish"
        return None

    # ----------------------------
    # ORDER BLOCK DETECTION
    # ----------------------------
    def find_order_block(self, direction):
        for i in range(len(self.candles)-3, 0, -1):
            c = self.candles[i]

            # last opposite candle
            if direction == "buy" and c["close"] < c["open"]:
                return c
            elif direction == "sell" and c["close"] > c["open"]:
                return c
        return None

    # ----------------------------
    # ENTRY CONFIRMATION
    # ----------------------------
    def confirm_entry(self, direction):
        c = self.candles[-1]

        body = abs(c["close"] - c["open"])
        range_ = c["high"] - c["low"]

        if range_ == 0:
            return False

        body_ratio = body / range_

        if direction == "buy":
            return c["close"] > c["open"] and body_ratio > 0.6
        elif direction == "sell":
            return c["close"] < c["open"] and body_ratio > 0.6

        return False

    # ----------------------------
    # CLASSIFY TRADE TYPE
    # ----------------------------
    def classify_trade(self):
        if len(self.candles) < 50:
            return "scalp"

        volatility = sum(c["high"] - c["low"] for c in self.candles[-20:]) / 20

        if volatility > 5:
            return "swing"
        return "scalp"

    # ----------------------------
    # MAIN ENGINE
    # ----------------------------
    def run(self):
        signals = []

        trend = self.get_trend()
        bos = self.detect_bos()

        if not trend or not bos:
            return [{"type": "none"}]

        # must align
        if trend == "bullish" and bos != "bullish":
            return [{"type": "none"}]
        if trend == "bearish" and bos != "bearish":
            return [{"type": "none"}]

        direction = "buy" if trend == "bullish" else "sell"

        ob = self.find_order_block(direction)
        if not ob:
            return [{"type": "none"}]

        if not self.confirm_entry(direction):
            return [{"type": "none"}]

        trade_type = self.classify_trade()

        entry = self.candles[-1]["close"]

        if direction == "buy":
            sl = ob["low"]
            tp = entry + (entry - sl) * 3
        else:
            sl = ob["high"]
            tp = entry - (sl - entry) * 3

        signals.append({
            "type": direction,
            "entry_price": entry,
            "sl": sl,
            "tp": tp,
            "trade_type": trade_type,
            "entry_index": len(self.candles) - 1
        })

        return signals