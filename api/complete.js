module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "messages array required" });

  const prompt = messages.map((m) => m.content).join("\n");

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1024 },
        }),
      }
    );
    const data = await r.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.json({ text });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
