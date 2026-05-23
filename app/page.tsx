"use client";

import { useState, useRef, useEffect } from "react";

type Step = "idle" | "country" | "generating" | "result";

type Guide = {
  slug: string;
  title: string;
  price: string;
  painPoint: string;
  chapters: { chapter: string; title: string; description: string }[];
};

const MESSAGES = [
  "Reading your situation…",
  "Searching the guide library…",
  "Matching to your exact situation…",
  "Found it — verifying the details…",
  "Preparing your guide preview…",
  "Almost ready…",
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

  useEffect(() => {
    if (step === "country") countryRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step !== "generating") return;
    setMsgIndex(0);
    setProgress(0);

    const msgTimer = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, 3800);

    const progTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return p;
        return p + (p < 60 ? 2.5 : p < 80 ? 1.2 : 0.4);
      });
    }, 300);

    return () => {
      clearInterval(msgTimer);
      clearInterval(progTimer);
    };
  }, [step]);

  async function handleSituation(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!situation.trim()) return;
    setStep("country");
  }

  async function handleGenerate(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!country.trim()) return;
    setError("");
    setStep("generating");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, country }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setProgress(100);
      setTimeout(() => {
        setGuide(data as Guide);
        setStep("result");
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("country");
    }
  }

  function reset() {
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
        body { display: block !important; overflow-y: auto !important; height: auto !important; padding-bottom: 0 !important; }
        body > main { overflow: visible !important; height: auto !important; padding-bottom: 0 !important; }
        * { box-sizing: border-box; }

        .sp {
          background: #FFFFFF;
          color: #111111;
          font-family: -apple-system, "Inter", system-ui, sans-serif;
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 24px 60px;
        }

        /* ── LOGO ── */
        .sp-logo-wrap { display: flex; flex-direction: column; align-items: center; margin-bottom: 32px; }
        .sp-mark {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-radius: 14px; display: flex; align-items: center;
          justify-content: center; font-size: 1.7rem;
          box-shadow: 0 6px 24px rgba(124,58,237,0.25);
          margin-bottom: 12px;
        }
        .sp-brand { font-size: 1.6rem; font-weight: 900; color: #111111; letter-spacing: -0.04em; }
        .sp-tagline { font-size: 0.88rem; color: #9CA3AF; margin-top: 4px; }

        /* ── SEARCH BOX ── */
        .sp-box { width: 100%; max-width: 580px; }

        /* Locked situation pill */
        .sp-locked {
          display: flex; align-items: center; gap: 10px;
          background: #F5F3FF; border: 1.5px solid #DDD6FE;
          border-radius: 999px; padding: 10px 18px;
          margin-bottom: 14px; cursor: pointer;
        }
        .sp-locked-dot { width: 8px; height: 8px; border-radius: 50%; background: #7C3AED; flex-shrink: 0; }
        .sp-locked-text { font-size: 0.88rem; color: #7C3AED; font-weight: 600; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sp-locked-change { font-size: 0.75rem; color: #A78BFA; flex-shrink: 0; }

        /* Input row */
        .sp-row { display: flex; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border-radius: 999px; }
        .sp-input {
          flex: 1; border: 1.5px solid #E5E7EB; border-right: none;
          border-radius: 999px 0 0 999px;
          padding: 15px 22px; font-size: 0.95rem; color: #111111;
          outline: none; background: #FAFAFA;
          transition: border-color 0.15s, background 0.15s;
        }
        .sp-input:focus { border-color: #7C3AED; background: #FFFFFF; }
        .sp-input::placeholder { color: #C4C4C4; }
        .sp-btn {
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff; font-weight: 700; font-size: 0.9rem;
          padding: 15px 26px; border: none;
          border-radius: 0 999px 999px 0;
          cursor: pointer; white-space: nowrap;
          transition: opacity 0.15s;
        }
        .sp-btn:hover { opacity: 0.9; }
        .sp-hint {
          font-size: 0.78rem; color: #C4C4C4; text-align: center; margin-top: 12px;
        }
        .sp-error {
          font-size: 0.82rem; color: #EF4444; text-align: center; margin-top: 10px;
          background: #FEF2F2; border-radius: 8px; padding: 8px 14px;
        }

        /* ── GENERATING ── */
        .sp-gen { width: 100%; max-width: 480px; text-align: center; }
        .sp-gen-pulse {
          width: 72px; height: 72px; border-radius: 18px;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; margin: 0 auto 28px;
          animation: pulse-glow 2s ease-in-out infinite;
          box-shadow: 0 6px 24px rgba(124,58,237,0.3);
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 6px 24px rgba(124,58,237,0.3); transform: scale(1); }
          50% { box-shadow: 0 8px 36px rgba(124,58,237,0.5); transform: scale(1.04); }
        }
        .sp-gen-msg {
          font-size: 1rem; font-weight: 600; color: #111111;
          margin-bottom: 28px; min-height: 28px;
          transition: opacity 0.4s;
        }
        .sp-progress-track {
          width: 100%; height: 4px; background: #F3F4F6;
          border-radius: 999px; overflow: hidden; margin-bottom: 14px;
        }
        .sp-progress-bar {
          height: 100%;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-radius: 999px;
          transition: width 0.4s ease;
        }
        .sp-gen-steps {
          display: flex; flex-direction: column; gap: 8px; margin-top: 24px; text-align: left;
        }
        .sp-gen-step {
          display: flex; align-items: center; gap: 10px;
          font-size: 0.8rem; color: #D1D5DB;
          transition: color 0.3s;
        }
        .sp-gen-step.done { color: #6B7280; }
        .sp-gen-step.active { color: #7C3AED; font-weight: 600; }
        .sp-gen-step-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #E5E7EB; flex-shrink: 0;
          transition: background 0.3s;
        }
        .sp-gen-step.done .sp-gen-step-dot { background: #10B981; }
        .sp-gen-step.active .sp-gen-step-dot { background: #7C3AED; animation: dot-pulse 1s infinite; }
        @keyframes dot-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        /* ── RESULT ── */
        .sp-result { width: 100%; max-width: 560px; }
        .sp-result-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: #F0FDF4; border: 1px solid #DCFCE7;
          border-radius: 999px; padding: 5px 14px;
          font-size: 0.75rem; font-weight: 700; color: #16A34A;
          margin-bottom: 20px;
        }
        .sp-result-title {
          font-size: 1.35rem; font-weight: 800; color: #111111;
          line-height: 1.3; margin-bottom: 10px; letter-spacing: -0.02em;
        }
        .sp-result-pain {
          font-size: 0.88rem; color: #6B7280; line-height: 1.65;
          font-style: italic; margin-bottom: 22px;
          padding: 12px 16px; background: #FAFAFA; border-radius: 10px;
          border-left: 3px solid #DDD6FE;
        }
        .sp-inside-label {
          font-size: 0.68rem; font-weight: 700; color: #9CA3AF;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;
        }
        .sp-chapters { display: flex; flex-direction: column; gap: 0; margin-bottom: 28px;
          border: 1.5px solid #EDE9FE; border-radius: 14px; overflow: hidden;
        }
        .sp-chapter {
          display: flex; align-items: flex-start; gap: 14px;
          background: #FFFFFF; padding: 13px 16px;
          border-bottom: 1px solid #F5F3FF;
        }
        .sp-chapter:last-child { border-bottom: none; }
        .sp-chapter-num {
          font-size: 0.68rem; font-weight: 800; color: #A78BFA;
          width: 22px; flex-shrink: 0; margin-top: 2px; text-align: right;
        }
        .sp-chapter-title { font-size: 0.87rem; font-weight: 600; color: #111111; line-height: 1.4; }
        .sp-chapter-desc { font-size: 0.78rem; color: #9CA3AF; margin-top: 2px; line-height: 1.4; }
        .sp-result-cta {
          display: block; width: 100%; text-align: center;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          color: #fff; font-weight: 800; font-size: 1.05rem;
          padding: 18px; border-radius: 999px; text-decoration: none;
          box-shadow: 0 6px 24px rgba(124,58,237,0.32);
          transition: opacity 0.15s; margin-bottom: 12px;
        }
        .sp-result-cta:hover { opacity: 0.9; }
        .sp-result-trust {
          text-align: center; font-size: 0.78rem; color: #9CA3AF;
          display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
        }
        .sp-result-again {
          display: block; text-align: center; margin-top: 20px;
          font-size: 0.82rem; color: #9CA3AF; cursor: pointer;
          background: none; border: none; padding: 0;
          text-decoration: underline; text-decoration-color: #E5E7EB;
        }
        .sp-result-again:hover { color: #7C3AED; }

        /* ── FOOTER ── */
        .sp-footer {
          position: fixed; bottom: 0; left: 0; right: 0;
          display: flex; align-items: center; justify-content: center; gap: 20px;
          padding: 14px 24px;
          font-size: 0.73rem; color: #D1D5DB;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(8px);
          border-top: 1px solid #F3F4F6;
        }
        .sp-footer a { color: #C4C4C4; text-decoration: none; transition: color 0.15s; }
        .sp-footer a:hover { color: #7C3AED; }
        .sp-footer-divider { color: #E5E7EB; }
        .sp-footer-farm {
          display: inline-flex; align-items: center; gap: 5px;
          color: #9CA3AF; font-weight: 600; text-decoration: none;
          transition: color 0.15s;
        }
        .sp-footer-farm:hover { color: #7C3AED; }

        @media (max-width: 600px) {
          .sp { padding: 32px 16px 72px; justify-content: flex-start; padding-top: 60px; }
          .sp-brand { font-size: 1.3rem; }
          .sp-result-title { font-size: 1.1rem; }
        }
      `}</style>

      <div className="sp">

        {/* IDLE — situation input */}
        {step === "idle" && (
          <>
            <div className="sp-logo-wrap">
              <div className="sp-mark">🌱</div>
              <div className="sp-brand">PDF Seeds</div>
              <div className="sp-tagline">Your situation. Your guide. Instant download.</div>
            </div>
            <div className="sp-box">
              <form onSubmit={handleSituation}>
                <div className="sp-row">
                  <input
                    className="sp-input"
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="What do you need help with?"
                    autoFocus
                    required
                  />
                  <button type="submit" className="sp-btn">Find My Guide →</button>
                </div>
              </form>
              <div className="sp-hint">e.g. &ldquo;renewing my passport&rdquo; · &ldquo;registering a business&rdquo; · &ldquo;applying for a driving licence&rdquo;</div>
            </div>
          </>
        )}

        {/* COUNTRY — follow-up question */}
        {step === "country" && (
          <>
            <div className="sp-logo-wrap">
              <div className="sp-mark">🌱</div>
              <div className="sp-brand">PDF Seeds</div>
            </div>
            <div className="sp-box">
              <div className="sp-locked" onClick={reset}>
                <div className="sp-locked-dot" />
                <div className="sp-locked-text">{situation}</div>
                <div className="sp-locked-change">change ×</div>
              </div>
              <form onSubmit={handleGenerate}>
                <div className="sp-row">
                  <input
                    ref={countryRef}
                    className="sp-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Which country are you in?"
                    required
                  />
                  <button type="submit" className="sp-btn">Find My Guide →</button>
                </div>
              </form>
              {error && <div className="sp-error">{error}</div>}
              <div className="sp-hint">e.g. Nigeria · United Kingdom · Ghana · Kenya · United States</div>
            </div>
          </>
        )}

        {/* GENERATING — animation */}
        {step === "generating" && (
          <div className="sp-gen">
            <div className="sp-gen-pulse">🌱</div>
            <div className="sp-gen-msg">{MESSAGES[msgIndex]}</div>
            <div className="sp-progress-track">
              <div className="sp-progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <div className="sp-gen-steps">
              {MESSAGES.slice(0, 5).map((m, i) => (
                <div
                  key={i}
                  className={`sp-gen-step${i < msgIndex ? " done" : i === msgIndex ? " active" : ""}`}
                >
                  <div className="sp-gen-step-dot" />
                  {m}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULT — guide preview + buy */}
        {step === "result" && guide && (
          <div className="sp-result">
            <div className="sp-result-badge">
              <span>✓</span> Guide matched to your situation
            </div>
            <div className="sp-result-title">{guide.title}</div>
            <div className="sp-result-pain">&ldquo;{guide.painPoint}&rdquo;</div>

            {guide.chapters.length > 0 && (
              <>
                <div className="sp-inside-label">What&apos;s inside your guide</div>
                <div className="sp-chapters">
                  {guide.chapters.map((ch, i) => (
                    <div key={i} className="sp-chapter">
                      <div className="sp-chapter-num">{i + 1 < guide.chapters.length ? String(i + 1).padStart(2, "0") : "✓"}</div>
                      <div>
                        <div className="sp-chapter-title">{ch.title}</div>
                        {ch.description && (
                          <div className="sp-chapter-desc">{ch.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <a href={`/sell/${guide.slug}`} className="sp-result-cta">
              Get My Guide — {guide.price} →
            </a>
            <div className="sp-result-trust">
              <span>📥 Instant download</span>
              <span>🔒 30-day money-back</span>
              <span>📱 Any device</span>
            </div>
            <button className="sp-result-again" onClick={reset}>
              Search for a different guide
            </button>
          </div>
        )}

      </div>

      <footer className="sp-footer">
        <span>© {new Date().getFullYear()} PDF Seeds</span>
        <span className="sp-footer-divider">·</span>
        <a href="/signin" className="sp-footer-farm">🌱 Farm login</a>
      </footer>
    </>
  );
}
