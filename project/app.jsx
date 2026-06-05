// ── App: state, data loading, search, AI wiring ──────────────────────────────
const { useState: uS, useEffect: uE, useRef: uR, useMemo: uM } = React;

function fmtCoords(lat, lon) {
  const la = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}`;
  const lo = `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
  return `${la}, ${lo}`;
}

function SearchBox({ onSelect }) {
  const [q, setQ] = uS("");
  const [open, setOpen] = uS(false);
  const [hi, setHi] = uS(0);
  const boxRef = uR(null);

  const matches = uM(() => {
    if (!q.trim()) return [];
    const s = q.trim().toLowerCase();
    return window.CITIES
      .filter((c) => (c.name + " " + c.country).toLowerCase().includes(s))
      .sort((a, b) => (a.name.toLowerCase().startsWith(s) ? -1 : 1))
      .slice(0, 6);
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
        onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(0); }}
        onFocus={() => setOpen(true)}
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
            <li key={c.name} className={"ac-item" + (i === hi ? " hi" : "")}
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
  const [countries, setCountries] = uS([]);
  const [place, setPlace] = uS(null);
  const [data, setData] = uS(null);
  const [loading, setLoading] = uS({ food: false, attractions: false });
  const [tab, setTab] = uS("food");
  const [resolving, setResolving] = uS(false);
  const [toast, setToast] = uS(null);
  const reqId = uR(0);

  // Load world topology.
  uE(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        const fc = topojson.feature(topo, topo.objects.countries);
        setCountries(fc.features.filter((f) => f.id !== "010")); // drop Antarctica
      })
      .catch(() => setToast("Couldn’t load the map data."));
  }, []);

  const loadLists = async (placeObj) => {
    const id = ++reqId.current;
    setData({ food: null, attractions: null });
    setLoading({ food: true, attractions: true });
    const label = `${placeObj.name}, ${placeObj.country}`;
    // Both tabs in parallel; each settles independently.
    const settle = (kind, val) => {
      if (id !== reqId.current) return;
      setData((d) => ({ ...(d || {}), [kind]: val }));
      setLoading((l) => ({ ...l, [kind]: false }));
    };
    window.DRAI.generateList(label, "food").then((v) => settle("food", v))
      .catch(() => { settle("food", []); setToast("Couldn’t reach the guide service."); });
    window.DRAI.generateList(label, "attractions").then((v) => settle("attractions", v))
      .catch(() => settle("attractions", []));
  };

  const pick = async (p) => {
    setTab("food");
    if (p.source === "map" && !p.name) {
      setResolving(true);
      const found = await window.DRAI.identifyPlace(p.lat, p.lon);
      setResolving(false);
      if (!found || found.sea) { setToast("That looks like open water — try clicking on land."); return; }
      const np = { name: found.name, country: found.country, lat: p.lat, lon: p.lon, coords: fmtCoords(p.lat, p.lon) };
      setPlace(np); loadLists(np);
    } else {
      const np = { name: p.name, country: p.country, lat: p.lat, lon: p.lon, coords: fmtCoords(p.lat, p.lon) };
      setPlace(np); loadLists(np);
    }
  };

  uE(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toast]);

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
        </header>

        {countries.length === 0 ? (
          <div className="loading-map"><span className="lm-dot" /> Unrolling the map…</div>
        ) : (
          <WorldMap countries={countries} onPick={pick} selected={place} picking={resolving} />
        )}

        {!place && countries.length > 0 && (
          <div className="hint">
            <span className="hint-k">Click the map</span>, search, or tap a <span className="hint-pin" /> to begin
          </div>
        )}

        {resolving && (
          <div className="resolve"><span className="lm-dot" /> Pinpointing your destination…</div>
        )}
        {toast && <div className="toast">{toast}</div>}
      </div>

      <ResultsPanel place={place} data={data} loading={loading} tab={tab} setTab={setTab} onClose={() => setPlace(null)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
