"use client";

import { useState, useEffect } from "react";
import { Search, ShieldCheck, PoundSterling, Banknote, Link2, MessageSquare, BarChart3, BookOpen, MessageCircle, Pin, Mail } from "lucide-react";

const AVATARS = [
  { initials: "AO", name: "Adaeze O.", role: "Nigerian WhatsApp Admin · London", stat: "£340 first month", how: "One pinned message" },
  { initials: "MA", name: "Mohammed A.", role: "Diaspora newsletter · 2.1k subs", stat: "£580 in 6 weeks", how: "One newsletter mention" },
  { initials: "FK", name: "Femi K.", role: "UK-Ghana Facebook Group", stat: "£211 in 10 days", how: "Three posts" },
  { initials: "PR", name: "Priya R.", role: "Diaspora community leader", stat: "£220 first month", how: "Word of mouth" },
];

const TESTIMONIALS = [
  {
    quote: "One pinned message. £47.90 in two days. The guide sold itself.",
    name: "Adaeze O.",
    role: "Nigerian WhatsApp Group Admin · London",
    stat: "£340 first month",
  },
  {
    quote: "Mentioned it once in my newsletter. 23 sales. Didn't have to explain a thing.",
    name: "Mohammed A.",
    role: "African diaspora newsletter · 2.1k subscribers",
    stat: "£580 in 6 weeks",
  },
  {
    quote: "18 sales — mostly word of mouth after the first share. Nothing to chase.",
    name: "Fatima R.",
    role: "Ghanaian community coordinator · Manchester",
    stat: "£143.82 earned",
  },
];

const FAQS = [
  {
    q: "Do I handle delivery, support, or refunds?",
    a: "Nothing. You share the link. We handle everything — delivery, customer support, and any refunds come entirely from our side. Your name stays clean.",
  },
  {
    q: "Do I need a big audience?",
    a: "No. 200 followers who trust you will outperform 20,000 who don't. If people come to you for answers, they'll buy from you.",
  },
  {
    q: "Is there a monthly fee?",
    a: "No. £19.99 once. Full access forever, including every new guide we add to the library.",
  },
];

