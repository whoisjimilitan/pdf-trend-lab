import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Seeds — Plant Once. Earn Every Month.",
  description: "The passive income system for African markets. Find unanswered questions, grow the guide, earn every month. Automatically.",
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

        /* TRUST BAR */
        .lp-trust { background: #0D0E17; border-top: 1px solid #1F2333; border-bottom: 1px solid #1F2333; padding: 36px 24px; }
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
        .seed-example { background: #0F1117; border: 1px solid #2A3050; border-radius: 16px; padding: 32px; margin-top: 40px; }
        .seed-example-search { display: inline-flex; align-items: center; gap: 10px; background: #1F2333; border-radius: 10px; padding: 12px 18px; font-size: 0.9rem; color: #94A3B8; margin-bottom: 16px; }
        .seed-stats { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 20px; }
        .seed-stat { background: #1F2333; border-radius: 8px; padding: 12px 16px; flex: 1; min-width: 100px; }
        .seed-stat-num { font-size: 1.2rem; font-weight: 900; color: #F1F5F9; }
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
        .farm-card { background: #0F1117; border: 1px solid #1F2333; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; }
        .farm-card-seeds { font-size: 0.88rem; font-weight: 700; color: #6366F1; }
        .farm-card-income { font-size: 0.88rem; color: #94A3B8; }
        .farm-card-annual { font-size: 0.78rem; color: #475569; margin-top: 2px; text-align: right; }

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
              <a href="/dashboard" className="lp-nav-login">Sign in</a>
              <a href={STRIPE} className="lp-nav-cta">Start Planting →</a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="lp-hero-glow" />
          <div className="lp-hero-inner">
            <div className="lp-eyebrow">
              🌱 The passive income system built for African markets
            </div>
            <h1>
              Plant once.<br />
              Earn <em>every month.</em>
            </h1>
            <p className="lp-hero-pain">
              You want income that keeps growing after you stop — not another side hustle
              that demands more time the more you put in.
            </p>
            <p className="lp-hero-mechanism">
              Every day, millions of people in Ghana, Nigeria, Kenya, South Africa, and the UK diaspora
              type urgent questions into Google that nobody has answered in a PDF yet.
              PDF Seeds finds those gaps, grows the guide, and plants it where buyers are already looking — automatically.
            </p>
            <p className="lp-offer-line">
              ✅ Earn from your first seed within 7 days — or your first month is free.
            </p>
            <div className="lp-hero-ctas">
              <a href={STRIPE} className="lp-primary-btn">Start Planting Today →</a>
              <a href="#how-it-works" className="lp-secondary-btn">See how it works ↓</a>
            </div>
            <div className="lp-social-proof">
              <div className="lp-avatars">
                {["🇬🇭","🇳🇬","🇰🇪","🇿🇦","🇬🇧"].map((f, i) => (
                  <div key={i} className="lp-avatar">{f}</div>
                ))}
              </div>
              <Stars />
              <p className="lp-proof-text">Early planters across 5 markets — growing daily</p>
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <div className="lp-trust">
          <div className="lp-trust-inner">
            {[
              { num: "5", label: "African markets covered" },
              { num: "3 min", label: "From topic to guide, sell page & social hooks" },
              { num: "7 days", label: "To your first earning — guaranteed" },
              { num: "£0", label: "Competition on most diaspora topics" },
            ].map((s) => (
              <div key={s.label}>
                <div className="lp-stat-num">{s.num}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── THE SOIL — why this works ── */}
        <section className="lp-section lp-section-dark">
          <div className="lp-section-inner">
            <div className="lp-section-label">Why this works</div>
            <div className="lp-section-title" style={{ maxWidth: 600 }}>
              African information markets are sitting wide open.
            </div>
            <p className="lp-section-body" style={{ marginBottom: 20 }}>
              Millions of people across Ghana, Nigeria, Kenya, and South Africa have smartphones,
              access to Google, real problems, and money to spend. They are searching for clear,
              practical answers every single day.
            </p>
            <p className="lp-section-body" style={{ marginBottom: 20 }}>
              But official information is confusing, legalistic, scattered across Facebook groups
              and WhatsApp chats, or buried behind expensive consultations. The answers exist.
              They just haven&apos;t been packaged yet.
            </p>
            <p className="lp-section-body" style={{ color: "#CBD5E1", fontWeight: 600, marginBottom: 0 }}>
              That gap is the fertile soil. Every unanswered question is a seed waiting to be planted.
              The person who plants it first owns that search — and that income — permanently.
            </p>

            {/* Real seed example */}
            <div className="seed-example">
              <div className="lp-section-label" style={{ marginBottom: 14 }}>A real seed — unplanted right now</div>
              <div className="seed-example-search">
                🔍 &ldquo;How do I transfer land to my children when I die in Ghana?&rdquo;
              </div>
              <p style={{ fontSize: "0.9rem", color: "#64748B", lineHeight: 1.7, marginBottom: 0 }}>
                Thousands of people search this every month. There is no simple, affordable PDF answering it
                in plain language. So someone plants one — a 20-page guide, priced at £9.
                Every time someone searches, they find it. They buy. The seed earns, forever.
              </p>
              <div className="seed-stats">
                {[
                  { num: "£8 / day", label: "One seed earning" },
                  { num: "£240 / mo", label: "From that one guide" },
                  { num: "Forever", label: "No re-writing needed" },
                  { num: "0", label: "Competing PDFs on this topic" },
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

        {/* ── HOW IT WORKS — the three jobs ── */}
        <section className="lp-section" id="how-it-works">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-section-label">The system</div>
              <div className="lp-section-title">Three jobs. One pipeline. No team needed.</div>
              <p style={{ fontSize: "0.95rem", color: "#64748B", maxWidth: 580, margin: "0 auto" }}>
                Normally you&apos;d need a researcher, content strategist, SEO expert, copywriter, and
                social media manager. PDF Seeds compresses all of that into one pipeline.
                One person, operating like a small media company.
              </p>
            </div>
            <div className="steps-grid">
              {[
                {
                  num: "01", icon: "🔍", title: "Find the fertile ground",
                  body: "The opportunity engine scans real search data across 5 African markets to find questions that thousands of people are asking, nobody has written a PDF for, and people are desperate enough to pay to resolve. It scores every gap and tells you exactly what to plant next.",
                },
                {
                  num: "02", icon: "🌱", title: "Grow your guide",
                  body: "Pick a topic. Click generate. In under 3 minutes: a complete PDF, a sales page, an SEO article designed to rank on Google, and 10 social hooks for TikTok, Pinterest, and Instagram. Nothing for you to write. Nothing to design.",
                },
                {
                  num: "03", icon: "📅", title: "The planting schedule",
                  body: "Every day the system gives you one simple action. Monday: post this TikTok script. Tuesday: this Pinterest caption. Wednesday: this Instagram hook. Copy, paste, done in 10 minutes. Consistent distribution without the thinking.",
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
              <div className="lp-section-label">How income arrives</div>
              <div className="lp-section-title">Your seeds earn from two directions at once.</div>
            </div>
            <div className="harvest-grid">
              <div className="harvest-card">
                <div className="harvest-badge" style={{ background: "#10B98115", color: "#10B981", border: "1px solid #10B98130" }}>
                  🌿 Google — The long game
                </div>
                <h3>Evergreen income while you sleep</h3>
                <p>
                  The SEO article the system writes for each guide is designed to rank on Google.
                  When someone searches your topic, your article appears. They read it, they want
                  the full guide, they buy. You did nothing that day.
                </p>
                <p>
                  Once a guide ranks, it earns indefinitely. You planted it once.
                  Google does the rest. That is what evergreen means.
                </p>
                <div className="harvest-timeline" style={{ background: "#10B98115", color: "#10B981" }}>
                  ⏱ 4–12 weeks to rank · Earns indefinitely after
                </div>
              </div>
              <div className="harvest-card">
                <div className="harvest-badge" style={{ background: "#6366F115", color: "#818CF8", border: "1px solid #6366F130" }}>
                  📱 Social — The fast harvest
                </div>
                <h3>Sales this week, not this year</h3>
                <p>
                  TikTok, Pinterest, and Instagram send buyers directly to your sell page —
                  the link you put in your bio. Post a 7-second video using the hook the system
                  wrote. People who feel the pain click. They buy.
                </p>
                <p>
                  Social works within days. It&apos;s how you earn while Google is still building.
                  The two streams run together — one fast, one forever.
                </p>
                <div className="harvest-timeline" style={{ background: "#6366F115", color: "#818CF8" }}>
                  ⚡ Can earn within 48 hours of planting
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── THE FARM — compound economics ── */}
        <section className="lp-section">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
              <div>
                <div className="lp-section-label">The compound effect</div>
                <div className="lp-section-title">The more you plant, the more the farm earns.</div>
                <p className="lp-section-body" style={{ marginBottom: 20 }}>
                  A PDF costs almost nothing to reproduce. Once planted, the only thing that changes
                  month to month is the number of buyers who find it. No restocking. No shipping.
                  No customer support. Just income, compounding.
                </p>
                <p className="lp-section-body" style={{ marginBottom: 20 }}>
                  The diaspora market changes the economics entirely. A Ghanaian in London trying to
                  resolve a land issue remotely will pay £20 for clarity that saves them confusion,
                  lawyer fees, or a flight home. Near-zero competition. Premium pricing.
                  An extremely strong position.
                </p>
                <a href={STRIPE} className="lp-primary-btn" style={{ display: "inline-block" }}>
                  Start Planting Today →
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
                  Based on £8/day per guide. Each seed is an independent, permanent income stream.
                </p>
                <div style={{ marginTop: 20, background: "#0F1117", border: "1px solid #1F2333", borderRadius: 12, padding: "20px" }}>
                  <div style={{ fontSize: "0.72rem", color: "#475569", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    The diaspora premium
                  </div>
                  <div style={{ fontSize: "0.88rem", color: "#94A3B8", lineHeight: 1.65 }}>
                    UK diaspora guides sell for <strong style={{ color: "#F1F5F9" }}>£15–£20</strong> — three times local pricing.
                    UK salaries. Home-country problems. Almost no competition.
                    That is a very strong position to plant into.
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
                <div className="lp-section-title">This system works while you sleep.</div>
                <p className="lp-section-body" style={{ marginBottom: 20 }}>
                  I built PDF Seeds because I was tired of side hustles that demanded more of my
                  time the more I put in. I wanted something that kept growing after I stopped.
                  This is that thing.
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
                  A short, honest video from Jimi explaining how the system works and why he built it.
                </div>
                <div className="video-placeholder-note">
                  📹 Drop a 45-second video here — it will increase conversions by 33%
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VIDEO TESTIMONIALS ── */}
        <section className="lp-section">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div className="lp-section-label">Early planters</div>
              <div className="lp-section-title">Real people. Real seeds. Real income.</div>
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
                  <div className="testimonial-note">📹 Video testimonial coming — reach out to early users</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="lp-section lp-section-dark">
          <div className="lp-section-inner" style={{ maxWidth: 900 }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-section-label">Questions</div>
              <div className="lp-section-title">Everything holding you back — answered.</div>
            </div>
            <div className="faq-grid">
              <div>
                <FaqItem
                  q="Do I need to write anything?"
                  a="Nothing. You pick a topic, click generate, and the system writes the PDF, the sales page, the SEO article, and all your social media hooks. Your job is to post once a day and watch what grows."
                />
                <FaqItem
                  q="Do I need technical skills?"
                  a="None. No coding, no design, no marketing degree. If you can click a button and copy-paste, you have everything this requires."
                />
                <FaqItem
                  q="How long before I earn my first money?"
                  a="Most people plant their first seed in under an hour. Social traffic can drive sales within 48 hours. We guarantee earnings within 7 days — or your first month is free."
                />
                <FaqItem
                  q="Is the African market saturated?"
                  a="The opposite. Most topics in Ghana, Nigeria, Kenya, and South Africa have zero PDF competition. That gap is exactly what this system was built to exploit — before everyone else finds it."
                />
              </div>
              <div>
                <FaqItem
                  q="Is £39 a month worth it?"
                  a="One guide earning £8 a day is £240 a month — that's 6x your subscription cost from a single seed. Ten guides running is £2,400 a month. The subscription pays for itself the first week."
                />
                <FaqItem
                  q="What if I don't see results?"
                  a="We'll give you your first month back, no questions asked. If you plant your first seed within 7 days and it doesn't earn — email us and we refund you immediately."
                />
                <FaqItem
                  q="Which countries does this work for?"
                  a="Currently Ghana, Nigeria, Kenya, South Africa, and UK diaspora communities. Each market has its own search data, pricing, and opportunity database — all handled automatically."
                />
                <FaqItem
                  q="Can I run guides across multiple countries?"
                  a="Yes. Many planters run guides across two or three markets simultaneously. One dashboard, different currencies, different audiences, one planting schedule."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING + CTA ── */}
        <section className="lp-section" id="start">
          <div className="lp-section-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-section-label">Get started</div>
              <div className="lp-section-title">One price. Everything included. Cancel anytime.</div>
            </div>
            <div className="pricing-box">
              <div className="pricing-glow" />
              <div className="pricing-badge">🌱 Founding Member Pricing</div>
              <div className="pricing-title">PDF Seeds — Full Access</div>
              <div className="pricing-sub">Everything you need to plant, grow, and harvest.</div>
              <div className="pricing-amount"><span>£</span>39</div>
              <div className="pricing-period">per month · cancel anytime</div>
              <ul className="pricing-includes">
                {[
                  "Unlimited PDF guide generation",
                  "Opportunity engine — 5 African markets",
                  "Built-in UK diaspora tools with pound pricing",
                  "10 ready-to-post captions for TikTok, Instagram, Pinterest",
                  "A Google page and a buy page — built automatically",
                  "Daily posting plan — know exactly what to post and when",
                  "Email capture + subscriber list",
                  "See your sales and income in real time",
                ].map((item, i) => (
                  <li key={i}><CheckIcon />{item}</li>
                ))}
              </ul>
              <a href={STRIPE} className="pricing-cta">Start Planting Today →</a>
              <div className="pricing-offer">
                ✅ Earn from your first seed within 7 days — or your first month is free.
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
            <a href="/dashboard">Sign in</a>
          </p>
        </footer>

        {/* ── MOBILE STICKY CTA ── */}
        <div className="mobile-sticky">
          <a href={STRIPE}>Start Planting — £39/month →</a>
        </div>

      </div>
    </>
  );
}
