// ── WorldMap: Leaflet + CartoDB Voyager tiles, click-to-select ───────────────
const { useRef, useEffect } = React;

function WorldMap({ onPick, selected, picking }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
    });

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}", {
      attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
      maxZoom: 16,
    }).addTo(map);

    map.on("click", (e) => {
      onPickRef.current({ lat: e.latlng.lat, lon: e.latlng.lng, source: "map" });
    });

    mapRef.current = map;

    // Fix Leaflet miscalculating size before CSS layout is settled.
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);

    return () => { ro.disconnect(); map.remove(); mapRef.current = null; markerRef.current = null; };
  }, []);

  // Fly to selected place and drop marker.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) return;

    map.flyTo([selected.lat, selected.lon], 11, { duration: 1.1, easeLinearity: 0.25 });

    if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }

    const icon = L.divIcon({
      className: "pin-icon",
      html: `<span class="pin-pulse"></span>
             <svg width="26" height="34" viewBox="0 0 26 34" fill="none">
               <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 21 13 21S26 22.75 26 13C26 5.82 20.18 0 13 0z"
                 fill="#C0392B" stroke="#F8F0D9" stroke-width="1.5"/>
               <circle cx="13" cy="13" r="5" fill="#F8F0D9"/>
             </svg>`,
      iconSize: [26, 34],
      iconAnchor: [13, 34],
    });

    markerRef.current = L.marker([selected.lat, selected.lon], { icon, interactive: false }).addTo(map);
  }, [selected]);

  // Picking-state cursor.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getContainer().classList.toggle("picking", picking);
  }, [picking]);

  return (
    <div className="map-wrap">
      <div ref={containerRef} className="map-canvas" />
      <div className="map-ctrls">
        <button onClick={() => mapRef.current?.zoomIn()} aria-label="Zoom in">+</button>
        <button onClick={() => mapRef.current?.zoomOut()} aria-label="Zoom out">–</button>
        <button onClick={() => mapRef.current?.setView([20, 0], 2)} className="ctrl-reset" aria-label="Reset view">⤢</button>
      </div>
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
