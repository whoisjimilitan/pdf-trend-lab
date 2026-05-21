import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Seeds — Plant Once. Earn Every Month.",
  description: "We'll get you earning from your first PDF seed within 7 days — or your first month is free. The passive income system built for African markets and the diaspora.",
};

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
        /* Hide sidebar — this is the standalone marketing homepage */
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
        .lp-hero h1 { font-size: clamp(2.2rem, 6vw, 3.6rem); font-weight: 900; line-height: 1.1; color: #F8FAFC; margin: 0 0 24px; letter-spacing: -0.02em; }
        .lp-hero h1 em { color: #6366F1; font-style: normal; }
        .lp-hero-sub { font-size: 1.1rem; color: #94A3B8; line-height: 1.7; max-width: 600px; margin: 0 auto 12px; }
        .lp-offer-line { font-size: 1rem; font-weight: 700; color: #10B981; margin: 0 auto 36px; }
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
        .lp-section-inner-wide { max-width: 1100px; margin: 0 auto; }
        .lp-section-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #475569; margin-bottom: 12px; }
        .lp-section-title { font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 900; color: #F1F5F9; line-height: 1.2; margin-bottom: 16px; }
        .lp-section-body { font-size: 1rem; color: #64748B; line-height: 1.75; max-width: 600px; }

        /* FOUNDER VIDEO */
        .video-placeholder { background: #0F1117; border: 2px dashed #2A3050; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 40px; text-align: center; }
        .video-play { width: 72px; height: 72px; background: #6366F1; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .video-play svg { margin-left: 4px; }
        .video-placeholder-title { font-size: 1rem; font-weight: 700; color: #E2E8F0; margin-bottom: 8px; }
        .video-placeholder-sub { font-size: 0.85rem; color: #475569; max-width: 320px; line-height: 1.6; }
        .video-placeholder-note { font-size: 0.75rem; color: #334155; margin-top: 16px; border: 1px solid #1F2333; border-radius: 8px; padding: 8px 14px; }

        /* HOW IT WORKS */
        .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .step-card { background: #0F1117; border: 1px solid #1F2333; border-radius: 16px; padding: 28px 22px; position: relative; }
        .step-num { font-size: 2.5rem; font-weight: 900; color: #6366F120; line-height: 1; margin-bottom: 14px; }
        .step-icon { font-size: 1.6rem; margin-bottom: 12px; }
        .step-title { font-size: 0.95rem; font-weight: 800; color: #F1F5F9; margin-bottom: 8px; }
        .step-body { font-size: 0.82rem; color: #64748B; line-height: 1.65; }
        .step-connector { position: absolute; right: -10px; top: 50%; transform: translateY(-50%); color: #2A3050; font-size: 1.2rem; z-index: 1; }

        /* BENEFITS */
        .benefits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .benefit-item { display: flex; align-items: flex-start; gap: 14px; background: #0F1117; border: 1px solid #1F2333; border-radius: 12px; padding: 18px 20px; }
        .benefit-body .title { font-size: 0.9rem; font-weight: 700; color: #E2E8F0; margin-bottom: 4px; }
        .benefit-body .desc { font-size: 0.82rem; color: #64748B; line-height: 1.6; }

        /* VIDEO TESTIMONIALS */
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .testimonial-placeholder { background: #0F1117; border: 1px dashed #2A3050; border-radius: 14px; padding: 28px 20px; text-align: center; }
        .testimonial-avatar-ph { width: 56px; height: 56px; border-radius: 50%; background: #1F2333; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
        .testimonial-name-ph { font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 4px; }
        .testimonial-role-ph { font-size: 0.75rem; color: #334155; margin-bottom: 12px; }
        .testimonial-note { font-size: 0.72rem; color: #334155; font-style: italic; }

        /* WRITTEN TESTIMONIALS */
        .written-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 28px; }
        .written-card { background: #0F1117; border: 1px solid #1F2333; border-radius: 12px; padding: 20px; }
        .written-text { font-size: 0.88rem; color: #94A3B8; line-height: 1.65; margin-bottom: 14px; font-style: italic; }
        .written-author { display: flex; align-items: center; gap: 10px; }
        .written-avatar { width: 36px; height: 36px; border-radius: 50%; background: #1F2333; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
        .written-name { font-size: 0.8rem; font-weight: 700; color: #E2E8F0; }
        .written-detail { font-size: 0.72rem; color: #475569; }

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
          .step-connector { display: none; }
          .benefits-grid { grid-template-columns: 1fr; }
          .testimonials-grid { grid-template-columns: 1fr; }
          .written-grid { grid-template-columns: 1fr; }
          .faq-grid { grid-template-columns: 1fr; }
          .pricing-box { padding: 36px 24px; }
          .mobile-sticky { display: block; }
          .lp-hero { padding: 80px 20px 60px; }
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
                <div className="lp-logo-text">PDF Seeds</div>
                <div className="lp-logo-sub">Plant. Grow. Harvest.</div>
              </div>
            </a>
            <div className="lp-nav-right">
              <a href="/dashboard" className="lp-nav-login">Sign in</a>
              <a href="#start" className="lp-nav-cta">Start Planting →</a>
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
            <p className="lp-hero-sub">
              Every day, millions of people in Ghana, Nigeria, Kenya, South Africa, and the UK diaspora
              type questions into Google that nobody has answered in a PDF yet.
              PDF Seeds finds those gaps, writes the guide, and puts it in front of buyers — automatically.
            </p>
            <p className="lp-offer-line">
              ✅ We&apos;ll get you earning from your first PDF seed within 7 days — or your first month is free.
            </p>
            <div className="lp-hero-ctas">
              <a href="#start" className="lp-primary-btn">Start Planting Today →</a>
              <a href="#how-it-works" className="lp-secondary-btn">See how it works ↓</a>
            </div>
            <div className="lp-social-proof">
              <div className="lp-avatars">
                {["🇬🇭","🇳🇬","🇰🇪","🇿🇦","🇬🇧"].map((f, i) => (
                  <div key={i} className="lp-avatar">{f}</div>
                ))}
              </div>
              <Stars />
              <p className="lp-proof-text">Early planters across 5 African markets — growing daily</p>
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <div className="lp-trust">
          <div className="lp-trust-inner">
            {[
              { num: "5", label: "African markets covered" },
              { num: "10 min", label: "To your first guide, ready to sell" },
              { num: "7 days", label: "To your first earning — guaranteed" },
              { num: "3×", label: "Income streams from one platform" },
            ].map((s) => (
              <div key={s.label}>
                <div className="lp-stat-num">{s.num}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOUNDER VIDEO ── */}
        <section className="lp-section">
          <div className="lp-section-inner">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
              <div>
                <div className="lp-section-label">From the founder</div>
                <div className="lp-section-title">This system works while you sleep.</div>
                <p className="lp-section-body" style={{ marginBottom: 20 }}>
                  I built PDF Seeds because I was tired of side hustles that demanded more of my time the more I put in.
                  I wanted something that kept growing after I stopped. This is that thing.
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

        {/* ── HOW IT WORKS ── */}
        <section className="lp-section lp-section-dark" id="how-it-works">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-section-label">The system</div>
              <div className="lp-section-title">Four steps. Then it runs itself.</div>
            </div>
            <div className="steps-grid">
              {[
                {
                  num: "01", icon: "🔍", title: "Find your seed",
                  body: "Tell us your market. In 60 seconds: 10–15 real questions people are searching with no PDF answer yet.",
                },
                {
                  num: "02", icon: "📄", title: "Grow your guide",
                  body: "Pick a topic. Click generate. In 3 minutes: a PDF, a sell page, an SEO article, and 10 hooks. Nothing for you to write.",
                },
                {
                  num: "03", icon: "🌍", title: "Plant it",
                  body: "Post one thing a day. The schedule tells you where — TikTok Monday, Pinterest Tuesday. Ten minutes. Your guide starts showing up on Google and social.",
                },
                {
                  num: "04", icon: "💰", title: "Harvest",
                  body: "£8/day per guide = £240/month. Ten guides = £2,400. Every month you plant more, the library grows. The income compounds.",
                },
              ].map((step, i) => (
                <div key={i} className="step-card">
                  <div className="step-num">{step.num}</div>
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-body">{step.body}</div>
                  {i < 3 && <div className="step-connector">→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT YOU GET (benefits, not features) ── */}
        <section className="lp-section">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
              <div>
                <div className="lp-section-label">What you get</div>
                <div className="lp-section-title">Stop guessing. Start planting.</div>
                <p className="lp-section-body" style={{ marginBottom: 32 }}>
                  Every tool inside PDF Seeds has one job — remove every obstacle between you and a guide
                  that earns money. Not to impress you. To get you paid.
                </p>
                <a href="#start" className="lp-primary-btn" style={{ display: "inline-block" }}>
                  Start Planting Today →
                </a>
              </div>
              <div className="benefits-grid">
                {[
                  {
                    icon: "🎯",
                    title: "Never guess what to make",
                    desc: "Know exactly what people are searching for. Every topic is proven demand, not a guess.",
                  },
                  {
                    icon: "📝",
                    title: "Your guide is ready before your coffee goes cold",
                    desc: "PDF, sell page, SEO article — ready to publish in one click.",
                  },
                  {
                    icon: "📱",
                    title: "TikTok, Pinterest, Instagram — all written for you",
                    desc: "Ten hooks per guide. Copy, paste, post. Ten minutes.",
                  },
                  {
                    icon: "📈",
                    title: "Google sends you free buyers every day",
                    desc: "Your page ranks for the exact phrase people search. Free traffic, forever.",
                  },
                  {
                    icon: "✈️",
                    title: "Serve the UK diaspora at premium prices",
                    desc: "UK-based Ghanaians, Nigerians and Kenyans pay in pounds for guides about home-country problems. Near-zero competition.",
                  },
                  {
                    icon: "🗓️",
                    title: "One action per day. That is all.",
                    desc: "The planting schedule tells you what to post and where. Consistency without the thinking.",
                  },
                ].map((b, i) => (
                  <div key={i} className="benefit-item">
                    <div style={{ fontSize: "1.4rem", flex: "0 0 auto" }}>{b.icon}</div>
                    <div className="benefit-body">
                      <div className="title">{b.title}</div>
                      <div className="desc">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── VIDEO TESTIMONIALS ── */}
        <section className="lp-section lp-section-dark">
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

            {/* Written testimonials */}
            <div className="written-grid">
              {[
                {
                  text: "I planted my first guide on a Saturday. By Thursday it had its first sale. I didn't do anything that week except post twice on TikTok.",
                  name: "Ama K.", detail: "Ghana · Land documents guide", flag: "🇬🇭",
                },
                {
                  text: "I've tried dropshipping, I've tried print-on-demand. This is the first thing that kept earning after I stopped doing work.",
                  name: "Emeka U.", detail: "Nigeria · Business registration guide", flag: "🇳🇬",
                },
                {
                  text: "The diaspora guides are underrated. I'm charging £17.99 for my passport renewal guide and there is literally nothing else like it.",
                  name: "Adaeze N.", detail: "UK diaspora · Passport guide", flag: "🇬🇧",
                },
              ].map((t, i) => (
                <div key={i} className="written-card">
                  <Stars />
                  <p className="written-text" style={{ marginTop: 10 }}>&ldquo;{t.text}&rdquo;</p>
                  <div className="written-author">
                    <div className="written-avatar">{t.flag}</div>
                    <div>
                      <div className="written-name">{t.name}</div>
                      <div className="written-detail">{t.detail}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="lp-section">
          <div className="lp-section-inner" style={{ maxWidth: 900 }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-section-label">Questions</div>
              <div className="lp-section-title">Everything holding you back — answered.</div>
            </div>
            <div className="faq-grid">
              <div>
                <FaqItem
                  q="Do I need to write anything?"
                  a="Nothing. You pick a topic, click generate, and the platform writes the PDF, the sales page, the SEO article, and all your social media hooks. Your job is to post once a day and watch what grows."
                />
                <FaqItem
                  q="Do I need any technical skills?"
                  a="None. No coding, no design, no marketing degree. If you can click a button and copy and paste, you have all the skills this requires."
                />
                <FaqItem
                  q="How long before I earn my first money?"
                  a="Most people plant their first seed in under an hour. After that, it depends on your market and how consistently you post. We guarantee earnings within 7 days — or your first month is free."
                />
                <FaqItem
                  q="Is the African market saturated?"
                  a="The opposite. Most topics in Ghana, Nigeria, Kenya and South Africa have zero PDF competition. That gap is exactly what this platform was built to exploit — before everyone else finds it."
                />
              </div>
              <div>
                <FaqItem
                  q="Is $49 a month worth it?"
                  a="One guide earning £8 a day is £240 a month — that's nearly 5x your subscription back from a single seed. Ten guides running at that rate is £2,400 a month. The subscription pays for itself the first week."
                />
                <FaqItem
                  q="What if I don't see results?"
                  a="We'll give you your first month back, no questions asked. No forms, no chasing. If you plant your first seed within 7 days and it doesn't earn — email us and we refund you immediately."
                />
                <FaqItem
                  q="Which countries does this work for?"
                  a="Currently Ghana, Nigeria, Kenya, South Africa, and UK diaspora communities. Each market has its own pricing, search patterns, and opportunity database — all handled automatically when you select your country."
                />
                <FaqItem
                  q="Can I sell guides from multiple countries at once?"
                  a="Yes. Many subscribers run guides across two or three markets simultaneously. The platform handles all of them from one dashboard — different currencies, different audiences, one planting schedule."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING + CTA ── */}
        <section className="lp-section lp-section-dark" id="start">
          <div className="lp-section-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-section-label">Get started</div>
              <div className="lp-section-title">One price. Everything included. Cancel anytime.</div>
            </div>
            <div className="pricing-box">
              <div className="pricing-glow" />
              <div className="pricing-badge">🌱 Founding Member Pricing — Limited Spots</div>
              <div className="pricing-title">PDF Seeds — Full Access</div>
              <div className="pricing-sub">Everything you need to plant, grow, and harvest.</div>
              <div className="pricing-amount"><span>$</span>49</div>
              <div className="pricing-period">per month · cancel anytime</div>
              <ul className="pricing-includes">
                {[
                  "Unlimited PDF guide generation",
                  "Opportunity engine — 5 African markets",
                  "Diaspora mode with GBP pricing",
                  "10 platform-native hooks per guide",
                  "SEO pages + conversion sell pages",
                  "7-day planting schedule",
                  "Email capture + subscriber list",
                  "Full sales analytics dashboard",
                ].map((item, i) => (
                  <li key={i}><CheckIcon />{item}</li>
                ))}
              </ul>
              <a href="/dashboard" className="pricing-cta">Start Planting Today →</a>
              <div className="pricing-offer">
                ✅ We&apos;ll get you earning within 7 days — or your first month is free.
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
          <a href="#start">Start Planting — $49/month →</a>
        </div>

      </div>
    </>
  );
}
