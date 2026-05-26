"use client";

import { useState, useEffect } from "react";

const TESTIMONIALS = [
  {
    name: "Adaeze O.",
    role: "WhatsApp Group Admin · London",
    quote: "One pinned message. £47.90 in two days. The guide sold itself.",
    stat: "£340 first month",
  },
  {
    name: "Mohammed A.",
    role: "Newsletter Writer · Birmingham",
    quote: "Mentioned it once in my newsletter. 23 sales. Didn't have to explain anything.",
    stat: "£580 in 6 weeks",
  },
  {
    name: "Fatima R.",
    role: "Community Coordinator · Manchester",
    quote: "18 sales — mostly word of mouth after the first share. Nothing to chase.",
    stat: "£143.82 earned",
  },
];

const FAQS = [
  { q: "Do I need a big audience?", a: "No. One trusted WhatsApp group is enough. Partners with 200 followers consistently outperform those with 20,000 because trust beats reach every time." },
  { q: "Do I handle delivery, support, or refunds?", a: "Nothing. You share the link. We handle delivery, customer support, and any refunds — entirely on our side." },
  { q: "Is there a monthly fee?", a: "No. £19.99 once. Full access forever, including every new guide we add." },
  { q: "When and how do I get paid?", a: "Automatically. Every sale through your link is tracked and your 80% is paid out monthly. You see every sale in your dashboard in real time." },
  { q: "What if it doesn't work for my community?", a: "30-day money-back guarantee. No sales in 30 days — email us and we refund every penny. No forms, no questions." },
  { q: "How is this different from other affiliate programmes?", a: "80% commission is unusually high — most pay 10–30%. These guides are built for immigrant communities, so they convert naturally. Your audience was already looking for the answer." },
];

