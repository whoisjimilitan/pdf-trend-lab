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
  saved: boolean;
  isQuickWin: boolean;
  isDiaspora: boolean;
};


const COUNTRIES: { value: string; label: string; name: string; symbol: string; flag: string }[] = [
  { value: "GH", label: "Ghana",        name: "GHANA",         symbol: "₵",   flag: "🇬🇭" },
  { value: "NG", label: "Nigeria",      name: "NIGERIA",       symbol: "₦",   flag: "🇳🇬" },
  { value: "KE", label: "Kenya",        name: "KENYA",         symbol: "KSh", flag: "🇰🇪" },
  { value: "ZA", label: "South Africa", name: "SOUTH AFRICA",  symbol: "R",   flag: "🇿🇦" },
  { value: "US", label: "United States",name: "UNITED STATES", symbol: "$",   flag: "🇺🇸" },
  { value: "GB", label: "United Kingdom",name: "UNITED KINGDOM",symbol: "£",  flag: "🇬🇧" },
  { value: "CA", label: "Canada",       name: "CANADA",        symbol: "CA$", flag: "🇨🇦" },
  { value: "AU", label: "Australia",    name: "AUSTRALIA",     symbol: "A$",  flag: "🇦🇺" },
];

const TIERS = [
  { min: 90, max: 100, label: "🟢 HIGH OPPORTUNITY (90–100)",  action: "✅ SAVE & CREATE", color: "#10B981", bg: "#10B98112", border: "#10B98130" },
  { min: 80, max: 89,  label: "🟡 STRONG OPPORTUNITY (80–89)", action: "✅ SAVE & CREATE", color: "#F59E0B", bg: "#F59E0B12", border: "#F59E0B30" },
  { min: 70, max: 79,  label: "🟠 GOOD OPPORTUNITY (70–79)",   action: "✅ SAVE & CREATE", color: "#F97316", bg: "#F9731612", border: "#F9731630" },
];

const TREND_ICON: Record<string, string> = { rising: "⬆️", stable: "↔️", declining: "⬇️" };
const COMP_COLORS: Record<string, string> = { low: "#10B981", medium: "#F59E0B", high: "#EF4444" };
const EASE_COLORS: Record<string, string> = { easy: "#10B981", medium: "#F59E0B", hard: "#EF4444" };
const INTENT_COLORS: Record<string, string> = { fear: "#EF4444", urgency: "#F59E0B", desire: "#10B981", pain: "#EC4899", confusion: "#6366F1" };

function chip(label: string, color: string): React.CSSProperties {
  return { background: color + "20", color, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600, display: "inline-block", whiteSpace: "nowrap" as const };
}

function volumeDisplay(vol: number): { label: string; color: string; bg: string; tier: string } {
  if (vol >= 100000) return { label: fmt(vol) + "/mo", color: "#10B981", bg: "#10B98122", tier: "🔥 Massive Demand" };
  if (vol >= 50000)  return { label: fmt(vol) + "/mo", color: "#10B981", bg: "#10B98120", tier: "🔥 Viral Demand"   };
  if (vol >= 30000)  return { label: fmt(vol) + "/mo", color: "#10B981", bg: "#10B98118", tier: "✅ High Demand"    };
  if (vol >= 15000)  return { label: fmt(vol) + "/mo", color: "#10B981", bg: "#10B98116", tier: "✅ Strong Demand"  };
  if (vol >= 8000)   return { label: fmt(vol) + "/mo", color: "#F59E0B", bg: "#F59E0B18", tier: "✅ Good Demand"    };
  return               { label: fmt(vol) + "/mo", color: "#EF4444", bg: "#EF444415", tier: "❌ Below Threshold" };
}

