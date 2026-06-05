// ── Results side panel ───────────────────────────────────────────────────────
const { useState: uS, useEffect: uE } = React;

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
        {[0,1,2,3,4].map(i => (
          <path key={i} d={star} transform={`translate(${i*20},0)`} fill={`url(#sg${pct.toFixed(0)})`} />
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

function fmtReviewDate(iso) {
  if (!iso) return "";
  const d = new Date(iso), diff = Date.now() - d;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function RestaurantReviews({ item, place, user }) {
  const [reviews, setReviews] = uS(null);
  const [hov, setHov] = uS(0);
  const [sel, setSel] = uS(0);
  const [text, setText] = uS("");
  const [busy, setBusy] = uS(false);
  const [done, setDone] = uS(false);

  uE(() => {
    fetch(`/api/reviews?restaurant=${encodeURIComponent(item.name)}&place=${encodeURIComponent(place.name)}`)
      .then(r => r.json()).then(setReviews).catch(() => setReviews([]));
  }, [item.name, place.name]);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_name: item.name,
          city_name: place.name,
          user_email: user.email,
          user_name: user.name,
          rating: sel || 5,
          review_text: text.trim(),
        }),
      });
      setDone(true);
      const fresh = await fetch(`/api/reviews?restaurant=${encodeURIComponent(item.name)}&place=${encodeURIComponent(place.name)}`).then(r => r.json());
      setReviews(Array.isArray(fresh) ? fresh : []);
    } finally { setBusy(false); }
  };

  const active = hov || sel;

  return (
    <div className="rr-panel">
      {reviews === null && <div className="rr-loading">Loading reviews…</div>}

      {reviews && reviews.length > 0 && (
        <div className="rr-list">
          {reviews.map(r => (
            <div key={r.id} className="rr-item">
              <div className="rr-item-header">
                <span className="rr-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                <span className="rr-user">{r.user_name}</span>
                <span className="rr-date">{fmtReviewDate(r.created_at)}</span>
              </div>
              {r.review_text && <p className="rr-text">{r.review_text}</p>}
            </div>
          ))}
        </div>
      )}

      {reviews && reviews.length === 0 && !done && (
        <p className="rr-empty">No reviews yet — be the first!</p>
      )}

      {!done ? (
        <div className="rr-form">
          <div className="rrf-label">Your rating</div>
          <div className="rrf-stars">
            {[1,2,3,4,5].map(n => (
              <button key={n} className={"rrf-star" + (n <= active ? " lit" : "")}
                onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
                onClick={() => setSel(n)}>★</button>
            ))}
            {sel > 0 && <span className="rrf-sel-label">{["","Poor","Fair","Good","Great","Excellent"][sel]}</span>}
          </div>
          <textarea className="rrf-text" placeholder="Describe your experience… (optional)"
            value={text} onChange={e => setText(e.target.value)} rows={3} />
          <button className="rrf-submit" onClick={submit} disabled={busy || (!sel && !text.trim())}>
            {busy ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      ) : (
        <div className="rr-thanks">Thanks for your review! ✦</div>
      )}
    </div>
  );
}

function ResultItem({ item, place, user }) {
  const [open, setOpen] = uS(false);

  return (
    <li className={"ritem" + (open ? " ritem-open" : "")}>
      <div className="ritem-main">
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
          {user && (
            <button className="ritem-review-btn" onClick={() => setOpen(o => !o)}>
              {open ? "▲ Hide" : "★ Reviews & Rate"}
            </button>
          )}
        </div>
      </div>
      {open && <RestaurantReviews item={item} place={place} user={user} />}
    </li>
  );
}

function SkeletonItem() {
  return (
    <li className="ritem skel">
      <div className="ritem-main">
        <div className="thumb skel-box" />
        <div className="ritem-body">
          <div className="skel-line w60" />
          <div className="skel-line w35" />
          <div className="skel-line w50" />
          <div className="skel-line w80" />
        </div>
      </div>
    </li>
  );
}

function ResultsPanel({ place, data, loading, onClose, user }) {
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
              {!loading && data && data.map(it => <ResultItem key={it.rank} item={it} place={place} user={user} />)}
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
