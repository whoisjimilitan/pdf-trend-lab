"use client";

import React, { useState, useEffect } from "react";
import { Banknote, Link2, MessageSquare, BarChart3, BookOpen, MessageCircle, PlayCircle, Music2 } from "lucide-react";

const AVATARS = [
  { initials: "AO", name: "Adaeze O.", role: "WhatsApp · London", stat: "£340 first month", platformColor: "#25D366" },
  { initials: "MA", name: "Mohammed A.", role: "YouTube · 28k subscribers", stat: "£580 in 6 weeks", platformColor: "#FF0000" },
  { initials: "FK", name: "Femi K.", role: "TikTok · UK-Ghana", stat: "£211 in 10 days", platformColor: "#2D2D2D" },
  { initials: "PR", name: "Priya R.", role: "Instagram · 14k followers", stat: "£220 first month", platformColor: "#E1306C" },
];

const TESTIMONIALS = [
  { quote: "One pinned message. £47.90 in two days. The guide sold itself.", name: "Adaeze O.", role: "WhatsApp Group Admin · London", stat: "£340 first month" },
  { quote: "Mentioned it in one video description. 23 sales that month. Passive.", name: "Mohammed A.", role: "YouTube · Diaspora UK · 28k subs", stat: "£580 in 6 weeks" },
  { quote: "18 sales — mostly word of mouth after the first share. Nothing to chase.", name: "Fatima R.", role: "Community coordinator · Manchester", stat: "£143.82 earned" },
];

const SEED_SEARCHES = [
  "How do I register a business in Ghana from the UK?",
  "Can I renew my Nigerian passport from Canada?",
  "How do I inherit land in Kenya as a non-resident?",
  "What documents do I need to buy property in Ghana from abroad?",
  "How do I register a CAC business in Nigeria from the US?",
];

const PLATFORMS = [
  { name: "WhatsApp",   color: "#25D366", bg: "#25D36614", border: "#25D36628" },
  { name: "YouTube",    color: "#FF0000", bg: "#FF000014", border: "#FF000028" },
  { name: "TikTok",     color: "#374151", bg: "#37415114", border: "#37415128" },
  { name: "Instagram",  color: "#E1306C", bg: "#E1306C14", border: "#E1306C28" },
  { name: "Newsletter", color: "#7C3AED", bg: "#7C3AED14", border: "#7C3AED28" },
];

