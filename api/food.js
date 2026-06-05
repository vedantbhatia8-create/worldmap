function safeParseJSON(text) {
  if (!text) return null;
  let t = String(text).trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const first = t.search(/[\[{]/);
  if (first > 0) t = t.slice(first);
  try { return JSON.parse(t); } catch (e) {}
  const arr = t.match(/\[[\s\S]*\]/);
  if (arr) { try { return JSON.parse(arr[0]); } catch (e) {} }
  return null;
}

async function fromYelp(place) {
  const r = await fetch(
    `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(place)}&categories=restaurants,food,bars,cafes&sort_by=best_match&limit=10`,
    { headers: { Authorization: `Bearer ${process.env.YELP_API_KEY}` } }
  );
  const data = await r.json();
  if (!data.businesses?.length) return [];
  return data.businesses.map((b, i) => ({
    rank: i + 1,
    name: b.name,
    category: b.categories?.[0]?.title || "Restaurant",
    rating: b.rating || 4.0,
    price: b.price?.length || 2,
    distance: b.distance ? `${(b.distance / 1000).toFixed(1)} km` : "",
    blurb: b.location?.display_address?.slice(0, 2).join(", ") || "",
  }));
}

async function fromGemini(place) {
  const prompt =
    `For "${place}", list the 10 best restaurants, cafes, bars and food spots.\n` +
    `Reply with ONLY a raw JSON array of 10 objects, no prose:\n` +
    `{"name":"string","category":"2-3 word type","rating":4.6,"price":2,"distance":"1.2 km","blurb":"max 12 words"}\n` +
    `rating: 3.8-5.0, price: 1-4 (1=cheap, 4=fine dining), distance from city centre.`;
  const body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 1024 } });
  const key = process.env.GEMINI_API_KEY;

  // Try models in order until one responds successfully.
  const endpoints = [
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`,
  ];

  let lastErr = "All Gemini endpoints failed";
  for (const url of endpoints) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    const data = await r.json();
    if (!r.ok || data.error) { lastErr = data.error?.message || `HTTP ${r.status}`; continue; }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const list = safeParseJSON(text);
    if (!Array.isArray(list)) { lastErr = "Gemini returned unexpected format"; continue; }
    return list.slice(0, 10).map((it, i) => ({
      rank: i + 1,
      name: String(it.name || ""),
      category: String(it.category || "Restaurant"),
      rating: Math.max(3.5, Math.min(5, Number(it.rating) || 4.3)),
      price: Math.max(1, Math.min(4, Math.round(Number(it.price) || 2))),
      distance: String(it.distance || ""),
      blurb: String(it.blurb || ""),
    }));
  }
  throw new Error(lastErr);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { place } = req.body;
  if (!place) return res.status(400).json({ error: "place required" });

  try {
    if (process.env.YELP_API_KEY) {
      const list = await fromYelp(place);
      if (list.length >= 3) return res.json(list);
    }
    if (process.env.GEMINI_API_KEY) {
      const list = await fromGemini(place);
      return res.json(list);
    }
    res.status(500).json({ error: "No API key configured (GEMINI_API_KEY missing)" });
  } catch (err) {
    console.error("Food API error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
