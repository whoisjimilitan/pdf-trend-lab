"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Brand = "pdfseeds" | "brotherjimi";

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

const COUNTRIES = [
  { value: "GH",     label: "Ghana",          symbol: "₵",   flag: "🇬🇭" },
  { value: "NG",     label: "Nigeria",        symbol: "₦",   flag: "🇳🇬" },
  { value: "KE",     label: "Kenya",          symbol: "KSh", flag: "🇰🇪" },
  { value: "ZA",     label: "South Africa",   symbol: "R",   flag: "🇿🇦" },
  { value: "US",     label: "United States",  symbol: "$",   flag: "🇺🇸" },
  { value: "GB",     label: "United Kingdom", symbol: "£",   flag: "🇬🇧" },
  { value: "CA",     label: "Canada",         symbol: "CA$", flag: "🇨🇦" },
  { value: "AU",     label: "Australia",      symbol: "A$",  flag: "🇦🇺" },
  { value: "GLOBAL", label: "Global",         symbol: "$",   flag: "🌍" },
];

const BJ_PAIN_DOMAINS = [
  { value: "grief",      label: "Grief & Loss",         flag: "🕊️" },
  { value: "doubt",      label: "Doubt & Distance",     flag: "🌫️" },
  { value: "shame",      label: "Shame & Guilt",        flag: "🔒" },
  { value: "loneliness", label: "Loneliness",           flag: "🌑" },
  { value: "fear",       label: "Fear & Anxiety",       flag: "⚡" },
  { value: "exhaustion", label: "Exhaustion & Burnout", flag: "🍂" },
  { value: "identity",   label: "Identity & Purpose",   flag: "🧭" },
  { value: "faith",      label: "Faith & Healing",      flag: "✨" },
];

const TIERS = [
  { min: 90, max: 100, label: "Highest signal — build first",      color: "#10B981", bg: "#10B98110", border: "#10B98128" },
  { min: 80, max: 89,  label: "Strong signal — build next",        color: "#F59E0B", bg: "#F59E0B10", border: "#F59E0B28" },
  { min: 70, max: 79,  label: "Worth building",                    color: "#F97316", bg: "#F9731610", border: "#F9731628" },
];

const COMP_COLORS: Record<string, string> = { low: "#10B981", medium: "#F59E0B", high: "#EF4444" };
const EASE_COLORS: Record<string, string> = { easy: "#10B981", medium: "#F59E0B", hard: "#EF4444" };
const INTENT_COLORS: Record<string, string> = { fear: "#EF4444", urgency: "#F59E0B", desire: "#10B981", pain: "#EC4899", confusion: "#6366F1", grief: "#8B5CF6", shame: "#F43F5E", doubt: "#6366F1", loneliness: "#6B7280" };

function fmt(v: number) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return String(v);
}

function volumeDisplay(vol: number) {
  if (vol >= 50000)  return { label: fmt(vol) + "/mo", color: "#10B981", bg: "#10B98118", tier: "Massive demand" };
  if (vol >= 15000)  return { label: fmt(vol) + "/mo", color: "#10B981", bg: "#10B98114", tier: "Strong demand" };
  if (vol >= 5000)   return { label: fmt(vol) + "/mo", color: "#F59E0B", bg: "#F59E0B14", tier: "Solid demand" };
  if (vol >= 2000)   return { label: fmt(vol) + "/mo", color: "#F97316", bg: "#F9731614", tier: "Emerging" };
  return { label: fmt(vol) + "/mo", color: "#9CA3AF", bg: "#9CA3AF10", tier: "Niche" };
}

function gapLabel(score: number) {
  if (score >= 60) return { label: `Empty shelf (${score})`, color: "#10B981" };
  if (score >= 35) return { label: `Some gap (${score})`, color: "#F59E0B" };
  return { label: `Well covered (${score})`, color: "#6B7280" };
}

