// ── Account page ─────────────────────────────────────────────────────────────
const { useState: uS, useEffect: uE } = React;

function AccountPage({ user, onSignOut }) {
  const [data, setData] = uS(null);
  const isAdmin = user.email === "vedantbhatia8@gmail.com";
  const searches = parseInt(localStorage.getItem("dr_searches") || "0", 10);

  uE(() => {
    fetch(`/api/me?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({}));
  }, []);

  function fmtJoined(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  return (
    <div className="account-page">
      <header className="account-topbar">
        <a href="/" className="account-back">← Back to Map</a>
        <span className="account-topbar-title">My Account</span>
        <div className="account-topbar-spacer" />
      </header>

      <main className="account-main">
        <div className="account-card">
          <div className="lcc lcc-tl" /><div className="lcc lcc-tr" />
          <div className="lcc lcc-bl" /><div className="lcc lcc-br" />

          <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" className="account-avatar" />
          <h1 className="account-name">{user.name}</h1>
          <p className="account-email">{user.email}</p>

          <div className="account-stats">
            <div className="account-stat">
              <div className="ast-num">{searches}</div>
              <div className="ast-label">Places Explored</div>
            </div>
            <div className="account-stat-div" />
            <div className="account-stat">
              <div className="ast-num">{data?.visit_count ?? "—"}</div>
              <div className="ast-label">App Visits</div>
            </div>
            <div className="account-stat-div" />
            <div className="account-stat">
              <div className="ast-num ast-small">{data ? fmtJoined(data.first_seen) : "—"}</div>
              <div className="ast-label">Member Since</div>
            </div>
          </div>

          <div className="account-actions">
            {isAdmin && (
              <a href="/admin" className="account-admin-btn">Admin Dashboard →</a>
            )}
            <button className="account-signout-btn" onClick={onSignOut}>Sign Out</button>
          </div>
        </div>
      </main>
    </div>
  );
}

window.AccountPage = AccountPage;
