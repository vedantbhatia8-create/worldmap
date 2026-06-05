// ── Auth: Google Sign-In gate ─────────────────────────────────────────────────
const { useState: uS, useEffect: uE } = React;

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
}

function MapGrid() {
  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}} aria-hidden="true">
      <defs>
        <pattern id="lgrid" width="70" height="70" patternUnits="userSpaceOnUse">
          <path d="M 70 0 L 0 0 0 70" fill="none" stroke="rgba(110,95,56,0.11)" strokeWidth="0.5"/>
        </pattern>
        <pattern id="lgrid-l" width="210" height="210" patternUnits="userSpaceOnUse">
          <path d="M 210 0 L 0 0 0 210" fill="none" stroke="rgba(110,95,56,0.18)" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lgrid)"/>
      <rect width="100%" height="100%" fill="url(#lgrid-l)"/>
    </svg>
  );
}

function StarField() {
  const stars = [
    [8,12,3.2],[15,35,2.2],[22,8,3.6],[5,60,2],[28,75,2.6],[12,88,2.2],
    [72,6,3.2],[85,18,2],[92,42,2.6],[78,68,3],[88,82,3.6],[95,92,2],
    [45,5,2.6],[55,95,3],[38,92,2],[65,88,2.6],[48,78,2],[35,22,2.6],
    [60,14,3],[75,32,2],[18,50,3],[90,62,2.6],[52,40,2],[8,42,2.4],
  ];
  return (
    <>
      {stars.map(([x,y,s],i) => (
        <svg key={i} aria-hidden="true" style={{
          position:'absolute',left:`${x}%`,top:`${y}%`,
          width:s*7,height:s*7,opacity:0.38,
          animation:`twinkle ${2+i%4}s ease-in-out infinite`,
          animationDelay:`${(i*0.35).toFixed(2)}s`,zIndex:0
        }} viewBox="0 0 12 12">
          <path d="M6 0 L7.2 4.8 L12 6 L7.2 7.2 L6 12 L4.8 7.2 L0 6 L4.8 4.8 Z" fill="#9C7A3C"/>
        </svg>
      ))}
    </>
  );
}

function CompassRose({ style }) {
  const ticks = Array.from({length:24},(_,i)=>{
    const a=(i*15-90)*Math.PI/180, r1=i%6===0?36:i%3===0?40:43, r2=46;
    return <line key={i} x1={60+r1*Math.cos(a)} y1={60+r1*Math.sin(a)}
      x2={60+r2*Math.cos(a)} y2={60+r2*Math.sin(a)}
      stroke="#9C7A3C" strokeWidth={i%6===0?1.2:0.5} opacity="0.45"/>;
  });
  return (
    <svg viewBox="0 0 120 120" style={style} aria-hidden="true" fill="none">
      <circle cx="60" cy="60" r="56" stroke="#9C7A3C" strokeWidth="1.2" opacity="0.42"/>
      <circle cx="60" cy="60" r="46" stroke="#9C7A3C" strokeWidth="0.5" opacity="0.28"/>
      <circle cx="60" cy="60" r="30" stroke="#9C7A3C" strokeWidth="0.4" opacity="0.2" strokeDasharray="2 4"/>
      {ticks}
      <polygon points="60,10 63.5,56 60,52 56.5,56" fill="#B5483A" opacity="0.65"/>
      <polygon points="60,110 56.5,64 60,68 63.5,64" fill="#7A6B4F" opacity="0.5"/>
      <polygon points="10,60 56,56.5 52,60 56,63.5" fill="#7A6B4F" opacity="0.5"/>
      <polygon points="110,60 64,63.5 68,60 64,56.5" fill="#7A6B4F" opacity="0.5"/>
      <circle cx="60" cy="60" r="8" stroke="#9C7A3C" strokeWidth="1" fill="#F8F0D9" opacity="0.7"/>
      <circle cx="60" cy="60" r="3.5" fill="#9C7A3C" opacity="0.55"/>
      <text x="60" y="24" textAnchor="middle" fontSize="11" fontFamily="Georgia,serif" fill="#B5483A" opacity="0.7">N</text>
      <text x="60" y="104" textAnchor="middle" fontSize="9" fontFamily="Georgia,serif" fill="#7A6B4F" opacity="0.5">S</text>
      <text x="100" y="64" textAnchor="middle" fontSize="9" fontFamily="Georgia,serif" fill="#7A6B4F" opacity="0.5">E</text>
      <text x="20" y="64" textAnchor="middle" fontSize="9" fontFamily="Georgia,serif" fill="#7A6B4F" opacity="0.5">W</text>
    </svg>
  );
}

