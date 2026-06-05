// ── Live AI generation via window.claude.complete ────────────────────────────
// Output is capped at 1024 tokens, so we keep each call to one short JSON list.

const aiCache = {}; // key -> { food?, attractions?, place? }

function safeParseJSON(text) {
  if (!text) return null;
  // Strip code fences / leading prose, grab the first {...} or [...] block.
  let t = String(text).trim();
  t = t.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const firstBrace = t.search(/[\[{]/);
  if (firstBrace > 0) t = t.slice(firstBrace);
  try { return JSON.parse(t); } catch (e) {}
  // Try to recover a top-level array.
  const arr = t.match(/\[[\s\S]*\]/);
  if (arr) { try { return JSON.parse(arr[0]); } catch (e) {} }
  return null;
}

// Identify a place name from coordinates (for free-form map clicks).
async function identifyPlace(lat, lon) {
  const prompt =
    `These are latitude/longitude coordinates on Earth: lat ${lat.toFixed(3)}, lon ${lon.toFixed(3)}.\n` +
    `Name the single nearest well-known travel destination (city or town) to these coordinates.\n` +
    `Reply with ONLY raw JSON, no prose: {"name":"City","country":"Country","sea":false}\n` +
    `If the coordinates fall in open ocean far from land, set "sea" to true.`;
  try {
    const raw = await window.claude.complete({ messages: [{ role: "user", content: prompt }] });
    const obj = safeParseJSON(raw);
    if (obj && obj.name) return obj;
  } catch (e) {}
  return null;
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
