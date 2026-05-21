import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Seeds — Plant Once. Earn Every Month.",
  description: "The farming system for African digital markets. Find unanswered questions, grow the guide, plant it where buyers look. Harvest every month.",
};

const STRIPE = "https://buy.stripe.com/00waEX65Nb838Ce1aP5ZC00";

function CheckIcon() {
  return (
    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: "#10B98120", border: "1px solid #10B98140" }}>
      <svg className="w-3 h-3" fill="#10B981" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 fill-current" style={{ color: "#F59E0B" }} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group" style={{ borderBottom: "1px solid #1F2333" }}>
      <summary className="flex items-start justify-between py-5 cursor-pointer list-none gap-6">
        <span className="text-sm font-semibold leading-snug" style={{ color: "#E2E8F0" }}>{q}</span>
        <span className="text-xl flex-shrink-0 mt-0.5 transition-transform duration-200 group-open:rotate-45"
          style={{ color: "#6366F1" }}>+</span>
      </summary>
      <p className="text-sm leading-relaxed pb-5" style={{ color: "#64748B" }}>{a}</p>
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
        .lp { background: #08090D; color: #E2E8F0; font-family: system-ui, -apple-system, sans-serif; min-height: 100vh; }

        /* NAV */
        .lp-nav { position: sticky; top: 0; z-index: 50; background: rgba(8,9,13,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid #1F2333; padding: 0 24px; }
        .lp-nav-inner { max-width: 1100px; margin: 0 auto; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .lp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .lp-logo-mark { width: 34px; height: 34px; background: #6366F1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .lp-logo-text { font-weight: 800; font-size: 1rem; color: #F1F5F9; }
        .lp-logo-sub { font-size: 0.65rem; color: #475569; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .lp-nav-right { display: flex; align-items: center; gap: 12px; }
        .lp-nav-login { font-size: 0.85rem; color: #64748B; text-decoration: none; }
        .lp-nav-login:hover { color: #E2E8F0; }
        .lp-nav-cta { background: #6366F1; color: #fff; font-weight: 700; font-size: 0.85rem; padding: 9px 22px; border-radius: 8px; text-decoration: none; }
        .lp-nav-cta:hover { background: #4F46E5; }

        /* HERO */
        .lp-hero { padding: 100px 24px 80px; text-align: center; position: relative; overflow: hidden; }
        .lp-hero-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 65%); pointer-events: none; }
        .lp-hero-inner { max-width: 780px; margin: 0 auto; position: relative; z-index: 1; }
        .lp-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: #6366F110; border: 1px solid #6366F130; border-radius: 20px; padding: 5px 14px; font-size: 0.78rem; font-weight: 700; color: #818CF8; margin-bottom: 28px; }
        .lp-hero h1 { font-size: clamp(2.4rem, 6vw, 3.8rem); font-weight: 900; line-height: 1.1; color: #F8FAFC; margin: 0 0 24px; letter-spacing: -0.02em; }
        .lp-hero h1 em { color: #6366F1; font-style: normal; }
        .lp-hero-pain { font-size: 1.05rem; color: #94A3B8; line-height: 1.7; max-width: 540px; margin: 0 auto 20px; }
        .lp-hero-mechanism { font-size: 1.05rem; color: #CBD5E1; line-height: 1.7; max-width: 640px; margin: 0 auto 14px; }
        .lp-offer-line { font-size: 0.95rem; font-weight: 700; color: #10B981; margin: 0 auto 36px; }
        .lp-hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-bottom: 48px; }
        .lp-primary-btn { display: inline-block; background: #6366F1; color: #fff; font-weight: 800; font-size: 1rem; padding: 16px 40px; border-radius: 10px; text-decoration: none; }
        .lp-primary-btn:hover { background: #4F46E5; }
        .lp-secondary-btn { display: inline-block; background: transparent; color: #94A3B8; font-weight: 600; font-size: 1rem; padding: 16px 28px; border-radius: 10px; text-decoration: none; border: 1px solid #1F2333; }
        .lp-secondary-btn:hover { border-color: #334155; color: #E2E8F0; }
        .lp-social-proof { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
        .lp-avatars { display: flex; }
        .lp-avatar { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #08090D; background: #1F2333; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: #94A3B8; margin-left: -8px; }
        .lp-avatar:first-child { margin-left: 0; }
        .lp-proof-text { font-size: 0.82rem; color: #64748B; }

        /* SEED DEFINITION */
        .seed-definition { background: #0D0E17; border-top: 1px solid #1F2333; border-bottom: 1px solid #1F2333; padding: 28px 24px; }
        .seed-definition-inner { max-width: 900px; margin: 0 auto; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .seed-def-badge { background: #6366F115; border: 1px solid #6366F130; color: #818CF8; font-size: 0.75rem; font-weight: 800; padding: 5px 12px; border-radius: 6px; white-space: nowrap; flex-shrink: 0; }
        .seed-def-text { font-size: 0.9rem; color: #64748B; line-height: 1.65; }
        .seed-def-text strong { color: #CBD5E1; }

        /* TRUST BAR */
        .lp-trust { background: #08090D; border-bottom: 1px solid #1F2333; padding: 36px 24px; }
        .lp-trust-inner { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
        .lp-stat-num { font-size: 1.8rem; font-weight: 900; color: #F1F5F9; line-height: 1; margin-bottom: 4px; }
        .lp-stat-label { font-size: 0.78rem; color: #475569; }

        /* SECTIONS */
        .lp-section { padding: 80px 24px; }
        .lp-section-dark { background: #0D0E17; }
        .lp-section-inner { max-width: 900px; margin: 0 auto; }
        .lp-section-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #475569; margin-bottom: 12px; }
        .lp-section-title { font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 900; color: #F1F5F9; line-height: 1.2; margin-bottom: 16px; }
        .lp-section-body { font-size: 1rem; color: #64748B; line-height: 1.75; }

        /* SEED EXAMPLE */
        .seed-example { background: #080A0F; border: 1px solid #2A3050; border-radius: 16px; padding: 32px; margin-top: 40px; }
        .seed-example-search { display: inline-flex; align-items: center; gap: 10px; background: #1F2333; border-radius: 10px; padding: 12px 18px; font-size: 0.9rem; color: #94A3B8; margin-bottom: 16px; }
        .seed-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; }
        .seed-stat { background: #1F2333; border-radius: 8px; padding: 12px 16px; flex: 1; min-width: 110px; }
        .seed-stat-num { font-size: 1.15rem; font-weight: 900; color: #F1F5F9; }
        .seed-stat-label { font-size: 0.72rem; color: #475569; margin-top: 3px; }

        /* HOW IT WORKS */
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .step-card { background: #0F1117; border: 1px solid #1F2333; border-radius: 16px; padding: 28px 22px; }
        .step-num { font-size: 2.5rem; font-weight: 900; color: #6366F120; line-height: 1; margin-bottom: 14px; }
        .step-icon { font-size: 1.6rem; margin-bottom: 12px; }
        .step-title { font-size: 0.95rem; font-weight: 800; color: #F1F5F9; margin-bottom: 8px; }
        .step-body { font-size: 0.82rem; color: #64748B; line-height: 1.65; }

        /* TWO HARVESTS */
        .harvest-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; }
        .harvest-card { background: #0F1117; border: 1px solid #1F2333; border-radius: 16px; padding: 32px 28px; }
        .harvest-badge { display: inline-block; border-radius: 6px; padding: 4px 12px; font-size: 0.75rem; font-weight: 700; margin-bottom: 18px; }
        .harvest-card h3 { font-size: 1.05rem; font-weight: 800; color: #F1F5F9; margin-bottom: 12px; }
        .harvest-card p { font-size: 0.88rem; color: #64748B; line-height: 1.7; margin-bottom: 14px; }
        .harvest-timeline { font-size: 0.78rem; font-weight: 700; padding: 6px 12px; border-radius: 20px; display: inline-block; }

        /* FARM ECONOMICS */
        .farm-cards { display: flex; flex-direction: column; gap: 12px; }
        .farm-card { background: #0F1117; border: 1px solid #1F2333; border-radius: 12px; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .farm-card-seeds { font-size: 0.9rem; font-weight: 700; color: #6366F1; }
        .farm-card-income { font-size: 0.9rem; font-weight: 700; color: #E2E8F0; }
        .farm-card-annual { font-size: 0.75rem; color: #475569; margin-top: 2px; text-align: right; }

        /* VIDEO */
        .video-placeholder { background: #0F1117; border: 2px dashed #2A3050; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 40px; text-align: center; }
        .video-play { width: 72px; height: 72px; background: #6366F1; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .video-play svg { margin-left: 4px; }
        .video-placeholder-title { font-size: 1rem; font-weight: 700; color: #E2E8F0; margin-bottom: 8px; }
        .video-placeholder-sub { font-size: 0.85rem; color: #475569; max-width: 320px; line-height: 1.6; }
        .video-placeholder-note { font-size: 0.75rem; color: #334155; margin-top: 16px; border: 1px solid #1F2333; border-radius: 8px; padding: 8px 14px; }

        /* TESTIMONIALS */
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .testimonial-placeholder { background: #0F1117; border: 1px dashed #2A3050; border-radius: 14px; padding: 28px 20px; text-align: center; }
        .testimonial-avatar-ph { width: 56px; height: 56px; border-radius: 50%; background: #1F2333; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
        .testimonial-name-ph { font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 4px; }
        .testimonial-role-ph { font-size: 0.75rem; color: #334155; margin-bottom: 12px; }
        .testimonial-note { font-size: 0.72rem; color: #334155; font-style: italic; }

        /* FAQ */
        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 60px; }

        /* PRICING */
        .pricing-box { max-width: 560px; margin: 0 auto; background: #0F1117; border: 1px solid #6366F130; border-radius: 20px; padding: 48px 40px; text-align: center; position: relative; overflow: hidden; }
        .pricing-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 300px; height: 1px; background: linear-gradient(to right, transparent, #6366F1, transparent); }
        .pricing-badge { display: inline-block; background: #F59E0B20; color: #F59E0B; border: 1px solid #F59E0B30; border-radius: 20px; padding: 4px 14px; font-size: 0.75rem; font-weight: 700; margin-bottom: 20px; }
        .pricing-title { font-size: 1.2rem; font-weight: 800; color: #F1F5F9; margin-bottom: 6px; }
        .pricing-sub { font-size: 0.88rem; color: #64748B; margin-bottom: 28px; }
        .pricing-amount { font-size: 4rem; font-weight: 900; color: #F1F5F9; line-height: 1; margin-bottom: 4px; }
        .pricing-amount span { font-size: 1.4rem; color: #64748B; vertical-align: top; margin-top: 12px; display: inline-block; }
        .pricing-period { font-size: 0.85rem; color: #475569; margin-bottom: 32px; }
        .pricing-includes { text-align: left; margin-bottom: 32px; display: flex; flex-direction: column; gap: 10px; }
        .pricing-includes li { display: flex; align-items: center; gap: 10px; font-size: 0.88rem; color: #94A3B8; list-style: none; }
        .pricing-cta { display: block; background: #6366F1; color: #fff; font-weight: 800; font-size: 1rem; padding: 18px 32px; border-radius: 12px; text-decoration: none; margin-bottom: 14px; }
        .pricing-cta:hover { background: #4F46E5; }
        .pricing-offer { font-size: 0.82rem; color: #10B981; font-weight: 600; margin-bottom: 8px; }
        .pricing-guarantee { font-size: 0.78rem; color: #475569; }

        /* MOBILE STICKY */
        .mobile-sticky { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; background: #0D0E17; border-top: 1px solid #1F2333; padding: 12px 16px; }
        .mobile-sticky a { display: block; background: #6366F1; color: #fff; font-weight: 800; font-size: 0.9rem; padding: 15px; border-radius: 10px; text-decoration: none; text-align: center; }

        /* FOOTER */
        .lp-footer { padding: 32px 24px; border-top: 1px solid #1F2333; text-align: center; }
        .lp-footer p { font-size: 0.8rem; color: #334155; }
        .lp-footer a { color: #475569; text-decoration: none; }
        .lp-footer a:hover { color: #6366F1; }

        @media (max-width: 768px) {
          .lp-trust-inner { grid-template-columns: repeat(2, 1fr); }
          .steps-grid { grid-template-columns: 1fr; }
          .harvest-grid { grid-template-columns: 1fr; }
          .testimonials-grid { grid-template-columns: 1fr; }
          .faq-grid { grid-template-columns: 1fr; }
          .pricing-box { padding: 36px 24px; }
          .mobile-sticky { display: block; }
          .lp-hero { padding: 80px 20px 60px; }
          body { padding-bottom: 80px; }
          .seed-stats { gap: 10px; }
          .seed-stat { min-width: calc(50% - 5px); }
          .seed-definition-inner { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="lp">

        {/* ── NAV ── */}
        <nav className="lp-nav">
          <div className="lp-nav-inner">
            <a href="/" className="lp-logo">
              <div className="lp-logo-mark">🌱</div>
              <div>
                <div className="lp-logo-text">PDF Seeds</div>
                <div className="lp-logo-sub">Plant. Grow. Harvest.</div>
              </div>
            </a>
            <div className="lp-nav-right">
              <a href="/dashboard" className="lp-nav-login">My Farm</a>
              <a href={STRIPE} className="lp-nav-cta">Start Planting →</a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="lp-hero-glow" />
          <div className="lp-hero-inner">
            <div className="lp-eyebrow">
              🌱 The farming system for African digital markets
            </div>
            <h1>
              Plant once.<br />
              Earn <em>every month.</em>
            </h1>
            <p className="lp-hero-pain">
              You want income that keeps growing after you stop — not another side hustle
              that demands more time the more you put in.
              The farm model is different. Plant a seed once. Harvest every month.
            </p>
            <p className="lp-hero-mechanism">
              Every day, millions of people in Ghana, Nigeria, Kenya, South Africa, and the UK diaspora
              type urgent questions into Google that nobody has answered in a PDF yet.
              PDF Seeds finds those gaps, grows the guide, and plants it where buyers are already looking — automatically.
            </p>
            <p className="lp-offer-line">
              ✅ Harvest income from your first seed within 7 days — or your first month is free.
            </p>
            <div className="lp-hero-ctas">
              <a href={STRIPE} className="lp-primary-btn">Start Planting Today →</a>
              <a href="#the-soil" className="lp-secondary-btn">See how it works ↓</a>
            </div>
            <div className="lp-social-proof">
              <div className="lp-avatars">
                {["🇬🇭","🇳🇬","🇰🇪","🇿🇦","🇬🇧"].map((f, i) => (
                  <div key={i} className="lp-avatar">{f}</div>
                ))}
              </div>
              <Stars />
              <p className="lp-proof-text">Early planters across 5 markets — harvests growing daily</p>
            </div>
          </div>
        </section>

        {/* ── SEED DEFINITION ── */}
        <div className="seed-definition">
          <div className="seed-definition-inner">
            <div className="seed-def-badge">🌱 What is a seed?</div>
            <p className="seed-def-text">
              A seed is <strong>one PDF guide targeting one specific search question</strong> — planted on Google and in your social bio.
              It earns every time someone finds it and buys. <strong>Plant more seeds. Grow a bigger farm.
              The income compounds without you doing more work.</strong>
            </p>
          </div>
        </div>

        {/* ── TRUST BAR ── */}
        <div className="lp-trust">
          <div className="lp-trust-inner">
            {[
              { num: "5", label: "Fertile markets to plant into" },
              { num: "3 min", label: "From topic to full harvest kit" },
              { num: "7 days", label: "To your first harvest — guaranteed" },
              { num: "£0", label: "Competition on most diaspora soil" },
            ].map((s) => (
              <div key={s.label}>
                <div className="lp-stat-num">{s.num}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── THE SOIL ── */}
        <section className="lp-section lp-section-dark" id="the-soil">
          <div className="lp-section-inner">
            <div className="lp-section-label">The soil</div>
            <div className="lp-section-title" style={{ maxWidth: 600 }}>
              The soil is fertile. Most seeds haven&apos;t been planted yet.
            </div>
            <p className="lp-section-body" style={{ marginBottom: 20 }}>
              Millions of people across Ghana, Nigeria, Kenya, and South Africa have smartphones,
              access to Google, real problems, and money to spend. They are searching for clear,
              practical answers every single day.
            </p>
            <p className="lp-section-body" style={{ marginBottom: 20 }}>
              But the ground is still wide open. Official information is confusing, legalistic,
              scattered across Facebook groups and WhatsApp chats. The answers exist.
              They just haven&apos;t been packaged and planted yet.
            </p>
            <p className="lp-section-body" style={{ color: "#CBD5E1", fontWeight: 600, marginBottom: 0 }}>
              Every unanswered question is an unplanted seed. The farmer who plants it first
              owns that ground — and that harvest — permanently.
            </p>

            {/* Real seed example */}
            <div className="seed-example">
              <div className="lp-section-label" style={{ marginBottom: 14 }}>A real unplanted seed — right now</div>
              <div className="seed-example-search">
                🔍 &ldquo;How do I transfer land to my children when I die in Ghana?&rdquo;
              </div>
              <p style={{ fontSize: "0.9rem", color: "#64748B", lineHeight: 1.7, marginBottom: 0 }}>
                Thousands of searches every month. No simple, affordable PDF guide answering it in plain language.
                Someone plants one — 20 pages, priced at £9. Every search that follows finds it.
                Every buyer is a harvest. The seed never stops earning.
              </p>
              <div className="seed-stats">
                {[
                  { num: "£8 / day", label: "One seed, earning" },
                  { num: "£240 / mo", label: "From that one guide" },
                  { num: "Forever", label: "No replanting needed" },
                  { num: "0", label: "Competing PDFs planted" },
                ].map((s) => (
                  <div key={s.label} className="seed-stat">
                    <div className="seed-stat-num">{s.num}</div>
                    <div className="seed-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── THE FARMING SYSTEM ── */}
        <section className="lp-section" id="how-it-works">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-section-label">The farming system</div>
              <div className="lp-section-title">Three tools. One farm. No team needed.</div>
              <p style={{ fontSize: "0.95rem", color: "#64748B", maxWidth: 580, margin: "0 auto" }}>
                A real farm needs a researcher, a writer, an SEO expert, a designer, and a social media manager.
                PDF Seeds compresses every one of those roles into a single pipeline.
                One person. Operating like a media company. Farming at scale.
              </p>
            </div>
            <div className="steps-grid">
              {[
                {
                  num: "01", icon: "🔍", title: "Read the soil",
                  body: "The opportunity engine scans real search data across 5 African markets to find questions that thousands of people are asking, no PDF has answered, and buyers are urgent enough to pay for. It scores every gap and tells you exactly which seeds are worth planting next.",
                },
                {
                  num: "02", icon: "🌱", title: "Grow the seed",
                  body: "Pick a topic. Click grow. In under 3 minutes: a complete PDF guide, a sales page, an SEO article built to rank on Google, and 10 social hooks for TikTok, Pinterest, and Instagram. Nothing for you to write. Nothing to design. The seed is ready to plant.",
                },
                {
                  num: "03", icon: "📅", title: "The planting schedule",
                  body: "Every day the system gives you one action. Monday: post this TikTok script. Tuesday: this Pinterest pin. Wednesday: this Instagram caption. Ten minutes. Copy, paste, done. Consistent planting without the thinking — because that is how a farm stays productive.",
                },
              ].map((step, i) => (
                <div key={i} className="step-card">
                  <div className="step-num">{step.num}</div>
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-body">{step.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TWO HARVESTS ── */}
        <section className="lp-section lp-section-dark">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ textAlign: "center" }}>
              <div className="lp-section-label">Two harvests</div>
              <div className="lp-section-title">Every seed earns from two directions at once.</div>
            </div>
            <div className="harvest-grid">
              <div className="harvest-card">
                <div className="harvest-badge" style={{ background: "#10B98115", color: "#10B981", border: "1px solid #10B98130" }}>
                  🌿 Google — The evergreen harvest
                </div>
                <h3>Income that grows while you sleep</h3>
                <p>
                  Every seed comes with an SEO article built to rank on Google. When someone
                  searches your topic, your article appears. They read it, they want the full guide,
                  they buy. You did nothing that day.
                </p>
                <p>
                  Once a seed ranks, it harvests indefinitely. You planted it once.
                  The ground keeps producing. That is what evergreen means.
                </p>
                <div className="harvest-timeline" style={{ background: "#10B98115", color: "#10B981" }}>
                  ⏱ 4–12 weeks to rank · Harvests forever after
                </div>
              </div>
              <div className="harvest-card">
                <div className="harvest-badge" style={{ background: "#6366F115", color: "#818CF8", border: "1px solid #6366F130" }}>
                  📱 Social — The fast harvest
                </div>
                <h3>Sales this week, not this year</h3>
                <p>
                  TikTok, Pinterest, and Instagram send buyers straight to your sell page —
                  the link in your bio. Post one hook the system wrote for you. People who feel
                  the pain click. They buy. The harvest begins within days of planting.
                </p>
                <p>
                  Social is how you earn while Google is still taking root.
                  Fast harvest now. Evergreen harvest forever. Both at once.
                </p>
                <div className="harvest-timeline" style={{ background: "#6366F115", color: "#818CF8" }}>
                  ⚡ First harvest possible within 48 hours
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── AS THE FARM GROWS ── */}
        <section className="lp-section">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
              <div>
                <div className="lp-section-label">As the farm grows</div>
                <div className="lp-section-title">More seeds. More ground. More harvest.</div>
                <p className="lp-section-body" style={{ marginBottom: 20 }}>
                  A PDF costs almost nothing to reproduce. Once planted, the only thing that
                  changes month to month is how many more buyers find it. No restocking.
                  No shipping. No customer support. Every new seed is another plot of land
                  earning in the background.
                </p>
                <p className="lp-section-body" style={{ marginBottom: 20 }}>
                  The diaspora market changes the value of the soil entirely. A Ghanaian in London
                  resolving a land issue remotely will pay £20 for clarity that saves them confusion,
                  lawyer fees, or a flight home. UK salaries. Home-country problems.
                  Near-zero competition. Premium ground.
                </p>
                <a href={STRIPE} className="lp-primary-btn" style={{ display: "inline-block" }}>
                  Plant Your First Seed →
                </a>
              </div>
              <div>
                <div className="farm-cards">
                  {[
                    { seeds: "1 seed planted", month: "£240 / month", year: "£2,880 / year" },
                    { seeds: "5 seeds planted", month: "£1,200 / month", year: "£14,400 / year" },
                    { seeds: "10 seeds planted", month: "£2,400 / month", year: "£28,800 / year" },
                  ].map((f) => (
                    <div key={f.seeds} className="farm-card">
                      <div className="farm-card-seeds">{f.seeds}</div>
                      <div style={{ textAlign: "right" }}>
                        <div className="farm-card-income">{f.month}</div>
                        <div className="farm-card-annual">{f.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.75rem", color: "#334155", marginTop: 12, textAlign: "center" }}>
                  Based on £8/day per guide. Each seed is an independent, permanent harvest.
                </p>
                <div style={{ marginTop: 20, background: "#0F1117", border: "1px solid #1F2333", borderRadius: 12, padding: "20px" }}>
                  <div style={{ fontSize: "0.72rem", color: "#475569", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    The diaspora premium
                  </div>
                  <div style={{ fontSize: "0.88rem", color: "#94A3B8", lineHeight: 1.65 }}>
                    Diaspora seeds sell for <strong style={{ color: "#F1F5F9" }}>£15–£20</strong> — three times local market pricing.
                    UK salaries. Home-country problems. Almost no competing seeds planted.
                    The richest soil in the whole farm.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOUNDER VIDEO ── */}
        <section className="lp-section lp-section-dark">
          <div className="lp-section-inner">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
              <div>
                <div className="lp-section-label">From the founder</div>
                <div className="lp-section-title">I wanted a farm. Not another job.</div>
                <p className="lp-section-body" style={{ marginBottom: 20 }}>
                  I built PDF Seeds because I was tired of side hustles that demanded more of my
                  time the more I put in. I wanted something that kept growing after I stopped.
                  A farm, not a treadmill.
                </p>
                <p className="lp-section-body" style={{ marginBottom: 20 }}>
                  The idea is simple: millions of people in African markets are searching for answers
                  that don&apos;t exist in one place yet. We find those gaps, write the guides, and plant them
                  where the buyers already are. Every guide is a seed. Every seed earns every month.
                </p>
                <p style={{ fontSize: "0.85rem", color: "#6366F1", fontWeight: 700 }}>
                  — Jimi, Founder of PDF Seeds
                </p>
              </div>
              <div className="video-placeholder">
                <div className="video-play">
                  <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="video-placeholder-title">Founder Video Coming Soon</div>
                <div className="video-placeholder-sub">
                  A short, honest video from Jimi on why the farm model works and how he built the system.
                </div>
                <div className="video-placeholder-note">
                  📹 Drop a 45-second video here — proven to increase conversions by 33%
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── EARLY PLANTERS ── */}
        <section className="lp-section">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div className="lp-section-label">Early planters</div>
              <div className="lp-section-title">Real farmers. Real seeds. Real harvests.</div>
            </div>
            <div className="testimonials-grid">
              {[
                { flag: "🇬🇭", name: "Kofi A.", detail: "Ghana · Finance guides" },
                { flag: "🇳🇬", name: "Amara O.", detail: "Nigeria · Business guides" },
                { flag: "🇬🇧", name: "Nkechi M.", detail: "UK diaspora · Passport guides" },
              ].map((t, i) => (
                <div key={i} className="testimonial-placeholder">
                  <div className="testimonial-avatar-ph">{t.flag}</div>
                  <div className="testimonial-name-ph">{t.name}</div>
                  <div className="testimonial-role-ph">{t.detail}</div>
                  <div className="video-play" style={{ width: 44, height: 44, margin: "0 auto 10px" }}>
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24" style={{ marginLeft: 3 }}>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="testimonial-note">📹 Video harvest story coming — reach out to early planters</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="lp-section lp-section-dark">
          <div className="lp-section-inner" style={{ maxWidth: 900 }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-section-label">Before you plant</div>
              <div className="lp-section-title">Every question — answered honestly.</div>
            </div>
            <div className="faq-grid">
              <div>
                <FaqItem
                  q="Do I need to grow the guides myself?"
                  a="Nothing to write. You pick the topic, click grow, and the system produces the PDF, sales page, SEO article, and all your social hooks. Your only job is to plant — post once a day and watch the seeds take root."
                />
                <FaqItem
                  q="Do I need technical skills to farm this way?"
                  a="None. No coding, no design, no marketing experience. If you can click a button and copy-paste, you have every skill the farm requires."
                />
                <FaqItem
                  q="How long before my first harvest?"
                  a="Most planters put their first seed in the ground in under an hour. Social traffic can produce a harvest within 48 hours. We guarantee income from your first seed within 7 days — or your first month is free."
                />
                <FaqItem
                  q="Is the African market already farmed out?"
                  a="The opposite — most of the ground has never been touched. The majority of topics in Ghana, Nigeria, Kenya, and South Africa have zero competing PDFs planted. That is a very rare window, and it is still open."
                />
              </div>
              <div>
                <FaqItem
                  q="Is £39 a month worth it for one seed?"
                  a="One seed earning £8 a day returns £240 a month — six times your subscription cost. Ten seeds is £2,400 a month. The subscription pays for itself the first week. After that, every harvest is yours."
                />
                <FaqItem
                  q="What if my seeds don&apos;t produce?"
                  a="We will refund your first month with no questions and no forms. Plant your first seed within 7 days. If it doesn&apos;t earn — email us. Refund sent the same day."
                />
                <FaqItem
                  q="Which markets can I plant into?"
                  a="Currently Ghana, Nigeria, Kenya, South Africa, and UK diaspora communities. Each has its own search data, pricing, and opportunity database — all handled automatically when you choose your soil."
                />
                <FaqItem
                  q="Can I farm multiple countries at once?"
                  a="Yes. Many planters run seeds across two or three markets simultaneously — different soils, different currencies, different audiences. One dashboard. One planting schedule. One farm."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="lp-section" id="start">
          <div className="lp-section-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-section-label">Plant your first seed</div>
              <div className="lp-section-title">One subscription. Your whole farm.</div>
            </div>
            <div className="pricing-box">
              <div className="pricing-glow" />
              <div className="pricing-badge">🌱 Founding Farmer Pricing</div>
              <div className="pricing-title">PDF Seeds — Full Farm Access</div>
              <div className="pricing-sub">Every tool you need to find the soil, grow the seeds, and harvest every month.</div>
              <div className="pricing-amount"><span>£</span>39</div>
              <div className="pricing-period">per month · cancel anytime</div>
              <ul className="pricing-includes">
                {[
                  "Unlimited seed generation — grow as many guides as you plant",
                  "The gap finder — 5 African markets scanned for you",
                  "UK diaspora tools — pound pricing, diaspora-ready seeds",
                  "10 ready-to-plant social captions per seed — TikTok, Instagram, Pinterest",
                  "A Google page and a buy page grown automatically with every seed",
                  "Daily planting schedule — know exactly where to plant each day",
                  "Email harvest list — capture buyers before they leave",
                  "Farm dashboard — see every seed, every harvest, in real time",
                ].map((item, i) => (
                  <li key={i}><CheckIcon />{item}</li>
                ))}
              </ul>
              <a href={STRIPE} className="pricing-cta">Plant My First Seed →</a>
              <div className="pricing-offer">
                ✅ First harvest within 7 days — or your first month is free.
              </div>
              <div className="pricing-guarantee">
                30-day money-back guarantee · No questions asked · Cancel in one click
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <p>
            © {new Date().getFullYear()} PDF Seeds ·{" "}
            <a href="/store">Browse Guides</a> ·{" "}
            <a href="/dashboard">My Farm</a>
          </p>
        </footer>

        {/* ── MOBILE STICKY CTA ── */}
        <div className="mobile-sticky">
          <a href={STRIPE}>Plant My First Seed — £39/month →</a>
        </div>

      </div>
    </>
  );
}