function SailShip({ style }) {
  return (
    <svg viewBox="0 0 160 100" style={style} aria-hidden="true" fill="none">
      <path d="M18 68 Q80 86 142 68 L128 78 Q80 94 32 78 Z" fill="#9C7A3C" opacity="0.28"/>
      <line x1="80" y1="68" x2="80" y2="10" stroke="#9C7A3C" strokeWidth="1.5" opacity="0.38"/>
      <line x1="44" y1="68" x2="44" y2="22" stroke="#9C7A3C" strokeWidth="1.2" opacity="0.32"/>
      <path d="M80 12 L118 60 L80 64 Z" fill="#C8A96E" opacity="0.32"/>
      <path d="M80 20 L52 64 L80 64 Z" fill="#C8A96E" opacity="0.28"/>
      <path d="M44 24 L68 64 L44 66 Z" fill="#C8A96E" opacity="0.26"/>
      <path d="M80 10 L100 18 L80 26 Z" fill="#B5483A" opacity="0.5"/>
      <path d="M20 80 Q38 74 56 80 Q74 86 92 80 Q110 74 128 80" stroke="#9C7A3C" strokeWidth="0.8" fill="none" opacity="0.28"/>
      <path d="M14 88 Q36 82 58 88 Q80 94 102 88 Q124 82 146 88" stroke="#9C7A3C" strokeWidth="0.8" fill="none" opacity="0.18"/>
    </svg>
  );
}

function HotAirBalloon({ style }) {
  return (
    <svg viewBox="0 0 80 132" style={style} aria-hidden="true" fill="none">
      <ellipse cx="40" cy="54" rx="35" ry="48" fill="#C8A96E" opacity="0.2" stroke="#9C7A3C" strokeWidth="1.2" />
      <ellipse cx="40" cy="54" rx="35" ry="48" fill="none" stroke="#9C7A3C" strokeWidth="1.2" opacity="0.32"/>
      <path d="M40 6 Q18 54 40 102 Q62 54 40 6" fill="#B5483A" opacity="0.1"/>
      <path d="M8 34 Q6 54 10 74" stroke="#9C7A3C" strokeWidth="0.8" opacity="0.28"/>
      <path d="M72 34 Q74 54 70 74" stroke="#9C7A3C" strokeWidth="0.8" opacity="0.28"/>
      <path d="M14 20 Q40 4 66 20" stroke="#9C7A3C" strokeWidth="0.8" fill="none" opacity="0.22"/>
      <path d="M14 88 Q40 100 66 88" stroke="#9C7A3C" strokeWidth="0.8" fill="none" opacity="0.22"/>
      <line x1="24" y1="100" x2="25" y2="114" stroke="#9C7A3C" strokeWidth="1" opacity="0.38"/>
      <line x1="56" y1="100" x2="55" y2="114" stroke="#9C7A3C" strokeWidth="1" opacity="0.38"/>
      <rect x="19" y="114" width="42" height="16" rx="3" fill="#C8A96E" opacity="0.3" stroke="#9C7A3C" strokeWidth="1"/>
    </svg>
  );
}

