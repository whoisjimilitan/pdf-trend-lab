"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Product = {
  id: string;
  opportunityId: string;
  title: string;
  slug: string;
  pdfContent: string;
  salesPageCopy: string;
  seoPageContent: string;
  status: string;
  published: boolean;
  salesCount: number;
  revenue: number;
  gumroadUrl: string;
  opportunity: {
    keyword: string;
    pdfTitle: string;
    niche: string;
    minPrice: number;
    maxPrice: number;
    country: string;
  };
};

type Hook = { id: string; text: string; platform: string; emotionType: string };

const PLATFORM_ICON: Record<string, string> = {
  tiktok: "🎵", instagram: "📸", pinterest: "📌", email: "📧", twitter: "🐦",
};

function GuidesContent() {
  const params = useSearchParams();
  const opportunityId = params.get("id");

  const [guides, setGuides]         = useState<Product[]>([]);
  const [hooks, setHooks]           = useState<Hook[]>([]);
  const [selected, setSelected]     = useState<Product | null>(null);
  const [growing, setGrowing]       = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied]         = useState("");
  const [hooksOpen, setHooksOpen]   = useState(false);
  const [payUrl, setPayUrl]         = useState("");
  const [payUrlSaving, setPayUrlSaving] = useState(false);
  const [payUrlSaved, setPayUrlSaved]   = useState(false);
  const [deleting, setDeleting]         = useState(false);

  const load = useCallback(async () => {
    const [gRes, hRes] = await Promise.all([fetch("/api/factory"), fetch("/api/hooks")]);
    const [gs, hs]     = await Promise.all([gRes.json(), hRes.json()]);
    if (Array.isArray(gs)) {
      setGuides(gs);
      if (opportunityId) {
        const match = gs.find((g: Product) => g.opportunityId === opportunityId || g.id === opportunityId);
        if (match) { setSelected(match); setPayUrl(match.gumroadUrl ?? ""); }
      }
    }
    if (Array.isArray(hs)) setHooks(hs);
  }, [opportunityId]);

  useEffect(() => { load(); }, [load]);

  async function grow() {
    if (!opportunityId) return;
    setGrowing(true);
    try {
      await fetch("/api/factory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId }),
      });
      await load();
    } finally { setGrowing(false); }
  }

  async function toggleLive(g: Product) {
    setPublishing(true);
    try {
      const res = await fetch(`/api/products/${g.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !g.published }),
      });
      const updated = await res.json();
      setGuides((prev) => prev.map((x) => x.id === g.id ? { ...x, ...updated } : x));
      setSelected((prev) => prev?.id === g.id ? { ...prev, ...updated } : prev);
    } finally { setPublishing(false); }
  }

  async function deleteGuide(g: Product) {
    if (!window.confirm(`Delete "${g.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/products/${g.id}`, { method: "DELETE" });
      setSelected(null);
      await load();
    } finally { setDeleting(false); }
  }

  async function savePayUrl(g: Product) {
    if (!payUrl.trim()) return;
    setPayUrlSaving(true);
    try {
      const res = await fetch(`/api/products/${g.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gumroadUrl: payUrl.trim() }),
      });
      const updated = await res.json();
      setGuides((prev) => prev.map((x) => x.id === g.id ? { ...x, ...updated } : x));
      setSelected((prev) => prev?.id === g.id ? { ...prev, ...updated } : prev);
      setPayUrlSaved(true);
      setTimeout(() => setPayUrlSaved(false), 3000);
    } finally { setPayUrlSaving(false); }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  const guideHooks = selected
    ? hooks.filter((h) =>
        h.text.toLowerCase().includes(
          selected.opportunity?.keyword?.toLowerCase()?.split(" ")[0] ?? ""
        )
      ).slice(0, 6)
    : [];

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const card: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    padding: "20px",
  };

  const btn = (variant: "primary" | "ghost"): React.CSSProperties => ({
    display: "inline-block",
    padding: "9px 18px",
    borderRadius: 9,
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
    border: variant === "ghost" ? "1px solid var(--border)" : "none",
    background: variant === "primary" ? "var(--accent)" : "var(--surface2)",
    color: variant === "primary" ? "#fff" : "var(--muted)",
  });

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>

      {/* Guide list */}
      <div style={{ width: 240, flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--surface)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>
            Guides {guides.length > 0 && <span style={{ color: "var(--muted)", fontWeight: 500 }}>({guides.length})</span>}
          </div>
        </div>

        {guides.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: 10 }}>📄</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.6 }}>
              No guides yet. Go to Seeds, pick an opportunity, and grow your first one.
            </div>
          </div>
        ) : guides.map((g) => (
          <div key={g.id}
            onClick={() => { setSelected(g); setPayUrl(g.gumroadUrl ?? ""); setHooksOpen(false); }}
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              cursor: "pointer",
              background: selected?.id === g.id ? "var(--surface2)" : "transparent",
            }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text)", marginBottom: 4, lineHeight: 1.4 }}>
              {g.title}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {g.published ? (
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#16A34A", background: "#DCFCE7", border: "1px solid #BBF7D0", padding: "1px 7px", borderRadius: 20 }}>
                  🟢 Live
                </span>
              ) : (
                <span style={{ fontSize: "0.65rem", color: "var(--muted)", background: "var(--surface2)", padding: "1px 7px", borderRadius: 20 }}>
                  Draft
                </span>
              )}
              {g.salesCount > 0 && (
                <span style={{ fontSize: "0.65rem", color: "var(--amber)", fontWeight: 600 }}>
                  £{g.revenue.toFixed(0)} earned
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Guide detail */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px", background: "var(--bg)" }}>

        {/* Generate prompt */}
        {opportunityId && !selected && (
          <div style={{ ...card, maxWidth: 560, marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: 12 }}>🌱</div>
            <div style={{ fontSize: "0.97rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
              Ready to grow this seed.
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0 0 20px", lineHeight: 1.7 }}>
              One click generates your PDF guide, buy page, Google article, and social posts.
            </p>
            <button onClick={grow} disabled={growing}
              style={{ ...btn("primary"), opacity: growing ? 0.7 : 1, cursor: growing ? "not-allowed" : "pointer" }}>
              {growing ? "Growing your guide…" : "Grow This Seed →"}
            </button>
          </div>
        )}

        {!selected && !opportunityId && (
          <div style={{ maxWidth: 560, textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: "2rem", marginBottom: 14 }}>📄</div>
            <div style={{ fontSize: "0.97rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
              Select a guide to see its details.
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.7 }}>
              Or go to Seeds to find a new opportunity.
            </p>
          </div>
        )}

        {selected && (
          <div style={{ maxWidth: 560 }}>

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text)", margin: "0 0 12px", lineHeight: 1.35, letterSpacing: "-0.01em" }}>
                {selected.title}
              </h1>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => toggleLive(selected)} disabled={publishing}
                  style={{
                    padding: "8px 18px", borderRadius: 9, fontSize: "0.82rem", fontWeight: 700, cursor: publishing ? "not-allowed" : "pointer", border: "none",
                    background: selected.published ? "#DCFCE7" : "var(--accent)",
                    color: selected.published ? "#16A34A" : "#fff",
                    opacity: publishing ? 0.7 : 1,
                  }}>
                  {publishing ? "…" : selected.published ? "🟢 Live" : "Go Live →"}
                </button>
                {selected.salesCount > 0 && (
                  <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    {selected.salesCount} sale{selected.salesCount !== 1 ? "s" : ""} · £{selected.revenue.toFixed(0)} earned
                  </span>
                )}
                <button onClick={() => deleteGuide(selected)} disabled={deleting}
                  style={{ marginLeft: "auto", padding: "8px 14px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", border: "1px solid #FECACA", background: "transparent", color: "#DC2626", opacity: deleting ? 0.5 : 1 }}>
                  {deleting ? "…" : "Delete"}
                </button>
              </div>
            </div>

            {/* 4 action cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* PDF Guide */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>📄 PDF Guide</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Your complete guide, ready to download and sell.</div>
                  </div>
                  {selected.slug && (
                    <a href={`/guide/${selected.slug}/pdf`} target="_blank" rel="noopener noreferrer" style={btn("primary")}>
                      Download
                    </a>
                  )}
                </div>
              </div>

              {/* Buy Page */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: selected.slug ? 14 : 0 }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>🛒 Buy Page</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Share this link. Put it in your bio. This is where people buy.</div>
                  </div>
                  {selected.slug && (
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <a href={`/sell/${selected.slug}`} target="_blank" rel="noopener noreferrer" style={btn("ghost")}>View</a>
                      <button onClick={() => copy(`${origin}/sell/${selected.slug}`, "buylink")} style={btn("primary")}>
                        {copied === "buylink" ? "✓ Copied" : "Copy Link"}
                      </button>
                    </div>
                  )}
                </div>
                {selected.slug && (
                  <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 8 }}>
                      {selected.gumroadUrl ? "✅ Payment link connected" : "Add a payment link so buyers can check out"}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="url"
                        value={payUrl}
                        onChange={(e) => setPayUrl(e.target.value)}
                        placeholder={selected.gumroadUrl || "Paste your Gumroad / Payhip / Selar link"}
                        style={{ flex: 1, fontSize: "0.78rem", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }}
                      />
                      <button onClick={() => savePayUrl(selected)} disabled={payUrlSaving || !payUrl.trim()}
                        style={{ ...btn(payUrlSaved ? "ghost" : "primary"), opacity: !payUrl.trim() ? 0.5 : 1 }}>
                        {payUrlSaved ? "✓ Saved" : payUrlSaving ? "…" : "Save"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Google Article */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>📖 Google Article</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>People find this on Google. It sends them to your buy page.</div>
                  </div>
                  {selected.slug && (
                    <a href={`/guide/${selected.slug}`} target="_blank" rel="noopener noreferrer" style={btn("ghost")}>
                      View
                    </a>
                  )}
                </div>
              </div>

              {/* Social Posts */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: hooksOpen && guideHooks.length > 0 ? 16 : 0 }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>📱 Social Posts</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                      {guideHooks.length > 0 ? `${guideHooks.length} posts ready — TikTok, Instagram, Pinterest, and more.` : "Social posts will be available after publishing."}
                    </div>
                  </div>
                  {guideHooks.length > 0 && (
                    <button onClick={() => setHooksOpen((o) => !o)} style={btn("ghost")}>
                      {hooksOpen ? "Hide" : "Show Posts"}
                    </button>
                  )}
                </div>

                {hooksOpen && guideHooks.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {guideHooks.map((h) => (
                      <div key={h.id} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: "0.9rem" }}>{PLATFORM_ICON[h.platform] ?? "📣"}</span>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--muted)", textTransform: "capitalize", letterSpacing: "0.04em" }}>
                              {h.platform}
                            </span>
                          </div>
                          <button onClick={() => copy(h.text, h.id)}
                            style={{ fontSize: "0.72rem", fontWeight: 600, color: copied === h.id ? "var(--accent)" : "var(--muted)", background: "transparent", border: "none", cursor: "pointer" }}>
                            {copied === h.id ? "✓ Copied" : "Copy"}
                          </button>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "var(--text)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" }}>
                          {h.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuidesPage() {
  return <Suspense><GuidesContent /></Suspense>;
}