export default function EarnPage() {
  const [loading, setLoading] = useState(false);
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
          height: auto !important; background: #fff !important;
          color-scheme: light !important;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .e {
          font-family: var(--font-geist-sans), -apple-system, system-ui, sans-serif;
          color: #0F0A1A; background: #fff;
        }

        /* ─── HERO ─── */
        .e-hero-outer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }
        .e-hero-left {
          background: #F0EAFF;
          display: flex; align-items: center; justify-content: center;
          padding: 80px 52px;
          position: relative; overflow: hidden;
        }
        .e-hero-left::before {
          content: '';
          position: absolute;
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%);
          top: 50%; left: 50%; transform: translate(-50%,-50%);
          pointer-events: none;
        }
        .e-hero-right {
          background: #fff;
          display: flex; flex-direction: column; justify-content: center;
          padding: 72px 68px 72px 56px;
        }

        /* ─── CHIP ─── */
        .e-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(124,58,237,0.07); border: 1px solid rgba(124,58,237,0.16);
          border-radius: 999px; padding: 5px 13px;
          font-size: 0.63rem; font-weight: 800; color: #7C3AED;
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 24px; width: fit-content;
        }

        /* ─── HEADLINE ─── */
        .e-h1 {
          font-size: clamp(2.6rem, 3.8vw, 4.4rem);
          font-weight: 900; color: #0F0A1A;
          line-height: 1.04; letter-spacing: -0.048em;
          margin-bottom: 18px;
        }
        .e-hero-sub {
          font-size: 0.97rem; color: #4B4358;
          line-height: 1.65; margin-bottom: 28px; max-width: 420px;
        }
        .e-hero-sub strong { color: #0F0A1A; font-weight: 700; }

        /* ─── 3-STEP MECHANISM ─── */
        .e-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          margin-bottom: 28px;
          position: relative;
        }
        .e-steps::before {
          content: '';
          position: absolute;
          top: 13px;
          left: 20px;
          right: 20px;
          height: 1px;
          background: rgba(124,58,237,0.15);
        }
        .e-step { position: relative; z-index: 1; padding-right: 10px; }
        .e-step-num {
          display: inline-flex; align-items: center; justify-content: center;
          width: 26px; height: 26px;
          border-radius: 7px;
          background: rgba(124,58,237,0.09);
          border: 1px solid rgba(124,58,237,0.2);
          font-size: 0.58rem; font-weight: 900; color: #7C3AED;
          letter-spacing: 0.04em;
          margin-bottom: 9px;
        }
        .e-step-title {
          font-size: 0.86rem; font-weight: 800; color: #0F0A1A;
          margin-bottom: 4px; letter-spacing: -0.01em;
        }
        .e-step-desc {
          font-size: 0.67rem; color: #6B5E52; line-height: 1.6;
        }
        .e-step-platforms {
          display: flex; flex-wrap: wrap; gap: 3px; margin-top: 6px;
        }
        .e-plat {
          font-size: 0.55rem; font-weight: 700;
          padding: 2px 7px; border-radius: 999px;
          border: 1px solid; white-space: nowrap;
        }

        /* ─── CTA BUTTON ─── */
        .e-btn {
          background: #7C3AED; color: #fff;
          font-weight: 800; font-size: 1rem;
          padding: 17px 36px; border-radius: 12px;
          border: none; cursor: pointer; font-family: inherit;
          box-shadow: 0 4px 20px rgba(124,58,237,0.3);
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          letter-spacing: -0.01em; margin-bottom: 14px;
          display: inline-block; width: 100%; max-width: 400px; text-align: center;
        }
        .e-btn:hover { background: #6D28D9; box-shadow: 0 8px 30px rgba(109,40,217,0.35); transform: translateY(-1px); }
        .e-btn:active { transform: scale(0.99); }
        .e-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .e-trust { font-size: 0.67rem; color: #9B8899; letter-spacing: 0.03em; }

        /* ─── PHONE WRAP ─── */
        .e-phone-wrap {
          display: flex; flex-direction: column; align-items: center;
          position: relative; z-index: 1;
        }

        /* ─── NOTIFICATION ─── */
        .e-notif {
          background: #fff; border-radius: 16px;
          padding: 10px 14px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 8px 36px rgba(0,0,0,0.13);
          margin-bottom: 14px; width: 244px;
          animation: notif-in 0.5s ease 0.4s both;
        }
        @keyframes notif-in {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .e-notif-icon {
          width: 34px; height: 34px; border-radius: 8px;
          background: #25D366;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; flex-shrink: 0;
        }
        .e-notif-app { font-size: 0.57rem; font-weight: 800; color: #9B8899; text-transform: uppercase; letter-spacing: 0.07em; }
        .e-notif-title { font-size: 0.71rem; font-weight: 800; color: #0F0A1A; margin-top: 1px; }
        .e-notif-amt { font-size: 0.8rem; font-weight: 900; color: #15803D; }
        .e-notif-sub { font-size: 0.57rem; color: #9B8899; margin-top: 1px; }

        /* ─── iPHONE 16 PRO MOCKUP ─── */
        .e-phone {
          width: 244px;
          background: linear-gradient(
            165deg,
            #6E6E72 0%,
            #4A4A4C 12%,
            #2A2A2C 35%,
            #1C1C1E 55%,
            #262628 75%,
            #323234 90%,
            #3E3E40 100%
          );
          border-radius: 54px;
          padding: 12px 9px 20px;
          position: relative;
          box-shadow:
            0 90px 140px rgba(0,0,0,0.6),
            0 45px 70px rgba(0,0,0,0.32),
            0 18px 32px rgba(0,0,0,0.18),
            0 6px 10px rgba(0,0,0,0.12),
            0 0 0 1px rgba(255,255,255,0.16),
            inset 0 2px 0 rgba(255,255,255,0.24),
            inset 0 -3px 0 rgba(0,0,0,0.65),
            inset 2px 0 0 rgba(255,255,255,0.07),
            inset -2px 0 0 rgba(255,255,255,0.03);
        }

        /* Left side: action button + vol up + vol down */
        .e-phone::before {
          content: '';
          position: absolute;
          left: -5px; top: 84px;
          width: 5px; height: 22px;
          background: linear-gradient(90deg, #505052, #3C3C3E);
          border-radius: 3px 0 0 3px;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.16),
            inset 0 -1px 0 rgba(0,0,0,0.45),
            0 40px 0 0 #3C3C3E,
            0 77px 0 0 #3C3C3E;
        }

        /* Right side: power button */
        .e-phone::after {
          content: '';
          position: absolute;
          right: -5px; top: 106px;
          width: 5px; height: 70px;
          background: linear-gradient(90deg, #3C3C3E, #505052);
          border-radius: 0 3px 3px 0;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.16),
            inset 0 -1px 0 rgba(0,0,0,0.45);
        }

        .e-phone-screen {
          background: #fff;
          border-radius: 44px;
          overflow: hidden;
          position: relative;
        }

        /* Glass reflection on screen */
        .e-phone-screen::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 70px;
          background: linear-gradient(
            175deg,
            rgba(255,255,255,0.09) 0%,
            rgba(255,255,255,0.03) 55%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 10;
          border-radius: 44px 44px 0 0;
        }

        /* Dynamic Island */
        .e-phone-di {
          width: 90px; height: 30px;
          background: #000;
          border-radius: 20px;
          margin: 10px auto 8px;
          position: relative; z-index: 2;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.04);
        }

        /* Home indicator */
        .e-phone-home {
          width: 108px; height: 4px;
          background: rgba(0,0,0,0.2);
          border-radius: 3px;
          margin: 8px auto 0;
        }

        /* Screen: header */
        .e-ps-head {
          background: #7C3AED;
          padding: 10px 18px 14px;
        }
        .e-ps-app {
          font-size: 0.57rem; font-weight: 700;
          color: rgba(255,255,255,0.65);
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .e-ps-title {
          font-size: 0.9rem; font-weight: 800; color: #fff; margin-top: 2px;
        }

        /* Screen: week */
        .e-ps-week {
          background: #F9F5FF;
          padding: 13px 18px 11px;
          border-bottom: 1px solid #EEE8F8;
        }
        .e-ps-week-lbl {
          font-size: 0.57rem; font-weight: 800; color: #9B8AF0;
          text-transform: uppercase; letter-spacing: 0.09em;
        }
        .e-ps-week-amt {
          font-size: 1.9rem; font-weight: 900; color: #15803D;
          letter-spacing: -0.045em; line-height: 1.1; margin-top: 3px;
        }
        .e-ps-week-meta {
          font-size: 0.57rem; color: #6B5E52; margin-top: 3px;
        }

        /* Screen: rows */
        .e-ps-rows { padding: 8px 18px 14px; }
        .e-ps-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 5px 0; border-bottom: 1px solid #F5F0EB;
          font-size: 0.67rem;
        }
        .e-ps-row:last-child { border-bottom: none; }
        .e-ps-row-day { color: #6B5E52; font-weight: 500; flex: 1; }
        .e-ps-row-sales { color: #A78BFA; font-weight: 600; font-size: 0.59rem; flex-shrink: 0; margin-right: 10px; }
        .e-ps-row-amt { font-weight: 800; color: #0F0A1A; }

        /* ─── PROOF STRIP ─── */
        .e-proof {
          background: #fff;
          border-top: 1px solid #EDE8E0; border-bottom: 1px solid #EDE8E0;
          padding: 20px 40px;
          display: flex; align-items: center; justify-content: center;
          gap: 28px; flex-wrap: wrap;
        }
        .e-proof-item { display: flex; align-items: center; gap: 8px; }
        .e-proof-stars { color: #00B67A; font-size: 0.92rem; letter-spacing: 1px; }
        .e-proof-val { font-size: 0.88rem; font-weight: 900; color: #0F0A1A; }
        .e-proof-lbl { font-size: 0.72rem; color: #9B8AF0; }
        .e-proof-sep { width: 1px; height: 20px; background: #EDE8E0; }
        .e-proof-badge {
          background: #00B67A; color: #fff;
          font-size: 0.58rem; font-weight: 800;
          padding: 3px 8px; border-radius: 4px; letter-spacing: 0.03em;
        }

        /* ─── SECTION SHELL ─── */
        .e-wrap { max-width: 800px; margin: 0 auto; padding: 0 32px; }
        .e-section { padding: 88px 0; }
        .e-tag {
          font-size: 0.62rem; font-weight: 800; color: #7C3AED;
          letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 12px; display: flex; align-items: center; gap: 7px;
        }
        .e-tag::before {
          content: ''; width: 14px; height: 2px;
          background: #7C3AED; border-radius: 2px; flex-shrink: 0;
        }
        .e-h2 {
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 900; color: #0F0A1A;
          letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 40px;
        }
        .e-divider { border: none; border-top: 1px solid #EDE8E0; }
        .e-section-cta { margin-top: 40px; text-align: center; }

        /* ─── MILESTONES ─── */
        .e-milestones { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 16px; }
        .e-ms {
          background: #fff; border: 1px solid #E0D9FF;
          border-radius: 14px; padding: 20px 14px; text-align: center;
        }
        .e-ms-hi {
          background: #F0FDF4; border-color: #86EFAC;
          box-shadow: 0 4px 24px rgba(22,163,74,0.1);
        }
        .e-ms-num { font-size: 0.66rem; font-weight: 800; color: #A78BFA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
        .e-ms-hi .e-ms-num { color: #15803D; }
        .e-ms-earn { font-size: 1.5rem; font-weight: 900; color: #6D28D9; letter-spacing: -0.04em; line-height: 1; margin-bottom: 6px; }
        .e-ms-hi .e-ms-earn { color: #15803D; }
        .e-ms-label { font-size: 0.7rem; color: #6B5E52; line-height: 1.45; }
        .e-ms-hi .e-ms-label { color: #15803D; font-weight: 700; }

        /* ─── MATH ─── */
        .e-math { background: #F5F0FF; border-radius: 20px; padding: 36px 40px; }
        .e-math-head { font-size: 0.88rem; color: #6B5E52; margin-bottom: 20px; line-height: 1.6; }
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

        /* ─── TESTIMONIALS ─── */
        .e-av-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
        .e-av-pill {
          display: flex; align-items: center; gap: 10px;
          background: #fff; border: 1px solid #EDE8E0;
          border-radius: 50px; padding: 7px 14px 7px 7px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .e-av {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #8B5CF6, #6D28D9);
          border: 2px solid #fff;
          box-shadow: 0 3px 12px rgba(139,92,246,0.22);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem; font-weight: 800; color: #fff;
        }
        .e-av-name { font-size: 0.68rem; font-weight: 700; color: #0F0A1A; }
        .e-av-role { font-size: 0.58rem; margin-top: 1px; }
        .e-av-stat { font-size: 0.63rem; font-weight: 800; color: #6D28D9; }
        .e-tgrid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
        .e-tcard {
          background: #fff; border: 1px solid #EDE8E0;
          border-radius: 18px; padding: 28px 24px;
          display: flex; flex-direction: column; gap: 14px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .e-tcard:hover { box-shadow: 0 10px 32px rgba(124,58,237,0.1); transform: translateY(-2px); }
        .e-tcard-q { font-size: 3rem; color: #C4B5FD; font-family: Georgia, serif; line-height: 1; }
        .e-tcard-text { font-size: 0.88rem; color: #1A1008; line-height: 1.72; flex: 1; font-weight: 500; }
        .e-tcard-name { font-size: 0.79rem; font-weight: 800; color: #0F0A1A; }
        .e-tcard-role { font-size: 0.67rem; color: #9B8AF0; margin-top: 2px; }
        .e-tcard-stat {
          display: inline-block; margin-top: 8px;
          background: #F5F3FF; border: 1px solid #E0D9FF;
          border-radius: 7px; padding: 5px 11px;
          font-size: 0.77rem; font-weight: 800; color: #6D28D9;
        }

        /* ─── WHAT YOU GET ─── */
        .e-get { display: flex; flex-direction: column; gap: 12px; }
        .e-get-item {
          display: flex; align-items: flex-start; gap: 16px;
          background: #fff; border: 1px solid #EDE8E0;
          border-radius: 14px; padding: 20px 22px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .e-get-item:hover { border-color: #C4B5FD; box-shadow: 0 4px 16px rgba(124,58,237,0.07); }
        .e-get-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: #F5F0FF; border: 1px solid #E0D9FF;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .e-get-title { font-size: 0.9rem; font-weight: 800; color: #0F0A1A; margin-bottom: 3px; }
        .e-get-desc { font-size: 0.79rem; color: #6B5E52; line-height: 1.65; }

        /* ─── LIVE DEMAND ─── */
        .e-demand {
          background: #fff; border: 1px solid #EDE8E0;
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
        }
        .e-demand-top {
          padding: 14px 20px; border-bottom: 1px solid #EDE8E0;
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
        .e-demand-dot { width: 5px; height: 5px; border-radius: 50%; background: #16A34A; animation: dp 1.8s ease-in-out infinite; }
        @keyframes dp { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .e-demand-row { padding: 12px 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #F5F0EB; }
        .e-demand-row:last-child { border-bottom: none; }
        .e-demand-q { flex: 1; font-size: 0.82rem; color: #1A1008; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .e-demand-sig { font-size: 0.66rem; color: #9B8AF0; font-weight: 600; }

        /* ─── FAQ ─── */
        .e-faqs { display: flex; flex-direction: column; gap: 10px; }
        .e-faq {
          background: #fff; border: 1px solid #EDE8E0;
          border-radius: 14px; padding: 22px 26px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        }
        .e-faq-q { font-size: 0.94rem; font-weight: 700; color: #0F0A1A; margin-bottom: 9px; }
        .e-faq-a { font-size: 0.83rem; color: #6B5E52; line-height: 1.8; }

        /* ─── PRICE BLOCK ─── */
        .e-price-bg { background: #1E1B4B; padding: 96px 0; }
        .e-price-card {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(196,181,253,0.18);
          border-radius: 28px; padding: 60px 52px; text-align: center;
          max-width: 580px; margin: 0 auto;
        }
        .e-price-eyebrow {
          font-size: 0.62rem; font-weight: 800; color: #A78BFA;
          letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 12px; display: block;
        }
        .e-price-num {
          font-size: clamp(3.5rem, 8vw, 5rem);
          font-weight: 900; color: #fff;
          letter-spacing: -0.06em; line-height: 1; margin-bottom: 6px;
        }
        .e-price-sub { font-size: 0.82rem; color: rgba(255,255,255,0.35); margin-bottom: 6px; }
        .e-price-recover { font-size: 0.84rem; font-weight: 600; color: rgba(255,255,255,0.6); margin-bottom: 38px; }
        .e-price-list { display: flex; flex-direction: column; gap: 12px; text-align: left; margin-bottom: 42px; }
        .e-price-item { display: flex; align-items: flex-start; gap: 10px; font-size: 0.86rem; color: rgba(255,255,255,0.7); line-height: 1.5; }
        .e-price-check { color: #A78BFA; flex-shrink: 0; }
        .e-btn-white {
          display: inline-block; background: #fff; color: #5B21B6;
          font-weight: 800; font-size: 1rem;
          padding: 19px 52px; border-radius: 12px;
          border: none; cursor: pointer; font-family: inherit;
          box-shadow: 0 8px 28px rgba(0,0,0,0.18);
          transition: opacity 0.15s, transform 0.1s; margin-bottom: 14px;
        }
        .e-btn-white:hover { opacity: 0.93; transform: translateY(-1px); }
        .e-btn-white:active { transform: scale(0.99); }
        .e-btn-white:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .e-price-guarantee { font-size: 0.68rem; color: rgba(167,139,250,0.6); line-height: 1.8; }

        /* ─── FINAL CTA ─── */
        .e-final-outer {
          background: #FAFAF9;
          background-image:
            linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px);
          background-size: 72px 72px;
          border-top: 1px solid #EDE8E0;
        }
        .e-final { text-align: center; padding: 100px 32px 88px; max-width: 560px; margin: 0 auto; }
        .e-final-h {
          font-size: clamp(1.4rem, 3vw, 1.9rem);
          font-weight: 900; color: #0F0A1A;
          letter-spacing: -0.035em; line-height: 1.22; margin-bottom: 34px;
        }
        .e-final-meta { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
        .e-final-link { font-size: 0.74rem; color: #B0A89A; text-decoration: none; transition: color 0.15s; }
        .e-final-link:hover { color: #7C3AED; }
        .e-final-link-btn { background: none; border: none; color: #B0A89A; font-size: 0.74rem; cursor: pointer; padding: 0; font-family: inherit; transition: color 0.15s; }
        .e-final-link-btn:hover { color: #7C3AED; }

        /* ─── FOOTER ─── */
        .e-footer { text-align: center; padding: 22px; font-size: 0.68rem; color: #6B5E52; border-top: 1px solid #EDE8E0; background: #fff; }
        .e-footer a { color: #6B5E52; text-decoration: none; font-weight: 600; }
        .e-footer a:hover { color: #7C3AED; }

        /* ─── JOINED BANNER ─── */
        .e-joined { background: #F0FDF4; border-bottom: 1px solid #BBF7D0; padding: 18px 32px; text-align: center; }

        /* ─── MOBILE BAR ─── */
        .e-mobile { display: none; }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 1100px) {
          .e-hero-outer { grid-template-columns: 1fr; min-height: auto; }
          .e-hero-left { padding: 60px 40px; }
          .e-hero-right { padding: 56px 40px; }
          .e-tgrid { grid-template-columns: 1fr; gap: 12px; }
          .e-av-row { display: none; }
        }

        @media (max-width: 700px) {
          .e-steps { grid-template-columns: 1fr; gap: 16px; }
          .e-steps::before { display: none; }
        }

        @media (max-width: 600px) {
          .e-hero-left { display: none; }
          .e-hero-right { padding: 56px 22px 44px; }
          .e-h1 { font-size: 2.6rem; }
          .e-hero-sub { font-size: 0.95rem; max-width: 100%; }
          .e-btn { max-width: 100%; }

          .e-proof { padding: 14px 20px; gap: 14px; }
          .e-proof-sep { display: none; }
          .e-wrap { padding: 0 20px; }
          .e-section { padding: 60px 0; }
          .e-math { padding: 24px 18px; }
          .e-milestones { gap: 8px; }
          .e-ms { padding: 14px 8px; }
          .e-ms-earn { font-size: 1.2rem; }

          .e-price-bg { padding: 60px 0; }
          .e-price-card { padding: 36px 22px; }
          .e-btn-white { width: 100%; display: block; padding: 17px; }
          .e-price-num { font-size: 3.5rem; }
          .e-final { padding: 68px 20px 80px; }
          .e-section-cta { display: none; }

          .e-mobile {
            display: flex;
            position: fixed; bottom: 0; left: 0; right: 0;
            padding: 12px 16px env(safe-area-inset-bottom, 6px);
            background: rgba(255,255,255,0.97);
            border-top: 1px solid #EDE8E0;
            backdrop-filter: blur(16px); z-index: 100;
          }
          .e-mobile button {
            width: 100%; background: #7C3AED;
            color: #fff; font-weight: 800; font-size: 0.95rem;
            padding: 15px; border-radius: 13px;
            border: none; cursor: pointer; min-height: 50px;
            box-shadow: 0 4px 18px rgba(124,58,237,0.4);
            font-family: inherit;
          }
          .e-mobile button:disabled { opacity: 0.5; }
          .e { padding-bottom: 74px; }
        }

        @media (max-width: 380px) { .e-h1 { font-size: 2.2rem; } }
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

          {/* Left — iPhone earnings dashboard */}
          <div className="e-hero-left">
            <div className="e-phone-wrap">

              {/* Floating WhatsApp sale notification */}
              <div className="e-notif">
                <div className="e-notif-icon">💬</div>
                <div>
                  <div className="e-notif-app">WhatsApp · PDF Seeds</div>
                  <div className="e-notif-title">New sale via your link</div>
                  <div className="e-notif-amt">£7.99 earned</div>
                  <div className="e-notif-sub">just now</div>
                </div>
              </div>

              {/* iPhone 16 Pro mockup */}
              <div className="e-phone">
                <div className="e-phone-screen">
                  <div className="e-phone-di" />
                  <div className="e-ps-head">
                    <div className="e-ps-app">PDF Seeds</div>
                    <div className="e-ps-title">Earnings</div>
                  </div>
                  <div className="e-ps-week">
                    <div className="e-ps-week-lbl">This week</div>
                    <div className="e-ps-week-amt">£79.90</div>
                    <div className="e-ps-week-meta">10 sales · ↑ 3 more than last week</div>
                  </div>
                  <div className="e-ps-rows">
                    {[
                      { day: "Today",     sales: "2 sales", amt: "£15.98" },
                      { day: "Yesterday", sales: "3 sales", amt: "£23.97" },
                      { day: "Monday",    sales: "1 sale",  amt: "£7.99"  },
                      { day: "Sunday",    sales: "4 sales", amt: "£31.96" },
                    ].map((r, i) => (
                      <div key={i} className="e-ps-row">
                        <span className="e-ps-row-day">{r.day}</span>
                        <span className="e-ps-row-sales">{r.sales}</span>
                        <span className="e-ps-row-amt">{r.amt}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="e-phone-home" />
              </div>
            </div>
          </div>

          {/* Right — copy + mechanism */}
          <div className="e-hero-right">
            <div className="e-chip">Curator Programme</div>
            <h1 className="e-h1">
              Your community.<br />
              Your link.<br />
              Your earnings.
            </h1>
            <p className="e-hero-sub">
              We&apos;ll send you a guide we think your community will love. Read it. <strong>If you&apos;d put your name on it — share your link and earn 80% of every sale.</strong>
            </p>

            {/* 3-step mechanism */}
            <div className="e-steps">
              <div className="e-step">
                <div className="e-step-num">01</div>
                <div className="e-step-title">Read</div>
                <div className="e-step-desc">
                  We match guides to your niche and community. You read what we send.
                </div>
              </div>
              <div className="e-step">
                <div className="e-step-num">02</div>
                <div className="e-step-title">Share</div>
                <div className="e-step-desc">
                  If you&apos;d put your name on it — send your link.
                </div>
                <div className="e-step-platforms">
                  {PLATFORMS.map((p) => (
                    <span key={p.name} className="e-plat" style={{ color: p.color, background: p.bg, borderColor: p.border }}>
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="e-step">
                <div className="e-step-num">03</div>
                <div className="e-step-title">Earn</div>
                <div className="e-step-desc">
                  80% of every sale. £7.99 a time. For life.
                </div>
              </div>
            </div>

            <button className="e-btn" onClick={handleGetAccess} disabled={loading}>
              {loading ? "Opening checkout…" : "Become a Curator →"}
            </button>
            <div className="e-trust">30-day money-back · 3 sales covers your £19.99</div>
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
            <span className="e-proof-lbl">guides to share</span>
          </div>
        </div>

        {/* ── TESTIMONIALS ── */}
        <section className="e-section">
          <div className="e-wrap">
            <div className="e-tag">What curators say</div>
            <div className="e-av-row">
              {AVATARS.map((a, i) => (
                <div key={i} className="e-av-pill">
                  <div className="e-av">{a.initials}</div>
                  <div>
                    <div className="e-av-name">{a.name}</div>
                    <div className="e-av-role" style={{ color: a.platformColor }}>{a.role}</div>
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
            <h2 className="e-h2">Three sales. Then it&apos;s all yours.</h2>
            <div className="e-math">
              <div className="e-math-head">
                Guide price <strong>£9.99</strong> × your <strong>80%</strong> = <strong>£7.99 per recommendation</strong>
              </div>
              <div className="e-milestones">
                <div className="e-ms e-ms-hi">
                  <div className="e-ms-num">3 sales</div>
                  <div className="e-ms-earn">£23.97</div>
                  <div className="e-ms-label">✓ Membership paid for<br />+ £3.98 profit</div>
                </div>
                <div className="e-ms">
                  <div className="e-ms-num">10 sales</div>
                  <div className="e-ms-earn">£79.90</div>
                  <div className="e-ms-label">A quiet week</div>
                </div>
                <div className="e-ms">
                  <div className="e-ms-num">30 sales</div>
                  <div className="e-ms-earn">£239.70</div>
                  <div className="e-ms-label">A good month</div>
                </div>
              </div>
              <div className="e-math-rows">
                {[
                  { Icon: MessageCircle, text: "WhatsApp group · 10 buyers", earn: "£79.90"  },
                  { Icon: PlayCircle,    text: "YouTube description · 30 buyers", earn: "£239.70" },
                  { Icon: Music2,        text: "TikTok caption · 20 buyers",  earn: "£159.80" },
                ].map((r, i) => (
                  <div key={i} className="e-math-row">
                    <span className="e-math-icon"><r.Icon size={16} strokeWidth={1.75} color="#6B5E52" /></span>
                    <span className="e-math-lbl">{r.text}</span>
                    <span className="e-math-earn">{r.earn}</span>
                  </div>
                ))}
              </div>
              <div className="e-math-note">
                Three sales from one WhatsApp group. Most curators are in profit within their first week.
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
                { Icon: Banknote,      title: "£7.99 per sale — for life",          desc: "80% of every guide. Paid monthly. Nothing to chase." },
                { Icon: Link2,         title: "One link. Every guide.",              desc: "1,000+ guides across every niche and country. Share any — they all earn." },
                { Icon: MessageSquare, title: "Copy, paste, earn.",                  desc: "WhatsApp, YouTube, TikTok, Instagram — all pre-written. Live in two minutes." },
                { Icon: BarChart3,     title: "Live earnings dashboard.",            desc: "Every sale, every penny. Live — not delayed." },
                { Icon: BookOpen,      title: "We keep finding new guides for your community.", desc: "As the library grows, we match new relevant guides to your niche — so your earning potential keeps growing without you lifting a finger." },
              ].map((b, i) => (
                <div key={i} className="e-get-item">
                  <div className="e-get-icon"><b.Icon size={16} strokeWidth={1.75} color="#7C3AED" /></div>
                  <div>
                    <div className="e-get-title">{b.title}</div>
                    <div className="e-get-desc">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="e-section-cta">
              <button className="e-btn" style={{ maxWidth: "none" }} onClick={handleGetAccess} disabled={loading}>{btnLabel}</button>
              <div style={{ fontSize: "0.68rem", color: "#B0A89A", marginTop: 14 }}>30-day money-back guarantee · No questions asked</div>
            </div>
          </div>
        </section>

        {/* ── LIVE DEMAND ── */}
        {SEED_SEARCHES.length > 0 && (
          <>
            <hr className="e-divider" />
            <section className="e-section">
              <div className="e-wrap">
                <div className="e-tag">Live on pdfseeds.com</div>
                <h2 className="e-h2">What your community is searching right now.</h2>
                <div className="e-demand">
                  <div className="e-demand-top">
                    <div className="e-demand-title">Real searches — real demand</div>
                    <div className="e-demand-live"><div className="e-demand-dot" /> Live</div>
                  </div>
                  {SEED_SEARCHES.map((q, i) => (
                    <div key={i} className="e-demand-row">
                      <div className="e-demand-q">&ldquo;{q}&rdquo;</div>
                      <div className="e-demand-sig">guide exists ↗</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── FAQ ── */}
        <hr className="e-divider" />
        <section className="e-section">
          <div className="e-wrap">
            <div className="e-tag">Before you ask</div>
            <h2 className="e-h2">Three things people wonder.</h2>
            <div className="e-faqs">
              {[
                { q: "Do I need a big following?", a: "No. A WhatsApp group of 50 who trust you will outperform 5,000 followers who scroll past. Community beats audience." },
                { q: "When does the money arrive?", a: "Every month, automatically. Nothing to invoice. Nothing to chase." },
                { q: "What if nobody buys?", a: "30 days, completely risk-free. Full refund, no questions, no conditions." },
              ].map((f, i) => (
                <div key={i} className="e-faq">
                  <div className="e-faq-q">{f.q}</div>
                  <div className="e-faq-a">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICE BLOCK ── */}
        <div className="e-price-bg">
          <div className="e-wrap">
            <div className="e-price-card">
              <span className="e-price-eyebrow">Curator Programme Access</span>
              <div className="e-price-num">£19.99</div>
              <div className="e-price-sub">One-time. No subscriptions. No monthly fees.</div>
              <div className="e-price-recover">Three sales covers your £19.99. Every sale after that is pure profit.</div>
              <div className="e-price-list">
                {[
                  "£7.99 per sale — for life (80% of every guide)",
                  "We match guides to your niche — you read, you decide",
                  "Your curator link for every guide — 1,000+ topics",
                  "Ready-made captions for WhatsApp, YouTube, TikTok and Instagram",
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
                £7.99 per sale · For life · 30-day money-back · No questions asked
              </div>
            </div>
          </div>
        </div>

        {/* ── FINAL CTA ── */}
        <div className="e-final-outer">
          <div className="e-final">
            <h2 className="e-final-h">
              Every question your community asks about home<br />
              is money you could already be earning.
            </h2>
            <button className="e-btn" style={{ maxWidth: "none" }} onClick={handleGetAccess} disabled={loading}>
              {loading ? "Opening checkout…" : "Become a Curator — £19.99 →"}
            </button>
            <div className="e-final-meta">
              <a href="mailto:hello@pdfseeds.com" className="e-final-link">Questions? hello@pdfseeds.com</a>
            </div>
          </div>
        </div>

        {/* ── RECOVERY ── */}
        <div style={{ borderTop: "1px solid #EDE8E0", background: "#fff", padding: "32px 24px", textAlign: "center" }}>
          {!recovery ? (
            <button className="e-final-link-btn" onClick={() => setRecovery(true)} style={{ fontSize: "0.72rem", color: "#B0A89A" }}>
              Already a curator? Get my dashboard link →
            </button>
          ) : (
            <div style={{ maxWidth: 400, margin: "0 auto", textAlign: "left" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0F0A1A", marginBottom: 4 }}>Resend my dashboard link</div>
              <div style={{ fontSize: "0.72rem", color: "#B0A89A", marginBottom: 14 }}>Enter the email you used when you joined.</div>
              {recoveryStatus === "done" ? (
                <div style={{ fontSize: "0.82rem", color: "#15803D", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "13px 16px" }}>
                  ✓ Check your inbox — your dashboard link is on its way.
                </div>
              ) : recoveryStatus === "notfound" ? (
                <div>
                  <div style={{ fontSize: "0.82rem", color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "13px 16px", marginBottom: 10 }}>
                    No account found. Try the email you used when you paid.
                  </div>
                  <button onClick={() => setRecoveryStatus("idle")} style={{ background: "none", border: "none", color: "#7C3AED", fontSize: "0.78rem", cursor: "pointer", fontWeight: 700 }}>
                    Try a different email →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRecovery}>
                  <div style={{ background: "#fff", border: "1.5px solid #EAE6E0", borderRadius: 10, padding: "4px 4px 4px 14px", display: "flex", alignItems: "center", gap: 7 }}>
                    <input
                      type="email" value={recoveryEmail}
                      onChange={e => setRecoveryEmail(e.target.value)}
                      placeholder="Your email address" required autoFocus
                      style={{ flex: 1, border: "none", outline: "none", fontSize: "0.86rem", color: "#0F0A1A", background: "transparent", padding: "10px 0", fontFamily: "inherit" }}
                    />
                    <button
                      type="submit" disabled={recoveryStatus === "sending"}
                      style={{ background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: "0.78rem", padding: "9px 15px", border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", opacity: recoveryStatus === "sending" ? 0.5 : 1, fontFamily: "inherit" }}
                    >
                      {recoveryStatus === "sending" ? "Sending…" : "Send link →"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
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
