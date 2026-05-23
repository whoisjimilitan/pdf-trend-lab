import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Seeds — Extra income that runs while you're at work.",
  description: "Find what people are urgently searching for but can't find a good answer to. Build a PDF guide in minutes. Earn every month — the same guide, automatically.",
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

function XIcon() {
  return (
    <span className="lp-x-icon">
      <svg className="lp-x-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
        .lp-nav-engine { font-size: 0.85rem; color: #6366F1; font-weight: 600; text-decoration: none; }
        .lp-nav-engine:hover { color: #4F46E5; }
        .lp-nav-cta { background: #6366F1; color: #fff; font-weight: 700; font-size: 0.85rem; padding: 9px 20px; border-radius: 8px; text-decoration: none; }
        .lp-nav-cta:hover { background: #4F46E5; }

        /* HERO */
        .lp-hero { padding: 100px 24px 88px; text-align: center; position: relative; overflow: hidden; background: #FFFFFF; }
        .lp-hero-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 65%); pointer-events: none; }
        .lp-hero-inner { max-width: 780px; margin: 0 auto; position: relative; z-index: 1; }
        .lp-eyebrow { display: inline-flex; align-items: center; gap: 6px; background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 20px; padding: 5px 14px; font-size: 0.78rem; font-weight: 700; color: #4F46E5; margin-bottom: 28px; }
        .lp h1 { font-size: clamp(2.6rem, 6.5vw, 4.4rem); font-weight: 900; line-height: 1.08; color: #0F172A; margin: 0 0 22px; letter-spacing: -0.03em; }
        .lp h1 em { color: #6366F1; font-style: normal; }
        .lp-hero-sub { font-size: 1.05rem; color: #64748B; line-height: 1.75; max-width: 560px; margin: 0 auto 32px; }
        .lp-hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-bottom: 18px; }
        .lp-btn-primary { display: inline-block; background: #6366F1; color: #fff; font-weight: 800; font-size: 0.95rem; padding: 15px 36px; border-radius: 10px; text-decoration: none; }
        .lp-btn-primary:hover { background: #4F46E5; }
        .lp-btn-ghost { display: inline-block; background: transparent; color: #64748B; font-weight: 600; font-size: 0.95rem; padding: 15px 26px; border-radius: 10px; text-decoration: none; border: 1px solid #E2E8F0; }
        .lp-btn-ghost:hover { border-color: #CBD5E1; color: #334155; }
        .lp-offer-line { font-size: 0.88rem; color: #16A34A; font-weight: 600; }

        /* SECTIONS */
        .lp-section { padding: 80px 24px; background: #FFFFFF; }
        .lp-section-alt { background: #F8FAFC; }
        .lp-inner { max-width: 1000px; margin: 0 auto; }
        .lp-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #94A3B8; margin-bottom: 12px; }
        .lp h2 { font-size: clamp(1.7rem, 3.5vw, 2.4rem); font-weight: 900; color: #0F172A; line-height: 1.15; margin: 0 0 16px; letter-spacing: -0.02em; }
        .lp-body { font-size: 0.97rem; color: #64748B; line-height: 1.8; }

        /* FOR WHOM */
        .for-whom-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 36px; }
        .for-whom-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px 20px; }
        .for-whom-icon { font-size: 1.6rem; margin-bottom: 12px; }
        .for-whom-title { font-size: 0.97rem; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
        .for-whom-body { font-size: 0.83rem; color: #64748B; line-height: 1.65; }

        /* CONTRAST TABLE */
        .contrast-wrap { margin-top: 40px; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; }
        .contrast-header { display: grid; grid-template-columns: 1fr 1fr; }
        .contrast-col-bad { padding: 14px 20px; background: #F8FAFC; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94A3B8; }
        .contrast-col-good { padding: 14px 20px; background: #EEF2FF; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #4F46E5; }
        .contrast-row { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid #E2E8F0; }
        .contrast-bad { padding: 18px 20px; display: flex; align-items: flex-start; gap: 10px; background: #FFFFFF; }
        .contrast-good { padding: 18px 20px; display: flex; align-items: flex-start; gap: 10px; background: #F5F7FF; border-left: 1px solid #E0E7FF; }
        .contrast-text { font-size: 0.87rem; line-height: 1.55; color: #475569; }
        .contrast-text strong { color: #0F172A; font-weight: 700; }
        .lp-x-icon { width: 18px; height: 18px; border-radius: 50%; background: #FEE2E2; border: 1px solid #FECACA; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
        .lp-x-svg { width: 9px; height: 9px; color: #DC2626; }
        .lp-check-icon { width: 18px; height: 18px; border-radius: 50%; background: #DCFCE7; border: 1px solid #BBF7D0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
        .lp-check-svg { width: 10px; height: 10px; color: #16A34A; }

        /* STEPS */
        .steps-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 44px; }
        .step-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px 24px; }
        .step-num { font-size: 2.5rem; font-weight: 900; color: #EEF2FF; line-height: 1; margin-bottom: 16px; letter-spacing: -0.02em; }
        .step-icon { font-size: 1.5rem; margin-bottom: 12px; }
        .step-title { font-size: 1rem; font-weight: 800; color: #0F172A; margin-bottom: 8px; }
        .step-body { font-size: 0.85rem; color: #64748B; line-height: 1.7; }
        .steps-cta { text-align: center; margin-top: 36px; }

        /* OPP CARDS */
        .opp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 40px; }
        .opp-simple { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px 20px; }
        .opp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .opp-badge-score { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: #DCFCE7; border: 1px solid #BBF7D0; color: #16A34A; }
        .opp-query { font-size: 0.9rem; color: #1E293B; line-height: 1.55; margin: 0 0 14px; font-style: italic; font-weight: 500; }
        .opp-meta { display: flex; gap: 8px; flex-wrap: wrap; }
        .opp-chip { font-size: 0.72rem; color: #64748B; background: #F1F5F9; border-radius: 6px; padding: 3px 8px; font-weight: 600; }
        .opp-chip-gap { background: #EEF2FF; color: #4F46E5; }
        .opp-cta { text-align: center; margin-top: 32px; }

        /* INCOME MATH — simple, honest */
        .income-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 40px; }
        .income-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 28px 20px; text-align: center; }
        .income-card-highlight { background: #6366F1; border-color: #6366F1; }
        .income-seeds { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 10px; }
        .income-card-highlight .income-seeds { color: rgba(255,255,255,0.6); }
        .income-num { font-size: 2rem; font-weight: 900; color: #0F172A; letter-spacing: -0.03em; line-height: 1; }
        .income-card-highlight .income-num { color: #FFFFFF; }
        .income-label { font-size: 0.78rem; color: #94A3B8; margin-top: 6px; }
        .income-card-highlight .income-label { color: rgba(255,255,255,0.55); }
        .income-note { text-align: center; color: #94A3B8; font-size: 0.78rem; margin-top: 16px; }

        /* PRICING */
        .pricing-box { max-width: 520px; margin: 0 auto; background: #FFFFFF; border: 2px solid rgba(99,102,241,0.2); border-radius: 20px; padding: 48px 40px; text-align: center; position: relative; overflow: hidden; box-shadow: 0 8px 32px rgba(99,102,241,0.08); }
        .pricing-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 280px; height: 2px; background: linear-gradient(to right, transparent, #6366F1, transparent); }
        .pricing-badge { display: inline-block; background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; border-radius: 20px; padding: 4px 14px; font-size: 0.72rem; font-weight: 700; margin-bottom: 20px; letter-spacing: 0.04em; text-transform: uppercase; }
        .pricing-title { font-size: 1.1rem; font-weight: 800; color: #0F172A; margin-bottom: 4px; }
        .pricing-sub { font-size: 0.85rem; color: #64748B; margin-bottom: 28px; }
        .pricing-amount { font-size: 4.5rem; font-weight: 900; color: #0F172A; line-height: 1; margin-bottom: 4px; letter-spacing: -0.03em; }
        .pricing-amount sup { font-size: 1.6rem; vertical-align: super; font-weight: 700; color: #94A3B8; }
        .pricing-period { font-size: 0.85rem; color: #94A3B8; margin-bottom: 32px; }
        .pricing-list { text-align: left; list-style: none; padding: 0; margin: 0 0 32px; display: flex; flex-direction: column; gap: 10px; }
        .pricing-list li { font-size: 0.88rem; color: #475569; display: flex; gap: 10px; align-items: flex-start; }
        .pricing-cta { display: block; background: #6366F1; color: #fff; font-weight: 800; font-size: 1rem; padding: 17px; border-radius: 12px; text-decoration: none; margin-bottom: 12px; }
        .pricing-cta:hover { background: #4F46E5; }
        .pricing-engine-link { display: block; font-size: 0.85rem; color: #6366F1; font-weight: 600; text-decoration: none; margin-bottom: 14px; }
        .pricing-engine-link:hover { color: #4F46E5; }
        .pricing-offer { font-size: 0.82rem; color: #16A34A; font-weight: 600; margin-bottom: 8px; }
        .pricing-guarantee { font-size: 0.75rem; color: #94A3B8; }

        /* FAQ */
        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 56px; }
        .faq-item { border-bottom: 1px solid #E2E8F0; }
        .faq-summary { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 0; cursor: pointer; list-style: none; gap: 16px; }
        .faq-q { font-size: 0.9rem; font-weight: 600; color: #1E293B; line-height: 1.4; }
        .faq-plus { color: #6366F1; font-size: 1.3rem; flex-shrink: 0; transition: transform 0.2s; line-height: 1; }
        details[open] .faq-plus { transform: rotate(45deg); }
        .faq-a { font-size: 0.88rem; color: #64748B; line-height: 1.75; padding-bottom: 20px; margin: 0; }

        /* FOOTER */
        .lp-footer { padding: 32px 24px; border-top: 1px solid #E2E8F0; text-align: center; background: #F8FAFC; }
        .lp-footer p { font-size: 0.78rem; color: #CBD5E1; margin: 0; }
        .lp-footer a { color: #94A3B8; text-decoration: none; }
        .lp-footer a:hover { color: #6366F1; }

        /* MOBILE STICKY */
        .mobile-sticky { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; background: #FFFFFF; border-top: 1px solid #E2E8F0; padding: 12px 16px; box-shadow: 0 -4px 12px rgba(0,0,0,0.06); }
        .mobile-sticky a { display: block; background: #6366F1; color: #fff; font-weight: 800; font-size: 0.9rem; padding: 15px; border-radius: 10px; text-decoration: none; text-align: center; }

        @media (max-width: 768px) {
          .lp h1 { font-size: 2.6rem; }
          .lp h2 { font-size: 1.7rem; }
          .lp-section { padding: 56px 20px; }
          .lp-hero { padding: 80px 20px 64px; }
          .for-whom-grid { grid-template-columns: 1fr; }
          .contrast-header { grid-template-columns: 1fr; }
          .contrast-col-bad { display: none; }
          .contrast-row { grid-template-columns: 1fr; }
          .contrast-bad { display: none; }
          .opp-grid-3 { grid-template-columns: 1fr; }
          .steps-3 { grid-template-columns: 1fr; }
          .income-strip { grid-template-columns: repeat(2, 1fr); }
          .faq-grid { grid-template-columns: 1fr; }
          .pricing-box { padding: 36px 24px; }
          .pricing-amount { font-size: 3.5rem; }
          .mobile-sticky { display: block; }
          body { padding-bottom: 80px; }
          .lp-nav-engine { display: none; }
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
              <a href="/engine" className="lp-nav-engine">Try the engine →</a>
              <a href="/dashboard" className="lp-nav-login">My Farm</a>
              <a href={STRIPE} className="lp-nav-cta">Start Planting →</a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="lp-hero-glow" />
          <div className="lp-hero-inner">
            <div className="lp-eyebrow">🌱 For people who want more money, not more work</div>
            <h1>
              Extra income that runs<br />
              <em>while you&rsquo;re at work.</em>
            </h1>
            <p className="lp-hero-sub">
              Find what people are urgently searching for but can&rsquo;t find a good answer to.
              Build the PDF guide in minutes. Earn every month — the same guide, automatically.
              No writing. No guessing. No clients.
            </p>
            <div className="lp-hero-ctas">
              <a href={STRIPE} className="lp-btn-primary">Start Planting — £39/month →</a>
              <a href="/engine" className="lp-btn-ghost">See the engine work ↗</a>
            </div>
            <p className="lp-offer-line">✅ First harvest in 7 days — or your first month is free.</p>
          </div>
        </section>

        {/* ── FOR WHOM ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div className="lp-label">This is for you if</div>
              <h2>You want real extra income — not another thing to manage.</h2>
            </div>
            <div className="for-whom-grid">
              {[
                {
                  icon: "💼",
                  title: "You have a job and want more money",
                  body: "PDF Seeds runs alongside your main income. You plant one afternoon. The guide earns every month while you do nothing different.",
                },
                {
                  icon: "✍️",
                  title: "You hate the idea of writing or creating content",
                  body: "You don't write a word. The engine finds the topic. AI builds the guide, sales page, and video scripts. Your job is to pick and share.",
                },
                {
                  icon: "🎯",
                  title: "You've tried things before that didn't work",
                  body: "Most attempts fail because you built something nobody wanted. PDF Seeds starts from demand — real searches, real pain, confirmed before you build anything.",
                },
              ].map((c, i) => (
                <div key={i} className="for-whom-card">
                  <div className="for-whom-icon">{c.icon}</div>
                  <div className="for-whom-title">{c.title}</div>
                  <div className="for-whom-body">{c.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE PROBLEM / CONTRAST ── */}
        <section className="lp-section">
          <div className="lp-inner">
            <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", marginBottom: 8 }}>
              <div className="lp-label">Why most attempts fail</div>
              <h2>The problem isn&rsquo;t effort.<br />It&rsquo;s starting from the wrong place.</h2>
              <p className="lp-body" style={{ marginTop: 12 }}>
                Most extra income attempts fail for the same reason — you build something first, then hope people want it.
                PDF Seeds flips that. Demand is confirmed before you build a single word.
              </p>
            </div>
            <div className="contrast-wrap">
              <div className="contrast-header">
                <div className="contrast-col-bad">What most people do</div>
                <div className="contrast-col-good">What PDF Seeds does instead</div>
              </div>
              {[
                {
                  bad: <>You <strong>guess what people want</strong> — spend weeks building something, then discover nobody's searching for it.</>,
                  good: <>The engine <strong>confirms real demand first</strong> — finds what people are actively searching for before you build a single page.</>,
                },
                {
                  bad: <>You <strong>write everything yourself</strong> — the guide, the sales page, the social posts. You run out of time or energy.</>,
                  good: <>AI <strong>writes the complete guide</strong>, sales page, and video scripts. You choose the topic and share the link.</>,
                },
                {
                  bad: <>You need <strong>a big audience to start</strong> — nobody buys because nobody knows you exist yet.</>,
                  good: <>No audience needed. <strong>Buyers find you through search and communities</strong> — people already looking for the answer you built.</>,
                },
                {
                  bad: <>You earn <strong>once per hour worked</strong> — stop working, stop earning. There&rsquo;s no ceiling but there&rsquo;s no rest either.</>,
                  good: <>The same guide <strong>earns every month</strong> — sell it once, collect forever. Plant more guides, multiply the harvest.</>,
                },
              ].map((row, i) => (
                <div key={i} className="contrast-row">
                  <div className="contrast-bad">
                    <XIcon />
                    <span className="contrast-text">{row.bad}</span>
                  </div>
                  <div className="contrast-good">
                    <CheckIcon />
                    <span className="contrast-text">{row.good}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="lp-section lp-section-alt" id="how-it-works">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div className="lp-label">How it works</div>
              <h2>Three steps. One afternoon to your first seed.</h2>
            </div>
            <div className="steps-3">
              {[
                {
                  num: "01", icon: "🔍", title: "Find the empty shelf",
                  body: "The engine scans live search data — Google, YouTube, Bing, Reddit, Quora — and finds where urgent demand exists but no quality PDF guide does. Real gap, confirmed before you do anything.",
                },
                {
                  num: "02", icon: "🌱", title: "Plant the seed",
                  body: "Choose an opportunity. One click generates the complete PDF guide, sales page copy, video scripts, and distribution strategy. You don't write a word.",
                },
                {
                  num: "03", icon: "🌾", title: "Harvest monthly",
                  body: "Share the link. Buyers find it through search and communities. The same guide earns every month — no ongoing work, no maintenance, no clients.",
                },
              ].map((s, i) => (
                <div key={i} className="step-card">
                  <div className="step-num">{s.num}</div>
                  <div className="step-icon">{s.icon}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-body">{s.body}</div>
                </div>
              ))}
            </div>
            <div className="steps-cta">
              <a href="/engine" className="lp-btn-ghost" style={{ marginRight: 12 }}>See the engine find live opportunities →</a>
            </div>
          </div>
        </section>

        {/* ── SEEDS PREVIEW ── */}
        <section className="lp-section">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div className="lp-label">What the engine finds</div>
              <h2>Real searches. No PDF guide yet.<br />These are your seeds.</h2>
            </div>
            <div className="opp-grid-3">
              {[
                {
                  flag: "🇳🇬", country: "Nigeria",
                  query: "How to register a business in Nigeria step by step",
                  volume: "6,800 / month", gap: "empty shelf", score: "score: 91",
                },
                {
                  flag: "🇰🇪", country: "Kenya",
                  query: "How to start a small poultry farm in Kenya with little money",
                  volume: "3,600 / month", gap: "empty shelf", score: "score: 87",
                },
                {
                  flag: "🇬🇧", country: "UK Diaspora",
                  query: "How to renew a Nigerian passport from the UK",
                  volume: "2,900 / month", gap: "empty shelf", score: "score: 94",
                },
              ].map((opp, i) => (
                <div key={i} className="opp-simple">
                  <div className="opp-header">
                    <span style={{ fontSize: "1.3rem" }}>{opp.flag}</span>
                    <span className="opp-badge-score">{opp.score}</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 600, marginBottom: 8 }}>{opp.country}</div>
                  <div className="opp-query">&ldquo;{opp.query}&rdquo;</div>
                  <div className="opp-meta">
                    <span className="opp-chip">{opp.volume}</span>
                    <span className="opp-chip opp-chip-gap">{opp.gap}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="opp-cta">
              <a href="/engine" className="lp-btn-primary">Find your first seed →</a>
              <p style={{ fontSize: "0.78rem", color: "#CBD5E1", marginTop: 10 }}>
                The engine scores every topic for pain intensity, market gap, and PDF fit — so you only build what can sell.
              </p>
            </div>
          </div>
        </section>

        {/* ── INCOME MATH ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div className="lp-label">The harvest math</div>
              <h2>One seed earns. Ten seeds compound.</h2>
              <p className="lp-body" style={{ maxWidth: 480, margin: "12px auto 0" }}>
                Every guide you plant runs independently. Most planters start with one and add more as the first earns back the cost.
              </p>
            </div>
            <div className="income-strip">
              {[
                { seeds: "1 seed",    monthly: "£240", label: "per month" },
                { seeds: "3 seeds",   monthly: "£720", label: "per month" },
                { seeds: "5 seeds",   monthly: "£1,200", label: "per month" },
                { seeds: "10 seeds",  monthly: "£2,400", label: "per month", highlight: true },
              ].map((row, i) => (
                <div key={i} className={`income-card${row.highlight ? " income-card-highlight" : ""}`}>
                  <div className="income-seeds">{row.seeds}</div>
                  <div className="income-num">{row.monthly}</div>
                  <div className="income-label">{row.label}</div>
                </div>
              ))}
            </div>
            <p className="income-note">Illustrative averages — some seeds earn more, some less. All compound.</p>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="lp-section" id="start">
          <div className="lp-inner" style={{ textAlign: "center", marginBottom: 44 }}>
            <div className="lp-label">Start your farm</div>
            <h2>Everything you need.<br />One simple price.</h2>
          </div>
          <div className="pricing-box">
            <div className="pricing-glow" />
            <div className="pricing-badge">🌱 Founding Farmer Pricing</div>
            <div className="pricing-title">PDF Seeds — Full Farm Access</div>
            <div className="pricing-amount"><sup>£</sup>39</div>
            <div className="pricing-period">per month · cancel anytime</div>
            <ul className="pricing-list">
              {[
                "The engine finds real, underserved demand — so you only plant seeds that can grow",
                "AI generates the complete guide, sales page, and video scripts — you write nothing",
                "Gap scoring shows exactly where the empty shelf is before you build",
                "One dashboard — every seed, every harvest, all in one place",
              ].map((item, i) => (
                <li key={i}><CheckIcon />{item}</li>
              ))}
            </ul>
            <a href={STRIPE} className="pricing-cta">Start Planting — £39/month →</a>
            <a href="/engine" className="pricing-engine-link">Try the engine first (free scan) →</a>
            <div className="pricing-offer">✅ First harvest in 7 days — or your first month is free.</div>
            <div className="pricing-guarantee">30-day money-back guarantee · No questions asked · Cancel anytime</div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="lp-section lp-section-alt" id="faq">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-label">Before you plant</div>
              <h2>Your questions, answered honestly.</h2>
            </div>
            <div className="faq-grid">
              <div>
                <FaqItem
                  q="Will this actually work for me?"
                  a="If you pick a topic the engine scored as a genuine gap — real demand, no quality guide yet — the guide earns. Most planters see their first sale within a week of sharing the link in the right community."
                />
                <FaqItem
                  q="I don't have time for another project."
                  a="Your first seed takes 2 hours: one engine scan, one click to generate. After that, 5 minutes a day to share a hook. The guide earns while you do nothing."
                />
                <FaqItem
                  q="I've tried online income things before and failed."
                  a="Most attempts fail because you built something without confirmed demand. PDF Seeds starts with demand — real search data, scored for pain and market gap — before you build anything. You're not guessing."
                />
              </div>
              <div>
                <FaqItem
                  q="Do I need an audience or social following?"
                  a="No. Buyers find the guide through search, communities, and shared links — you don't need to be known to anyone. The PDF sells on the strength of the topic, not your name."
                />
                <FaqItem
                  q="Is £39/month worth it?"
                  a="One seed returning £240/month is 6× your subscription cost. The engine tells you whether the gap exists before you invest a single hour — so you're never building blind."
                />
                <FaqItem
                  q="Do I need any skills — writing, design, tech?"
                  a="None. The engine finds the topic. AI builds the guide, sales page, and video scripts. You pick, share, and earn. No writing, no design, no coding."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ padding: "80px 24px", background: "#6366F1", textAlign: "center" }}>
          <div style={{ maxWidth: 580, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, color: "#FFFFFF", margin: "0 0 14px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Ready to plant your first seed?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", marginBottom: 32, lineHeight: 1.7 }}>
              The engine is live right now — running real scans, finding real gaps.
              Your first harvest could be 7 days away.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={STRIPE} style={{ display: "inline-block", background: "#FFFFFF", color: "#6366F1", fontWeight: 800, fontSize: "1rem", padding: "17px 40px", borderRadius: "12px", textDecoration: "none" }}>
                Start Planting — £39/month →
              </a>
              <a href="/engine" style={{ display: "inline-block", background: "transparent", color: "#FFFFFF", fontWeight: 600, fontSize: "1rem", padding: "17px 28px", borderRadius: "12px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.35)" }}>
                Try the engine first →
              </a>
            </div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", marginTop: 20 }}>
              30-day money-back guarantee · Cancel anytime · No questions asked
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <p>
            © {new Date().getFullYear()} PDF Seeds · Plant. Grow. Harvest. ·{" "}
            <a href="/engine">Engine</a> ·{" "}
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
