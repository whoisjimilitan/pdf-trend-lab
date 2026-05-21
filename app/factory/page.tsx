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
  opportunity: {
    keyword: string;
    pdfTitle: string;
    painPoint: string;
    niche: string;
    opportunityScore: number;
    minPrice: number;
    maxPrice: number;
    country: string;
    emotionalIntent: string;
    exactQuestions: string;
  };
};
type Hook = { id: string; text: string; platform: string; emotionType: string; usageCount: number };

const CURRENCY: Record<string, string> = {
  GH: "₵", NG: "₦", KE: "KSh", ZA: "R", GB: "£", CA: "CA$", AU: "A$", US: "$",
};

const S = {
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    color: active ? "var(--text)" : "var(--muted)",
    borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
    background: "transparent", cursor: "pointer", padding: "8px 16px", fontSize: 13, fontWeight: 500,
  }),
  badge: (c: string): React.CSSProperties => ({
    background: c + "20", color: c, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600,
  }),
};

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "#EF4444", instagram: "#EC4899", twitter: "#6366F1",
  pinterest: "#F59E0B", email: "#10B981",
};

function parseQuestions(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

function BundleSuggestion({ products, niche }: { products: Product[]; niche: string }) {
  const nicheProducts = products.filter((p) => p.opportunity?.niche === niche);
  if (nicheProducts.length < 3) return null;
  const symbol = CURRENCY[nicheProducts[0]?.opportunity?.country ?? "US"] ?? "$";
  const avgMin = nicheProducts.reduce((s, p) => s + p.opportunity.minPrice, 0) / nicheProducts.length;
  const bundlePrice = (avgMin * nicheProducts.length * 0.7).toFixed(2);
  return (
    <div className="mt-4 p-4 rounded-lg" style={{ background: "#6366F115", border: "1px solid #6366F130" }}>
      <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#818CF8" }}>
        📦 Bundle Opportunity Detected
      </div>
      <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
        You have {nicheProducts.length} {niche} guides. Bundle them as a collection!
      </p>
      <div className="text-xs font-semibold" style={{ color: "var(--text)" }}>
        Suggested bundle title: "The Complete {niche.replace(/\b\w/g, (c) => c.toUpperCase())} Collection"
      </div>
      <div className="text-xs mt-1" style={{ color: "#10B981" }}>
        Bundle price suggestion: {symbol}{bundlePrice} (30% discount from individual guides = higher conversion)
      </div>
      <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
        Titles: {nicheProducts.slice(0, 3).map((p) => p.title).join(" · ")}
        {nicheProducts.length > 3 ? ` + ${nicheProducts.length - 3} more` : ""}
      </div>
    </div>
  );
}

function FactoryContent() {
  const params = useSearchParams();
  const opportunityId = params.get("id");

  const [products, setProducts] = useState<Product[]>([]);
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [tab, setTab] = useState<"pdf" | "sales" | "seo" | "publish">("pdf");
  const [copied, setCopied] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);

  const load = useCallback(async () => {
    const [pRes, hRes] = await Promise.all([fetch("/api/factory"), fetch("/api/hooks")]);
    const [ps, hs] = await Promise.all([pRes.json(), hRes.json()]);
    if (Array.isArray(ps)) {
      setProducts(ps);
      if (opportunityId) {
        const match = ps.find((p: Product) => p.opportunityId === opportunityId || p.id === opportunityId);
        if (match) { setSelected(match); setTab("pdf"); }
      }
    }
    if (Array.isArray(hs)) setHooks(hs);
  }, [opportunityId]);

  useEffect(() => { load(); }, [load]);

  async function generate() {
    if (!opportunityId) return;
    setGenerating(true);
    try {
      await fetch("/api/factory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId }),
      });
      await load();
    } finally {
      setGenerating(false);
    }
  }

  async function togglePublish(p: Product) {
    setPublishLoading(true);
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !p.published }),
      });
      const updated = await res.json();
      setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, ...updated } : x));
      setSelected((prev) => prev?.id === p.id ? { ...prev, ...updated } : prev);
    } finally {
      setPublishLoading(false);
    }
  }

  async function recordSale(p: Product) {
    const sym = CURRENCY[p.opportunity?.country ?? "US"] ?? "$";
    const amount = prompt(`Sale amount (${sym})?`, p.opportunity.minPrice.toFixed(2));
    if (!amount) return;
    const res = await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordSale: true, saleAmount: parseFloat(amount) }),
    });
    const updated = await res.json();
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, ...updated } : x));
    setSelected((prev) => prev?.id === p.id ? { ...prev, ...updated } : prev);
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  function buildGumroadListing(p: Product): string {
    const sym = CURRENCY[p.opportunity?.country ?? "US"] ?? "$";
    const questions = parseQuestions(p.opportunity?.exactQuestions ?? "[]");
    const bulletPoints = questions.map((q) => `• ${q}`).join("\n");
    return `TITLE:\n${p.title}\n\nDESCRIPTION:\nFinally — all the answers in one place.\n\n${bulletPoints}\n\nWhat You Get:\n• Complete step-by-step PDF guide\n• Instant download\n• Read on any device\n• Updated ${new Date().getFullYear()}\n\nPRICE: ${sym}${p.opportunity.minPrice.toFixed(2)}\n\nTAGS: pdf guide, how to, ${p.opportunity.niche}, step by step, download\n\nNOTE: For Gumroad go to gumroad.com/products/new\nFor Payhip go to payhip.com/account/products/add\nFor Selar go to selar.co/seller`;
  }

  const selectedHooks = selected
    ? hooks.filter((h) => h.text.toLowerCase().includes(selected.opportunity?.keyword?.toLowerCase()?.split(" ")[0] ?? ""))
    : hooks;

  const displayHooks = selectedHooks.length > 0 ? selectedHooks : hooks;

  const nicheGroups = products.reduce((acc, p) => {
    const n = p.opportunity?.niche ?? "general";
    acc[n] = (acc[n] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bundleNiche = Object.entries(nicheGroups).find(([, count]) => count >= 3)?.[0];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Content Factory</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          One topic → PDF guide + sales page + SEO page + 10 platform-native hooks. One click.
        </p>
      </div>

      {opportunityId && (
        <div style={S.card} className="p-5 mb-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium mb-0.5" style={{ color: "var(--text)" }}>
              Ready to generate full content package
            </div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              PDF guide + sales page + SEO page + 10 marketing hooks (TikTok, Instagram, Pinterest, Email, Twitter)
            </div>
          </div>
          <button onClick={generate} disabled={generating}
            className="px-6 py-3 text-sm font-bold text-white rounded-lg flex items-center gap-2"
            style={{ background: generating ? "var(--muted)" : "var(--accent)", cursor: generating ? "not-allowed" : "pointer" }}>
            {generating ? <><span>⚙️</span> Generating…</> : "🏭 Generate Everything →"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Products list */}
        <div style={S.card} className="overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>
              Products ({products.length})
            </div>
          </div>
          <div className="divide-y overflow-y-auto" style={{ borderColor: "var(--border)", maxHeight: 500 }}>
            {products.length === 0 ? (
              <div className="p-6 text-center text-sm" style={{ color: "var(--muted)" }}>
                No products yet. Go to PDF Idea Finder, pick a topic, and click Build PDF.
              </div>
            ) : products.map((p) => {
              const sym = CURRENCY[p.opportunity?.country ?? "US"] ?? "$";
              return (
                <div key={p.id} onClick={() => { setSelected(p); setTab("pdf"); }}
                  className="px-4 py-3 cursor-pointer"
                  style={{ background: selected?.id === p.id ? "var(--surface2)" : "transparent" }}>
                  <div className="text-xs font-medium mb-1 leading-snug" style={{ color: "var(--text)" }}>
                    {p.title}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{p.opportunity?.niche}</span>
                    <span style={{ ...S.badge(p.published ? "#10B981" : "#6366F1"), fontSize: 10 }}>
                      {p.published ? "🟢 Live" : "draft"}
                    </span>
                    {p.salesCount > 0 && (
                      <span style={{ ...S.badge("#F59E0B"), fontSize: 10 }}>
                        {p.salesCount} sold · {sym}{p.revenue.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {bundleNiche && (
            <div className="px-4 pb-4">
              <BundleSuggestion products={products} niche={bundleNiche} />
            </div>
          )}
        </div>

        {/* Content viewer */}
        <div className="col-span-2" style={S.card}>
          {!selected ? (
            <div className="flex items-center justify-center h-full min-h-64 text-center p-8">
              <div>
                <div className="text-4xl mb-3">🏭</div>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Select a product from the list, or generate one from the PDF Idea Finder.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Product header */}
              <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-bold text-sm mb-1" style={{ color: "var(--text)" }}>{selected.title}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selected.slug && (
                        <a href={`/guide/${selected.slug}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs" style={{ color: "#6366F1" }}>
                          🔗 /guide/{selected.slug}
                        </a>
                      )}
                      <span style={{ ...S.badge(selected.published ? "#10B981" : "#94a3b8"), fontSize: 10 }}>
                        {selected.published ? "🟢 Live — Google can find this" : "Not published"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {selected.salesCount > 0 && (
                      <span style={{ ...S.badge("#F59E0B"), fontSize: 11 }}>
                        {selected.salesCount} sold · {CURRENCY[selected.opportunity?.country ?? "US"] ?? "$"}{selected.revenue.toFixed(2)}
                      </span>
                    )}
                    <button onClick={() => recordSale(selected)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                      style={{ background: "#10B98120", color: "#10B981", border: "1px solid #10B98140" }}>
                      💰 Record Sale
                    </button>
                    <button onClick={() => togglePublish(selected)} disabled={publishLoading}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                      style={{
                        background: selected.published ? "#EF444420" : "#6366F120",
                        color: selected.published ? "#EF4444" : "#818CF8",
                        border: `1px solid ${selected.published ? "#EF444440" : "#6366F140"}`,
                      }}>
                      {publishLoading ? "…" : selected.published ? "Unpublish" : "🚀 Publish Page"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-6 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <div className="flex gap-1">
                  {(["pdf", "sales", "seo", "publish"] as const).map((t) => (
                    <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>
                      {t === "pdf" ? "📄 PDF Guide" : t === "sales" ? "💰 Sales Page" : t === "seo" ? "🔍 SEO Page" : "🚀 Publish & Sell"}
                    </button>
                  ))}
                </div>
                {tab !== "publish" && (
                  <button onClick={() => copy(
                    tab === "pdf" ? selected.pdfContent : tab === "sales" ? selected.salesPageCopy : selected.seoPageContent,
                    tab
                  )} className="text-xs px-3 py-1.5 rounded-lg mb-1" style={S.badge("#6366F1")}>
                    {copied === tab ? "✓ Copied!" : "Copy"}
                  </button>
                )}
              </div>

              {/* Content area */}
              {tab !== "publish" ? (
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 440 }}>
                  {tab === "pdf" && selected.slug && (
                    <div className="flex gap-2 mb-4">
                      <a href={`/guide/${selected.slug}/pdf`} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-bold px-4 py-2 rounded-lg text-white"
                        style={{ background: "var(--accent)" }}>
                        📥 Download PDF
                      </a>
                      <a href={`/guide/${selected.slug}`} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium px-4 py-2 rounded-lg"
                        style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                        🌐 View SEO Page
                      </a>
                    </div>
                  )}
                  <pre className="text-xs whitespace-pre-wrap leading-relaxed"
                    style={{ color: "var(--text)", fontFamily: "var(--font-geist-mono)" }}>
                    {tab === "pdf" ? selected.pdfContent : tab === "sales" ? selected.salesPageCopy : selected.seoPageContent}
                  </pre>
                </div>
              ) : (
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 440 }}>
                  {/* Publish & Sell tab */}
                  <div className="space-y-4">
                    {/* Live URL */}
                    <div className="p-4 rounded-lg" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                      <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                        📡 Your Free SEO Traffic Page
                      </div>
                      <div className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
                        {typeof window !== "undefined" ? window.location.origin : ""}/guide/{selected.slug}
                      </div>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {selected.published
                          ? "✅ This page is live. Google will find and rank it for exact searches."
                          : "⚠️ Click \"Publish Page\" above to make this page live and crawlable by Google."}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <a href={`/guide/${selected.slug}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                          style={{ background: "#6366F120", color: "#818CF8", border: "1px solid #6366F130" }}>
                          Preview →
                        </a>
                        <a href={`/guide/${selected.slug}/pdf`} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                          style={{ background: "#10B98120", color: "#10B981", border: "1px solid #10B98130" }}>
                          Preview PDF →
                        </a>
                        <button onClick={() => copy(`${typeof window !== "undefined" ? window.location.origin : ""}/guide/${selected.slug}`, "url")}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                          style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                          {copied === "url" ? "✓ Copied!" : "Copy URL"}
                        </button>
                      </div>
                    </div>

                    {/* Gumroad/Payhip listing */}
                    <div className="p-4 rounded-lg" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                          🛒 Ready-to-Post Listing (Gumroad / Payhip / Selar)
                        </div>
                        <button onClick={() => copy(buildGumroadListing(selected), "gumroad")}
                          className="text-xs px-3 py-1 rounded-lg font-semibold"
                          style={S.badge("#6366F1")}>
                          {copied === "gumroad" ? "✓ Copied!" : "Copy Listing"}
                        </button>
                      </div>
                      <pre className="text-xs whitespace-pre-wrap leading-relaxed overflow-auto"
                        style={{ color: "var(--text)", fontFamily: "var(--font-geist-mono)", maxHeight: 220 }}>
                        {buildGumroadListing(selected)}
                      </pre>
                    </div>

                    {/* Sales tracker */}
                    <div className="p-4 rounded-lg" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                      <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>
                        📊 Sales Tracker
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <div className="text-2xl font-black" style={{ color: "var(--text)" }}>{selected.salesCount}</div>
                          <div className="text-xs" style={{ color: "var(--muted)" }}>Units sold</div>
                        </div>
                        <div>
                          <div className="text-2xl font-black" style={{ color: "#10B981" }}>
                            {CURRENCY[selected.opportunity?.country ?? "US"] ?? "$"}{selected.revenue.toFixed(2)}
                          </div>
                          <div className="text-xs" style={{ color: "var(--muted)" }}>Revenue earned</div>
                        </div>
                      </div>
                      <button onClick={() => recordSale(selected)}
                        className="mt-3 text-xs px-4 py-2 rounded-lg font-bold"
                        style={{ background: "#10B98120", color: "#10B981", border: "1px solid #10B98140" }}>
                        + Record a Sale
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hooks section */}
      {hooks.length > 0 && (
        <div style={S.card} className="mt-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
              Marketing Hooks ({displayHooks.length})
            </h2>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              Platform-native formats — TikTok scripts, Pinterest descriptions, Email pairs
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {displayHooks.slice(0, 10).map((h) => (
              <div key={h.id} className="p-3 rounded-lg flex items-start justify-between gap-3"
                style={{ background: "var(--surface2)" }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span style={S.badge(PLATFORM_COLORS[h.platform] ?? "#6B7280")}>{h.platform}</span>
                    <span style={S.badge("#6366F1")}>{h.emotionType}</span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "var(--text)" }}>
                    {h.text}
                  </p>
                </div>
                <button onClick={() => copy(h.text, h.id)} className="text-xs shrink-0 mt-1"
                  style={{ color: copied === h.id ? "#10B981" : "var(--muted)" }}>
                  {copied === h.id ? "✓" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FactoryPage() {
  return <Suspense><FactoryContent /></Suspense>;
}
