"use client";

import { useState } from "react";

const COUNTRIES = [
  { value: "GH", label: "Ghana",        flag: "🇬🇭" },
  { value: "NG", label: "Nigeria",       flag: "🇳🇬" },
  { value: "KE", label: "Kenya",         flag: "🇰🇪" },
  { value: "ZA", label: "South Africa",  flag: "🇿🇦" },
  { value: "GB", label: "UK Diaspora",   flag: "🇬🇧" },
  { value: "CA", label: "Canada",        flag: "🇨🇦" },
  { value: "AU", label: "Australia",     flag: "🇦🇺" },
  { value: "US", label: "United States", flag: "🇺🇸" },
];

const PLATFORMS = [
  { value: "whatsapp",   label: "WhatsApp",   icon: "💬", color: "#25D366" },
  { value: "youtube",    label: "YouTube",    icon: "▶",  color: "#FF0000" },
  { value: "tiktok",     label: "TikTok",     icon: "♪",  color: "#374151" },
  { value: "instagram",  label: "Instagram",  icon: "📸", color: "#E1306C" },
  { value: "newsletter", label: "Newsletter", icon: "✉️", color: "#7C3AED" },
];

const TOPICS = [
  { value: "passports",  label: "Passports & Documents", icon: "🛂" },
  { value: "property",   label: "Property & Real Estate", icon: "🏡" },
  { value: "business",   label: "Business Registration",  icon: "🏢" },
  { value: "healthcare", label: "Healthcare",             icon: "🏥" },
  { value: "education",  label: "Education",              icon: "📚" },
  { value: "finance",    label: "Finance & Banking",      icon: "💰" },
  { value: "legal",      label: "Legal & Immigration",    icon: "⚖️" },
  { value: "farming",    label: "Farming & Agriculture",  icon: "🌱" },
];

