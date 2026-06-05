// ── AI / geocoding helpers ────────────────────────────────────────────────────

const aiCache = {};

function safeParseJSON(text) {
  if (!text) return null;
  let t = String(text).trim()
    .replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const first = t.search(/[\[{]/);
  if (first > 0) t = t.slice(first);
  try { return JSON.parse(t); } catch (e) {}
  const arr = t.match(/\[[\s\S]*\]/);
  if (arr) { try { return JSON.parse(arr[0]); } catch (e) {} }
  return null;
}

// Free reverse geocoding via Nominatim — no API key needed.
async function identifyPlace(lat, lon) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
      { headers: { "Accept-Language": "en", "User-Agent": "DestinationRelaxation/1.0" } }
    );
    const d = await r.json();
    if (!d || d.error) return { sea: true };
    const name =
      d.address?.city ||
      d.address?.town ||
      d.address?.village ||
      d.address?.county ||
      d.name;
    if (!name) return { sea: true };
    return { name, country: d.address?.country || "", sea: false };
  } catch { return null; }
}

// Generate a top-10 list for a place. kind = "food" | "attractions".
async function generateList(place, kind) {
  const cacheKey = `${place}::${kind}`;
  if (aiCache[cacheKey]) return aiCache[cacheKey];

  const subject = kind === "food"
    ? "the 10 best food & drink places (restaurants, cafes, markets, street-food spots, bars)"
    : "the 10 best tourist attractions (landmarks, museums, parks, viewpoints, neighbourhoods)";

  const priceNote = kind === "food"
    ? `"price" is 1-4 (1=cheap eats, 4=fine dining).`
    : `"price" is 0-3 (0=free, 1=cheap, 2=moderate, 3=premium ticket).`;

  const prompt =
    `For the destination "${place}", list ${subject}.\n` +
    `Reply with ONLY a raw JSON array of exactly 10 objects, no prose, no code fences.\n` +
    `Each object: {"name":"string","category":"2-3 word type","rating":4.6,"price":2,"distance":"1.2 km","blurb":"max 12 words, evocative"}\n` +
    `- "rating" is 3.8-5.0 with one decimal.\n- ${priceNote}\n` +
    `- "distance" is approx distance from the city centre, e.g. "0.4 km" or "6 km".\n` +
    `Order them best-first. Use real, specific, well-known places.`;

  const raw = await window.claude.complete({ messages: [{ role: "user", content: prompt }] });
  let list = safeParseJSON(raw);
  if (!Array.isArray(list)) list = (list && Array.isArray(list.items)) ? list.items : [];
  // Normalise.
  list = list.slice(0, 10).map((it, i) => ({
    name: String(it.name || "Unknown"),
    category: String(it.category || (kind === "food" ? "Eatery" : "Attraction")),
    rating: Math.max(3.5, Math.min(5, Number(it.rating) || 4.3)),
    price: Math.max(0, Math.min(4, Math.round(Number(it.price)))),
    distance: String(it.distance || ""),
    blurb: String(it.blurb || ""),
    rank: i + 1,
  }));
  aiCache[cacheKey] = list;
  return list;
}

window.DRAI = { identifyPlace, generateList };
