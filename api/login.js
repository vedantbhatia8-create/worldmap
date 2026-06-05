module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, name, picture } = req.body || {};
  if (!email) return res.status(400).json({ error: "email required" });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res.json({ ok: true });

  try {
    await fetch(`${url}/rest/v1/rpc/upsert_user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": key,
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({ p_email: email, p_name: name, p_picture: picture }),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("Supabase track error:", err.message);
    res.json({ ok: true }); // never block login if tracking fails
  }
};
