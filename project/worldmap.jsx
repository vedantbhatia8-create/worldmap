// ── WorldMap: D3 Natural-Earth projection, pan/zoom, click-to-select ──────────
const { useRef, useEffect, useMemo, useState, useCallback } = React;

function WorldMap({ countries, onPick, selected, picking }) {
  const W = 1000, H = 515;
  const svgRef = useRef(null);
  const zoomRef = useRef(null);
  const [t, setT] = useState({ k: 1, x: 0, y: 0 });
  const [hover, setHover] = useState(null);
  const moved = useRef(0);

  // Projection fit to viewBox.
  const projection = useMemo(() => {
    return d3.geoNaturalEarth1().fitExtent([[12, 10], [W - 12, H - 10]], { type: "Sphere" });
  }, []);
  const path = useMemo(() => d3.geoPath(projection), [projection]);
  const graticule = useMemo(() => d3.geoGraticule().step([20, 20])(), []);
  const spherePath = useMemo(() => path({ type: "Sphere" }), [path]);

  const notable = useMemo(() => window.CITIES.filter((c) => c.notable), []);

  // Zoom behaviour.
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom()
      .scaleExtent([1, 9])
      .translateExtent([[0, 0], [W, H]])
      .on("zoom", (e) => setT({ k: e.transform.k, x: e.transform.x, y: e.transform.y }));
    zoomRef.current = zoom;
    svg.call(zoom).on("dblclick.zoom", null);
    return () => svg.on(".zoom", null);
  }, []);

  const zoomBy = (f) => {
    d3.select(svgRef.current).transition().duration(420).call(zoomRef.current.scaleBy, f);
  };
  const resetZoom = () => {
    d3.select(svgRef.current).transition().duration(560)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  };

  // Fly to a lon/lat at a target scale (used when a place is chosen).
  const flyTo = useCallback((lon, lat, k = 4.5) => {
    const p = projection([lon, lat]);
    if (!p) return;
    const tx = W / 2 - p[0] * k, ty = H / 2 - p[1] * k;
    d3.select(svgRef.current).transition().duration(900)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
  }, [projection]);

  useEffect(() => {
    if (selected) flyTo(selected.lon, selected.lat);
  }, [selected, flyTo]);

  // Convert a click into lon/lat.
  const handleClick = (e) => {
    if (moved.current > 6) return;
    const rect = svgRef.current.getBoundingClientRect();
    // Map client coords -> viewBox coords (preserveAspectRatio xMidYMid meet).
    const scale = Math.min(rect.width / W, rect.height / H);
    const offX = (rect.width - W * scale) / 2, offY = (rect.height - H * scale) / 2;
    const vx = (e.clientX - rect.left - offX) / scale;
    const vy = (e.clientY - rect.top - offY) / scale;
    // Undo zoom transform.
    const gx = (vx - t.x) / t.k, gy = (vy - t.y) / t.k;
    const ll = projection.invert([gx, gy]);
    if (!ll || isNaN(ll[0])) return;
    onPick({ lon: ll[0], lat: ll[1], source: "map" });
  };

  const inv = 1 / t.k;
  const selPt = selected ? projection([selected.lon, selected.lat]) : null;

  return (
    <div className="map-wrap">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"
        className={"worldmap" + (picking ? " picking" : "")}
        onPointerDown={() => { moved.current = 0; }}
        onPointerMove={(e) => { if (e.buttons) moved.current += Math.abs(e.movementX) + Math.abs(e.movementY); }}
        onClick={handleClick}>
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="42%" r="75%">
            <stop offset="0%" stopColor="#B6DAD0" />
            <stop offset="100%" stopColor="#8FC4B9" />
          </radialGradient>
          <filter id="paperGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
          </filter>
          <filter id="pinShadow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1.4" floodColor="#3A3322" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Ocean sphere */}
        <path d={spherePath} fill="url(#oceanGrad)" stroke="#3F7D70" strokeWidth="1" />
        <path d={spherePath} fill="none" stroke="#2C5F54" strokeWidth="0.4" opacity="0.4" />

        <g transform={`translate(${t.x},${t.y}) scale(${t.k})`}>
          {/* Graticule */}
          <path d={path(graticule)} fill="none" stroke="#5E9389" strokeWidth={0.3 * inv} opacity="0.4" />
          {/* Countries */}
          <g>
            {countries.map((f, i) => (
              <path key={i} d={path(f)} fill="#F0D293" stroke="#B98A2A" strokeWidth={0.45 * inv} strokeLinejoin="round" />
            ))}
          </g>

          {/* Notable city dots */}
          <g className="city-dots">
            {notable.map((c, i) => {
              const p = projection([c.lon, c.lat]);
              if (!p) return null;
              const isSel = selected && Math.abs(selected.lat - c.lat) < 0.01 && Math.abs(selected.lon - c.lon) < 0.01;
              if (isSel) return null;
              return (
                <g key={i} transform={`translate(${p[0]},${p[1]})`}
                  className="city-dot"
                  onMouseEnter={() => setHover(c)} onMouseLeave={() => setHover(null)}
                  onClick={(e) => { e.stopPropagation(); onPick({ ...c, source: "pin" }); }}>
                  <circle r={6 * inv} fill="transparent" />
                  <circle r={1.9 * inv} fill="#C0392B" stroke="#F8F0D9" strokeWidth={0.6 * inv} />
                  {t.k > 2.2 && (
                    <text x={3.4 * inv} y={1.4 * inv} fontSize={3.6 * inv} className="city-label">{c.name}</text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Selected marker */}
          {selPt && (
            <g transform={`translate(${selPt[0]},${selPt[1]})`} className="sel-marker">
              <circle r={11 * inv} className="sel-pulse" />
              <g transform={`scale(${inv})`} filter="url(#pinShadow)">
                <path d="M0 0 C-6 -9 -6 -16 0 -19 C6 -16 6 -9 0 0 Z" fill="#C0392B" stroke="#F8F0D9" strokeWidth="1.1" />
                <circle cx="0" cy="-12.5" r="2.6" fill="#F8F0D9" />
              </g>
            </g>
          )}
        </g>
      </svg>

      {/* Hover tooltip */}
      {hover && (
        <div className="map-tip">
          <span className="map-tip-name">{hover.name}</span>
          <span className="map-tip-country">{hover.country}</span>
        </div>
      )}

      {/* Zoom controls */}
      <div className="map-ctrls">
        <button onClick={() => zoomBy(1.6)} aria-label="Zoom in">+</button>
        <button onClick={() => zoomBy(1 / 1.6)} aria-label="Zoom out">–</button>
        <button onClick={resetZoom} className="ctrl-reset" aria-label="Reset view">⤢</button>
      </div>

      {/* Compass rose */}
      <Compass />
    </div>
  );
}

function Compass() {
  return (
    <svg className="compass" viewBox="0 0 100 100" width="74" height="74" aria-hidden="true">
      <circle cx="50" cy="50" r="44" fill="none" stroke="#9C8A60" strokeWidth="1" opacity="0.55" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="#9C8A60" strokeWidth="0.5" opacity="0.4" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1="50" y1="50"
          x2={50 + 40 * Math.cos((a - 90) * Math.PI / 180)}
          y2={50 + 40 * Math.sin((a - 90) * Math.PI / 180)}
          stroke="#9C8A60" strokeWidth={a % 90 === 0 ? 0.8 : 0.3} opacity="0.4" />
      ))}
      <path d="M50 8 L56 50 L50 46 L44 50 Z" fill="#B5483A" />
      <path d="M50 92 L44 50 L50 54 L56 50 Z" fill="#6B6149" />
      <text x="50" y="20" className="compass-n" textAnchor="middle">N</text>
    </svg>
  );
}

window.WorldMap = WorldMap;
