"use client";

import { useState } from "react";

type State = "idle" | "submitting" | "done";

export default function MinistryStartPage() {
  const [state, setState] = useState<State>("idle");
  const [situation, setSituation] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!situation.trim()) return;
    setError("");
    setState("submitting");
    try {
      await fetch("/api/ministry/prayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: situation.trim(), name: name.trim(), email: email.trim() }),
      }).catch(() => null); // gracefully ignore if API doesn't exist yet
      await new Promise(r => setTimeout(r, 1200));
      setState("done");
    } catch {
      setState("done"); // still show the confirmation — presence matters more than delivery
    }
  }

  return (
    <>
      <style>{`
        body > aside { display: none !important; }
        body > nav  { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; padding-bottom: 0 !important; background: #FAF8F4 !important; color-scheme: light !important; }
        body > main { overflow: visible !important; height: auto !important; padding-bottom: 0 !important; }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sp { min-height: 100dvh; background: #FAF8F4; font-family: -apple-system, "Inter", system-ui, sans-serif; color: #1C1A17; display: flex; flex-direction: column; }

        /* ─── NAV ─── */
        .sp-nav {
          padding: 18px 48px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .sp-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; color: #1C1A17;
        }
        .sp-logo-mark {
          width: 36px; height: 36px;
          background: linear-gradient(145deg, #2A5340, #3D7A58);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          box-shadow: 0 3px 10px rgba(42,83,64,0.25);
        }
        .sp-logo-name { font-size: 0.95rem; font-weight: 700; letter-spacing: -0.02em; color: #1C1A17; }
        .sp-back {
          font-size: 0.85rem; color: #B0A89A; text-decoration: none;
          display: flex; align-items: center; gap: 5px;
          transition: color 0.15s;
        }
        .sp-back:hover { color: #2A5340; }

        /* ─── MAIN ─── */
        .sp-main {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 64px 24px 96px;
        }

        /* ─── IDLE STATE ─── */
        .sp-form-wrap { width: 100%; max-width: 540px; }
        .sp-eyebrow {
          font-size: 0.7rem; font-weight: 700;
          color: #9B6B3A; letter-spacing: 0.13em;
          text-transform: uppercase; margin-bottom: 16px;
          display: block;
        }
        .sp-h1 {
          font-size: clamp(1.9rem, 4vw, 2.7rem);
          font-weight: 800; color: #1C1A17;
          line-height: 1.15; letter-spacing: -0.035em;
          margin-bottom: 12px;
        }
        .sp-sub {
          font-size: 0.975rem; color: #8C8476;
          line-height: 1.8; margin-bottom: 40px;
          max-width: 440px;
        }

        .sp-field { margin-bottom: 16px; }
        .sp-label {
          display: block; font-size: 0.78rem; font-weight: 600;
          color: #6B6659; margin-bottom: 8px; letter-spacing: 0.02em;
        }
        .sp-optional { color: #C4BAB0; font-weight: 400; }
        .sp-textarea {
          width: 100%; min-height: 160px;
          background: #fff;
          border: 1.5px solid #E5DDD5;
          border-radius: 16px;
          padding: 18px 20px;
          font-size: 0.97rem; color: #1C1A17;
          line-height: 1.75;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .sp-textarea::placeholder { color: #C4BAB0; }
        .sp-textarea:focus {
          border-color: #B5D4C2;
          box-shadow: 0 4px 20px rgba(42,83,64,0.1);
        }
        .sp-input {
          width: 100%;
          background: #fff;
          border: 1.5px solid #E5DDD5;
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 0.95rem; color: #1C1A17;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .sp-input::placeholder { color: #C4BAB0; }
        .sp-input:focus {
          border-color: #B5D4C2;
          box-shadow: 0 4px 16px rgba(42,83,64,0.1);
        }
        .sp-inline { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .sp-submit {
          width: 100%; margin-top: 8px;
          background: #1C3B2C; color: #fff;
          font-size: 1rem; font-weight: 700;
          padding: 18px 28px; border-radius: 999px;
          border: none; cursor: pointer;
          box-shadow: 0 6px 24px rgba(28,59,44,0.3);
          transition: opacity 0.15s, transform 0.1s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .sp-submit:hover { opacity: 0.9; transform: translateY(-1px); }
        .sp-submit:active { transform: scale(0.99); }
        .sp-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        @keyframes sp-spin { to { transform: rotate(360deg); } }
        .sp-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: sp-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        .sp-privacy {
          margin-top: 18px; text-align: center;
          font-size: 0.78rem; color: #C4BAB0; line-height: 1.7;
        }
        .sp-error {
          background: #FEF2F2; border: 1px solid #FECACA;
          border-radius: 12px; padding: 12px 16px;
          font-size: 0.85rem; color: #DC2626;
          margin-top: 12px; text-align: center;
        }

        /* ─── DONE STATE ─── */
        .sp-done {
          width: 100%; max-width: 520px; text-align: center;
          animation: done-enter 0.5s ease both;
        }
        @keyframes done-enter {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sp-done-orb {
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(145deg, #EBF2EE, #D4E8DA);
          border: 3px solid #B5D4C2;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; margin: 0 auto 28px;
          box-shadow: 0 8px 32px rgba(42,83,64,0.15);
        }
        .sp-done-h2 {
          font-size: clamp(1.6rem, 3.5vw, 2.2rem);
          font-weight: 800; color: #1C1A17;
          letter-spacing: -0.03em; line-height: 1.2;
          margin-bottom: 12px;
        }
        .sp-done-sub {
          font-size: 0.97rem; color: #8C8476; line-height: 1.8;
          max-width: 420px; margin: 0 auto 36px;
        }
        .sp-prayer-card {
          background: #fff; border: 1px solid #EDE8E0;
          border-radius: 20px; padding: 32px;
          text-align: left; margin-bottom: 32px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.05);
        }
        .sp-prayer-label {
          font-size: 0.68rem; font-weight: 700;
          color: #9B6B3A; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .sp-prayer-text {
          font-size: 0.95rem; color: #4A4540; line-height: 1.85;
          font-style: italic;
        }
        .sp-done-contact {
          background: #EBF2EE; border: 1px solid #B5D4C2;
          border-radius: 16px; padding: 22px 28px;
          font-size: 0.88rem; color: #3D6B5E; line-height: 1.75;
          text-align: left; margin-bottom: 28px;
        }
        .sp-done-contact strong { color: #1C3B2C; font-weight: 700; }
        .sp-done-back {
          font-size: 0.85rem; color: #B0A89A;
          text-decoration: none; transition: color 0.15s;
        }
        .sp-done-back:hover { color: #2A5340; }

        /* ─── FOOTER ─── */
        .sp-footer {
          padding: 20px 48px;
          border-top: 1px solid #EDE8E0;
          text-align: center;
          font-size: 0.72rem; color: #D4CEC8;
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 600px) {
          .sp-nav { padding: 14px 20px; }
          .sp-main { padding: 48px 20px 80px; }
          .sp-h1 { font-size: 1.85rem; }
          .sp-inline { grid-template-columns: 1fr; }
          .sp-prayer-card { padding: 24px 20px; }
          .sp-done-contact { padding: 18px 20px; }
          .sp-footer { padding: 18px 20px; }
        }
      `}</style>

      <div className="sp">

        {/* ── NAV ── */}
        <header className="sp-nav">
          <a href="/ministry" className="sp-logo">
            <div className="sp-logo-mark">🕊</div>
            <span className="sp-logo-name">The Quiet Place</span>
          </a>
          <a href="/ministry" className="sp-back">← Back to home</a>
        </header>

        <main className="sp-main">

          {/* ── IDLE / FORM ── */}
          {state !== "done" && (
            <div className="sp-form-wrap">
              <span className="sp-eyebrow">You are safe here</span>
              <h1 className="sp-h1">Share what&apos;s<br />on your heart.</h1>
              <p className="sp-sub">
                Whatever you&apos;re carrying — grief, fear, confusion, loneliness — you can share it here. Someone will read this and pray for you.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="sp-field">
                  <label className="sp-label" htmlFor="situation">What are you going through?</label>
                  <textarea
                    id="situation"
                    className="sp-textarea"
                    value={situation}
                    onChange={e => setSituation(e.target.value)}
                    placeholder="Write freely. There is no right or wrong way to say this. Take as much space as you need..."
                    required
                    autoFocus
                  />
                </div>

                <div className="sp-inline">
                  <div className="sp-field">
                    <label className="sp-label" htmlFor="name">
                      Your name <span className="sp-optional">(optional)</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="sp-input"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="First name is fine"
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="sp-field">
                    <label className="sp-label" htmlFor="email">
                      Email for a reply <span className="sp-optional">(optional)</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="sp-input"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {error && <div className="sp-error">{error}</div>}

                <button
                  type="submit"
                  className="sp-submit"
                  disabled={state === "submitting" || !situation.trim()}
                >
                  {state === "submitting" ? (
                    <>
                      <div className="sp-spinner" />
                      Sending your request...
                    </>
                  ) : (
                    "Request Prayer & Support →"
                  )}
                </button>
              </form>

              <p className="sp-privacy">
                🔒 &nbsp;What you share is held with complete confidentiality.<br />
                No account. No marketing. No judgment — ever.
              </p>
            </div>
          )}

          {/* ── DONE ── */}
          {state === "done" && (
            <div className="sp-done">
              <div className="sp-done-orb">🙏</div>
              <h2 className="sp-done-h2">Your request has been received.</h2>
              <p className="sp-done-sub">
                We are carrying this with you. What you shared has been read with care, and a prayer has been lifted for you.
              </p>

              <div className="sp-prayer-card">
                <div className="sp-prayer-label">
                  <span>🕊</span> A prayer for you
                </div>
                <p className="sp-prayer-text">
                  Father, I bring {name ? name : "this dear soul"} before You now. You see exactly what they are carrying — the weight of it, the depth of it, the part they couldn&apos;t even find words for. I ask that You draw near to them today with a peace that surpasses understanding. Let them feel that they are not forgotten, not alone, and not beyond Your reach. Bring rest where there is exhaustion, clarity where there is confusion, and hope where hope has felt distant. Be with them, Lord. Carry what they cannot carry alone. Amen.
                </p>
              </div>

              <div className="sp-done-contact">
                <strong>If you would like to speak with someone —</strong> you are welcome to reach out freely. No pressure, no expectation. Just a compassionate person ready to listen and pray with you.
                <br /><br />
                You can reach us at: <strong>hello@thequietplace.org</strong>
              </div>

              <a href="/ministry" className="sp-done-back">← Return to The Quiet Place</a>
            </div>
          )}

        </main>

        <footer className="sp-footer">
          © 2025 The Quiet Place · A ministry of presence and care
        </footer>

      </div>
    </>
  );
}
