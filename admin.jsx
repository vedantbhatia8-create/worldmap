// ── Admin Dashboard ───────────────────────────────────────────────────────────
const { useState: uS, useEffect: uE } = React;

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso), diff = Date.now() - d;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function AdminDashboard({ user, onSignOut }) {
  const [users, setUsers] = uS(null);
  const [reviews, setReviews] = uS(null);
  const [banning, setBanning] = uS({});
  const [refreshing, setRefreshing] = uS(false);
  const [lastRefresh, setLastRefresh] = uS(null);

  const load = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const [u, r] = await Promise.all([
        fetch("/api/users").then(r => r.json()).catch(() => []),
        fetch("/api/reviews").then(r => r.json()).catch(() => []),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setReviews(Array.isArray(r) ? r : []);
      setLastRefresh(new Date());
    } finally {
      setRefreshing(false);
    }
  };

  uE(() => {
    load();
    const interval = setInterval(() => load(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleBan = async (email, isBanned) => {
    setBanning(b => ({ ...b, [email]: true }));
    try {
      await fetch("/api/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, banned: !isBanned }),
      });
      setUsers(u => u.map(usr => usr.email === email ? { ...usr, banned: !isBanned } : usr));
    } finally {
      setBanning(b => ({ ...b, [email]: false }));
    }
  };

  const totalUsers = users?.length ?? "—";
  const bannedCount = users?.filter(u => u.banned).length ?? "—";
  const reviewCount = reviews?.length ?? "—";

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke="#C0392B" strokeWidth="1.5"/>
              <path d="M16 4 C9 12 9 20 16 28 C23 20 23 12 16 4 Z M2 16 H30 M16 4 V28" fill="none" stroke="#C0392B" strokeWidth="0.9" opacity="0.7"/>
              <circle cx="16" cy="16" r="2.4" fill="#C0392B"/></svg>
          </div>
          <div className="brand-txt">
            <div className="brand-name">Destination Relaxation</div>
            <div className="brand-tag">Admin</div>
          </div>
        </div>
        <div className="admin-topbar-right">
          <button className="admin-refresh-btn" onClick={() => load()} disabled={refreshing} title={lastRefresh ? `Last updated ${lastRefresh.toLocaleTimeString()}` : ""}>
            <span className={"refresh-ic" + (refreshing ? " spinning" : "")}>↻</span>
            {lastRefresh && <span className="refresh-time">{lastRefresh.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>}
          </button>
          <a href="/" className="admin-back-btn">← Back to Map</a>
          <button className="user-badge" onClick={onSignOut} title="Sign out">
            <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
          </button>
        </div>
      </header>

      <div className="admin-scroll">
        <main className="admin-main">
          <div className="admin-hero">
            <div className="admin-hero-tag">Admin Panel</div>
            <h1 className="admin-hero-title">Dashboard</h1>
            <p className="admin-hero-sub">Welcome back, {user.name.split(" ")[0]}.</p>
          </div>

          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="asc-num">{totalUsers}</div>
              <div className="asc-label">Total Users</div>
            </div>
            <div className="admin-stat-card">
              <div className={"asc-num" + (bannedCount > 0 ? " asc-red" : "")}>{bannedCount}</div>
              <div className="asc-label">Banned</div>
            </div>
            <div className="admin-stat-card">
              <div className="asc-num">{reviewCount}</div>
              <div className="asc-label">Reviews</div>
            </div>
          </div>

          <section className="admin-section">
            <h2 className="admin-section-title">Users</h2>
            {!users && <div className="admin-loading">Loading users…</div>}
            {users && users.length === 0 && (
              <p className="admin-empty">No users yet. Sign in on the map to populate this.</p>
            )}
            {users && users.length > 0 && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Visits</th>
                      <th>Last Login</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.email} className={u.banned ? "row-banned" : ""}>
                        <td>
                          <div className="admin-table-user">
                            {u.picture && <img src={u.picture} alt="" referrerPolicy="no-referrer" className="admin-table-avatar" />}
                            <span className="admin-table-name">{u.name}</span>
                          </div>
                        </td>
                        <td className="admin-table-email">{u.email}</td>
                        <td className="admin-table-num">{u.visit_count ?? 1}</td>
                        <td className="admin-table-date">{fmtDate(u.last_seen)}</td>
                        <td>
                          <span className={"admin-status-badge " + (u.banned ? "banned" : "active")}>
                            {u.banned ? "Banned" : "Active"}
                          </span>
                        </td>
                        <td>
                          {u.email !== "vedantbhatia8@gmail.com" && (
                            <button
                              className={"admin-ban-btn" + (u.banned ? " unban" : "")}
                              onClick={() => toggleBan(u.email, u.banned)}
                              disabled={!!banning[u.email]}
                            >
                              {banning[u.email] ? "…" : u.banned ? "Unban" : "Ban"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-section">
            <h2 className="admin-section-title">Recent Reviews</h2>
            {!reviews && <div className="admin-loading">Loading reviews…</div>}
            {reviews && reviews.length === 0 && (
              <p className="admin-empty">No reviews yet.</p>
            )}
            {reviews && reviews.length > 0 && (
              <div className="admin-reviews">
                {reviews.slice(0, 30).map(r => (
                  <div key={r.id} className="admin-review-item">
                    <div className="ari-header">
                      <span className="ari-place">
                        {r.place_name}
                        {r.place_country && <span className="ari-city"> · {r.place_country}</span>}
                      </span>
                      <span className="ari-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      <span className="ari-date">{fmtDate(r.created_at)}</span>
                    </div>
                    {r.review_text && <p className="ari-text">"{r.review_text}"</p>}
                    <div className="ari-user">— {r.user_name} · {r.user_email}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

window.AdminDashboard = AdminDashboard;
