module.exports = async function handler(req, res) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res.json(req.method === "GET" ? [] : { error: "not configured" });

  const headers = { "apikey": key, "Authorization": `Bearer ${key}` };

  if (req.method === "GET") {
    const { place } = req.query;
    const qs = place
      ? `?place_name=eq.${encodeURIComponent(place)}&order=created_at.desc`
      : `?order=created_at.desc&limit=50`;
    const r = await fetch(`${url}/rest/v1/reviews${qs}`, { headers });
    return res.json(await r.json());
  }

  if (req.method === "POST") {
    const { place_name, place_country, user_email, user_name, rating, review_text } = req.body || {};
    if (!place_name || !user_email || !rating) return res.status(400).json({ error: "missing fields" });
    const r = await fetch(`${url}/rest/v1/reviews`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", "Prefer": "return=representation" },
      body: JSON.stringify({ place_name, place_country: place_country || "", user_email, user_name, rating, review_text: review_text || "" }),
    });
    return res.json(await r.json());
  }

  res.status(405).end();
};