function parseJSON<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function exportCSV(results: Opportunity[], symbol: string) {
  const headers = ["Score", "Monthly Searches", "Keyword", "PDF Title", "Niche", "Competition", "Price Min"];
  const rows = results.map((o) => [o.opportunityScore, o.searchVolume, `"${o.keyword}"`, `"${o.pdfTitle}"`, o.niche, o.competition, `${symbol}${o.minPrice}`].join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `opportunities-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ─── Brand Config (client-side) ──────────────────────────────────────────────

const BRAND_META: Record<Brand, {
  name: string;
  tagline: string;
  scanCTA: (market: string) => string;
  loadingVerb: string;
  painLabel: string;
  emptyHeading: (market: string) => string;
  emptyBody: string;
  accentColor: string;
  symbol: string;
}> = {
  pdfseeds: {
    name: "PDFSeeds",
    tagline: "Find where confusion is highest and no clear answer exists. That gap is your product.",
    scanCTA: (m) => `Scan ${m} for real pain`,
    loadingVerb: "Scanning live searches",
    painLabel: "The pain this PDF resolves",
    emptyHeading: (m) => `Ready to find what ${m} needs?`,
    emptyBody: "The engine scans live search data, scores for urgency, checks existing supply, and surfaces only what clears the bar.",
    accentColor: "#7C3AED",
    symbol: "£",
  },
  brotherjimi: {
    name: "Brother Jimi",
    tagline: "Find what people are carrying that nobody has packaged as a pastoral guide. That weight is your word.",
    scanCTA: (m) => `Find what ${m} is carrying`,
    loadingVerb: "Listening for what people can't say out loud",
    painLabel: "What they are carrying",
    emptyHeading: () => "Ready to find what needs a pastoral word?",
    emptyBody: "The engine listens to real human searches — grief, doubt, shame, loneliness — and surfaces the emotional weight that has no clean packaged answer yet.",
    accentColor: "#B07830",
    symbol: "£",
  },
};

const LOADING_STAGES_BY_BRAND: Record<Brand, { label: string; detail: string; seconds: number }[]> = {
  pdfseeds: [
    { label: "Scanning what people are actively searching for", detail: "7 live sources — Google, YouTube, Bing, Reddit, Quora, PAA, DuckDuckGo", seconds: 7 },
    { label: "Scoring for urgency and real pain", detail: "Filtering curiosity — keeping only genuine unresolved need with willingness to pay", seconds: 10 },
    { label: "Verifying real demand", detail: "Cross-source validation — if 3 engines confirm it, it's real", seconds: 12 },
    { label: "Finding the empty shelves", detail: "Checking where demand exists but no good answer does yet", seconds: 10 },
    { label: "Running the quality gate", detail: "Only keeping what genuinely solves a real problem better than a Google search", seconds: 18 },
    { label: "Building your results", detail: "Generating titles, outlines, sales copy, video scripts, and distribution strategy", seconds: 999 },
  ],
  brotherjimi: [
    { label: "Listening for what people are carrying", detail: "Scanning grief, doubt, shame, loneliness, exhaustion — the weight that searches can't name directly", seconds: 7 },
    { label: "Identifying which weight has no pastoral answer yet", detail: "Looking for the empty shelf — real pain, no clear guide in sight", seconds: 10 },
    { label: "Confirming the signal is real", detail: "Cross-checking across multiple sources — real searches, not assumptions", seconds: 12 },
    { label: "Assessing the gap", detail: "Is there already a pastoral guide for this? If not — that gap is the opportunity", seconds: 10 },
    { label: "Passing the integrity gate", detail: "Only surfacing what Brother Jimi can speak to with authenticity and warmth", seconds: 18 },
    { label: "Writing the first word", detail: "Generating the pastoral arc, the pain point, the benediction, the social word", seconds: 999 },
  ],
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EnginePage() {
  const router = useRouter();

  const [brand, setBrand] = useState<Brand>("pdfseeds");
  const [results, setResults] = useState<Opportunity[]>([]);
  const [saved, setSaved] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [niche, setNiche] = useState("");
  const [count, setCount] = useState(15);
  const [country, setCountry] = useState("GH");
  const [bjDomain, setBjDomain] = useState("grief");
  const [diaspora, setDiaspora] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"results" | "saved" | "history">("results");
  const [history, setHistory] = useState<Opportunity[]>([]);
  const [scanInfo, setScanInfo] = useState<{ market: string; total: number; timestamp: string } | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingElapsed, setLoadingElapsed] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filterComp, setFilterComp] = useState("");
  const [filterQuickWin, setFilterQuickWin] = useState(false);
  const [sortBy, setSortBy] = useState<"score" | "volume" | "ease">("score");

  const bm = BRAND_META[brand];
  const stages = LOADING_STAGES_BY_BRAND[brand];
  const hasDiaspora = ["GH", "NG", "KE", "ZA"].includes(country);
  const countryMeta = COUNTRIES.find((c) => c.value === country)!;
  const symbol = COUNTRIES.find((c) => c.value === (scanInfo ? country : country))?.symbol ?? "£";

  const loadSaved = useCallback(async () => {
    try {
      const res = await fetch("/api/engine");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setSaved(data.filter((o: Opportunity) => o.saved));
        setHistory(data);
      }
    } catch {}
  }, []);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  // Dispatch brand-change event so AppShell sidebar syncs immediately
  useEffect(() => {
    localStorage.setItem("engine-brand", brand);
    window.dispatchEvent(new CustomEvent("brand-change", { detail: brand }));
  }, [brand]);

  // Restore last scan from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem("engine-last-scan");
      if (cached) {
        const parsed = JSON.parse(cached) as { results: Opportunity[]; scanInfo: typeof scanInfo };
        if (parsed.results?.length) {
          setResults(parsed.results);
          setScanInfo(parsed.scanInfo);
          setSaved((prev) => prev.length ? prev : parsed.results.filter((o) => o.saved));
        }
      }
      const savedBrand = localStorage.getItem("engine-brand") as Brand | null;
      if (savedBrand && (savedBrand === "pdfseeds" || savedBrand === "brotherjimi")) {
        setBrand(savedBrand);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) { setLoadingStage(0); setLoadingElapsed(0); return; }
    setLoadingStage(0); setLoadingElapsed(0);
    const start = Date.now();
    const tick = setInterval(() => setLoadingElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    let acc = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < stages.length - 1; i++) {
      acc += stages[i].seconds * 1000;
      const s = i + 1;
      timers.push(setTimeout(() => setLoadingStage(s), acc));
    }
    return () => { clearInterval(tick); timers.forEach(clearTimeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, brand]);

  async function discover() {
    setError(""); setLoading(true);
    const effectiveCountry = brand === "brotherjimi" ? "GLOBAL" : country;
    const effectiveNiche = brand === "brotherjimi" ? bjDomain : niche;
    try {
      const res = await fetch("/api/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword, niche: effectiveNiche, count, country: effectiveCountry,
          diaspora: hasDiaspora && diaspora,
          brand,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Error ${res.status}`);
      if (!Array.isArray(data)) throw new Error("Unexpected response");
      setResults(data);
      setTab("results");
      const newScanInfo = {
        market: brand === "brotherjimi" ? BJ_PAIN_DOMAINS.find((d) => d.value === bjDomain)?.label ?? bjDomain : countryMeta.label,
        total: data.length,
        timestamp: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
      };
      setScanInfo(newScanInfo);
      try { localStorage.setItem("engine-last-scan", JSON.stringify({ results: data, scanInfo: newScanInfo })); } catch {}
      setHistory((prev) => {
        const ids = new Set(data.map((o: Opportunity) => o.id));
        return [...data, ...prev.filter((o) => !ids.has(o.id))];
      });
      setExpandedIds(new Set());
      setFilterComp(""); setFilterQuickWin(false); setSortBy("score");
      if (data.length === 0) setError("No high-signal opportunities found for this market. Try a different domain or keyword.");
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
    setSaved((prev) => newSaved ? [...prev.filter((r) => r.id !== o.id), { ...o, saved: true }] : prev.filter((r) => r.id !== o.id));
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const displayList = tab === "saved" ? saved : tab === "history" ? history : results;
  const easeRank: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
  const filteredList = displayList
    .filter((o) => !filterComp || o.competition === filterComp)
    .filter((o) => !filterQuickWin || o.isQuickWin)
    .sort((a, b) => {
      if (sortBy === "volume") return b.searchVolume - a.searchVolume;
      if (sortBy === "ease") return (easeRank[a.easeToSell] ?? 1) - (easeRank[b.easeToSell] ?? 1);
      return b.opportunityScore - a.opportunityScore;
    });

  const topPickId = filteredList.length > 0 && filteredList[0].opportunityScore >= 80 ? filteredList[0].id : null;
  const grouped = TIERS
    .map((tier) => ({ ...tier, items: filteredList.filter((o) => o.opportunityScore >= tier.min && o.opportunityScore <= tier.max) }))
    .filter((g) => g.items.length > 0);

  // ─── Card ─────────────────────────────────────────────────────────────────

  function Card({ o }: { o: Opportunity }) {
    const isExpanded = expandedIds.has(o.id);
    const isTopPick = o.id === topPickId;
    const vol = volumeDisplay(o.searchVolume);
    const questions = parseJSON<string[]>(o.exactQuestions, []);
    const outline = parseJSON<{ title: string; brief: string }[]>(o.pdfOutline, []);
    const salesPage = parseJSON<{ headline?: string; subHeadline?: string; bullets?: string[]; cta?: string; guarantee?: string }>(o.salesPage, {});
    const videoScript = parseJSON<{ hook?: string; tease?: string; cta?: string }>(o.videoScript, {});
    const intentColor = INTENT_COLORS[o.emotionalIntent] ?? bm.accentColor;

    const titleParts = (o.pdfTitle || o.keyword).split(" — ");
    const titleMain = titleParts[0];
    const titleSub = titleParts.slice(1).join(" — ");

    return (
      <div
        onClick={() => toggleExpand(o.id)}
        style={{
          background: "var(--surface2)",
          border: isTopPick ? `1.5px solid ${bm.accentColor}60` : "1px solid var(--border)",
          borderRadius: 10, padding: "14px 18px", marginBottom: 8, cursor: "pointer",
          transition: "border-color 0.2s",
        }}
      >
        {/* Top pick */}
        {isTopPick && (
          <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: `1px solid ${bm.accentColor}20` }}>
            <span style={{ background: bm.accentColor + "22", color: bm.accentColor, borderRadius: 5, padding: "2px 10px", fontSize: 11, fontWeight: 700, border: `1px solid ${bm.accentColor}40`, letterSpacing: "0.05em" }}>
              {brand === "brotherjimi" ? "✦ HIGHEST SIGNAL" : "⭐ TOP PICK THIS SCAN"}
            </span>
            <span className="text-xs" style={{ color: bm.accentColor }}>{brand === "brotherjimi" ? "deepest need — write this first" : "strongest signal — build this first"}</span>
          </div>
        )}

        {/* Always-visible header */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-center pt-0.5" style={{ minWidth: 44 }}>
            <div className="text-xl font-black" style={{ color: isTopPick ? bm.accentColor : "var(--text)" }}>{o.opportunityScore}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>/100</div>
          </div>

          <div className="flex-1 min-w-0">
            {(o.isQuickWin || o.isDiaspora) && (
              <div className="flex items-center gap-1.5 mb-1.5">
                {o.isQuickWin && <span style={{ background: "#F59E0B20", color: "#F59E0B", borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700, border: "1px solid #F59E0B40" }}>🎯 QUICK WIN</span>}
                {o.isDiaspora && <span style={{ background: "#6366F120", color: "#818CF8", borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700, border: "1px solid #6366F140" }}>✈️ DIASPORA</span>}
              </div>
            )}

            <div className="mb-2">
              <div className="font-bold text-sm leading-snug" style={{ color: "var(--text)" }}>{titleMain}</div>
              {titleSub && <div className="text-xs leading-snug mt-0.5" style={{ color: "var(--muted)" }}>{titleSub}</div>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: vol.bg, color: vol.color }}>{vol.tier} · {vol.label}</span>
              <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}>{o.niche}</span>
              <span className="text-xs font-semibold" style={{ color: COMP_COLORS[o.competition] ?? "#6B7280" }}>{o.competition} comp</span>
              <span className="text-xs font-bold" style={{ color: "var(--text)", marginLeft: "auto" }}>{symbol}{o.minPrice}–{symbol}{o.maxPrice}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
            <button onClick={(e) => { e.stopPropagation(); toggleSave(o, e); }} title={o.saved ? "Saved" : "Save"} className="text-base px-1" style={{ color: o.saved ? bm.accentColor : "var(--muted)" }}>
              {o.saved ? "🔖" : "🏷️"}
            </button>
            <button onClick={(e) => { e.stopPropagation(); router.push(`/factory?id=${o.id}&niche=${encodeURIComponent(o.niche)}`); }}
              className="px-3 py-1.5 text-xs font-bold text-white"
              style={{ background: bm.accentColor, borderRadius: 999, boxShadow: `0 2px 8px ${bm.accentColor}40` }}>
              {brand === "brotherjimi" ? "Write →" : "Build →"}
            </button>
            <span className="text-xs ml-0.5 select-none" style={{ color: "var(--muted)" }}>{isExpanded ? "▲" : "▼"}</span>
          </div>
        </div>

        {/* Expanded detail */}
        {isExpanded && (
          <div className="mt-4 pt-3 space-y-3" style={{ borderTop: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="text-xs italic" style={{ color: "var(--muted)" }}>
              {brand === "brotherjimi" ? "Signal: " : "Search: "}&ldquo;{o.keyword}&rdquo;
            </div>

            {/* Pain point */}
            {o.painPoint && (
              <div className="px-3 py-2.5 rounded-lg" style={{ background: intentColor + "0D", borderLeft: `3px solid ${intentColor}` }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: intentColor }}>{bm.painLabel}</div>
                <div className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>{o.painPoint}</div>
              </div>
            )}

            {/* Volume */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: vol.bg, border: `1px solid ${vol.color}30` }}>
              <span className="text-xs font-bold" style={{ color: vol.color }}>{vol.tier}</span>
              <span className="text-lg font-black" style={{ color: vol.color }}>{vol.label}</span>
              <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>monthly searches</span>
            </div>

            {/* Gap */}
            {o.gapScore > 0 && (() => { const g = gapLabel(o.gapScore); return (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: g.color + "12", border: `1px solid ${g.color}30` }}>
                <span className="text-xs font-bold" style={{ color: g.color }}>
                  {brand === "brotherjimi" ? "🕊️" : "🏆"} {g.label}
                </span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  — {o.gapScore >= 60 ? (brand === "brotherjimi" ? "no pastoral guide exists for this yet" : "no quality guide exists — empty shelf") : "thin or partial coverage"}
                </span>
              </div>
            ); })()}

            {/* Questions / what the PDF answers */}
            {questions.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                  {brand === "brotherjimi" ? "The stages this guide takes them through:" : "Real questions searched:"}
                </div>
                <div className="space-y-1">
                  {questions.slice(0, 6).map((q, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span style={{ color: bm.accentColor, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ color: "var(--text)" }}>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hook angle */}
            {o.hookAngle && (
              <div className="px-3 py-2 rounded-lg" style={{ background: bm.accentColor + "08", border: `1px solid ${bm.accentColor}20` }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: bm.accentColor }}>
                  {brand === "brotherjimi" ? "Opening line" : "Hook angle"}
                </div>
                <div className="text-xs italic" style={{ color: "var(--text)" }}>&ldquo;{o.hookAngle}&rdquo;</div>
              </div>
            )}

            {/* Video script */}
            {(videoScript.hook || videoScript.tease) && (
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer list-none px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider select-none"
                  style={{ background: "#6366F108", border: "1px solid #6366F120", color: "#818CF8" }}>
                  <span className="group-open:hidden">▶</span><span className="hidden group-open:inline">▼</span>
                  📱 {brand === "brotherjimi" ? "Caption / Script" : "Video Script"}
                </summary>
                <div className="mt-2 space-y-2 pl-1">
                  {videoScript.hook && (
                    <div>
                      <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--muted)" }}>Hook (0–2s)</div>
                      <div className="text-xs italic" style={{ color: "var(--text)" }}>&ldquo;{videoScript.hook}&rdquo;</div>
                    </div>
                  )}
                  {videoScript.tease && (
                    <div>
                      <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--muted)" }}>Tease (2–4s)</div>
                      <div className="text-xs italic" style={{ color: "var(--text)" }}>&ldquo;{videoScript.tease}&rdquo;</div>
                    </div>
                  )}
                  {videoScript.cta && (
                    <div>
                      <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--muted)" }}>CTA (4–7s)</div>
                      <div className="text-xs italic" style={{ color: "var(--text)" }}>&ldquo;{videoScript.cta}&rdquo;</div>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Distribution */}
            {o.distributionStrategy && (
              <div className="px-3 py-2.5 rounded-lg" style={{ background: "#F59E0B08", border: "1px solid #F59E0B25" }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#D97706" }}>
                  {brand === "brotherjimi" ? "Where this word belongs" : "Where to plant this"}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>{o.distributionStrategy}</div>
              </div>
            )}

            {/* PDF Outline */}
            {outline.length > 0 && (
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer list-none px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider select-none"
                  style={{ background: "#3B82F608", border: "1px solid #3B82F620", color: "#60A5FA" }}>
                  <span className="group-open:hidden">▶</span><span className="hidden group-open:inline">▼</span>
                  📄 {brand === "brotherjimi" ? `Pastoral Arc — ${outline.length} Stages` : `PDF Outline — ${outline.length} Chapters`}
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
            )}

            {/* Sales page */}
            {salesPage.headline && (
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer list-none px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider select-none"
                  style={{ background: "#10B98108", border: "1px solid #10B98125", color: "#10B981" }}>
                  <span className="group-open:hidden">▶</span><span className="hidden group-open:inline">▼</span>
                  💰 {brand === "brotherjimi" ? "Landing Page Copy" : "Sales Page — Copy-Paste Ready"}
                </summary>
                <div className="mt-2 space-y-2.5 pl-1">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--muted)" }}>{brand === "brotherjimi" ? "Opening line" : "Headline"}</div>
                    <div className="text-sm font-bold leading-snug" style={{ color: "var(--text)" }}>{salesPage.headline}</div>
                  </div>
                  {salesPage.subHeadline && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--muted)" }}>Sub-headline</div>
                      <div className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>{salesPage.subHeadline}</div>
                    </div>
                  )}
                  {Array.isArray(salesPage.bullets) && salesPage.bullets.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
                        {brand === "brotherjimi" ? "What shifts for them" : "Benefit Bullets"}
                      </div>
                      <div className="space-y-1">
                        {salesPage.bullets.map((b, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs">
                            <span style={{ color: bm.accentColor }}>✓</span>
                            <span style={{ color: "var(--text)" }}>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {salesPage.cta && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>{brand === "brotherjimi" ? "Invitation" : "CTA Button"}</div>
                      <div className="inline-block text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: bm.accentColor, color: "#fff" }}>{salesPage.cta}</div>
                    </div>
                  )}
                  {salesPage.guarantee && (
                    <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                      🛡️ {salesPage.guarantee}
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
              <span style={{ background: COMP_COLORS[o.competition] + "18", color: COMP_COLORS[o.competition] ?? "#6B7280", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                {o.competition} comp
              </span>
              <span style={{ background: EASE_COLORS[o.easeToSell] + "18", color: EASE_COLORS[o.easeToSell] ?? "#6B7280", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                {o.easeToSell} to {brand === "brotherjimi" ? "reach" : "sell"}
              </span>
              <span style={{ background: intentColor + "18", color: intentColor, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                {o.emotionalIntent}
              </span>
              {o.trend && (
                <span style={{ background: "var(--surface)", color: "var(--muted)", borderRadius: 5, padding: "2px 8px", fontSize: 11, border: "1px solid var(--border)" }}>
                  {o.trend === "rising" ? "⬆️" : o.trend === "seasonal" ? "🗓️" : "↔️"} {o.trend}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Page render ──────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-8 max-w-4xl">

      {/* Brand selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          {(["pdfseeds", "brotherjimi"] as Brand[]).map((b) => (
            <button key={b} onClick={() => { setBrand(b); setResults([]); setScanInfo(null); setError(""); setTab("results"); }}
              className="px-5 py-2.5 rounded-full text-sm font-bold transition-all"
              style={{
                background: brand === b ? BRAND_META[b].accentColor : "var(--surface2)",
                color: brand === b ? "#fff" : "var(--muted)",
                border: `1.5px solid ${brand === b ? BRAND_META[b].accentColor : "var(--border)"}`,
                boxShadow: brand === b ? `0 4px 16px ${BRAND_META[b].accentColor}40` : "none",
              }}>
              {BRAND_META[b].name}
            </button>
          ))}
          {history.length > 0 && (
            <button onClick={() => setTab(tab === "history" ? "results" : "history")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
              style={{ background: tab === "history" ? bm.accentColor : "var(--surface2)", color: tab === "history" ? "#fff" : "var(--muted)", border: "1px solid var(--border)" }}>
              🕐 History ({history.length})
            </button>
          )}
        </div>
        <p className="text-sm" style={{ color: "var(--muted)" }}>{tab === "history" ? "All past scan results — click any row to expand" : bm.tagline}</p>
      </div>

      {/* Controls */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} className="p-5 mb-5">

        {/* PDFSeeds: country selector */}
        {brand === "pdfseeds" && (
          <div className="mb-4">
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: "var(--muted)" }}>
              Market
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              {COUNTRIES.filter((c) => c.value !== "GLOBAL").map((c) => (
                <button key={c.value} onClick={() => setCountry(c.value)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium"
                  style={{
                    background: country === c.value ? bm.accentColor : "var(--surface2)",
                    color: country === c.value ? "#fff" : "var(--muted)",
                    border: `1px solid ${country === c.value ? bm.accentColor : "var(--border)"}`,
                  }}>
                  <span>{c.flag}</span><span>{c.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setCountry("GLOBAL")}
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium"
              style={{
                background: country === "GLOBAL" ? bm.accentColor : "var(--surface2)",
                color: country === "GLOBAL" ? "#fff" : "var(--muted)",
                border: `1px solid ${country === "GLOBAL" ? bm.accentColor : "var(--border)"}`,
              }}>
              <span>🌍</span><span>Global — universal pain, no country assumption</span>
            </button>
          </div>
        )}

        {/* Brother Jimi: pain domain selector */}
        {brand === "brotherjimi" && (
          <div className="mb-4">
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: "var(--muted)" }}>
              What is this person carrying?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {BJ_PAIN_DOMAINS.map((d) => (
                <button key={d.value} onClick={() => setBjDomain(d.value)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium"
                  style={{
                    background: bjDomain === d.value ? bm.accentColor : "var(--surface2)",
                    color: bjDomain === d.value ? "#fff" : "var(--muted)",
                    border: `1px solid ${bjDomain === d.value ? bm.accentColor : "var(--border)"}`,
                  }}>
                  <span>{d.flag}</span><span>{d.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Diaspora toggle — PDFSeeds only */}
        {brand === "pdfseeds" && hasDiaspora && (
          <div className="mb-4">
            <button onClick={() => setDiaspora(!diaspora)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium"
              style={{
                background: diaspora ? "#6366F115" : "var(--surface2)",
                border: `1px solid ${diaspora ? "#6366F1" : "var(--border)"}`,
                color: diaspora ? "#818CF8" : "var(--muted)",
              }}>
              <span className="text-lg">{diaspora ? "✈️" : "🌍"}</span>
              <div className="text-left flex-1">
                <div className="font-semibold" style={{ color: diaspora ? "#818CF8" : "var(--text)" }}>
                  {diaspora ? "Diaspora Mode ON" : "Diaspora Mode — target UK-based buyers with homeland problems"}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {diaspora ? "Priced in £ · Western salary · Near-zero competition" : "Western purchasing power, African bureaucracy, zero local help — they pay premium for clarity"}
                </div>
              </div>
              <div className="flex-shrink-0 w-10 h-5 rounded-full relative" style={{ background: diaspora ? "#6366F1" : "var(--border)" }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: diaspora ? "22px" : "2px" }} />
              </div>
            </button>
          </div>
        )}

        {/* Keyword + count */}
        <div className="flex flex-col md:flex-row flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1.5 flex-1" style={{ minWidth: 0 }}>
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              {brand === "brotherjimi" ? "Specific topic (optional)" : "Keyword (optional)"}
            </label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && discover()}
              placeholder={brand === "brotherjimi" ? `e.g. "carrying grief alone", "when prayer feels silent"` : `e.g. "passport renewal", "mobile money", "business registration"`}
              className="px-3 py-2.5 text-sm rounded-lg"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", outline: "none" }} />
          </div>
          <div className="flex flex-col gap-1.5" style={{ minWidth: 130 }}>
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Results: <span style={{ color: "var(--text)" }}>{count}</span>
            </label>
            <input type="range" min={5} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))}
              className="w-full" style={{ accentColor: bm.accentColor, cursor: "pointer", marginTop: 6 }} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={discover} disabled={loading}
            className="px-8 py-3 text-sm font-bold text-white flex items-center gap-2"
            style={{
              background: loading ? "#9CA3AF" : bm.accentColor,
              borderRadius: 999,
              boxShadow: loading ? "none" : `0 4px 16px ${bm.accentColor}40`,
              cursor: loading ? "not-allowed" : "pointer",
            }}>
            {loading
              ? <><span>⚙️</span> {bm.loadingVerb}…</>
              : <>{brand === "brotherjimi" ? BJ_PAIN_DOMAINS.find((d) => d.value === bjDomain)?.flag : countryMeta.flag} {bm.scanCTA(brand === "brotherjimi" ? (BJ_PAIN_DOMAINS.find((d) => d.value === bjDomain)?.label ?? bjDomain) : countryMeta.label)}</>}
          </button>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {brand === "brotherjimi" ? "7 sources · pastoral signal scan" : `7 sources · ${keyword ? `keyword: "${keyword}"` : "full scan"} · ${countryMeta.label}`}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "#EF444420", color: "#EF4444", border: "1px solid #EF444440" }}>
          {error}
        </div>
      )}

      {/* Scan header */}
      {scanInfo && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} className="p-4 mb-3">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="text-base font-bold" style={{ color: "var(--text)" }}>
                {brand === "brotherjimi" ? `What people carrying ${scanInfo.market} are searching for` : `What's worth making for ${scanInfo.market}`}
              </div>
              <div className="text-xs mt-0.5 flex items-center gap-3 flex-wrap" style={{ color: "var(--muted)" }}>
                <span>{scanInfo.timestamp}</span>
                <span style={{ color: "#10B981" }}>✓ Quality gate passed · real demand · no good answer yet</span>
                <span>{scanInfo.total} opportunities found</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["results", "saved", "history"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: tab === t ? bm.accentColor : "var(--surface2)", color: tab === t ? "#fff" : "var(--muted)", border: "1px solid var(--border)" }}>
                  {t === "results" ? `Results (${results.length})` : t === "saved" ? `Saved (${saved.length})` : `History (${history.length})`}
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
            {(["", "low", "medium", "high"] as const).map((c) => {
              const active = c === "" ? filterComp === "" : filterComp === c;
              return (
                <button key={c} onClick={() => setFilterComp(c === "" ? "" : filterComp === c ? "" : c)}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                  style={{ background: active ? bm.accentColor : "var(--surface2)", color: active ? "#fff" : "var(--muted)", border: `1px solid ${active ? "transparent" : "var(--border)"}` }}>
                  {c === "" ? "All comp" : c + " comp"}
                </button>
              );
            })}
            <button onClick={() => setFilterQuickWin(!filterQuickWin)}
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
              style={{ background: filterQuickWin ? "#F59E0B20" : "var(--surface2)", color: filterQuickWin ? "#F59E0B" : "var(--muted)", border: `1px solid ${filterQuickWin ? "#F59E0B60" : "var(--border)"}` }}>
              🎯 Quick Wins
            </button>
            <div className="flex items-center gap-1 md:ml-auto">
              <span className="text-xs mr-1" style={{ color: "var(--muted)" }}>Sort:</span>
              {(["score", "volume", "ease"] as const).map((s) => (
                <button key={s} onClick={() => setSortBy(s)}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                  style={{ background: sortBy === s ? bm.accentColor : "var(--surface2)", color: sortBy === s ? "#fff" : "var(--muted)", border: `1px solid ${sortBy === s ? "transparent" : "var(--border)"}` }}>
                  {s === "score" ? "Signal" : s === "volume" ? "Volume" : "Easiest"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              Showing <strong style={{ color: "var(--text)" }}>{filteredList.length}</strong> of {displayList.length}
              {(filterComp || filterQuickWin) && <> · filtered · <button onClick={() => { setFilterComp(""); setFilterQuickWin(false); }} className="underline" style={{ color: bm.accentColor }}>clear</button></>}
            </span>
            <div className="flex gap-3">
              <button onClick={() => setExpandedIds(new Set(filteredList.map((o) => o.id)))} className="text-xs" style={{ color: bm.accentColor }}>Expand all</button>
              <button onClick={() => setExpandedIds(new Set())} className="text-xs" style={{ color: "var(--muted)" }}>Collapse</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} className="p-10 text-center">
          <div className="flex justify-center mb-5">
            <div className="relative inline-block">
              <span className="text-4xl">{brand === "brotherjimi" ? BJ_PAIN_DOMAINS.find((d) => d.value === bjDomain)?.flag : countryMeta.flag}</span>
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: bm.accentColor }}></span>
                <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: bm.accentColor }}></span>
              </span>
            </div>
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>{stages[loadingStage].label}…</p>
          <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>{stages[loadingStage].detail}</p>
          <div className="w-64 mx-auto rounded-full mb-3" style={{ height: 3, background: "var(--border)" }}>
            <div className="rounded-full transition-all duration-700 ease-out" style={{ height: 3, background: bm.accentColor, width: `${Math.min(96, Math.round((loadingElapsed / 57) * 100))}%` }} />
          </div>
          <div className="flex justify-center gap-1.5 mb-3">
            {stages.slice(0, -1).map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-300" style={{ width: i === loadingStage ? 16 : 6, height: 6, background: i <= loadingStage ? bm.accentColor : "var(--border)" }} />
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>{loadingElapsed}s · results saved to History — safe to navigate away</p>
        </div>
      )}

      {/* Empty */}
      {!loading && displayList.length === 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} className="p-16 text-center">
          <div className="text-5xl mb-4">{tab === "saved" ? "🔖" : brand === "brotherjimi" ? BJ_PAIN_DOMAINS.find((d) => d.value === bjDomain)?.flag : countryMeta.flag}</div>
          <p className="text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
            {tab === "saved" ? "No saved ideas yet" : tab === "history" ? "No scan history yet" : bm.emptyHeading(brand === "brotherjimi" ? (BJ_PAIN_DOMAINS.find((d) => d.value === bjDomain)?.label ?? bjDomain) : countryMeta.label)}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {tab === "saved" ? "Click the 🏷️ bookmark on any result to save it here." : tab === "history" ? "Past scan results appear here — even if you navigated away during the scan." : bm.emptyBody}
          </p>
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
                <span className="text-xs font-semibold" style={{ color: tier.color }}>
                  {tier.min >= 90 ? (brand === "brotherjimi" ? "write this first" : "build this first") : tier.min >= 80 ? "build next" : "worth building"}
                </span>
              </div>
              {tier.items.map((o) => <Card key={o.id} o={o} />)}
            </div>
          ))}
          <div className="px-4 py-3 rounded-lg text-xs" style={{ background: bm.accentColor + "06", border: `1px solid ${bm.accentColor}18`, color: "var(--muted)" }}>
            {brand === "brotherjimi"
              ? "Every result shown here has real human signal behind it — real searches, real weight, no quality guide yet written for it."
              : "Every result passed a full quality gate — real demand, genuinely underserved, worth someone's money to solve."}
          </div>
        </div>
      )}
    </div>
  );
}
