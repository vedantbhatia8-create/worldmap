// ── Auth: Google Sign-In gate ─────────────────────────────────────────────────
const { useState: uS, useEffect: uE } = React;

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
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
          callback: async ({ credential }) => {
            const payload = parseJwt(credential);
            if (!payload) { setError("Sign-in failed. Please try again."); return; }
            const user = { name: payload.name, email: payload.email, picture: payload.picture };
            try {
              const resp = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
              }).then(r => r.json());
              if (resp.banned) {
                setError("Your account has been suspended. Contact the administrator.");
                return;
              }
            } catch { /* don't block login if tracking fails */ }
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
      <MotifGrid />
      <MotifStars />
      <div className="login-vignette" />

      <div className="lm lm-compass"><MotifCompass style={{width:170,height:170}} /></div>
      <div className="lm lm-ship"><MotifShip style={{width:210,height:115}} /></div>
      <div className="lm lm-balloon"><MotifBalloon style={{width:88,height:150}} /></div>
      <div className="lm lm-palm"><MotifPalm style={{width:110,height:145}} /></div>
      <div className="lm lm-plane"><MotifPlane style={{width:155,height:80}} /></div>
      <div className="lm lm-anchor"><MotifAnchor style={{width:68,height:92}} /></div>
      <div className="lm lm-scope"><MotifScope style={{width:94,height:84}} /></div>

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