function VintageAirplane({ style }) {
  return (
    <svg viewBox="0 0 140 72" style={style} aria-hidden="true" fill="none">
      <ellipse cx="70" cy="36" rx="56" ry="10" fill="#C8A96E" opacity="0.26" stroke="#9C7A3C" strokeWidth="0.8"/>
      <path d="M44 35 L8 6 L74 30 Z" fill="#C8A96E" opacity="0.26" stroke="#9C7A3C" strokeWidth="0.6"/>
      <path d="M44 37 L5 60 L74 42 Z" fill="#C8A96E" opacity="0.2" stroke="#9C7A3C" strokeWidth="0.6"/>
      <path d="M116 34 L130 16 L124 36 Z" fill="#C8A96E" opacity="0.26"/>
      <path d="M116 38 L130 58 L124 36 Z" fill="#C8A96E" opacity="0.2"/>
      <circle cx="15" cy="36" r="4.5" fill="none" stroke="#9C7A3C" strokeWidth="1.2" opacity="0.35"/>
      <line x1="15" y1="28" x2="15" y2="44" stroke="#9C7A3C" strokeWidth="2" opacity="0.35"/>
    </svg>
  );
}

function PalmIsland({ style }) {
  return (
    <svg viewBox="0 0 90 112" style={style} aria-hidden="true" fill="none">
      <path d="M46 104 Q42 80 47 62 Q50 48 45 26" stroke="#9C7A3C" strokeWidth="4" strokeLinecap="round" opacity="0.28"/>
      <path d="M45 28 Q16 12 10 24 Q22 30 45 34" fill="#7A9C3C" opacity="0.22"/>
      <path d="M45 28 Q74 10 82 24 Q67 28 45 34" fill="#7A9C3C" opacity="0.22"/>
      <path d="M45 28 Q32 2 48 2 Q50 14 45 34" fill="#7A9C3C" opacity="0.18"/>
      <path d="M45 34 Q18 38 14 54 Q28 46 45 42" fill="#7A9C3C" opacity="0.18"/>
      <path d="M45 34 Q74 36 78 52 Q64 44 45 42" fill="#7A9C3C" opacity="0.18"/>
      <ellipse cx="50" cy="104" rx="30" ry="8" fill="#C8A96E" opacity="0.28"/>
      <path d="M20 104 Q35 98 50 104 Q65 98 80 104" stroke="#9C7A3C" strokeWidth="0.8" fill="none" opacity="0.2"/>
    </svg>
  );
}

function Anchor({ style }) {
  return (
    <svg viewBox="0 0 64 88" style={style} aria-hidden="true" fill="none">
      <circle cx="32" cy="20" r="12" stroke="#9C7A3C" strokeWidth="2" opacity="0.35"/>
      <circle cx="32" cy="20" r="4.5" fill="#9C7A3C" opacity="0.25"/>
      <line x1="32" y1="32" x2="32" y2="72" stroke="#9C7A3C" strokeWidth="2.5" opacity="0.35"/>
      <path d="M32 72 Q10 64 8 50" stroke="#9C7A3C" strokeWidth="2" fill="none" opacity="0.35"/>
      <path d="M32 72 Q54 64 56 50" stroke="#9C7A3C" strokeWidth="2" fill="none" opacity="0.35"/>
      <line x1="20" y1="15" x2="44" y2="15" stroke="#9C7A3C" strokeWidth="1.5" opacity="0.35"/>
      <circle cx="8" cy="50" r="4" fill="none" stroke="#9C7A3C" strokeWidth="1.5" opacity="0.3"/>
      <circle cx="56" cy="50" r="4" fill="none" stroke="#9C7A3C" strokeWidth="1.5" opacity="0.3"/>
    </svg>
  );
}

function Telescope({ style }) {
  return (
    <svg viewBox="0 0 100 90" style={style} aria-hidden="true" fill="none">
      <rect x="12" y="36" width="72" height="16" rx="8" fill="#C8A96E" opacity="0.25" stroke="#9C7A3C" strokeWidth="1.2"/>
      <ellipse cx="16" cy="44" rx="9" ry="13" fill="#C8A96E" opacity="0.2" stroke="#9C7A3C" strokeWidth="1"/>
      <ellipse cx="82" cy="44" rx="5.5" ry="8" fill="#C8A96E" opacity="0.2" stroke="#9C7A3C" strokeWidth="1"/>
      <line x1="48" y1="52" x2="48" y2="80" stroke="#9C7A3C" strokeWidth="2" opacity="0.32"/>
      <line x1="34" y1="80" x2="62" y2="80" stroke="#9C7A3C" strokeWidth="2" opacity="0.32"/>
    </svg>
  );
}

