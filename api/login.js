module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, name, picture } = req.body || {};
  if (!email) return res.status(400).json({ error: "email required" });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res.json({ ok: true, banned: false });

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

    const r = await fetch(
      `${url}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=banned`,
      { headers: { "apikey": key, "Authorization": `Bearer ${key}` } }
    );
    const [row] = await r.json();
    const banned = row?.banned ?? false;
    res.json({ ok: !banned, banned });
  } catch (err) {
    console.error("Login track error:", err.message);
    res.json({ ok: true, banned: false });
  }
};
