"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Opportunity = {
  keyword: string;
  pdfTitle: string;
  niche: string;
  minPrice: number;
  maxPrice: number;
  country: string;
  hookPotential: string;
  hookAngle: string;
  pdfSuitability: string;
  actionabilityRating: string;
  volumeTier: string;
  videoScript: string;
  painPoint: string;
  emotionalIntent: string;
  opportunityScore: number;
};

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
  opportunity: Opportunity;
};

type Hook = { id: string; text: string; platform: string; emotionType: string };

const PLATFORM_ICON: Record<string, string> = {
  tiktok: "🎵", instagram: "📸", pinterest: "📌", email: "📧", twitter: "🐦",
};

function parseVideoScript(raw: string): { hook: string; tease: string; cta: string } {
  try {
    const parsed = JSON.parse(raw || "{}");
    return {
      hook:  String(parsed.hook  || ""),
      tease: String(parsed.tease || ""),
      cta:   String(parsed.cta   || "Link in bio for the complete step-by-step guide."),
    };
  } catch {
    return { hook: "", tease: "", cta: "" };
  }
}

const VOLUME_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "mass-market": { label: "🔥 Mass Market · 50K+/mo", color: "#16A34A", bg: "#DCFCE7", border: "#BBF7D0" },
  "strong":      { label: "💪 Strong · 20K+/mo",      color: "#2563EB", bg: "#DBEAFE", border: "#BFDBFE" },
  "niche":       { label: "📍 Niche · 5K+/mo",         color: "#7C3AED", bg: "#EDE9FE", border: "#DDD6FE" },
  "micro-niche": { label: "🔬 Micro-niche",             color: "#64748b", bg: "#F1F5F9", border: "#E2E8F0" },
};

