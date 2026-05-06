class CRTStrategy:
    """
    CONFIRMATION LAYER ONLY

    This module does NOT:
    - create trades
    - calculate SL/TP
    - decide direction

    It ONLY answers:
    → "Is this setup high probability?"
    """

    def __init__(self, candles):
        self.candles = candles

    # ----------------------------
    # SAFETY CHECK
    # ----------------------------
    def ready(self):
        return len(self.candles) >= 20

    # ----------------------------
    # STRUCTURE / TREND STRENGTH
    # (proxy for trendlines 30M / 1H)
    # ----------------------------
    def structure_score(self):
        if not self.ready():
            return 0

        highs = [c["high"] for c in self.candles[-20:]]
        lows = [c["low"] for c in self.candles[-20:]]

        # swing consistency (trendline approximation)
        higher_highs = sum(1 for i in range(1, len(highs)) if highs[i] > highs[i - 1])
        higher_lows = sum(1 for i in range(1, len(lows)) if lows[i] > lows[i - 1])

        lower_highs = sum(1 for i in range(1, len(highs)) if highs[i] < highs[i - 1])
        lower_lows = sum(1 for i in range(1, len(lows)) if lows[i] < lows[i - 1])

        bullish_strength = (higher_highs + higher_lows) / 38
        bearish_strength = (lower_highs + lower_lows) / 38

        return max(bullish_strength, bearish_strength)

    # ----------------------------
    # MOMENTUM / ENTRY QUALITY
    # ----------------------------
    def momentum_quality(self):
        if len(self.candles) < 2:
            return 0

        c = self.candles[-1]

        body = abs(c["close"] - c["open"])
        rng = c["high"] - c["low"]

        if rng == 0:
            return 0

        return body / rng  # 0 → 1

    # ----------------------------
    # ORDER BLOCK VALIDATION (LIGHTWEIGHT)
    # ----------------------------
    def ob_quality(self):
        if len(self.candles) < 5:
            return 0

        # last impulse candle check
        last = self.candles[-1]
        prev = self.candles[-2]

        impulse = abs(last["close"] - last["open"])
        prev_body = abs(prev["close"] - prev["open"])

        if prev_body == 0:
            return 0

        # strong displacement = institutional activity
        return impulse / prev_body

    # ----------------------------
    # CRT CONFLUENCE (BONUS ONLY)
    # ----------------------------
    def crt_confluence(self):
        if len(self.candles) < 3:
            return 0

        c1 = self.candles[-3]
        c2 = self.candles[-2]
        c3 = self.candles[-1]

        # simple expansion + sweep behavior
        expansion = (
            c3["high"] > c2["high"] and
            c3["low"] < c2["low"]
        )

        body_strength = abs(c3["close"] - c3["open"]) > abs(c2["close"] - c2["open"])

        return 1 if expansion and body_strength else 0

    # ----------------------------
    # VOLATILITY FILTER
    # ----------------------------
    def volatility_ok(self):
        if len(self.candles) < 10:
            return False

        ranges = [c["high"] - c["low"] for c in self.candles[-10:]]
        avg_range = sum(ranges) / len(ranges)

        # avoid dead markets
        return avg_range > 1

    # ----------------------------
    # FINAL SCORING ENGINE
    # ----------------------------
    def run(self):
        if not self.ready():
            return [{"type": "none", "score": 0}]

        score = 0

        # 1. structure (MOST IMPORTANT)
        score += self.structure_score() * 0.5

        # 2. momentum (entry quality)
        score += self.momentum_quality() * 0.2

        # 3. order block / displacement
        ob = self.ob_quality()
        score += min(ob * 0.15, 0.15)

        # 4. volatility filter
        if self.volatility_ok():
            score += 0.1

        # 5. CRT bonus
        if self.crt_confluence():
            score += 0.05

        # ----------------------------
        # DECISION THRESHOLD
        # ----------------------------
        if score >= 0.75:
            return [{
                "type": "valid",
                "score": round(score, 2)
            }]

        return [{
            "type": "none",
            "score": round(score, 2)
        }]