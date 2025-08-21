export default async function handler(req, res) {
  try {
    const { url, strategy = "mobile" } = req.query;
    if (!url) { res.status(400).json({ error: "Missing 'url' query param" }); return; }

    const key = process.env.PSI_KEY;
    if (!key) { res.status(500).json({ error: "Missing PSI_KEY in environment" }); return; }

    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(String(url))}&strategy=${strategy}&key=${key}`;
    const r = await fetch(endpoint);
    const data = await r.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