function fmt(v: number): string {
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
    const qs = parseQ(o.exactQuestions).join(" | ");
    return [
      o.opportunityScore, o.searchVolume,
      `"${vol.tier.replace(/[^\w\s]/g, "").trim()}"`,
      `"${o.keyword}"`, `"${o.pdfTitle}"`, `"${o.niche}"`,
      o.trend, o.competition,
      `"${symbol}${o.minPrice}–${symbol}${o.maxPrice}"`,
      o.emotionalIntent, `"${qs}"`,
    ].join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `pdf-ideas-${new Date().toISOString().split("T")[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export default function EnginePage() {
  const router = useRouter();
  const [results, setResults]     = useState<Opportunity[]>([]);
  const [saved, setSaved]         = useState<Opportunity[]>([]);
  const [loading, setLoading]     = useState(false);
  const [keyword, setKeyword]     = useState("");
  const [niche, setNiche]         = useState("");
  const [count, setCount]         = useState(15);
  const [country, setCountry]     = useState("GH");
  const [diaspora, setDiaspora]   = useState(false);
  const [error, setError]         = useState("");
  const [tab, setTab]             = useState<"results" | "saved">("results");
  const [scanInfo, setScanInfo]   = useState<{ country: string; keyword: string; niche: string; diaspora: boolean; timestamp: string; total: number } | null>(null);

  const hasDiaspora = ["GH", "NG", "KE", "ZA"].includes(country);

  const countryMeta = COUNTRIES.find((c) => c.value === country)!;
  const symbol = COUNTRIES.find((c) => c.value === (scanInfo?.country ?? country))?.symbol ?? "$";

  const loadSaved = useCallback(async () => {
    try {
      const res = await fetch("/api/engine");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setSaved(data.filter((o: Opportunity) => o.saved));
    } catch {}
  }, []);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  async function discover() {
    setError("");
    setLoading(true);
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
      setScanInfo({
        country,
        keyword,
        niche,
        diaspora: hasDiaspora && diaspora,
        timestamp: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
        total: data.length,
      });
      if (data.length === 0) setError("No high-demand opportunities found. Try a different country or add a keyword to narrow the search.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleSave(o: Opportunity, e: React.MouseEvent) {
    e.stopPropagation();
    const newSaved = !o.saved;
    await fetch("/api/engine", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: o.id, saved: newSaved }),
    });
    const update = (r: Opportunity) => r.id === o.id ? { ...r, saved: newSaved } : r;
    setResults((prev) => prev.map(update));
    setSaved((prev) =>
      newSaved ? [...prev.filter((r) => r.id !== o.id), { ...o, saved: true }]
               : prev.filter((r) => r.id !== o.id)
    );
  }

  const displayList = tab === "saved" ? saved : results;
  const grouped = TIERS
    .map((tier) => ({ ...tier, items: displayList.filter((o) => o.opportunityScore >= tier.min && o.opportunityScore <= tier.max) }))
    .filter((g) => g.items.length > 0);

  function Card({ o }: { o: Opportunity }) {
    const questions = parseQ(o.exactQuestions);
    const vol = volumeDisplay(o.searchVolume);

    return (
      <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px", marginBottom: 10 }}>
        {/* Score + title row */}
        <div className="flex items-start gap-4 mb-3">
          <div className="flex-shrink-0 text-center" style={{ minWidth: 52 }}>
            <div className="text-xl font-black" style={{ color: "var(--text)" }}>{o.opportunityScore}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>/100</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>PDF Guide</span>
              {o.isQuickWin && (
                <span style={{ background: "#F59E0B20", color: "#F59E0B", borderRadius: 5, padding: "1px 7px", fontSize: 10, fontWeight: 700, border: "1px solid #F59E0B40" }}>
                  🎯 QUICK WIN
                </span>
              )}
              {o.isDiaspora && (
                <span style={{ background: "#6366F120", color: "#818CF8", borderRadius: 5, padding: "1px 7px", fontSize: 10, fontWeight: 700, border: "1px solid #6366F140" }}>
                  ✈️ DIASPORA · £
                </span>
              )}
              <span style={{ background: "var(--surface)", color: "var(--muted)", borderRadius: 4, padding: "1px 6px", fontSize: 10, border: "1px solid var(--border)" }}>
                {o.niche}
              </span>
            </div>
            <div className="font-bold text-sm leading-snug mb-1" style={{ color: "var(--text)" }}>{o.pdfTitle || o.keyword}</div>
            <div className="text-xs italic" style={{ color: "var(--muted)" }}>Search: "{o.keyword}"</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={(e) => toggleSave(o, e)} title={o.saved ? "Saved" : "Save this idea"}
              className="text-lg" style={{ color: o.saved ? "#F59E0B" : "var(--muted)" }}>
              {o.saved ? "🔖" : "🏷️"}
            </button>
            <button onClick={() => router.push(`/factory?id=${o.id}`)}
              className="px-4 py-1.5 text-xs font-bold text-white rounded-lg"
              style={{ background: "var(--accent)" }}>
              Build PDF →
            </button>
          </div>
        </div>

        {/* Pain point — emotional hook */}
        {o.painPoint && (
          <div className="px-3 py-2.5 rounded-lg mb-3"
            style={{ background: `${INTENT_COLORS[o.emotionalIntent] ?? "#6366F1"}0D`, borderLeft: `3px solid ${INTENT_COLORS[o.emotionalIntent] ?? "#6366F1"}` }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: INTENT_COLORS[o.emotionalIntent] ?? "#6366F1" }}>
              The pain this PDF solves
            </div>
            <div className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>{o.painPoint}</div>
          </div>
        )}

        {/* Volume hero */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-3"
          style={{ background: vol.bg, border: `1px solid ${vol.color}30` }}>
          <span className="text-xs font-bold" style={{ color: vol.color }}>{vol.tier}</span>
          <span className="text-lg font-black" style={{ color: vol.color }}>{vol.label}</span>
          <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>monthly searches</span>
        </div>

        {/* Real problems searched — short fragments */}
        {questions.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
              Real problems searched:
            </div>
            <div className="flex flex-wrap gap-2">
              {questions.slice(0, 4).map((q, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>
                  "{q}"
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
          <span style={chip(`${TREND_ICON[o.trend] ?? "↔️"} ${o.trend}`, o.trend === "rising" ? "#10B981" : o.trend === "declining" ? "#EF4444" : "#6366F1")}>
            {TREND_ICON[o.trend] ?? "↔️"} {o.trend}
          </span>
          <span style={chip(`Competition: ${o.competition}`, COMP_COLORS[o.competition] ?? "#6B7280")}>
            Competition: {o.competition}
          </span>
          <span style={chip(`Ease: ${o.easeToSell}`, EASE_COLORS[o.easeToSell] ?? "#6B7280")}>
            Ease: {o.easeToSell}
          </span>
          <span style={chip(o.emotionalIntent, INTENT_COLORS[o.emotionalIntent] ?? "#6B7280")}>
            {o.emotionalIntent}
          </span>
          <span className="ml-auto text-sm font-bold" style={{ color: "var(--text)" }}>
            {symbol}{o.minPrice} – {symbol}{o.maxPrice}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>PDF Idea Finder</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Pick a country. Hit discover. The engine reads live Google searches, finds what people are urgently searching for right now, and surfaces only what&apos;s worth making — 15,000+ searches/month, real knowledge gap, viable PDF product. No categories. No guessing.
        </p>
      </div>

      {/* Controls */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} className="p-5 mb-5">

        {/* Country selector — primary control, full row */}
        <div className="mb-4">
          <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: "var(--muted)" }}>
            Country — What market are you targeting?
          </label>
          <div className="grid grid-cols-4 gap-2">
            {COUNTRIES.map((c) => (
              <button key={c.value} onClick={() => setCountry(c.value)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: country === c.value ? "var(--accent)" : "var(--surface2)",
                  color: country === c.value ? "#fff" : "var(--muted)",
                  border: `1px solid ${country === c.value ? "var(--accent)" : "var(--border)"}`,
                }}>
                <span>{c.flag}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Diaspora toggle — only for African markets */}
        {hasDiaspora && (
          <div className="mb-4">
            <button onClick={() => setDiaspora(!diaspora)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all"
              style={{
                background: diaspora ? "#6366F115" : "var(--surface2)",
                border: `1px solid ${diaspora ? "#6366F1" : "var(--border)"}`,
                color: diaspora ? "#818CF8" : "var(--muted)",
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
              <div className="flex-shrink-0 w-10 h-5 rounded-full relative transition-all"
                style={{ background: diaspora ? "#6366F1" : "var(--border)" }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: diaspora ? "22px" : "2px" }} />
              </div>
            </button>
          </div>
        )}

        {/* Keyword + niche + count row */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1.5 flex-1 min-w-44">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Keyword <span className="normal-case font-normal tracking-normal">(optional)</span>
            </label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && discover()}
              placeholder={`e.g. "mobile money", "passport", "farming"`}
              className="px-3 py-2.5 text-sm rounded-lg"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", outline: "none" }} />
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-44">
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

        {/* CTA */}
        <div className="mt-4 flex items-center gap-3">
          <button onClick={discover} disabled={loading}
            className="px-8 py-3 text-sm font-bold text-white rounded-lg flex items-center gap-2"
            style={{ background: loading ? "var(--muted)" : "var(--accent)", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading
              ? <><span>⚙️</span> Scanning {countryMeta.flag} {countryMeta.label}…</>
              : <>{countryMeta.flag} Discover What&apos;s Worth Making in {countryMeta.label}</>}
          </button>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {keyword ? `Keyword: "${keyword}"` : niche ? `Niche: "${niche}"` : `Full scan in ${countryMeta.label}`}
            {keyword || niche ? ` · ${countryMeta.label}` : ""}
            {" · "}15k+/mo · Google + Reddit signals
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
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} className="p-4 mb-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="text-base font-bold" style={{ color: "var(--text)" }}>
                📊 WHAT&apos;S WORTH MAKING IN {COUNTRIES.find((c) => c.value === scanInfo.country)?.name}
                {keyword ? ` · "${keyword.toUpperCase()}"` : " · LIVE DISCOVERY"}
              </div>
              <div className="text-xs mt-0.5 flex items-center gap-3 flex-wrap" style={{ color: "var(--muted)" }}>
                <span>Generated: {scanInfo.timestamp}</span>
                <span style={{ color: "#10B981" }}>✓ Score ≥ 70 · Opportunity Density model · Google + Reddit signals</span>
                {(scanInfo.keyword || scanInfo.niche) && (
                  <span style={{ color: "var(--accent)" }}>
                    {scanInfo.keyword ? `Keyword: "${scanInfo.keyword}"` : `Niche: "${scanInfo.niche}"`}
                  </span>
                )}
                <span>{scanInfo.total} opportunities found</span>
              </div>
              <div className="text-xs mt-1.5 flex items-center gap-3" style={{ color: "var(--muted)" }}>
                <span>Scored on:</span>
                <span style={{ color: "#10B981" }}>🏆 PDF monopoly</span>
                <span style={{ color: "#10B981" }}>📊 Demand</span>
                <span style={{ color: "#F59E0B" }}>🔥 Urgency</span>
                <span style={{ color: "#6366F1" }}>🌱 First-mover window</span>
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

      {/* Loading */}
      {loading && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} className="p-16 text-center">
          <div className="text-4xl mb-4">{countryMeta.flag}</div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
            Scanning {countryMeta.label} — all categories…
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Google Autocomplete · Reddit pain signals · Knowledge gap filter · 15k+/month gate
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && displayList.length === 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} className="p-16 text-center">
          <div className="text-5xl mb-4">{tab === "saved" ? "🔖" : countryMeta.flag}</div>
          <p className="text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
            {tab === "saved" ? "No saved ideas yet" : `Ready to discover what ${countryMeta.label} needs?`}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {tab === "saved"
              ? "Click the 🏷️ bookmark on any result to save it here."
              : `Click the button above — the engine scans everything and surfaces only what's worth making.`}
          </p>
        </div>
      )}

      {/* Grouped results */}
      {!loading && grouped.length > 0 && (
        <div className="space-y-6">
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
            style={{ background: "#EF444410", border: "1px solid #EF444430", color: "#EF4444" }}>
            ❌ Filtered out automatically: score below 70, or fewer than 15,000 searches/month, or no clear knowledge gap.
            This model only works when real demand meets an unfilled information need.
          </div>
        </div>
      )}
    </div>
  );
}
