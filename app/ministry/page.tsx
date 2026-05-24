export default function MinistryHomePage() {
  return (
    <>
      <style>{`
        body > aside { display: none !important; }
        body > nav  { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; padding-bottom: 0 !important; background: #FAF8F4 !important; color-scheme: light !important; }
        body > main { overflow: visible !important; height: auto !important; padding-bottom: 0 !important; }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .mn { min-height: 100dvh; background: #FAF8F4; font-family: -apple-system, "Inter", system-ui, sans-serif; color: #1C1A17; }

        /* ─── NAV ─── */
        .mn-nav {
          padding: 18px 56px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          background: rgba(250,248,244,0.95);
          backdrop-filter: blur(10px);
          position: sticky; top: 0; z-index: 100;
        }
        .mn-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; color: #1C1A17;
        }
        .mn-logo-mark {
          width: 38px; height: 38px;
          background: linear-gradient(145deg, #2A5340, #3D7A58);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.15rem;
          box-shadow: 0 4px 14px rgba(42,83,64,0.28);
        }
        .mn-logo-name { font-size: 0.98rem; font-weight: 700; letter-spacing: -0.02em; color: #1C1A17; }
        .mn-nav-links { display: flex; align-items: center; gap: 36px; }
        .mn-nav-link {
          font-size: 0.875rem; font-weight: 500; color: #8C8476;
          text-decoration: none; transition: color 0.15s;
        }
        .mn-nav-link:hover { color: #2A5340; }
        .mn-nav-cta {
          background: #1C3B2C; color: #fff;
          font-size: 0.875rem; font-weight: 600;
          padding: 11px 24px; border-radius: 999px;
          text-decoration: none;
          box-shadow: 0 3px 12px rgba(42,83,64,0.32);
          transition: opacity 0.15s, transform 0.1s;
        }
        .mn-nav-cta:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ─── HERO ─── */
        .mn-hero {
          position: relative;
          min-height: 660px;
          display: flex; align-items: center; justify-content: center;
          padding: 100px 56px 80px;
          overflow: visible;
        }
        .mn-hero-content {
          text-align: center;
          max-width: 580px;
          position: relative; z-index: 2;
        }
        .mn-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: #EBF2EE; border: 1px solid #B5D4C2;
          border-radius: 999px; padding: 7px 16px;
          font-size: 0.7rem; font-weight: 700;
          color: #2A5340; letter-spacing: 0.12em;
          text-transform: uppercase; margin-bottom: 30px;
        }
        .mn-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #2A5340; flex-shrink: 0; }
        .mn-h1 {
          font-size: clamp(2.4rem, 5.5vw, 4rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.04em;
          color: #1C1A17;
          margin: 0 0 8px;
        }
        .mn-h1-accent {
          position: relative;
          display: inline-block;
          background: linear-gradient(180deg, transparent 62%, rgba(155,107,58,0.22) 62%);
          padding: 0 3px;
        }
        .mn-sub {
          font-size: clamp(1rem, 2vw, 1.12rem);
          color: #8C8476;
          line-height: 1.8;
          margin: 20px auto 44px;
          max-width: 440px;
        }
        .mn-ctas { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }
        .mn-cta-primary {
          background: #1C3B2C; color: #fff;
          font-weight: 700; font-size: 0.95rem;
          padding: 17px 36px; border-radius: 999px;
          text-decoration: none;
          box-shadow: 0 6px 28px rgba(28,59,44,0.32);
          transition: opacity 0.15s, transform 0.1s;
          display: inline-block;
        }
        .mn-cta-primary:hover { opacity: 0.9; transform: translateY(-2px); }
        .mn-cta-secondary {
          background: transparent; color: #2A5340;
          font-weight: 600; font-size: 0.95rem;
          padding: 16px 30px; border-radius: 999px;
          text-decoration: none;
          border: 1.5px solid #B5D4C2;
          transition: all 0.15s;
        }
        .mn-cta-secondary:hover { background: #EBF2EE; border-color: #2A5340; }

        /* ─── BUBBLES ─── */
        .mn-bubble {
          position: absolute;
          display: flex; flex-direction: column;
          align-items: center; gap: 9px;
          z-index: 1;
          pointer-events: none;
        }
        .mn-bubble-circle {
          width: 72px; height: 72px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.7rem;
          box-shadow: 0 8px 30px rgba(0,0,0,0.09), 0 0 0 3px rgba(255,255,255,0.85);
        }
        .mn-bubble-tag {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 999px;
          padding: 5px 13px;
          font-size: 0.69rem;
          font-weight: 600;
          color: #8C8476;
          white-space: nowrap;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        @keyframes float-a { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes float-b { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes float-c { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        /* Positioned well within the hero so nothing clips */
        .mn-b1 { top: 90px; left: 9%; animation: float-a 6.2s ease-in-out infinite; }
        .mn-b2 { top: 90px; right: 9%; animation: float-b 5.8s ease-in-out infinite; animation-delay: -1.4s; }
        .mn-b3 { top: 50%; left: 5%; transform: translateY(-60%); animation: float-c 7s ease-in-out infinite; animation-delay: -2.1s; }
        .mn-b4 { top: 50%; right: 5%; transform: translateY(-60%); animation: float-a 6.5s ease-in-out infinite; animation-delay: -3s; }
        .mn-b5 { bottom: 80px; left: 11%; animation: float-b 5.6s ease-in-out infinite; animation-delay: -0.8s; }
        .mn-b6 { bottom: 80px; right: 11%; animation: float-c 6.8s ease-in-out infinite; animation-delay: -4s; }

        /* ─── TRUST BAR ─── */
        .mn-trust {
          background: #fff;
          border-top: 1px solid #EDE8E0; border-bottom: 1px solid #EDE8E0;
          padding: 22px 56px;
          display: flex; align-items: center; justify-content: center;
          gap: 52px; flex-wrap: wrap;
        }
        .mn-trust-item {
          display: flex; align-items: center; gap: 9px;
          font-size: 0.845rem; font-weight: 600; color: #6B6659;
        }
        .mn-trust-dot { width: 6px; height: 6px; border-radius: 50%; background: #2A5340; flex-shrink: 0; }

        /* ─── HOW IT WORKS ─── */
        .mn-how { padding: 100px 56px; text-align: center; }
        .mn-section-eye {
          display: inline-block;
          font-size: 0.7rem; font-weight: 700;
          color: #9B6B3A; letter-spacing: 0.13em;
          text-transform: uppercase; margin-bottom: 16px;
        }
        .mn-section-h2 {
          font-size: clamp(1.8rem, 3.5vw, 2.7rem);
          font-weight: 800; color: #1C1A17;
          line-height: 1.18; letter-spacing: -0.035em;
          margin: 0 0 16px;
        }
        .mn-section-sub {
          font-size: 1rem; color: #8C8476;
          line-height: 1.8; max-width: 500px;
          margin: 0 auto 68px;
        }
        .mn-steps {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 28px; max-width: 980px; margin: 0 auto;
        }
        .mn-step-card {
          background: #fff; border: 1px solid #EDE8E0;
          border-radius: 22px; padding: 38px 32px;
          text-align: left; position: relative; overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .mn-step-card:hover { transform: translateY(-5px); box-shadow: 0 18px 52px rgba(0,0,0,0.08); }
        .mn-step-num {
          position: absolute; top: 22px; right: 22px;
          font-size: 3.2rem; font-weight: 900;
          color: #F0EDE8; line-height: 1; letter-spacing: -0.06em;
          user-select: none;
        }
        .mn-step-icon {
          width: 50px; height: 50px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.45rem; margin-bottom: 22px;
        }
        .mn-step-h3 { font-size: 1.05rem; font-weight: 700; color: #1C1A17; margin: 0 0 10px; letter-spacing: -0.02em; }
        .mn-step-p { font-size: 0.875rem; color: #8C8476; line-height: 1.75; }

        /* ─── TESTIMONIALS ─── */
        .mn-testimonials { padding: 0 56px 100px; }
        .mn-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 980px; margin: 0 auto; }
        .mn-testi-card {
          background: #fff; border: 1px solid #EDE8E0;
          border-radius: 18px; padding: 28px;
        }
        .mn-testi-quote { font-size: 0.9rem; color: #4A4540; line-height: 1.8; margin-bottom: 20px; font-style: italic; }
        .mn-testi-author { display: flex; align-items: center; gap: 10px; }
        .mn-testi-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; flex-shrink: 0;
        }
        .mn-testi-name { font-size: 0.8rem; font-weight: 700; color: #1C1A17; }
        .mn-testi-sub { font-size: 0.72rem; color: #B0A89A; }

        /* ─── SCRIPTURE ─── */
        .mn-scripture {
          background: #1C3B2C;
          padding: 88px 56px;
          text-align: center;
        }
        .mn-scripture-mark {
          font-size: 3rem; opacity: 0.2; line-height: 1;
          margin-bottom: 20px; color: #fff;
        }
        .mn-scripture-quote {
          font-size: clamp(1.2rem, 2.8vw, 1.9rem);
          font-weight: 400; color: rgba(255,255,255,0.9);
          line-height: 1.65; max-width: 640px;
          margin: 0 auto 24px;
          font-style: italic; letter-spacing: -0.01em;
        }
        .mn-scripture-ref {
          font-size: 0.78rem; font-weight: 700;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.1em; text-transform: uppercase;
        }

        /* ─── FINAL CTA ─── */
        .mn-final { padding: 100px 56px; text-align: center; }
        .mn-final-inner {
          max-width: 600px; margin: 0 auto;
          background: #fff; border: 1px solid #EDE8E0;
          border-radius: 28px; padding: 64px 56px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.05);
        }
        .mn-final-icon { font-size: 2.8rem; margin-bottom: 24px; display: block; }
        .mn-final-h2 {
          font-size: clamp(1.7rem, 3.5vw, 2.4rem);
          font-weight: 800; color: #1C1A17;
          letter-spacing: -0.03em; line-height: 1.2; margin: 0 0 14px;
        }
        .mn-final-p {
          font-size: 0.97rem; color: #8C8476;
          line-height: 1.85; max-width: 400px;
          margin: 0 auto 36px;
        }
        .mn-final-note {
          margin-top: 20px;
          font-size: 0.78rem; color: #C4BAB0; line-height: 1.6;
        }

        /* ─── FOOTER ─── */
        .mn-footer {
          border-top: 1px solid #EDE8E0;
          padding: 28px 56px;
          display: flex; align-items: center;
          justify-content: space-between;
        }
        .mn-footer-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .mn-footer-logo-mark {
          width: 26px; height: 26px; border-radius: 7px;
          background: linear-gradient(145deg, #2A5340, #3D7A58);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem;
        }
        .mn-footer-logo-name { font-size: 0.82rem; font-weight: 700; color: #8C8476; }
        .mn-footer-links { display: flex; gap: 24px; }
        .mn-footer-link { font-size: 0.78rem; color: #B0A89A; text-decoration: none; transition: color 0.15s; }
        .mn-footer-link:hover { color: #2A5340; }
        .mn-footer-copy { font-size: 0.72rem; color: #C4BAB0; }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 900px) {
          .mn-nav { padding: 16px 28px; }
          .mn-nav-links { display: none; }
          .mn-hero { min-height: 560px; padding: 80px 28px 70px; }
          .mn-b3, .mn-b4 { display: none; }
          .mn-b1 { top: 56px; left: 5%; }
          .mn-b2 { top: 56px; right: 5%; }
          .mn-b5 { bottom: 50px; left: 5%; }
          .mn-b6 { bottom: 50px; right: 5%; }
          .mn-trust { padding: 20px 28px; gap: 28px; }
          .mn-how { padding: 72px 28px; }
          .mn-steps { grid-template-columns: 1fr; gap: 18px; max-width: 440px; }
          .mn-testimonials { padding: 0 28px 72px; }
          .mn-testi-grid { grid-template-columns: 1fr; max-width: 440px; }
          .mn-scripture { padding: 64px 28px; }
          .mn-final { padding: 72px 28px; }
          .mn-final-inner { padding: 44px 32px; }
          .mn-footer { padding: 24px 28px; flex-direction: column; gap: 16px; text-align: center; }
          .mn-footer-links { justify-content: center; }
        }
        @media (max-width: 520px) {
          .mn-bubble-circle { width: 58px; height: 58px; font-size: 1.35rem; }
          .mn-bubble-tag { font-size: 0.63rem; padding: 4px 10px; }
          .mn-b1 { top: 36px; left: 3%; }
          .mn-b2 { top: 36px; right: 3%; }
          .mn-b5 { bottom: 28px; left: 3%; }
          .mn-b6 { bottom: 28px; right: 3%; }
          .mn-hero { padding: 70px 20px 60px; }
          .mn-trust { gap: 18px; padding: 18px 20px; }
          .mn-trust-item { font-size: 0.78rem; }
        }
        @media (max-width: 380px) {
          .mn-bubble-tag { display: none; }
          .mn-bubble-circle { width: 50px; height: 50px; font-size: 1.15rem; }
          .mn-b1 { top: 24px; left: 2%; }
          .mn-b2 { top: 24px; right: 2%; }
          .mn-b5 { bottom: 20px; left: 2%; }
          .mn-b6 { bottom: 20px; right: 2%; }
        }
      `}</style>

      <div className="mn">

        {/* ── NAV ── */}
        <header className="mn-nav">
          <a href="/ministry" className="mn-logo">
            <div className="mn-logo-mark">🕊</div>
            <span className="mn-logo-name">The Quiet Place</span>
          </a>
          <div className="mn-nav-links">
            <a href="#how" className="mn-nav-link">How it works</a>
            <a href="#prayer" className="mn-nav-link">Prayer</a>
            <a href="#stories" className="mn-nav-link">Stories</a>
          </div>
          <a href="/ministry/start" className="mn-nav-cta">Find Support</a>
        </header>

        {/* ── HERO ── */}
        <section className="mn-hero">

          {/* Bubbles — fully inside the section, never clipped */}
          <div className="mn-bubble mn-b1">
            <div className="mn-bubble-circle" style={{ background: "#F5E8E8" }}>🙏</div>
            <div className="mn-bubble-tag">Found peace</div>
          </div>
          <div className="mn-bubble mn-b2">
            <div className="mn-bubble-circle" style={{ background: "#EBF2EE" }}>💚</div>
            <div className="mn-bubble-tag">Not alone</div>
          </div>
          <div className="mn-bubble mn-b3">
            <div className="mn-bubble-circle" style={{ background: "#EDE8F5" }}>✨</div>
            <div className="mn-bubble-tag">New hope</div>
          </div>
          <div className="mn-bubble mn-b4">
            <div className="mn-bubble-circle" style={{ background: "#F5EDE0" }}>🌿</div>
            <div className="mn-bubble-tag">Healing</div>
          </div>
          <div className="mn-bubble mn-b5">
            <div className="mn-bubble-circle" style={{ background: "#E8EFF5" }}>🌅</div>
            <div className="mn-bubble-tag">Felt heard</div>
          </div>
          <div className="mn-bubble mn-b6">
            <div className="mn-bubble-circle" style={{ background: "#FEF6E8" }}>🕊</div>
            <div className="mn-bubble-tag">Carried through</div>
          </div>

          <div className="mn-hero-content">
            <div className="mn-badge">
              <div className="mn-badge-dot" />
              A Ministry of Presence
            </div>
            <h1 className="mn-h1">
              You don&apos;t have to<br />
              carry this <span className="mn-h1-accent">alone</span>.
            </h1>
            <p className="mn-sub">
              A quiet place for prayer, encouragement, and compassionate support — freely available to anyone who needs it.
            </p>
            <div className="mn-ctas">
              <a href="/ministry/start" className="mn-cta-primary">Find Support →</a>
              <a href="/ministry/start" className="mn-cta-secondary">Request Prayer</a>
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <div className="mn-trust">
          {["Completely free", "Confidential", "No judgment", "No agenda", "Spiritually grounded"].map(item => (
            <div key={item} className="mn-trust-item">
              <div className="mn-trust-dot" />
              {item}
            </div>
          ))}
        </div>

        {/* ── HOW IT WORKS ── */}
        <section className="mn-how" id="how">
          <span className="mn-section-eye">A gentle path</span>
          <h2 className="mn-section-h2">Safe, quiet, no pressure</h2>
          <p className="mn-section-sub">
            No funnel. No agenda. Just a space to breathe, be understood, and receive care when you need it most.
          </p>
          <div className="mn-steps">
            <div className="mn-step-card">
              <div className="mn-step-num">01</div>
              <div className="mn-step-icon" style={{ background: "#EBF2EE" }}>📖</div>
              <h3 className="mn-step-h3">Share what you&apos;re carrying</h3>
              <p className="mn-step-p">Start by sharing what&apos;s on your heart. Whatever it is — there is no wrong answer, no prerequisite, and no judgment.</p>
            </div>
            <div className="mn-step-card">
              <div className="mn-step-num">02</div>
              <div className="mn-step-icon" style={{ background: "#F5EDE0" }}>🙏</div>
              <h3 className="mn-step-h3">Receive prayer & encouragement</h3>
              <p className="mn-step-p">Read encouragement grounded in faith and care. Receive prayer. Feel seen and accompanied — not lectured, not rushed.</p>
            </div>
            <div className="mn-step-card">
              <div className="mn-step-num">03</div>
              <div className="mn-step-icon" style={{ background: "#E8EFF5" }}>💬</div>
              <h3 className="mn-step-h3">Speak with someone</h3>
              <p className="mn-step-p">If you&apos;d like someone to talk and pray with, you can reach out freely. No pressure — just a compassionate person ready to listen.</p>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="mn-testimonials" id="stories">
          <div className="mn-testi-grid">
            <div className="mn-testi-card">
              <p className="mn-testi-quote">&ldquo;I didn&apos;t know what I was looking for. I just knew I couldn&apos;t keep going the way I was. This place was the first thing that made me feel like someone actually cared.&rdquo;</p>
              <div className="mn-testi-author">
                <div className="mn-testi-avatar" style={{ background: "#F5E8E8" }}>🌸</div>
                <div>
                  <div className="mn-testi-name">M. O.</div>
                  <div className="mn-testi-sub">Found hope during a hard season</div>
                </div>
              </div>
            </div>
            <div className="mn-testi-card">
              <p className="mn-testi-quote">&ldquo;I&apos;ve been through things I never talked about with anyone. For the first time, I felt heard without being judged. The prayer meant more than I expected.&rdquo;</p>
              <div className="mn-testi-author">
                <div className="mn-testi-avatar" style={{ background: "#EBF2EE" }}>🌿</div>
                <div>
                  <div className="mn-testi-name">J. A.</div>
                  <div className="mn-testi-sub">Processing grief and loss</div>
                </div>
              </div>
            </div>
            <div className="mn-testi-card">
              <p className="mn-testi-quote">&ldquo;I was skeptical. But this is different. No selling, no pressure — just someone genuinely present with me. I came back every week for a month.&rdquo;</p>
              <div className="mn-testi-author">
                <div className="mn-testi-avatar" style={{ background: "#EDE8F5" }}>✨</div>
                <div>
                  <div className="mn-testi-name">D. K.</div>
                  <div className="mn-testi-sub">Rediscovering faith</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SCRIPTURE ── */}
        <section className="mn-scripture" id="prayer">
          <div className="mn-scripture-mark">&ldquo;</div>
          <p className="mn-scripture-quote">
            Come to me, all who are weary and burdened,<br />and I will give you rest.
          </p>
          <p className="mn-scripture-ref">Matthew 11:28</p>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="mn-final">
          <div className="mn-final-inner">
            <span className="mn-final-icon">🕊</span>
            <h2 className="mn-final-h2">Something brought you here today.</h2>
            <p className="mn-final-p">
              You don&apos;t need the right words, the right faith, or the right circumstances. Come as you are. We&apos;re here.
            </p>
            <a href="/ministry/start" className="mn-cta-primary" style={{ fontSize: "1rem", padding: "18px 44px" }}>
              Find Support — It&apos;s Free →
            </a>
            <p className="mn-final-note">No account needed · Completely confidential · Available now</p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="mn-footer">
          <a href="/ministry" className="mn-footer-logo">
            <div className="mn-footer-logo-mark">🕊</div>
            <span className="mn-footer-logo-name">The Quiet Place</span>
          </a>
          <div className="mn-footer-links">
            <a href="#" className="mn-footer-link">Privacy</a>
            <a href="#how" className="mn-footer-link">About</a>
            <a href="/ministry/start" className="mn-footer-link">Request Prayer</a>
          </div>
          <span className="mn-footer-copy">© 2025 · A ministry of presence and care</span>
        </footer>

      </div>
    </>
  );
}
