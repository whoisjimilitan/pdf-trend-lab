import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Seeds — Plant once. Earn for years.",
  description: "Find what people already search for. Generate a PDF guide in minutes. First harvest in 7 days — or your first month is free.",
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
        .lp-hero { padding: 100px 24px 80px; text-align: center; position: relative; overflow: hidden; background: #FFFFFF; }
        .lp-hero-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%); pointer-events: none; }
        .lp-hero-inner { max-width: 760px; margin: 0 auto; position: relative; z-index: 1; }
        .lp-eyebrow { display: inline-flex; align-items: center; gap: 6px; background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 20px; padding: 5px 14px; font-size: 0.78rem; font-weight: 700; color: #4F46E5; margin-bottom: 28px; }
        .lp h1 { font-size: clamp(2.8rem, 7vw, 4.8rem); font-weight: 900; line-height: 1.05; color: #0F172A; margin: 0 0 20px; letter-spacing: -0.03em; }
        .lp h1 em { color: #6366F1; font-style: normal; }
        .lp-hero-sub { font-size: 1.05rem; color: #64748B; line-height: 1.7; max-width: 520px; margin: 0 auto 28px; }
        .lp-hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-bottom: 16px; }
        .lp-btn-primary { display: inline-block; background: #6366F1; color: #fff; font-weight: 800; font-size: 0.95rem; padding: 15px 36px; border-radius: 10px; text-decoration: none; letter-spacing: 0.01em; }
        .lp-btn-primary:hover { background: #4F46E5; }
        .lp-btn-ghost { display: inline-block; background: transparent; color: #64748B; font-weight: 600; font-size: 0.95rem; padding: 15px 26px; border-radius: 10px; text-decoration: none; border: 1px solid #E2E8F0; }
        .lp-btn-ghost:hover { border-color: #CBD5E1; color: #334155; }
        .lp-offer-line { font-size: 0.88rem; color: #16A34A; font-weight: 600; margin-bottom: 24px; }
        .lp-social-proof { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
        .lp-avatars { display: flex; }
        .lp-avatar { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #FFFFFF; background: #EEF2FF; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; margin-left: -6px; }
        .lp-avatar:first-child { margin-left: 0; }
        .lp-proof-text { font-size: 0.8rem; color: #94A3B8; }

        /* TRUST BAR */
        .trust-bar { background: #F8FAFC; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; padding: 28px 24px; }
        .trust-bar-inner { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
        .trust-stat { text-align: center; padding: 0 16px; border-right: 1px solid #E2E8F0; }
        .trust-stat:last-child { border-right: none; }
        .trust-stat-num { font-size: 1.6rem; font-weight: 900; color: #0F172A; letter-spacing: -0.03em; line-height: 1; }
        .trust-stat-label { font-size: 0.75rem; color: #94A3B8; font-weight: 600; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; }

        /* SECTIONS */
        .lp-section { padding: 80px 24px; background: #FFFFFF; }
        .lp-section-alt { background: #F8FAFC; }
        .lp-inner { max-width: 1000px; margin: 0 auto; }
        .lp-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #94A3B8; margin-bottom: 12px; }
        .lp h2 { font-size: clamp(1.7rem, 3.5vw, 2.4rem); font-weight: 900; color: #0F172A; line-height: 1.15; margin: 0 0 16px; letter-spacing: -0.02em; }
        .lp-body { font-size: 0.97rem; color: #64748B; line-height: 1.8; }

        /* FOUNDER VIDEO */
        .video-section { padding: 72px 24px; background: #0F172A; text-align: center; }
        .video-inner { max-width: 680px; margin: 0 auto; }
        .video-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #475569; margin-bottom: 12px; }
        .video-headline { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 900; color: #F8FAFC; margin: 0 0 10px; letter-spacing: -0.02em; }
        .video-sub { font-size: 0.88rem; color: #475569; margin-bottom: 28px; }
        .video-placeholder { position: relative; width: 100%; aspect-ratio: 16/9; background: #1E293B; border-radius: 16px; border: 1px solid #334155; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; }
        .video-placeholder-badge { position: absolute; top: 14px; left: 14px; background: #6366F1; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
        .video-play-btn { width: 64px; height: 64px; border-radius: 50%; background: rgba(99,102,241,0.9); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .video-play-btn svg { width: 28px; height: 28px; color: #fff; margin-left: 4px; fill: currentColor; }
        .video-duration { position: absolute; bottom: 14px; right: 14px; font-size: 0.72rem; color: #94A3B8; font-weight: 600; }

        /* HOW IT WORKS */
        .steps-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 44px; }
        .step-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .step-num { font-size: 2.5rem; font-weight: 900; color: #EEF2FF; line-height: 1; margin-bottom: 16px; letter-spacing: -0.02em; }
        .step-icon { font-size: 1.5rem; margin-bottom: 12px; }
        .step-title { font-size: 1rem; font-weight: 800; color: #0F172A; margin-bottom: 8px; }
        .step-body { font-size: 0.85rem; color: #64748B; line-height: 1.7; }
        .steps-cta { text-align: center; margin-top: 36px; }

        /* BENEFITS STRIP */
        .benefit-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 32px; }
        .benefit-item { display: flex; align-items: flex-start; gap: 14px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 22px 20px; }
        .benefit-emoji { font-size: 1.5rem; flex-shrink: 0; }
        .benefit-title { font-size: 0.97rem; font-weight: 800; color: #0F172A; margin-bottom: 4px; }
        .benefit-sub { font-size: 0.83rem; color: #64748B; line-height: 1.55; }

        /* OPP CARDS */
        .opp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 40px; }
        .opp-simple { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .opp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .opp-badge-live { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: #FEF3C7; border: 1px solid #FDE68A; color: #B45309; }
        .opp-query { font-size: 0.9rem; color: #1E293B; line-height: 1.55; margin: 0 0 14px; font-style: italic; font-weight: 500; }
        .opp-demand { font-size: 0.78rem; color: #64748B; }
        .opp-cta { text-align: center; margin-top: 32px; }

        /* VIDEO TESTIMONIALS */
        .testimonial-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 40px; }
        .testimonial-card { display: flex; flex-direction: column; gap: 12px; }
        .testimonial-video { position: relative; width: 100%; aspect-ratio: 9/16; background: #1E293B; border-radius: 14px; border: 1px solid #334155; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .testimonial-play { width: 48px; height: 48px; border-radius: 50%; background: rgba(99,102,241,0.85); display: flex; align-items: center; justify-content: center; }
        .testimonial-play svg { width: 20px; height: 20px; color: #fff; margin-left: 3px; fill: currentColor; }
        .testimonial-flag { position: absolute; top: 12px; left: 12px; font-size: 1.2rem; }
        .testimonial-result { position: absolute; bottom: 12px; left: 12px; right: 12px; background: rgba(15,23,42,0.85); backdrop-filter: blur(4px); border-radius: 8px; padding: 8px 10px; }
        .testimonial-result-name { font-size: 0.75rem; font-weight: 700; color: #F8FAFC; }
        .testimonial-result-stat { font-size: 0.72rem; color: #10B981; font-weight: 600; }
        .testimonial-quote { font-size: 0.85rem; color: #64748B; line-height: 1.65; font-style: italic; }

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
        .math-cta { text-align: center; margin-top: 32px; }

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
          .trust-bar-inner { grid-template-columns: repeat(2, 1fr); gap: 16px 0; }
          .trust-stat { border-right: none; border-bottom: 1px solid #E2E8F0; padding: 12px 0; }
          .trust-stat:nth-child(2n) { border-right: none; }
          .trust-stat:nth-last-child(-n+2) { border-bottom: none; }
          .opp-grid-3 { grid-template-columns: 1fr; }
          .benefit-grid { grid-template-columns: 1fr; }
          .steps-3 { grid-template-columns: 1fr; }
          .testimonial-grid { grid-template-columns: 1fr; }
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
              <a href={STRIPE} className="lp-nav-cta">Start Planting →</a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="lp-hero-glow" />
          <div className="lp-hero-inner">
            <div className="lp-eyebrow">🌱 The demand-first PDF system</div>
            <h1>
              Plant once.<br />
              <em>Earn for years.</em>
            </h1>
            <p className="lp-hero-sub">
              Find what people already search for.<br />
              Turn it into a PDF guide — in minutes.<br />
              Get paid every month, automatically.
            </p>
            <div className="lp-hero-ctas">
              <a href={STRIPE} className="lp-btn-primary">Plant My First Seed →</a>
              <a href="#how-it-works" className="lp-btn-ghost">See how it works ↓</a>
            </div>
            <p className="lp-offer-line">✅ First harvest in 7 days — or your first month is free.</p>
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

        {/* ── TRUST BAR ── */}
        <div className="trust-bar">
          <div className="trust-bar-inner">
            {[
              { num: "200+", label: "Active Planters" },
              { num: "5",    label: "Markets" },
              { num: "£8",   label: "Avg. daily per guide" },
              { num: "7-day", label: "Guarantee or refund" },
            ].map((s, i) => (
              <div key={i} className="trust-stat">
                <div className="trust-stat-num">{s.num}</div>
                <div className="trust-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOUNDER VIDEO ── */}
        <section className="video-section">
          <div className="video-inner">
            <div className="video-label">From the founder</div>
            <h2 className="video-headline">Meet the founder — 45 seconds.</h2>
            <p className="video-sub">Who's behind PDF Seeds.</p>
            <div className="video-placeholder">
              <span className="video-placeholder-badge">Founder — Jimi</span>
              <div className="video-play-btn">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <span className="video-duration">0:45</span>
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
                { num: "01", icon: "🔍", title: "Find the gap", body: "We surface high-demand questions with no PDF guide yet. You pick one." },
                { num: "02", icon: "🌱", title: "Grow the guide", body: "One click. PDF, sales page, SEO article, and social hooks — ready in 3 minutes." },
                { num: "03", icon: "🌾", title: "Earn while it grows", body: "Share the link. Google sends buyers automatically. Same guide. Every month." },
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
              <a href={STRIPE} className="lp-btn-primary">Start My Farm — £39/month →</a>
            </div>
          </div>
        </section>

        {/* ── WHY IT WORKS ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-inner">
            <div className="lp-label">Why it works for you</div>
            <h2>Built for ordinary people.<br />Not influencers.</h2>
            <div className="benefit-grid">
              {[
                { emoji: "💰", title: "Extra income without a second job", sub: "No clients. No deadlines. No bosses." },
                { emoji: "📄", title: "Nothing to write yourself", sub: "AI writes everything. You pick the topic." },
                { emoji: "⏱️", title: "One afternoon to your first seed", sub: "Most planters are live in 2 hours. No skills needed." },
                { emoji: "♾️", title: "Digital assets that compound", sub: "10 seeds × £8/day = £2,400/month." },
              ].map((b, i) => (
                <div key={i} className="benefit-item">
                  <span className="benefit-emoji">{b.emoji}</span>
                  <div>
                    <div className="benefit-title">{b.title}</div>
                    <div className="benefit-sub">{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="steps-cta">
              <a href={STRIPE} className="lp-btn-primary">Start Growing — £39/month →</a>
            </div>
          </div>
        </section>

        {/* ── SEEDS PREVIEW ── */}
        <section className="lp-section">
          <div className="lp-inner">
            <div className="lp-label">Unplanted opportunities</div>
            <h2>Real searches. No PDF guide yet.</h2>
            <div className="opp-grid-3">
              {[
                { flag: "🇳🇬", country: "Nigeria",    query: "How to register a business in Nigeria step by step", demand: "6,800 searches / month" },
                { flag: "🇰🇪", country: "Kenya",      query: "How to start a small poultry farm in Kenya with little money", demand: "3,600 searches / month" },
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
            <div className="opp-cta">
              <a href={STRIPE} className="lp-btn-primary">Plant One of These →</a>
              <p style={{ fontSize: "0.78rem", color: "#CBD5E1", marginTop: 10 }}>
                PDF Seeds surfaces hundreds of gaps like these — scored, ranked, ready to grow.
              </p>
            </div>
          </div>
        </section>

        {/* ── VIDEO TESTIMONIALS ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div className="lp-label">First harvests</div>
              <h2>Not overnight success stories.<br />Just seeds beginning to grow.</h2>
            </div>
            <div className="testimonial-grid">
              {[
                { flag: "🇬🇭", name: "Kofi",  country: "Ghana",  result: "First sale in 4 days",      quote: "I planted a land-transfer guide on Friday. My first sale came Monday. Didn't write a word myself." },
                { flag: "🇮🇳", name: "Priya", country: "UK",     result: "£240/month from one guide",  quote: "The SEO article started ranking after 6 weeks. Now I get buyers I've never spoken to." },
                { flag: "🇲🇽", name: "Diego", country: "Mexico", result: "Ranking on Google week 6",   quote: "Most buyers found it through a Reddit thread. I just shared the link once." },
              ].map((t, i) => (
                <div key={i} className="testimonial-card">
                  <div className="testimonial-video">
                    <span className="testimonial-flag">{t.flag}</span>
                    <div className="testimonial-play">
                      <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                    <div className="testimonial-result">
                      <div className="testimonial-result-name">{t.name} · {t.country}</div>
                      <div className="testimonial-result-stat">{t.result}</div>
                    </div>
                  </div>
                  <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HARVEST MATH ── */}
        <section className="lp-section">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-label">The harvest math</div>
              <h2>One seed earns. Ten seeds compound.</h2>
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
            <p className="math-note">Illustrative averages. Some seeds earn more. Some less. All compound.</p>
            <div className="math-cta">
              <a href={STRIPE} className="lp-btn-primary">Start Planting — £39/month →</a>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="lp-section lp-section-alt" id="start">
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
                "Discover high-demand questions before anyone else plants them",
                "Generate complete, ready-to-sell guides in under 3 minutes",
                "Built-in SEO article, social hooks, and buy page — no tech skills needed",
                "One dashboard. Every seed. Every harvest.",
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
        <section className="lp-section" id="faq">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-label">Before you plant</div>
              <h2>Your questions, answered honestly.</h2>
            </div>
            <div className="faq-grid">
              <div>
                <FaqItem
                  q="Will this actually work for me?"
                  a="Click grow, share the link. No writing, no design, no ads — the gap does the rest."
                />
                <FaqItem
                  q="I don't have time for another project."
                  a="Your first seed takes 2 hours. After that, 5 minutes a day to share a hook."
                />
                <FaqItem
                  q="What if my guide doesn't sell?"
                  a="Plant within 7 days. If it doesn't earn, email us — refund sent same day."
                />
              </div>
              <div>
                <FaqItem
                  q="Are these niches already too competitive?"
                  a="Most high-intent topics in underserved markets have zero PDF guides — that's the exact gap we find."
                />
                <FaqItem
                  q="Is £39/month worth it?"
                  a="One seed returning £240/month is 6× your subscription. The farm pays for itself in week one."
                />
                <FaqItem
                  q="Do I need writing or tech skills?"
                  a="None at all. AI generates everything — you just share the link."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ padding: "80px 24px", background: "#6366F1", textAlign: "center" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, color: "#FFFFFF", margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Ready to plant your first seed?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", marginBottom: 32 }}>
              First harvest in 7 days — or your first month is free.
            </p>
            <a href={STRIPE} style={{ display: "inline-block", background: "#FFFFFF", color: "#6366F1", fontWeight: 800, fontSize: "1rem", padding: "17px 40px", borderRadius: "12px", textDecoration: "none" }}>
              Plant My First Seed — £39/month →
            </a>
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
