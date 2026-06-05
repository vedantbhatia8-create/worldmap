// ── Results side panel ───────────────────────────────────────────────────────

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

function PriceLevel({ value }) {
  return (
    <span className="price">
      <b>{"$".repeat(Math.max(1, value))}</b>
      <span className="price-dim">{"$".repeat(Math.max(0, 4 - Math.max(1, value)))}</span>
    </span>
  );
}

const FOOD_ICON = "M7 2v8M5 2v4a2 2 0 002 2M9 2v4a2 2 0 01-2 2M15 2c-1.5 0-2 2-2 4s.5 3 2 3v9M7 13v9";

function Thumb({ item }) {
  let h = 0; for (const ch of item.name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const hue = 10 + (h % 190);
  const c1 = `hsl(${hue} 64% 56%)`, c2 = `hsl(${(hue + 28) % 360} 58% 38%)`;
  return (
    <div className="thumb" style={{ background: `linear-gradient(150deg, ${c1}, ${c2})` }}>
      <svg viewBox="0 0 24 24" className="thumb-ic" fill="none" stroke="rgba(255,255,255,.85)"
        strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d={FOOD_ICON} />
      </svg>
      <span className="thumb-rank">{item.rank}</span>
    </div>
  );
}

function ResultItem({ item }) {
  return (
    <li className="ritem">
      <Thumb item={item} />
      <div className="ritem-body">
        <h4 className="ritem-name">{item.name}</h4>
        <div className="ritem-cat">{item.category}</div>
        <div className="ritem-meta">
          <Stars value={item.rating} />
          <span className="dot-sep">·</span>
          <PriceLevel value={item.price} />
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

function ResultsPanel({ place, data, loading, onClose }) {
  const open = !!place;
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

          <div className="panel-scroll">
            <div className="list-cap">Top 10 · where to eat &amp; drink</div>
            <ol className="rlist">
              {loading && Array.from({ length: 7 }).map((_, i) => <SkeletonItem key={i} />)}
              {!loading && data && data.map((it) => <ResultItem key={it.rank} item={it} />)}
              {!loading && data && data.length === 0 && (
                <div className="panel-empty">No results found — try a larger nearby city.</div>
              )}
            </ol>
            {!loading && data && data.length > 0 && (
              <div className="panel-foot">Top restaurants &amp; bars in {place.name}</div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

window.ResultsPanel = ResultsPanel;
