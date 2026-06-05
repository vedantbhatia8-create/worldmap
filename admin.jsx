// ── Admin Dashboard ───────────────────────────────────────────────────────────

function AdminDashboard({ user, onSignOut }) {
  const cards = [
    { ic: "🌍", title: "Destinations", stat: "Live", desc: "Photon geocoding + Nominatim reverse lookup" },
    { ic: "🍽", title: "Food Recs", stat: "AI-Powered", desc: "Llama 3.1 via Groq API (with Yelp fallback)" },
    { ic: "🔐", title: "Authentication", stat: "Active", desc: "Google Identity Services OAuth 2.0" },
    { ic: "🗺", title: "Map Tiles", stat: "Live", desc: "Esri National Geographic + Leaflet.js" },
  ];

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
            <div className="brand-tag">Admin Control Center</div>
          </div>
        </div>
        <div className="admin-topbar-right">
          <a href="/" className="admin-back-btn">← Back to Map</a>
          <button className="user-badge" onClick={onSignOut} title={`Sign out (${user.email})`}>
            <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-hero">
          <div className="admin-hero-tag">Administrator</div>
          <h1 className="admin-hero-title">Control Center</h1>
          <p className="admin-hero-sub">Welcome back, {user.name.split(" ")[0]}.</p>
        </div>

        <section className="admin-section">
          <h2 className="admin-section-title">System Status</h2>
          <div className="admin-grid">
            {cards.map((c) => (
              <div key={c.title} className="admin-card">
                <div className="admin-card-ic">{c.ic}</div>
                <div className="admin-card-body">
                  <h3>{c.title}</h3>
                  <div className="admin-stat">{c.stat}</div>
                  <p>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">Your Account</h2>
          <div className="admin-profile">
            <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" className="admin-avatar" />
            <div className="admin-profile-info">
              <div className="admin-profile-name">{user.name}</div>
              <div className="admin-profile-email">{user.email}</div>
              <div className="admin-profile-role">
                <span className="admin-role-badge">Administrator</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

window.AdminDashboard = AdminDashboard;
