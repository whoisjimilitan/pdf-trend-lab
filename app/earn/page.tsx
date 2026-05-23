"use client";

import { useState } from "react";

export default function EarnPage() {
  const [loading, setLoading] = useState(false);

  async function handleGetAccess() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/farmer", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        body > aside { display: none !important; }
        body > nav  { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; background: #FAF9F7 !important; color-scheme: light !important; }
        * { box-sizing: border-box; }

        .earn {
          min-height: 100dvh;
          background: #FAF9F7;
          font-family: -apple-system, "Inter", system-ui, sans-serif;
          color: #1A1008;
        }

        /* ── HEADER ── */
        .earn-header {
          padding: 24px 32px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #EEE9E2;
        }
        .earn-logo {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .earn-logo-mark {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          box-shadow: 0 4px 12px rgba(124,58,237,0.2);
        }
        .earn-logo-name {
          font-size: 1rem; font-weight: 800; color: #1A1008; letter-spacing: -0.02em;
        }
        .earn-header-link {
          font-size: 0.82rem; color: #B0A89A; font-weight: 500;
          text-decoration: none; transition: color 0.15s;
        }
        .earn-header-link:hover { color: #7C3AED; }

        /* ── HERO ── */
        .earn-hero {
          max-width: 680px; margin: 0 auto;
          padding: 80px 32px 64px;
          text-align: center;
        }
        .earn-eyebrow {
          display: inline-block;
          font-size: 0.72rem; font-weight: 700;
          color: #9B8AF0; letter-spacing: 0.12em;
          text-transform: uppercase; margin-bottom: 20px;
        }
        .earn-h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 900; color: #1A1008;
          line-height: 1.1; letter-spacing: -0.04em;
          margin: 0 0 20px;
        }
        .earn-h1 span { color: #7C3AED; }
        .earn-sub {
          font-size: clamp(1rem, 2.5vw, 1.1rem);
          color: #8C7D6E; line-height: 1.75;
          margin: 0 0 40px; max-width: 520px;
          margin-left: auto; margin-right: auto;
        }
        .earn-cta-primary {
          display: inline-block;
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          color: #fff; font-weight: 800; font-size: 1.1rem;
          padding: 20px 48px; border-radius: 16px;
          border: none; cursor: pointer;
          box-shadow: 0 8px 28px rgba(124,58,237,0.35);
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: -0.01em;
          margin-bottom: 14px;
        }
        .earn-cta-primary:hover { opacity: 0.92; }
        .earn-cta-primary:active { transform: scale(0.99); }
        .earn-cta-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        .earn-trust-line {
          font-size: 0.78rem; color: #C4BAB0;
          margin-top: 12px;
        }

        /* ── SECTION WRAPPER ── */
        .earn-section {
          max-width: 720px; margin: 0 auto; padding: 0 32px 80px;
        }
        .earn-divider {
          border: none; border-top: 1px solid #EEE9E2;
          margin: 0 32px 64px;
          max-width: 720px; margin-left: auto; margin-right: auto;
        }

        /* ── HOW IT WORKS ── */
        .earn-steps-label {
          font-size: 0.72rem; font-weight: 700;
          color: #9B8AF0; letter-spacing: 0.12em;
          text-transform: uppercase; margin-bottom: 40px;
          text-align: center;
        }
        .earn-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 0;
        }
        .earn-step {
          background: #FFFFFF;
          border: 1.5px solid #EAE6E0;
          border-radius: 20px;
          padding: 28px 24px;
          text-align: center;
        }
        .earn-step-icon {
          font-size: 2rem; margin-bottom: 16px;
          display: block;
        }
        .earn-step-title {
          font-size: 1rem; font-weight: 800;
          color: #1A1008; margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .earn-step-body {
          font-size: 0.85rem; color: #8C7D6E; line-height: 1.65;
        }

        /* ── PITCH ── */
        .earn-pitch {
          background: #FFFFFF;
          border: 1.5px solid #EAE6E0;
          border-radius: 24px;
          padding: 48px 44px;
        }
        .earn-pitch-h2 {
          font-size: clamp(1.4rem, 3vw, 1.9rem);
          font-weight: 900; color: #1A1008;
          line-height: 1.2; letter-spacing: -0.03em;
          margin: 0 0 20px;
        }
        .earn-pitch-body {
          font-size: 0.97rem; color: #8C7D6E;
          line-height: 1.8; margin: 0 0 24px;
        }
        .earn-pain-list {
          list-style: none; padding: 0; margin: 0 0 28px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .earn-pain-list li {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 0.9rem; color: #8C7D6E; line-height: 1.6;
        }
        .earn-pain-list li::before {
          content: "✗";
          color: #FCA5A5; font-weight: 700; flex-shrink: 0;
          margin-top: 1px;
        }
        .earn-pitch-contrast {
          font-size: 1rem; font-weight: 700; color: #1A1008;
          padding: 18px 20px;
          background: #F5F3FF;
          border-left: 3px solid #7C3AED;
          border-radius: 0 12px 12px 0;
          line-height: 1.6;
        }

        /* ── WHAT YOU GET ── */
        .earn-get-h2 {
          font-size: clamp(1.3rem, 3vw, 1.7rem);
          font-weight: 900; color: #1A1008;
          letter-spacing: -0.03em; margin: 0 0 28px;
        }
        .earn-get-list {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 14px;
        }
        .earn-get-list li {
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 0.95rem; color: #4B3D30; line-height: 1.6;
        }
        .earn-get-list li::before {
          content: "✓";
          color: #7C3AED; font-weight: 800; flex-shrink: 0;
          font-size: 1rem; margin-top: 1px;
        }

        /* ── EARNINGS MATH ── */
        .earn-math {
          background: #F5F3FF;
          border: 1.5px solid #DDD6FE;
          border-radius: 20px;
          padding: 32px 36px;
          margin-bottom: 64px;
        }
        .earn-math-label {
          font-size: 0.72rem; font-weight: 700;
          color: #7C3AED; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 14px;
        }
        .earn-math-base {
          font-size: 0.95rem; color: #4B3D30;
          margin-bottom: 24px; line-height: 1.6;
        }
        .earn-math-base strong { color: #1A1008; }
        .earn-math-examples {
          display: flex; flex-direction: column; gap: 10px;
          margin-bottom: 16px;
        }
        .earn-math-ex {
          display: flex; align-items: center; gap: 12px;
          background: #FFFFFF; border-radius: 12px;
          padding: 12px 16px;
          border: 1px solid #EDE9FE;
        }
        .earn-math-ex-icon { font-size: 1.1rem; flex-shrink: 0; }
        .earn-math-ex-text { flex: 1; font-size: 0.88rem; color: #8C7D6E; }
        .earn-math-ex-earn {
          font-size: 1rem; font-weight: 800;
          color: #5B21B6; flex-shrink: 0;
        }
        .earn-math-note {
          font-size: 0.78rem; color: #A78BFA; line-height: 1.6;
        }

        /* ── PRICE BLOCK ── */
        .earn-price-block {
          background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%);
          border-radius: 24px;
          padding: 56px 44px;
          text-align: center;
          color: #fff;
        }
        .earn-price-label {
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #C4B5FD; margin-bottom: 12px;
        }
        .earn-price-amount {
          font-size: clamp(3rem, 8vw, 4.5rem);
          font-weight: 900; letter-spacing: -0.05em;
          line-height: 1; margin-bottom: 8px;
        }
        .earn-price-sub {
          font-size: 0.9rem; color: #C4B5FD;
          margin-bottom: 36px; line-height: 1.6;
        }
        .earn-cta-white {
          display: inline-block;
          background: #FFFFFF; color: #5B21B6;
          font-weight: 800; font-size: 1.05rem;
          padding: 18px 44px; border-radius: 14px;
          border: none; cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: -0.01em;
          margin-bottom: 14px;
        }
        .earn-cta-white:hover { opacity: 0.93; }
        .earn-cta-white:active { transform: scale(0.99); }
        .earn-cta-white:disabled { opacity: 0.65; cursor: not-allowed; }
        .earn-price-guarantee {
          font-size: 0.78rem; color: #A78BFA; margin-top: 10px;
        }

        /* ── FAQ ── */
        .earn-faq-h2 {
          font-size: clamp(1.3rem, 3vw, 1.7rem);
          font-weight: 900; color: #1A1008;
          letter-spacing: -0.03em; margin: 0 0 32px;
        }
        .earn-faq {
          display: flex; flex-direction: column; gap: 16px;
        }
        .earn-faq-item {
          background: #FFFFFF;
          border: 1.5px solid #EAE6E0;
          border-radius: 16px;
          padding: 24px 28px;
        }
        .earn-faq-q {
          font-size: 0.97rem; font-weight: 700; color: #1A1008;
          margin-bottom: 8px; letter-spacing: -0.01em;
        }
        .earn-faq-a {
          font-size: 0.88rem; color: #8C7D6E; line-height: 1.7; margin: 0;
        }

        /* ── FOOTER ── */
        .earn-footer {
          text-align: center; padding: 16px 24px;
          font-size: 0.72rem; color: #D4CEC8;
          border-top: 1px solid #EEE9E2;
          margin-top: 40px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .earn-header { padding: 16px 20px; }
          .earn-hero { padding: 56px 20px 48px; }
          .earn-section { padding: 0 20px 60px; }
          .earn-divider { margin: 0 20px 48px; }
          .earn-steps { grid-template-columns: 1fr; gap: 16px; }
          .earn-pitch { padding: 32px 24px; }
          .earn-price-block { padding: 40px 24px; }
          .earn-cta-primary { padding: 18px 32px; font-size: 1rem; width: 100%; }
          .earn-cta-white { padding: 18px 32px; font-size: 1rem; width: 100%; }
          .earn-faq-item { padding: 20px; }
        }
      `}</style>

      <div className="earn">

        {/* HEADER */}
        <header className="earn-header">
          <a href="/" className="earn-logo">
            <div className="earn-logo-mark">🌱</div>
            <span className="earn-logo-name">PDF Seeds</span>
          </a>
          <a href="/" className="earn-header-link">Find a guide →</a>
        </header>

        {/* HERO */}
        <section className="earn-hero">
          <span className="earn-eyebrow">The PDF farming opportunity</span>
          <h1 className="earn-h1">
            Stop searching for<br />
            income ideas.<br />
            <span>Start planting them.</span>
          </h1>
          <p className="earn-sub">
            We write the PDF guides. You plant them in front of the right people.
            No writing, no expertise, no fuss — just recurring income from guides people are already searching for.
          </p>
          <div>
            <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>
              {loading ? "Opening checkout…" : "Get Farmer Access — £19.99"}
            </button>
            <div className="earn-trust-line">One-time payment · No monthly fees · Instant access</div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* HOW IT WORKS */}
        <section className="earn-section">
          <div className="earn-steps-label">How it works</div>
          <div className="earn-steps">
            <div className="earn-step">
              <span className="earn-step-icon">🌱</span>
              <div className="earn-step-title">Pay once</div>
              <div className="earn-step-body">£19.99 gets you lifetime access to the farmer dashboard. No subscriptions, no catches.</div>
            </div>
            <div className="earn-step">
              <span className="earn-step-icon">🌿</span>
              <div className="earn-step-title">Plant guides</div>
              <div className="earn-step-body">Browse the library. Share your unique farmer link anywhere — WhatsApp, social media, forums, emails.</div>
            </div>
            <div className="earn-step">
              <span className="earn-step-icon">🌾</span>
              <div className="earn-step-title">Earn 30%</div>
              <div className="earn-step-body">You earn 30% of every sale — £2.99 per guide sold. The guide delivers itself. You do nothing after planting.</div>
            </div>
          </div>
        </section>

        {/* EARNINGS STRIP */}
        <section className="earn-section" style={{ paddingBottom: 0 }}>
          <div className="earn-math">
            <div className="earn-math-label">How the maths works</div>
            <div className="earn-math-row">
              <div className="earn-math-base">Guide price £9.99 &nbsp;×&nbsp; your 30% &nbsp;=&nbsp; <strong>£2.99 per sale</strong></div>
            </div>
            <div className="earn-math-examples">
              <div className="earn-math-ex">
                <span className="earn-math-ex-icon">🌱</span>
                <span className="earn-math-ex-text">1 guide · 10 buyers</span>
                <span className="earn-math-ex-earn">£29.90</span>
              </div>
              <div className="earn-math-ex">
                <span className="earn-math-ex-icon">🌿</span>
                <span className="earn-math-ex-text">5 guides · 10 buyers each</span>
                <span className="earn-math-ex-earn">£149.50</span>
              </div>
              <div className="earn-math-ex">
                <span className="earn-math-ex-icon">🌾</span>
                <span className="earn-math-ex-text">20 guides · 10 buyers each</span>
                <span className="earn-math-ex-earn">£598.00</span>
              </div>
            </div>
            <div className="earn-math-note">10 buyers per guide is conservative — one well-placed post in the right group can exceed that easily.</div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* THE PITCH */}
        <section className="earn-section">
          <div className="earn-pitch">
            <h2 className="earn-pitch-h2">You&apos;ve been Googling income ideas for years.</h2>
            <p className="earn-pitch-body">Most of them require you to:</p>
            <ul className="earn-pain-list">
              <li>Write content for months before you see a single penny</li>
              <li>Film videos and spend years building an audience</li>
              <li>Learn to code, design products, or build something from scratch</li>
              <li>Handle customer support, refunds, and complaints</li>
            </ul>
            <div className="earn-pitch-contrast">
              PDF farming is different. The guides are already written. The buyers are already searching.
              You plant the right guide in front of the right person — and earn every time it sells.
              We handle everything else.
            </div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* WHAT YOU GET */}
        <section className="earn-section">
          <h2 className="earn-get-h2">What you get for £19.99</h2>
          <ul className="earn-get-list">
            <li><strong>30% commission on every sale you drive</strong> — £2.99 per guide, paid automatically</li>
            <li>Lifetime access to the full PDF guide library — 100+ guides and growing</li>
            <li>Your own unique farmer link for every guide in the library</li>
            <li>New guides added automatically as new search demand is spotted</li>
            <li>A dashboard to track what you&apos;ve planted and what&apos;s earning</li>
            <li>Guides covering immigration, business, finance, health, legal — real topics people pay for</li>
            <li>No monthly fees. No writing. No customer support. Ever.</li>
          </ul>
        </section>

        <hr className="earn-divider" />

        {/* PRICE BLOCK */}
        <section className="earn-section">
          <div className="earn-price-block">
            <div className="earn-price-label">Lifetime farmer access</div>
            <div className="earn-price-amount">£19.99</div>
            <div className="earn-price-sub">One-time. No subscriptions. Start earning today.</div>
            <div>
              <button className="earn-cta-white" onClick={handleGetAccess} disabled={loading}>
                {loading ? "Opening checkout…" : "Become a Farmer →"}
              </button>
              <div className="earn-price-guarantee">30-day money-back guarantee · No questions asked</div>
            </div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* FAQ */}
        <section className="earn-section">
          <h2 className="earn-faq-h2">Questions</h2>
          <div className="earn-faq">
            <div className="earn-faq-item">
              <div className="earn-faq-q">Do I need any experience?</div>
              <p className="earn-faq-a">None. If you can share a link, you can farm. That&apos;s the entire skill set.</p>
            </div>
            <div className="earn-faq-item">
              <div className="earn-faq-q">How much can I earn?</div>
              <p className="earn-faq-a">You earn 30% of every sale — £2.99 per guide at the standard price. There&apos;s no cap. Plant a guide in a relevant WhatsApp group or Facebook community and 10 buyers earns you £29.90 from a single post. Plant more guides in more places and the income compounds.</p>
            </div>
            <div className="earn-faq-item">
              <div className="earn-faq-q">What if the guides don&apos;t sell?</div>
              <p className="earn-faq-a">Every guide is built from real search data — people are actively Googling these questions right now. The demand is already there. Your job is simply to put the guide in front of them.</p>
            </div>
            <div className="earn-faq-item">
              <div className="earn-faq-q">Can I see the guides before I pay?</div>
              <p className="earn-faq-a">Yes. The public guide library is on the homepage — every guide visible there is one you can plant as a farmer.</p>
            </div>
            <div className="earn-faq-item">
              <div className="earn-faq-q">Is this a monthly subscription?</div>
              <p className="earn-faq-a">No. £19.99 once. You keep access forever, including every new guide added to the library.</p>
            </div>
          </div>
        </section>

        <footer className="earn-footer">
          © {new Date().getFullYear()} PDF Seeds &nbsp;·&nbsp; <a href="/" style={{ color: "#B0A89A", textDecoration: "none" }}>Find a guide</a>
        </footer>

      </div>
    </>
  );
}
