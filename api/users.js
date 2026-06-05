module.exports = async function handler(req, res) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res.json([]);

  try {
    const r = await fetch(
      `${url}/rest/v1/users?select=*&order=last_seen.desc`,
      {
        headers: {
          "apikey": key,
          "Authorization": `Bearer ${key}`,
        },
      }
    );
    const data = await r.json();
    res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Supabase users error:", err.message);
    res.json([]);
  }
};
