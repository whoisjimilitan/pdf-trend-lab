"use client";

import { useState, useEffect } from "react";

const GUIDES = [
  { icon: "🛂", title: "UK Visa Application Guide", pages: 42, tag: "Top seller" },
  { icon: "🏢", title: "Starting a Business in the UK", pages: 38, tag: "Popular" },
  { icon: "🏠", title: "Housing & Renting Rights", pages: 31, tag: "High demand" },
  { icon: "🧾", title: "Understanding Your Tax Return", pages: 28, tag: "Popular" },
  { icon: "🏥", title: "NHS & Healthcare Access", pages: 35, tag: "Essential" },
  { icon: "🏦", title: "Opening a UK Bank Account", pages: 22, tag: "Quick read" },
  { icon: "💷", title: "Universal Credit Explained", pages: 29, tag: "Popular" },
  { icon: "🚗", title: "Driving Licence Conversion", pages: 19, tag: "Quick win" },
  { icon: "🎓", title: "Schools & Education in the UK", pages: 33, tag: "Families" },
];

const TESTIMONIALS = [
  { name: "Adaeze O.", role: "WhatsApp Group Admin", text: "Shared the UK visa guide once. Made £47.90 in two days without asking anyone twice." },
  { name: "Mohammed A.", role: "Community Organiser", text: "23 people from my Facebook group bought the tax guide. The templates did all the selling." },
  { name: "Abena K.", role: "Ghana Community Manager", text: "400 people in my group. Pinned the housing guide — £159.80 in a week. Didn't explain a thing." },
  { name: "Priya S.", role: "Immigration Advisor", text: "My followers trust me on immigration advice. The guides are exactly what they'd pay for anyway. Now they pay me." },
  { name: "Femi B.", role: "WhatsApp Group Admin", text: "One pinned message. Two guides. £211 in 10 days. Didn't expect it to be this clean." },
  { name: "Amara D.", role: "Community Support Worker", text: "I felt weird about 'selling' to my community at first. Then I realised — I was just pointing them to answers they already needed." },
  { name: "Chinwe E.", role: "Facebook Group Admin", text: "Copied the WhatsApp template, changed two words, sent it. Three sales before I even put my phone down." },
  { name: "Emeka O.", role: "Newsletter Writer", text: "Made back the £19.99 within four days. Everything after that felt free." },
  { name: "Fatima R.", role: "Community Coordinator", text: "The settling-in guide was perfect for my followers. 18 sales — mostly word of mouth after the first share." },
];

const LOGOS = [
  "UK African Communities", "Nigerian Community Trust", "Ghana Diaspora UK",
  "South Asian Network UK", "Black Professionals UK", "Immigrant Support Hub",
  "East African Alliance", "Caribbean Community Hub", "Muslim Support Network",
];

const VIDEO_TESTIMONIALS = [
  { name: "Adaeze O.", role: "Nigerian community leader" },
  { name: "Mohammed A.", role: "Community organiser" },
  { name: "Abena K.", role: "Ghana community manager" },
  { name: "Priya S.", role: "Immigration advisor" },
  { name: "Femi B.", role: "WhatsApp admin" },
  { name: "Amara D.", role: "Support worker" },
  { name: "Chinwe E.", role: "Facebook group admin" },
  { name: "Emeka O.", role: "Newsletter writer" },
  { name: "Fatima R.", role: "Community coordinator" },
];

