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
      // Wait for Google script to load.
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
      <div className="login-card">
        <div className="login-logo">
          <svg viewBox="0 0 32 32" width="52" height="52">
            <circle cx="16" cy="16" r="14" fill="none" stroke="#C0392B" strokeWidth="1.5" />
            <path d="M16 4 C9 12 9 20 16 28 C23 20 23 12 16 4 Z M2 16 H30 M16 4 V28"
              fill="none" stroke="#C0392B" strokeWidth="0.9" opacity="0.7" />
            <circle cx="16" cy="16" r="2.4" fill="#C0392B" />
          </svg>
        </div>
        <h1 className="login-title">Destination Relaxation</h1>
        <p className="login-sub">An atlas of where to eat &amp; wander</p>
        <div className="login-divider" />
        <div id="g-signin-btn" />
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
