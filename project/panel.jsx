// ── Results side panel: Food / Attractions tabs ──────────────────────────────

function Stars({ value }) {
  const pct = (value / 5) * 100;
  const star = "M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 15.77 4.8 17.5l.99-5.8L1.58 7.6l5.82-.85z";
  return (
    <span className="stars" title={value.toFixed(1) + " / 5"}>
      <svg viewBox="0 0 20 20" className="stars-svg">
        <defs>
          <linearGradient id={"sg" + pct.toFixed(0)}>
            <stop offset={pct + "%"} stopColor="#C9963E" />
            <stop offset={pct + "%"} stopColor="#D8CBA8" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={star} transform={`translate(${i * 20},0)`} fill={`url(#sg${pct.toFixed(0)})`} />
        ))}
      </svg>
      <span className="stars-num">{value.toFixed(1)}</span>
    </span>
  );
}

function PriceLevel({ value, kind }) {
  if (kind === "attractions" && value === 0) return <span className="price free">Free</span>;
  const max = kind === "food" ? 4 : 3;
  const sym = kind === "food" ? "$" : "€";
  return (
    <span className="price">
      <b>{sym.repeat(Math.max(1, value))}</b>
      <span className="price-dim">{sym.repeat(Math.max(0, max - Math.max(1, value)))}</span>
    </span>
  );
}

const FOOD_ICON = "M7 2v8M5 2v4a2 2 0 002 2M9 2v4a2 2 0 01-2 2M15 2c-1.5 0-2 2-2 4s.5 3 2 3v9M7 13v9";
const ATTR_ICON = "M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6";

function Thumb({ item, kind }) {
  // Deterministic colourful tint from the name.
  let h = 0; for (const ch of item.name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const base = kind === "food" ? [10, 200] : [150, 260]; // warm band for food, cool for sights
  const hue = base[0] + (h % (base[1] - base[0]));
  const c1 = `hsl(${hue} 64% 56%)`, c2 = `hsl(${(hue + 28) % 360} 58% 38%)`;
  return (
    <div className="thumb" style={{ background: `linear-gradient(150deg, ${c1}, ${c2})` }}>
      <svg viewBox="0 0 24 24" className="thumb-ic" fill="none" stroke="rgba(255,255,255,.85)"
        strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d={kind === "food" ? FOOD_ICON : ATTR_ICON} />
      </svg>
      <span className="thumb-rank">{item.rank}</span>
    </div>
  );
}

function ResultItem({ item, kind }) {
  return (
    <li className="ritem">
      <Thumb item={item} kind={kind} />
      <div className="ritem-body">
        <div className="ritem-top">
          <h4 className="ritem-name">{item.name}</h4>
        </div>
        <div className="ritem-cat">{item.category}</div>
        <div className="ritem-meta">
          <Stars value={item.rating} />
          <span className="dot-sep">·</span>
          <PriceLevel value={item.price} kind={kind} />
          {item.distance && (<><span className="dot-sep">·</span><span className="dist">{item.distance}</span></>)}
        </div>
        {item.blurb && <p className="ritem-blurb">{item.blurb}</p>}
      </div>
    </li>
  );
}

function SkeletonItem() {
  return (
    <li className="ritem skel">
      <div className="thumb skel-box" />
      <div className="ritem-body">
        <div className="skel-line w60" />
        <div className="skel-line w35" />
        <div className="skel-line w50" />
        <div className="skel-line w80" />
      </div>
    </li>
  );
}

function ResultsPanel({ place, data, loading, tab, setTab, onClose }) {
  const open = !!place;
  const list = data ? data[tab] : null;
  return (
    <aside className={"panel" + (open ? " open" : "")}>
      {place && (
        <div className="panel-inner">
          <button className="panel-close" onClick={onClose} aria-label="Close">✕</button>
          <div className="panel-head">
            <div className="panel-kicker">Destination</div>
            <h2 className="panel-title">{place.name}</h2>
            <div className="panel-sub">{place.country}{place.coords ? ` · ${place.coords}` : ""}</div>
          </div>

          <div className="tabs" role="tablist">
            <button className={"tab" + (tab === "food" ? " active" : "")} onClick={() => setTab("food")}>
              <span className="tab-label">Food &amp; Drink</span>
              <span className="tab-rule food" />
            </button>
            <button className={"tab" + (tab === "attractions" ? " active" : "")} onClick={() => setTab("attractions")}>
              <span className="tab-label">Attractions</span>
              <span className="tab-rule attr" />
            </button>
          </div>

          <div className="panel-scroll">
            <div className="list-cap">Top 10 · {tab === "food" ? "where to eat & drink" : "what to see & do"}</div>
            <ol className="rlist">
              {loading[tab] && Array.from({ length: 7 }).map((_, i) => <SkeletonItem key={i} />)}
              {!loading[tab] && list && list.map((it) => <ResultItem key={it.rank} item={it} kind={tab} />)}
              {!loading[tab] && list && list.length === 0 && (
                <div className="panel-empty">Couldn’t gather a list for this spot — try another nearby place.</div>
              )}
            </ol>
            {!loading[tab] && list && list.length > 0 && (
              <div className="panel-foot">Curated live for {place.name} · ratings are indicative</div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

window.ResultsPanel = ResultsPanel;