function LoginScreen({ onLogin }) {
  const [error, setError] = uS("");

  uE(() => {
    let cancelled = false;

    async function init() {
      while (!window.google?.accounts) {
        if (cancelled) return;
        await new Promise(r => setTimeout(r, 100));
      }
      try {
        const { googleClientId } = await fetch("/api/config").then(r => r.json());
        if (cancelled || !googleClientId) {
          setError("Google Client ID not configured.");
          return;
        }
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: ({ credential }) => {
            const payload = parseJwt(credential);
            if (!payload) { setError("Sign-in failed. Please try again."); return; }
            const user = { name: payload.name, email: payload.email, picture: payload.picture };
            localStorage.setItem("dr_user", JSON.stringify(user));
            onLogin(user);
          },
          ux_mode: "popup",
        });
        google.accounts.id.renderButton(
          document.getElementById("g-signin-btn"),
          { theme: "outline", size: "large", shape: "pill", text: "continue_with", width: 280 }
        );
      } catch (e) {
        if (!cancelled) setError("Couldn't load sign-in. Refresh and try again.");
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="login-overlay">
      <MapGrid />
      <StarField />
      <div className="login-vignette" />

      <div className="lm lm-compass"><CompassRose style={{width:170,height:170}} /></div>
      <div className="lm lm-ship"><SailShip style={{width:210,height:115}} /></div>
      <div className="lm lm-balloon"><HotAirBalloon style={{width:88,height:150}} /></div>
      <div className="lm lm-palm"><PalmIsland style={{width:110,height:145}} /></div>
      <div className="lm lm-plane"><VintageAirplane style={{width:155,height:80}} /></div>
      <div className="lm lm-anchor"><Anchor style={{width:68,height:92}} /></div>
      <div className="lm lm-scope"><Telescope style={{width:94,height:84}} /></div>

      <div className="login-card">
        <div className="lcc lcc-tl" /><div className="lcc lcc-tr" />
        <div className="lcc lcc-bl" /><div className="lcc lcc-br" />

        <div className="login-logo">
          <svg viewBox="0 0 32 32" width="58" height="58">
            <circle cx="16" cy="16" r="14" fill="none" stroke="#C0392B" strokeWidth="1.5" />
            <path d="M16 4 C9 12 9 20 16 28 C23 20 23 12 16 4 Z M2 16 H30 M16 4 V28"
              fill="none" stroke="#C0392B" strokeWidth="0.9" opacity="0.7" />
            <circle cx="16" cy="16" r="2.4" fill="#C0392B" />
          </svg>
        </div>
        <h1 className="login-title">Destination Relaxation</h1>
        <p className="login-sub">An atlas of where to eat &amp; wander</p>
        <div className="login-ornament">
          <svg viewBox="0 0 220 22" width="220" height="22" aria-hidden="true">
            <line x1="0" y1="11" x2="84" y2="11" stroke="#B6923B" strokeWidth="0.8" opacity="0.45"/>
            <path d="M92 11 L98 5 L104 11 L98 17 Z" fill="none" stroke="#B6923B" strokeWidth="1" opacity="0.55"/>
            <path d="M104 11 L112 3 L120 11 L112 19 Z" fill="#B6923B" opacity="0.3"/>
            <path d="M120 11 L126 5 L132 11 L126 17 Z" fill="none" stroke="#B6923B" strokeWidth="1" opacity="0.55"/>
            <line x1="140" y1="11" x2="220" y2="11" stroke="#B6923B" strokeWidth="0.8" opacity="0.45"/>
          </svg>
        </div>
        <div id="g-signin-btn" />
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
