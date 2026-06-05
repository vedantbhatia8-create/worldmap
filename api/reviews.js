module.exports = async function handler(req, res) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res.json(req.method === "GET" ? [] : { error: "not configured" });

  const headers = { "apikey": key, "Authorization": `Bearer ${key}` };

  if (req.method === "GET") {
    const { place, restaurant } = req.query;
    let qs = "?order=created_at.desc";
    if (restaurant) qs += `&place_name=eq.${encodeURIComponent(restaurant)}`;
    if (place) qs += `&place_country=eq.${encodeURIComponent(place)}`;
    if (!restaurant && !place) qs += "&limit=50";
    const r = await fetch(`${url}/rest/v1/reviews${qs}`, { headers });
    return res.json(await r.json());
  }

  if (req.method === "POST") {
    const { restaurant_name, city_name, user_email, user_name, rating, review_text } = req.body || {};
    if (!restaurant_name || !user_email || !rating) return res.status(400).json({ error: "missing fields" });
    const r = await fetch(`${url}/rest/v1/reviews`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", "Prefer": "return=representation" },
      // place_name = restaurant, place_country = city (repurposed for per-restaurant reviews)
      body: JSON.stringify({ place_name: restaurant_name, place_country: city_name || "", user_email, user_name, rating, review_text: review_text || "" }),
    });
    return res.json(await r.json());
  }

  res.status(405).end();
};