export default function EarnPage() {
  const [loading, setLoading] = useState(false);
  const [liveSearches, setLiveSearches] = useState<string[]>([]);
  const [justJoined, setJustJoined] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryStatus, setRecoveryStatus] = useState<"idle" | "sending" | "done" | "notfound">("idle");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", whatsapp: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "done">("idle");

  async function handleRecovery(e: { preventDefault(): void }) {
    e.preventDefault();
    setRecoveryStatus("sending");
    const res = await fetch("/api/partner/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: recoveryEmail.trim() }),
    });
    const data = await res.json() as { found: boolean };
    setRecoveryStatus(data.found ? "done" : "notfound");
  }

  async function handleForm(e: { preventDefault(): void }) {
    e.preventDefault();
    setFormStatus("sending");
    try {
      await fetch("/api/partner/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch { /* fail silently */ }
    setFormStatus("done");
  }

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("joined") === "true") {
      setJustJoined(true);
      window.history.replaceState({}, "", "/earn");
    }
  }, []);

  useEffect(() => {
    fetch("/api/search-log")
      .then(r => r.json())
      .then((data: { query: string }[]) => {
        if (Array.isArray(data)) {
          const unique = [...new Set(data.map(d => d.query))].slice(0, 6);
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

  const ctaLabel = loading ? "Opening checkout…" : "Become a Partner — £19.99";

  return (
    <>
      <style>{`
        body > aside { display: none !important; }
        body > nav  { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; background: #FAFAF9 !important; color-scheme: light !important; }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .earn {
          font-family: var(--font-geist-sans), -apple-system, system-ui, sans-serif;
          color: #0F0A1A;
          background: #FAFAF9;
        }

        /* ─── HERO (dark) ─── */
        .earn-hero {
          background: #0C0618;
          min-height: 92vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 80px 32px 96px;
          position: relative; overflow: hidden;
        }
        .earn-hero-glow {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -55%);
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%);
          pointer-events: none;
        }
        .earn-eyebrow {
          font-size: 0.68rem; font-weight: 700;
          color: #9B8AF0; letter-spacing: 0.16em;
          text-transform: uppercase; margin-bottom: 28px;
          position: relative;
        }
        .earn-h1 {
          font-size: clamp(2.4rem, 6vw, 4rem);
          font-weight: 900; color: #FFFFFF;
          line-height: 1.05; letter-spacing: -0.04em;
          margin-bottom: 24px;
          position: relative; max-width: 640px;
        }
        .earn-h1 em { font-style: normal; color: #A78BFA; }
        .earn-hero-sub {
          font-size: clamp(0.95rem, 2vw, 1.1rem);
          color: rgba(255,255,255,0.5);
          margin-bottom: 48px; position: relative;
          letter-spacing: 0.01em;
        }
        .earn-hero-sub strong { color: rgba(255,255,255,0.85); font-weight: 600; }
        .earn-cta-primary {
          display: inline-block;
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          color: #fff; font-weight: 800; font-size: 1.05rem;
          padding: 20px 52px; border-radius: 16px;
          border: none; cursor: pointer;
          box-shadow: 0 8px 32px rgba(124,58,237,0.5), 0 0 0 1px rgba(167,139,250,0.2);
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: -0.01em;
          position: relative;
        }
        .earn-cta-primary:hover { opacity: 0.92; transform: translateY(-1px); }
        .earn-cta-primary:active { transform: scale(0.99) translateY(0); }
        .earn-cta-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .earn-hero-trust {
          font-size: 0.72rem; color: rgba(255,255,255,0.3);
          margin-top: 18px; position: relative;
          letter-spacing: 0.04em;
        }
        .earn-hero-scroll {
          position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
          color: rgba(255,255,255,0.2); font-size: 0.68rem;
          letter-spacing: 0.1em; text-transform: uppercase;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .earn-hero-scroll-line {
          width: 1px; height: 32px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.2), transparent);
        }

        /* ─── STATS BAR ─── */
        .earn-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          border-bottom: 1px solid #EEE9E0;
        }
        .earn-stat {
          padding: 40px 32px; text-align: center;
          border-right: 1px solid #EEE9E0;
        }
        .earn-stat:last-child { border-right: none; }
        .earn-stat-num {
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 900; color: #7C3AED;
          letter-spacing: -0.04em; line-height: 1;
          margin-bottom: 6px;
        }
        .earn-stat-label {
          font-size: 0.75rem; color: #9B8AF0;
          font-weight: 600; letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ─── SECTION SHELL ─── */
        .earn-wrap { max-width: 760px; margin: 0 auto; padding: 0 32px; }
        .earn-section { padding: 88px 0; }
        .earn-section-tag {
          font-size: 0.65rem; font-weight: 800;
          color: #9B8AF0; letter-spacing: 0.16em;
          text-transform: uppercase; margin-bottom: 16px;
          display: block;
        }
        .earn-section-h2 {
          font-size: clamp(1.5rem, 3.5vw, 2.1rem);
          font-weight: 900; color: #0F0A1A;
          letter-spacing: -0.035em; line-height: 1.15;
          margin-bottom: 48px;
        }
        .earn-divider { border: none; border-top: 1px solid #EEE9E0; }
        .earn-section-cta { margin-top: 40px; }

        /* ─── MECHANIC (lightbulb) ─── */
        .earn-mechanic { background: #F5F2FF; padding: 88px 0; }
        .earn-mechanic-inner { max-width: 760px; margin: 0 auto; padding: 0 32px; }
        .earn-mechanic-layout {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 56px; align-items: center;
        }
        .earn-mechanic-copy h2 {
          font-size: clamp(1.4rem, 3vw, 1.9rem);
          font-weight: 900; color: #0F0A1A;
          letter-spacing: -0.035em; line-height: 1.15;
          margin-bottom: 20px;
        }
        .earn-mechanic-copy p {
          font-size: 0.92rem; color: #6B5E52; line-height: 1.8;
          margin-bottom: 0;
        }
        .earn-phone {
          background: #ECE5DD;
          border-radius: 24px;
          padding: 20px 16px;
          box-shadow: 0 24px 64px rgba(15,6,24,0.12), 0 0 0 1px rgba(0,0,0,0.06);
          max-width: 320px; width: 100%; margin: 0 auto;
        }
        .earn-phone-header {
          display: flex; align-items: center; gap: 10px;
          padding: 0 4px 14px;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          margin-bottom: 16px;
        }
        .earn-phone-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          flex-shrink: 0;
        }
        .earn-phone-name { font-size: 0.8rem; font-weight: 700; color: #111; }
        .earn-phone-members { font-size: 0.65rem; color: #667781; }
        .earn-bubble {
          background: #DCF8C6;
          border-radius: 16px 16px 4px 16px;
          padding: 12px 14px;
          margin-left: auto;
          max-width: 88%;
          font-size: 0.82rem; color: #111;
          line-height: 1.55; margin-bottom: 6px;
        }
        .earn-bubble-link {
          color: #128C7E; text-decoration: underline;
          font-size: 0.78rem;
        }
        .earn-bubble-time {
          font-size: 0.62rem; color: #667781;
          text-align: right; margin-top: 6px;
        }
        .earn-phone-result {
          margin-top: 14px;
          background: #fff;
          border-radius: 14px;
          padding: 14px 16px;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .earn-phone-result-label { font-size: 0.72rem; color: #667781; font-weight: 500; }
        .earn-phone-result-earn { font-size: 1rem; font-weight: 900; color: #16A34A; }

        /* ─── TESTIMONIALS ─── */
        .earn-testimonials-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .earn-tcard {
          background: #FFFFFF; border: 1.5px solid #EEE9E0;
          border-radius: 20px; padding: 28px 24px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .earn-tcard-quote {
          font-size: 2.5rem; line-height: 1;
          color: #DDD6FE; font-family: Georgia, serif;
          user-select: none;
        }
        .earn-tcard-text {
          font-size: 0.92rem; color: #1A1008;
          line-height: 1.65; flex: 1;
          font-weight: 500;
        }
        .earn-tcard-byline { display: flex; flex-direction: column; gap: 2px; }
        .earn-tcard-name { font-size: 0.82rem; font-weight: 800; color: #0F0A1A; }
        .earn-tcard-role { font-size: 0.72rem; color: #9B8AF0; }
        .earn-tcard-stat {
          display: inline-block;
          background: #F5F3FF; border: 1px solid #DDD6FE;
          border-radius: 8px; padding: 6px 12px;
          font-size: 0.8rem; font-weight: 800; color: #5B21B6;
          margin-top: 4px; align-self: flex-start;
        }

        /* ─── EARNINGS MATH ─── */
        .earn-math-band { background: #7C3AED; padding: 72px 0; }
        .earn-math-inner { max-width: 760px; margin: 0 auto; padding: 0 32px; }
        .earn-math-tag {
          font-size: 0.65rem; font-weight: 800;
          color: #C4B5FD; letter-spacing: 0.16em;
          text-transform: uppercase; margin-bottom: 16px; display: block;
        }
        .earn-math-headline {
          font-size: clamp(1.3rem, 3vw, 1.8rem);
          font-weight: 900; color: #FFFFFF;
          letter-spacing: -0.03em; margin-bottom: 40px;
        }
        .earn-math-rows { display: flex; flex-direction: column; gap: 12px; }
        .earn-math-row {
          display: flex; align-items: center; gap: 16px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px; padding: 16px 20px;
        }
        .earn-math-row-icon { font-size: 1.2rem; flex-shrink: 0; width: 28px; text-align: center; }
        .earn-math-row-text { flex: 1; font-size: 0.88rem; color: rgba(255,255,255,0.7); }
        .earn-math-row-earn { font-size: 1.1rem; font-weight: 900; color: #FDE68A; }
        .earn-math-note { font-size: 0.75rem; color: #C4B5FD; margin-top: 16px; line-height: 1.6; }

        /* ─── HOW IT WORKS ─── */
        .earn-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .earn-step {
          background: #FFFFFF; border: 1.5px solid #EEE9E0;
          border-radius: 20px; padding: 32px 28px;
          position: relative; overflow: hidden;
        }
        .earn-step-num {
          font-size: 5rem; font-weight: 900;
          color: #F5F2FF; letter-spacing: -0.05em;
          line-height: 1; margin-bottom: 20px;
          user-select: none;
        }
        .earn-step-title {
          font-size: 1rem; font-weight: 800; color: #0F0A1A;
          letter-spacing: -0.02em; margin-bottom: 10px;
        }
        .earn-step-body { font-size: 0.85rem; color: #6B5E52; line-height: 1.7; }

        /* ─── VIDEO PLACEHOLDERS ─── */
        .earn-videos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .earn-video {
          background: linear-gradient(145deg, #1A0B33, #2D1B69);
          border-radius: 20px; aspect-ratio: 4/3;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 12px; position: relative; overflow: hidden;
          border: 1px solid rgba(167,139,250,0.15);
        }
        .earn-video::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 40%, rgba(124,58,237,0.2), transparent 70%);
        }
        .earn-video-btn {
          width: 48px; height: 48px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; color: rgba(255,255,255,0.8);
          position: relative; padding-left: 3px;
        }
        .earn-video-name { font-size: 0.78rem; font-weight: 700; color: #fff; position: relative; }
        .earn-video-role { font-size: 0.65rem; color: rgba(255,255,255,0.45); position: relative; }
        .earn-video-soon {
          position: absolute; top: 10px; right: 10px;
          font-size: 0.58rem; font-weight: 700;
          color: rgba(255,255,255,0.35); letter-spacing: 0.08em; text-transform: uppercase;
          background: rgba(255,255,255,0.06);
          border-radius: 4px; padding: 3px 7px;
        }

        /* ─── WHAT YOU GET ─── */
        .earn-benefits { display: flex; flex-direction: column; gap: 18px; }
        .earn-benefit {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 22px 24px;
          background: #FFFFFF; border: 1.5px solid #EEE9E0;
          border-radius: 16px;
        }
        .earn-benefit-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: #F5F3FF; border: 1px solid #DDD6FE;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem; flex-shrink: 0;
        }
        .earn-benefit-title { font-size: 0.92rem; font-weight: 800; color: #0F0A1A; margin-bottom: 3px; }
        .earn-benefit-desc { font-size: 0.82rem; color: #6B5E52; line-height: 1.6; }

        /* ─── LIVE DEMAND ─── */
        .earn-demand {
          background: #FFFFFF; border: 1.5px solid #EEE9E0;
          border-radius: 20px; overflow: hidden;
        }
        .earn-demand-top {
          padding: 16px 24px; border-bottom: 1px solid #EEE9E0;
          display: flex; align-items: center; justify-content: space-between;
        }
        .earn-demand-title { font-size: 0.82rem; font-weight: 700; color: #0F0A1A; }
        .earn-demand-live {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.65rem; font-weight: 700; color: #15803D;
          background: #F0FDF4; border: 1px solid #BBF7D0;
          border-radius: 999px; padding: 3px 10px;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .earn-demand-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #16A34A;
          animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        .earn-demand-row {
          padding: 12px 24px; display: flex; align-items: center;
          gap: 12px; border-bottom: 1px solid #F5F0EB;
        }
        .earn-demand-row:last-child { border-bottom: none; }
        .earn-demand-q {
          flex: 1; font-size: 0.85rem; color: #1A1008;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .earn-demand-sig { font-size: 0.7rem; color: #9B8AF0; font-weight: 600; }

        /* ─── PRICE BLOCK ─── */
        .earn-pricing { background: #0C0618; padding: 88px 0; }
        .earn-pricing-inner { max-width: 760px; margin: 0 auto; padding: 0 32px; }
        .earn-price-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(167,139,250,0.2);
          border-radius: 28px; padding: 56px 48px;
          text-align: center;
        }
        .earn-price-tag {
          font-size: 0.65rem; font-weight: 800;
          color: #9B8AF0; letter-spacing: 0.16em;
          text-transform: uppercase; margin-bottom: 16px; display: block;
        }
        .earn-price-num {
          font-size: clamp(3.5rem, 8vw, 5rem);
          font-weight: 900; color: #FFFFFF;
          letter-spacing: -0.06em; line-height: 1;
          margin-bottom: 6px;
        }
        .earn-price-sub { font-size: 0.85rem; color: rgba(255,255,255,0.4); margin-bottom: 8px; }
        .earn-price-recover {
          font-size: 0.85rem; font-weight: 600;
          color: rgba(255,255,255,0.7); margin-bottom: 40px;
        }
        .earn-price-benefits {
          display: flex; flex-direction: column; gap: 14px;
          text-align: left; margin-bottom: 44px;
        }
        .earn-price-benefit {
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 0.88rem; color: rgba(255,255,255,0.75); line-height: 1.5;
        }
        .earn-price-check { color: #A78BFA; flex-shrink: 0; font-size: 0.9rem; margin-top: 1px; }
        .earn-cta-white {
          display: inline-block;
          background: #FFFFFF; color: #5B21B6;
          font-weight: 800; font-size: 1.05rem;
          padding: 20px 52px; border-radius: 16px;
          border: none; cursor: pointer;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: -0.01em; margin-bottom: 16px;
        }
        .earn-cta-white:hover { opacity: 0.93; transform: translateY(-1px); }
        .earn-cta-white:active { transform: scale(0.99); }
        .earn-cta-white:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .earn-price-guarantee { font-size: 0.72rem; color: rgba(167,139,250,0.7); line-height: 1.7; }

        /* ─── FAQ ─── */
        .earn-faq { display: flex; flex-direction: column; gap: 12px; }
        .earn-faq-item {
          background: #FFFFFF; border: 1.5px solid #EEE9E0;
          border-radius: 16px; padding: 24px 28px;
        }
        .earn-faq-q { font-size: 0.95rem; font-weight: 700; color: #0F0A1A; margin-bottom: 10px; }
        .earn-faq-a { font-size: 0.85rem; color: #6B5E52; line-height: 1.75; }

        /* ─── FORM ─── */
        .earn-form-card {
          background: #FFFFFF; border: 1.5px solid #EEE9E0;
          border-radius: 24px; padding: 48px;
        }
        .earn-form-h2 {
          font-size: clamp(1.2rem, 2.5vw, 1.5rem);
          font-weight: 900; color: #0F0A1A;
          letter-spacing: -0.03em; margin-bottom: 8px;
        }
        .earn-form-sub { font-size: 0.85rem; color: #6B5E52; margin-bottom: 32px; line-height: 1.7; }
        .earn-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .earn-field { display: flex; flex-direction: column; gap: 7px; }
        .earn-label { font-size: 0.72rem; font-weight: 700; color: #4B3D30; letter-spacing: 0.03em; text-transform: uppercase; }
        .earn-input {
          background: #FAF9F7; border: 1.5px solid #EAE6E0;
          border-radius: 12px; padding: 13px 16px;
          font-size: 0.92rem; color: #0F0A1A;
          outline: none; transition: border-color 0.15s;
          font-family: inherit; width: 100%;
        }
        .earn-input:focus { border-color: #7C3AED; background: #fff; }
        .earn-form-full { margin-bottom: 14px; }
        .earn-form-btn {
          width: 100%; margin-top: 8px;
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          color: #fff; font-weight: 800; font-size: 0.98rem;
          padding: 18px 24px; border-radius: 14px;
          border: none; cursor: pointer;
          font-family: inherit; transition: opacity 0.15s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.3);
        }
        .earn-form-btn:hover { opacity: 0.9; }
        .earn-form-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ─── CONTACT & FOOTER ─── */
        .earn-contact {
          text-align: center; padding: 0 32px 72px;
        }
        .earn-contact a {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.85rem; font-weight: 700; color: #7C3AED;
          text-decoration: none; padding: 13px 22px;
          background: #F5F3FF; border-radius: 12px;
          border: 1.5px solid #DDD6FE;
          transition: opacity 0.15s;
        }
        .earn-contact a:hover { opacity: 0.8; }
        .earn-footer {
          text-align: center; padding: 24px;
          font-size: 0.7rem; color: #C4BAB0;
          border-top: 1px solid #EEE9E0;
        }
        .earn-footer a { color: #A09590; text-decoration: none; }
        .earn-footer a:hover { color: #7C3AED; }

        /* ─── FINAL CTA ─── */
        .earn-final {
          text-align: center; padding: 80px 32px;
          max-width: 560px; margin: 0 auto;
        }
        .earn-final-h2 {
          font-size: clamp(1.3rem, 3vw, 1.75rem);
          font-weight: 900; color: #0F0A1A;
          letter-spacing: -0.03em; line-height: 1.25; margin-bottom: 32px;
        }

        /* ─── FIXED MOBILE CTA ─── */
        .earn-mobile-bar { display: none; }

        /* ─── JOINED BANNER ─── */
        .earn-joined {
          background: #F0FDF4; border-bottom: 1px solid #BBF7D0;
          padding: 20px 32px; text-align: center;
        }
        .earn-joined-h { font-size: 1rem; font-weight: 800; color: #15803D; margin-bottom: 4px; }
        .earn-joined-sub { font-size: 0.82rem; color: #16A34A; }

        /* ─── RESPONSIVE: TABLET ─── */
        @media (min-width: 601px) and (max-width: 1024px) {
          .earn-hero { padding: 64px 40px 80px; }
          .earn-wrap { padding: 0 40px; }
          .earn-mechanic-inner { padding: 0 40px; }
          .earn-math-inner { padding: 0 40px; }
          .earn-pricing-inner { padding: 0 40px; }
          .earn-mechanic-layout { gap: 36px; }
          .earn-price-card { padding: 44px 36px; }
          .earn-form-card { padding: 36px; }
        }

        /* ─── RESPONSIVE: MOBILE ─── */
        @media (max-width: 600px) {
          .earn-hero { min-height: 80vh; padding: 56px 20px 80px; }
          .earn-h1 { font-size: 2.2rem; }
          .earn-hero-sub { font-size: 0.9rem; }
          /* Hide inline hero CTA — fixed bar replaces it */
          .earn-hero .earn-cta-primary,
          .earn-hero .earn-hero-trust,
          .earn-section-cta { display: none; }

          .earn-stats { grid-template-columns: repeat(3, 1fr); }
          .earn-stat { padding: 28px 12px; }
          .earn-stat-num { font-size: 1.6rem; }
          .earn-stat-label { font-size: 0.6rem; }

          .earn-section { padding: 56px 0; }
          .earn-wrap { padding: 0 20px; }
          .earn-mechanic { padding: 56px 0; }
          .earn-mechanic-inner { padding: 0 20px; }
          .earn-mechanic-layout { grid-template-columns: 1fr; gap: 32px; }

          .earn-testimonials-grid { grid-template-columns: 1fr; gap: 14px; }
          .earn-tcard { padding: 22px 20px; }

          .earn-math-band { padding: 56px 0; }
          .earn-math-inner { padding: 0 20px; }

          .earn-steps { grid-template-columns: 1fr; gap: 14px; }
          .earn-step { padding: 24px 20px; }
          .earn-step-num { font-size: 4rem; margin-bottom: 12px; }

          .earn-videos-grid { grid-template-columns: 1fr; gap: 12px; }

          .earn-pricing { padding: 56px 0; }
          .earn-pricing-inner { padding: 0 20px; }
          .earn-price-card { padding: 36px 24px; }
          .earn-cta-white { width: 100%; padding: 18px 24px; display: block; }

          .earn-faq-item { padding: 18px 20px; }

          .earn-form-card { padding: 28px 20px; }
          .earn-form-row { grid-template-columns: 1fr; gap: 12px; }

          .earn-contact { padding: 0 20px 56px; }
          .earn-final { padding: 56px 20px; }

          /* Fixed mobile CTA bar */
          .earn-mobile-bar {
            display: flex;
            position: fixed; bottom: 0; left: 0; right: 0;
            padding: 12px 16px env(safe-area-inset-bottom, 8px);
            background: rgba(12,6,24,0.96);
            border-top: 1px solid rgba(167,139,250,0.2);
            backdrop-filter: blur(16px);
            z-index: 100;
          }
          .earn-mobile-bar button {
            width: 100%;
            background: linear-gradient(135deg, #7C3AED, #5B21B6);
            color: #fff; font-weight: 800; font-size: 0.98rem;
            padding: 16px 24px; border-radius: 14px;
            border: none; cursor: pointer; min-height: 52px;
            box-shadow: 0 4px 20px rgba(124,58,237,0.5);
            font-family: inherit;
          }
          .earn-mobile-bar button:disabled { opacity: 0.55; }
          .earn { padding-bottom: 76px; }
        }

        @media (max-width: 380px) {
          .earn-h1 { font-size: 1.9rem; }
          .earn-stat-num { font-size: 1.4rem; }
          .earn-math-row { flex-wrap: wrap; }
        }
      `}</style>

      <div className="earn">

        {justJoined && (
          <div className="earn-joined">
            <div className="earn-joined-h">✓ You&apos;re in. Welcome to the Partner Programme.</div>
            <div className="earn-joined-sub">Check your email — your dashboard link and WhatsApp templates are on their way.</div>
          </div>
        )}

        {/* ── HERO ── */}
        <section className="earn-hero">
          <div className="earn-hero-glow" />
          <span className="earn-eyebrow">Partner Programme</span>
          <h1 className="earn-h1">
            You answer questions<br />
            for free every day.<br />
            <em>Here&apos;s how to get paid for it.</em>
          </h1>
          <p className="earn-hero-sub">
            One message. <strong>80% of every sale.</strong> For life.
          </p>
          <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>
            {ctaLabel}
          </button>
          <div className="earn-hero-trust">One-time · No monthly fees · 30-day guarantee</div>
          <div className="earn-hero-scroll">
            <div className="earn-hero-scroll-line" />
            scroll
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <div className="earn-stats">
          <div className="earn-stat">
            <div className="earn-stat-num">67</div>
            <div className="earn-stat-label">active partners</div>
          </div>
          <div className="earn-stat">
            <div className="earn-stat-num">£7.99</div>
            <div className="earn-stat-label">per sale, yours</div>
          </div>
          <div className="earn-stat">
            <div className="earn-stat-num">40+</div>
            <div className="earn-stat-label">guides live</div>
          </div>
        </div>

        {/* ── MECHANIC (lightbulb) ── */}
        <div className="earn-mechanic">
          <div className="earn-mechanic-inner">
            <div className="earn-mechanic-layout">
              <div className="earn-mechanic-copy">
                <span className="earn-section-tag">How it works</span>
                <h2>One message.<br />Copy. Paste. Done.</h2>
                <p>
                  You already know what your community is struggling with.
                  You already have the group. You already have the trust.<br /><br />
                  We give you the guide, the link, and the exact message to send.
                  Someone buys — you keep 80%. The guide delivers itself.
                </p>
              </div>
              <div className="earn-phone">
                <div className="earn-phone-header">
                  <div className="earn-phone-avatar" />
                  <div>
                    <div className="earn-phone-name">Community Group</div>
                    <div className="earn-phone-members">847 members</div>
                  </div>
                </div>
                <div className="earn-bubble">
                  Had a few people ask me about the UK visa process this week — I found this guide that covers every step. £9.99 and worth it 👇
                  <div style={{ marginTop: 6 }}>
                    <span className="earn-bubble-link">pdfseeds.com/guide/uk-visa</span>
                  </div>
                  <div className="earn-bubble-time">2:14 PM ✓✓</div>
                </div>
                <div className="earn-phone-result">
                  <div>
                    <div className="earn-phone-result-label">6 people bought</div>
                    <div style={{ fontSize: "0.65rem", color: "#9B8AF0", marginTop: 1 }}>from this one message</div>
                  </div>
                  <div className="earn-phone-result-earn">£47.94</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TESTIMONIALS ── */}
        <section className="earn-section">
          <div className="earn-wrap">
            <span className="earn-section-tag">What partners say</span>
            <div className="earn-testimonials-grid">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="earn-tcard">
                  <div className="earn-tcard-quote">&ldquo;</div>
                  <p className="earn-tcard-text">{t.quote}</p>
                  <div className="earn-tcard-byline">
                    <div className="earn-tcard-name">{t.name}</div>
                    <div className="earn-tcard-role">{t.role}</div>
                    <div className="earn-tcard-stat">{t.stat}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="earn-section-cta">
              <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
            </div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* ── EARNINGS MATH ── */}
        <div className="earn-math-band">
          <div className="earn-math-inner">
            <span className="earn-math-tag">The numbers</span>
            <h2 className="earn-math-headline">
              Guide price £9.99 · your 80% · <strong style={{ color: "#FDE68A" }}>£7.99 per sale</strong>
            </h2>
            <div className="earn-math-rows">
              <div className="earn-math-row">
                <span className="earn-math-row-icon">💬</span>
                <span className="earn-math-row-text">One WhatsApp message · 10 people buy</span>
                <span className="earn-math-row-earn">£79.90</span>
              </div>
              <div className="earn-math-row">
                <span className="earn-math-row-icon">📌</span>
                <span className="earn-math-row-text">Pinned in 3 groups · 10 buyers each</span>
                <span className="earn-math-row-earn">£239.70</span>
              </div>
              <div className="earn-math-row">
                <span className="earn-math-row-icon">📧</span>
                <span className="earn-math-row-text">Newsletter mention · 50 buyers over a month</span>
                <span className="earn-math-row-earn">£399.50</span>
              </div>
            </div>
            <div className="earn-math-note">
              Conservative numbers. In a community that trusts you, 10 buyers is a quiet week — and a good guide gets forwarded.
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section className="earn-section">
          <div className="earn-wrap">
            <span className="earn-section-tag">Three steps</span>
            <div className="earn-steps">
              <div className="earn-step">
                <div className="earn-step-num">01</div>
                <div className="earn-step-title">Pick your guides</div>
                <div className="earn-step-body">Browse 40+ guides built for your community — visa, tax, housing, business. There&apos;s a guide for almost every question they ask you.</div>
              </div>
              <div className="earn-step">
                <div className="earn-step-num">02</div>
                <div className="earn-step-title">Drop your link</div>
                <div className="earn-step-body">You get a unique link for each guide. WhatsApp group, newsletter, Facebook — wherever you already show up. Copy the template. Paste. Send.</div>
              </div>
              <div className="earn-step">
                <div className="earn-step-num">03</div>
                <div className="earn-step-title">Get paid</div>
                <div className="earn-step-body">Someone buys — you keep 80%. The guide delivers automatically. No support, no chasing, no refunds on your end. Ever.</div>
              </div>
            </div>
            <div className="earn-section-cta">
              <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
              <div className="earn-hero-trust" style={{ color: "#B0A89A", marginTop: 14 }}>One-time payment · No monthly fees</div>
            </div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* ── VIDEO TESTIMONIALS ── */}
        <section className="earn-section">
          <div className="earn-wrap">
            <span className="earn-section-tag">Hear from partners</span>
            <div className="earn-videos-grid">
              {[
                { name: "Adaeze O.", role: "WhatsApp Group Admin" },
                { name: "Mohammed A.", role: "Community Organiser" },
                { name: "Fatima R.", role: "Community Coordinator" },
              ].map((v, i) => (
                <div key={i} className="earn-video">
                  <div className="earn-video-soon">Coming soon</div>
                  <div className="earn-video-btn">▶</div>
                  <div className="earn-video-name">{v.name}</div>
                  <div className="earn-video-role">{v.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* ── WHAT YOU GET ── */}
        <section className="earn-section">
          <div className="earn-wrap">
            <span className="earn-section-tag">What&apos;s included</span>
            <h2 className="earn-section-h2">Everything for £19.99 — once.</h2>
            <div className="earn-benefits">
              {[
                { icon: "💷", title: "80% commission on every sale — for life", desc: "Paid automatically every month. Nothing to chase, nothing to invoice." },
                { icon: "🔗", title: "Unique partner link for every guide", desc: "Share any guide in the library. You earn on all of them with one link per guide." },
                { icon: "📱", title: "WhatsApp templates, ready to send", desc: "Copy, paste, send. Works in minutes of joining." },
                { icon: "📊", title: "Real-time earnings dashboard", desc: "See every sale, every penny, the moment it happens." },
                { icon: "📚", title: "Every new guide we add — at no extra cost", desc: "The library grows. Your earning potential grows with it." },
              ].map((b, i) => (
                <div key={i} className="earn-benefit">
                  <div className="earn-benefit-icon">{b.icon}</div>
                  <div>
                    <div className="earn-benefit-title">{b.title}</div>
                    <div className="earn-benefit-desc">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="earn-section-cta">
              <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
            </div>
          </div>
        </section>

        {/* ── LIVE DEMAND ── */}
        {liveSearches.length > 0 && (
          <>
            <hr className="earn-divider" />
            <section className="earn-section">
              <div className="earn-wrap">
                <span className="earn-section-tag">Live on pdfseeds.com</span>
                <div className="earn-demand">
                  <div className="earn-demand-top">
                    <div className="earn-demand-title">What your community is searching for right now</div>
                    <div className="earn-demand-live"><div className="earn-demand-dot" /> Live</div>
                  </div>
                  {liveSearches.map((q, i) => (
                    <div key={i} className="earn-demand-row">
                      <div className="earn-demand-q">&ldquo;{q}&rdquo;</div>
                      <div className="earn-demand-sig">demand ↗</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── PRICE BLOCK ── */}
        <div className="earn-pricing">
          <div className="earn-pricing-inner">
            <div className="earn-price-card">
              <span className="earn-price-tag">Partner Programme Access</span>
              <div className="earn-price-num">£19.99</div>
              <div className="earn-price-sub">One-time. No subscriptions.</div>
              <div className="earn-price-recover">3 sales covers the £19.99. Every sale after that is yours.</div>
              <div className="earn-price-benefits">
                {[
                  "80% commission on every sale — for life",
                  "Partner link for every guide in the library",
                  "WhatsApp templates ready to send today",
                  "Real-time dashboard — every sale, every penny",
                  "Every new guide added, at no extra cost",
                  "30-day money-back guarantee, no questions",
                ].map((b, i) => (
                  <div key={i} className="earn-price-benefit">
                    <span className="earn-price-check">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <button className="earn-cta-white" onClick={handleGetAccess} disabled={loading}>
                {loading ? "Opening checkout…" : "Become a Partner →"}
              </button>
              <div className="earn-price-guarantee">
                80% commission — for life · 30-day money-back guarantee · No questions asked
              </div>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <section className="earn-section">
          <div className="earn-wrap">
            <span className="earn-section-tag">Questions</span>
            <h2 className="earn-section-h2">Common objections, answered.</h2>
            <div className="earn-faq">
              {FAQS.map((f, i) => (
                <div key={i} className="earn-faq-item">
                  <div className="earn-faq-q">{f.q}</div>
                  <p className="earn-faq-a">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* ── LEAD FORM ── */}
        <section className="earn-section">
          <div className="earn-wrap">
            <div className="earn-form-card">
              <h2 className="earn-form-h2">Not ready yet? Stay in the loop.</h2>
              <p className="earn-form-sub">Leave your details and we&apos;ll send you the partner starter pack — including the exact WhatsApp message that made 23 sales in a week.</p>
              {formStatus === "done" ? (
                <div style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 14, padding: "24px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#15803D", marginBottom: 4 }}>✓ You&apos;re on the list.</div>
                  <div style={{ fontSize: "0.82rem", color: "#16A34A" }}>Check your inbox — the starter pack is on its way.</div>
                </div>
              ) : (
                <form onSubmit={handleForm}>
                  <div className="earn-form-row">
                    <div className="earn-field">
                      <label className="earn-label">First name</label>
                      <input className="earn-input" type="text" required placeholder="Adaeze" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                    </div>
                    <div className="earn-field">
                      <label className="earn-label">Last name</label>
                      <input className="earn-input" type="text" required placeholder="Okafor" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="earn-form-full">
                    <div className="earn-field">
                      <label className="earn-label">Email address</label>
                      <input className="earn-input" type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                  </div>
                  <div className="earn-form-full">
                    <div className="earn-field">
                      <label className="earn-label">WhatsApp number <span style={{ color: "#B0A89A", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                      <input className="earn-input" type="tel" placeholder="+44 7700 000000" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
                    </div>
                  </div>
                  <button type="submit" className="earn-form-btn" disabled={formStatus === "sending"}>
                    {formStatus === "sending" ? "Sending…" : "Send me the starter pack →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <div className="earn-contact">
          <a href="mailto:hello@pdfseeds.com">✉ Questions? Email hello@pdfseeds.com</a>
        </div>

        {/* ── FINAL CTA ── */}
        <div className="earn-final">
          <h2 className="earn-final-h2">
            Your community already trusts you.<br />
            The only thing missing is getting paid for it.
          </h2>
          <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>
            {loading ? "Opening checkout…" : "Join as a Partner — £19.99 →"}
          </button>
          <div style={{ fontSize: "0.72rem", color: "#B0A89A", marginTop: 16 }}>One-time payment · 30-day money-back guarantee</div>
        </div>

        {/* ── PARTNER RECOVERY ── */}
        <div style={{ textAlign: "center", paddingBottom: 48 }}>
          {!recovery ? (
            <button onClick={() => setRecovery(true)} style={{ background: "none", border: "none", color: "#C4BAB0", fontSize: "0.78rem", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#E8E4DE" }}>
              Already a partner? Resend my dashboard link →
            </button>
          ) : (
            <div style={{ background: "#FFFFFF", border: "1.5px solid #EAE6E0", borderRadius: 16, padding: "28px 32px", maxWidth: 480, margin: "0 auto 0" }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F0A1A", marginBottom: 6 }}>Resend my dashboard link</div>
              <div style={{ fontSize: "0.78rem", color: "#B0A89A", marginBottom: 20 }}>Enter the email you used when you joined.</div>
              {recoveryStatus === "done" ? (
                <div style={{ fontSize: "0.85rem", color: "#15803D", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "14px 18px" }}>✓ Check your inbox — your dashboard link is on its way.</div>
              ) : recoveryStatus === "notfound" ? (
                <div>
                  <div style={{ fontSize: "0.85rem", color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", marginBottom: 12 }}>No account found. Try the email you used when you paid.</div>
                  <button onClick={() => setRecoveryStatus("idle")} style={{ background: "none", border: "none", color: "#7C3AED", fontSize: "0.82rem", cursor: "pointer", fontWeight: 700 }}>Try a different email →</button>
                </div>
              ) : (
                <form onSubmit={handleRecovery}>
                  <div style={{ background: "#FAF9F7", border: "1.5px solid #EAE6E0", borderRadius: 12, padding: "5px 5px 5px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="email" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} placeholder="Your email address" required autoFocus style={{ flex: 1, border: "none", outline: "none", fontSize: "0.9rem", color: "#0F0A1A", background: "transparent", padding: "10px 0", fontFamily: "inherit" }} />
                    <button type="submit" disabled={recoveryStatus === "sending"} style={{ background: "linear-gradient(135deg,#7C3AED,#5B21B6)", color: "#fff", fontWeight: 700, fontSize: "0.82rem", padding: "10px 18px", border: "none", borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap", opacity: recoveryStatus === "sending" ? 0.65 : 1, fontFamily: "inherit" }}>
                      {recoveryStatus === "sending" ? "Sending…" : "Send link →"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <footer className="earn-footer">
          © {new Date().getFullYear()} PDF Seeds &nbsp;·&nbsp;
          <a href="/">Find a guide</a> &nbsp;·&nbsp;
          <a href="/privacy">Privacy</a> &nbsp;·&nbsp;
          <a href="mailto:hello@pdfseeds.com">Contact</a>
        </footer>

      </div>

      {/* ── FIXED MOBILE CTA BAR ── */}
      <div className="earn-mobile-bar">
        <button onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
      </div>
    </>
  );
}
