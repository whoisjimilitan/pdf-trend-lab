"use client";

import { useState } from "react";

export default function GenerateCuratorGuides({ code }: { code: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/curator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      window.location.reload();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          background: "none",
          border: "1.5px solid #DDD6FE",
          borderRadius: 10,
          padding: "9px 16px",
          fontSize: "0.82rem",
          fontWeight: 600,
          color: loading ? "#C4B5FD" : "#7C3AED",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "border-color 0.15s, color 0.15s",
        }}
      >
        {loading ? "Scanning for guides..." : "Find more guides for my community →"}
      </button>
      {error && (
        <div style={{ fontSize: "0.78rem", color: "#DC2626", marginTop: 8 }}>{error}</div>
      )}
    </div>
  );
}
