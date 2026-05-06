from deriv_ws import DerivLiveStreamer
from live_plot import LiveCandlePlot
from pattern_detector import CRTStrategy

symbol = "R_75"

candles = []
signals = []

strategy = CRTStrategy(candles)

def on_new_candle(candle):
    global signals

    candles.append(candle)

    if len(candles) > 200:
        candles.pop(0)

    signals = strategy.run()

def get_candles():
    return candles

def get_signals():
    return signals

if __name__ == "__main__":
    print("🚀 SMART MONEY ENGINE STARTED")

    DerivLiveStreamer(
        app_id="1089",
        symbol=symbol,
        granularity=14400,
        callback=on_new_candle
    ).start()

    plot = LiveCandlePlot(get_candles, get_signals)
    plot.show()