const HOOK_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "high":   { label: "🔥 High Hook Potential", color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" },
  "medium": { label: "📊 Medium Hook",         color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "low":    { label: "💬 Lower Hook",           color: "#64748b", bg: "#F1F5F9", border: "#E2E8F0" },
};

const ACTION_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "easy":   { label: "✅ Easy to Structure", color: "#16A34A", bg: "#DCFCE7", border: "#BBF7D0" },
  "medium": { label: "⚡ Medium Complexity", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "hard":   { label: "🔧 Complex Guide",     color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
};

function Pill({ badge }: { badge: { label: string; color: string; bg: string; border: string } | undefined }) {
  if (!badge) return null;
  return (
    <span style={{
      fontSize: "0.68rem", fontWeight: 700, color: badge.color,
      background: badge.bg, border: `1px solid ${badge.border}`,
      padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap",
    }}>
      {badge.label}
    </span>
  );
}

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
  const [contentOpen, setContentOpen]   = useState(false);
  const [customContent, setCustomContent] = useState("");
  const [contentSaving, setContentSaving] = useState(false);
  const [contentSaved, setContentSaved]   = useState(false);
  const [articleOpen, setArticleOpen]   = useState(false);
  const [customArticle, setCustomArticle] = useState("");
  const [articleSaving, setArticleSaving] = useState(false);
  const [articleSaved, setArticleSaved]   = useState(false);
  const [editingHookId, setEditingHookId] = useState<string | null>(null);
  const [hookDraft, setHookDraft]         = useState("");
  const [hookSaving, setHookSaving]       = useState(false);

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

  async function saveContent(g: Product) {
    if (!customContent.trim()) return;
    setContentSaving(true);
    try {
      const res = await fetch(`/api/products/${g.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfContent: customContent.trim() }),
      });
      const updated = await res.json();
      setGuides((prev) => prev.map((x) => x.id === g.id ? { ...x, ...updated } : x));
      setSelected((prev) => prev?.id === g.id ? { ...prev, ...updated } : prev);
      setContentSaved(true);
      setContentOpen(false);
      setTimeout(() => setContentSaved(false), 3000);
    } finally { setContentSaving(false); }
  }

  async function saveArticle(g: Product) {
    if (!customArticle.trim()) return;
    setArticleSaving(true);
    try {
      const res = await fetch(`/api/products/${g.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seoPageContent: customArticle.trim() }),
      });
      const updated = await res.json();
      setGuides((prev) => prev.map((x) => x.id === g.id ? { ...x, ...updated } : x));
      setSelected((prev) => prev?.id === g.id ? { ...prev, ...updated } : prev);
      setArticleSaved(true);
      setArticleOpen(false);
      setTimeout(() => setArticleSaved(false), 3000);
    } finally { setArticleSaving(false); }
  }

  async function saveHook(hookId: string, text: string) {
    if (!text.trim()) return;
    setHookSaving(true);
    try {
      const res = await fetch("/api/hooks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: hookId, text: text.trim() }),
      });
      const updated = await res.json();
      setHooks((prev) => prev.map((h) => h.id === hookId ? { ...h, text: updated.text } : h));
      setEditingHookId(null);
    } finally { setHookSaving(false); }
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

  const miniBtn: React.CSSProperties = {
    fontSize: "0.7rem",
    fontWeight: 600,
    color: "var(--muted)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "2px 4px",
  };

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>

      {/* Guide list sidebar */}
      <div style={{ width: 260, flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--surface)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
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
            onClick={() => {
              setSelected(g);
              setPayUrl(g.gumroadUrl ?? "");
              setHooksOpen(false);
              setContentOpen(false);
              setCustomContent("");
              setArticleOpen(false);
              setCustomArticle("");
              setEditingHookId(null);
            }}
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid var(--border)",
              cursor: "pointer",
              background: selected?.id === g.id ? "var(--surface2)" : "transparent",
            }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text)", marginBottom: 6, lineHeight: 1.4 }}>
              {g.title}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              {g.published ? (
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#16A34A", background: "#DCFCE7", border: "1px solid #BBF7D0", padding: "1px 7px", borderRadius: 20 }}>
                  🟢 Live
                </span>
              ) : (
                <span style={{ fontSize: "0.6rem", color: "var(--muted)", background: "var(--surface2)", padding: "1px 7px", borderRadius: 20, border: "1px solid var(--border)" }}>
                  Draft
                </span>
              )}
              {g.opportunity?.volumeTier && VOLUME_BADGE[g.opportunity.volumeTier] && (
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: VOLUME_BADGE[g.opportunity.volumeTier].color, background: VOLUME_BADGE[g.opportunity.volumeTier].bg, border: `1px solid ${VOLUME_BADGE[g.opportunity.volumeTier].border}`, padding: "1px 6px", borderRadius: 20 }}>
                  {g.opportunity.volumeTier === "mass-market" ? "🔥 Mass" : g.opportunity.volumeTier === "strong" ? "💪 Strong" : g.opportunity.volumeTier === "niche" ? "📍 Niche" : "🔬 Micro"}
                </span>
              )}
              {g.opportunity?.hookPotential === "high" && (
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#EA580C", background: "#FFF7ED", border: "1px solid #FED7AA", padding: "1px 6px", borderRadius: 20 }}>
                  🔥 Hook
                </span>
              )}
            </div>
            {g.salesCount > 0 && (
              <div style={{ marginTop: 4, fontSize: "0.65rem", color: "var(--amber)", fontWeight: 600 }}>
                £{g.revenue.toFixed(0)} earned
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Guide detail */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px", background: "var(--bg)" }}>

        {/* Grow prompt */}
        {opportunityId && !selected && (
          <div style={{ ...card, maxWidth: 600, marginBottom: 24, textAlign: "center" }}>
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
          <div style={{ maxWidth: 600, textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: "2rem", marginBottom: 14 }}>📄</div>
            <div style={{ fontSize: "0.97rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
              Select a guide to see its details.
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.7 }}>
              Or go to Seeds to find a new opportunity.
            </p>
          </div>
        )}

        {selected && (() => {
          const opp = selected.opportunity;
          const vs  = parseVideoScript(opp?.videoScript ?? "");
          const hasVideoScript = vs.hook || vs.tease || vs.cta;
          const fullVideoScript = [vs.hook, vs.tease, vs.cta].filter(Boolean).join("\n\n");

          return (
            <div style={{ maxWidth: 640 }}>

              {/* Header */}
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", margin: "0 0 14px", lineHeight: 1.35, letterSpacing: "-0.01em" }}>
                  {selected.title}
                </h1>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => toggleLive(selected)} disabled={publishing}
                    style={{
                      padding: "8px 18px", borderRadius: 9, fontSize: "0.82rem", fontWeight: 700,
                      cursor: publishing ? "not-allowed" : "pointer", border: "none",
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

              {/* Demand Intelligence bar */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
                <div style={{ fontSize: "0.66rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                  Demand Intelligence
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: (opp?.pdfSuitability || opp?.hookAngle) ? 12 : 0 }}>
                  {opp?.volumeTier && <Pill badge={VOLUME_BADGE[opp.volumeTier]} />}
                  {opp?.hookPotential && <Pill badge={HOOK_BADGE[opp.hookPotential]} />}
                  {opp?.actionabilityRating && <Pill badge={ACTION_BADGE[opp.actionabilityRating]} />}
                </div>
                {(opp?.pdfSuitability || opp?.hookAngle) && (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    {opp?.pdfSuitability && (
                      <div style={{ fontSize: "0.77rem", color: "var(--muted)", lineHeight: 1.6 }}>
                        <span style={{ fontWeight: 700, color: "var(--text)" }}>Why PDF: </span>{opp.pdfSuitability}
                      </div>
                    )}
                    {opp?.hookAngle && (
                      <div style={{ fontSize: "0.77rem", color: "var(--muted)", lineHeight: 1.6 }}>
                        <span style={{ fontWeight: 700, color: "var(--text)" }}>Hook angle: </span>
                        <span style={{ fontStyle: "italic" }}>&ldquo;{opp.hookAngle}&rdquo;</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Video Script — THE distribution machine */}
                <div style={{ ...card, borderColor: hasVideoScript ? "rgba(99,102,241,0.25)" : "var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: hasVideoScript ? 16 : 0 }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>🎬 5–7 Second Video Script</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        Post this as a faceless video. High watch completion → algorithm pushes it → PDF sales.
                      </div>
                    </div>
                    {hasVideoScript && (
                      <button
                        onClick={() => copy(fullVideoScript, "videoscript")}
                        style={{ ...btn("ghost"), flexShrink: 0 }}>
                        {copied === "videoscript" ? "✓ Copied" : "Copy All"}
                      </button>
                    )}
                  </div>

                  {hasVideoScript ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

                      {/* Hook */}
                      {vs.hook && (
                        <div style={{ background: "var(--bg)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "12px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                            <span style={{ fontSize: "0.66rem", fontWeight: 800, color: "#6366F1", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                              🎣 Hook · 0–2s
                            </span>
                            <button onClick={() => copy(vs.hook, "hook")} style={miniBtn}>
                              {copied === "hook" ? "✓" : "Copy"}
                            </button>
                          </div>
                          <p style={{ fontSize: "0.88rem", color: "var(--text)", lineHeight: 1.55, margin: 0, fontWeight: 500 }}>{vs.hook}</p>
                        </div>
                      )}

                      {/* Tease */}
                      {vs.tease && (
                        <div style={{ background: "var(--bg)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "12px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                            <span style={{ fontSize: "0.66rem", fontWeight: 800, color: "#D97706", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                              💡 Tease · 2–4s
                            </span>
                            <button onClick={() => copy(vs.tease, "tease")} style={miniBtn}>
                              {copied === "tease" ? "✓" : "Copy"}
                            </button>
                          </div>
                          <p style={{ fontSize: "0.88rem", color: "var(--text)", lineHeight: 1.55, margin: 0 }}>{vs.tease}</p>
                        </div>
                      )}

                      {/* CTA */}
                      {vs.cta && (
                        <div style={{ background: "var(--bg)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "12px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                            <span style={{ fontSize: "0.66rem", fontWeight: 800, color: "#059669", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                              📲 CTA · 4–7s
                            </span>
                            <button onClick={() => copy(vs.cta, "cta")} style={miniBtn}>
                              {copied === "cta" ? "✓" : "Copy"}
                            </button>
                          </div>
                          <p style={{ fontSize: "0.88rem", color: "var(--text)", lineHeight: 1.55, margin: 0 }}>{vs.cta}</p>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "14px", textAlign: "center" }}>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.6 }}>
                        Video script will appear here for opportunities scanned with the updated engine.
                      </div>
                    </div>
                  )}
                </div>

                {/* PDF Guide */}
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: contentOpen ? 16 : 0 }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>📄 PDF Guide</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {contentSaved ? "✅ Content updated — download to see changes." : "Your complete guide, ready to download and sell."}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => { setContentOpen((o) => !o); setCustomContent(selected.pdfContent); }} style={btn("ghost")}>
                        {contentOpen ? "Cancel" : "Edit"}
                      </button>
                      {selected.slug && (
                        <a href={`/guide/${selected.slug}/pdf`} target="_blank" rel="noopener noreferrer" style={btn("primary")}>
                          Download
                        </a>
                      )}
                    </div>
                  </div>

                  {contentOpen && (
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 8 }}>
                        Paste your own content below. Use # for headings, ## for subheadings, - for bullet points.
                      </div>
                      <textarea
                        value={customContent}
                        onChange={(e) => setCustomContent(e.target.value)}
                        rows={16}
                        placeholder={"# Chapter 1: Getting Started\n\nPaste or type your guide content here...\n\n## Section heading\n\n- Bullet point one\n- Bullet point two"}
                        style={{ width: "100%", fontSize: "0.78rem", lineHeight: 1.65, padding: "12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none", resize: "vertical", fontFamily: "monospace", boxSizing: "border-box" }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                        <button onClick={() => saveContent(selected)} disabled={contentSaving || !customContent.trim()}
                          style={{ ...btn("primary"), opacity: !customContent.trim() ? 0.5 : 1 }}>
                          {contentSaving ? "Saving…" : "Save & Replace"}
                        </button>
                      </div>
                    </div>
                  )}
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
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: articleOpen ? 16 : 0 }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>📖 Google Article</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {articleSaved ? "✅ Article updated." : "People find this on Google. It sends them to your buy page."}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => { setArticleOpen((o) => !o); setCustomArticle(selected.seoPageContent); }} style={btn("ghost")}>
                        {articleOpen ? "Cancel" : "Edit"}
                      </button>
                      {selected.slug && (
                        <a href={`/guide/${selected.slug}`} target="_blank" rel="noopener noreferrer" style={btn("ghost")}>
                          View
                        </a>
                      )}
                    </div>
                  </div>

                  {articleOpen && (
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 8 }}>
                        Paste your article content. Use # for headings, ## for subheadings, - for bullets.
                      </div>
                      <textarea
                        value={customArticle}
                        onChange={(e) => setCustomArticle(e.target.value)}
                        rows={16}
                        placeholder="# Article Title&#10;&#10;Introduction paragraph...&#10;&#10;## Section Heading&#10;&#10;- Bullet point&#10;- Bullet point"
                        style={{ width: "100%", fontSize: "0.78rem", lineHeight: 1.65, padding: "12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none", resize: "vertical", fontFamily: "monospace", boxSizing: "border-box" }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                        <button onClick={() => saveArticle(selected)} disabled={articleSaving || !customArticle.trim()}
                          style={{ ...btn("primary"), opacity: !customArticle.trim() ? 0.5 : 1 }}>
                          {articleSaving ? "Saving…" : "Save & Replace"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Posts */}
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: hooksOpen && guideHooks.length > 0 ? 16 : 0 }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>📱 Social Posts</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {guideHooks.length > 0
                          ? `${guideHooks.length} posts ready — TikTok, Instagram, Pinterest, and more.`
                          : "Social posts will be available after publishing."}
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
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => { setEditingHookId(h.id); setHookDraft(h.text); }}
                                style={miniBtn}>
                                Edit
                              </button>
                              <button onClick={() => copy(h.text, h.id)}
                                style={{ ...miniBtn, color: copied === h.id ? "var(--accent)" : "var(--muted)" }}>
                                {copied === h.id ? "✓ Copied" : "Copy"}
                              </button>
                            </div>
                          </div>

                          {editingHookId === h.id ? (
                            <div>
                              <textarea
                                value={hookDraft}
                                onChange={(e) => setHookDraft(e.target.value)}
                                rows={5}
                                style={{ width: "100%", fontSize: "0.78rem", lineHeight: 1.65, padding: "10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                              />
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                                <button onClick={() => setEditingHookId(null)} style={{ ...btn("ghost"), fontSize: "0.75rem", padding: "7px 14px" }}>
                                  Cancel
                                </button>
                                <button onClick={() => saveHook(h.id, hookDraft)} disabled={hookSaving || !hookDraft.trim()}
                                  style={{ ...btn("primary"), fontSize: "0.75rem", padding: "7px 14px", opacity: !hookDraft.trim() ? 0.5 : 1 }}>
                                  {hookSaving ? "Saving…" : "Save"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p style={{ fontSize: "0.8rem", color: "var(--text)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" }}>
                              {h.text}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default function GuidesPage() {
  return <Suspense><GuidesContent /></Suspense>;
}
