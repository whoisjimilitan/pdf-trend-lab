import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Seeds — Plant once. Harvest every month.",
  description: "Find the fields nobody has planted yet. Build the guide in minutes. Earn every month — automatically.",
};

const STRIPE = "https://buy.stripe.com/00waEX65Nb838Ce1aP5ZC00";

function CheckIcon() {
  return (
    <span className="lp-check-icon">
      <svg className="lp-check-svg" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="faq-item">
      <summary className="faq-summary">
        <span className="faq-q">{q}</span>
        <span className="faq-plus">+</span>
      </summary>
      <p className="faq-a">{a}</p>
    </details>
  );
}

export default function HomePage() {
  return (
    <>
      <style>{`
        body > aside { display: none !important; }
        body > nav  { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; padding-bottom: 0 !important; }
        body > main { overflow: visible !important; height: auto !important; padding-bottom: 0 !important; }
        * { box-sizing: border-box; }

        .lp { background: #FFFFFF; color: #334155; font-family: system-ui, -apple-system, sans-serif; min-height: 100vh; }

        /* NAV */
        .lp-nav { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.97); backdrop-filter: blur(12px); border-bottom: 1px solid #E2E8F0; padding: 0 24px; }
        .lp-nav-inner { max-width: 1100px; margin: 0 auto; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .lp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .lp-logo-mark { width: 34px; height: 34px; background: #6366F1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .lp-logo-name { font-weight: 800; font-size: 1rem; color: #0F172A; line-height: 1.1; }
        .lp-logo-sub { font-size: 0.6rem; color: #94A3B8; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
        .lp-nav-right { display: flex; align-items: center; gap: 12px; }
        .lp-nav-link { font-size: 0.85rem; color: #64748B; text-decoration: none; }
        .lp-nav-link:hover { color: #0F172A; }
        .lp-nav-cta { background: #6366F1; color: #fff; font-weight: 700; font-size: 0.85rem; padding: 9px 20px; border-radius: 8px; text-decoration: none; }
        .lp-nav-cta:hover { background: #4F46E5; }

        /* HERO */
        .lp-hero { padding: 96px 24px 80px; text-align: center; position: relative; overflow: hidden; }
        .lp-hero-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% -10%, rgba(99,102,241,0.09) 0%, transparent 65%); pointer-events: none; }
        .lp-hero-inner { max-width: 720px; margin: 0 auto; position: relative; z-index: 1; }
        .lp-eyebrow { display: inline-flex; align-items: center; gap: 6px; background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 20px; padding: 5px 14px; font-size: 0.78rem; font-weight: 700; color: #4F46E5; margin-bottom: 28px; }
        .lp h1 { font-size: clamp(2.6rem, 6.5vw, 4.4rem); font-weight: 900; line-height: 1.06; color: #0F172A; margin: 0 0 20px; letter-spacing: -0.03em; }
        .lp h1 em { color: #6366F1; font-style: normal; }
        .lp-hero-sub { font-size: 1.05rem; color: #64748B; line-height: 1.75; max-width: 520px; margin: 0 auto 10px; }
        .lp-guarantee { font-size: 0.88rem; color: #16A34A; font-weight: 700; margin: 0 auto 28px; }
        .lp-hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-bottom: 28px; }
        .lp-btn-primary { display: inline-block; background: #6366F1; color: #fff; font-weight: 800; font-size: 0.95rem; padding: 16px 36px; border-radius: 10px; text-decoration: none; }
        .lp-btn-primary:hover { background: #4F46E5; }
        .lp-btn-ghost { display: inline-block; background: transparent; color: #64748B; font-weight: 600; font-size: 0.95rem; padding: 16px 26px; border-radius: 10px; text-decoration: none; border: 1px solid #E2E8F0; }
        .lp-btn-ghost:hover { border-color: #CBD5E1; color: #334155; }
        .lp-hero-flags { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.8rem; color: #94A3B8; }
        .lp-flag-row { display: flex; gap: 4px; }

        /* SECTIONS */
        .lp-section { padding: 72px 24px; }
        .lp-section-alt { background: #F8FAFC; }
        .lp-inner { max-width: 1000px; margin: 0 auto; }
        .lp-inner-narrow { max-width: 700px; margin: 0 auto; }
        .lp-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #94A3B8; margin-bottom: 10px; }
        .lp h2 { font-size: clamp(1.6rem, 3.5vw, 2.3rem); font-weight: 900; color: #0F172A; line-height: 1.15; margin: 0 0 14px; letter-spacing: -0.02em; }
        .lp h2 em { color: #6366F1; font-style: normal; }
        .lp-sub { font-size: 0.97rem; color: #64748B; line-height: 1.75; }

        /* CHECK ICON */
        .lp-check-icon { width: 18px; height: 18px; border-radius: 50%; background: #DCFCE7; border: 1px solid #BBF7D0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
        .lp-check-svg { width: 10px; height: 10px; color: #16A34A; }

        /* PROOF STRIP */
        .proof-strip { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; }
        .proof-item { padding: 28px 24px; text-align: center; border-right: 1px solid #E2E8F0; }
        .proof-item:last-child { border-right: none; }
        .proof-num { font-size: 2rem; font-weight: 900; color: #0F172A; letter-spacing: -0.03em; line-height: 1; }
        .proof-label { font-size: 0.78rem; color: #94A3B8; font-weight: 600; margin-top: 5px; }

        /* LAW CARDS — 3 farming principles */
        .law-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 36px; }
        .law-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 28px 22px; }
        .law-icon { font-size: 2rem; margin-bottom: 14px; line-height: 1; }
        .law-title { font-size: 0.97rem; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
        .law-body { font-size: 0.83rem; color: #64748B; line-height: 1.65; }

        /* STEPS */
        .steps-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 40px; }
        .step-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 28px 22px; }
        .step-num { font-size: 2.2rem; font-weight: 900; color: #EEF2FF; line-height: 1; margin-bottom: 14px; }
        .step-title { font-size: 0.97rem; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
        .step-body { font-size: 0.83rem; color: #64748B; line-height: 1.65; }
        .steps-cta { text-align: center; margin-top: 32px; }

        /* DEMO SEED CARD */
        .demo-wrap { margin-top: 40px; }
        .demo-card { background: #0F172A; border-radius: 16px; border: 1px solid #1E293B; padding: 28px 28px; max-width: 680px; margin: 0 auto; }
        .demo-top { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 18px; }
        .demo-score-wrap { text-align: center; flex-shrink: 0; }
        .demo-score { font-size: 2.6rem; font-weight: 900; color: #10B981; line-height: 1; letter-spacing: -0.03em; }
        .demo-score-sub { font-size: 0.65rem; color: #475569; font-weight: 600; margin-top: 2px; }
        .demo-title { font-size: 0.97rem; font-weight: 700; color: #F8FAFC; line-height: 1.45; margin-bottom: 8px; }
        .demo-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .demo-chip { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 6px; }
        .demo-chip-green { background: #10B98118; color: #10B981; border: 1px solid #10B98130; }
        .demo-chip-blue { background: #6366F118; color: #818CF8; border: 1px solid #6366F130; }
        .demo-chip-amber { background: #F59E0B18; color: #F59E0B; border: 1px solid #F59E0B30; }
        .demo-pain { background: #1E293B; border-radius: 10px; padding: 14px 16px; border-left: 3px solid #EF4444; margin-bottom: 14px; }
        .demo-pain-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #EF4444; margin-bottom: 6px; }
        .demo-pain-text { font-size: 0.82rem; color: #94A3B8; line-height: 1.6; }
        .demo-dist { background: #1E293B; border-radius: 10px; padding: 12px 16px; border-left: 3px solid #F59E0B; }
        .demo-dist-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #F59E0B; margin-bottom: 5px; }
        .demo-dist-text { font-size: 0.82rem; color: #94A3B8; line-height: 1.6; }
        .demo-caption { text-align: center; margin-top: 14px; font-size: 0.8rem; color: #64748B; }

        /* SEEDS PREVIEW */
        .seeds-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 36px; }
        .seed-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 22px 18px; }
        .seed-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .seed-badge { font-size: 0.68rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: #DCFCE7; border: 1px solid #BBF7D0; color: #16A34A; }
        .seed-query { font-size: 0.88rem; color: #1E293B; line-height: 1.55; margin: 0 0 12px; font-style: italic; font-weight: 500; }
        .seed-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .seed-chip { font-size: 0.7rem; color: #64748B; background: #F1F5F9; border-radius: 5px; padding: 2px 7px; font-weight: 600; }
        .seed-chip-gap { background: #EEF2FF; color: #4F46E5; }
        .seeds-cta { text-align: center; margin-top: 28px; }

        /* HARVEST MATH */
        .harvest-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 36px; }
        .harvest-card { border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px 16px; text-align: center; background: #FFFFFF; }
        .harvest-card-hi { background: #6366F1; border-color: #6366F1; }
        .harvest-seeds { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 8px; }
        .harvest-card-hi .harvest-seeds { color: rgba(255,255,255,0.55); }
        .harvest-num { font-size: 1.9rem; font-weight: 900; color: #0F172A; letter-spacing: -0.03em; line-height: 1; }
        .harvest-card-hi .harvest-num { color: #FFFFFF; }
        .harvest-sub { font-size: 0.75rem; color: #94A3B8; margin-top: 5px; }
        .harvest-card-hi .harvest-sub { color: rgba(255,255,255,0.5); }
        .harvest-note { text-align: center; font-size: 0.76rem; color: #94A3B8; margin-top: 12px; }

        /* PRICING */
        .pricing-box { max-width: 500px; margin: 0 auto; background: #FFFFFF; border: 2px solid rgba(99,102,241,0.2); border-radius: 20px; padding: 44px 36px; text-align: center; position: relative; overflow: hidden; box-shadow: 0 8px 32px rgba(99,102,241,0.08); }
        .pricing-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 260px; height: 2px; background: linear-gradient(to right, transparent, #6366F1, transparent); }
        .pricing-badge { display: inline-block; background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; border-radius: 20px; padding: 4px 14px; font-size: 0.7rem; font-weight: 700; margin-bottom: 18px; letter-spacing: 0.04em; text-transform: uppercase; }
        .pricing-name { font-size: 1rem; font-weight: 800; color: #0F172A; margin-bottom: 4px; }
        .pricing-amount { font-size: 4rem; font-weight: 900; color: #0F172A; line-height: 1; margin-bottom: 4px; letter-spacing: -0.03em; }
        .pricing-amount sup { font-size: 1.5rem; vertical-align: super; font-weight: 700; color: #94A3B8; }
        .pricing-period { font-size: 0.82rem; color: #94A3B8; margin-bottom: 28px; }
        .pricing-list { text-align: left; list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 10px; }
        .pricing-list li { font-size: 0.86rem; color: #475569; display: flex; gap: 10px; align-items: flex-start; }
        .pricing-cta { display: block; background: #6366F1; color: #fff; font-weight: 800; font-size: 0.97rem; padding: 16px; border-radius: 12px; text-decoration: none; margin-bottom: 10px; }
        .pricing-cta:hover { background: #4F46E5; }
        .pricing-scan { display: block; font-size: 0.83rem; color: #6366F1; font-weight: 600; text-decoration: none; margin-bottom: 14px; }
        .pricing-scan:hover { color: #4F46E5; }
        .pricing-ok { font-size: 0.82rem; color: #16A34A; font-weight: 600; margin-bottom: 6px; }
        .pricing-fine { font-size: 0.72rem; color: #94A3B8; }

        /* FAQ */
        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 52px; }
        .faq-item { border-bottom: 1px solid #E2E8F0; }
        .faq-summary { display: flex; align-items: flex-start; justify-content: space-between; padding: 18px 0; cursor: pointer; list-style: none; gap: 14px; }
        .faq-q { font-size: 0.88rem; font-weight: 600; color: #1E293B; line-height: 1.4; }
        .faq-plus { color: #6366F1; font-size: 1.2rem; flex-shrink: 0; transition: transform 0.2s; line-height: 1; }
        details[open] .faq-plus { transform: rotate(45deg); }
        .faq-a { font-size: 0.85rem; color: #64748B; line-height: 1.75; padding-bottom: 18px; margin: 0; }

        /* FOOTER */
        .lp-footer { padding: 28px 24px; border-top: 1px solid #E2E8F0; text-align: center; background: #F8FAFC; }
        .lp-footer p { font-size: 0.75rem; color: #CBD5E1; margin: 0; }
        .lp-footer a { color: #94A3B8; text-decoration: none; }
        .lp-footer a:hover { color: #6366F1; }

        /* MOBILE STICKY */
        .mobile-sticky { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; background: #FFFFFF; border-top: 1px solid #E2E8F0; padding: 10px 16px; box-shadow: 0 -4px 12px rgba(0,0,0,0.06); }
        .mobile-sticky a { display: block; background: #6366F1; color: #fff; font-weight: 800; font-size: 0.88rem; padding: 14px; border-radius: 10px; text-decoration: none; text-align: center; }

        @media (max-width: 768px) {
          .lp h1 { font-size: 2.5rem; }
          .lp h2 { font-size: 1.6rem; }
          .lp-section { padding: 52px 20px; }
          .lp-hero { padding: 72px 20px 60px; }
          .proof-strip { grid-template-columns: 1fr; border-radius: 12px; }
          .proof-item { border-right: none; border-bottom: 1px solid #E2E8F0; }
          .proof-item:last-child { border-bottom: none; }
          .law-grid { grid-template-columns: 1fr; }
          .steps-3 { grid-template-columns: 1fr; }
          .seeds-grid { grid-template-columns: 1fr; }
          .harvest-row { grid-template-columns: repeat(2, 1fr); }
          .faq-grid { grid-template-columns: 1fr; }
          .pricing-box { padding: 32px 22px; }
          .pricing-amount { font-size: 3.2rem; }
          .demo-top { flex-direction: column; gap: 10px; }
          .demo-card { padding: 20px; }
          .mobile-sticky { display: block; }
          body { padding-bottom: 68px !important; }
          .lp-nav-link { display: none; }
        }
      `}</style>

      <div className="lp">

        {/* ── NAV ── */}
        <nav className="lp-nav">
          <div className="lp-nav-inner">
            <a href="/" className="lp-logo">
              <div className="lp-logo-mark">🌱</div>
              <div>
                <div className="lp-logo-name">PDF Seeds</div>
                <div className="lp-logo-sub">Plant. Grow. Harvest.</div>
              </div>
            </a>
            <div className="lp-nav-right">
              <a href="/engine" className="lp-nav-link">Try the engine →</a>
              <a href="/dashboard" className="lp-nav-link">My Farm</a>
              <a href={STRIPE} className="lp-nav-cta">Start Planting →</a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="lp-hero-glow" />
          <div className="lp-hero-inner">
            <div className="lp-eyebrow">🌱 The digital farming system for extra income</div>
            <h1>
              Plant once.<br />
              <em>Harvest every month.</em>
            </h1>
            <p className="lp-hero-sub">
              Find the fields nobody has planted yet — where real demand exists and no guide does.
              Build the PDF in one click. The harvest comes on its own.
            </p>
            <p className="lp-guarantee">✅ First harvest in 7 days — or your first month is free.</p>
            <div className="lp-hero-ctas">
              <a href={STRIPE} className="lp-btn-primary">Start Planting — £39/month →</a>
              <a href="/engine" className="lp-btn-ghost">Scan the field first →</a>
            </div>
            <div className="lp-hero-flags">
              <div className="lp-flag-row">
                {["🇬🇭","🇳🇬","🇰🇪","🇿🇦","🇬🇧","🇺🇸","🇨🇦","🇦🇺"].map((f, i) => <span key={i}>{f}</span>)}
              </div>
              <span style={{ marginLeft: 6 }}>Early planters across 8 markets</span>
            </div>
          </div>
        </section>

        {/* ── PROOF STRIP ── */}
        <section className="lp-section" style={{ paddingTop: 0, paddingBottom: 64 }}>
          <div className="lp-inner">
            <div className="proof-strip">
              {[
                { num: "9",    label: "Markets covered" },
                { num: "7",    label: "Live sources per scan" },
                { num: "£39",  label: "Per month · cancel anytime" },
              ].map((s, i) => (
                <div key={i} className="proof-item">
                  <div className="proof-num">{s.num}</div>
                  <div className="proof-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE THREE LAWS ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
              <div className="lp-label">Why this works</div>
              <h2>Good farming has three laws.<br />We built all three into the system.</h2>
            </div>
            <div className="law-grid">
              {[
                {
                  icon: "🔍",
                  title: "Test the soil before you plant",
                  body: "Most people build something and hope it sells. A real farmer tests the soil first. The engine confirms demand, checks competition, and scores the gap — before you do a single hour of work.",
                },
                {
                  icon: "🌱",
                  title: "Find the empty fields",
                  body: "Planting where everyone else plants means fighting for the same harvest. The engine finds where demand is real and the shelf is empty — the fields nobody has claimed yet.",
                },
                {
                  icon: "🌾",
                  title: "Plant once. Harvest forever.",
                  body: "A good seed doesn't need tending every day. You plant it. It grows. The same guide earns month after month without you ever touching it again.",
                },
              ].map((c, i) => (
                <div key={i} className="law-card">
                  <div className="law-icon">{c.icon}</div>
                  <div className="law-title">{c.title}</div>
                  <div className="law-body">{c.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="lp-section" id="how-it-works">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
              <div className="lp-label">How it works</div>
              <h2>Three steps. One afternoon.</h2>
            </div>
            <div className="steps-3">
              {[
                { num: "01", title: "Scan the field", body: "Pick a market. The engine checks live search data across 7 sources — and returns only the gaps where real demand exists and no quality guide does." },
                { num: "02", title: "Plant your seed", body: "Choose an opportunity. One click generates the complete PDF, sales page, video scripts, and distribution strategy. You write nothing." },
                { num: "03", title: "Let it grow", body: "Share the link once. Buyers find it through search and communities. The same seed earns every month — no maintenance, no clients, no content treadmill." },
              ].map((s, i) => (
                <div key={i} className="step-card">
                  <div className="step-num">{s.num}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-body">{s.body}</div>
                </div>
              ))}
            </div>
            <div className="steps-cta">
              <a href="/engine" className="lp-btn-ghost">Watch the engine find live seeds →</a>
            </div>
          </div>
        </section>

        {/* ── LIVE SEED DEMO ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto" }}>
              <div className="lp-label">Proof of the harvest</div>
              <h2>This is what the engine just found.<br /><em>This field is empty.</em></h2>
              <p className="lp-sub" style={{ marginTop: 10 }}>One unplanted seed. Real demand. Zero competition. Ready to build.</p>
            </div>
            <div className="demo-wrap">
              <div className="demo-card">
                <div className="demo-top">
                  <div className="demo-score-wrap">
                    <div className="demo-score">94</div>
                    <div className="demo-score-sub">/100 score</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="demo-title">
                      How to Renew Your Nigerian Passport from the UK — Every Document, Every Step, Every Fee in 2026
                    </div>
                    <div className="demo-chips">
                      <span className="demo-chip demo-chip-green">2,900 searches/month</span>
                      <span className="demo-chip demo-chip-blue">empty shelf · gap: 90</span>
                      <span className="demo-chip demo-chip-amber">✈️ Diaspora · £9.99–£19.99</span>
                    </div>
                  </div>
                </div>
                <div className="demo-pain">
                  <div className="demo-pain-label">The pain this guide resolves</div>
                  <div className="demo-pain-text">
                    Nigerians living in the UK who need to renew their passport are navigating a confusing process with no clear guide — wrong appointment slots, missing documents, embassy delays, and no one to call who actually knows the current procedure. The moment they hold a complete, correct application with no surprises is the moment they&apos;d pay £12 without hesitation.
                  </div>
                </div>
                <div className="demo-dist">
                  <div className="demo-dist-label">Where to plant this</div>
                  <div className="demo-dist-text">
                    Primary: Facebook groups for Nigerians in the UK — post a PSA-format short video showing the common mistake. Secondary: TikTok/Reels with the hook &ldquo;If you booked the wrong embassy appointment, you lose your fee AND your slot.&rdquo; Feeder: free 1-page checklist of documents needed.
                  </div>
                </div>
              </div>
              <p className="demo-caption">
                Opportunities like this are live in the engine right now — scored, ranked, and ready to build.
              </p>
            </div>
          </div>
        </section>

        {/* ── SEEDS FOUND ── */}
        <section className="lp-section">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
              <div className="lp-label">Unplanted fields</div>
              <h2>Real demand. Empty shelves.<br />Nobody has planted here yet.</h2>
            </div>
            <div className="seeds-grid">
              {[
                { flag: "🇳🇬", market: "Nigeria",     query: "How to register a business in Nigeria step by step",               volume: "6,800/mo", gap: "empty shelf · 78" },
                { flag: "🇰🇪", market: "Kenya",       query: "How to start a small poultry farm in Kenya with little money",       volume: "3,600/mo", gap: "empty shelf · 82" },
                { flag: "🇬🇧", market: "UK Diaspora", query: "How to renew a Ghanaian passport from the UK",                       volume: "2,400/mo", gap: "empty shelf · 90" },
              ].map((s, i) => (
                <div key={i} className="seed-card">
                  <div className="seed-header">
                    <span style={{ fontSize: "1.3rem" }}>{s.flag}</span>
                    <span className="seed-badge">unplanted</span>
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#94A3B8", fontWeight: 600, marginBottom: 8 }}>{s.market}</div>
                  <div className="seed-query">&ldquo;{s.query}&rdquo;</div>
                  <div className="seed-chips">
                    <span className="seed-chip">{s.volume}</span>
                    <span className="seed-chip seed-chip-gap">{s.gap}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="seeds-cta">
              <a href="/engine" className="lp-btn-primary">Find your first seed →</a>
              <p style={{ fontSize: "0.76rem", color: "#CBD5E1", marginTop: 10 }}>
                The engine scores every field for real demand, shelf gap, and PDF fit — before you plant.
              </p>
            </div>
          </div>
        </section>

        {/* ── HARVEST MATH ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
              <div className="lp-label">The harvest</div>
              <h2>One seed earns. Ten seeds compound.</h2>
              <p className="lp-sub" style={{ marginTop: 10, fontSize: "0.9rem" }}>
                Each guide runs independently. Plant more when the first one earns back the cost.
              </p>
            </div>
            <div className="harvest-row">
              {[
                { seeds: "1 seed",   monthly: "£240" },
                { seeds: "3 seeds",  monthly: "£720" },
                { seeds: "5 seeds",  monthly: "£1,200" },
                { seeds: "10 seeds", monthly: "£2,400", hi: true },
              ].map((r, i) => (
                <div key={i} className={`harvest-card${r.hi ? " harvest-card-hi" : ""}`}>
                  <div className="harvest-seeds">{r.seeds}</div>
                  <div className="harvest-num">{r.monthly}</div>
                  <div className="harvest-sub">per month</div>
                </div>
              ))}
            </div>
            <p className="harvest-note">Illustrative averages — some seeds earn more, some less. All compound.</p>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="lp-section" id="start">
          <div className="lp-inner" style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="lp-label">Your farm</div>
            <h2>Full farm access.<br />One simple price.</h2>
          </div>
          <div className="pricing-box">
            <div className="pricing-glow" />
            <div className="pricing-badge">🌱 Founding Farmer Pricing</div>
            <div className="pricing-name">PDF Seeds — Full Access</div>
            <div className="pricing-amount"><sup>£</sup>39</div>
            <div className="pricing-period">per month · cancel anytime</div>
            <ul className="pricing-list">
              {[
                "Field scanner finds real, underserved demand — so you only plant in fertile soil",
                "One click builds the complete guide, sales page, and video scripts — you write nothing",
                "Gap scoring shows you exactly which shelves are empty before you commit",
                "One dashboard — every seed, every harvest, all in one place",
              ].map((item, i) => (
                <li key={i}><CheckIcon />{item}</li>
              ))}
            </ul>
            <a href={STRIPE} className="pricing-cta">Start Planting — £39/month →</a>
            <a href="/engine" className="pricing-scan">Scan the field first (free) →</a>
            <div className="pricing-ok">✅ First harvest in 7 days — or your first month is free.</div>
            <div className="pricing-fine">30-day money-back guarantee · No questions asked · Cancel anytime</div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="lp-section lp-section-alt" id="faq">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div className="lp-label">Before you plant</div>
              <h2>Your questions, answered honestly.</h2>
            </div>
            <div className="faq-grid">
              <div>
                <FaqItem
                  q="I've tried online income things before. How is this different?"
                  a="Most attempts fail because you build without confirmed demand. The engine tests the soil before you plant — real search data, scored for pain and market gap. You never build blind."
                />
                <FaqItem
                  q="Do I need to write anything?"
                  a="Nothing. The engine finds the seed. AI builds the guide, sales page, and video scripts. You choose the topic and share the link."
                />
                <FaqItem
                  q="Do I need an audience or following?"
                  a="No. Buyers find the guide through search and communities — they're already looking for the answer. The PDF sells on the strength of the topic, not your name."
                />
              </div>
              <div>
                <FaqItem
                  q="How long before I see results?"
                  a="Most planters share their first link within a day. Sales typically follow within 3–7 days once the guide reaches the right community. If not — refund, no questions."
                />
                <FaqItem
                  q="Is £39/month worth it?"
                  a="One seed returning £240/month is 6× your subscription. The engine tells you whether the gap exists before you invest a single hour — so you're never planting in flooded ground."
                />
                <FaqItem
                  q="What if the guide doesn't sell?"
                  a="Plant within 7 days. If it doesn't earn, email us — refund sent same day. The guarantee is real."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ padding: "80px 24px", background: "#6366F1", textAlign: "center" }}>
          <div style={{ maxWidth: 540, margin: "0 auto" }}>
            <div style={{ fontSize: "2.8rem", marginBottom: 16 }}>🌱</div>
            <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 900, color: "#FFFFFF", margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Ready to plant your first seed?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.97rem", marginBottom: 32, lineHeight: 1.7 }}>
              Every month without a planted seed is a month without a harvest.
              The field scanner is live — start with a free scan.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={STRIPE} style={{ display: "inline-block", background: "#FFFFFF", color: "#6366F1", fontWeight: 800, fontSize: "0.97rem", padding: "16px 36px", borderRadius: "12px", textDecoration: "none" }}>
                Start Planting — £39/month →
              </a>
              <a href="/engine" style={{ display: "inline-block", background: "transparent", color: "#FFFFFF", fontWeight: 600, fontSize: "0.97rem", padding: "16px 24px", borderRadius: "12px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.35)" }}>
                Scan the field first →
              </a>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", marginTop: 20 }}>
              30-day money-back · Cancel anytime · No questions asked
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <p>
            © {new Date().getFullYear()} PDF Seeds · Plant. Grow. Harvest. ·{" "}
            <a href="/engine">Field Scanner</a> ·{" "}
            <a href="/dashboard">My Farm</a> ·{" "}
            <a href="/store">Browse Guides</a>
          </p>
        </footer>

        {/* ── MOBILE STICKY ── */}
        <div className="mobile-sticky">
          <a href={STRIPE}>Start Planting — £39/month →</a>
        </div>

      </div>
    </>
  );
}
