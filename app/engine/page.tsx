"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Opportunity = {
  id: string;
  keyword: string;
  pdfTitle: string;
  painPoint: string;
  niche: string;
  country: string;
  searchVolume: number;
  opportunityScore: number;
  competition: string;
  trend: string;
  easeToSell: string;
  minPrice: number;
  maxPrice: number;
  emotionalIntent: string;
  exactQuestions: string;
  hookAngle: string;
  pdfSuitability: string;
  actionabilityRating: string;
  gapScore: number;
  platformOfOrigin: string;
  distributionStrategy: string;
  videoScript: string;
  pdfOutline: string;
  salesPage: string;
  saved: boolean;
  isQuickWin: boolean;
  isDiaspora: boolean;
};

const COUNTRIES: { value: string; label: string; name: string; symbol: string; flag: string }[] = [
  { value: "GH", label: "Ghana",         name: "GHANA",          symbol: "₵",   flag: "🇬🇭" },
  { value: "NG", label: "Nigeria",       name: "NIGERIA",        symbol: "₦",   flag: "🇳🇬" },
  { value: "KE", label: "Kenya",         name: "KENYA",          symbol: "KSh", flag: "🇰🇪" },
  { value: "ZA", label: "South Africa",  name: "SOUTH AFRICA",   symbol: "R",   flag: "🇿🇦" },
  { value: "US", label: "United States", name: "UNITED STATES",  symbol: "$",   flag: "🇺🇸" },
  { value: "GB", label: "United Kingdom",name: "UNITED KINGDOM", symbol: "£",   flag: "🇬🇧" },
  { value: "CA", label: "Canada",        name: "CANADA",         symbol: "CA$", flag: "🇨🇦" },
  { value: "AU", label: "Australia",     name: "AUSTRALIA",      symbol: "A$",  flag: "🇦🇺" },
  { value: "GLOBAL", label: "Global",    name: "GLOBAL",         symbol: "$",   flag: "🌍" },
];

const TIERS = [
  { min: 90, max: 100, label: "🟢 HIGH OPPORTUNITY (90–100)",  action: "✅ PLANT THIS FIRST", color: "#10B981", bg: "#10B98112", border: "#10B98130" },
  { min: 80, max: 89,  label: "🟡 STRONG OPPORTUNITY (80–89)", action: "✅ PLANT NEXT",        color: "#F59E0B", bg: "#F59E0B12", border: "#F59E0B30" },
  { min: 70, max: 79,  label: "🟠 GOOD OPPORTUNITY (70–79)",   action: "✅ WORTH PLANTING",    color: "#F97316", bg: "#F9731612", border: "#F9731630" },
];

const TREND_ICON: Record<string, string> = { rising: "⬆️", stable: "↔️", declining: "⬇️" };
const COMP_COLORS: Record<string, string>  = { low: "#10B981", medium: "#F59E0B", high: "#EF4444" };
const EASE_COLORS: Record<string, string>  = { easy: "#10B981", medium: "#F59E0B", hard: "#EF4444" };
const INTENT_COLORS: Record<string, string> = { fear: "#EF4444", urgency: "#F59E0B", desire: "#10B981", pain: "#EC4899", confusion: "#6366F1" };
const ORIGIN_LABEL: Record<string, string>  = { paa: "💡 PAA", duckduckgo: "🦆 DDG", community: "💬 Forum" };

function chip(label: string, color: string): React.CSSProperties {
  return { background: color + "20", color, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600, display: "inline-block", whiteSpace: "nowrap" as const };
}

function gapLabel(score: number) {
  if (score >= 60) return { label: `🏆 Empty shelf (${score})`, color: "#10B981" };
  if (score >= 35) return { label: `📭 Some gap (${score})`,    color: "#F59E0B" };
  return               { label: `📚 Well covered (${score})`,   color: "#6B7280" };
}