export default function OnboardForm({ code }: { code: string }) {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState("");
  const [platform, setPlatform] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleTopic(value: string) {
    setTopics((prev) => {
      if (prev.includes(value)) return prev.filter((t) => t !== value);
      if (prev.length >= 3) return prev;
      return [...prev, value];
    });
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/curator/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          communityCountry: country,
          platform,
          communityTopics: topics,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = `/curator/${code}`;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const progressPct = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FFFFFF; font-family: -apple-system, "Inter", system-ui, sans-serif; color: #1A1008; }
        .ob { max-width: 480px; margin: 0 auto; padding: 40px 24px 80px; }
        .ob-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 40px; }
        .ob-logo-mark { width: 32px; height: 32px; background: linear-gradient(135deg,#7C3AED,#4F46E5); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; color: #fff; }
        .ob-logo-name { font-size: 0.95rem; font-weight: 800; color: #1A1008; letter-spacing: -0.02em; }
        .ob-progress-track { height: 4px; background: #EDE9FE; border-radius: 999px; overflow: hidden; margin-bottom: 36px; }
        .ob-progress-fill { height: 100%; background: linear-gradient(90deg, #7C3AED, #A78BFA); border-radius: 999px; transition: width 0.4s ease; }
        .ob-step-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9B8AF0; margin-bottom: 10px; }
        .ob-heading { font-size: 1.4rem; font-weight: 900; color: #1A1008; letter-spacing: -0.03em; margin-bottom: 28px; line-height: 1.25; }
        .ob-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 28px; }
        .ob-grid-3 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 28px; }
        .ob-tile { border: 1.5px solid #E5E7EB; border-radius: 12px; padding: 14px 16px; cursor: pointer; transition: border-color 0.15s, background 0.15s; background: #FFFFFF; text-align: left; display: flex; align-items: center; gap: 12px; }
        .ob-tile:hover { border-color: #C4B5FD; background: #FAF5FF; }
        .ob-tile.selected { border-color: #7C3AED; background: #F5F3FF; }
        .ob-tile-flag { font-size: 1.4rem; flex-shrink: 0; }
        .ob-tile-label { font-size: 0.88rem; font-weight: 600; color: #1A1008; }
        .ob-platform-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 28px; }
        .ob-platform-tile { border: 1.5px solid #E5E7EB; border-radius: 12px; padding: 16px 20px; cursor: pointer; transition: border-color 0.15s, background 0.15s; background: #FFFFFF; display: flex; align-items: center; gap: 14px; }
        .ob-platform-tile:hover { border-color: #C4B5FD; background: #FAF5FF; }
        .ob-platform-tile.selected { border-color: #7C3AED; background: #F5F3FF; }
        .ob-platform-icon { font-size: 1.3rem; flex-shrink: 0; width: 28px; text-align: center; }
        .ob-platform-name { font-size: 0.92rem; font-weight: 700; color: #1A1008; }
        .ob-topic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
        .ob-topic-tile { border: 1.5px solid #E5E7EB; border-radius: 12px; padding: 14px 14px; cursor: pointer; transition: border-color 0.15s, background 0.15s; background: #FFFFFF; display: flex; align-items: center; gap: 10px; }
        .ob-topic-tile:hover { border-color: #C4B5FD; background: #FAF5FF; }
        .ob-topic-tile.selected { border-color: #7C3AED; background: #F5F3FF; }
        .ob-topic-icon { font-size: 1.15rem; flex-shrink: 0; }
        .ob-topic-label { font-size: 0.82rem; font-weight: 600; color: #1A1008; line-height: 1.3; }
        .ob-topic-hint { font-size: 0.75rem; color: #9B8AF0; margin-bottom: 20px; }
        .ob-btn { width: 100%; padding: 15px 24px; background: #7C3AED; color: #FFFFFF; border: none; border-radius: 12px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .ob-btn:hover { background: #6D28D9; }
        .ob-btn:disabled { background: #C4B5FD; cursor: not-allowed; }
        .ob-error { font-size: 0.82rem; color: #DC2626; margin-top: 12px; text-align: center; }
        @media (max-width: 400px) {
          .ob { padding: 28px 16px 64px; }
          .ob-grid, .ob-topic-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ob">
        <a href="/" className="ob-logo">
          <div className="ob-logo-mark">🌱</div>
          <span className="ob-logo-name">PDF Seeds</span>
        </a>

        <div className="ob-progress-track">
          <div className="ob-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {step === 1 && (
          <>
            <div className="ob-step-label">Step 1 of 3</div>
            <div className="ob-heading">Where is your community from?</div>
            <div className="ob-grid">
              {COUNTRIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`ob-tile${country === c.value ? " selected" : ""}`}
                  onClick={() => setCountry(c.value)}
                >
                  <span className="ob-tile-flag">{c.flag}</span>
                  <span className="ob-tile-label">{c.label}</span>
                </button>
              ))}
            </div>
            <button
              className="ob-btn"
              disabled={!country}
              onClick={() => setStep(2)}
            >
              Next →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="ob-step-label">Step 2 of 3</div>
            <div className="ob-heading">Where do you primarily share?</div>
            <div className="ob-platform-grid">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`ob-platform-tile${platform === p.value ? " selected" : ""}`}
                  onClick={() => setPlatform(p.value)}
                >
                  <span className="ob-platform-icon" style={{ color: p.color }}>{p.icon}</span>
                  <span className="ob-platform-name">{p.label}</span>
                </button>
              ))}
            </div>
            <button
              className="ob-btn"
              disabled={!platform}
              onClick={() => setStep(3)}
            >
              Next →
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="ob-step-label">Step 3 of 3</div>
            <div className="ob-heading">What does your community ask you about most?</div>
            <div className="ob-topic-hint">Pick up to 3 topics</div>
            <div className="ob-topic-grid">
              {TOPICS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`ob-topic-tile${topics.includes(t.value) ? " selected" : ""}`}
                  onClick={() => toggleTopic(t.value)}
                >
                  <span className="ob-topic-icon">{t.icon}</span>
                  <span className="ob-topic-label">{t.label}</span>
                </button>
              ))}
            </div>
            <button
              className="ob-btn"
              disabled={topics.length === 0 || loading}
              onClick={handleSubmit}
            >
              {loading ? "Setting up your dashboard..." : "Set up my dashboard"}
            </button>
            {error && <div className="ob-error">{error}</div>}
          </>
        )}
      </div>
    </>
  );
}
