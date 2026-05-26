"use client";

import { useState } from "react";
import CopyButton from "./CopyButton";

const COUNTRIES = [
  { value: "United Kingdom", label: "🇬🇧 UK" },
  { value: "Ghana",          label: "🇬🇭 Ghana" },
  { value: "Nigeria",        label: "🇳🇬 Nigeria" },
  { value: "Kenya",          label: "🇰🇪 Kenya" },
  { value: "South Africa",   label: "🇿🇦 South Africa" },
  { value: "Canada",         label: "🇨🇦 Canada" },
  { value: "Australia",      label: "🇦🇺 Australia" },
  { value: "United States",  label: "🇺🇸 United States" },
];

const OTHER = "__other__";

type Result = {
  slug: string;
  title: string;
  price: string;
  cached?: boolean;
};

const SITE = "https://pdfseeds.com";

export default function GenerateGuide({ partnerCode }: { partnerCode: string }) {
  const [question, setQuestion]     = useState("");
  const [country, setCountry]       = useState("United Kingdom");
  const [otherCountry, setOtherCountry] = useState("");
  const [showOther, setShowOther]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<Result | null>(null);
  const [error, setError]           = useState("");

  const effectiveCountry = showOther ? otherCountry.trim() || "United Kingdom" : country;

  const guideLink = result ? `${SITE}/sell/${result.slug}?ref=${partnerCode}` : "";
  const waMessage = result
    ? `Someone in the group asked about this — found a guide that covers it properly: ${guideLink}`
    : "";

  async function generate() {
    if (!question.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: question.trim(), country: effectiveCountry, brand: "pdfseeds" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Try again.");
      setResult(data as Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginBottom: 32 }}>

      <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9B8AF0", marginBottom: 14 }}>
        Answer a question
      </div>
      <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1A1008", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
        Turn any question into a guide
      </div>
      <p style={{ fontSize: "0.83rem", color: "#8C7D6E", margin: "0 0 18px", lineHeight: 1.6 }}>
        Paste the question someone just asked in your group. We generate a professional guide in seconds — with your referral link ready to share.
      </p>

      {/* Question input */}
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={`e.g. "Does anyone know how the UK spouse visa process works?" or "Can someone explain HMRC self-assessment for first timers?"`}
        rows={3}
        style={{
          width: "100%",
          background: "#FFFFFF",
          border: "1.5px solid #DDD6FE",
          borderRadius: 12,
          padding: "14px 16px",
          fontSize: "0.88rem",
          color: "#1A1008",
          lineHeight: 1.6,
          outline: "none",
          resize: "vertical",
          fontFamily: "inherit",
          boxSizing: "border-box",
          marginBottom: 12,
        }}
      />

      {/* Country picker */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: showOther ? 10 : 16 }}>
        {COUNTRIES.map((c) => (
          <button
            key={c.value}
            onClick={() => { setCountry(c.value); setShowOther(false); }}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              border: !showOther && country === c.value ? "1.5px solid #8B5CF6" : "1px solid #EAE6E0",
              background: !showOther && country === c.value ? "#F5F3FF" : "#FFFFFF",
              color: !showOther && country === c.value ? "#7C3AED" : "#8C7D6E",
              transition: "all 0.15s",
            }}
          >
            {c.label}
          </button>
        ))}
        <button
          key={OTHER}
          onClick={() => setShowOther(true)}
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            border: showOther ? "1.5px solid #8B5CF6" : "1px solid #EAE6E0",
            background: showOther ? "#F5F3FF" : "#FFFFFF",
            color: showOther ? "#7C3AED" : "#8C7D6E",
            transition: "all 0.15s",
          }}
        >
          🌍 Other
        </button>
      </div>
      {showOther && (
        <input
          type="text"
          value={otherCountry}
          onChange={(e) => setOtherCountry(e.target.value)}
          placeholder="Type your country, e.g. India, Jamaica, Philippines…"
          style={{
            width: "100%",
            background: "#FFFFFF",
            border: "1.5px solid #8B5CF6",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: "0.88rem",
            color: "#1A1008",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
            marginBottom: 16,
          }}
        />
      )}

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={loading || !question.trim() || (showOther && !otherCountry.trim())}
        style={{
          width: "100%",
          padding: "14px 24px",
          background: loading || !question.trim() || (showOther && !otherCountry.trim()) ? "#C4C0D8" : "linear-gradient(135deg, #8B5CF6, #6D28D9)",
          color: "#FFFFFF",
          border: "none",
          borderRadius: 12,
          fontSize: "0.95rem",
          fontWeight: 700,
          cursor: loading || !question.trim() || (showOther && !otherCountry.trim()) ? "not-allowed" : "pointer",
          boxShadow: loading || !question.trim() || (showOther && !otherCountry.trim()) ? "none" : "0 4px 16px rgba(139,92,246,0.35)",
          transition: "all 0.2s",
        }}
      >
        {loading ? "Generating guide…" : "Generate guide & get my link →"}
      </button>

      {/* Loading message */}
      {loading && (
        <p style={{ fontSize: "0.78rem", color: "#9B8AF0", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
          Writing a step-by-step guide for your community — this takes about 30 seconds.
        </p>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: 14, padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: "0.83rem", color: "#B91C1C" }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ marginTop: 20, background: "#F5F3FF", border: "1.5px solid #DDD6FE", borderRadius: 14, padding: "20px 22px" }}>
          {result.cached && (
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#7C3AED", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <span>⚡</span> Guide already exists — your link is ready
            </div>
          )}

          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1A1008", marginBottom: 4, lineHeight: 1.4 }}>
            {result.title}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#8C7D6E", marginBottom: 16 }}>
            {result.price} · you earn 80% · £{(parseFloat(result.price.replace("£", "")) * 0.8).toFixed(2)} per sale
          </div>

          {/* Guide link */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9B8AF0", marginBottom: 6 }}>
              Your referral link
            </div>
            <div style={{ background: "#FFFFFF", border: "1px solid #DDD6FE", borderRadius: 8, padding: "10px 14px", fontSize: "0.78rem", color: "#4B3D30", wordBreak: "break-all", marginBottom: 8 }}>
              {guideLink}
            </div>
            <CopyButton text={guideLink} label="Copy link" />
          </div>

          {/* Ready-to-send WhatsApp message */}
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9B8AF0", marginBottom: 6 }}>
              Ready to paste in WhatsApp
            </div>
            <div style={{ background: "#FFFFFF", border: "1px solid #DDD6FE", borderRadius: 8, padding: "10px 14px", fontSize: "0.83rem", color: "#4B3D30", lineHeight: 1.65, marginBottom: 8 }}>
              {waMessage}
            </div>
            <CopyButton text={waMessage} label="Copy message" />
          </div>

          {/* Preview link */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #DDD6FE" }}>
            <a
              href={`${SITE}/sell/${result.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "0.78rem", color: "#7C3AED", fontWeight: 600, textDecoration: "none" }}
            >
              Preview guide page ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
