"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Step = "idle" | "country" | "generating" | "result" | "checkout" | "paid";

type Guide = {
  slug: string;
  title: string;
  price: string;
  painPoint: string;
  chapters: { chapter: string; title: string; description: string }[];
};

const MESSAGES = [
  "Searching our library…",
  "Found a match — checking the details…",
  "Getting your PDF file…",
];

export default function HomePage() {
  const [step, setStep] = useState<Step>("idle");
  const [situation, setSituation] = useState("");
  const [country, setCountry] = useState("");
  const [guide, setGuide] = useState<Guide | null>(null);
  const [error, setError] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const countryRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (step === "country") countryRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step !== "generating") return;
    setMsgIndex(0);
    setProgress(0);
    const msgTimer = setInterval(() => setMsgIndex(i => Math.min(i + 1, MESSAGES.length - 1)), 5000);
    const progTimer = setInterval(() => {
      setProgress(p => p >= 90 ? p : p + (p < 50 ? 2 : p < 75 ? 1 : 0.3));
    }, 300);
    return () => { clearInterval(msgTimer); clearInterval(progTimer); };
  }, [step]);

  function handleSituation(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!situation.trim()) return;
    setStep("country");
  }

  async function handleGenerate(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!country.trim()) return;
    setError("");
    setStep("generating");
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

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    if (!guide) throw new Error("No guide selected");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: guide.slug }),
    });
    const data = await res.json();
    if (!data.clientSecret) throw new Error("Could not initialise payment");
    return data.clientSecret as string;
  }, [guide]);

  function reset() {
    abortRef.current?.abort();
    setStep("idle");
    setSituation("");
    setCountry("");
    setGuide(null);
    setError("");
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
          font-family: -apple-system, "Inter", system-ui, sans-serif;
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
          display: inline-block;
          font-size: 0.72rem; font-weight: 700;
          color: #9B8AF0; letter-spacing: 0.12em;
          text-transform: uppercase; margin-bottom: 20px;
        }
        .pg-hero-h1 {
          font-size: clamp(2rem, 6vw, 3.2rem);
          font-weight: 900;
          color: #1A1008;
          line-height: 1.1;
          letter-spacing: -0.04em;
          margin: 0 0 14px;
          max-width: 540px;
        }
        .pg-hero-sub {
          font-size: clamp(0.95rem, 2.5vw, 1.05rem);
          color: #8C7D6E;
          line-height: 1.7;
          margin: 0 0 40px;
          max-width: 400px;
        }
        .pg-form {
          width: 100%;
          max-width: 520px;
        }
        .pg-input-wrap {
          background: #FFFFFF;
          border: 1.5px solid #EAE6E0;
          border-radius: 16px;
          padding: 6px 6px 6px 20px;
          display: flex;
          align-items: center;
          gap: 8px;
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
          border-radius: 999px; overflow: hidden; margin-bottom: 32px;
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
          margin-bottom: 24px; letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .pg-result-title {
          font-size: clamp(1.2rem, 3.5vw, 1.55rem);
          font-weight: 800; color: #1A1008;
          line-height: 1.3; margin-bottom: 32px;
          letter-spacing: -0.02em;
        }
        .pg-result-cta {
          display: block; width: 100%;
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          color: #fff; font-weight: 800; font-size: 1.1rem;
          padding: 20px; border-radius: 16px;
          border: none; cursor: pointer;
          box-shadow: 0 8px 28px rgba(124,58,237,0.35);
          transition: opacity 0.15s, transform 0.1s;
          margin-bottom: 14px;
          letter-spacing: -0.01em;
        }
        .pg-result-cta:hover { opacity: 0.92; }
        .pg-result-cta:active { transform: scale(0.99); }
        .pg-result-trust {
          display: flex; gap: 20px; justify-content: center;
          font-size: 0.78rem; color: #B0A89A;
          flex-wrap: wrap; margin-bottom: 28px;
        }
        .pg-result-again {
          font-size: 0.82rem; color: #C4BAB0;
          background: none; border: none; cursor: pointer;
          padding: 0; text-decoration: underline;
          text-decoration-color: #E8E4DE;
          transition: color 0.15s;
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

        /* ── FOOTER ── */
        .pg-footer {
          text-align: center; padding: 16px 24px;
          font-size: 0.72rem; color: #D4CEC8;
          border-top: 1px solid #EEE9E2;
        }

        /* ── RESPONSIVE: TABLET / IPAD (601–1024px) ── */
        @media (min-width: 601px) and (max-width: 1024px) {
          .pg-header { padding: 22px 40px; }
          .pg-main { padding: 60px 48px 100px; }
          .pg-hero-h1 { font-size: clamp(2rem, 4.5vw, 2.8rem); max-width: 600px; }
          .pg-hero-sub { max-width: 480px; }
          .pg-form { max-width: 560px; }
          .pg-gen { max-width: 440px; }
          .pg-result { max-width: 540px; }
          .pg-checkout { max-width: 560px; }
          .pg-paid { max-width: 480px; }
          .pg-result-cta { padding: 22px; font-size: 1.15rem; }
          .pg-btn { padding: 14px 26px; font-size: 0.95rem; }
        }

        /* ── RESPONSIVE: MOBILE (≤ 600px) ── */
        @media (max-width: 600px) {
          .pg-header { padding: 16px 20px; }
          .pg-logo-name { font-size: 0.9rem; }

          .pg-main {
            padding: 44px 20px 80px;
            justify-content: flex-start;
          }

          .pg-hero-eyebrow { margin-bottom: 12px; font-size: 0.68rem; }
          .pg-hero-h1 {
            font-size: 1.85rem;
            letter-spacing: -0.03em;
            max-width: 100%;
            margin-bottom: 12px;
          }
          .pg-hero-sub {
            font-size: 0.9rem;
            max-width: 100%;
            margin-bottom: 28px;
          }

          .pg-form { max-width: 100%; }
          .pg-input-wrap { border-radius: 14px; padding: 5px 5px 5px 16px; }
          .pg-input { font-size: 1rem; padding: 10px 0; }
          .pg-btn { padding: 13px 16px; font-size: 0.85rem; min-height: 48px; border-radius: 10px; }
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
          .pg-result-title { font-size: 1.2rem; margin-bottom: 24px; }
          .pg-result-cta { padding: 18px; font-size: 1rem; min-height: 58px; border-radius: 14px; }
          .pg-result-trust { gap: 12px; font-size: 0.74rem; margin-bottom: 20px; }

          .pg-checkout { max-width: 100%; }
          .pg-checkout-back { min-height: 44px; }

          .pg-paid { max-width: 100%; }
          .pg-paid-orb { width: 60px; height: 60px; font-size: 1.6rem; border-radius: 16px; }
          .pg-paid-title { font-size: 1.3rem; }
          .pg-paid-sub { font-size: 0.88rem; }
          .pg-paid-btn { display: block; text-align: center; padding: 16px 24px; font-size: 0.95rem; }

          .pg-footer { padding: 14px 20px; font-size: 0.7rem; }
        }

        /* ── RESPONSIVE: SMALL PHONES (≤ 380px — iPhone SE, etc) ── */
        @media (max-width: 380px) {
          .pg-header { padding: 14px 16px; }
          .pg-main { padding: 36px 16px 72px; }
          .pg-hero-h1 { font-size: 1.6rem; }
          .pg-hero-sub { font-size: 0.86rem; }
          .pg-btn { padding: 12px 12px; font-size: 0.8rem; }
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
              <span className="pg-hero-eyebrow">Step-by-step guides for the hard stuff</span>
              <h1 className="pg-hero-h1">Stop Googling. There&apos;s a PDF guide for that.</h1>
              <p className="pg-hero-sub">
                If you&apos;ve Googled it, we&apos;ve already written the guide.
              </p>
              <div className="pg-form">
                <form onSubmit={handleSituation}>
                  <div className="pg-input-wrap">
                    <input
                      className="pg-input"
                      value={situation}
                      onChange={e => setSituation(e.target.value)}
                      placeholder="What do you keep Googling?"
                      autoFocus
                      required
                    />
                    <button type="submit" className="pg-btn">Search →</button>
                  </div>
                </form>
                <div className="pg-hint">
                  e.g. &ldquo;How do I register a business in Ghana?&rdquo;
                  &nbsp;&nbsp;·&nbsp;&nbsp;
                  <span style={{ color: "#9B8AF0", fontWeight: 600 }}>Over 2M guides written</span>
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
              <p className="pg-country-label">Which country are you in?</p>
              <div className="pg-form">
                <form onSubmit={handleGenerate}>
                  <div className="pg-input-wrap pg-input-wrap--deep">
                    <input
                      ref={countryRef}
                      className="pg-input"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      placeholder="Type your country"
                      required
                    />
                    <button type="submit" className="pg-btn pg-btn--deep">Find My Guide →</button>
                  </div>
                </form>
                {error && <div className="pg-error">{error}</div>}
                <div className="pg-hint">Nigeria · United Kingdom · Ghana · Kenya · United States · Canada</div>
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
              <div className="pg-result-title">{guide.title}</div>
              <button className="pg-result-cta" onClick={() => setStep("checkout")}>
                Get My Guide — {guide.price} →
              </button>
              <div className="pg-result-trust">
                <span>📥 Instant download</span>
                <span>🔒 30-day money-back</span>
                <span>📱 Any device</span>
              </div>
              <button className="pg-result-again" onClick={reset}>Search for a different guide</button>
            </div>
          )}

          {/* ── CHECKOUT ── */}
          {step === "checkout" && guide && (
            <div className="pg-checkout">
              <button className="pg-checkout-back" onClick={() => setStep("result")}>
                ← Back
              </button>
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ fetchClientSecret, onComplete: () => setStep("paid") }}
              >
                <div className="pg-checkout-stripe">
                  <EmbeddedCheckout />
                </div>
              </EmbeddedCheckoutProvider>
            </div>
          )}

          {/* ── PAID ── */}
          {step === "paid" && guide && (
            <div className="pg-paid">
              <div className="pg-paid-orb">🌾</div>
              <div className="pg-paid-title">Your guide is ready</div>
              <div className="pg-paid-sub">
                Check your email for your receipt and download link.<br />
                You can also open it right now.
              </div>
              <a href={`/guide/${guide.slug}`} className="pg-paid-btn">Open My Guide →</a>
            </div>
          )}

        </main>

        <footer className="pg-footer">
          © {new Date().getFullYear()} PDF Seeds
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <a href="/earn" style={{ color: "#B0A89A", textDecoration: "none" }}>Want to earn from guides? →</a>
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <a href="/signin" style={{ color: "#C4BAB0", textDecoration: "none" }}>Farm login</a>
        </footer>

      </div>
    </>
  );
}
