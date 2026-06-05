const express = require("express");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "project")));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post("/api/complete", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array required" });
  }
  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      messages,
    });
    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    res.json({ text });
  } catch (err) {
    console.error("Claude API error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "project", "Destination Relaxation.html"));
});

app.listen(PORT, () => {
  console.log(`Destination Relaxation running at http://localhost:${PORT}`);
});