function volumeDisplay(vol: number) {
  if (vol >= 100000) return { label: fmt(vol) + "/mo", color: "#10B981", bg: "#10B98122", tier: "🔥 Massive Demand" };
  if (vol >= 50000)  return { label: fmt(vol) + "/mo", color: "#10B981", bg: "#10B98120", tier: "🔥 Viral Demand"   };
  if (vol >= 30000)  return { label: fmt(vol) + "/mo", color: "#10B981", bg: "#10B98118", tier: "✅ High Demand"    };
  if (vol >= 15000)  return { label: fmt(vol) + "/mo", color: "#10B981", bg: "#10B98116", tier: "✅ Strong Demand"  };
  if (vol >= 8000)   return { label: fmt(vol) + "/mo", color: "#F59E0B", bg: "#F59E0B18", tier: "✅ Good Demand"    };
  return               { label: fmt(vol) + "/mo", color: "#9CA3AF", bg: "#9CA3AF12", tier: "Emerging Demand" };
}

function fmt(v: number) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000)    return `${(v / 1000).toFixed(0)}k`;
  return String(v);
}

function parseQ(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

function exportCSV(results: Opportunity[], symbol: string) {
  const headers = ["Score", "Monthly Searches", "Demand", "Keyword", "PDF Title", "Niche", "Trend", "Competition", "Price Range", "Intent", "Questions"];
  const rows = results.map((o) => {
    const vol = volumeDisplay(o.searchVolume);
    const qs  = parseQ(o.exactQuestions).join(" | ");
    return [
      o.opportunityScore, o.searchVolume,
      `"${vol.tier.replace(/[^\w\s]/g, "").trim()}"`,
      `"${o.keyword}"`, `"${o.pdfTitle}"`, `"${o.niche}"`,
      o.trend, o.competition,
      `"${symbol}${o.minPrice}–${symbol}${o.maxPrice}"`,
      o.emotionalIntent, `"${qs}"`,
    ].join(",");
  });
  const csv  = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `pdf-ideas-${new Date().toISOString().split("T")[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export default function EnginePage() {
  const router = useRouter();

  // Core state
  const [results, setResults]   = useState<Opportunity[]>([]);
  const [saved,   setSaved]     = useState<Opportunity[]>([]);
  const [loading, setLoading]   = useState(false);
  const [keyword, setKeyword]   = useState("");
  const [niche,   setNiche]     = useState("");
  const [count,   setCount]     = useState(15);
  const [country, setCountry]   = useState("GH");
  const [diaspora, setDiaspora] = useState(false);
  const [error,   setError]     = useState("");
  const [tab,     setTab]       = useState<"results" | "saved">("results");
  const [scanInfo, setScanInfo] = useState<{ country: string; keyword: string; niche: string; diaspora: boolean; timestamp: string; total: number } | null>(null);
  const [loadingStage,   setLoadingStage]   = useState(0);
  const [loadingElapsed, setLoadingElapsed] = useState(0);

  // UI state
  const [expandedIds,    setExpandedIds]    = useState<Set<string>>(new Set());
  const [filterNiche,    setFilterNiche]    = useState("");
  const [filterComp,     setFilterComp]     = useState("");
  const [filterQuickWin, setFilterQuickWin] = useState(false);
  const [sortBy,         setSortBy]         = useState<"score" | "volume" | "ease">("score");

  const hasDiaspora  = ["GH", "NG", "KE", "ZA"].includes(country);
  const countryMeta  = COUNTRIES.find((c) => c.value === country)!;
  const symbol       = COUNTRIES.find((c) => c.value === (scanInfo?.country ?? country))?.symbol ?? "$";

  const loadSaved = useCallback(async () => {
    try {
      const res  = await fetch("/api/engine");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setSaved(data.filter((o: Opportunity) => o.saved));
    } catch {}
  }, []);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  const LOADING_STAGES = [
    { label: "Scanning what people are actively searching for",  detail: "Casting a wide net across multiple live sources", seconds: 7 },
    { label: "Scoring for urgency and real pain",                detail: "Filtering out curiosity — keeping only genuine unresolved need", seconds: 10 },
    { label: "Verifying real demand",                            detail: "Confirming these aren't just passing interests", seconds: 12 },
    { label: "Finding the empty shelves",                        detail: "Checking where demand exists but no good answer does", seconds: 10 },
    { label: "Quality gate running",                             detail: "Only keeping what genuinely solves a real problem better than a Google search", seconds: 18 },
    { label: "Building your results",                            detail: "Writing titles, outlines, and sales copy for each opportunity", seconds: 999 },
  ];

  useEffect(() => {
    if (!loading) { setLoadingStage(0); setLoadingElapsed(0); return; }
    setLoadingStage(0); setLoadingElapsed(0);
    const start = Date.now();
    const tick  = setInterval(() => setLoadingElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    let acc = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < LOADING_STAGES.length - 1; i++) {
      acc += LOADING_STAGES[i].seconds * 1000;
      const stage = i + 1;
      timers.push(setTimeout(() => setLoadingStage(stage), acc));
    }
    return () => { clearInterval(tick); timers.forEach(clearTimeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function discover() {
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, niche, count, country, diaspora: hasDiaspora && diaspora }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Error ${res.status}`);
      if (!Array.isArray(data)) throw new Error("Unexpected response");
      setResults(data);
      setTab("results");
      setScanInfo({ country, keyword, niche, diaspora: hasDiaspora && diaspora,
        timestamp: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
        total: data.length,
      });
      // Reset UI state on fresh scan
      setExpandedIds(new Set());
      setFilterNiche(""); setFilterComp(""); setFilterQuickWin(false); setSortBy("score");
      if (data.length === 0) setError("No high-demand opportunities found. Try a different country or add a keyword to narrow the search.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally { setLoading(false); }
  }

  async function toggleSave(o: Opportunity, e: React.MouseEvent) {
    e.stopPropagation();
    const newSaved = !o.saved;
    await fetch("/api/engine", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: o.id, saved: newSaved }),
    });
    const update = (r: Opportunity) => r.id === o.id ? { ...r, saved: newSaved } : r;
    setResults((prev) => prev.map(update));
    setSaved((prev) =>
      newSaved ? [...prev.filter((r) => r.id !== o.id), { ...o, saved: true }]
               : prev.filter((r) => r.id !== o.id)
    );
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // Filtered + sorted list
  const displayList = tab === "saved" ? saved : results;
  const easeRank: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
  const filteredList = displayList
    .filter((o) => !filterNiche    || o.niche       === filterNiche)
    .filter((o) => !filterComp     || o.competition === filterComp)
    .filter((o) => !filterQuickWin || o.isQuickWin)
    .sort((a, b) => {
      if (sortBy === "volume") return b.searchVolume - a.searchVolume;
      if (sortBy === "ease")   return (easeRank[a.easeToSell] ?? 1) - (easeRank[b.easeToSell] ?? 1);
      return b.opportunityScore - a.opportunityScore;
    });

  const topPickId       = filteredList.length > 0 && filteredList[0].opportunityScore >= 80 ? filteredList[0].id : null;
  const availableNiches = [...new Set(displayList.map((o) => o.niche))].filter(Boolean).sort();
  const hasFilters      = !!(filterNiche || filterComp || filterQuickWin);
  const grouped         = TIERS
    .map((tier) => ({ ...tier, items: filteredList.filter((o) => o.opportunityScore >= tier.min && o.opportunityScore <= tier.max) }))
    .filter((g) => g.items.length > 0);

  // ── Card ──────────────────────────────────────────────────────────────────
  function Card({ o }: { o: Opportunity }) {
    const isExpanded = expandedIds.has(o.id);
    const isTopPick  = o.id === topPickId;
    const questions  = parseQ(o.exactQuestions);
    const vol        = volumeDisplay(o.searchVolume);
    const parts      = (o.pdfTitle || o.keyword).split(" — ");
    const titleMain  = parts[0];
    const titleSub   = parts.slice(1).join(" — ");

    return (
      <div
        onClick={() => toggleExpand(o.id)}
        style={{
          background: "var(--surface2)",
          border: isTopPick ? "1.5px solid #F59E0B80" : "1px solid var(--border)",
          borderRadius: 10, padding: "14px 18px", marginBottom: 8, cursor: "pointer",
        }}
      >
        {/* Top Pick banner */}
        {isTopPick && (
          <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: "1px solid #F59E0B30" }}>
            <span style={{ background: "#F59E0B25", color: "#F59E0B", borderRadius: 5, padding: "2px 10px", fontSize: 11, fontWeight: 700, border: "1px solid #F59E0B50", letterSpacing: "0.05em" }}>
              ⭐ TOP PICK THIS SCAN
            </span>
            <span className="text-xs" style={{ color: "#D97706" }}>Highest scored · build this first</span>
          </div>
        )}

        {/* Compact header — always visible */}
        <div className="flex items-start gap-3">
          {/* Score */}
          <div className="flex-shrink-0 text-center pt-0.5" style={{ minWidth: 44 }}>
            <div className="text-xl font-black" style={{ color: isTopPick ? "#F59E0B" : "var(--text)" }}>{o.opportunityScore}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>/100</div>
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            {(o.isQuickWin || o.isDiaspora || (o.platformOfOrigin && o.platformOfOrigin !== "autocomplete")) && (
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                {o.isQuickWin && <span style={{ background: "#F59E0B20", color: "#F59E0B", borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700, border: "1px solid #F59E0B40" }}>🎯 QUICK WIN</span>}
                {o.isDiaspora && <span style={{ background: "#6366F120", color: "#818CF8", borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700, border: "1px solid #6366F140" }}>✈️ DIASPORA · {symbol}</span>}
                {o.platformOfOrigin && o.platformOfOrigin !== "autocomplete" && (
                  <span style={{ background: "#10B98115", color: "#10B981", borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 600, border: "1px solid #10B98130" }}>
                    {ORIGIN_LABEL[o.platformOfOrigin] ?? o.platformOfOrigin}
                  </span>
                )}
              </div>
            )}

            <div className="mb-2">
              <div className="font-bold text-sm leading-snug" style={{ color: "var(--text)" }}>{titleMain}</div>
              {titleSub && <div className="text-xs leading-snug mt-0.5" style={{ color: "var(--muted)" }}>{titleSub}</div>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: vol.bg, color: vol.color }}>
                {vol.tier} · {vol.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                {o.niche}
              </span>
              <span className="text-xs font-semibold" style={{ color: COMP_COLORS[o.competition] ?? "#6B7280" }}>
                {o.competition} comp
              </span>
              <span className="text-xs" style={{ color: EASE_COLORS[o.easeToSell] ?? "#6B7280" }}>
                · {o.easeToSell} to sell
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--text)", marginLeft: "auto" }}>
                {symbol}{o.minPrice}–{symbol}{o.maxPrice}
              </span>
            </div>
          </div>

          {/* Actions + chevron */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
            <button onClick={(e) => { e.stopPropagation(); toggleSave(o, e); }} title={o.saved ? "Saved" : "Save"}
              className="text-base px-1" style={{ color: o.saved ? "#F59E0B" : "var(--muted)" }}>
              {o.saved ? "🔖" : "🏷️"}
            </button>
            <button onClick={(e) => { e.stopPropagation(); router.push(`/factory?id=${o.id}`); }}
              className="px-3 py-1.5 text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)", borderRadius: 999, boxShadow: "0 2px 8px rgba(124,58,237,0.25)" }}>
              Build →
            </button>
            <span className="text-xs ml-0.5 select-none" style={{ color: "var(--muted)" }}>{isExpanded ? "▲" : "▼"}</span>
          </div>
        </div>

        {/* Expanded detail */}
        {isExpanded && (
          <div className="mt-4 pt-3 space-y-3" style={{ borderTop: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="text-xs italic" style={{ color: "var(--muted)" }}>Search: &ldquo;{o.keyword}&rdquo;</div>

            {o.painPoint && (
              <div className="px-3 py-2.5 rounded-lg"
                style={{ background: `${INTENT_COLORS[o.emotionalIntent] ?? "#6366F1"}0D`, borderLeft: `3px solid ${INTENT_COLORS[o.emotionalIntent] ?? "#6366F1"}` }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: INTENT_COLORS[o.emotionalIntent] ?? "#6366F1" }}>
                  The pain this PDF solves
                </div>
                <div className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>{o.painPoint}</div>
              </div>
            )}

            <div className="flex items-center gap-3 px-3 py-2 rounded-lg"
              style={{ background: vol.bg, border: `1px solid ${vol.color}30` }}>
              <span className="text-xs font-bold" style={{ color: vol.color }}>{vol.tier}</span>
              <span className="text-lg font-black" style={{ color: vol.color }}>{vol.label}</span>
              <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>monthly searches</span>
            </div>

            {o.gapScore > 0 && (() => { const g = gapLabel(o.gapScore); return (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: g.color + "12", border: `1px solid ${g.color}30` }}>
                <span className="text-xs font-bold" style={{ color: g.color }}>{g.label}</span>
                <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>
                  — existing answers are {o.gapScore >= 60 ? "gov sites / Wikipedia / outdated" : "partial"}
                </span>
              </div>
            ); })()}

            {questions.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Real problems searched:</div>
                <div className="flex flex-wrap gap-2">
                  {questions.slice(0, 4).map((q, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>
                      &ldquo;{q}&rdquo;
                    </span>
                  ))}
                </div>
              </div>
            )}

            {o.hookAngle && (
              <div className="px-3 py-2 rounded-lg" style={{ background: "#6366F108", border: "1px solid #6366F120" }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#818CF8" }}>Hook angle</div>
                <div className="text-xs italic" style={{ color: "var(--text)" }}>&ldquo;{o.hookAngle}&rdquo;</div>
              </div>
            )}

            {o.distributionStrategy && (
              <div className="px-3 py-2.5 rounded-lg" style={{ background: "#F59E0B08", border: "1px solid #F59E0B25" }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#D97706" }}>🎯 Where to plant this</div>
                <div className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>{o.distributionStrategy}</div>
              </div>
            )}

            {(() => {
              try {
                const outline: { title: string; brief: string }[] = JSON.parse(o.pdfOutline || "[]");
                if (!Array.isArray(outline) || outline.length === 0) return null;
                return (
                  <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer list-none px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider select-none"
                      style={{ background: "#3B82F608", border: "1px solid #3B82F620", color: "#60A5FA" }}>
                      <span className="group-open:hidden">▶</span><span className="hidden group-open:inline">▼</span>
                      📄 PDF Outline — {outline.length} Chapters
                    </summary>
                    <div className="mt-2 space-y-1.5 pl-1">
                      {outline.map((ch, i) => (
                        <div key={i} className="flex gap-2 text-xs">
                          <span className="font-bold shrink-0" style={{ color: "#60A5FA" }}>{i + 1}.</span>
                          <div>
                            <span className="font-semibold" style={{ color: "var(--text)" }}>{ch.title}</span>
                            {ch.brief && <span style={{ color: "var(--muted)" }}> — {ch.brief}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                );
              } catch { return null; }
            })()}

            {(() => {
              try {
                const sp = JSON.parse(o.salesPage || "{}") as { headline?: string; subHeadline?: string; bullets?: string[]; cta?: string; guarantee?: string };
                if (!sp.headline) return null;
                return (
                  <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer list-none px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider select-none"
                      style={{ background: "#10B98108", border: "1px solid #10B98125", color: "#10B981" }}>
                      <span className="group-open:hidden">▶</span><span className="hidden group-open:inline">▼</span>
                      💰 Sales Page — Copy-Paste Ready
                    </summary>
                    <div className="mt-2 space-y-2.5 pl-1">
                      {sp.headline && (
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--muted)" }}>Headline</div>
                          <div className="text-sm font-bold leading-snug" style={{ color: "var(--text)" }}>{sp.headline}</div>
                        </div>
                      )}
                      {sp.subHeadline && (
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--muted)" }}>Sub-headline</div>
                          <div className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>{sp.subHeadline}</div>
                        </div>
                      )}
                      {Array.isArray(sp.bullets) && sp.bullets.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>Benefit Bullets</div>
                          <div className="space-y-1">
                            {sp.bullets.map((b, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-xs">
                                <span style={{ color: "#10B981" }}>✓</span>
                                <span style={{ color: "var(--text)" }}>{b}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {sp.cta && (
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>CTA Button Text</div>
                          <div className="inline-block text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "var(--accent)", color: "#fff" }}>{sp.cta}</div>
                        </div>
                      )}
                      {sp.guarantee && (
                        <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                          🛡️ {sp.guarantee}
                        </div>
                      )}
                    </div>
                  </details>
                );
              } catch { return null; }
            })()}

            <div className="flex flex-wrap items-center gap-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
              <span style={chip(`${TREND_ICON[o.trend] ?? "↔️"} ${o.trend}`, o.trend === "rising" ? "#10B981" : o.trend === "declining" ? "#EF4444" : "#6366F1")}>
                {TREND_ICON[o.trend] ?? "↔️"} {o.trend}
              </span>
              <span style={chip(`Competition: ${o.competition}`, COMP_COLORS[o.competition] ?? "#6B7280")}>Competition: {o.competition}</span>
              <span style={chip(`Ease: ${o.easeToSell}`, EASE_COLORS[o.easeToSell] ?? "#6B7280")}>Ease: {o.easeToSell}</span>
              <span style={chip(o.emotionalIntent, INTENT_COLORS[o.emotionalIntent] ?? "#6B7280")}>{o.emotionalIntent}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Page ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>PDF Idea Finder</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Pick a market. Hit discover. The engine finds what people are urgently trying to resolve, checks how poorly the internet currently answers it, and only surfaces what genuinely clears the bar.
        </p>
      </div>

      {/* Controls */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} className="p-5 mb-5">
        <div className="mb-4">
          <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: "var(--muted)" }}>
            Country — What market are you targeting?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            {COUNTRIES.filter((c) => c.value !== "GLOBAL").map((c) => (
              <button key={c.value} onClick={() => setCountry(c.value)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: country === c.value ? "var(--accent)" : "var(--surface2)",
                  color:      country === c.value ? "#fff"          : "var(--muted)",
                  border:    `1px solid ${country === c.value ? "var(--accent)" : "var(--border)"}`,
                }}>
                <span>{c.flag}</span><span>{c.label}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setCountry("GLOBAL")}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: country === "GLOBAL" ? "var(--accent)" : "var(--surface2)",
              color:      country === "GLOBAL" ? "#fff"          : "var(--muted)",
              border:    `1px solid ${country === "GLOBAL" ? "var(--accent)" : "var(--border)"}`,
            }}>
            <span>🌍</span>
            <span>Global — Universal pain, no country assumption. Borderless PDFs. Market suggestions included.</span>
          </button>
        </div>

        {hasDiaspora && (
          <div className="mb-4">
            <button onClick={() => setDiaspora(!diaspora)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all"
              style={{
                background: diaspora ? "#6366F115" : "var(--surface2)",
                border:    `1px solid ${diaspora ? "#6366F1" : "var(--border)"}`,
                color:      diaspora ? "#818CF8"   : "var(--muted)",
              }}>
              <span className="text-lg">{diaspora ? "✈️" : "🌍"}</span>
              <div className="text-left flex-1">
                <div className="font-semibold" style={{ color: diaspora ? "#818CF8" : "var(--text)" }}>
                  {diaspora ? "Diaspora Mode ON — searching for UK-based buyers" : "Diaspora Mode — target Ghanaians/Nigerians living in the UK"}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {diaspora
                    ? "Priced in £ · Western purchasing power · Near-zero competition on homeland-specific guides"
                    : "Toggle to find hidden opportunities for diaspora buyers — they pay in £ and have no local contacts to help them"}
                </div>
              </div>
              <div className="flex-shrink-0 w-10 h-5 rounded-full relative transition-all" style={{ background: diaspora ? "#6366F1" : "var(--border)" }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: diaspora ? "22px" : "2px" }} />
              </div>
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1.5 flex-1" style={{ minWidth: 0 }}>
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Keyword <span className="normal-case font-normal tracking-normal">(optional)</span>
            </label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && discover()}
              placeholder={`e.g. "mobile money", "passport", "farming"`}
              className="px-3 py-2.5 text-sm rounded-lg"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", outline: "none" }} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1" style={{ minWidth: 0 }}>
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Niche <span className="normal-case font-normal tracking-normal">(optional — go deep on one domain)</span>
            </label>
            <input value={niche} onChange={(e) => setNiche(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && discover()}
              placeholder={`e.g. "parenting", "finance", "exams", "health"`}
              className="px-3 py-2.5 text-sm rounded-lg"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", outline: "none" }} />
          </div>
          <div className="flex flex-col gap-1.5" style={{ minWidth: 130 }}>
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Results: <span style={{ color: "var(--text)" }}>{count}</span>
            </label>
            <input type="range" min={5} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))}
              className="w-full" style={{ accentColor: "var(--accent)", cursor: "pointer", marginTop: 6 }} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={discover} disabled={loading}
            className="px-8 py-3 text-sm font-bold text-white flex items-center gap-2"
            style={{ background: loading ? "#9CA3AF" : "linear-gradient(135deg, #7C3AED, #4F46E5)", borderRadius: 999, boxShadow: loading ? "none" : "0 4px 16px rgba(124,58,237,0.3)", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading
              ? <><span>⚙️</span> Scanning {countryMeta.flag} {country === "GLOBAL" ? "all markets" : countryMeta.label}…</>
              : <>{countryMeta.flag} {country === "GLOBAL" ? "Discover What the World Needs" : `Discover What's Worth Making in ${countryMeta.label}`}</>}
          </button>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {keyword ? `Keyword: "${keyword}"` : niche ? `Niche: "${niche}"` : country === "GLOBAL" ? "Universal pain scan" : `Full scan · ${countryMeta.label}`}
            {(keyword || niche) && country !== "GLOBAL" ? ` · ${countryMeta.label}` : ""}{" · "}7 sources
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{ background: "#EF444420", color: "#EF4444", border: "1px solid #EF444440" }}>
          {error}
        </div>
      )}

      {/* Scan header */}
      {scanInfo && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} className="p-4 mb-3">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="text-base font-bold" style={{ color: "var(--text)" }}>
                📊 {scanInfo.country === "GLOBAL" ? "WHAT THE WORLD NEEDS" : `WHAT'S WORTH MAKING IN ${COUNTRIES.find((c) => c.value === scanInfo.country)?.name}`}
                {keyword ? ` · "${keyword.toUpperCase()}"` : scanInfo.country === "GLOBAL" ? " · UNIVERSAL PAIN SCAN" : " · LIVE DISCOVERY"}
              </div>
              <div className="text-xs mt-0.5 flex items-center gap-3 flex-wrap" style={{ color: "var(--muted)" }}>
                <span>{scanInfo.timestamp}</span>
                <span style={{ color: "#10B981" }}>✓ Quality gate passed · real demand · genuinely underserved</span>
                {(scanInfo.keyword || scanInfo.niche) && (
                  <span style={{ color: "var(--accent)" }}>
                    {scanInfo.keyword ? `Keyword: "${scanInfo.keyword}"` : `Niche: "${scanInfo.niche}"`}
                  </span>
                )}
                <span>{scanInfo.total} opportunities found</span>
              </div>
            </div>
            <div className="flex gap-2">
              {([["results", results.length], ["saved", saved.length]] as const).map(([t, n]) => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: tab === t ? "var(--accent)" : "var(--surface2)", color: tab === t ? "#fff" : "var(--muted)", border: "1px solid var(--border)" }}>
                  {t === "results" ? `Results (${n})` : `Saved (${n})`}
                </button>
              ))}
              {results.length > 0 && (
                <button onClick={() => exportCSV(results, symbol)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                  ⬇ CSV
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      {displayList.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }} className="p-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Niche */}
            <select value={filterNiche} onChange={(e) => setFilterNiche(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg"
              style={{ background: "var(--surface2)", border: `1px solid ${filterNiche ? "var(--accent)" : "var(--border)"}`, color: filterNiche ? "var(--accent)" : "var(--text)", cursor: "pointer", outline: "none" }}>
              <option value="">All niches</option>
              {availableNiches.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>

            {/* Competition */}
            {(["", "low", "medium", "high"] as const).map((c) => {
              const active = c === "" ? filterComp === "" : filterComp === c;
              return (
                <button key={c}
                  onClick={() => setFilterComp(c === "" ? "" : filterComp === c ? "" : c)}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                  style={{
                    background: active ? "var(--accent)" : "var(--surface2)",
                    color:      active ? "#fff"          : "var(--muted)",
                    border:    `1px solid ${active ? "transparent" : "var(--border)"}`,
                  }}>
                  {c === "" ? "All comp" : c + " comp"}
                </button>
              );
            })}

            {/* Quick Wins */}
            <button onClick={() => setFilterQuickWin(!filterQuickWin)}
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
              style={{
                background: filterQuickWin ? "#F59E0B20" : "var(--surface2)",
                color:      filterQuickWin ? "#F59E0B"   : "var(--muted)",
                border:    `1px solid ${filterQuickWin ? "#F59E0B60" : "var(--border)"}`,
              }}>
              🎯 Quick Wins
            </button>

            {/* Sort */}
            <div className="flex items-center gap-1 md:ml-auto">
              <span className="text-xs mr-1" style={{ color: "var(--muted)" }}>Sort:</span>
              {(["score", "volume", "ease"] as const).map((s) => (
                <button key={s} onClick={() => setSortBy(s)}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                  style={{
                    background: sortBy === s ? "var(--accent)" : "var(--surface2)",
                    color:      sortBy === s ? "#fff"          : "var(--muted)",
                    border:    `1px solid ${sortBy === s ? "transparent" : "var(--border)"}`,
                  }}>
                  {s === "score" ? "Score" : s === "volume" ? "Volume" : "Easiest"}
                </button>
              ))}
            </div>
          </div>

          {/* Count + expand/collapse all */}
          <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              Showing <strong style={{ color: "var(--text)" }}>{filteredList.length}</strong> of {displayList.length}
              {hasFilters && (
                <>
                  {" · filtered · "}
                  <button onClick={() => { setFilterNiche(""); setFilterComp(""); setFilterQuickWin(false); }}
                    className="underline" style={{ color: "var(--accent)" }}>
                    clear
                  </button>
                </>
              )}
            </span>
            <div className="flex gap-3">
              <button onClick={() => setExpandedIds(new Set(filteredList.map((o) => o.id)))}
                className="text-xs" style={{ color: "var(--accent)" }}>Expand all</button>
              <button onClick={() => setExpandedIds(new Set())}
                className="text-xs" style={{ color: "var(--muted)" }}>Collapse all</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} className="p-10 text-center">
          <div className="flex justify-center mb-5">
            <div className="relative inline-block">
              <span className="text-4xl">{countryMeta.flag}</span>
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#10B981" }}></span>
                <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "#10B981" }}></span>
              </span>
            </div>
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>{LOADING_STAGES[loadingStage].label}…</p>
          <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>{LOADING_STAGES[loadingStage].detail}</p>
          <div className="w-64 mx-auto rounded-full mb-3" style={{ height: 3, background: "var(--border)" }}>
            <div className="rounded-full transition-all duration-700 ease-out" style={{
              height: 3, background: "var(--accent)",
              width: `${Math.min(96, Math.round((loadingElapsed / 57) * 100))}%`,
            }} />
          </div>
          <div className="flex justify-center gap-1.5 mb-3">
            {LOADING_STAGES.slice(0, -1).map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-300" style={{
                width: i === loadingStage ? 16 : 6, height: 6,
                background: i <= loadingStage ? "var(--accent)" : "var(--border)",
              }} />
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>{loadingElapsed}s elapsed · quality gate running — don&apos;t refresh</p>
        </div>
      )}

      {/* Empty — no results at all */}
      {!loading && displayList.length === 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} className="p-16 text-center">
          <div className="text-5xl mb-4">{tab === "saved" ? "🔖" : countryMeta.flag}</div>
          <p className="text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
            {tab === "saved" ? "No saved ideas yet" : country === "GLOBAL" ? "Ready to discover what the world needs?" : `Ready to discover what ${countryMeta.label} needs?`}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {tab === "saved"
              ? "Click the 🏷️ bookmark on any result to save it here."
              : country === "GLOBAL"
              ? "Global mode scans universal pain — grief, debt, anxiety, relationships, career. No country assumption."
              : "Click the button above — the engine scans everything and surfaces only what's worth making."}
          </p>
        </div>
      )}

      {/* Empty — filters returned nothing */}
      {!loading && displayList.length > 0 && filteredList.length === 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }} className="p-8 text-center mb-4">
          <p className="text-sm font-medium mb-2" style={{ color: "var(--text)" }}>No results match your current filters</p>
          <button onClick={() => { setFilterNiche(""); setFilterComp(""); setFilterQuickWin(false); }}
            className="text-xs underline" style={{ color: "var(--accent)" }}>Clear filters</button>
        </div>
      )}

      {/* Results */}
      {!loading && grouped.length > 0 && (
        <div className="space-y-5">
          {grouped.map((tier) => (
            <div key={tier.label}>
              <div className="flex items-center justify-between px-4 py-2.5 rounded-lg mb-3"
                style={{ background: tier.bg, border: `1px solid ${tier.border}` }}>
                <span className="font-bold text-sm" style={{ color: tier.color }}>{tier.label}</span>
                <span className="text-xs font-semibold" style={{ color: tier.color }}>{tier.action}</span>
              </div>
              {tier.items.map((o) => <Card key={o.id} o={o} />)}
            </div>
          ))}
          <div className="px-4 py-3 rounded-lg text-xs"
            style={{ background: "#0F172A08", border: "1px solid #E2E8F0", color: "#64748B" }}>
            Every result shown here passed a full quality gate — real demand, genuinely underserved, and useful enough to be worth paying for.
          </div>
        </div>
      )}
    </div>
  );
}
