export default async function handler(req, res) {
  const { pair, tf } = req.query;

  if (!pair || !tf) {
    return res.status(400).json({ error: "Missing ?pair= or ?tf=" });
  }

  const OANDA_API_KEY = process.env.OANDA_API_KEY;
  const OANDA_ACCOUNT = process.env.OANDA_ACCOUNT;
  const OANDA_URL = "https://api-fxpractice.oanda.com/v20";

  try {
    const url = `${OANDA_URL}/instruments/${pair}/candles?count=200&granularity=${tf.toUpperCase()}`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${OANDA_API_KEY}`
      }
    });

    const data = await response.json();

    if (!data.candles) {
      return res.status(400).json({ error: "No candles returned", data });
    }

    const candles = data.candles
      .filter(c => c.complete)
      .map(c => ({
        time: c.time,
        open: parseFloat(c.mid.o),
        high: parseFloat(c.mid.h),
        low: parseFloat(c.mid.l),
        close: parseFloat(c.mid.c)
      }));

    return res.status(200).json({ candles });

  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.toString() });
  }
}
