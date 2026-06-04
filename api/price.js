export default async function handler(req, res) {
  const { pair } = req.query;

  if (!pair) {
    return res.status(400).json({ error: "Missing ?pair= parameter" });
  }

  const OANDA_API_KEY = process.env.OANDA_API_KEY;
  const OANDA_ACCOUNT = process.env.OANDA_ACCOUNT;
  const OANDA_URL = "https://api-fxtrade.oanda.com/v20";

  try {
    const url = `${OANDA_URL}/accounts/${OANDA_ACCOUNT}/pricing?instruments=${pair}`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${OANDA_API_KEY}`
      }
    });

    const data = await response.json();

    if (!data.prices || !data.prices[0]) {
      return res.status(400).json({ error: "Invalid instrument or no price returned", data });
    }

    const p = data.prices[0];

    return res.status(200).json({
      bid: parseFloat(p.closeoutBid),
      ask: parseFloat(p.closeoutAsk),
      mid: (parseFloat(p.closeoutBid) + parseFloat(p.closeoutAsk)) / 2
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.toString() });
  }
}
