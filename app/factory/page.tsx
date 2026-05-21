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
    const p = JSON.parse(raw || "{}");
    return { hook: String(p.hook || ""), tease: String(p.tease || ""), cta: String(p.cta || "") };
  } catch { return { hook: "", tease: "", cta: "" }; }
}

const VOLUME_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "mass-market": { label: "🔥 50K+/mo",  color: "#16A34A", bg: "#DCFCE7", border: "#BBF7D0" },
  "strong":      { label: "💪 20K+/mo",  color: "#2563EB", bg: "#DBEAFE", border: "#BFDBFE" },
  "niche":       { label: "📍 5K+/mo",   color: "#7C3AED", bg: "#EDE9FE", border: "#DDD6FE" },
  "micro-niche": { label: "🔬 Micro",    color: "#64748b", bg: "#F1F5F9", border: "#E2E8F0" },
};

const HOOK_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "high":   { label: "🔥 High Hook", color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" },
  "medium": { label: "📊 Mid Hook",  color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "low":    { label: "💬 Low Hook",  color: "#64748b", bg: "#F1F5F9", border: "#E2E8F0" },
};

const ACTION_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "easy":   { label: "✅ Easy",    color: "#16A34A", bg: "#DCFCE7", border: "#BBF7D0" },
  "medium": { label: "⚡ Medium",  color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  "hard":   { label: "🔧 Complex", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
};

function Pill({ badge }: { badge?: { label: string; color: string; bg: string; border: string } }) {
  if (!badge) return null;
  return (
    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: badge.color, background: badge.bg, border: `1px solid ${badge.border}`, padding: "3px 9px", borderRadius: 20 }}>
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
      await fetch("/api/factory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ opportunityId }) });
      await load();
    } finally { setGrowing(false); }
  }

  async function toggleLive(g: Product) {
    setPublishing(true);
    try {
      const res = await fetch(`/api/products/${g.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !g.published }) });
      const updated = await res.json();
      setGuides((prev) => prev.map((x) => x.id === g.id ? { ...x, ...updated } : x));
      setSelected((prev) => prev?.id === g.id ? { ...prev, ...updated } : prev);
    } finally { setPublishing(false); }
  }

  async function saveContent(g: Product) {
    if (!customContent.trim()) return;
    setContentSaving(true);
    try {
      const res = await fetch(`/api/products/${g.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pdfContent: customContent.trim() }) });
      const updated = await res.json();
      setGuides((prev) => prev.map((x) => x.id === g.id ? { ...x, ...updated } : x));
      setSelected((prev) => prev?.id === g.id ? { ...prev, ...updated } : prev);
      setContentSaved(true); setContentOpen(false);
      setTimeout(() => setContentSaved(false), 3000);
    } finally { setContentSaving(false); }
  }

  async function saveArticle(g: Product) {
    if (!customArticle.trim()) return;
    setArticleSaving(true);
    try {
      const res = await fetch(`/api/products/${g.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seoPageContent: customArticle.trim() }) });
      const updated = await res.json();
      setGuides((prev) => prev.map((x) => x.id === g.id ? { ...x, ...updated } : x));
      setSelected((prev) => prev?.id === g.id ? { ...prev, ...updated } : prev);
      setArticleSaved(true); setArticleOpen(false);
      setTimeout(() => setArticleSaved(false), 3000);
    } finally { setArticleSaving(false); }
  }

  async function saveHook(hookId: string, text: string) {
    if (!text.trim()) return;
    setHookSaving(true);
    try {
      const res = await fetch("/api/hooks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: hookId, text: text.trim() }) });
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
      setSelected(null); await load();
    } finally { setDeleting(false); }
  }

  async function savePayUrl(g: Product) {
    if (!payUrl.trim()) return;
    setPayUrlSaving(true);
    try {
      const res = await fetch(`/api/products/${g.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gumroadUrl: payUrl.trim() }) });
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
    ? hooks.filter((h) => h.text.toLowerCase().includes(selected.opportunity?.keyword?.toLowerCase()?.split(" ")[0] ?? "")).slice(0, 6)
    : [];

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const card: React.CSSProperties = {
    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px",
  };

  const btn = (variant: "primary" | "ghost"): React.CSSProperties => ({
    display: "inline-block", padding: "8px 16px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700,
    cursor: "pointer", textDecoration: "none",
    border: variant === "ghost" ? "1px solid var(--border)" : "none",
    background: variant === "primary" ? "var(--accent)" : "var(--surface2)",
    color: variant === "primary" ? "#fff" : "var(--muted)",
  });

  const miniBtn: React.CSSProperties = {
    fontSize: "0.7rem", fontWeight: 600, color: "var(--muted)",
    background: "transparent", border: "none", cursor: "pointer", padding: "2px 4px",
  };

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>

      {/* Sidebar */}
      <div style={{ width: 252, flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--surface)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>
            Guides {guides.length > 0 && <span style={{ color: "var(--muted)", fontWeight: 400 }}>({guides.length})</span>}
          </div>
        </div>

        {guides.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem", marginBottom: 10 }}>📄</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.6 }}>
              No guides yet. Find a seed and grow your first one.
            </div>
          </div>
        ) : guides.map((g) => (
          <div key={g.id}
            onClick={() => { setSelected(g); setPayUrl(g.gumroadUrl ?? ""); setHooksOpen(false); setContentOpen(false); setCustomContent(""); setArticleOpen(false); setCustomArticle(""); setEditingHookId(null); }}
            style={{ padding: "11px 14px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: selected?.id === g.id ? "var(--surface2)" : "transparent" }}>
            <div style={{ fontSize: "0.81rem", fontWeight: 500, color: "var(--text)", marginBottom: 5, lineHeight: 1.35 }}>
              {g.title}
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
              {g.published
                ? <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#16A34A", background: "#DCFCE7", border: "1px solid #BBF7D0", padding: "1px 6px", borderRadius: 20 }}>Live</span>
                : <span style={{ fontSize: "0.6rem", color: "var(--muted)", background: "var(--surface2)", padding: "1px 6px", borderRadius: 20, border: "1px solid var(--border)" }}>Draft</span>
              }
              {g.opportunity?.volumeTier && VOLUME_BADGE[g.opportunity.volumeTier] && (
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: VOLUME_BADGE[g.opportunity.volumeTier].color, background: VOLUME_BADGE[g.opportunity.volumeTier].bg, border: `1px solid ${VOLUME_BADGE[g.opportunity.volumeTier].border}`, padding: "1px 6px", borderRadius: 20 }}>
                  {VOLUME_BADGE[g.opportunity.volumeTier].label}
                </span>
              )}
              {g.opportunity?.hookPotential === "high" && (
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#EA580C", background: "#FFF7ED", border: "1px solid #FED7AA", padding: "1px 6px", borderRadius: 20 }}>🔥 Hook</span>
              )}
              {g.salesCount > 0 && (
                <span style={{ fontSize: "0.6rem", color: "#D97706", fontWeight: 600 }}>£{g.revenue.toFixed(0)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px", background: "var(--bg)" }}>

        {opportunityId && !selected && (
          <div style={{ ...card, maxWidth: 520, textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem", marginBottom: 10 }}>🌱</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Ready to grow.</div>
            <p style={{ fontSize: "0.83rem", color: "var(--muted)", margin: "0 0 18px", lineHeight: 1.6 }}>
              Generates PDF, buy page, Google article, and social posts in one go.
            </p>
            <button onClick={grow} disabled={growing} style={{ ...btn("primary"), opacity: growing ? 0.7 : 1, cursor: growing ? "not-allowed" : "pointer" }}>
              {growing ? "Growing…" : "Grow This Seed →"}
            </button>
          </div>
        )}

        {!selected && !opportunityId && (
          <div style={{ maxWidth: 400, textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: "1.8rem", marginBottom: 12 }}>📄</div>
            <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Select a guide from the left.</div>
          </div>
        )}

        {selected && (() => {
          const opp = selected.opportunity;
          const vs  = parseVideoScript(opp?.videoScript ?? "");
          const hasScript = vs.hook || vs.tease || vs.cta;
          const fullScript = [vs.hook, vs.tease, vs.cta].filter(Boolean).join("\n\n");

          return (
            <div style={{ maxWidth: 620 }}>

              {/* Header */}
              <div style={{ marginBottom: 18 }}>
                <h1 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", margin: "0 0 12px", lineHeight: 1.35 }}>
                  {selected.title}
                </h1>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => toggleLive(selected)} disabled={publishing}
                    style={{ padding: "7px 16px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: publishing ? "not-allowed" : "pointer", border: "none", background: selected.published ? "#DCFCE7" : "var(--accent)", color: selected.published ? "#16A34A" : "#fff", opacity: publishing ? 0.7 : 1 }}>
                    {publishing ? "…" : selected.published ? "🟢 Live" : "Go Live →"}
                  </button>
                  {selected.salesCount > 0 && (
                    <span style={{ fontSize: "0.76rem", color: "var(--muted)" }}>
                      {selected.salesCount} sale{selected.salesCount !== 1 ? "s" : ""} · £{selected.revenue.toFixed(0)}
                    </span>
                  )}
                  <button onClick={() => deleteGuide(selected)} disabled={deleting}
                    style={{ marginLeft: "auto", padding: "7px 13px", borderRadius: 8, fontSize: "0.76rem", fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", border: "1px solid #FECACA", background: "transparent", color: "#DC2626", opacity: deleting ? 0.5 : 1 }}>
                    {deleting ? "…" : "Delete"}
                  </button>
                </div>
              </div>

              {/* Signal badges */}
              {(opp?.volumeTier || opp?.hookPotential || opp?.actionabilityRating) && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
                  <Pill badge={VOLUME_BADGE[opp?.volumeTier]} />
                  <Pill badge={HOOK_BADGE[opp?.hookPotential]} />
                  <Pill badge={ACTION_BADGE[opp?.actionabilityRating]} />
                </div>
              )}

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                {/* Video Script */}
                <div style={{ ...card, borderColor: hasScript ? "rgba(99,102,241,0.3)" : "var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: hasScript ? 14 : 0 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>🎬 Video Script</div>
                    {hasScript && (
                      <button onClick={() => copy(fullScript, "videoscript")} style={btn("ghost")}>
                        {copied === "videoscript" ? "✓ Copied" : "Copy All"}
                      </button>
                    )}
                  </div>

                  {hasScript ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {[
                        { key: "hook",  label: "Hook · 0–2s",  color: "#6366F1", border: "rgba(99,102,241,0.18)", text: vs.hook  },
                        { key: "tease", label: "Tease · 2–4s", color: "#D97706", border: "rgba(245,158,11,0.18)", text: vs.tease },
                        { key: "cta",   label: "CTA · 4–7s",   color: "#059669", border: "rgba(16,185,129,0.18)", text: vs.cta   },
                      ].filter(r => r.text).map((row) => (
                        <div key={row.key} style={{ background: "var(--bg)", border: `1px solid ${row.border}`, borderRadius: 10, padding: "11px 13px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: "0.64rem", fontWeight: 800, color: row.color, letterSpacing: "0.07em", textTransform: "uppercase" }}>{row.label}</span>
                            <button onClick={() => copy(row.text, row.key)} style={miniBtn}>
                              {copied === row.key ? "✓" : "Copy"}
                            </button>
                          </div>
                          <p style={{ fontSize: "0.86rem", color: "var(--text)", lineHeight: 1.55, margin: 0 }}>{row.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0 }}>
                      Available on opportunities scanned with the latest engine.
                    </p>
                  )}
                </div>

                {/* PDF Guide */}
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: contentOpen ? 14 : 0 }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>📄 PDF Guide</div>
                      <div style={{ fontSize: "0.76rem", color: "var(--muted)", marginTop: 2 }}>
                        {contentSaved ? "✅ Saved." : "Download and sell."}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => { setContentOpen((o) => !o); setCustomContent(selected.pdfContent); }} style={btn("ghost")}>
                        {contentOpen ? "Cancel" : "Edit"}
                      </button>
                      {selected.slug && (
                        <a href={`/guide/${selected.slug}/pdf`} target="_blank" rel="noopener noreferrer" style={btn("primary")}>Download</a>
                      )}
                    </div>
                  </div>
                  {contentOpen && (
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                      <div style={{ fontSize: "0.71rem", color: "var(--muted)", marginBottom: 7 }}>
                        # heading · ## subheading · - bullet
                      </div>
                      <textarea value={customContent} onChange={(e) => setCustomContent(e.target.value)} rows={14}
                        placeholder={"# Chapter 1\n\n## Section\n\n- Step one\n- Step two"}
                        style={{ width: "100%", fontSize: "0.78rem", lineHeight: 1.6, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none", resize: "vertical", fontFamily: "monospace", boxSizing: "border-box" }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: selected.slug ? 12 : 0 }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>🛒 Buy Page</div>
                      <div style={{ fontSize: "0.76rem", color: "var(--muted)", marginTop: 2 }}>Your sales link — put it in bio.</div>
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
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                      <div style={{ fontSize: "0.71rem", color: "var(--muted)", marginBottom: 7 }}>
                        {selected.gumroadUrl ? "✅ Payment link connected" : "Add your Gumroad / Payhip / Selar link"}
                      </div>
                      <div style={{ display: "flex", gap: 7 }}>
                        <input type="url" value={payUrl} onChange={(e) => setPayUrl(e.target.value)}
                          placeholder={selected.gumroadUrl || "Paste payment link"}
                          style={{ flex: 1, fontSize: "0.78rem", padding: "7px 11px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }}
                        />
                        <button onClick={() => savePayUrl(selected)} disabled={payUrlSaving || !payUrl.trim()}
                          style={{ ...btn(payUrlSaved ? "ghost" : "primary"), opacity: !payUrl.trim() ? 0.5 : 1 }}>
                          {payUrlSaved ? "✓" : payUrlSaving ? "…" : "Save"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Google Article */}
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: articleOpen ? 14 : 0 }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>📖 Google Article</div>
                      <div style={{ fontSize: "0.76rem", color: "var(--muted)", marginTop: 2 }}>
                        {articleSaved ? "✅ Saved." : "Ranks on Google → sends readers to buy page."}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => { setArticleOpen((o) => !o); setCustomArticle(selected.seoPageContent); }} style={btn("ghost")}>
                        {articleOpen ? "Cancel" : "Edit"}
                      </button>
                      {selected.slug && (
                        <a href={`/guide/${selected.slug}`} target="_blank" rel="noopener noreferrer" style={btn("ghost")}>View</a>
                      )}
                    </div>
                  </div>
                  {articleOpen && (
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                      <div style={{ fontSize: "0.71rem", color: "var(--muted)", marginBottom: 7 }}>
                        # heading · ## subheading · - bullet
                      </div>
                      <textarea value={customArticle} onChange={(e) => setCustomArticle(e.target.value)} rows={14}
                        placeholder="# Article Title&#10;&#10;## Section&#10;&#10;- Bullet"
                        style={{ width: "100%", fontSize: "0.78rem", lineHeight: 1.6, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none", resize: "vertical", fontFamily: "monospace", boxSizing: "border-box" }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: hooksOpen && guideHooks.length > 0 ? 14 : 0 }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>📱 Social Posts</div>
                      <div style={{ fontSize: "0.76rem", color: "var(--muted)", marginTop: 2 }}>
                        {guideHooks.length > 0 ? `${guideHooks.length} posts — TikTok, Instagram, Pinterest, more.` : "Available after growing."}
                      </div>
                    </div>
                    {guideHooks.length > 0 && (
                      <button onClick={() => setHooksOpen((o) => !o)} style={btn("ghost")}>
                        {hooksOpen ? "Hide" : "Show"}
                      </button>
                    )}
                  </div>

                  {hooksOpen && guideHooks.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {guideHooks.map((h) => (
                        <div key={h.id} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 13px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <span>{PLATFORM_ICON[h.platform] ?? "📣"}</span>
                              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--muted)", textTransform: "capitalize" }}>{h.platform}</span>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => { setEditingHookId(h.id); setHookDraft(h.text); }} style={miniBtn}>Edit</button>
                              <button onClick={() => copy(h.text, h.id)} style={{ ...miniBtn, color: copied === h.id ? "var(--accent)" : "var(--muted)" }}>
                                {copied === h.id ? "✓" : "Copy"}
                              </button>
                            </div>
                          </div>
                          {editingHookId === h.id ? (
                            <div>
                              <textarea value={hookDraft} onChange={(e) => setHookDraft(e.target.value)} rows={5}
                                style={{ width: "100%", fontSize: "0.78rem", lineHeight: 1.6, padding: "9px 11px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                              />
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: 7, marginTop: 7 }}>
                                <button onClick={() => setEditingHookId(null)} style={{ ...btn("ghost"), fontSize: "0.75rem", padding: "6px 13px" }}>Cancel</button>
                                <button onClick={() => saveHook(h.id, hookDraft)} disabled={hookSaving || !hookDraft.trim()}
                                  style={{ ...btn("primary"), fontSize: "0.75rem", padding: "6px 13px", opacity: !hookDraft.trim() ? 0.5 : 1 }}>
                                  {hookSaving ? "…" : "Save"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p style={{ fontSize: "0.8rem", color: "var(--text)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>{h.text}</p>
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
