"use client";

import { useState } from "react";

export default function EmailCapture({ slug, country }: { slug: string; country: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productSlug: slug, country, source: "guide-page" }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div style={{
        background: "#10B98110", border: "1px solid #10B98130", borderRadius: 12,
        padding: "20px 24px", margin: "32px 0", textAlign: "center",
      }}>
        <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>✅</div>
        <div style={{ fontWeight: 700, color: "#10B981", marginBottom: 4 }}>You&apos;re on the list</div>
        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
          We&apos;ll send you the first 3 pages free, plus new guides as they drop.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "#1e293b", border: "1px solid #334155", borderRadius: 12,
      padding: "24px", margin: "32px 0",
    }}>
      <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 6, fontSize: "1rem" }}>
        Not ready to buy? Get the first 3 pages free.
      </div>
      <div style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 16 }}>
        Enter your email — we&apos;ll send it instantly, plus new guides when they drop.
      </div>
      <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com" required
          style={{
            flex: 1, minWidth: 200, padding: "10px 14px", borderRadius: 8,
            background: "#0f1117", border: "1px solid #334155", color: "#e2e8f0",
            fontSize: "0.9rem", outline: "none",
          }}
        />
        <button type="submit" disabled={state === "loading"}
          style={{
            padding: "10px 22px", borderRadius: 8, background: "#6366F1", color: "#fff",
            fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: "pointer",
            opacity: state === "loading" ? 0.6 : 1, flexShrink: 0,
          }}>
          {state === "loading" ? "Sending…" : "Send me the preview"}
        </button>
      </form>
      {state === "error" && (
        <div style={{ color: "#EF4444", fontSize: "0.8rem", marginTop: 8 }}>
          Something went wrong — try again.
        </div>
      )}
    </div>
  );
}
