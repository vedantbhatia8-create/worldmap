// ── App: state, data loading, search ─────────────────────────────────────────
const { useState: uS, useEffect: uE, useRef: uR } = React;

function fmtCoords(lat, lon) {
  const la = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}`;
  const lo = `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
  return `${la}, ${lo}`;
}

function SearchBox({ onSelect }) {
  const [q, setQ] = uS("");
  const [open, setOpen] = uS(false);
  const [hi, setHi] = uS(0);
  const [matches, setMatches] = uS([]);
  const boxRef = uR(null);
  const timerRef = uR(null);

  uE(() => {
    if (!q.trim()) { setMatches([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(q.trim())}&limit=6&lang=en`
        );
        const d = await r.json();
        const results = (d.features || [])
          .filter((f) => f.properties.name)
          .map((f) => ({
            name: f.properties.name,
            country: f.properties.country || "",
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
          }));
        setMatches(results);
        setOpen(true);
      } catch { setMatches([]); }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [q]);

  uE(() => {
    const h = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const choose = (c) => { setQ(""); setOpen(false); onSelect({ ...c, source: "search" }); };

  return (
    <div className="search" ref={boxRef}>
      <svg className="search-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" />
      </svg>
      <input
        value={q}
        placeholder="Search a city or destination…"
        onChange={(e) => { setQ(e.target.value); setHi(0); }}
        onFocus={() => matches.length && setOpen(true)}
        onKeyDown={(e) => {
          if (!matches.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => (h + 1) % matches.length); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => (h - 1 + matches.length) % matches.length); }
          else if (e.key === "Enter") { e.preventDefault(); choose(matches[hi]); }
          else if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && matches.length > 0 && (
        <ul className="ac">
          {matches.map((c, i) => (
            <li key={`${c.name}-${c.lat}`} className={"ac-item" + (i === hi ? " hi" : "")}
              onMouseEnter={() => setHi(i)} onMouseDown={(e) => { e.preventDefault(); choose(c); }}>
              <span className="ac-name">{c.name}</span>
              <span className="ac-country">{c.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = uS(() => {
    try { return JSON.parse(localStorage.getItem("dr_user")); } catch { return null; }
  });
  const [place, setPlace] = uS(null);
  const [data, setData] = uS(null);
  const [loading, setLoading] = uS(false);
  const [resolving, setResolving] = uS(false);
  const [toast, setToast] = uS(null);
  const reqId = uR(0);

  const loadFood = async (placeObj) => {
    const id = ++reqId.current;
    setData(null);
    setLoading(true);
    try {
      const r = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place: `${placeObj.name}, ${placeObj.country}` }),
      });
      if (id !== reqId.current) return;
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || "Server error");
      setData(body);
    } catch (err) {
      if (id !== reqId.current) return;
      setData([]);
      setToast(err.message || "Couldn't load recommendations.");
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  const pick = async (p) => {
    if (p.source === "map" && !p.name) {
      setResolving(true);
      const found = await window.DRAI.identifyPlace(p.lat, p.lon);
      setResolving(false);
      if (!found || found.sea) { setToast("That looks like open water — try clicking on land."); return; }
      const np = { name: found.name, country: found.country, lat: p.lat, lon: p.lon, coords: fmtCoords(p.lat, p.lon) };
      setPlace(np); loadFood(np);
    } else {
      const np = { name: p.name, country: p.country, lat: p.lat, lon: p.lon, coords: fmtCoords(p.lat, p.lon) };
      setPlace(np); loadFood(np);
    }
  };

  uE(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toast]);

  const signOut = () => { localStorage.removeItem("dr_user"); setUser(null); };

  if (!user) return <LoginScreen onLogin={setUser} />;

  const isAdmin = user.email === "vedantbhatia8@gmail.com";
  if (window.location.pathname === "/admin") {
    if (!isAdmin) { window.location.replace("/"); return null; }
    return <AdminDashboard user={user} onSignOut={signOut} />;
  }

  return (
    <div className={"app" + (place ? " has-panel" : "")}>
      <div className="stage">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke="#C0392B" strokeWidth="1.5" />
                <path d="M16 4 C9 12 9 20 16 28 C23 20 23 12 16 4 Z M2 16 H30 M16 4 V28" fill="none" stroke="#C0392B" strokeWidth="0.9" opacity="0.7" />
                <circle cx="16" cy="16" r="2.4" fill="#C0392B" /></svg>
            </div>
            <div className="brand-txt">
              <div className="brand-name">Destination Relaxation</div>
              <div className="brand-tag">An atlas of where to eat &amp; wander</div>
            </div>
          </div>
          <SearchBox onSelect={pick} />
          {isAdmin && <a href="/admin" className="admin-btn" title="Admin dashboard">Admin</a>}
          <button className="user-badge" onClick={signOut} title={`Sign out (${user.email})`}>
            <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
          </button>
        </header>

        <WorldMap onPick={pick} selected={place} picking={resolving} />

        {!place && (
          <div className="hint">
            <span className="hint-k">Click the map</span> or search a destination to begin
          </div>
        )}

        {resolving && (
          <div className="resolve"><span className="lm-dot" /> Pinpointing your destination…</div>
        )}
        {toast && <div className="toast">{toast}</div>}
      </div>

      <ResultsPanel place={place} data={data} loading={loading} onClose={() => setPlace(null)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
