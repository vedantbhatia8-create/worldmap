module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, banned } = req.body || {};
  if (!email) return res.status(400).json({ error: "email required" });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(500).json({ error: "not configured" });

  try {
    const r = await fetch(
      `${url}/rest/v1/users?email=eq.${encodeURIComponent(email)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "apikey": key,
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify({ banned: !!banned }),
      }
    );
    if (!r.ok) throw new Error(await r.text());
    res.json({ ok: true });
  } catch (err) {
    console.error("Ban error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
