async def run():
    print("🚀 CRT ENGINE STARTED (STABLE MODE)")

    while True:
        try:
            async with websockets.connect(
                URL,
                ping_interval=20,
                ping_timeout=20
            ) as ws:

                for s in SYMBOLS:
                    await ws.send(json.dumps({"ticks": s, "subscribe": 1}))
                    print(f"✅ Subscribed {s}")

                while True:
                    try:
                        msg = json.loads(await ws.recv())

                        if "tick" in msg:
                            t = msg["tick"]

                            for tf in GRANULARITIES:
                                update(t["symbol"], t["epoch"], t["quote"], tf)
                                check(t["symbol"])

                        elif "error" in msg:
                            print("❌ API Error:", msg["error"]["message"])

                    except Exception as e:
                        print("⚠️ Stream error:", e)
                        break  # reconnect

        except Exception as e:
            print("🔄 Reconnecting WebSocket...", e)
            await asyncio.sleep(5)