export default function EarnPage() {
  const [loading, setLoading] = useState(false);
  const SEED_SEARCHES = [
    "How do I register a business in Ghana from the UK?",
    "Can I renew my Nigerian passport from Canada?",
    "How do I inherit land in Kenya as a non-resident?",
    "What documents do I need to buy property in Ghana from abroad?",
    "How do I register a CAC business in Nigeria from the US?",
  ];
  const [liveSearches] = useState<string[]>(SEED_SEARCHES);
  const [justJoined, setJustJoined] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryStatus, setRecoveryStatus] = useState<"idle" | "sending" | "done" | "notfound">("idle");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("joined") === "true") {
      setJustJoined(true);
      window.history.replaceState({}, "", "/earn");
    }
  }, []);

  async function handleGetAccess() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/farmer", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { setLoading(false); }
  }

  async function handleRecovery(e: { preventDefault(): void }) {
    e.preventDefault();
    setRecoveryStatus("sending");
    const res = await fetch("/api/affiliate/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: recoveryEmail.trim() }),
    });
    const data = await res.json() as { found: boolean };
    setRecoveryStatus(data.found ? "done" : "notfound");
  }

  const btnLabel = loading ? "Opening checkout…" : "Become a Curator — £19.99";

  return (
    <>
      <style>{`
        body > aside, body > nav { display: none !important; }
        body {
          display: block !important; overflow-y: auto !important;
          height: auto !important; background: #FAFAF9 !important;
          color-scheme: light !important;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .e {
          font-family: var(--font-geist-sans), -apple-system, system-ui, sans-serif;
          color: #0F0A1A; background: #FAFAF9;
        }

        /* ─── HERO OUTER (grid bg) ─── */
        .e-hero-outer {
          background-color: #FAFAF9;
          background-image:
            linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px);
          background-size: 72px 72px;
          position: relative; overflow: hidden;
        }

        /* ─── HERO INNER (split layout) ─── */
        .e-hero {
          max-width: 1160px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 360px;
          align-items: center; gap: 72px;
          padding: 108px 80px 96px;
          position: relative; z-index: 1;
        }
        .e-hero-copy { position: relative; z-index: 1; }

        /* ─── EARNINGS CARDS ─── */
        .e-cards { display: flex; flex-direction: column; gap: 12px; }
        .e-card {
          background: #fff; border: 1px solid #EEE9E0; border-radius: 16px;
          padding: 16px 20px; display: flex; align-items: center; gap: 14px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .e-card:hover { box-shadow: 0 8px 28px rgba(139,92,246,0.1); transform: translateY(-1px); }
        .e-card-av {
          width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #8B5CF6, #6D28D9);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem; font-weight: 800; color: #fff;
          border: 2.5px solid #F5F3FF;
          box-shadow: 0 4px 12px rgba(139,92,246,0.2);
        }
        .e-card-meta { font-size: 0.68rem; color: #9B8AF0; font-weight: 600; margin-bottom: 3px; }
        .e-card-earn { font-size: 1.08rem; font-weight: 900; color: #0F0A1A; letter-spacing: -0.03em; margin-bottom: 2px; }
        .e-card-how { font-size: 0.62rem; color: #C4BAB0; }

        /* ─── AVATAR PILLS (testimonials section) ─── */
        .e-av {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #8B5CF6, #6D28D9);
          border: 2px solid #fff;
          box-shadow: 0 3px 12px rgba(139,92,246,0.22);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem; font-weight: 800; color: #fff;
        }
        .e-av-info { line-height: 1.35; }
        .e-av-name { font-size: 0.68rem; font-weight: 700; color: #0F0A1A; }
        .e-av-role { font-size: 0.58rem; color: #9B8AF0; }
        .e-av-stat { font-size: 0.63rem; font-weight: 800; color: #6D28D9; }
        .e-av-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
        .e-av-pill {
          display: flex; align-items: center; gap: 10px;
          background: #fff; border: 1px solid #EEE9E0;
          border-radius: 50px; padding: 7px 14px 7px 7px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        /* ─── TRUST BLOCK ─── */
        .e-trust-outer {
          background: #fff; border-top: 1px solid #EEE9E0; border-bottom: 1px solid #EEE9E0;
          padding: 24px 40px;
        }
        .e-trust-block {
          max-width: 1160px; margin: 0 auto;
          display: flex; align-items: flex-start; gap: 0;
        }
        .e-trust-step {
          display: flex; align-items: flex-start; gap: 12px; flex: 1; padding: 0 24px;
        }
        .e-trust-step:first-child { padding-left: 0; }
        .e-trust-step:last-child { padding-right: 0; }
        .e-trust-icon {
          width: 36px; height: 36px; border-radius: 9px;
          background: #F5F0EB; border: 1px solid #EEE9E0;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .e-trust-label { font-size: 0.83rem; font-weight: 800; color: #0F0A1A; margin-bottom: 2px; }
        .e-trust-desc { font-size: 0.72rem; color: #6B5E52; line-height: 1.55; }
        .e-trust-arrow { align-self: center; color: #DDD6FE; font-size: 1.4rem; flex-shrink: 0; }

        /* ─── HERO COPY ─── */
        .e-chip {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.2);
          border-radius: 999px; padding: 7px 16px;
          font-size: 0.67rem; font-weight: 800; color: #7C3AED;
          letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 26px;
        }
        .e-h1 {
          font-size: clamp(2.2rem, 4vw, 3.4rem);
          font-weight: 900; color: #0F0A1A;
          line-height: 1.08; letter-spacing: -0.04em; margin-bottom: 22px;
        }
        .e-h1 em {
          font-style: normal; color: #8B5CF6;
          text-decoration: underline;
          text-decoration-color: #DDD6FE;
          text-underline-offset: 5px;
        }
        .e-hero-sub {
          font-size: 1.05rem; color: #6B5E52;
          line-height: 1.7; margin-bottom: 36px; max-width: 460px;
        }
        .e-hero-sub strong { color: #0F0A1A; font-weight: 700; }
        .e-btn {
          background: linear-gradient(135deg, #8B5CF6, #6D28D9);
          color: #fff; font-weight: 800; font-size: 0.98rem;
          padding: 18px 38px; border-radius: 14px;
          border: none; cursor: pointer; font-family: inherit;
          box-shadow: 0 6px 22px rgba(109,40,217,0.3);
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: -0.01em; margin-bottom: 16px; display: inline-block;
        }
        .e-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .e-btn:active { transform: scale(0.99); }
        .e-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .e-trust { font-size: 0.68rem; color: #B0A89A; letter-spacing: 0.04em; }

        /* ─── PHONE MOCKUP ─── */
        .e-phone-wrap { margin-top: 52px; width: 100%; max-width: 300px; }
        .e-phone {
          background: #E8DDD4; border-radius: 28px; padding: 18px 15px;
          box-shadow: 0 32px 80px rgba(15,10,26,0.11), 0 0 0 1px rgba(0,0,0,0.04);
          max-width: 300px; margin: 0 auto;
        }
        .e-phone-bar {
          display: flex; align-items: center; gap: 9px;
          padding-bottom: 11px; margin-bottom: 12px;
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        .e-phone-av {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #8B5CF6, #6D28D9);
        }
        .e-phone-gname { font-size: 0.74rem; font-weight: 700; color: #111; }
        .e-phone-gmem { font-size: 0.57rem; color: #667781; }
        .e-bubble {
          background: #D4F5C0; border-radius: 13px 13px 3px 13px;
          padding: 10px 12px; margin-left: auto; max-width: 90%;
          font-size: 0.77rem; color: #111; line-height: 1.52; margin-bottom: 4px;
        }
        .e-bubble-link { color: #128C7E; text-decoration: underline; font-size: 0.72rem; }
        .e-bubble-ts { font-size: 0.57rem; color: #667781; text-align: right; margin-top: 5px; }
        .e-result {
          margin-top: 11px; background: #fff; border-radius: 11px;
          padding: 12px 14px;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .e-result-label { font-size: 0.66rem; color: #667781; font-weight: 500; }
        .e-result-sub { font-size: 0.55rem; color: #9B8AF0; margin-top: 1px; }
        .e-result-earn { font-size: 1rem; font-weight: 900; color: #16A34A; }

        /* ─── PROOF STRIP ─── */
        .e-proof {
          background: #fff;
          border-top: 1px solid #EEE9E0; border-bottom: 1px solid #EEE9E0;
          padding: 18px 40px;
          display: flex; align-items: center; justify-content: center;
          gap: 28px; flex-wrap: wrap;
        }
        .e-proof-item { display: flex; align-items: center; gap: 8px; }
        .e-proof-stars { color: #00B67A; font-size: 0.92rem; letter-spacing: 1px; }
        .e-proof-val { font-size: 0.84rem; font-weight: 800; color: #0F0A1A; }
        .e-proof-lbl { font-size: 0.73rem; color: #9B8AF0; }
        .e-proof-sep { width: 1px; height: 18px; background: #EEE9E0; }
        .e-proof-badge {
          background: #00B67A; color: #fff;
          font-size: 0.58rem; font-weight: 800;
          padding: 3px 7px; border-radius: 4px; letter-spacing: 0.03em;
        }

        /* ─── SECTION SHELL ─── */
        .e-wrap { max-width: 800px; margin: 0 auto; padding: 0 32px; }
        .e-section { padding: 80px 0; }
        .e-tag {
          font-size: 0.62rem; font-weight: 800; color: #8B5CF6;
          letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 12px; display: flex; align-items: center; gap: 7px;
        }
        .e-tag::before {
          content: ''; width: 14px; height: 2px;
          background: #8B5CF6; border-radius: 2px; flex-shrink: 0;
        }
        .e-h2 {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 900; color: #0F0A1A;
          letter-spacing: -0.04em; line-height: 1.12; margin-bottom: 40px;
        }
        .e-divider { border: none; border-top: 1px solid #EEE9E0; }
        .e-section-cta { margin-top: 40px; text-align: center; }

        /* ─── TESTIMONIALS ─── */
        .e-tgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .e-tcard {
          background: #fff; border: 1px solid #EEE9E0;
          border-radius: 18px; padding: 26px 22px;
          display: flex; flex-direction: column; gap: 14px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s;
        }
        .e-tcard:hover { box-shadow: 0 8px 28px rgba(139,92,246,0.1); }
        .e-tcard-q { font-size: 1.8rem; color: #E0D9FF; font-family: Georgia, serif; line-height: 1; }
        .e-tcard-text { font-size: 0.88rem; color: #1A1008; line-height: 1.7; flex: 1; font-weight: 500; }
        .e-tcard-name { font-size: 0.79rem; font-weight: 800; color: #0F0A1A; }
        .e-tcard-role { font-size: 0.67rem; color: #9B8AF0; margin-top: 2px; }
        .e-tcard-stat {
          display: inline-block; margin-top: 8px;
          background: #F5F3FF; border: 1px solid #E0D9FF;
          border-radius: 7px; padding: 5px 11px;
          font-size: 0.77rem; font-weight: 800; color: #6D28D9;
        }

        /* ─── MATH ─── */
        .e-math { background: #F5F3FF; border-radius: 20px; padding: 36px 40px; }
        .e-math-head {
          font-size: 0.88rem; color: #6B5E52; margin-bottom: 20px; line-height: 1.6;
        }
        .e-math-head strong { color: #0F0A1A; font-weight: 800; }
        .e-math-rows { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
        .e-math-row {
          display: flex; align-items: center; gap: 12px;
          background: #fff; border: 1px solid #E0D9FF;
          border-radius: 12px; padding: 13px 17px;
        }
        .e-math-icon { width: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .e-math-lbl { flex: 1; font-size: 0.84rem; color: #6B5E52; }
        .e-math-earn { font-size: 0.98rem; font-weight: 900; color: #6D28D9; }
        .e-math-note { font-size: 0.72rem; color: #A78BFA; line-height: 1.65; }

        /* ─── WHAT YOU GET ─── */
        .e-get { display: flex; flex-direction: column; gap: 12px; }
        .e-get-item {
          display: flex; align-items: flex-start; gap: 14px;
          background: #fff; border: 1px solid #EEE9E0;
          border-radius: 13px; padding: 19px 21px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.03);
        }
        .e-get-icon {
          width: 34px; height: 34px; border-radius: 9px;
          background: #F5F0EB; border: 1px solid #EEE9E0;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .e-get-title { font-size: 0.88rem; font-weight: 800; color: #0F0A1A; margin-bottom: 2px; }
        .e-get-desc { font-size: 0.79rem; color: #6B5E52; line-height: 1.65; }

        /* ─── LIVE DEMAND ─── */
        .e-demand {
          background: #fff; border: 1px solid #EEE9E0;
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .e-demand-top {
          padding: 13px 20px; border-bottom: 1px solid #EEE9E0;
          display: flex; align-items: center; justify-content: space-between;
        }
        .e-demand-title { font-size: 0.78rem; font-weight: 700; color: #0F0A1A; }
        .e-demand-live {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.6rem; font-weight: 700; color: #15803D;
          background: #F0FDF4; border: 1px solid #BBF7D0;
          border-radius: 999px; padding: 3px 9px;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .e-demand-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #16A34A;
          animation: dp 1.8s ease-in-out infinite;
        }
        @keyframes dp { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .e-demand-row {
          padding: 11px 20px; display: flex; align-items: center;
          gap: 10px; border-bottom: 1px solid #F5F0EB;
        }
        .e-demand-row:last-child { border-bottom: none; }
        .e-demand-q { flex: 1; font-size: 0.82rem; color: #1A1008; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .e-demand-sig { font-size: 0.66rem; color: #9B8AF0; font-weight: 600; }

        /* ─── PRICE BLOCK ─── */
        .e-price-bg { background: #1E1B4B; padding: 88px 0; }
        .e-price-card {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(196,181,253,0.18);
          border-radius: 26px; padding: 56px 48px; text-align: center;
          max-width: 580px; margin: 0 auto;
        }
        .e-price-eyebrow {
          font-size: 0.62rem; font-weight: 800; color: #A78BFA;
          letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 12px; display: block;
        }
        .e-price-num {
          font-size: clamp(3.5rem, 8vw, 5rem);
          font-weight: 900; color: #fff;
          letter-spacing: -0.06em; line-height: 1; margin-bottom: 5px;
        }
        .e-price-sub { font-size: 0.82rem; color: rgba(255,255,255,0.35); margin-bottom: 5px; }
        .e-price-recover { font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.6); margin-bottom: 36px; }
        .e-price-list { display: flex; flex-direction: column; gap: 12px; text-align: left; margin-bottom: 40px; }
        .e-price-item {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 0.86rem; color: rgba(255,255,255,0.7); line-height: 1.5;
        }
        .e-price-check { color: #A78BFA; flex-shrink: 0; }
        .e-btn-white {
          display: inline-block; background: #fff; color: #5B21B6;
          font-weight: 800; font-size: 1rem;
          padding: 19px 52px; border-radius: 14px;
          border: none; cursor: pointer; font-family: inherit;
          box-shadow: 0 8px 28px rgba(0,0,0,0.2);
          transition: opacity 0.15s, transform 0.1s; margin-bottom: 14px;
        }
        .e-btn-white:hover { opacity: 0.93; transform: translateY(-1px); }
        .e-btn-white:active { transform: scale(0.99); }
        .e-btn-white:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .e-price-guarantee { font-size: 0.68rem; color: rgba(167,139,250,0.6); line-height: 1.8; }

        /* ─── FAQ ─── */
        .e-faqs { display: flex; flex-direction: column; gap: 10px; }
        .e-faq {
          background: #fff; border: 1px solid #EEE9E0;
          border-radius: 13px; padding: 21px 24px;
          box-shadow: 0 1px 5px rgba(0,0,0,0.03);
        }
        .e-faq-q { font-size: 0.92rem; font-weight: 700; color: #0F0A1A; margin-bottom: 8px; }
        .e-faq-a { font-size: 0.83rem; color: #6B5E52; line-height: 1.78; }

        /* ─── FINAL CTA ─── */
        .e-final-outer {
          background-color: #FAFAF9;
          background-image:
            linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px);
          background-size: 72px 72px;
          border-top: 1px solid #EEE9E0;
        }
        .e-final { text-align: center; padding: 96px 32px 88px; max-width: 580px; margin: 0 auto; }
        .e-final-h {
          font-size: clamp(1.3rem, 3vw, 1.8rem);
          font-weight: 900; color: #0F0A1A;
          letter-spacing: -0.035em; line-height: 1.25; margin-bottom: 32px;
        }
        .e-final-meta {
          display: flex; align-items: center; justify-content: center;
          flex-wrap: wrap; gap: 8px; margin-top: 20px;
        }
        .e-final-link {
          font-size: 0.74rem; color: #B0A89A; text-decoration: none; transition: color 0.15s;
        }
        .e-final-link:hover { color: #8B5CF6; }
        .e-final-sep { font-size: 0.74rem; color: #DDD6FE; }
        .e-final-link-btn {
          background: none; border: none; color: #B0A89A; font-size: 0.74rem;
          cursor: pointer; padding: 0; font-family: inherit; transition: color 0.15s;
        }
        .e-final-link-btn:hover { color: #8B5CF6; }
        .e-footer {
          text-align: center; padding: 20px;
          font-size: 0.68rem; color: #1A1008;
          border-top: 1px solid #E2DDD8;
        }
        .e-footer a { color: #1A1008; text-decoration: none; font-weight: 600; }
        .e-footer a:hover { color: #8B5CF6; }

        /* ─── JOINED BANNER ─── */
        .e-joined {
          background: #F0FDF4; border-bottom: 1px solid #BBF7D0;
          padding: 18px 32px; text-align: center;
        }

        /* ─── MOBILE BAR ─── */
        .e-mobile { display: none; }

        /* ─── RESPONSIVE: TABLET ─── */
        @media (min-width: 601px) and (max-width: 1100px) {
          .e-hero {
            grid-template-columns: 1fr; padding: 80px 40px 64px;
            text-align: center; gap: 40px;
          }
          .e-hero-sub { margin: 0 auto 36px; }
          .e-cards { display: none; }
          .e-wrap { padding: 0 40px; }
          .e-trust-outer { padding: 20px 40px; }
          .e-trust-step { padding: 0 16px; }
        }

        /* ─── RESPONSIVE: MOBILE ─── */
        @media (max-width: 600px) {
          .e-hero {
            grid-template-columns: 1fr; padding: 56px 20px 44px;
            text-align: center; gap: 0;
          }
          .e-cards { display: none; }
          .e-h1 { font-size: 2rem; }
          .e-hero-sub { font-size: 0.92rem; }

          /* Hide inline CTAs — fixed bar takes over */
          .e-btn:not(.e-btn-white),
          .e-trust,
          .e-section-cta { display: none; }

          .e-proof { padding: 14px 20px; gap: 14px; }
          .e-proof-sep { display: none; }

          .e-wrap { padding: 0 20px; }
          .e-section { padding: 56px 0; }

          .e-tgrid { grid-template-columns: 1fr; gap: 12px; }
          .e-math { padding: 24px 20px; }

          .e-price-bg { padding: 56px 0; }
          .e-price-card { padding: 36px 22px; }
          .e-btn-white { width: 100%; display: block; padding: 17px; }
          .e-price-num { font-size: 3.5rem; }

          .e-final { padding: 64px 20px 56px; }

          .e-trust-outer { padding: 20px 20px; }
          .e-trust-block { flex-direction: column; gap: 16px; }
          .e-trust-step { padding: 0; }
          .e-trust-arrow { display: none; }

          .e-chip { font-size: 0.6rem; letter-spacing: 0.06em; padding: 6px 12px; }
          .e-av-row { display: none; }
          .e-final { padding: 64px 20px 72px; }

          /* Fixed mobile CTA bar */
          .e-mobile {
            display: flex;
            position: fixed; bottom: 0; left: 0; right: 0;
            padding: 12px 16px env(safe-area-inset-bottom, 6px);
            background: rgba(255,255,255,0.97);
            border-top: 1px solid #EEE9E0;
            backdrop-filter: blur(16px); z-index: 100;
          }
          .e-mobile button {
            width: 100%;
            background: linear-gradient(135deg, #8B5CF6, #6D28D9);
            color: #fff; font-weight: 800; font-size: 0.95rem;
            padding: 15px; border-radius: 13px;
            border: none; cursor: pointer; min-height: 50px;
            box-shadow: 0 4px 18px rgba(109,40,217,0.45);
            font-family: inherit;
          }
          .e-mobile button:disabled { opacity: 0.5; }
          .e { padding-bottom: 74px; }
        }

        @media (max-width: 380px) {
          .e-h1 { font-size: 1.8rem; }
          .e-math-row { flex-wrap: wrap; }
        }
      `}</style>

      <div className="e">

        {justJoined && (
          <div className="e-joined">
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#15803D", marginBottom: 3 }}>
              ✓ You&apos;re in. Welcome to the Curator Programme.
            </div>
            <div style={{ fontSize: "0.78rem", color: "#16A34A" }}>
              Check your email — your dashboard link and WhatsApp templates are on their way.
            </div>
          </div>
        )}

        {/* ── HERO ── */}
        <div className="e-hero-outer">
          <div className="e-hero">

            {/* Copy */}
            <div className="e-hero-copy">
              <div className="e-chip">For the people diaspora communities already turn to for answers</div>
              <h1 className="e-h1">
                Your community keeps asking about home.<br />
                Now you always have the answer.<br />
                <em>And earn 80% every time you share it.</em>
              </h1>
              <p className="e-hero-sub">
                You&apos;re already the go-to. <strong>Earn 80% every time you are.</strong>
              </p>
              <button className="e-btn" onClick={handleGetAccess} disabled={loading}>
                {loading ? "Opening checkout…" : "Become a Curator →"}
              </button>
              <div className="e-trust">£19.99 one-time · No monthly fees · 30-day money-back guarantee</div>
            </div>

            {/* Earnings cards */}
            <div className="e-cards">
              {AVATARS.map((a, i) => (
                <div key={i} className="e-card">
                  <div className="e-card-av">{a.initials}</div>
                  <div>
                    <div className="e-card-meta">{a.name} · {a.role}</div>
                    <div className="e-card-earn">{a.stat}</div>
                    <div className="e-card-how">{a.how}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── TRUST BLOCK ── */}
        <div className="e-trust-outer">
          <div className="e-trust-block">
            <div className="e-trust-step">
              <div className="e-trust-icon"><Search size={16} strokeWidth={1.75} color="#0F0A1A" /></div>
              <div>
                <div className="e-trust-label">Read it first</div>
                <div className="e-trust-desc">You see it first. Always.</div>
              </div>
            </div>
            <div className="e-trust-arrow">→</div>
            <div className="e-trust-step">
              <div className="e-trust-icon"><ShieldCheck size={16} strokeWidth={1.75} color="#0F0A1A" /></div>
              <div>
                <div className="e-trust-label">Only share what you&apos;d stand behind</div>
                <div className="e-trust-desc">Your reputation stays yours — you&apos;re the filter</div>
              </div>
            </div>
            <div className="e-trust-arrow">→</div>
            <div className="e-trust-step">
              <div className="e-trust-icon"><PoundSterling size={16} strokeWidth={1.75} color="#0F0A1A" /></div>
              <div>
                <div className="e-trust-label">Earn 80% — forever</div>
                <div className="e-trust-desc">Every time someone buys through your link</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PROOF STRIP ── */}
        <div className="e-proof">
          <div className="e-proof-item">
            <span className="e-proof-stars">★★★★★</span>
            <span className="e-proof-val">4.8 / 5</span>
            <span className="e-proof-badge">Trustpilot</span>
          </div>
          <div className="e-proof-sep" />
          <div className="e-proof-item">
            <span className="e-proof-val">67</span>
            <span className="e-proof-lbl">curators earning</span>
          </div>
          <div className="e-proof-sep" />
          <div className="e-proof-item">
            <span className="e-proof-val">£7.99</span>
            <span className="e-proof-lbl">per recommendation</span>
          </div>
          <div className="e-proof-sep" />
          <div className="e-proof-item">
            <span className="e-proof-val">1000+</span>
            <span className="e-proof-lbl">guides live</span>
          </div>
        </div>

        {/* ── 3 TESTIMONIALS ── */}
        <section className="e-section">
          <div className="e-wrap">
            <div className="e-tag">What curators say</div>
            <div className="e-av-row">
              {AVATARS.map((a, i) => (
                <div key={i} className="e-av-pill">
                  <div className="e-av">{a.initials}</div>
                  <div className="e-av-info">
                    <div className="e-av-name">{a.name}</div>
                    <div className="e-av-role">{a.role}</div>
                    <div className="e-av-stat">{a.stat}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="e-tgrid">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="e-tcard">
                  <div className="e-tcard-q">&ldquo;</div>
                  <p className="e-tcard-text">{t.quote}</p>
                  <div>
                    <div className="e-tcard-name">{t.name}</div>
                    <div className="e-tcard-role">{t.role}</div>
                    <div className="e-tcard-stat">{t.stat}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="e-divider" />

        {/* ── EARNINGS MATH ── */}
        <section className="e-section">
          <div className="e-wrap">
            <div className="e-tag">The numbers</div>
            <h2 className="e-h2">What one post can return.</h2>
            <div className="e-math">
              <div className="e-math-head">
                Guide price <strong>£9.99</strong> × your <strong>80%</strong> = <strong>£7.99 per recommendation</strong>
              </div>
              <div className="e-math-rows">
                {[
                  { Icon: MessageCircle, text: "One WhatsApp message · 10 people buy", earn: "£79.90" },
                  { Icon: Pin, text: "Pinned post across 3 groups · 10 buyers each", earn: "£239.70" },
                  { Icon: Mail, text: "Newsletter mention · 50 buyers this month", earn: "£399.50" },
                ].map((r, i) => (
                  <div key={i} className="e-math-row">
                    <span className="e-math-icon"><r.Icon size={16} strokeWidth={1.75} color="#6B5E52" /></span>
                    <span className="e-math-lbl">{r.text}</span>
                    <span className="e-math-earn">{r.earn}</span>
                  </div>
                ))}
              </div>
              <div className="e-math-note">
                Conservative. In an audience that trusts you, 10 buyers is a quiet week — and a good guide gets forwarded.
              </div>
            </div>
          </div>
        </section>

        <hr className="e-divider" />

        {/* ── WHAT YOU GET ── */}
        <section className="e-section">
          <div className="e-wrap">
            <div className="e-tag">What&apos;s included</div>
            <h2 className="e-h2">Everything for £19.99 — once.</h2>
            <div className="e-get">
              {[
                { Icon: Banknote, title: "80% commission — for life", desc: "Paid automatically every month. Nothing to chase, nothing to invoice." },
                { Icon: Link2, title: "Your curator link for every guide in the library", desc: "Share any of the 1000+ guides across every niche. Each one has your unique link." },
                { Icon: MessageSquare, title: "Ready-made posts, captions and WhatsApp templates", desc: "Copy, paste, send. You're live within minutes of joining." },
                { Icon: BarChart3, title: "Real-time dashboard — every buyer, every penny", desc: "See exactly what's earning and what isn't. Live, not delayed." },
                { Icon: BookOpen, title: "Every new guide added — at no extra cost", desc: "The library keeps growing. Your earning potential grows with it." },
              ].map((b, i) => (
                <div key={i} className="e-get-item">
                  <div className="e-get-icon"><b.Icon size={16} strokeWidth={1.75} color="#0F0A1A" /></div>
                  <div>
                    <div className="e-get-title">{b.title}</div>
                    <div className="e-get-desc">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="e-section-cta">
              <button className="e-btn" onClick={handleGetAccess} disabled={loading}>{btnLabel}</button>
              <div style={{ fontSize: "0.68rem", color: "#B0A89A", marginTop: 14 }}>30-day money-back guarantee · No questions asked</div>
            </div>
          </div>
        </section>

        {/* ── LIVE DEMAND (conditional) ── */}
        {liveSearches.length > 0 && (
          <>
            <hr className="e-divider" />
            <section className="e-section">
              <div className="e-wrap">
                <div className="e-tag">Live on pdfseeds.com</div>
                <h2 className="e-h2">What your community is asking about home right now.</h2>
                <div className="e-demand">
                  <div className="e-demand-top">
                    <div className="e-demand-title">Real searches — real demand</div>
                    <div className="e-demand-live"><div className="e-demand-dot" /> Live</div>
                  </div>
                  {liveSearches.map((q, i) => (
                    <div key={i} className="e-demand-row">
                      <div className="e-demand-q">&ldquo;{q}&rdquo;</div>
                      <div className="e-demand-sig">guide exists ↗</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#B0A89A", marginTop: 12, textAlign: "right", fontStyle: "italic" }}>
                  Every search is someone in a diaspora community like yours — your link earns when they find the answer.
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── PRICE BLOCK ── */}
        <div className="e-price-bg">
          <div className="e-wrap">
            <div className="e-price-card">
              <span className="e-price-eyebrow">Curator Programme Access</span>
              <div className="e-price-num">£19.99</div>
              <div className="e-price-sub">One-time. No subscriptions. No monthly fees.</div>
              <div className="e-price-recover">3 recommendations cover the £19.99. Every one after that is yours.</div>
              <div className="e-price-list">
                {[
                  "80% commission — for life",
                  "Your curator link for every guide in the library",
                  "Ready-made captions, posts and WhatsApp templates",
                  "Real-time earnings dashboard",
                  "Every new guide added, at no extra cost",
                  "30-day money-back guarantee — no questions asked",
                ].map((b, i) => (
                  <div key={i} className="e-price-item">
                    <span className="e-price-check">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <button className="e-btn-white" onClick={handleGetAccess} disabled={loading}>
                {loading ? "Opening checkout…" : "Become a Curator →"}
              </button>
              <div className="e-price-guarantee">
                80% commission · For life · 30-day money-back guarantee · No questions asked
              </div>
            </div>
          </div>
        </div>

        {/* ── 3 FAQs ── */}
        <section className="e-section">
          <div className="e-wrap">
            <div className="e-tag">Questions</div>
            <h2 className="e-h2">The three things people ask before they join.</h2>
            <div className="e-faqs">
              {FAQS.map((f, i) => (
                <div key={i} className="e-faq">
                  <div className="e-faq-q">{f.q}</div>
                  <p className="e-faq-a">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <div className="e-final-outer">
          <div className="e-final">
            <h2 className="e-final-h">
              Your community keeps asking about home.<br />
              You could be earning every time they do.
            </h2>
            <button className="e-btn" onClick={handleGetAccess} disabled={loading}>
              {loading ? "Opening checkout…" : "Become a Curator — £19.99 →"}
            </button>
            <div style={{ fontSize: "0.68rem", color: "#B0A89A", marginTop: 14 }}>
              One-time payment · 30-day money-back guarantee
            </div>
            <div className="e-final-meta">
              <a href="mailto:hello@pdfseeds.com" className="e-final-link">Questions? hello@pdfseeds.com</a>
              {!recovery && (
                <>
                  <span className="e-final-sep">·</span>
                  <button className="e-final-link-btn" onClick={() => setRecovery(true)}>
                    Already a curator? Resend my link →
                  </button>
                </>
              )}
            </div>
            {recovery && (
              <div style={{ background: "#fff", border: "1.5px solid #EAE6E0", borderRadius: 14, padding: "20px 22px", maxWidth: 400, margin: "16px auto 0", textAlign: "left" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F0A1A", marginBottom: 5 }}>Resend my dashboard link</div>
                <div style={{ fontSize: "0.75rem", color: "#B0A89A", marginBottom: 18 }}>Enter the email you used when you joined.</div>
                {recoveryStatus === "done" ? (
                  <div style={{ fontSize: "0.82rem", color: "#15803D", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "13px 16px" }}>
                    ✓ Check your inbox — your dashboard link is on its way.
                  </div>
                ) : recoveryStatus === "notfound" ? (
                  <div>
                    <div style={{ fontSize: "0.82rem", color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "13px 16px", marginBottom: 10 }}>
                      No account found. Try the email you used when you paid.
                    </div>
                    <button onClick={() => setRecoveryStatus("idle")} style={{ background: "none", border: "none", color: "#8B5CF6", fontSize: "0.78rem", cursor: "pointer", fontWeight: 700 }}>
                      Try a different email →
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRecovery}>
                    <div style={{ background: "#FAF9F7", border: "1.5px solid #EAE6E0", borderRadius: 10, padding: "4px 4px 4px 14px", display: "flex", alignItems: "center", gap: 7 }}>
                      <input
                        type="email" value={recoveryEmail}
                        onChange={e => setRecoveryEmail(e.target.value)}
                        placeholder="Your email address" required autoFocus
                        style={{ flex: 1, border: "none", outline: "none", fontSize: "0.86rem", color: "#0F0A1A", background: "transparent", padding: "10px 0", fontFamily: "inherit" }}
                      />
                      <button
                        type="submit" disabled={recoveryStatus === "sending"}
                        style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", color: "#fff", fontWeight: 700, fontSize: "0.78rem", padding: "9px 15px", border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", opacity: recoveryStatus === "sending" ? 0.5 : 1, fontFamily: "inherit" }}
                      >
                        {recoveryStatus === "sending" ? "Sending…" : "Send link →"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="e-footer">
          © {new Date().getFullYear()} PDF Seeds &nbsp;·&nbsp;
          <a href="/">Find a guide</a> &nbsp;·&nbsp;
          <a href="/privacy">Privacy</a> &nbsp;·&nbsp;
          <a href="mailto:hello@pdfseeds.com">Contact</a>
        </footer>

      </div>

      {/* ── FIXED MOBILE CTA ── */}
      <div className="e-mobile">
        <button onClick={handleGetAccess} disabled={loading}>{btnLabel}</button>
      </div>
    </>
  );
}
