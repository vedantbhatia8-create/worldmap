module.exports = async function handler(req, res) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "email required" });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res.json(null);

  try {
    const r = await fetch(
      `${url}/rest/v1/users?email=eq.${encodeURIComponent(email)}&limit=1`,
      { headers: { "apikey": key, "Authorization": `Bearer ${key}` } }
    );
    const data = await r.json();
    res.json(Array.isArray(data) && data.length ? data[0] : null);
  } catch (err) {
    console.error("Me error:", err.message);
    res.json(null);
  }
};
