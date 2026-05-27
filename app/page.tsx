"use client";

import { useState, useRef, useEffect } from "react";
import { Lock } from "lucide-react";

type Step = "idle" | "country" | "generating" | "result" | "waitlist";

type Guide = {
  slug: string;
  title: string;
  price: string;
  painPoint: string;
  chapters: { chapter: string; title: string; description: string }[];
};

type WaitlistStatus = "idle" | "sending" | "done";

const MESSAGES = [
  "Searching for guide…",
  "Found your guide…",
  "Getting your guide…",
];


export default function HomePage() {
  const [step, setStep] = useState<Step>("idle");
  const [situation, setSituation] = useState("");
  const [country, setCountry] = useState("");
  const [guide, setGuide] = useState<Guide | null>(null);
  const [error, setError] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<WaitlistStatus>("idle");
  const [partnerRef, setPartnerRef] = useState("");
  const [isFirstBuy, setIsFirstBuy] = useState(true);
  const countryRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setPartnerRef(ref);
    if (localStorage.getItem("pdfseeds_purchased")) setIsFirstBuy(false);
  }, []);

  useEffect(() => {
    if (step === "country") countryRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step !== "generating") return;
    setMsgIndex(0);
    setProgress(0);
    const msgTimer = setInterval(() => setMsgIndex(i => Math.min(i + 1, MESSAGES.length - 1)), 5000);
    const progTimer = setInterval(() => {
      setProgress(p => {
        if (p >= 90) return p;
        const r = Math.random();
        if (p < 20) return p + r * 5 + 0.5;
        if (p < 50) return p + r * 2 + 0.3;
        if (p < 75) return p + r * 1 + 0.1;
        return p + r * 0.5;
      });
    }, 250);
    return () => { clearInterval(msgTimer); clearInterval(progTimer); };
  }, [step]);

  function handleSituation(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!situation.trim()) return;
    // Fire-and-forget — log the search query for demand intelligence
    fetch("/api/search-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: situation.trim(), source: "homepage" }),
    }).catch(() => {});
    setStep("country");
  }

  async function handleGenerate(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!country.trim()) return;
    setError("");
    setStep("generating");
    // Update the log with the country now that we have it
    fetch("/api/search-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: situation.trim(), country: country.trim(), source: "homepage-with-country" }),
    }).catch(() => {});
    abortRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortRef.current?.abort(), 90_000);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, country }),
        signal: abortRef.current.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setProgress(100);
      setTimeout(() => { setGuide(data as Guide); setStep("result"); }, 500);
    } catch (err) {
      clearTimeout(timeoutId);
      setError(
        err instanceof Error && err.name === "AbortError"
          ? "This took too long. Please try again."
          : err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setStep("country");
    }
  }

  async function handleBuy() {
    if (!guide) return;
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: guide.slug, ...(partnerRef ? { ref: partnerRef } : {}), ...(isFirstBuy ? { tripwire: true } : {}) }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function submitWaitlist(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;
    setWaitlistStatus("sending");
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail.trim(), query: situation.trim(), country: country.trim() }),
      });
      setWaitlistStatus("done");
    } catch {
      setWaitlistStatus("done");
    }
  }

  function reset() {
    abortRef.current?.abort();
    setStep("idle");
    setSituation("");
    setCountry("");
    setGuide(null);
    setError("");
    setWaitlistEmail("");
    setWaitlistStatus("idle");
  }

  return (
    <>
      <style>{`
        body > aside { display: none !important; }
        body > nav  { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; padding-bottom: 0 !important; background: #FAF9F7 !important; color-scheme: light !important; }
        body > main { overflow: visible !important; height: auto !important; padding-bottom: 0 !important; }
        * { box-sizing: border-box; }

        .pg {
          min-height: 100dvh;
          background: #FAF9F7;
          font-family: var(--font-geist-sans), -apple-system, system-ui, sans-serif;
          display: flex;
          flex-direction: column;
          color: #1A1008;
        }

        /* ── HEADER ── */
        .pg-header {
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pg-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .pg-logo-mark {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          box-shadow: 0 4px 12px rgba(124,58,237,0.2);
        }
        .pg-logo-name {
          font-size: 1rem; font-weight: 800;
          color: #1A1008; letter-spacing: -0.02em;
        }
        .pg-farm-link {
          font-size: 0.78rem; color: #B0A89A; font-weight: 500;
          text-decoration: none; transition: color 0.15s;
        }
        .pg-farm-link:hover { color: #7C3AED; }

        /* ── MAIN ── */
        .pg-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px 96px;
          text-align: center;
          width: 100%;
        }

        /* ── IDLE ── */
        .pg-hero-eyebrow {
          display: inline-flex; align-items: center;
          background: #EDE9FE;
          border: 1px solid #C4B5FD;
          border-radius: 999px;
          padding: 5px 16px;
          font-size: 0.7rem; font-weight: 700;
          color: #6D28D9; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 28px;
        }
        .pg-hero-h1 {
          font-size: clamp(2rem, 6vw, 3.2rem);
          font-weight: 900;
          color: #1A1008;
          line-height: 1.1;
          letter-spacing: -0.04em;
          margin: 0 0 14px;
          max-width: 680px;
        }
        .pg-hero-use-cases {
          font-size: clamp(0.98rem, 2.5vw, 1.05rem);
          font-weight: 700;
          color: #1A1008;
          margin: 0 0 6px;
          max-width: 420px;
          letter-spacing: -0.01em;
        }
        .pg-hero-sub {
          font-size: clamp(0.95rem, 2.5vw, 1.05rem);
          color: #6B5E52;
          line-height: 1.7;
          margin: 0 0 40px;
          max-width: 400px;
        }
        .pg-form {
          width: 100%;
          max-width: 520px;
        }
        .pg-form-inner {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pg-input-wrap {
          flex: 1;
          background: #FFFFFF;
          border: 1.5px solid #EAE6E0;
          border-radius: 16px;
          padding: 6px 6px 6px 20px;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pg-input-wrap:focus-within {
          border-color: #C4B5FD;
          box-shadow: 0 4px 24px rgba(124,58,237,0.1);
        }
        .pg-input {
          flex: 1; border: none; outline: none;
          font-size: 1rem; color: #1A1008;
          background: transparent;
          padding: 10px 0;
          min-width: 0;
        }
        .pg-input::placeholder { color: #C4BAB0; }
        .pg-btn {
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          color: #fff; font-weight: 700; font-size: 0.9rem;
          padding: 12px 22px; border: none; border-radius: 12px;
          cursor: pointer; white-space: nowrap;
          box-shadow: 0 4px 14px rgba(124,58,237,0.3);
          transition: opacity 0.15s, transform 0.1s;
          flex-shrink: 0;
        }
        .pg-btn:hover { opacity: 0.92; }
        .pg-btn:active { transform: scale(0.98); }
        .pg-hint {
          font-size: 0.78rem; color: #C4BAB0;
          margin-top: 14px; line-height: 1.6;
        }
        .pg-hint-pills {
          display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;
          margin-top: 16px;
        }
        .pg-hint-pill {
          font-size: 0.72rem; font-weight: 600;
          color: #7C3AED;
          background: #F5F3FF;
          border: 1px solid #DDD6FE;
          border-radius: 999px;
          padding: 3px 12px;
          letter-spacing: 0.02em;
        }

        /* ── COUNTRY STEP ── */
        .pg-country-wrap {
          display: flex; flex-direction: column; align-items: center;
          width: 100%; max-width: 520px;
          animation: step-enter 0.35s ease both;
        }
        @keyframes step-enter {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pg-country-label {
          font-size: 0.88rem; font-weight: 600;
          color: #5B21B6; letter-spacing: 0.01em;
          margin: 0 0 12px; text-align: center;
        }

        /* ── DEEP PURPLE INPUT (country step) ── */
        .pg-input-wrap--deep {
          border-color: #A78BFA;
        }
        .pg-input-wrap--deep:focus-within {
          border-color: #6D28D9;
          box-shadow: 0 4px 24px rgba(109,40,217,0.15);
        }
        .pg-btn--deep {
          background: linear-gradient(135deg, #5B21B6, #4C1D95);
          box-shadow: 0 4px 14px rgba(91,33,182,0.4);
        }

        /* ── LOCKED PILL ── */
        .pg-locked {
          display: flex; align-items: center; gap: 10px;
          background: #EDE9FE; border: 1.5px solid #A78BFA;
          border-radius: 999px; padding: 10px 16px;
          margin-bottom: 14px; cursor: pointer;
          max-width: 520px; width: 100%;
          transition: background 0.15s;
        }
        .pg-locked:hover { background: #E5DEFF; }
        .pg-locked-dot { width: 7px; height: 7px; border-radius: 50%; background: #5B21B6; flex-shrink: 0; }
        .pg-locked-text { font-size: 0.88rem; color: #3B0764; font-weight: 600; flex: 1; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pg-locked-x { font-size: 0.75rem; color: #7C3AED; flex-shrink: 0; }

        /* ── ERROR ── */
        .pg-error {
          max-width: 520px; width: 100%;
          background: #FEF2F2; border: 1px solid #FECACA;
          border-radius: 12px; padding: 12px 16px;
          font-size: 0.85rem; color: #DC2626;
          margin-top: 12px; text-align: center;
        }

        /* ── GENERATING ── */
        .pg-gen {
          display: flex; flex-direction: column;
          align-items: center; max-width: 360px; width: 100%;
        }
        .pg-gen-orb {
          width: 80px; height: 80px;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-radius: 24px;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.2rem; margin-bottom: 32px;
          animation: orb-breathe 2.4s ease-in-out infinite;
          box-shadow: 0 8px 32px rgba(124,58,237,0.3);
        }
        @keyframes orb-breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(124,58,237,0.3); }
          50%       { transform: scale(1.06); box-shadow: 0 12px 48px rgba(124,58,237,0.45); }
        }
        .pg-gen-msg {
          font-size: 1.05rem; font-weight: 600; color: #1A1008;
          margin-bottom: 32px; min-height: 32px;
        }
        .pg-track {
          width: 100%; height: 3px; background: #EAE6E0;
          border-radius: 999px; overflow: hidden; margin-bottom: 8px;
        }
        .pg-gen-pct {
          font-size: 0.75rem; font-weight: 700;
          color: #7C3AED; letter-spacing: 0.05em;
          text-align: right; width: 100%; margin-bottom: 28px;
        }
        .pg-bar {
          height: 100%;
          background: linear-gradient(90deg, #7C3AED, #A78BFA);
          border-radius: 999px;
          transition: width 0.4s ease;
        }
        .pg-gen-steps {
          width: 100%; display: flex; flex-direction: column; gap: 10px;
          text-align: left;
        }
        .pg-step { display: flex; align-items: center; gap: 10px; font-size: 0.82rem; color: #D4CEC8; transition: color 0.4s; }
        .pg-step.done { color: #8C7D6E; }
        .pg-step.active { color: #7C3AED; font-weight: 600; }
        .pg-step-dot { width: 6px; height: 6px; border-radius: 50%; background: #E8E4DE; flex-shrink: 0; transition: background 0.4s; }
        .pg-step.done .pg-step-dot { background: #10B981; }
        .pg-step.active .pg-step-dot { background: #7C3AED; animation: step-pulse 1.2s infinite; }
        @keyframes step-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        /* ── RESULT ── */
        .pg-result {
          max-width: 480px; width: 100%;
          display: flex; flex-direction: column; align-items: center;
        }
        .pg-result-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #F0FDF4; border: 1px solid #BBF7D0;
          border-radius: 999px; padding: 5px 14px;
          font-size: 0.72rem; font-weight: 700; color: #15803D;
          margin-bottom: 20px; letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .pg-result-title {
          font-size: clamp(1.2rem, 3.5vw, 1.55rem);
          font-weight: 800; color: #1A1008;
          line-height: 1.3; margin-bottom: 10px;
          letter-spacing: -0.02em; text-align: center;
        }
        .pg-result-echo {
          font-size: 0.83rem; color: #B0A89A; font-style: italic;
          margin-bottom: 22px; text-align: center; line-height: 1.5;
        }

        /* ── BOOK PAGE ── */
        .pg-book-page {
          width: 100%;
          background: #FEFCF8;
          border-radius: 3px;
          padding: 40px 32px 32px;
          margin-bottom: 24px;
          box-shadow:
            0 2px 4px rgba(0,0,0,0.04),
            0 8px 28px rgba(0,0,0,0.1),
            0 28px 64px rgba(0,0,0,0.09);
          animation: page-appear 0.45s ease both;
        }
        @keyframes page-appear {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pg-book-page-brand {
          font-size: 0.52rem; font-weight: 700;
          color: #C4BAB0; letter-spacing: 0.26em;
          text-transform: uppercase; text-align: center;
          margin-bottom: 36px;
        }
        .pg-book-page-title {
          font-size: clamp(1.45rem, 4vw, 2rem);
          font-weight: 900; color: #1A1008;
          text-align: center; line-height: 1.18;
          letter-spacing: -0.025em; margin-bottom: 36px;
        }
        .pg-book-page-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, #DDD6C8 20%, #DDD6C8 80%, transparent);
          margin-bottom: 24px;
        }
        .pg-toc-heading {
          font-size: 0.54rem; font-weight: 700; letter-spacing: 0.22em;
          text-transform: uppercase; color: #C4BAB0;
          text-align: center; margin-bottom: 18px;
        }
        .pg-toc { width: 100%; }
        .pg-toc-row { padding: 10px 0; border-bottom: 1px solid #EDE9E2; }
        .pg-toc-row:last-child { border-bottom: none; }
        .pg-toc-item { display: flex; align-items: baseline; gap: 12px; }
        .pg-toc-num {
          font-size: 0.6rem; font-weight: 700; color: #C4BAB0;
          min-width: 20px; flex-shrink: 0; text-align: right;
          padding-top: 1px; letter-spacing: 0.04em;
        }
        .pg-toc-title {
          flex: 1; font-size: 0.95rem; font-weight: 700;
          color: #1A1008; line-height: 1.3;
        }
        .pg-toc-sub {
          font-size: 0.72rem; color: #8C7D6E; font-style: italic;
          padding: 3px 0 2px 32px; display: block;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .pg-toc-row--locked { opacity: 0.28; user-select: none; }
        .pg-toc-row--locked .pg-toc-title { filter: blur(4px); }
        .pg-toc-locked-block { margin-top: 4px; }
        .pg-toc-lock-icon {
          display: flex; align-items: center; justify-content: center;
          padding: 16px 0 4px; color: #C4BAB0;
        }
        .pg-book-page-footer {
          text-align: center; margin-top: 22px; padding-top: 16px;
          font-size: 0.56rem; color: #DDD6C8; letter-spacing: 0.14em;
          border-top: 1px solid #EDE9E2;
        }

        /* Chapter preview card */
        .pg-chapters {
          width: 100%; background: #fff;
          border: 1.5px solid #EAE6E0; border-radius: 18px;
          overflow: hidden; margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .pg-chapters-head {
          padding: 12px 18px; border-bottom: 1px solid #EAE6E0;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 0.68rem; font-weight: 700; color: #9B8AF0;
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .pg-chapter {
          padding: 14px 18px; border-bottom: 1px solid #F5F0EB;
        }
        .pg-chapter:last-child { border-bottom: none; }
        .pg-chapter-label {
          font-size: 0.62rem; font-weight: 700; color: #C4BAB0;
          letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 3px;
        }
        .pg-chapter-title {
          font-size: 0.9rem; font-weight: 700; color: #1A1008;
          line-height: 1.35; margin-bottom: 3px;
        }
        .pg-chapter-desc {
          font-size: 0.77rem; color: #6B5E52; line-height: 1.6;
        }

        /* Locked chapters */
        .pg-chapters-locked { position: relative; }
        .pg-chapters-locked-fade {
          position: absolute; top: 0; left: 0; right: 0; height: 32px;
          background: linear-gradient(to bottom, #ffffff, transparent);
          pointer-events: none; z-index: 1;
        }
        .pg-chapter--locked { opacity: 0.38; user-select: none; }
        .pg-chapter--locked .pg-chapter-title { filter: blur(4px); }
        .pg-chapters-lock {
          padding: 12px 18px; border-top: 1px solid #EAE6E0;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-size: 0.75rem; font-weight: 600; color: #9B8AF0;
          background: #F9F7FF;
        }

        /* Offer pill */
        .pg-result-offer {
          width: 100%; display: flex; align-items: center; justify-content: center;
          gap: 10px; background: #F0FDF4; border: 1px solid #BBF7D0;
          border-radius: 12px; padding: 10px 18px; margin-bottom: 12px;
        }
        .pg-result-offer-old {
          font-size: 0.88rem; color: #9B8AF0;
          text-decoration: line-through; font-weight: 500;
        }
        .pg-result-offer-new {
          font-size: 1.15rem; font-weight: 900; color: #15803D; letter-spacing: -0.02em;
        }
        .pg-result-offer-label {
          font-size: 0.68rem; font-weight: 700; color: #15803D;
          letter-spacing: 0.04em; text-transform: uppercase;
        }

        .pg-result-cta {
          display: block; width: 100%;
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          color: #fff; font-weight: 800; font-size: 1.1rem;
          padding: 20px; border-radius: 16px;
          border: none; cursor: pointer;
          box-shadow: 0 8px 28px rgba(124,58,237,0.35);
          transition: opacity 0.15s, transform 0.1s;
          margin-bottom: 14px; letter-spacing: -0.01em;
        }
        .pg-result-cta:hover { opacity: 0.92; }
        .pg-result-cta:active { transform: scale(0.99); }
        .pg-result-trust {
          display: flex; gap: 8px; justify-content: center; align-items: center;
          font-size: 0.74rem; color: #C4BAB0; flex-wrap: wrap; margin-bottom: 24px;
        }
        .pg-result-trust-sep { color: #E8E4DE; }
        .pg-result-again {
          font-size: 0.82rem; color: #C4BAB0;
          background: none; border: none; cursor: pointer;
          padding: 0; text-decoration: underline;
          text-decoration-color: #E8E4DE; transition: color 0.15s;
        }
        .pg-result-again:hover { color: #7C3AED; }

        /* ── CHECKOUT ── */
        .pg-checkout { max-width: 520px; width: 100%; }
        .pg-checkout-stripe {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          color-scheme: light;
        }
        .pg-checkout-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.82rem; color: #B0A89A;
          background: none; border: none; cursor: pointer;
          padding: 0; margin-bottom: 20px;
          transition: color 0.15s;
        }
        .pg-checkout-back:hover { color: #7C3AED; }

        /* ── PAID ── */
        .pg-paid { max-width: 420px; width: 100%; text-align: center; }
        .pg-paid-orb {
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, #10B981, #059669);
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; margin: 0 auto 24px;
          box-shadow: 0 8px 28px rgba(16,185,129,0.3);
        }
        .pg-paid-title { font-size: 1.5rem; font-weight: 800; color: #1A1008; margin-bottom: 10px; letter-spacing: -0.03em; }
        .pg-paid-sub { font-size: 0.92rem; color: #8C7D6E; line-height: 1.7; margin-bottom: 28px; }
        .pg-paid-btn {
          display: inline-block;
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          color: #fff; font-weight: 700; font-size: 0.95rem;
          padding: 14px 32px; border-radius: 999px;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(124,58,237,0.3);
        }

        /* ── UPSELL (post-purchase related guides) ── */
        .pg-upsell { max-width: 420px; width: 100%; margin-top: 36px; }
        .pg-upsell-heading {
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: #B0A89A; margin-bottom: 14px;
        }
        .pg-upsell-grid { display: flex; flex-direction: column; gap: 10px; }
        .pg-upsell-card {
          background: #FFFFFF; border: 1.5px solid #EAE6E0;
          border-radius: 14px; padding: 14px 16px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; text-decoration: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .pg-upsell-card:hover { border-color: #C4B5FD; box-shadow: 0 4px 16px rgba(124,58,237,0.1); }
        .pg-upsell-card-title { font-size: 0.88rem; font-weight: 600; color: #1A1008; line-height: 1.35; text-align: left; }
        .pg-upsell-card-price { font-size: 0.82rem; font-weight: 700; color: #7C3AED; flex-shrink: 0; white-space: nowrap; }

        /* ── WAITLIST ── */
        .pg-waitlist { max-width: 440px; width: 100%; text-align: center; }
        .pg-waitlist-icon { font-size: 2.5rem; margin-bottom: 20px; }
        .pg-waitlist-title { font-size: 1.4rem; font-weight: 800; color: #1A1008; margin-bottom: 10px; letter-spacing: -0.02em; }
        .pg-waitlist-sub { font-size: 0.9rem; color: #8C7D6E; line-height: 1.7; margin-bottom: 24px; max-width: 360px; margin-left: auto; margin-right: auto; }
        .pg-waitlist-query {
          display: inline-block; background: #EDE9FE; border-radius: 999px;
          padding: 6px 16px; font-size: 0.83rem; font-weight: 600; color: #5B21B6;
          margin-bottom: 24px;
        }
        .pg-waitlist-done {
          font-size: 0.95rem; font-weight: 600; color: #15803D;
          background: #F0FDF4; border: 1px solid #BBF7D0;
          border-radius: 14px; padding: 18px 24px; margin-bottom: 20px;
        }

        /* ── FOOTER ── */
        .pg-footer {
          text-align: center; padding: 16px 24px;
          font-size: 0.72rem; color: #1A1008;
          border-top: 1px solid #E2DDD8;
        }

        /* ── DESKTOP (> 1024px) ── */
        @media (min-width: 1025px) {
          .pg {
            background-image:
              linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px);
            background-size: 64px 64px;
          }
          .pg-header { padding: 28px 56px; }
          .pg-main { padding: 72px 40px 128px; }
          .pg-hero-eyebrow { font-size: 0.75rem; margin-bottom: 32px; }
          .pg-hero-h1 { font-size: clamp(3rem, 4.5vw, 4rem); max-width: 780px; margin-bottom: 20px; }
          .pg-hero-use-cases { font-size: 1.1rem; max-width: 480px; }
          .pg-hero-sub { font-size: 1.1rem; max-width: 480px; margin-bottom: 48px; }
          .pg-form { max-width: 560px; }
          .pg-input-wrap { padding: 8px 8px 8px 24px; border-radius: 18px; }
          .pg-input { font-size: 1.05rem; padding: 12px 0; }
          .pg-btn { padding: 14px 28px; font-size: 0.95rem; border-radius: 14px; }
          .pg-hint { font-size: 0.82rem; margin-top: 18px; }
          .pg-gen { max-width: 400px; }
          .pg-result { max-width: 520px; }
          .pg-result-cta { padding: 22px; font-size: 1.15rem; }
          .pg-checkout { max-width: 600px; }
          .pg-paid { max-width: 500px; }
          .pg-upsell { max-width: 500px; }
          .pg-waitlist { max-width: 500px; }
        }

        /* ── TABLET LANDSCAPE (769–1024px) ── */
        @media (min-width: 769px) and (max-width: 1024px) {
          .pg-header { padding: 24px 44px; }
          .pg-main { padding: 60px 48px 108px; }
          .pg-hero-h1 { font-size: clamp(2.2rem, 4vw, 3rem); max-width: 640px; }
          .pg-hero-sub { font-size: 1rem; max-width: 500px; }
          .pg-form { max-width: 560px; }
          .pg-btn { padding: 13px 24px; font-size: 0.92rem; }
          .pg-gen { max-width: 460px; }
          .pg-result { max-width: 540px; }
          .pg-result-cta { padding: 22px; font-size: 1.15rem; }
          .pg-checkout { max-width: 580px; }
          .pg-paid { max-width: 500px; }
          .pg-upsell { max-width: 500px; }
          .pg-waitlist { max-width: 520px; }
        }

        /* ── TABLET PORTRAIT (601–768px) ── */
        @media (min-width: 601px) and (max-width: 768px) {
          .pg-header { padding: 20px 36px; }
          .pg-main { padding: 52px 36px 96px; }
          .pg-hero-h1 { font-size: clamp(2rem, 5vw, 2.6rem); max-width: 560px; }
          .pg-hero-sub { font-size: 0.98rem; max-width: 440px; margin-bottom: 36px; }
          .pg-form { max-width: 100%; }
          .pg-btn { padding: 13px 20px; font-size: 0.9rem; }
          .pg-gen { max-width: 420px; }
          .pg-result { max-width: 480px; }
          .pg-result-cta { padding: 20px; font-size: 1.08rem; }
          .pg-checkout { max-width: 520px; }
          .pg-paid { max-width: 460px; }
          .pg-upsell { max-width: 460px; }
          .pg-waitlist { max-width: 480px; }
        }

        /* ── MOBILE (≤ 600px) ── */
        @media (max-width: 600px) {
          .pg-header { padding: 16px 20px; }
          .pg-logo-name { font-size: 0.9rem; }
          .pg-main { padding: 40px 20px 80px; justify-content: flex-start; }
          .pg-hero-eyebrow { margin-bottom: 14px; font-size: 0.68rem; }
          .pg-hero-h1 { font-size: 1.9rem; letter-spacing: -0.03em; max-width: 100%; margin-bottom: 14px; }
          .pg-hero-use-cases { font-size: 0.9rem; max-width: 100%; margin-bottom: 4px; }
          .pg-hero-sub { font-size: 0.92rem; max-width: 100%; margin-bottom: 28px; line-height: 1.65; }
          .pg-form { max-width: 100%; }
          .pg-input-wrap { border-radius: 14px; padding: 6px 6px 6px 16px; gap: 6px; }
          .pg-input { font-size: 0.95rem; padding: 10px 0; }
          .pg-btn { padding: 13px 14px; font-size: 0.82rem; min-height: 48px; border-radius: 10px; }
          .pg-hint { font-size: 0.74rem; margin-top: 12px; }
          .pg-locked { max-width: 100%; border-radius: 14px; }
          .pg-locked-text { font-size: 0.84rem; }
          .pg-gen { max-width: 100%; }
          .pg-gen-orb { width: 64px; height: 64px; border-radius: 18px; font-size: 1.7rem; margin-bottom: 24px; }
          .pg-gen-msg { font-size: 0.95rem; margin-bottom: 24px; }
          .pg-track { margin-bottom: 24px; }
          .pg-gen-steps { gap: 8px; }
          .pg-step { font-size: 0.8rem; }
          .pg-result { max-width: 100%; }
          .pg-result-badge { font-size: 0.68rem; margin-bottom: 16px; }
          .pg-result-title { font-size: 1.2rem; margin-bottom: 22px; }
          .pg-result-cta { padding: 18px; font-size: 1rem; min-height: 58px; border-radius: 14px; }
          .pg-result-trust { gap: 10px; font-size: 0.74rem; margin-bottom: 20px; }
          .pg-checkout { max-width: 100%; }
          .pg-checkout-back { min-height: 44px; }
          .pg-paid { max-width: 100%; }
          .pg-paid-orb { width: 60px; height: 60px; font-size: 1.6rem; border-radius: 16px; }
          .pg-paid-title { font-size: 1.25rem; }
          .pg-paid-sub { font-size: 0.88rem; }
          .pg-paid-btn { display: block; text-align: center; padding: 16px 24px; font-size: 0.95rem; }
          .pg-upsell { max-width: 100%; }
          .pg-upsell-card-title { font-size: 0.83rem; }
          .pg-waitlist { max-width: 100%; }
          .pg-waitlist-title { font-size: 1.2rem; }
          .pg-waitlist-sub { font-size: 0.86rem; }
          .pg-footer { padding: 14px 20px; font-size: 0.7rem; }
        }

        /* ── SMALL MOBILE (≤ 480px) — stack button below input ── */
        @media (max-width: 480px) {
          .pg-form-inner {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .pg-input-wrap { padding: 6px 6px 6px 16px; }
          .pg-input { padding: 10px 0; font-size: 1rem; }
          .pg-btn { width: 100%; padding: 15px 20px; font-size: 0.92rem; border-radius: 12px; }
        }

        /* ── EXTRA SMALL (≤ 375px) ── */
        @media (max-width: 375px) {
          .pg-header { padding: 14px 16px; }
          .pg-main { padding: 32px 16px 72px; }
          .pg-hero-h1 { font-size: 1.65rem; }
          .pg-hero-sub { font-size: 0.88rem; }
          .pg-result-trust { flex-direction: column; align-items: center; gap: 8px; }
          .pg-result-cta { font-size: 0.95rem; }
        }
      `}</style>

      <div className="pg">

        {/* HEADER */}
        <header className="pg-header">
          <a href="/" className="pg-logo">
            <div className="pg-logo-mark">🌱</div>
            <span className="pg-logo-name">PDF Seeds</span>
          </a>
        </header>

        <main className="pg-main">

          {/* ── IDLE ── */}
          {step === "idle" && (
            <>
              <span className="pg-hero-eyebrow">For the diaspora — wherever home is</span>
              <h1 className="pg-hero-h1">Navigate home. From anywhere.</h1>
              <p className="pg-hero-use-cases">Passports. Land. Business. Banking. Healthcare.</p>
              <p className="pg-hero-sub">Every step covered. No agent. No guesswork.</p>
              <div className="pg-form">
                <form onSubmit={handleSituation}>
                  <div className="pg-form-inner">
                    <div className="pg-input-wrap">
                      <input
                        className="pg-input"
                        value={situation}
                        onChange={e => setSituation(e.target.value)}
                        placeholder="What do you need to sort out back home?"
                        autoFocus
                        required
                      />
                    </div>
                    <button type="submit" className="pg-btn">Find My Guide →</button>
                  </div>
                </form>
                <div className="pg-hint-pills">
                  <a href="/expat" className="pg-hint-pill" style={{ textDecoration: "none" }}>Expat? Your page →</a>
                  <a href="/returning" className="pg-hint-pill" style={{ textDecoration: "none" }}>Going home for good? →</a>
                </div>
              </div>
            </>
          )}

          {/* ── COUNTRY ── */}
          {step === "country" && (
            <div className="pg-country-wrap">
              <div className="pg-locked" onClick={reset}>
                <div className="pg-locked-dot" />
                <div className="pg-locked-text">{situation}</div>
                <div className="pg-locked-x">change ×</div>
              </div>
              <p className="pg-country-label">Which country is this guide for?</p>
              <div className="pg-form">
                <form onSubmit={handleGenerate}>
                  <div className="pg-form-inner">
                    <div className="pg-input-wrap pg-input-wrap--deep">
                      <input
                        ref={countryRef}
                        className="pg-input"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        placeholder="Type your country"
                        required
                      />
                    </div>
                    <button type="submit" className="pg-btn pg-btn--deep">Build My Guide →</button>
                  </div>
                </form>
                {error && <div className="pg-error">{error}</div>}
                <div className="pg-hint">Ghana · Nigeria · Kenya · Jamaica · India · Philippines</div>
              </div>
            </div>
          )}

          {/* ── GENERATING ── */}
          {step === "generating" && (
            <div className="pg-gen">
              <div className="pg-gen-orb">🌱</div>
              <div className="pg-gen-msg">{MESSAGES[msgIndex]}</div>
              <div className="pg-track">
                <div className="pg-bar" style={{ width: `${progress}%` }} />
              </div>
              <div className="pg-gen-pct">{Math.round(progress)}%</div>
              <div className="pg-gen-steps">
                {MESSAGES.map((m, i) => (
                  <div key={i} className={`pg-step${i < msgIndex ? " done" : i === msgIndex ? " active" : ""}`}>
                    <div className="pg-step-dot" />
                    {m}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RESULT ── */}
          {step === "result" && guide && (
            <div className="pg-result">
              <div className="pg-result-badge">✓ Guide found</div>

              {/* Open book page */}
              <div className="pg-book-page">
                <div className="pg-book-page-brand">PDF Seeds</div>
                <div className="pg-book-page-title">{guide.title}</div>
                <div className="pg-book-page-rule" />
                <div className="pg-toc-heading">Contents</div>
                {guide.chapters && guide.chapters.length > 0 && (
                  <div className="pg-toc">
                    {guide.chapters.slice(0, 3).map((ch, i) => (
                      <div key={i} className="pg-toc-row">
                        <div className="pg-toc-item">
                          <span className="pg-toc-num">{ch.chapter}</span>
                          <span className="pg-toc-title">{ch.title}</span>
                        </div>
                        {ch.description && (
                          <div className="pg-toc-sub">{ch.description}</div>
                        )}
                      </div>
                    ))}
                    {guide.chapters.length > 3 && (
                      <div className="pg-toc-locked-block">
                        {guide.chapters.slice(3, 6).map((ch, i) => (
                          <div key={i} className="pg-toc-row pg-toc-row--locked">
                            <div className="pg-toc-item">
                              <span className="pg-toc-num">{ch.chapter}</span>
                              <span className="pg-toc-title">{ch.title}</span>
                            </div>
                          </div>
                        ))}
                        <div className="pg-toc-lock-icon">
                          <Lock size={13} strokeWidth={1.5} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="pg-book-page-footer">— i —</div>
              </div>

              {/* Offer */}
              {isFirstBuy && (
                <div className="pg-result-offer">
                  <span className="pg-result-offer-old">{guide.price}</span>
                  <span className="pg-result-offer-new">£2.99</span>
                  <span className="pg-result-offer-label">· First guide — intro price</span>
                </div>
              )}

              <button className="pg-result-cta" onClick={handleBuy}>
                {isFirstBuy ? "Unlock My Guide — £2.99 →" : `Unlock My Guide — ${guide.price} →`}
              </button>

              <div className="pg-result-trust">
                <span>Instant PDF</span>
                <span className="pg-result-trust-sep">·</span>
                <span>30-day money-back</span>
                <span className="pg-result-trust-sep">·</span>
                <span>Any device</span>
              </div>

              <button className="pg-result-again" onClick={reset}>Search for a different guide</button>
              <div style={{ marginTop: 14 }}>
                <button
                  style={{ background: "none", border: "none", color: "#C4BAB0", fontWeight: 600, cursor: "pointer", padding: 0, fontSize: "0.78rem" }}
                  onClick={() => setStep("waitlist")}
                >
                  Request a custom guide →
                </button>
              </div>
            </div>
          )}

          {/* ── WAITLIST ── */}
          {step === "waitlist" && (
            <div className="pg-waitlist">
              <div className="pg-waitlist-icon">📬</div>
              <div className="pg-waitlist-title">We&apos;ll build it for you</div>
              <p className="pg-waitlist-sub">
                Leave your email. We&apos;ll research the rules for your home country and build a guide for your exact situation — usually within 24 hours.
              </p>
              {situation && (
                <div className="pg-waitlist-query">&ldquo;{situation}&rdquo;</div>
              )}
              {waitlistStatus === "done" ? (
                <div className="pg-waitlist-done">
                  ✓ You&apos;re on the list! We&apos;ll email you when your guide is ready.
                </div>
              ) : (
                <div className="pg-form" style={{ marginBottom: 0 }}>
                  <form onSubmit={submitWaitlist}>
                    <div className="pg-input-wrap">
                      <input
                        className="pg-input"
                        type="email"
                        value={waitlistEmail}
                        onChange={e => setWaitlistEmail(e.target.value)}
                        placeholder="Your email address"
                        required
                        autoFocus
                      />
                      <button type="submit" className="pg-btn" disabled={waitlistStatus === "sending"}>
                        {waitlistStatus === "sending" ? "Sending…" : "Notify Me →"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              <button
                className="pg-result-again"
                onClick={reset}
                style={{ marginTop: 20, display: "block", margin: "20px auto 0" }}
              >
                ← Search again
              </button>
            </div>
          )}

        </main>

        <footer className="pg-footer">
          © {new Date().getFullYear()}{" "}PDF Seeds
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <a href="/expat" style={{ color: "#1A1008", textDecoration: "none", fontWeight: 600 }}>Expats →</a>
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <a href="/earn" style={{ color: "#1A1008", textDecoration: "none", fontWeight: 600 }}>Curators →</a>
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <a href="/signin" style={{ color: "#1A1008", textDecoration: "none", fontWeight: 600 }}>Login</a>
        </footer>

      </div>
    </>
  );
}