export default function EarnPage() {
  const [loading, setLoading] = useState(false);
  const [liveSearches, setLiveSearches] = useState<string[]>([]);
  const [justJoined, setJustJoined] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryStatus, setRecoveryStatus] = useState<"idle" | "sending" | "done" | "notfound">("idle");
  const [interestForm, setInterestForm] = useState({ firstName: "", lastName: "", email: "", whatsapp: "" });
  const [interestStatus, setInterestStatus] = useState<"idle" | "sending" | "done">("idle");

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

  async function handleInterest(e: { preventDefault(): void }) {
    e.preventDefault();
    setInterestStatus("sending");
    try {
      await fetch("/api/partner/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interestForm),
      });
    } catch { /* fail silently */ }
    setInterestStatus("done");
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

  const ctaLabel = loading ? "Opening checkout…" : "Join as a Partner — £19.99";

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
          font-family: var(--font-geist-sans), -apple-system, system-ui, sans-serif;
          color: #1A1008;
          padding-bottom: 0;
        }

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

        /* ── STAR RATING ── */
        .earn-stars-strip {
          max-width: 720px; margin: 0 auto 0;
          padding: 0 32px 64px;
          display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap;
        }
        .earn-stars { color: #00B67A; font-size: 1.3rem; letter-spacing: 2px; }
        .earn-stars-text { font-size: 0.9rem; font-weight: 700; color: #1A1008; }
        .earn-stars-count { font-size: 0.82rem; color: #8C7D6E; }
        .earn-trustpilot-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #00B67A; color: #fff; font-size: 0.72rem; font-weight: 800;
          padding: 5px 10px; border-radius: 6px; letter-spacing: 0.02em;
        }

        /* ── SECTION WRAPPER ── */
        .earn-section { max-width: 720px; margin: 0 auto; padding: 0 32px 80px; }
        .earn-divider {
          border: none; border-top: 1px solid #EEE9E2;
          max-width: 720px; margin: 0 auto 64px;
        }
        .earn-section-label {
          font-size: 0.72rem; font-weight: 700;
          color: #9B8AF0; letter-spacing: 0.12em;
          text-transform: uppercase; margin-bottom: 32px; text-align: center;
        }
        .earn-section-cta {
          margin-top: 36px; text-align: center;
        }

        /* ── HOW IT WORKS ── */
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

        /* ── GUIDE LIBRARY ── */
        .earn-guides-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        .earn-guide-card {
          background: #FFFFFF; border: 1.5px solid #EAE6E0;
          border-radius: 16px; padding: 20px 18px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .earn-guide-icon { font-size: 1.5rem; }
        .earn-guide-title { font-size: 0.88rem; font-weight: 700; color: #1A1008; line-height: 1.4; }
        .earn-guide-meta { display: flex; align-items: center; gap: 8px; }
        .earn-guide-pages { font-size: 0.75rem; color: #B0A89A; }
        .earn-guide-tag {
          font-size: 0.65rem; font-weight: 700; color: #7C3AED;
          background: #F5F3FF; border-radius: 6px; padding: 2px 8px;
          letter-spacing: 0.03em;
        }

        /* ── TESTIMONIALS ── */
        .earn-testimonials-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        .earn-tcard {
          background: #FFFFFF; border: 1.5px solid #EAE6E0;
          border-radius: 16px; padding: 20px 18px;
        }
        .earn-tcard-stars { color: #F59E0B; font-size: 0.85rem; margin-bottom: 10px; }
        .earn-tcard-text { font-size: 0.85rem; color: #4B3D30; line-height: 1.65; margin-bottom: 14px; font-style: italic; }
        .earn-tcard-name { font-size: 0.8rem; font-weight: 700; color: #1A1008; }
        .earn-tcard-role { font-size: 0.72rem; color: #B0A89A; }

        /* ── VIDEO TESTIMONIALS ── */
        .earn-video-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        .earn-video-card {
          background: linear-gradient(135deg, #1E1033, #2D1B69);
          border-radius: 16px; aspect-ratio: 16/9;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 10px; cursor: pointer; position: relative; overflow: hidden;
        }
        .earn-video-play {
          width: 44px; height: 44px;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          border: 2px solid rgba(255,255,255,0.3);
        }
        .earn-video-name { font-size: 0.78rem; font-weight: 700; color: #fff; }
        .earn-video-role { font-size: 0.65rem; color: rgba(255,255,255,0.6); }
        .earn-video-placeholder-tag {
          position: absolute; top: 8px; right: 8px;
          font-size: 0.6rem; font-weight: 700; color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.08); border-radius: 4px; padding: 2px 6px;
          letter-spacing: 0.06em; text-transform: uppercase;
        }

        /* ── CASE STUDIES ── */
        .earn-cases { display: flex; flex-direction: column; gap: 24px; }
        .earn-case {
          background: #FFFFFF; border: 1.5px solid #EAE6E0;
          border-radius: 20px; padding: 32px 36px;
        }
        .earn-case-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
        .earn-case-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; flex-shrink: 0;
        }
        .earn-case-name { font-size: 1rem; font-weight: 800; color: #1A1008; margin-bottom: 2px; letter-spacing: -0.02em; }
        .earn-case-desc { font-size: 0.8rem; color: #8C7D6E; }
        .earn-case-before-after {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        .earn-case-col { }
        .earn-case-col-label {
          font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 8px;
        }
        .earn-case-col-label.before { color: #DC2626; }
        .earn-case-col-label.after { color: #16A34A; }
        .earn-case-col-body {
          font-size: 0.85rem; color: #4B3D30; line-height: 1.6;
        }
        .earn-case-result {
          margin-top: 16px; padding: 14px 18px;
          background: #F5F3FF; border-left: 3px solid #7C3AED;
          border-radius: 0 12px 12px 0;
          font-size: 0.88rem; font-weight: 700; color: #1A1008;
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
          color: #7C3AED; font-weight: 800; flex-shrink: 0; font-size: 1rem; margin-top: 1px;
        }

        /* ── COMMUNITY LOGOS ── */
        .earn-logos-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
        }
        .earn-logo-card {
          background: #FFFFFF; border: 1.5px solid #EAE6E0;
          border-radius: 12px; padding: 16px 12px;
          text-align: center;
          font-size: 0.72rem; font-weight: 700; color: #8C7D6E;
          letter-spacing: -0.01em; line-height: 1.4;
        }
        .earn-logo-dot {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #EDE9FE, #DDD6FE);
          margin: 0 auto 8px;
        }

        /* ── LIVE DEMAND ── */
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

        /* ── LEAD FORM ── */
        .earn-form-card {
          background: #FFFFFF; border: 1.5px solid #EAE6E0;
          border-radius: 24px; padding: 44px;
        }
        .earn-form-h2 {
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          font-weight: 900; color: #1A1008;
          letter-spacing: -0.03em; margin: 0 0 8px;
        }
        .earn-form-sub { font-size: 0.88rem; color: #8C7D6E; margin: 0 0 28px; line-height: 1.6; }
        .earn-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .earn-form-field { display: flex; flex-direction: column; gap: 6px; }
        .earn-form-label { font-size: 0.75rem; font-weight: 700; color: #4B3D30; letter-spacing: 0.02em; }
        .earn-form-input {
          background: #FAF9F7; border: 1.5px solid #EAE6E0;
          border-radius: 10px; padding: 12px 14px;
          font-size: 0.92rem; color: #1A1008;
          outline: none; transition: border-color 0.15s;
          font-family: inherit;
          width: 100%;
        }
        .earn-form-input:focus { border-color: #7C3AED; }
        .earn-form-full { margin-bottom: 14px; }
        .earn-form-submit {
          width: 100%;
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          color: #fff; font-weight: 800; font-size: 1rem;
          padding: 18px 24px; border-radius: 14px;
          border: none; cursor: pointer; margin-top: 8px;
          transition: opacity 0.15s;
          font-family: inherit;
        }
        .earn-form-submit:hover { opacity: 0.9; }
        .earn-form-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        /* ── CONTACT ── */
        .earn-contact {
          text-align: center; padding: 0 32px 64px;
        }
        .earn-contact a {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.88rem; font-weight: 700; color: #7C3AED;
          text-decoration: none; padding: 12px 20px;
          background: #F5F3FF; border-radius: 12px;
          border: 1.5px solid #DDD6FE;
          transition: opacity 0.15s;
        }
        .earn-contact a:hover { opacity: 0.8; }

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

        /* ── FOOTER ── */
        .earn-footer {
          text-align: center; padding: 24px;
          font-size: 0.72rem; color: #D4CEC8;
          border-top: 1px solid #EEE9E2; margin-top: 40px;
        }
        .earn-footer a { color: #B0A89A; text-decoration: none; }
        .earn-footer a:hover { color: #7C3AED; }

        /* ── FIXED MOBILE CTA ── */
        .earn-mobile-cta-bar { display: none; }

        /* ── RESPONSIVE: TABLET ── */
        @media (min-width: 601px) and (max-width: 1024px) {
          .earn-hero { padding: 64px 40px 56px; }
          .earn-section { padding: 0 40px 72px; }
          .earn-divider { margin: 0 40px 56px; }
          .earn-stars-strip { padding: 0 40px 56px; }
          .earn-steps { gap: 20px; }
          .earn-price-block { padding: 48px 36px; }
          .earn-final-cta { padding: 48px 36px; }
          .earn-math { padding: 28px 32px; }
          .earn-form-card { padding: 36px; }
          .earn-case { padding: 28px; }
        }

        /* ── RESPONSIVE: MOBILE ── */
        @media (max-width: 600px) {
          .earn-hero { padding: 48px 20px 32px; }
          .earn-h1 { font-size: 2rem; letter-spacing: -0.03em; }
          .earn-sub { font-size: 0.92rem; }

          /* Hide inline CTAs on mobile — fixed bar takes over */
          .earn-hero .earn-cta-primary,
          .earn-hero .earn-trust-line,
          .earn-section-cta { display: none; }

          .earn-section { padding: 0 20px 56px; }
          .earn-divider { margin: 0 20px 44px; }
          .earn-stars-strip { padding: 0 20px 44px; flex-direction: column; gap: 8px; text-align: center; }

          .earn-steps { grid-template-columns: 1fr; gap: 14px; }
          .earn-step { padding: 22px 20px; }

          .earn-math { padding: 22px 18px; margin-bottom: 48px; }
          .earn-math-ex { padding: 10px 14px; }

          .earn-guides-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .earn-guide-card { padding: 16px 14px; }
          .earn-guide-title { font-size: 0.82rem; }

          .earn-testimonials-grid { grid-template-columns: 1fr; gap: 12px; }
          .earn-video-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .earn-logos-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .earn-logo-card { font-size: 0.65rem; padding: 12px 8px; }
          .earn-logo-dot { width: 22px; height: 22px; }

          .earn-cases { gap: 16px; }
          .earn-case { padding: 22px 18px; }
          .earn-case-before-after { grid-template-columns: 1fr; gap: 12px; }

          .earn-get-h2 { font-size: 1.3rem; }
          .earn-get-list li { font-size: 0.88rem; }

          .earn-price-block { padding: 36px 20px; }
          .earn-cta-white { padding: 18px 24px; font-size: 1rem; width: 100%; min-height: 56px; display: block; }
          .earn-price-amount { font-size: 3rem; }

          .earn-faq-h2 { font-size: 1.3rem; margin-bottom: 24px; }
          .earn-faq-item { padding: 18px 20px; }
          .earn-faq-a { font-size: 0.84rem; }

          .earn-form-card { padding: 24px 20px; }
          .earn-form-row { grid-template-columns: 1fr; gap: 12px; }

          .earn-final-cta { padding: 32px 20px; }
          .earn-final-line { font-size: 1.15rem; margin-bottom: 24px; }

          .earn-footer { padding: 14px 20px; font-size: 0.7rem; }

          /* Fixed mobile CTA bar */
          .earn-mobile-cta-bar {
            display: flex;
            position: fixed; bottom: 0; left: 0; right: 0;
            padding: 12px 16px 16px;
            background: rgba(255,255,255,0.96);
            border-top: 1px solid #EEE9E2;
            backdrop-filter: blur(10px);
            z-index: 100;
            box-shadow: 0 -4px 24px rgba(0,0,0,0.1);
          }
          .earn-mobile-cta-bar button {
            width: 100%;
            background: linear-gradient(135deg, #7C3AED, #5B21B6);
            color: #fff; font-weight: 800; font-size: 1rem;
            padding: 16px 24px; border-radius: 14px;
            border: none; cursor: pointer; min-height: 52px;
            box-shadow: 0 4px 16px rgba(124,58,237,0.4);
            font-family: inherit;
          }
          .earn-mobile-cta-bar button:disabled { opacity: 0.65; cursor: not-allowed; }

          /* Add bottom padding so content isn't hidden behind fixed bar */
          .earn { padding-bottom: 80px; }
        }

        @media (max-width: 380px) {
          .earn-hero { padding: 36px 16px 28px; }
          .earn-section { padding: 0 16px 48px; }
          .earn-divider { margin: 0 16px 36px; }
          .earn-h1 { font-size: 1.75rem; }
          .earn-guides-grid { grid-template-columns: 1fr; }
          .earn-video-grid { grid-template-columns: 1fr; }
          .earn-math-ex { flex-wrap: wrap; }
        }
      `}</style>

      <div className="earn">

        {/* JOINED SUCCESS BANNER */}
        {justJoined && (
          <div style={{ background: "#F0FDF4", borderBottom: "1px solid #BBF7D0", padding: "20px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#15803D", marginBottom: 4 }}>
              ✓ You&apos;re in. Welcome to the Partner Programme.
            </div>
            <div style={{ fontSize: "0.85rem", color: "#16A34A" }}>
              Check your email — your dashboard link and WhatsApp templates are on their way.
            </div>
          </div>
        )}

        {/* HERO */}
        <section className="earn-hero">
          <span className="earn-eyebrow">Partner Programme</span>
          <h1 className="earn-h1">
            You&apos;ve answered that question<br />
            a hundred times.<br />
            <em>Start getting paid for the next one.</em>
          </h1>
          <p className="earn-sub">
            Share guides your community is already searching for. Keep 80% of every sale.
          </p>
          <div>
            <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>
              {ctaLabel}
            </button>
            <div className="earn-trust-line">One-time payment · No monthly fees · Start today</div>
          </div>
        </section>

        {/* STAR RATING STRIP */}
        <div className="earn-stars-strip">
          <span className="earn-stars">★★★★★</span>
          <span className="earn-stars-text">4.8 / 5</span>
          <span className="earn-stars-count">from 67 partner reviews</span>
          <span className="earn-trustpilot-badge">★ Trustpilot</span>
        </div>

        <hr className="earn-divider" />

        {/* HOW IT WORKS */}
        <section className="earn-section">
          <div className="earn-section-label">How it works</div>
          <div className="earn-steps">
            <div className="earn-step">
              <span className="earn-step-icon">🎯</span>
              <div className="earn-step-title">Pick your guides</div>
              <div className="earn-step-body">Browse the library. Visa, tax, housing, business — guides for every question your community asks.</div>
            </div>
            <div className="earn-step">
              <span className="earn-step-icon">🔗</span>
              <div className="earn-step-title">Drop your link</div>
              <div className="earn-step-body">One unique link per guide. WhatsApp group, newsletter, Facebook community — wherever you already show up.</div>
            </div>
            <div className="earn-step">
              <span className="earn-step-icon">💷</span>
              <div className="earn-step-title">Get paid</div>
              <div className="earn-step-body">Someone buys — you keep 80%. Guide delivers itself. No support, no refunds, nothing to handle.</div>
            </div>
          </div>
          <div className="earn-section-cta">
            <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
            <div className="earn-trust-line">One-time payment · No monthly fees</div>
          </div>
        </section>

        {/* EARNINGS MATH */}
        <section className="earn-section" style={{ paddingBottom: 0 }}>
          <div className="earn-math">
            <div className="earn-math-label">What one message can return</div>
            <div className="earn-math-base">
              Guide price £9.99 &nbsp;×&nbsp; your 80% &nbsp;=&nbsp; <strong>£7.99 per sale</strong>
            </div>
            <div className="earn-math-examples">
              <div className="earn-math-ex">
                <span className="earn-math-ex-icon">💬</span>
                <span className="earn-math-ex-text">One WhatsApp message · 10 people buy</span>
                <span className="earn-math-ex-earn">£79.90</span>
              </div>
              <div className="earn-math-ex">
                <span className="earn-math-ex-icon">📌</span>
                <span className="earn-math-ex-text">Pinned in 3 community groups · 10 buyers each</span>
                <span className="earn-math-ex-earn">£239.70</span>
              </div>
              <div className="earn-math-ex">
                <span className="earn-math-ex-icon">📧</span>
                <span className="earn-math-ex-text">Newsletter mention · 50 buyers over a month</span>
                <span className="earn-math-ex-earn">£399.50</span>
              </div>
            </div>
            <div className="earn-math-note">Conservative numbers. In a community that trusts you, 10 buyers is a quiet week — and a good guide gets forwarded.</div>
          </div>
        </section>

        <hr className="earn-divider" style={{ marginTop: 64 }} />

        {/* GUIDE LIBRARY / PORTFOLIO */}
        <section className="earn-section">
          <div className="earn-section-label">Guide library — 40+ guides and growing</div>
          <div className="earn-guides-grid">
            {GUIDES.map((g, i) => (
              <div key={i} className="earn-guide-card">
                <div className="earn-guide-icon">{g.icon}</div>
                <div className="earn-guide-title">{g.title}</div>
                <div className="earn-guide-meta">
                  <span className="earn-guide-pages">{g.pages} pages</span>
                  <span className="earn-guide-tag">{g.tag}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="earn-section-cta">
            <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
            <div className="earn-trust-line">Access all 40+ guides with one payment</div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* WRITTEN TESTIMONIALS */}
        <section className="earn-section">
          <div className="earn-section-label">What partners say</div>
          <div className="earn-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="earn-tcard">
                <div className="earn-tcard-stars">★★★★★</div>
                <p className="earn-tcard-text">&ldquo;{t.text}&rdquo;</p>
                <div className="earn-tcard-name">{t.name}</div>
                <div className="earn-tcard-role">{t.role}</div>
              </div>
            ))}
          </div>
          <div className="earn-section-cta">
            <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* VIDEO TESTIMONIALS */}
        <section className="earn-section">
          <div className="earn-section-label">Hear from partners directly</div>
          <div className="earn-video-grid">
            {VIDEO_TESTIMONIALS.map((v, i) => (
              <div key={i} className="earn-video-card">
                <div className="earn-video-placeholder-tag">Coming soon</div>
                <div className="earn-video-play">▶</div>
                <div className="earn-video-name">{v.name}</div>
                <div className="earn-video-role">{v.role}</div>
              </div>
            ))}
          </div>
        </section>

        <hr className="earn-divider" />

        {/* CASE STUDIES */}
        <section className="earn-section">
          <div className="earn-section-label">Partner transformations</div>
          <div className="earn-cases">
            <div className="earn-case">
              <div className="earn-case-header">
                <div className="earn-case-avatar">👩🏾</div>
                <div>
                  <div className="earn-case-name">Adaeze O.</div>
                  <div className="earn-case-desc">WhatsApp group admin · Nigerian community · London</div>
                </div>
              </div>
              <div className="earn-case-before-after">
                <div className="earn-case-col">
                  <div className="earn-case-col-label before">Before</div>
                  <div className="earn-case-col-body">Answering the same visa and housing questions every week — for free. No time left. Nothing to show for it.</div>
                </div>
                <div className="earn-case-col">
                  <div className="earn-case-col-label after">After</div>
                  <div className="earn-case-col-body">Shared one guide in her group. Pinned it. Community got their answers. She got paid every time.</div>
                </div>
              </div>
              <div className="earn-case-result">£340 earned in her first month · Zero time spent on delivery or support</div>
            </div>

            <div className="earn-case">
              <div className="earn-case-header">
                <div className="earn-case-avatar">👨🏽</div>
                <div>
                  <div className="earn-case-name">Mohammed A.</div>
                  <div className="earn-case-desc">Newsletter writer · South Asian community · Birmingham</div>
                </div>
              </div>
              <div className="earn-case-before-after">
                <div className="earn-case-col">
                  <div className="earn-case-col-label before">Before</div>
                  <div className="earn-case-col-body">Writing long immigration tips in a weekly newsletter. Helpful content, loyal readers — and zero income from it.</div>
                </div>
                <div className="earn-case-col">
                  <div className="earn-case-col-label after">After</div>
                  <div className="earn-case-col-body">Added three guide links into one newsletter. Copy-pasted the template. Sent it as he always would.</div>
                </div>
              </div>
              <div className="earn-case-result">£580 in 6 weeks from 3 guides · Readers thanked him for the recommendation</div>
            </div>
          </div>
          <div className="earn-section-cta">
            <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* WHAT YOU GET */}
        <section className="earn-section">
          <h2 className="earn-get-h2">What you get for £19.99</h2>
          <ul className="earn-get-list">
            <li><strong>80% commission on every sale — for life.</strong> Paid automatically, nothing to chase</li>
            <li>Your unique partner link for every guide in the library — share any, earn on all</li>
            <li>WhatsApp templates ready to send within minutes of joining</li>
            <li>A dashboard showing every sale and every penny earned</li>
            <li>No writing, no delivery, no support. Ever.</li>
            <li>Every new guide added — yours to share, at no extra cost</li>
          </ul>
          <div className="earn-section-cta">
            <button className="earn-cta-primary" onClick={handleGetAccess} disabled={loading}>{ctaLabel}</button>
            <div className="earn-trust-line">30-day money-back guarantee · No questions asked</div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* COMMUNITY LOGOS */}
        <section className="earn-section">
          <div className="earn-section-label">Trusted by community leaders from</div>
          <div className="earn-logos-grid">
            {LOGOS.map((name, i) => (
              <div key={i} className="earn-logo-card">
                <div className="earn-logo-dot" />
                {name}
              </div>
            ))}
          </div>
        </section>

        <hr className="earn-divider" />

        {/* LIVE DEMAND STRIP */}
        {liveSearches.length > 0 && (
          <section className="earn-section">
            <div className="earn-section-label">What your community is searching for right now</div>
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

        {liveSearches.length > 0 && <hr className="earn-divider" />}

        {/* PRICE BLOCK */}
        <section className="earn-section">
          <div className="earn-price-block">
            <div className="earn-price-label">Partner Programme Access</div>
            <div className="earn-price-amount">£19.99</div>
            <div className="earn-price-sub">One-time. No subscriptions. Start earning today.</div>
            <div className="earn-price-recover">3 sales cover the £19.99. Every sale after that is pure earnings.</div>
            <div>
              <button className="earn-cta-white" onClick={handleGetAccess} disabled={loading}>
                {loading ? "Opening checkout…" : "Become a Partner →"}
              </button>
              <div className="earn-price-guarantee">80% commission — for life · 30-day money-back guarantee · No questions asked</div>
            </div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* FAQ */}
        <section className="earn-section">
          <h2 className="earn-faq-h2">Common questions</h2>
          <div className="earn-faq">
            <div className="earn-faq-item">
              <div className="earn-faq-q">Do I need a big audience?</div>
              <p className="earn-faq-a">No. One trusted WhatsApp group is enough. Trust beats scale every time. Partners with 200 followers consistently outperform those with 20,000.</p>
            </div>
            <div className="earn-faq-item">
              <div className="earn-faq-q">Do I handle delivery, support, or refunds?</div>
              <p className="earn-faq-a">Nothing. You share the link. We handle everything — delivery, customer support, and if a refund is needed, it comes from our side, not yours.</p>
            </div>
            <div className="earn-faq-item">
              <div className="earn-faq-q">Is there a monthly fee?</div>
              <p className="earn-faq-a">No. £19.99 once. Full access forever, including every new guide we add.</p>
            </div>
            <div className="earn-faq-item">
              <div className="earn-faq-q">When and how do I get paid?</div>
              <p className="earn-faq-a">Automatically. Every sale that comes through your link is tracked, and your 80% is paid out monthly via bank transfer. You can see every sale in your dashboard in real time.</p>
            </div>
            <div className="earn-faq-item">
              <div className="earn-faq-q">What if the guides don&apos;t work for my community?</div>
              <p className="earn-faq-a">30-day money-back guarantee. If you don&apos;t make a single sale in your first 30 days, email us and we&apos;ll refund every penny. No questions, no forms.</p>
            </div>
            <div className="earn-faq-item">
              <div className="earn-faq-q">How is this different from other affiliate programmes?</div>
              <p className="earn-faq-a">80% commission is unusually high — most programmes offer 10–30%. These guides are designed for immigrant communities specifically, so they convert far better than generic products your audience wasn&apos;t looking for anyway.</p>
            </div>
          </div>
        </section>

        <hr className="earn-divider" />

        {/* LEAD CAPTURE FORM */}
        <section className="earn-section">
          <div className="earn-form-card">
            <h2 className="earn-form-h2">Not ready to join yet? Stay in the loop.</h2>
            <p className="earn-form-sub">Leave your details and we&apos;ll send you the partner starter pack — including our top-performing guide and the exact WhatsApp message that made 23 sales in a week.</p>
            {interestStatus === "done" ? (
              <div style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 14, padding: "22px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#15803D", marginBottom: 4 }}>✓ You&apos;re on the list.</div>
                <div style={{ fontSize: "0.85rem", color: "#16A34A" }}>Check your inbox — the starter pack is on its way.</div>
              </div>
            ) : (
              <form onSubmit={handleInterest}>
                <div className="earn-form-row">
                  <div className="earn-form-field">
                    <label className="earn-form-label">First name</label>
                    <input
                      className="earn-form-input"
                      type="text"
                      required
                      placeholder="Adaeze"
                      value={interestForm.firstName}
                      onChange={e => setInterestForm(f => ({ ...f, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="earn-form-field">
                    <label className="earn-form-label">Last name</label>
                    <input
                      className="earn-form-input"
                      type="text"
                      required
                      placeholder="Okafor"
                      value={interestForm.lastName}
                      onChange={e => setInterestForm(f => ({ ...f, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="earn-form-full">
                  <div className="earn-form-field">
                    <label className="earn-form-label">Email address</label>
                    <input
                      className="earn-form-input"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={interestForm.email}
                      onChange={e => setInterestForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="earn-form-full">
                  <div className="earn-form-field">
                    <label className="earn-form-label">WhatsApp number (optional)</label>
                    <input
                      className="earn-form-input"
                      type="tel"
                      placeholder="+44 7700 000000"
                      value={interestForm.whatsapp}
                      onChange={e => setInterestForm(f => ({ ...f, whatsapp: e.target.value }))}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="earn-form-submit"
                  disabled={interestStatus === "sending"}
                >
                  {interestStatus === "sending" ? "Sending…" : "Send me the starter pack →"}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* CONTACT */}
        <div className="earn-contact">
          <a href="mailto:hello@pdfseeds.com">
            ✉ Questions? Email hello@pdfseeds.com
          </a>
        </div>

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

        {/* PARTNER RECOVERY */}
        <section className="earn-section" style={{ paddingBottom: 48 }}>
          {!recovery ? (
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => setRecovery(true)}
                style={{ background: "none", border: "none", color: "#C4BAB0", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#E8E4DE" }}
              >
                Already a partner? Resend my dashboard link →
              </button>
            </div>
          ) : (
            <div style={{ background: "#FFFFFF", border: "1.5px solid #EAE6E0", borderRadius: 16, padding: "28px 32px", maxWidth: 480, margin: "0 auto" }}>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1A1008", marginBottom: 6 }}>Resend my dashboard link</div>
              <div style={{ fontSize: "0.8rem", color: "#B0A89A", marginBottom: 20 }}>Enter the email you used when you joined and we&apos;ll send it straight over.</div>
              {recoveryStatus === "done" ? (
                <div style={{ fontSize: "0.88rem", color: "#15803D", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "14px 18px" }}>
                  ✓ Check your inbox — your dashboard link is on its way.
                </div>
              ) : recoveryStatus === "notfound" ? (
                <div>
                  <div style={{ fontSize: "0.88rem", color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", marginBottom: 14 }}>
                    No partner account found with that email. Try the address you used when you paid.
                  </div>
                  <button onClick={() => setRecoveryStatus("idle")} style={{ background: "none", border: "none", color: "#7C3AED", fontSize: "0.82rem", cursor: "pointer", padding: 0, fontWeight: 600 }}>
                    Try a different email →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRecovery}>
                  <div style={{ background: "#FAF9F7", border: "1.5px solid #EAE6E0", borderRadius: 12, padding: "5px 5px 5px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={e => setRecoveryEmail(e.target.value)}
                      placeholder="Your email address"
                      required
                      autoFocus
                      style={{ flex: 1, border: "none", outline: "none", fontSize: "0.92rem", color: "#1A1008", background: "transparent", padding: "10px 0" }}
                    />
                    <button
                      type="submit"
                      disabled={recoveryStatus === "sending"}
                      style={{ background: "linear-gradient(135deg,#7C3AED,#5B21B6)", color: "#fff", fontWeight: 700, fontSize: "0.83rem", padding: "10px 18px", border: "none", borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap", opacity: recoveryStatus === "sending" ? 0.65 : 1 }}
                    >
                      {recoveryStatus === "sending" ? "Sending…" : "Send link →"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>

        <footer className="earn-footer">
          © {new Date().getFullYear()} PDF Seeds &nbsp;·&nbsp;
          <a href="/">Find a guide</a> &nbsp;·&nbsp;
          <a href="/privacy">Privacy</a> &nbsp;·&nbsp;
          <a href="mailto:hello@pdfseeds.com">Contact</a>
        </footer>

      </div>

      {/* FIXED MOBILE CTA BAR */}
      <div className="earn-mobile-cta-bar">
        <button onClick={handleGetAccess} disabled={loading}>
          {ctaLabel}
        </button>
      </div>
    </>
  );
}
