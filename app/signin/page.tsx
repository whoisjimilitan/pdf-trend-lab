"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        setError("Wrong password. Try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        body > aside { display: none !important; }
        body > nav   { display: none !important; }
        body { display: flex !important; align-items: center; justify-content: center; min-height: 100vh; overflow-y: auto !important; }
        body > main  { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 100vh; padding: 24px; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Brand mark */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52,
            background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
            borderRadius: 14,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.4rem",
            boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
            marginBottom: 16,
          }}>🌱</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#111111", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 6 }}>
            Enter Your Farm
          </div>
          <div style={{ fontSize: "0.88rem", color: "#6B7280" }}>
            Your PDF income engine is waiting.
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: "32px 28px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: 8, letterSpacing: "0.02em", textTransform: "uppercase" }}>
                Farm Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoFocus
                style={{
                  width: "100%", padding: "12px 16px",
                  border: error ? "1.5px solid #EF4444" : "1.5px solid #E5E7EB",
                  borderRadius: 999,
                  fontSize: "0.95rem", color: "#111111",
                  background: "#F9FAFB", outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = "#7C3AED"; }}
                onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = "#E5E7EB"; }}
              />
              {error && (
                <div style={{ fontSize: "0.78rem", color: "#EF4444", marginTop: 6, paddingLeft: 4 }}>{error}</div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: "100%", padding: "13px",
                background: loading || !password
                  ? "#D1D5DB"
                  : "linear-gradient(135deg, #7C3AED, #4F46E5)",
                color: "#fff",
                fontWeight: 700, fontSize: "0.95rem",
                borderRadius: 999, border: "none",
                cursor: loading || !password ? "not-allowed" : "pointer",
                boxShadow: loading || !password ? "none" : "0 4px 16px rgba(124,58,237,0.3)",
                transition: "all 0.15s",
              }}
            >
              {loading ? "Opening the gate…" : "Enter the Farm →"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          PDF Seeds · Plant · Grow · Harvest
        </div>
      </div>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
