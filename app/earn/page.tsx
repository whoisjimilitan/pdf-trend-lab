"use client";

import { useState, useEffect } from "react";

export default function EarnPage() {
  const [loading, setLoading] = useState(false);
  const [liveSearches, setLiveSearches] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/search-log")
      .then(r => r.json())
      .then((data: { query: string }[]) => {
        if (Array.isArray(data)) {
          const unique = [...new Set(data.map(d => d.query))].slice(0, 8);
          setLiveSearches(unique);
        }
      })
      .catch(() => {});
  }, []);

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
        .earn-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .earn-logo-mark {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          box-shadow: 0 4px 12px rgba(124,58,237,0.2);
        }
        .earn-logo-name { font-size: 1rem; font-weight: 800; color: #1A1008; letter-spacing: -0.02em; }
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
        .earn-h1 em { font-style: normal; color: #7C3AED; }
        .earn-sub {
          font-size: clamp(1rem, 2.5vw, 1.1rem);
          color: #8C7D6E; line-height: 1.75;
          margin: 0 auto 40px; max-width: 540px;
        }
        .earn-cta-primary {
          display: inline-block;
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          color: #fff; font-weight: 800; font-size: 1.1rem;
          padding: 20px 48px; border-radius: 16px;
          border: none; cursor: pointer;
          box-shadow: 0 8px 28px rgba(124,58,237,0.35);
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: -0.01em; margin-bottom: 14px;
        }
        .earn-cta-primary:hover { opacity: 0.92; }
        .earn-cta-primary:active { transform: scale(0.99); }
        .earn-cta-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        .earn-trust-line { font-size: 0.78rem; color: #C4BAB0; margin-top: 12px; }

        /* ── SECTION WRAPPER ── */
        .earn-section { max-width: 720px; margin: 0 auto; padding: 0 32px 80px; }
        .earn-divider {
          border: none; border-top: 1px solid #EEE9E2;
          max-width: 720px; margin: 0 auto 64px;
        }

        /* ── WHO THIS IS FOR ── */
        .earn-for {
          background: #FFFFFF;
          border: 1.5px solid #EAE6E0;
          border-radius: 24px;
          padding: 44px;
        }
        .earn-for-label {
          font-size: 0.72rem; font-weight: 700;
          color: #9B8AF0; letter-spacing: 0.12em;
          text-transform: uppercase; margin-bottom: 20px;
        }
        .earn-for-h2 {
          font-size: clamp(1.3rem, 3vw, 1.75rem);
          font-weight: 900; color: #1A1008;
          line-height: 1.2; letter-spacing: -0.03em;
          margin: 0 0 24px;
        }
        .earn-for-list {
          list-style: none; padding: 0; margin: 0 0 28px;
          display: flex; flex-direction: column; gap: 13px;
        }
        .earn-for-list li {
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 0.97rem; color: #4B3D30; line-height: 1.6;
        }
        .earn-for-list li::before {
          content: "→";
          color: #7C3AED; font-weight: 700; flex-shrink: 0; margin-top: 2px;
        }
        .earn-for-close {
          font-size: 0.97rem; font-weight: 700; color: #1A1008;
          padding: 18px 20px;
          background: #F5F3FF;
          border-left: 3px solid #7C3AED;
          border-radius: 0 12px 12px 0;
          line-height: 1.6;
          font-style: italic;
        }

        /* ── PAIN SECTION ── */
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
          line-height: 1.8; margin: 0 0 20px;
        }
        .earn-pitch-contrast {
          font-size: 1rem; font-weight: 700; color: #1A1008;
          padding: 18px 20px;
          background: #F5F3FF;
          border-left: 3px solid #7C3AED;
          border-radius: 0 12px 12px 0;
          line-height: 1.6;
        }

        /* ── PERMISSION SLIP ── */
        .earn-permission {
          background: #FBF8FF;
          border: 1.5px solid #DDD6FE;
          border-radius: 20px;
          padding: 36px 40px;
        }
        .earn-permission-h3 {
          font-size: 1.1rem; font-weight: 800; color: #1A1008;
          margin: 0 0 16px; letter-spacing: -0.02em;
        }
        .earn-permission-body {
          font-size: 0.95rem; color: #8C7D6E;
          line-height: 1.8; margin: 0;
        }
        .earn-permission-body strong { color: #1A1008; }

        /* ── HOW IT WORKS ── */
        .earn-steps-label {
          font-size: 0.72rem; font-weight: 700;
          color: #9B8AF0; letter-spacing: 0.12em;
          text-transform: uppercase; margin-bottom: 40px; text-align: center;
        }
        .earn-steps {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }
        .earn-step {
          background: #FFFFFF; border: 1.5px solid #DDD6FE;
          border-radius: 20px; padding: 28px 24px; text-align: center;
        }
        .earn-step-icon { font-size: 2rem; margin-bottom: 16px; display: block; }
        .earn-step-title { font-size: 1rem; font-weight: 800; color: #1A1008; margin-bottom: 8px; letter-spacing: -0.02em; }
        .earn-step-body { font-size: 0.85rem; color: #8C7D6E; line-height: 1.65; }

        /* ── EARNINGS MATH ── */
        .earn-math {
          background: #F5F3FF; border: 1.5px solid #DDD6FE;
          border-radius: 20px; padding: 32px 36px; margin-bottom: 64px;
        }
        .earn-math-label {
          font-size: 0.72rem; font-weight: 700;
          color: #7C3AED; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 14px;
        }
        .earn-math-base {
          font-size: 0.95rem; color: #4B3D30; margin-bottom: 24px; line-height: 1.6;
        }
        .earn-math-base strong { color: #1A1008; }
        .earn-math-examples { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
        .earn-math-ex {
          display: flex; align-items: center; gap: 12px;
          background: #FFFFFF; border-radius: 12px; padding: 12px 16px;
          border: 1px solid #EDE9FE;
        }
        .earn-math-ex-icon { font-size: 1.1rem; flex-shrink: 0; }
        .earn-math-ex-text { flex: 1; font-size: 0.88rem; color: #8C7D6E; }
        .earn-math-ex-earn { font-size: 1rem; font-weight: 800; color: #5B21B6; flex-shrink: 0; }
        .earn-math-note { font-size: 0.78rem; color: #A78BFA; line-height: 1.6; }

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
          color: #7C3AED; font-weight: 800; flex-shrink: 0; font-size: 1rem; margin-top: 1px;
        }

        /* ── PRICE BLOCK ── */
        .earn-price-block {
          background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%);
          border-radius: 24px; padding: 56px 44px;
          text-align: center; color: #fff;
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
        .earn-price-sub { font-size: 0.9rem; color: #C4B5FD; margin-bottom: 6px; line-height: 1.6; }
        .earn-price-recover { font-size: 0.85rem; color: rgba(255,255,255,0.8); font-weight: 600; margin-bottom: 36px; }
        .earn-cta-white {
          display: inline-block;
          background: #FFFFFF; color: #5B21B6;
          font-weight: 800; font-size: 1.05rem;
          padding: 18px 44px; border-radius: 14px;
          border: none; cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: -0.01em; margin-bottom: 14px;
        }
        .earn-cta-white:hover { opacity: 0.93; }
        .earn-cta-white:active { transform: scale(0.99); }
        .earn-cta-white:disabled { opacity: 0.65; cursor: not-allowed; }
        .earn-price-guarantee { font-size: 0.78rem; color: #A78BFA; margin-top: 10px; }

        /* ── FAQ ── */
        .earn-faq-h2 {
          font-size: clamp(1.3rem, 3vw, 1.7rem);
          font-weight: 900; color: #1A1008;
          letter-spacing: -0.03em; margin: 0 0 32px;
        }
        .earn-faq { display: flex; flex-direction: column; gap: 16px; }
        .earn-faq-item {
          background: #FFFFFF; border: 1.5px solid #EAE6E0;
          border-radius: 16px; padding: 24px 28px;
        }
        .earn-faq-q { font-size: 0.97rem; font-weight: 700; color: #1A1008; margin-bottom: 8px; letter-spacing: -0.01em; }
        .earn-faq-a { font-size: 0.88rem; color: #8C7D6E; line-height: 1.7; margin: 0; }

        /* ── FINAL CTA ── */
        .earn-final-cta {
          text-align: center; padding: 56px 40px;
          background: #FFFFFF; border: 1.5px solid #DDD6FE; border-radius: 24px;
        }
        .earn-final-line {
          font-size: clamp(1.2rem, 3vw, 1.55rem);
          font-weight: 800; color: #1A1008;
          line-height: 1.4; letter-spacing: -0.02em; margin: 0 0 32px;
        }

        /* ── LIVE DEMAND STRIP ── */
        .earn-demand {
          background: #FFFFFF; border: 1.5px solid #EAE6E0;
          border-radius: 20px; overflow: hidden;
        }
        .earn-demand-header {
          padding: 16px 24px; border-bottom: 1px solid #EEE9E2;
          display: flex; align-items: center; justify-content: space-between;
        }
        .earn-demand-title { font-size: 0.83rem; font-weight: 700; color: #1A1008; }
        .earn-demand-live {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.68rem; font-weight: 700; color: #15803D;
          background: #F0FDF4; border: 1px solid #BBF7D0;
          border-radius: 999px; padding: 3px 10px;
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        .earn-demand-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #16A34A; flex-shrink: 0;
          animation: live-pulse 1.8s ease-in-out infinite;
        }
        @keyframes live-pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
        }
        .earn-demand-row {
          padding: 11px 24px; display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
          border-bottom: 1px solid #F5F0EB;
        }
        .earn-demand-row:last-child { border-bottom: none; }
        .earn-demand-query {
          font-size: 0.85rem; color: #4B3D30; font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
        }
        .earn-demand-signal {
          font-size: 0.72rem; font-weight: 600; color: #9B8AF0; flex-shrink: 0;
        }
        .earn-demand-sub {
          font-size: 0.75rem; color: #C4BAB0; margin-top: 10px;
          text-align: right; font-style: italic;
        }

        /* ── FOOTER ── */
        .earn-footer {
          text-align: center; padding: 16px 24px;
          font-size: 0.72rem; color: #D4CEC8;
          border-top: 1px solid #EEE9E2; margin-top: 40px;
        }

        /* ── RESPONSIVE: TABLET / IPAD (601–1024px) ── */
        @media (min-width: 601px) and (max-width: 1024px) {
          .earn-hero { padding: 64px 40px 56px; }
          .earn-section { padding: 0 40px 72px; }
          .earn-divider { margin: 0 40px 56px; }
          .earn-steps { gap: 20px; }
          .earn-pitch { padding: 40px 36px; }
          .earn-for { padding: 36px; }
          .earn-permission { padding: 28px 32px; }
          .earn-price-block { padding: 48px 36px; }
          .earn-final-cta { padding: 48px 36px; }
          .earn-math { padding: 28px 32px; }
        }

        /* ── RESPONSIVE: MOBILE (≤600px) ── */
        @media (max-width: 600px) {
          .earn-header { padding: 16px 20px; }
          .earn-logo-name { font-size: 0.9rem; }

          .earn-hero { padding: 48px 20px 40px; }
          .earn-h1 { font-size: 2rem; letter-spacing: -0.03em; }
          .earn-sub { font-size: 0.92rem; }
          .earn-cta-primary { padding: 18px 24px; font-size: 1rem; width: 100%; min-height: 56px; display: block; }

          .earn-section { padding: 0 20px 56px; }
          .earn-divider { margin: 0 20px 44px; }

          .earn-for { padding: 24px 20px; }
          .earn-for-h2 { font-size: 1.3rem; }
          .earn-for-list li { font-size: 0.9rem; }
          .earn-for-close { font-size: 0.88rem; padding: 14px 16px; }

          .earn-pitch { padding: 28px 20px; }
          .earn-pitch-h2 { font-size: 1.3rem; }
          .earn-pitch-body { font-size: 0.88rem; }
          .earn-pitch-contrast { font-size: 0.88rem; padding: 14px 16px; }

          .earn-permission { padding: 22px 20px; }
          .earn-permission-h3 { font-size: 1rem; }
          .earn-permission-body { font-size: 0.88rem; }

          .earn-steps { grid-template-columns: 1fr; gap: 14px; }
          .earn-step { padding: 22px 20px; }
          .earn-step-title { font-size: 0.95rem; }
          .earn-step-body { font-size: 0.82rem; }

          .earn-math { padding: 22px 18px; margin-bottom: 48px; }
          .earn-math-base { font-size: 0.88rem; }
          .earn-math-ex { padding: 10px 14px; }
          .earn-math-ex-text { font-size: 0.8rem; }
          .earn-math-ex-earn { font-size: 0.92rem; }
          .earn-math-note { font-size: 0.74rem; }

          .earn-get-h2 { font-size: 1.3rem; }
          .earn-get-list li { font-size: 0.88rem; }

          .earn-price-block { padding: 36px 20px; }
          .earn-cta-white { padding: 18px 24px; font-size: 1rem; width: 100%; min-height: 56px; display: block; }

          .earn-faq-h2 { font-size: 1.3rem; margin-bottom: 24px; }
          .earn-faq-item { padding: 18px 20px; }
          .earn-faq-q { font-size: 0.92rem; }
          .earn-faq-a { font-size: 0.84rem; }

          .earn-final-cta { padding: 32px 20px; }
          .earn-final-line { font-size: 1.15rem; margin-bottom: 24px; }

          .earn-footer { padding: 14px 20px; font-size: 0.7rem; }
        }

        /* ── RESPONSIVE: SMALL PHONES (≤380px) ── */
        @media (max-width: 380px) {
          .earn-hero { padding: 36px 16px 32px; }
          .earn-section { padding: 0 16px 48px; }
          .earn-divider { margin: 0 16px 36px; }
          .earn-h1 { font-size: 1.75rem; }
          .earn-price-amount { font-size: 3rem; }
          .earn-math-ex { flex-wrap: wrap; }
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
          <span className="earn-eyebrow">Partner Programme</span>
          <h1 className="earn-h1">
            You&apos;ve answered that question<br />
            a hundred times.<br />
            <em>Start getting paid for the next one.</em>
          </h1>
          <p className="earn-sub">
            You&apos;re already the person your community turns to — for visa questions, business registration, tax advice, housing rights.
            PDF Seeds lets you turn that trusted position into income without changing a single thing you already do.
          </p>
          <div>
            <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>
              {loading ? "Opening checkout…" : "Join as a Partner — £19.99"}
            </button>
            <div className="earn-trust-line">One-time payment · No monthly fees · Start today</div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* WHO THIS IS FOR */}
        <section className="earn-section">
          <div className="earn-for">
            <div className="earn-for-label">Who this is for</div>
            <h2 className="earn-for-h2">You&apos;re the person people call when they&apos;re stuck.</h2>
            <ul className="earn-for-list">
              <li>Your WhatsApp group pings you first when someone needs to register a business, apply for a visa, or figure out a tax return</li>
              <li>You run a diaspora community, church group, or local forum — and the same questions come in every single week</li>
              <li>You&apos;re a professional — an accountant, social worker, pastor, immigration advisor — who already gives guidance informally, for free</li>
              <li>You have a newsletter, a YouTube channel, or a Facebook group where real people ask real questions and genuinely trust your answers</li>
              <li>You&apos;re the one who shares resources — not the one who asks for them</li>
            </ul>
            <div className="earn-for-close">
              If you read that and thought &ldquo;that&apos;s me&rdquo; — this programme was built for you specifically.
            </div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* THE PAIN */}
        <section className="earn-section">
          <div className="earn-pitch">
            <h2 className="earn-pitch-h2">You&apos;ve typed the same answer thirty times. For free.</h2>
            <p className="earn-pitch-body">
              The voice notes at midnight. The WhatsApp messages that start with &ldquo;can I just quickly ask you something?&rdquo; and turn into an hour. The links you track down, the forms you explain, the processes you walk people through — because that&apos;s who you are.
            </p>
            <p className="earn-pitch-body">
              But the people asking you are the same ones spending £49 on a vague YouTube course from a stranger who barely understands their situation. They don&apos;t need a stranger — they need you. They just need what you know in a format they can read properly, save, and come back to.
            </p>
            <div className="earn-pitch-contrast">
              You could be the one who gives them that — and earn from it every time. Not instead of helping. As a result of it.
            </div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* PERMISSION SLIP */}
        <section className="earn-section">
          <div className="earn-permission">
            <h3 className="earn-permission-h3">Let&apos;s be honest about something.</h3>
            <p className="earn-permission-body">
              Wanting something back for what you already give isn&apos;t greedy. It&apos;s sustainable.
              The community leaders who burn out are the ones who give everything without return — and eventually stop.<br /><br />
              You don&apos;t need to become a marketer. You don&apos;t need a funnel, a course, or a content strategy.
              You just need to <strong>send the right link to the right person at the right moment</strong> — which you are already doing.
              The guide delivers itself. Stripe pays you automatically. You carry on being exactly who you already are.
            </p>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* HOW IT WORKS */}
        <section className="earn-section">
          <div className="earn-steps-label">How it works</div>
          <div className="earn-steps">
            <div className="earn-step">
              <span className="earn-step-icon">🎯</span>
              <div className="earn-step-title">Find your guides</div>
              <div className="earn-step-body">Browse the library. Pick guides that match the questions your community actually asks. There is one for almost every real-life situation.</div>
            </div>
            <div className="earn-step">
              <span className="earn-step-icon">🔗</span>
              <div className="earn-step-title">Share your link</div>
              <div className="earn-step-body">Every guide has your unique partner link. Share it exactly where you already share things — WhatsApp, a group, your newsletter, a story, a comment.</div>
            </div>
            <div className="earn-step">
              <span className="earn-step-icon">💷</span>
              <div className="earn-step-title">Earn while you sleep</div>
              <div className="earn-step-body">Every time someone buys through your link, you earn 30%. The guide delivers itself. You never handle a query, a refund, or a single customer message.</div>
            </div>
          </div>
        </section>

        {/* EARNINGS MATH */}
        <section className="earn-section" style={{ paddingBottom: 0 }}>
          <div className="earn-math">
            <div className="earn-math-label">What one message can return</div>
            <div className="earn-math-base">
              Guide price £9.99 &nbsp;×&nbsp; your 30% &nbsp;=&nbsp; <strong>£2.99 per sale</strong>
            </div>
            <div className="earn-math-examples">
              <div className="earn-math-ex">
                <span className="earn-math-ex-icon">💬</span>
                <span className="earn-math-ex-text">One WhatsApp message · 10 people buy</span>
                <span className="earn-math-ex-earn">£29.90</span>
              </div>
              <div className="earn-math-ex">
                <span className="earn-math-ex-icon">📌</span>
                <span className="earn-math-ex-text">Pinned in 3 community groups · 10 buyers each</span>
                <span className="earn-math-ex-earn">£89.70</span>
              </div>
              <div className="earn-math-ex">
                <span className="earn-math-ex-icon">📧</span>
                <span className="earn-math-ex-text">Newsletter mention · 50 buyers over a month</span>
                <span className="earn-math-ex-earn">£149.50</span>
              </div>
            </div>
            <div className="earn-math-note">10 buyers is conservative. In a group that already trusts your recommendations, it&apos;s usually more — and a good guide gets forwarded.</div>
          </div>
        </section>

        <hr className="earn-divider" style={{ marginTop: 64 }} />

        {/* WHAT YOU GET */}
        <section className="earn-section">
          <h2 className="earn-get-h2">What you get for £19.99</h2>
          <ul className="earn-get-list">
            <li><strong>30% commission on every sale you drive</strong> — £2.99 per guide at standard price, paid automatically via Stripe</li>
            <li>Your unique partner link for every guide in the library — share any, earn on all of them</li>
            <li>Lifetime access — including every new guide added as new demand is spotted (new guides go in weekly)</li>
            <li>Guides covering UK immigration, business registration, self-assessment tax, NHS navigation, housing rights, international finance, and more</li>
            <li>A dashboard showing exactly what you&apos;ve shared, who bought, and what you&apos;ve earned</li>
            <li>A ready-to-send WhatsApp message template for your community — share it within minutes of joining, no guesswork about what to say</li>
            <li>No writing. No customer service. No delivery. No technical setup. No monthly fees. Ever.</li>
          </ul>
        </section>

        <hr className="earn-divider" />

        {/* LIVE DEMAND STRIP */}
        {liveSearches.length > 0 && (
          <section className="earn-section">
            <div className="earn-steps-label">What your community is searching for right now</div>
            <div className="earn-demand">
              <div className="earn-demand-header">
                <div className="earn-demand-title">Live searches on pdfseeds.com</div>
                <div className="earn-demand-live">
                  <div className="earn-demand-dot" />
                  Live
                </div>
              </div>
              {liveSearches.map((q, i) => (
                <div key={i} className="earn-demand-row">
                  <div className="earn-demand-query">&ldquo;{q}&rdquo;</div>
                  <div className="earn-demand-signal">demand signal ↗</div>
                </div>
              ))}
            </div>
            <div className="earn-demand-sub">Real queries typed by real people — every one is a guide someone would pay for</div>
          </section>
        )}

        <hr className="earn-divider" />

        {/* PRICE BLOCK */}
        <section className="earn-section">
          <div className="earn-price-block">
            <div className="earn-price-label">Partner Programme Access</div>
            <div className="earn-price-amount">£19.99</div>
            <div className="earn-price-sub">One-time. No subscriptions. Start earning today.</div>
            <div className="earn-price-recover">Your first 7 sales pay for it. Everything after that is yours.</div>
            <div>
              <button className="earn-cta-white" onClick={handleGetAccess} disabled={loading}>
                {loading ? "Opening checkout…" : "Become a Partner →"}
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
              <div className="earn-faq-q">Do I need a big audience or following?</div>
              <p className="earn-faq-a">No. A single active WhatsApp group, a Facebook community you admin, or a small trusted newsletter is more than enough. The point is trust — not scale. 50 people who genuinely trust your recommendations outperform 5,000 strangers every time.</p>
            </div>
            <div className="earn-faq-item">
              <div className="earn-faq-q">What kind of guides are in the library?</div>
              <p className="earn-faq-a">Real-life topics people actually search for and pay to understand: how to register a business in Ghana, Nigeria, or the UK. How to apply for indefinite leave to remain. How to complete a self-assessment tax return. How to navigate an NHS referral. Practical, specific, country-aware guides — not generic information you could already find on Google.</p>
            </div>
            <div className="earn-faq-item">
              <div className="earn-faq-q">Do I handle delivery, support, or refunds?</div>
              <p className="earn-faq-a">Nothing. When someone buys through your link, the guide is delivered automatically, the payment is processed by Stripe, and if anything goes wrong we handle it. You share the link. That is the full extent of your involvement.</p>
            </div>
            <div className="earn-faq-item">
              <div className="earn-faq-q">When and how do I get paid?</div>
              <p className="earn-faq-a">Commissions are attributed to your link automatically. Your dashboard shows every sale in real time. Payments are made via Stripe — the same payment processor used by millions of businesses worldwide.</p>
            </div>
            <div className="earn-faq-item">
              <div className="earn-faq-q">Is there a monthly subscription?</div>
              <p className="earn-faq-a">No. £19.99 once. You keep full partner access forever — including every new guide added to the library from the day you join.</p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="earn-section" style={{ paddingBottom: 80 }}>
          <div className="earn-final-cta">
            <p className="earn-final-line">
              Your community already trusts you.<br />
              The only thing missing is getting paid for it.
            </p>
            <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>
              {loading ? "Opening checkout…" : "Join as a Partner — £19.99 →"}
            </button>
            <div className="earn-trust-line">One-time payment · 30-day money-back guarantee</div>
          </div>
        </section>

        <footer className="earn-footer">
          © {new Date().getFullYear()} PDF Seeds &nbsp;·&nbsp;
          <a href="/" style={{ color: "#B0A89A", textDecoration: "none" }}>Find a guide</a>
        </footer>

      </div>
    </>
  );
}
