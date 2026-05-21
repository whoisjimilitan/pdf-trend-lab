import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Seeds — Plant once. Earn for years.",
  description: "PDF Seeds finds questions people are already searching for — then helps you turn them into simple PDF guides people actually buy.",
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

function Stars() {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} style={{ width: 14, height: 14, color: "#F59E0B", fill: "currentColor" }} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="faq-item group">
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
        body { display: block !important; overflow-y: auto !important; height: auto !important; }
        body > main { overflow: visible !important; height: auto !important; }
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
        .lp-nav-login { font-size: 0.85rem; color: #64748B; text-decoration: none; }
        .lp-nav-login:hover { color: #0F172A; }
        .lp-nav-cta { background: #6366F1; color: #fff; font-weight: 700; font-size: 0.85rem; padding: 9px 20px; border-radius: 8px; text-decoration: none; }
        .lp-nav-cta:hover { background: #4F46E5; }

        /* HERO */
        .lp-hero { padding: 108px 24px 88px; text-align: center; position: relative; overflow: hidden; background: #FFFFFF; }
        .lp-hero-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%); pointer-events: none; }
        .lp-hero-inner { max-width: 820px; margin: 0 auto; position: relative; z-index: 1; }
        .lp-eyebrow { display: inline-flex; align-items: center; gap: 6px; background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 20px; padding: 5px 14px; font-size: 0.78rem; font-weight: 700; color: #4F46E5; margin-bottom: 28px; }
        .lp h1 { font-size: clamp(3rem, 7vw, 5rem); font-weight: 900; line-height: 1.05; color: #0F172A; margin: 0 0 24px; letter-spacing: -0.03em; }
        .lp h1 em { color: #6366F1; font-style: normal; }
        .lp-hero-sub { font-size: 1.05rem; color: #64748B; line-height: 1.75; max-width: 580px; margin: 0 auto 28px; }
        .lp-hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-bottom: 28px; }
        .lp-btn-primary { display: inline-block; background: #6366F1; color: #fff; font-weight: 800; font-size: 0.95rem; padding: 15px 36px; border-radius: 10px; text-decoration: none; letter-spacing: 0.01em; }
        .lp-btn-primary:hover { background: #4F46E5; }
        .lp-btn-ghost { display: inline-block; background: transparent; color: #64748B; font-weight: 600; font-size: 0.95rem; padding: 15px 26px; border-radius: 10px; text-decoration: none; border: 1px solid #E2E8F0; }
        .lp-btn-ghost:hover { border-color: #CBD5E1; color: #334155; }
        .lp-social-proof { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
        .lp-avatars { display: flex; }
        .lp-avatar { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #FFFFFF; background: #EEF2FF; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; margin-left: -6px; }
        .lp-avatar:first-child { margin-left: 0; }
        .lp-proof-text { font-size: 0.8rem; color: #94A3B8; }

        /* SECTIONS */
        .lp-section { padding: 88px 24px; background: #FFFFFF; }
        .lp-section-alt { background: #F8FAFC; }
        .lp-inner { max-width: 1000px; margin: 0 auto; }
        .lp-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #94A3B8; margin-bottom: 12px; }
        .lp h2 { font-size: clamp(1.7rem, 3.5vw, 2.4rem); font-weight: 900; color: #0F172A; line-height: 1.15; margin: 0 0 16px; letter-spacing: -0.02em; }
        .lp-body { font-size: 0.97rem; color: #64748B; line-height: 1.8; }

        /* WHAT IS A SEED */
        .seed-split { display: grid; grid-template-columns: 1fr 1fr; gap: 52px; align-items: start; }
        .flow-steps { display: flex; flex-direction: column; gap: 0; margin-top: 28px; }
        .flow-step { display: flex; gap: 14px; align-items: flex-start; padding-bottom: 28px; position: relative; }
        .flow-step:not(:last-child)::before { content: ""; position: absolute; left: 15px; top: 33px; bottom: 0; width: 1px; background: #E2E8F0; }
        .flow-dot { width: 32px; height: 32px; border-radius: 50%; background: #DCFCE7; border: 1.5px solid #BBF7D0; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
        .flow-label { font-size: 0.88rem; font-weight: 700; color: #0F172A; margin-bottom: 3px; }
        .flow-sub { font-size: 0.82rem; color: #64748B; line-height: 1.55; }
        .seed-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
        .seed-badge { display: inline-block; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: #FEF3C7; border: 1px solid #FDE68A; color: #B45309; }
        .seed-query { font-size: 0.95rem; color: #1E293B; line-height: 1.55; margin: 14px 0 20px; font-style: italic; font-weight: 500; }
        .seed-stat-label { font-size: 0.65rem; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
        .seed-stat-value { font-size: 0.92rem; font-weight: 800; color: #0F172A; }

        /* OPP CARDS */
        .opp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 40px; }
        .opp-simple { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .opp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .opp-badge-live { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: #FEF3C7; border: 1px solid #FDE68A; color: #B45309; }
        .opp-query { font-size: 0.9rem; color: #1E293B; line-height: 1.55; margin: 0 0 14px; font-style: italic; font-weight: 500; }
        .opp-demand { font-size: 0.78rem; color: #64748B; }

        /* FOUNDER */
        .founder-inner { max-width: 780px; margin: 0 auto; text-align: center; }
        .founder-quote { font-size: clamp(1.8rem, 3.5vw, 2.6rem); font-weight: 900; color: #0F172A; line-height: 1.15; letter-spacing: -0.025em; margin: 0 0 28px; }
        .founder-body { font-size: 0.97rem; color: #64748B; line-height: 1.8; max-width: 520px; margin: 0 auto 18px; }
        .founder-cite { font-size: 0.88rem; color: #6366F1; font-weight: 700; }

        /* HOW IT WORKS */
        .steps-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 44px; }
        .step-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .step-num { font-size: 2.5rem; font-weight: 900; color: #EEF2FF; line-height: 1; margin-bottom: 16px; letter-spacing: -0.02em; }
        .step-icon { font-size: 1.5rem; margin-bottom: 12px; }
        .step-title { font-size: 1rem; font-weight: 800; color: #0F172A; margin-bottom: 8px; }
        .step-body { font-size: 0.85rem; color: #64748B; line-height: 1.75; }

        /* PRICING */
        .pricing-box { max-width: 540px; margin: 0 auto; background: #FFFFFF; border: 2px solid rgba(99,102,241,0.2); border-radius: 20px; padding: 48px 40px; text-align: center; position: relative; overflow: hidden; box-shadow: 0 8px 32px rgba(99,102,241,0.08); }
        .pricing-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 280px; height: 2px; background: linear-gradient(to right, transparent, #6366F1, transparent); }
        .pricing-badge { display: inline-block; background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; border-radius: 20px; padding: 4px 14px; font-size: 0.72rem; font-weight: 700; margin-bottom: 20px; letter-spacing: 0.04em; text-transform: uppercase; }
        .pricing-title { font-size: 1.1rem; font-weight: 800; color: #0F172A; margin-bottom: 4px; }
        .pricing-sub { font-size: 0.85rem; color: #64748B; margin-bottom: 28px; }
        .pricing-amount { font-size: 4.5rem; font-weight: 900; color: #0F172A; line-height: 1; margin-bottom: 4px; letter-spacing: -0.03em; }
        .pricing-amount sup { font-size: 1.6rem; vertical-align: super; font-weight: 700; color: #94A3B8; }
        .pricing-period { font-size: 0.85rem; color: #94A3B8; margin-bottom: 32px; }
        .pricing-list { text-align: left; list-style: none; padding: 0; margin: 0 0 32px; display: flex; flex-direction: column; gap: 10px; }
        .pricing-list li { font-size: 0.88rem; color: #475569; display: flex; gap: 10px; align-items: flex-start; }
        .lp-check-icon { width: 18px; height: 18px; border-radius: 50%; background: #DCFCE7; border: 1px solid #BBF7D0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .lp-check-svg { width: 10px; height: 10px; color: #16A34A; }
        .pricing-cta { display: block; background: #6366F1; color: #fff; font-weight: 800; font-size: 1rem; padding: 17px; border-radius: 12px; text-decoration: none; margin-bottom: 14px; }
        .pricing-cta:hover { background: #4F46E5; }
        .pricing-offer { font-size: 0.82rem; color: #16A34A; font-weight: 600; margin-bottom: 8px; }
        .pricing-guarantee { font-size: 0.75rem; color: #94A3B8; }

        /* FAQ */
        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 56px; }
        .faq-item { border-bottom: 1px solid #E2E8F0; }
        .faq-item:last-child { border-bottom: none; }
        .faq-summary { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 0; cursor: pointer; list-style: none; gap: 16px; }
        .faq-q { font-size: 0.9rem; font-weight: 600; color: #1E293B; line-height: 1.4; }
        .faq-plus { color: #6366F1; font-size: 1.3rem; flex-shrink: 0; margin-top: 0px; transition: transform 0.2s; line-height: 1; }
        details[open] .faq-plus { transform: rotate(45deg); }
        .faq-a { font-size: 0.88rem; color: #64748B; line-height: 1.75; padding-bottom: 20px; margin: 0; }

        /* WHY PEOPLE START PLANTING */
        .why-inner { max-width: 680px; }
        .why-body { font-size: 1rem; color: #64748B; line-height: 1.85; margin: 0 0 20px; }
        .why-body strong { color: #0F172A; font-weight: 700; }
        .why-somethings { margin: 0 0 28px; padding: 18px 22px; background: #F8FAFC; border-left: 3px solid #C7D2FE; border-radius: 0 8px 8px 0; display: flex; flex-direction: column; gap: 8px; }
        .why-somethings p { font-size: 0.97rem; color: #64748B; font-style: italic; margin: 0; line-height: 1.65; }
        .why-highlight { font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0 0 14px; }
        .why-not-block { margin: 0 0 20px; }
        .why-not-block p { font-size: 0.9rem; color: #94A3B8; margin: 0 0 3px; font-style: italic; }
        .why-outcomes { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 22px 24px; margin: 28px 0; }
        .why-outcomes-title { font-size: 0.85rem; font-weight: 700; color: #0F172A; margin-bottom: 14px; }
        .why-outcome-row { display: flex; gap: 10px; font-size: 0.9rem; color: #64748B; padding: 7px 0; border-bottom: 1px solid #F1F5F9; line-height: 1.5; }
        .why-outcome-row:last-child { border-bottom: none; }
        .why-arrow { color: #6366F1; font-weight: 700; flex-shrink: 0; }
        .why-closing { font-size: 1.05rem; font-weight: 800; color: #0F172A; line-height: 1.45; margin: 0; letter-spacing: -0.01em; border-top: 1px solid #E2E8F0; padding-top: 24px; }

        /* FIRST HARVESTS */
        .harvest-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 40px; }
        .harvest-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 26px 22px; }
        .harvest-flag { font-size: 1.4rem; margin-bottom: 10px; }
        .harvest-name { font-size: 0.78rem; font-weight: 700; color: #0F172A; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.06em; }
        .harvest-story { font-size: 0.9rem; color: #64748B; line-height: 1.75; }
        .harvest-closing { text-align: center; margin-top: 40px; max-width: 520px; margin-left: auto; margin-right: auto; }
        .harvest-closing p { font-size: 0.95rem; color: #94A3B8; line-height: 1.85; }

        /* HARVEST MATH */
        .math-grid { display: flex; flex-direction: column; gap: 8px; max-width: 600px; margin: 0 auto; }
        .math-row { display: grid; grid-template-columns: 90px 1fr auto auto; align-items: center; gap: 16px; padding: 16px 20px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; }
        .math-row-highlight { background: #6366F1; border-color: #6366F1; }
        .math-seeds { display: flex; align-items: baseline; gap: 4px; }
        .math-num { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.03em; color: #0F172A; }
        .math-row-highlight .math-num { color: #FFFFFF; }
        .math-unit { font-size: 0.75rem; color: #94A3B8; font-weight: 500; }
        .math-row-highlight .math-unit { color: rgba(255,255,255,0.6); }
        .math-label { font-size: 0.82rem; color: #64748B; font-weight: 500; }
        .math-row-highlight .math-label { color: rgba(255,255,255,0.75); }
        .math-daily { font-size: 0.85rem; color: #94A3B8; text-align: right; }
        .math-row-highlight .math-daily { color: rgba(255,255,255,0.6); }
        .math-monthly { font-size: 1.2rem; font-weight: 900; letter-spacing: -0.02em; color: #0F172A; min-width: 96px; text-align: right; }
        .math-monthly span { font-size: 0.72rem; font-weight: 500; color: #94A3B8; margin-left: 2px; }
        .math-row-highlight .math-monthly { color: #FFFFFF; }
        .math-row-highlight .math-monthly span { color: rgba(255,255,255,0.6); }
        .math-note { text-align: center; color: #94A3B8; font-size: 0.8rem; margin-top: 20px; }

        /* FOOTER */
        .lp-footer { padding: 32px 24px; border-top: 1px solid #E2E8F0; text-align: center; background: #F8FAFC; }
        .lp-footer p { font-size: 0.78rem; color: #CBD5E1; margin: 0; }
        .lp-footer a { color: #94A3B8; text-decoration: none; }
        .lp-footer a:hover { color: #6366F1; }

        /* MOBILE STICKY */
        .mobile-sticky { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; background: #FFFFFF; border-top: 1px solid #E2E8F0; padding: 12px 16px; box-shadow: 0 -4px 12px rgba(0,0,0,0.06); }
        .mobile-sticky a { display: block; background: #6366F1; color: #fff; font-weight: 800; font-size: 0.9rem; padding: 15px; border-radius: 10px; text-decoration: none; text-align: center; }

        @media (max-width: 768px) {
          .lp h1 { font-size: 2.8rem; letter-spacing: -0.02em; }
          .lp h2 { font-size: 1.7rem; }
          .lp-section { padding: 56px 20px; }
          .lp-hero { padding: 80px 20px 64px; }
          .seed-split { grid-template-columns: 1fr; gap: 32px; }
          .opp-grid-3 { grid-template-columns: 1fr; }
          .harvest-grid { grid-template-columns: 1fr; }
          .steps-3 { grid-template-columns: 1fr; }
          .faq-grid { grid-template-columns: 1fr; }
          .math-row { grid-template-columns: 70px 1fr auto; }
          .math-daily { display: none; }
          .pricing-box { padding: 36px 24px; }
          .pricing-amount { font-size: 3.5rem; }
          .mobile-sticky { display: block; }
          body { padding-bottom: 80px; }
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
              <a href="/dashboard" className="lp-nav-login">My Farm</a>
              <a href={STRIPE} className="lp-nav-cta">Plant Your First Seed →</a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="lp-hero-glow" />
          <div className="lp-hero-inner">
            <div className="lp-eyebrow">🌱 The farming system for digital products.</div>
            <h1>
              Plant once.<br />
              <em>Earn for years.</em>
            </h1>
            <p className="lp-hero-sub">
              PDF Seeds finds questions people are already searching for — then helps you turn them into PDF guides people actually buy.
            </p>
            <div className="lp-hero-ctas">
              <a href={STRIPE} className="lp-btn-primary">Plant Your First Seed →</a>
              <a href="#how-it-works" className="lp-btn-ghost">See how it works ↓</a>
            </div>
            <div className="lp-social-proof">
              <div className="lp-avatars">
                {["🇬🇭", "🇳🇬", "🇰🇪", "🇿🇦", "🇬🇧"].map((f, i) => (
                  <div key={i} className="lp-avatar">{f}</div>
                ))}
              </div>
              <Stars />
              <p className="lp-proof-text">Early planters across 5 markets</p>
            </div>
          </div>
        </section>

        {/* ── WHAT IS A SEED? ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-inner">
            <div className="lp-label">What is a seed?</div>
            <div className="seed-split">
              <div>
                <h2>A question with no answer. Yet.</h2>
                <p className="lp-body">
                  A seed is a real question that thousands of people search for every month —
                  and nobody has written the PDF guide to answer it.
                  When you plant that seed early, you become one of the first people answering that question.
                </p>
                <div className="flow-steps">
                  {[
                    { dot: "🔍", label: "Real question", sub: "Thousands search it every month. No PDF exists." },
                    { dot: "📄", label: "Your PDF guide", sub: "You plant a simple guide that answers it." },
                    { dot: "💰", label: "Sale", sub: "They find it. They buy it." },
                    { dot: "♾️", label: "Keeps earning", sub: "Same guide. Same search. Month after month." },
                  ].map((s, i) => (
                    <div key={i} className="flow-step">
                      <div className="flow-dot">{s.dot}</div>
                      <div>
                        <div className="flow-label">{s.label}</div>
                        <div className="flow-sub">{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginBottom: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  A real seed — right now, unplanted
                </div>
                <div className="seed-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "1.4rem" }}>🇬🇭</span>
                    <span className="seed-badge">🟡 Unplanted</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: 8 }}>Ghana · Inheritance & Land</div>
                  <div className="seed-query">&ldquo;How to transfer land ownership in Ghana after death&rdquo;</div>
                  <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                    <div>
                      <div className="seed-stat-label">Monthly searches</div>
                      <div className="seed-stat-value">4,200</div>
                    </div>
                    <div>
                      <div className="seed-stat-label">Competition</div>
                      <div className="seed-stat-value" style={{ color: "#16A34A" }}>Very Low</div>
                    </div>
                    <div>
                      <div className="seed-stat-label">PDF guides</div>
                      <div className="seed-stat-value">0 existing</div>
                    </div>
                  </div>
                  <a href={STRIPE} className="lp-btn-primary" style={{ display: "block", textAlign: "center", fontSize: "0.9rem", padding: "13px 20px" }}>
                    Plant This Seed →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY PEOPLE START PLANTING ── */}
        <section className="lp-section">
          <div className="lp-inner">
            <div className="why-inner">
              <div className="lp-label">Why people start planting</div>
              <h2 style={{ marginBottom: 24 }}>They needed something<br />that finally made sense.</h2>

              <p className="why-body">
                Most people don&apos;t need another business idea.<br />
                They need <strong>something that finally makes sense.</strong>
              </p>

              <div className="why-somethings">
                <p>Something they can build quietly after work.</p>
                <p>Something that doesn&apos;t require inventory.</p>
                <p>Something that doesn&apos;t depend on going viral every day.</p>
                <p>Something that keeps earning after the work is done.</p>
              </div>

              <p className="why-body">That is why people start planting.</p>

              <p className="why-body">
                Some want breathing room at the end of the month.<br />
                Some want extra income without taking a second job.<br />
                Some are tired of starting over every month.<br />
                Some simply want one digital asset that keeps growing quietly in the background.
              </p>

              <p className="why-highlight">PDF Seeds was built for that person.</p>

              <div className="why-not-block">
                <p>Not influencers.</p>
                <p>Not marketing experts.</p>
                <p>Not people with huge audiences.</p>
              </div>

              <p className="why-body">
                Just ordinary people willing to plant one useful guide into demand that already exists.
              </p>

              <div className="why-outcomes">
                <div className="why-outcomes-title">🌱 One seed can become:</div>
                {[
                  "your first online sale",
                  "your first consistent side income",
                  "your first digital asset",
                  "your first proof that the internet still has open ground",
                ].map((item, i) => (
                  <div key={i} className="why-outcome-row">
                    <span className="why-arrow">→</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <p className="why-closing">
                You do not need hundreds of ideas.<br />
                You need one unplanted question.
              </p>
            </div>
          </div>
        </section>

        {/* ── THREE SEEDS WAITING ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-inner">
            <div className="lp-label">Unplanted opportunities</div>
            <h2>Three seeds waiting to be planted.</h2>
            <p className="lp-body" style={{ maxWidth: 540 }}>
              Real searches. Real demand. No PDF guide has answered any of them yet.
            </p>
            <div className="opp-grid-3">
              {[
                { flag: "🇳🇬", country: "Nigeria", query: "How to register a business in Nigeria step by step", demand: "6,800 searches / month" },
                { flag: "🇰🇪", country: "Kenya",   query: "How to start a small poultry farm in Kenya with little money", demand: "3,600 searches / month" },
                { flag: "🇬🇧", country: "UK Diaspora", query: "How to renew a Nigerian passport from the UK", demand: "2,900 searches / month" },
              ].map((opp, i) => (
                <div key={i} className="opp-simple">
                  <div className="opp-header">
                    <span style={{ fontSize: "1.3rem" }}>{opp.flag}</span>
                    <span className="opp-badge-live">🟡 Unplanted</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 600, marginBottom: 8 }}>{opp.country}</div>
                  <div className="opp-query">&ldquo;{opp.query}&rdquo;</div>
                  <div className="opp-demand">{opp.demand}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.78rem", color: "#CBD5E1", marginTop: 18, textAlign: "center" }}>
              PDF Seeds surfaces hundreds of gaps like these — scored, ranked, and ready to grow.
            </p>
          </div>
        </section>

        {/* ── FIRST HARVESTS ── */}
        <section className="lp-section">
          <div className="lp-inner">
            <div className="lp-label">First harvests</div>
            <h2>Not overnight success stories.<br />Just seeds beginning to grow.</h2>
            <div className="harvest-grid">
              {[
                {
                  flag: "🇬🇭",
                  name: "Kofi",
                  story: "Planted a land transfer guide for Ghana families. His first sale came 4 days later from a Facebook group share.",
                },
                {
                  flag: "🇮🇳",
                  name: "Priya",
                  story: "Published a UK visa checklist for Indian students. Her SEO article started ranking after 6 weeks and still brings new buyers monthly.",
                },
                {
                  flag: "🇲🇽",
                  name: "Diego",
                  story: "Created a freelancer invoice template pack for Mexican remote workers. Most buyers found it through a Reddit thread asking for the link.",
                },
              ].map((h, i) => (
                <div key={i} className="harvest-card">
                  <div className="harvest-flag">{h.flag}</div>
                  <div className="harvest-name">{h.name}</div>
                  <div className="harvest-story">{h.story}</div>
                </div>
              ))}
            </div>
            <div className="harvest-closing">
              <p>
                🌱 Most seeds start small.<br />
                The goal is not one viral hit.<br />
                The goal is building digital assets that keep producing over time.
              </p>
            </div>
          </div>
        </section>

        {/* ── FOUNDER ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-inner">
            <div className="founder-inner">
              <div className="lp-label" style={{ marginBottom: 24 }}>From the founder</div>
              <p className="founder-quote">&ldquo;I wanted a farm. Not another job.&rdquo;</p>
              <p className="founder-body">
                I built PDF Seeds because I kept seeing the same gap: millions of urgent searches
                online — and almost no simple PDF guides answering them.
                The opportunity was obvious. The system to act on it wasn&apos;t. So I built it.
              </p>
              <span className="founder-cite">— Jimi, Founder of PDF Seeds</span>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="lp-section" id="how-it-works">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div className="lp-label">How it works</div>
              <h2>Three steps. One afternoon to start.</h2>
            </div>
            <div className="steps-3">
              {[
                { num: "01", icon: "🔍", title: "Find the gap", body: "We scan real search data across underserved markets and surface questions with high demand and no PDF guide. You pick the one you want to plant." },
                { num: "02", icon: "🌱", title: "Grow the guide", body: "One click generates your complete PDF guide, a buy page, an SEO article, and 10 social hooks. Nothing to write. Ready in 3 minutes." },
                { num: "03", icon: "🌾", title: "Earn while it grows", body: "Share the buy link. Post the social hooks. Over time, Google sends buyers automatically. The guide keeps selling. You keep earning." },
              ].map((s, i) => (
                <div key={i} className="step-card">
                  <div className="step-num">{s.num}</div>
                  <div className="step-icon">{s.icon}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-body">{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HARVEST MATH ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-label">The harvest math</div>
              <h2>One seed earns. Ten seeds compound.</h2>
              <p style={{ color: "#64748B", fontSize: "1.05rem", maxWidth: 500, margin: "16px auto 0", lineHeight: 1.7 }}>
                Each guide earns an average of £8 a day. The more seeds you plant, the more your farm earns on its own.
              </p>
            </div>
            <div className="math-grid">
              {[
                { seeds: 1,  label: "One seed",      daily: "£8",   monthly: "£240" },
                { seeds: 3,  label: "Starter farm",  daily: "£24",  monthly: "£720" },
                { seeds: 5,  label: "Side income",   daily: "£40",  monthly: "£1,200" },
                { seeds: 10, label: "Full harvest",  daily: "£80",  monthly: "£2,400", highlight: true },
                { seeds: 20, label: "Abundant farm", daily: "£160", monthly: "£4,800" },
              ].map((row, i) => (
                <div key={i} className={`math-row${row.highlight ? " math-row-highlight" : ""}`}>
                  <div className="math-seeds">
                    <span className="math-num">{row.seeds}</span>
                    <span className="math-unit">{row.seeds === 1 ? "seed" : "seeds"}</span>
                  </div>
                  <div className="math-label">{row.label}</div>
                  <div className="math-daily">{row.daily} / day</div>
                  <div className="math-monthly">{row.monthly}<span>/mo</span></div>
                </div>
              ))}
            </div>
            <p className="math-note">Based on average earnings across active seeds. Most planters reach 10 seeds within 90 days.</p>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="lp-section" id="start">
          <div className="lp-inner" style={{ textAlign: "center", marginBottom: 44 }}>
            <div className="lp-label">Start your farm</div>
            <h2>One subscription. Your whole farm.</h2>
          </div>
          <div className="pricing-box">
            <div className="pricing-glow" />
            <div className="pricing-badge">🌱 Founding Farmer Pricing</div>
            <div className="pricing-title">PDF Seeds — Full Farm Access</div>
            <div className="pricing-sub">Everything you need to find the gaps, grow the guides, and harvest every month.</div>
            <div className="pricing-amount"><sup>£</sup>39</div>
            <div className="pricing-period">per month · cancel anytime</div>
            <ul className="pricing-list">
              {[
                "Find questions people already want answered — before anyone else plants them",
                "Generate a complete guide ready to sell in minutes, not months",
                "Get found on Google and social media without being an expert",
                "Build a library of digital assets that compound over time",
                "Know exactly what to post each day — no content strategy needed",
                "Watch every seed grow from one simple dashboard",
              ].map((item, i) => (
                <li key={i}><CheckIcon />{item}</li>
              ))}
            </ul>
            <a href={STRIPE} className="pricing-cta">Plant My First Seed →</a>
            <div className="pricing-offer">✅ First harvest within 7 days — or your first month is free.</div>
            <div className="pricing-guarantee">30-day money-back guarantee · No questions asked · Cancel anytime</div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="lp-section lp-section-alt" id="faq">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-label">Before you plant</div>
              <h2>Every question, answered honestly.</h2>
            </div>
            <div className="faq-grid">
              <div>
                <FaqItem q="Do I need to write the PDF guides myself?" a="Nothing to write. You pick the gap, click grow, and the system produces the full PDF guide, sales page, SEO article, and social hooks automatically. Your job is to share the buy link." />
                <FaqItem q="Do I need technical or marketing skills?" a="None. No coding, no design experience, no SEO knowledge required. If you can click a button and copy-paste text, you have everything you need." />
                <FaqItem q="How long before my first harvest?" a="Most planters have their first seed in the ground within an hour. Social can drive sales within 48 hours. We guarantee income from your first seed within 7 days — or your first month is fully refunded." />
              </div>
              <div>
                <FaqItem q="Are these niches already too competitive?" a="The opposite. Most high-intent topics in underserved markets have zero PDF guides published — that is the exact gap the system finds. The window is wide open, but it won't stay that way indefinitely." />
                <FaqItem q="Is £39 a month worth it?" a="One seed earning £8 a day returns £240 a month — six times your subscription cost from a single guide. The farm pays for itself in the first week. After that, every harvest is profit." />
                <FaqItem q="What if my seeds don't produce?" a="We refund your first month — no forms, no chasing. Plant your first seed within 7 days. If it doesn't earn, email us. Refund sent the same day." />
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <p>
            © {new Date().getFullYear()} PDF Seeds · Plant. Grow. Harvest. ·{" "}
            <a href="/dashboard">My Farm</a> ·{" "}
            <a href="/store">Browse Guides</a>
          </p>
        </footer>

        {/* ── MOBILE STICKY ── */}
        <div className="mobile-sticky">
          <a href={STRIPE}>Plant My First Seed — £39/month →</a>
        </div>

      </div>
    </>
  );
}
