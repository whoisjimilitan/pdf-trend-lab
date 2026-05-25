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
  volumeTier: string;
  videoScript: string;
};

type Product = {
  id: string;
  opportunityId: string;
  title: string;
  slug: string;
  pdfContent: string;
  salesPageCopy: string;
  seoPageContent: string;
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

const BJ_NICHES = new Set(["grief","doubt","shame","loneliness","fear","exhaustion","faith","healing","identity"]);

function GuidesContent() {
  const params = useSearchParams();
  const opportunityId = params.get("id");
  const urlNiche = params.get("niche") ?? "";

  const [guides, setGuides]         = useState<Product[]>([]);
  const [hooks, setHooks]           = useState<Hook[]>([]);
  const [selected, setSelected]     = useState<Product | null>(null);
  const [growing, setGrowing]       = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied]         = useState("");
  const [hooksOpen, setHooksOpen]   = useState(false);
  const [scriptOpen, setScriptOpen] = useState(false);
  const [payUrl, setPayUrl]         = useState("");
  const [payUrlSaving, setPayUrlSaving] = useState(false);
  const [payUrlSaved, setPayUrlSaved]   = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [contentOpen, setContentOpen]   = useState(false);
  const [customContent, setCustomContent] = useState("");
  const [contentSaving, setContentSaving] = useState(false);
  const [contentSaved, setContentSaved]   = useState(false);
  const [articleOpen, setArticleOpen]     = useState(false);
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
    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px",
  };

  const btn = (variant: "primary" | "ghost"): React.CSSProperties => ({
    display: "inline-block", padding: "9px 18px", borderRadius: 9, fontSize: "0.82rem", fontWeight: 700,
    cursor: "pointer", textDecoration: "none",
    border: variant === "ghost" ? "1px solid var(--border)" : "none",
    background: variant === "primary" ? "var(--accent)" : "var(--surface2)",
    color: variant === "primary" ? "#fff" : "var(--muted)",
  });

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>

      {/* Sidebar */}
      <div style={{ width: 240, flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--surface)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>
            Guides {guides.length > 0 && <span style={{ color: "var(--muted)", fontWeight: 400 }}>({guides.length})</span>}
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
            onClick={() => { setSelected(g); setPayUrl(g.gumroadUrl ?? ""); setHooksOpen(false); setScriptOpen(false); setContentOpen(false); setCustomContent(""); setArticleOpen(false); setCustomArticle(""); setEditingHookId(null); }}
            style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: selected?.id === g.id ? "var(--surface2)" : "transparent", position: "relative" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text)", marginBottom: 4, lineHeight: 1.4, paddingRight: 20 }}>
              {g.title}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {g.published
                ? <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#16A34A", background: "#DCFCE7", border: "1px solid #BBF7D0", padding: "1px 7px", borderRadius: 20 }}>🟢 Live</span>
                : <span style={{ fontSize: "0.65rem", color: "var(--muted)", background: "var(--surface2)", padding: "1px 7px", borderRadius: 20 }}>Draft</span>
              }
              {g.salesCount > 0 && (
                <span style={{ fontSize: "0.65rem", color: "var(--amber)", fontWeight: 600 }}>£{g.revenue.toFixed(0)} earned</span>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); deleteGuide(g); }}
              disabled={deleting}
              title="Delete guide"
              style={{ position: "absolute", top: 10, right: 10, background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "0.75rem", padding: "2px 4px", lineHeight: 1, opacity: 0.5 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.5")}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px", background: "var(--bg)" }}>

        {opportunityId && !selected && (() => {
          const isBJPending = BJ_NICHES.has(urlNiche);
          return (
            <div style={{ ...card, maxWidth: 560, marginBottom: 24, textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 12 }}>{isBJPending ? "✦" : "🌱"}</div>
              <div style={{ fontSize: "0.97rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                {isBJPending ? "Ready to write this word." : "Ready to grow this seed."}
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0 0 20px", lineHeight: 1.7 }}>
                {isBJPending
                  ? "One click writes the pastoral guide, the receive page, the Google article, and the social captions — all in the Brother Jimi voice."
                  : "One click generates your PDF guide, buy page, Google article, and social posts."}
              </p>
              <button onClick={grow} disabled={growing} style={{ ...btn("primary"), opacity: growing ? 0.7 : 1, cursor: growing ? "not-allowed" : "pointer" }}>
                {growing
                  ? (isBJPending ? "Writing the word…" : "Growing your guide…")
                  : (isBJPending ? "Write This Word →" : "Grow This Seed →")}
              </button>
              {growing && (
                <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: "14px 0 0", lineHeight: 1.6 }}>
                  {isBJPending
                    ? "✦ Writing in the background — the sidebar is still interactive. You can delete other guides while this one is being written."
                    : "Growing in the background — the sidebar stays live. Delete or manage other guides while you wait."}
                </p>
              )}
            </div>
          );
        })()}

        {!selected && !opportunityId && (
          <div style={{ maxWidth: 560, textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: "2rem", marginBottom: 14 }}>📄</div>
            <div style={{ fontSize: "0.97rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Select a guide to see its details.</div>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.7 }}>Or go to the engine to find a new opportunity.</p>
          </div>
        )}

        {selected && (() => {
          const isBJ = BJ_NICHES.has(selected.opportunity?.niche ?? "");
          const vs = parseVideoScript(selected.opportunity?.videoScript ?? "");
          const hasScript = vs.hook || vs.tease || vs.cta;
          const fullScript = [vs.hook && `Hook:\n${vs.hook}`, vs.tease && `Tease:\n${vs.tease}`, vs.cta && `CTA:\n${vs.cta}`].filter(Boolean).join("\n\n");

          return (
            <div style={{ maxWidth: 560 }}>

              {/* Header */}
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text)", margin: "0 0 12px", lineHeight: 1.35 }}>
                  {selected.title}
                </h1>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => toggleLive(selected)} disabled={publishing}
                    style={{ padding: "8px 18px", borderRadius: 9, fontSize: "0.82rem", fontWeight: 700, cursor: publishing ? "not-allowed" : "pointer", border: "none", background: selected.published ? "#DCFCE7" : "var(--accent)", color: selected.published ? "#16A34A" : "#fff", opacity: publishing ? 0.7 : 1 }}>
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

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Video Script / Caption */}
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: scriptOpen ? 16 : 0 }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{isBJ ? "✦ Caption / Word" : "🎬 Video Script"}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {isBJ ? "Social caption and hook — copy and post to WhatsApp or Instagram." : "5–7 second faceless video. Record and post to drive traffic."}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      {hasScript && scriptOpen && (
                        <button onClick={() => copy(fullScript, "script")} style={btn("ghost")}>
                          {copied === "script" ? "✓ Copied" : "Copy All"}
                        </button>
                      )}
                      <button onClick={() => setScriptOpen((o) => !o)} style={btn("ghost")}>
                        {scriptOpen ? "Hide" : "Show Script"}
                      </button>
                    </div>
                  </div>

                  {scriptOpen && (
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                      {hasScript ? (
                        [
                          { label: "1. Hook (say this first — 0–2s)", text: vs.hook, key: "hook" },
                          { label: "2. Tease (raise the stakes — 2–4s)", text: vs.tease, key: "tease" },
                          { label: "3. CTA (point to bio — 4–7s)", text: vs.cta, key: "cta" },
                        ].filter(r => r.text).map((row) => (
                          <div key={row.key}>
                            <div style={{ fontSize: "0.71rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{row.label}</div>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "var(--surface2)", borderRadius: 9, padding: "10px 12px" }}>
                              <p style={{ fontSize: "0.84rem", color: "var(--text)", lineHeight: 1.6, margin: 0, flex: 1 }}>{row.text}</p>
                              <button onClick={() => copy(row.text, row.key)}
                                style={{ fontSize: "0.72rem", fontWeight: 600, color: copied === row.key ? "var(--accent)" : "var(--muted)", background: "none", border: "none", cursor: "pointer", flexShrink: 0, paddingTop: 2 }}>
                                {copied === row.key ? "✓" : "Copy"}
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                          Available for opportunities scanned with the latest engine.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* PDF Guide */}
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: contentOpen ? 16 : 0 }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{isBJ ? "📖 Pastoral Guide" : "📄 PDF Guide"}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {contentSaved ? "✅ Content updated." : (isBJ ? "The complete pastoral reflection — download and offer to readers." : "Your complete guide, ready to download and sell.")}
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
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 8 }}>
                        Use # for headings, ## for subheadings, - for bullet points.
                      </div>
                      <textarea value={customContent} onChange={(e) => setCustomContent(e.target.value)} rows={16}
                        placeholder={"# Chapter 1\n\n## Section\n\n- Step one\n- Step two"}
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

                {/* Buy / Receive Page */}
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: selected.slug ? 14 : 0 }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{isBJ ? "✦ Receive Page" : "🛒 Buy Page"}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{isBJ ? "Share this link. Put it in your bio. This is where readers receive the word." : "Share this link. Put it in your bio. This is where people buy."}</div>
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
                        <input type="url" value={payUrl} onChange={(e) => setPayUrl(e.target.value)}
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
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{isBJ ? "🌿 Google Article" : "📖 Google Article"}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {articleSaved ? "✅ Article updated." : (isBJ ? "People find this on Google. It sits with them — then sends them to the receive page." : "People find this on Google. It sends them to your buy page.")}
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
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 8 }}>
                        Use # for headings, ## for subheadings, - for bullets.
                      </div>
                      <textarea value={customArticle} onChange={(e) => setCustomArticle(e.target.value)} rows={16}
                        placeholder="# Article Title&#10;&#10;## Section&#10;&#10;- Bullet"
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

                {/* Social Posts / Words */}
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: hooksOpen && guideHooks.length > 0 ? 16 : 0 }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{isBJ ? "🕊️ Social Words" : "📱 Social Posts"}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {guideHooks.length > 0
                          ? (isBJ ? `${guideHooks.length} captions ready — WhatsApp, Instagram, Facebook.` : `${guideHooks.length} posts ready — TikTok, Instagram, Pinterest, and more.`)
                          : (isBJ ? "Social captions will be available after writing." : "Social posts will be available after growing.")}
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
                              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--muted)", textTransform: "capitalize", letterSpacing: "0.04em" }}>{h.platform}</span>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => { setEditingHookId(h.id); setHookDraft(h.text); }}
                                style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--muted)", background: "transparent", border: "none", cursor: "pointer" }}>Edit</button>
                              <button onClick={() => copy(h.text, h.id)}
                                style={{ fontSize: "0.72rem", fontWeight: 600, color: copied === h.id ? "var(--accent)" : "var(--muted)", background: "transparent", border: "none", cursor: "pointer" }}>
                                {copied === h.id ? "✓ Copied" : "Copy"}
                              </button>
                            </div>
                          </div>
                          {editingHookId === h.id ? (
                            <div>
                              <textarea value={hookDraft} onChange={(e) => setHookDraft(e.target.value)} rows={5}
                                style={{ width: "100%", fontSize: "0.78rem", lineHeight: 1.65, padding: "10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                              />
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                                <button onClick={() => setEditingHookId(null)} style={{ ...btn("ghost"), fontSize: "0.75rem", padding: "7px 14px" }}>Cancel</button>
                                <button onClick={() => saveHook(h.id, hookDraft)} disabled={hookSaving || !hookDraft.trim()}
                                  style={{ ...btn("primary"), fontSize: "0.75rem", padding: "7px 14px", opacity: !hookDraft.trim() ? 0.5 : 1 }}>
                                  {hookSaving ? "Saving…" : "Save"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p style={{ fontSize: "0.8rem", color: "var(--text)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" }}>{h.text}</p>
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
