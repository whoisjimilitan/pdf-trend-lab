import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Seeds — Plant once. Harvest every month.",
  description: "Find the fields nobody has planted yet. Build the guide in minutes. Earn every month — automatically.",
};

const STRIPE = "https://buy.stripe.com/00waEX65Nb838Ce1aP5ZC00";

function CheckIcon() {
  return (
    <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#EDE9FE", border: "1px solid #DDD6FE", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
      <svg style={{ width: 10, height: 10, color: "#7C3AED", fill: "currentColor" }} viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details style={{ borderBottom: "1px solid #E5E7EB" }}>
      <summary style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 0", cursor: "pointer", listStyle: "none", gap: 14 }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#111111", lineHeight: 1.45 }}>{q}</span>
        <span style={{ color: "#7C3AED", fontSize: "1.25rem", flexShrink: 0, lineHeight: 1, userSelect: "none" }}>+</span>
      </summary>
      <p style={{ fontSize: "0.87rem", color: "#6B7280", lineHeight: 1.75, paddingBottom: 20, margin: 0 }}>{a}</p>
    </details>
  );
}

function SeedCard({ score, title, volume, gap, flag, market }: {
  score: number; title: string; volume: string; gap: string; flag: string; market: string;
}) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #F3F4F6", borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#10B981", letterSpacing: "-0.02em", lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: "0.58rem", color: "#9CA3AF", fontWeight: 600, marginTop: 1 }}>/100</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
            <span style={{ fontSize: "0.85rem" }}>{flag}</span>
            <span style={{ fontSize: "0.62rem", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{market}</span>
          </div>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#111111", lineHeight: 1.4, marginBottom: 7 }}>{title}</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.62rem", background: "#F0FDF4", color: "#16A34A", borderRadius: 5, padding: "2px 7px", fontWeight: 700, border: "1px solid #DCFCE7" }}>{volume}</span>
            <span style={{ fontSize: "0.62rem", background: "#EDE9FE", color: "#7C3AED", borderRadius: 5, padding: "2px 7px", fontWeight: 700, border: "1px solid #DDD6FE" }}>{gap}</span>
          </div>
        </div>
      </div>
    </div>
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

        .lp {
          background: #F5F4F8;
          color: #374151;
          font-family: -apple-system, "Inter", system-ui, sans-serif;
          min-height: 100vh;
        }

        /* ── NAV — stripped, single focus ── */
        .lp-nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(245,244,248,0.94);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(229,231,235,0.7);
          padding: 0 40px;
        }
        .lp-nav-inner {
          max-width: 1080px; margin: 0 auto;
          height: 64px; display: flex; align-items: center; justify-content: space-between;
        }
        .lp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .lp-logo-mark {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(124,58,237,0.28);
        }
        .lp-logo-name { font-weight: 800; font-size: 0.95rem; color: #111111; }
        .lp-nav-cta {
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff;
          font-weight: 700; font-size: 0.85rem;
          padding: 9px 22px; border-radius: 999px;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(124,58,237,0.3);
          transition: opacity 0.15s;
        }
        .lp-nav-cta:hover { opacity: 0.9; }

        /* ── HERO ── */
        .lp-hero {
          max-width: 1080px; margin: 0 auto;
          padding: 72px 40px 64px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
        }
        .lp-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          background: #EDE9FE; border: 1px solid #DDD6FE;
          border-radius: 999px; padding: 5px 14px;
          font-size: 0.76rem; font-weight: 700; color: #7C3AED;
          margin-bottom: 22px;
        }
        .lp h1 {
          font-size: clamp(2.6rem, 4.5vw, 3.8rem);
          font-weight: 900; line-height: 1.06;
          color: #111111; margin: 0 0 18px;
          letter-spacing: -0.04em;
        }
        .lp h1 em { color: #7C3AED; font-style: normal; }
        .lp-hero-sub {
          font-size: 1rem; color: #6B7280;
          line-height: 1.8; margin: 0 0 8px;
          max-width: 440px;
        }
        .lp-guarantee { font-size: 0.85rem; color: #16A34A; font-weight: 700; margin: 0 0 26px; }
        .lp-hero-ctas { display: flex; gap: 10px; flex-wrap: wrap; }
        .lp-btn-primary {
          display: inline-block;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff; font-weight: 700; font-size: 0.92rem;
          padding: 13px 26px; border-radius: 999px; text-decoration: none;
          box-shadow: 0 4px 20px rgba(124,58,237,0.32);
          transition: opacity 0.15s;
        }
        .lp-btn-primary:hover { opacity: 0.9; }
        .lp-btn-ghost {
          display: inline-block;
          background: #FFFFFF; color: #6B7280;
          font-weight: 600; font-size: 0.88rem;
          padding: 13px 22px; border-radius: 999px; text-decoration: none;
          border: 1.5px solid #E5E7EB;
          transition: border-color 0.15s, color 0.15s;
        }
        .lp-btn-ghost:hover { border-color: #7C3AED; color: #7C3AED; }
        .lp-hero-visual { display: flex; flex-direction: column; gap: 10px; }
        .lp-hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.72rem; font-weight: 700; color: #10B981;
          background: #F0FDF4; border: 1px solid #DCFCE7;
          border-radius: 999px; padding: 4px 12px;
          margin-bottom: 4px; align-self: flex-start;
        }
        .lp-hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10B981; animation: pulse-dot 1.8s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }

        /* ── SHARED SECTION STYLES ── */
        .lp-inner { max-width: 1080px; margin: 0 auto; }
        .lp-section { padding: 80px 40px; }
        .lp-section-white { background: #FFFFFF; }
        .lp-label {
          font-size: 0.7rem; font-weight: 700; color: #7C3AED;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px;
        }
        .lp h2 {
          font-size: clamp(1.9rem, 3.5vw, 2.6rem);
          font-weight: 900; line-height: 1.12; color: #111111;
          margin: 0 0 16px; letter-spacing: -0.03em;
        }
        .lp h2 em { color: #7C3AED; font-style: normal; }
        .lp-sub { font-size: 1rem; color: #6B7280; line-height: 1.75; max-width: 520px; margin: 0 auto; }

        /* ── MOMENT STRIP ── */
        .moment-strip {
          background: #FFFFFF;
          border-top: 1px solid #E5E7EB;
          border-bottom: 1px solid #E5E7EB;
        }
        .moment-inner {
          max-width: 1080px; margin: 0 auto;
          padding: 36px 40px;
          display: flex; align-items: center; gap: 24px;
        }
        .moment-phone {
          background: #111111; border-radius: 14px;
          padding: 12px 16px; flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
        }
        .moment-notif-label { font-size: 0.58rem; color: rgba(255,255,255,0.4); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 5px; }
        .moment-notif-app { font-size: 0.7rem; color: rgba(255,255,255,0.6); margin-bottom: 2px; }
        .moment-notif-amount { font-size: 1.6rem; font-weight: 900; color: #10B981; letter-spacing: -0.03em; }
        .moment-notif-sub { font-size: 0.7rem; color: rgba(255,255,255,0.45); margin-top: 2px; }
        .moment-text { flex: 1; }
        .moment-headline { font-size: 1.15rem; font-weight: 800; color: #111111; letter-spacing: -0.02em; margin-bottom: 6px; line-height: 1.3; }
        .moment-body { font-size: 0.88rem; color: #6B7280; line-height: 1.7; max-width: 440px; }

        /* ── LAWS GRID ── */
        .law-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
        .law-card { background: #F9F8FF; border: 1px solid #EDE9FE; border-radius: 14px; padding: 24px; }
        .law-icon { font-size: 1.6rem; margin-bottom: 14px; }
        .law-title { font-size: 0.95rem; font-weight: 700; color: #111111; margin-bottom: 8px; line-height: 1.3; }
        .law-body { font-size: 0.85rem; color: #6B7280; line-height: 1.7; }

        /* ── FOUNDER NOTE ── */
        .founder-note {
          background: #F9F8FF;
          border: 1px solid #EDE9FE;
          border-radius: 16px;
          padding: 28px 32px;
          max-width: 620px; margin: 0 auto;
          position: relative;
        }
        .founder-quote {
          font-size: 1rem; color: #374151; line-height: 1.8;
          font-style: italic; margin: 0 0 16px;
        }
        .founder-quote::before { content: "\\201C"; color: #7C3AED; font-size: 2.5rem; font-style: normal; font-weight: 900; line-height: 0; vertical-align: -0.6rem; margin-right: 4px; }
        .founder-sig { font-size: 0.82rem; font-weight: 700; color: #7C3AED; }
        .founder-sig-sub { font-size: 0.75rem; color: #9CA3AF; margin-top: 2px; }

        /* ── GAP TRUTH ── */
        .gap-truth {
          background: #111111;
          border-radius: 16px;
          padding: 32px 36px;
          max-width: 680px; margin: 32px auto 0;
          text-align: center;
        }
        .gap-truth-headline { font-size: 1.25rem; font-weight: 900; color: #FFFFFF; letter-spacing: -0.02em; line-height: 1.3; margin-bottom: 12px; }
        .gap-truth-body { font-size: 0.88rem; color: rgba(255,255,255,0.55); line-height: 1.75; }

        /* ── STEPS ── */
        .steps-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
        .step-card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 14px; padding: 24px; }
        .step-num { font-size: 2rem; font-weight: 900; color: #EDE9FE; letter-spacing: -0.04em; margin-bottom: 12px; line-height: 1; }
        .step-title { font-size: 0.95rem; font-weight: 700; color: #111111; margin-bottom: 8px; }
        .step-body { font-size: 0.85rem; color: #6B7280; line-height: 1.7; }

        /* ── DEMO CARD ── */
        .demo-outer {
          background: #111827; border-radius: 16px; padding: 28px 32px;
          max-width: 680px; margin: 32px auto 0;
          border: 1px solid #1F2937;
        }
        .demo-label { font-size: 0.65rem; font-weight: 700; color: #10B981; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; }
        .demo-top { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
        .demo-score { font-size: 2.4rem; font-weight: 900; color: #10B981; letter-spacing: -0.04em; line-height: 1; }
        .demo-score-sub { font-size: 0.65rem; color: #6B7280; }
        .demo-title { font-size: 0.9rem; font-weight: 700; color: #FFFFFF; line-height: 1.45; margin-bottom: 10px; }
        .demo-chips { display: flex; gap: 7px; flex-wrap: wrap; }
        .dc { font-size: 0.65rem; font-weight: 700; border-radius: 5px; padding: 3px 9px; }
        .dc-g { background: #10B98120; color: #10B981; border: 1px solid #10B98130; }
        .dc-v { background: #7C3AED20; color: #A78BFA; border: 1px solid #7C3AED30; }
        .dc-a { background: #F59E0B20; color: #FCD34D; border: 1px solid #F59E0B30; }
        .demo-pain { background: rgba(124,58,237,0.12); border-left: 3px solid #7C3AED; border-radius: 0 8px 8px 0; padding: 12px 16px; }
        .demo-pain-label { font-size: 0.65rem; font-weight: 700; color: #A78BFA; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .demo-pain-text { font-size: 0.82rem; color: rgba(255,255,255,0.7); line-height: 1.7; }

        /* ── HARVEST MATH ── */
        .harvest-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 36px; }
        .harvest-card {
          background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 14px;
          padding: 22px 16px; text-align: center;
        }
        .harvest-card-hi {
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-color: transparent;
          box-shadow: 0 8px 24px rgba(124,58,237,0.3);
        }
        .harvest-seeds { font-size: 0.75rem; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
        .harvest-card-hi .harvest-seeds { color: rgba(255,255,255,0.6); }
        .harvest-num { font-size: 1.9rem; font-weight: 900; color: #111111; letter-spacing: -0.04em; line-height: 1; }
        .harvest-card-hi .harvest-num { color: #FFFFFF; }
        .harvest-sub { font-size: 0.72rem; color: #9CA3AF; margin-top: 5px; }
        .harvest-card-hi .harvest-sub { color: rgba(255,255,255,0.6); }

        /* ── PROOF STRIP ── */
        .proof-strip { display: grid; grid-template-columns: repeat(3, 1fr); }
        .proof-item { padding: 28px 32px; text-align: center; border-right: 1px solid #E5E7EB; }
        .proof-item:last-child { border-right: none; }
        .proof-num { font-size: 2.2rem; font-weight: 900; color: #7C3AED; letter-spacing: -0.04em; margin-bottom: 5px; line-height: 1; }
        .proof-label { font-size: 0.78rem; color: #6B7280; font-weight: 500; }

        /* ── PRICING ── */
        .pricing-box {
          max-width: 500px; margin: 0 auto;
          background: #FFFFFF; border: 2px solid #DDD6FE;
          border-radius: 20px; padding: 40px 36px;
          box-shadow: 0 12px 48px rgba(124,58,237,0.12);
          text-align: center; position: relative; overflow: hidden;
        }
        .pricing-glow {
          position: absolute; top: -60px; left: 50%;
          transform: translateX(-50%);
          width: 240px; height: 120px;
          background: radial-gradient(ellipse, rgba(124,58,237,0.18), transparent 70%);
          pointer-events: none;
        }
        .pricing-badge {
          display: inline-block;
          background: #EDE9FE; color: #7C3AED;
          font-size: 0.75rem; font-weight: 700;
          padding: 5px 14px; border-radius: 999px;
          border: 1px solid #DDD6FE; margin-bottom: 18px;
        }
        .pricing-name { font-size: 0.85rem; color: #9CA3AF; font-weight: 600; margin-bottom: 6px; }
        .pricing-amount { font-size: 4.5rem; font-weight: 900; color: #111111; letter-spacing: -0.05em; line-height: 1; margin-bottom: 4px; }
        .pricing-amount sup { font-size: 1.8rem; vertical-align: top; margin-top: 10px; display: inline-block; }
        .pricing-period { font-size: 0.82rem; color: #9CA3AF; margin-bottom: 24px; }
        .pricing-list { list-style: none; margin: 0 0 24px; padding: 0; text-align: left; display: flex; flex-direction: column; gap: 10px; }
        .pricing-list li { display: flex; align-items: flex-start; gap: 8px; font-size: 0.87rem; color: #374151; line-height: 1.5; }
        .pricing-cta {
          display: block;
          background: linear-gradient(135deg, #7C3AED, #4F46E5); color: #fff;
          font-weight: 700; font-size: 1rem;
          padding: 16px; border-radius: 999px; text-decoration: none;
          box-shadow: 0 6px 24px rgba(124,58,237,0.35);
          margin-bottom: 12px; transition: opacity 0.15s;
        }
        .pricing-cta:hover { opacity: 0.9; }
        .pricing-scan { display: block; color: #7C3AED; font-size: 0.85rem; font-weight: 600; text-decoration: none; margin-bottom: 16px; }
        .pricing-scan:hover { text-decoration: underline; }
        .pricing-ok { font-size: 0.82rem; color: #16A34A; font-weight: 700; margin-bottom: 6px; }
        .pricing-fine { font-size: 0.75rem; color: #9CA3AF; }

        /* ── FAQ ── */
        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 52px; }

        /* ── CTA BAND ── */
        .cta-band {
          background: linear-gradient(135deg, #6D28D9, #4F46E5);
          padding: 80px 40px; text-align: center;
        }

        /* ── FOOTER ── */
        .lp-footer {
          background: #111111; padding: 20px 40px; text-align: center;
          font-size: 0.75rem; color: rgba(255,255,255,0.3);
        }
        .lp-footer a { color: rgba(255,255,255,0.45); text-decoration: none; }
        .lp-footer a:hover { color: rgba(255,255,255,0.7); }

        /* ── MOBILE STICKY ── */
        .mobile-sticky { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
          background: #FFFFFF; border-top: 1px solid #E5E7EB;
          padding: 10px 16px;
          box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
        }
        .mobile-sticky a {
          display: block;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff; font-weight: 700; font-size: 0.88rem;
          padding: 14px; border-radius: 999px;
          text-decoration: none; text-align: center;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .lp-hero { grid-template-columns: 1fr; gap: 36px; padding: 52px 24px 48px; }
          .lp-hero-sub { max-width: 100%; }
          .law-grid, .steps-3 { grid-template-columns: 1fr; }
          .harvest-row { grid-template-columns: repeat(2, 1fr); }
          .proof-strip { grid-template-columns: 1fr; }
          .proof-item { border-right: none; border-bottom: 1px solid #E5E7EB; }
          .proof-item:last-child { border-bottom: none; }
          .lp-section { padding: 56px 24px; }
          .lp-nav { padding: 0 24px; }
          .cta-band { padding: 60px 24px; }
          .lp-footer { padding: 20px 24px; }
          .mobile-sticky { display: block; }
          body { padding-bottom: 68px !important; }
          .pricing-box { padding: 32px 22px; }
          .pricing-amount { font-size: 3.2rem; }
          .demo-top { flex-direction: column; gap: 10px; }
          .demo-outer { padding: 22px; }
          .moment-inner { flex-direction: column; align-items: flex-start; gap: 18px; padding: 28px 24px; }
          .faq-grid { grid-template-columns: 1fr; }
          .founder-note { padding: 22px; }
          .gap-truth { padding: 24px; }
        }
      `}</style>

      <div className="lp">

        {/* ── NAV — brand mark + single CTA only ── */}
        <nav className="lp-nav">
          <div className="lp-nav-inner">
            <a href="/" className="lp-logo">
              <div className="lp-logo-mark">🌱</div>
              <div>
                <div className="lp-logo-name">PDF Seeds</div>
              </div>
            </a>
            <a href={STRIPE} className="lp-nav-cta">Start Planting — £39/month →</a>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section>
          <div className="lp-hero">

            {/* Left — transformation-first copy */}
            <div className="lp-hero-text">
              <div className="lp-eyebrow">🌱 The digital farming system for extra income</div>
              <h1>
                The extra income<br />
                you want is<br />
                <em>already waiting.</em>
              </h1>
              <p className="lp-hero-sub">
                Thousands of people are searching for guides that don&apos;t exist yet.
                We find those gaps. You plant a guide. It earns every month — without clients, algorithms, or hustle.
              </p>
              <p className="lp-guarantee">✅ First harvest in 7 days — or your first month is free.</p>
              <div className="lp-hero-ctas">
                <a href={STRIPE} className="lp-btn-primary">Start Planting — £39/month →</a>
                <a href="/engine" className="lp-btn-ghost">See live seeds first →</a>
              </div>
            </div>

            {/* Right — live engine output = the product proving itself */}
            <div className="lp-hero-visual">
              <div className="lp-hero-badge">
                <div className="lp-hero-badge-dot" />
                These gaps are live right now — unplanted
              </div>
              <SeedCard
                score={94}
                title="How to Renew Your Nigerian Passport from the UK — Every Document, Every Step in 2026"
                volume="2,900/month"
                gap="empty shelf · gap: 90"
                flag="🇬🇧"
                market="UK Diaspora"
              />
              <SeedCard
                score={91}
                title="How to Register a Business in Nigeria — Every Form, Every Step, Done Right"
                volume="6,800/month"
                gap="empty shelf · gap: 78"
                flag="🇳🇬"
                market="Nigeria"
              />
              <SeedCard
                score={87}
                title="How to Start a Small Poultry Farm in Kenya With Little Money — Complete Beginner Guide"
                volume="3,600/month"
                gap="empty shelf · gap: 82"
                flag="🇰🇪"
                market="Kenya"
              />
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
                <span style={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 600 }}>
                  {["🇬🇭","🇳🇬","🇰🇪","🇿🇦","🇬🇧","🇺🇸","🇨🇦","🇦🇺"].join(" ")} · 8 markets active
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ── THE MOMENT — opens with the transformation, not the product ── */}
        <div className="moment-strip">
          <div className="moment-inner">
            <div className="moment-phone">
              <div className="moment-notif-label">Tuesday · 7:12am</div>
              <div className="moment-notif-app">Gumroad Notification</div>
              <div className="moment-notif-amount">+£47.00</div>
              <div className="moment-notif-sub">Passport Renewal Guide · 3 sales overnight</div>
            </div>
            <div className="moment-text">
              <div className="moment-headline">You didn&apos;t do anything yesterday. It still earned.</div>
              <div className="moment-body">
                That&apos;s what a planted seed looks like. Not a side hustle you have to show up for. A guide you built once — because the engine found a gap, and nobody else had filled it yet. Every morning is now a potential harvest.
              </div>
            </div>
          </div>
        </div>

        {/* ── PROOF STRIP ── */}
        <section className="lp-section-white" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="lp-inner">
            <div className="proof-strip">
              {[
                { num: "8",   label: "Markets — from Ghana to Australia" },
                { num: "7",   label: "Live data sources per scan" },
                { num: "£39", label: "Per month — less than one missed sale" },
              ].map((s, i) => (
                <div key={i} className="proof-item">
                  <div className="proof-num">{s.num}</div>
                  <div className="proof-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOUNDER NOTE ── */}
        <section className="lp-section lp-section-white">
          <div className="lp-inner" style={{ textAlign: "center" }}>
            <div className="lp-label">From the builder</div>
            <div className="founder-note">
              <p className="founder-quote">
                I built this because I was tired of watching people with real potential freeze on the idea stage. The problem was never effort — it was farming the wrong soil. This tool tests the soil first, so you only plant where something will actually grow.
              </p>
              <div className="founder-sig">Jimi</div>
              <div className="founder-sig-sub">Founder · PDF Seeds</div>
            </div>
          </div>
        </section>

        {/* ── THREE LAWS ── */}
        <section className="lp-section">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
              <div className="lp-label">Why this works</div>
              <h2>Good farming has three laws. We built all three in.</h2>
            </div>
            <div className="law-grid">
              {[
                { icon: "🔍", title: "Test the soil before you plant", body: "A real farmer doesn't guess. The engine confirms demand, checks competition, and scores the shelf gap — before you invest a single hour." },
                { icon: "🌱", title: "Find the empty fields", body: "Planting where everyone else plants means competing for the same harvest. We find where demand is real and no useful guide exists yet." },
                { icon: "🌾", title: "Plant once. Harvest forever.", body: "A good seed doesn't need tending every day. You plant it. It grows. The same guide earns month after month — without you lifting a finger." },
              ].map((c, i) => (
                <div key={i} className="law-card">
                  <div className="law-icon">{c.icon}</div>
                  <div className="law-title">{c.title}</div>
                  <div className="law-body">{c.body}</div>
                </div>
              ))}
            </div>

            {/* The gap is filling — real urgency, not manufactured */}
            <div className="gap-truth">
              <div className="gap-truth-headline">Every week without a planted seed is a week someone else could have planted it first.</div>
              <div className="gap-truth-body">
                The gaps in these markets are real — but they don&apos;t stay empty forever. The engine is live right now.
                Farmers who move first harvest first. That&apos;s not pressure. It&apos;s just how fields work.
              </div>
            </div>
          </div>
        </section>

        {/* ── PROOF OF HARVEST ── */}
        <section className="lp-section lp-section-white">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
              <div className="lp-label">A real gap, right now</div>
              <h2>This seed is unplanted.<br /><em>Someone will claim it.</em></h2>
              <p className="lp-sub" style={{ marginTop: 10 }}>Real demand. Empty shelf. Nobody has filled this gap yet.</p>
            </div>
            <div className="demo-outer">
              <div className="demo-label">Live seed · scored 94/100 · unplanted</div>
              <div className="demo-top">
                <div>
                  <div className="demo-score">94</div>
                  <div className="demo-score-sub">/100</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="demo-title">
                    How to Renew Your Nigerian Passport from the UK — Every Document, Every Step, Every Fee in 2026
                  </div>
                  <div className="demo-chips">
                    <span className="dc dc-g">2,900 searches/month</span>
                    <span className="dc dc-v">empty shelf · gap: 90</span>
                    <span className="dc dc-a">✈️ UK Diaspora · £9.99–£19.99</span>
                  </div>
                </div>
              </div>
              <div className="demo-pain">
                <div className="demo-pain-label">What they&apos;re feeling right now</div>
                <div className="demo-pain-text">
                  Nigerians in the UK trying to renew their passport face a maze of wrong appointments, missing documents, and expensive return trips to the embassy. The moment someone gets a clear, complete guide in their hands — they pay £12 without hesitation.
                </div>
              </div>
            </div>
            <p style={{ color: "#9CA3AF", textAlign: "center", marginTop: 14, fontSize: "0.78rem" }}>
              This seed exists in the engine right now. Scored, titled, outlined, and ready to build.
            </p>
          </div>
        </section>

        {/* ── HARVEST MATH ── */}
        <section className="lp-section">
          <div className="lp-inner">
            <div style={{ textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
              <div className="lp-label">The harvest</div>
              <h2>One seed pays back the farm.<br />Ten seeds change the month.</h2>
              <p className="lp-sub" style={{ marginTop: 10, fontSize: "0.9rem" }}>
                The subscription costs £39. One guide returning £240/month is 6× that. Plant more when the first one earns.
              </p>
            </div>
            <div className="harvest-row">
              {[
                { seeds: "1 seed",   num: "£240" },
                { seeds: "3 seeds",  num: "£720" },
                { seeds: "5 seeds",  num: "£1,200" },
                { seeds: "10 seeds", num: "£2,400", hi: true },
              ].map((r, i) => (
                <div key={i} className={`harvest-card${r.hi ? " harvest-card-hi" : ""}`}>
                  <div className="harvest-seeds">{r.seeds}</div>
                  <div className="harvest-num">{r.num}</div>
                  <div className="harvest-sub">per month</div>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", fontSize: "0.74rem", color: "#9CA3AF", marginTop: 14 }}>
              Illustrative averages based on 20 sales/month per guide at mid-range pricing. Results vary.
            </p>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="lp-section lp-section-white" id="start">
          <div className="lp-inner" style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="lp-label">Your farm</div>
            <h2>Full access. One price.<br />Cancel the moment it&apos;s not worth it.</h2>
          </div>
          <div className="pricing-box">
            <div className="pricing-glow" />
            <div className="pricing-badge">🌱 Founding Farmer Pricing</div>
            <div className="pricing-name">PDF Seeds — Full Farm Access</div>
            <div className="pricing-amount"><sup>£</sup>39</div>
            <div className="pricing-period">per month · cancel anytime</div>
            <ul className="pricing-list">
              {[
                "Field scanner confirms real demand before you build a single page",
                "One click generates the complete PDF guide, sales page, and video scripts",
                "Gap scoring shows exactly which shelves are empty — before you commit",
                "One dashboard — every seed, every harvest, everything in one place",
                "8 active markets — from Africa to the UK to North America",
              ].map((item, i) => (
                <li key={i}><CheckIcon /><span style={{ marginLeft: 2 }}>{item}</span></li>
              ))}
            </ul>
            <a href={STRIPE} className="pricing-cta">Start Planting — £39/month →</a>
            <a href="/engine" className="pricing-scan">Scan the field first (free) →</a>
            <div className="pricing-ok">✅ First harvest in 7 days — or your first month is free.</div>
            <div className="pricing-fine">30-day money-back · Cancel anytime · No questions asked</div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="lp-section" id="faq">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-label">Before you plant</div>
              <h2>Honest answers.</h2>
            </div>
            <div className="faq-grid">
              <div>
                <FaqItem q="I've tried online income things before. How is this different?" a="Most attempts fail because you build without confirmed demand. The engine tests the soil before you plant — real search data, scored for pain and gap. You never build blind." />
                <FaqItem q="Do I need to write anything?" a="Nothing. The engine finds the seed. AI builds the complete guide, sales page, and video scripts. You choose and share." />
                <FaqItem q="Do I need an audience or following?" a="No. Buyers find the guide through search and communities — they're already looking for the answer. The PDF sells on the strength of the topic, not your name." />
              </div>
              <div>
                <FaqItem q="How long before I see results?" a="Most planters share their first link within a day. Sales typically follow within 3–7 days once the guide reaches the right community." />
                <FaqItem q="Is £39/month worth it?" a="One seed returning £240/month is 6× your subscription. The engine tells you whether the gap exists before you invest a single hour — so you're never planting in flooded ground." />
                <FaqItem q="What if the guide doesn't sell?" a="Plant within 7 days. If it doesn't earn, email us — refund sent same day. The guarantee is real." />
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA BAND ── */}
        <div className="cta-band">
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{ fontSize: "2.6rem", marginBottom: 16 }}>🌱</div>
            <h2 style={{ fontSize: "clamp(1.9rem,4vw,2.6rem)", fontWeight: 900, color: "#FFFFFF", margin: "0 0 14px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              The field is open.<br />The gaps are real.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.97rem", marginBottom: 32, lineHeight: 1.75 }}>
              Every week without a planted seed is a week without a harvest.
              The engine is live — the only question is whether you move first.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={STRIPE} style={{ display: "inline-block", background: "#FFFFFF", color: "#7C3AED", fontWeight: 800, fontSize: "0.97rem", padding: "16px 36px", borderRadius: "999px", textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                Start Planting — £39/month →
              </a>
              <a href="/engine" style={{ display: "inline-block", background: "transparent", color: "#FFFFFF", fontWeight: 600, fontSize: "0.97rem", padding: "16px 24px", borderRadius: "999px", textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.4)" }}>
                Scan live seeds first →
              </a>
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.76rem", marginTop: 20 }}>
              30-day money-back · Cancel anytime
            </p>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <p>
            © {new Date().getFullYear()} PDF Seeds · Plant. Grow. Harvest. ·{" "}
            <a href="/engine">Field Scanner</a> ·{" "}
            <a href="/signin">My Farm</a> ·{" "}
            <a href={STRIPE}>Get Access</a>
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
