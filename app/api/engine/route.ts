import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import OpenAI from "openai";

async function fetchAutocompleteSuggestions(query: string): Promise<string[]> {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}&hl=en`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data[1]) ? (data[1] as string[]) : [];
  } catch {
    return [];
  }
}

// Country names used as search anchors
const COUNTRY_LABEL: Record<string, string> = {
  GH: "ghana", NG: "nigeria", KE: "kenya", ZA: "south africa",
  GB: "", CA: "", AU: "", US: "",
};

// Reddit communities with strong signal for each market
const COUNTRY_SUBREDDITS: Record<string, string[]> = {
  GH: ["ghana", "Africa", "personalfinance"],
  NG: ["nigeria", "naija", "Africa"],
  KE: ["Kenya", "Africa"],
  ZA: ["southafrica", "Africa"],
  US: ["personalfinance", "careerguidance", "Parenting", "selfimprovement", "financialindependence"],
  GB: ["unitedkingdom", "UKPersonalFinance", "AskUK"],
  CA: ["PersonalFinanceCanada", "canada"],
  AU: ["AusFinance", "australia"],
};

// Diaspora subreddits — communities where diaspora members discuss homeland topics
const DIASPORA_SUBREDDITS: Record<string, string[]> = {
  GH: ["ghana", "ukpolitics", "uknews", "AskUK", "ImmigrationUK"],
  NG: ["nigeria", "naija", "unitedkingdom", "ImmigrationUK"],
  KE: ["Kenya", "unitedkingdom", "ImmigrationUK"],
  ZA: ["southafrica", "unitedkingdom"],
};

const DIASPORA_ANCHORS: Record<string, string[]> = {
  GH: [
    "ghana passport renewal uk",
    "ghana passport renewal abroad",
    "ghana embassy uk appointment",
    "ghana embassy uk",
    "send money to ghana from uk",
    "mobile money ghana from uk",
    "ghana mobile money abroad",
    "register company ghana from uk",
    "ghana business registration from abroad",
    "waec certificate verification uk",
    "ghana certificate apostille uk",
    "ghana property transfer from uk",
    "buy land in ghana from uk",
    "ghana nhis registration abroad",
    "ghanaian dual citizenship uk",
    "ghana citizenship by descent",
    "ghana investment from uk",
    "ghana school certificate uk",
    "ghana driving license uk",
    "send money ghana western union",
    "ghana real estate investment abroad",
    "ghana pension from abroad",
    "ghana ssnit from abroad",
    "how to vote in ghana from uk",
    "ghana birth certificate abroad",
  ],
  NG: [
    "nigeria passport renewal uk",
    "nigeria passport renewal abroad",
    "nigerian embassy uk appointment",
    "nigeria dual citizenship uk",
    "nigerian british dual citizenship",
    "nigeria bvn abroad",
    "bvn registration uk",
    "send money nigeria uk",
    "cac registration from abroad",
    "nigeria company registration from uk",
    "waec certificate verification abroad",
    "nigeria property from uk",
    "buy land in nigeria from uk",
    "nigeria investment from uk",
    "nigeria birth certificate abroad",
    "nigeria marriage certificate abroad",
    "nigeria death certificate abroad",
    "nigeria nin abroad",
    "nigeria tax clearance abroad",
    "nigeria pension from abroad",
    "nigerian high commission uk",
    "nigeria e-passport uk",
  ],
  KE: [
    "kenya passport renewal uk",
    "kenya passport renewal abroad",
    "kenyan high commission uk",
    "kenya dual citizenship",
    "kenya citizenship by birth abroad",
    "mpesa from uk",
    "send money kenya uk",
    "kenya property from abroad",
    "kenya land registration from uk",
    "kenya investment from uk",
    "kenya business from abroad",
    "helb repayment from abroad",
    "kenya birth certificate abroad",
    "kcse certificate verification abroad",
    "kenya nhif from abroad",
    "kenya nssf from abroad",
  ],
  ZA: [
    "south africa passport renewal uk",
    "south african high commission uk",
    "south africa dual citizenship uk",
    "south africa unabridged birth certificate",
    "unabridged birth certificate apostille",
    "south africa tax clearance abroad",
    "south africa property from uk",
    "sars tax from abroad",
    "south africa pension from abroad",
    "south africa matric certificate abroad",
    "south africa drivers license uk",
    "south africa police clearance uk",
  ],
};

async function fetchRedditSignals(country: string, keyword: string, niche: string, diaspora = false): Promise<string[]> {
  const subreddits = diaspora
    ? (DIASPORA_SUBREDDITS[country] ?? COUNTRY_SUBREDDITS[country] ?? ["AskReddit"])
    : (COUNTRY_SUBREDDITS[country] ?? ["AskReddit"]);
  const query = keyword || niche || COUNTRY_LABEL[country] || "";
  const signals: string[] = [];

  const targets = query
    ? subreddits.slice(0, 2).map(
        (sub) => `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&sort=top&limit=12&t=year`
      )
    : subreddits.slice(0, 2).map(
        (sub) => `https://www.reddit.com/r/${sub}/hot.json?limit=15`
      );

  const results = await Promise.allSettled(
    targets.map((url) =>
      fetch(url, {
        headers: { "User-Agent": "PDFTrendLab/1.0 (research)" },
        signal: AbortSignal.timeout(5000),
      }).then((r) => (r.ok ? r.json() : null))
    )
  );

  for (const result of results) {
    if (result.status !== "fulfilled" || !result.value) continue;
    const posts = (result.value?.data?.children ?? []) as Array<{ data: { title?: string; selftext?: string } }>;
    for (const post of posts) {
      const title = post?.data?.title;
      const selftext = post?.data?.selftext;
      if (title && title.length > 15) signals.push(title);
      if (selftext && selftext.length > 30) {
        const firstLine = selftext.trim().split("\n")[0];
        if (firstLine.length > 20) signals.push(firstLine.slice(0, 200));
      }
    }
  }

  return [...new Set(signals)].slice(0, 25);
}

const UNIVERSAL_STARTERS = [
  "how to",
  "how do i",
  "how to fix",
  "how to stop",
  "how to start",
  "how to make money",
  "how to get",
  "how to pass",
  "how to register",
  "how to apply for",
  "how to invest",
  "how to improve",
  "how to avoid",
  "how to earn",
  "how to manage",
  "how to become",
  "guide to",
  "step by step",
  "complete guide",
  "how to deal with",
];

const COUNTRY_ANCHORS: Record<string, string[]> = {
  GH: [
    "ghana",
    "waec",
    "wassce",
    "mobile money ghana",
    "ghana business registration",
    "ghana passport",
    "ghana scholarship",
    "ghana farming",
    "ghana driving license",
    "ghana health insurance",
    "ghana university admission",
    "ghana work",
    "ghana investment",
    "poultry farming ghana",
  ],
  NG: [
    "nigeria",
    "jamb",
    "waec nigeria",
    "cac registration",
    "nigeria passport",
    "nigeria scholarship",
    "nigeria farming",
    "nigeria business",
    "pos business nigeria",
    "opay nigeria",
    "nigeria university admission",
    "nigeria investment",
    "catfish farming nigeria",
    "nigeria driving license",
  ],
  KE: [
    "kenya",
    "kcse",
    "mpesa",
    "kenya business registration",
    "kenya passport",
    "kenya scholarship",
    "kenya farming",
    "helb loan",
    "kenya university admission",
    "saccos kenya",
    "dairy farming kenya",
    "kenya driving license",
    "kenya health insurance",
    "kenya investment",
  ],
  ZA: [
    "south africa",
    "matric",
    "nsfas",
    "cipc registration",
    "south africa passport",
    "south africa scholarship",
    "south africa farming",
    "load shedding tips",
    "sars tax",
    "south africa business",
    "south africa investment",
    "south africa driving license",
    "south africa university admission",
    "south africa health insurance",
  ],
  US: [
    "how to start a business",
    "how to save money",
    "how to invest in stocks",
    "how to get a job",
    "how to lose weight fast",
    "how to make passive income",
    "how to file taxes",
    "how to buy a house",
    "how to build credit",
    "side hustle ideas",
    "how to start a blog",
    "how to retire early",
  ],
  GB: [
    "how to start a business uk",
    "universal credit",
    "how to save money uk",
    "uk driving license",
    "how to invest uk",
    "uk visa application",
    "how to buy a house uk",
    "hmrc tax return",
    "how to get a job uk",
    "uk scholarship",
  ],
  CA: [
    "how to start a business canada",
    "canada immigration",
    "how to save money canada",
    "canada scholarship",
    "how to invest canada",
    "canada driving license",
    "canada visa application",
    "how to file taxes canada",
  ],
  AU: [
    "how to start a business australia",
    "australia immigration",
    "how to save money australia",
    "australia scholarship",
    "how to invest australia",
    "australia driving license",
    "australia visa application",
    "how to file taxes australia",
  ],
};

function buildDiscoveryQueries(country: string, keyword: string, niche: string, diaspora = false): string[] {
  const label = COUNTRY_LABEL[country] ?? "";

  if (diaspora) {
    const anchors = DIASPORA_ANCHORS[country] ?? [];
    if (keyword) {
      return [
        `${keyword} ${label} from uk`,
        `${keyword} ${label} abroad`,
        `${keyword} ${label} from abroad`,
        `how to ${keyword} ${label} from uk`,
        `${label} ${keyword} uk`,
        ...anchors,
      ];
    }
    return anchors;
  }

  if (keyword) {
    const base = [
      `how to ${keyword}`,
      `how do i ${keyword}`,
      `${keyword} guide`,
      `${keyword} for beginners`,
      `${keyword} step by step`,
      `how to start ${keyword}`,
      `how to fix ${keyword}`,
      `guide to ${keyword}`,
      `${keyword} tips`,
      `${keyword} problems`,
      `complete guide ${keyword}`,
    ];
    if (label) {
      base.push(
        `how to ${keyword} in ${label}`,
        `${keyword} in ${label}`,
        `${keyword} ${label}`,
        `${keyword} ${label} 2026`,
        `how to ${keyword} ${label}`,
      );
    }
    return base;
  }

  if (niche) {
    const nicheQueries = [
      `how to ${niche}`,
      `${niche} guide`,
      `${niche} problems`,
      `${niche} help`,
      `${niche} tips`,
      `${niche} for beginners`,
      `${niche} mistakes`,
      `how to start ${niche}`,
      `how to improve ${niche}`,
      `${niche} step by step`,
    ];
    if (label) {
      nicheQueries.push(
        `${niche} in ${label}`,
        `${niche} ${label}`,
        `how to ${niche} ${label}`,
      );
    }
    return [...nicheQueries, ...(COUNTRY_ANCHORS[country] ?? [])];
  }

  return [...UNIVERSAL_STARTERS, ...(COUNTRY_ANCHORS[country] ?? [])];
}

export const PRICING: Record<string, { symbol: string; min: number; max: number; note: string }> = {
  GH: { symbol: "₵",   min: 39,    max: 79,    note: "Ghanaian Cedis" },
  NG: { symbol: "₦",   min: 5000,  max: 15000, note: "Nigerian Naira" },
  KE: { symbol: "KSh", min: 500,   max: 1500,  note: "Kenyan Shilling" },
  ZA: { symbol: "R",   min: 99,    max: 249,   note: "South African Rand" },
  GB: { symbol: "£",   min: 8.99,  max: 14.99, note: "British Pounds" },
  CA: { symbol: "CA$", min: 14.99, max: 27.99, note: "Canadian Dollars" },
  AU: { symbol: "A$",  min: 14.99, max: 29.99, note: "Australian Dollars" },
  US: { symbol: "$",   min: 12.99, max: 24.99, note: "US Dollars" },
};

// Diaspora buyers have Western purchasing power — price in GBP accordingly.
export const DIASPORA_PRICING: Record<string, { symbol: string; min: number; max: number; note: string }> = {
  GH: { symbol: "£", min: 9.99,  max: 19.99, note: "British Pounds — Ghanaian diaspora" },
  NG: { symbol: "£", min: 9.99,  max: 19.99, note: "British Pounds — Nigerian diaspora" },
  KE: { symbol: "£", min: 9.99,  max: 14.99, note: "British Pounds — Kenyan diaspora" },
  ZA: { symbol: "£", min: 9.99,  max: 14.99, note: "British Pounds — South African diaspora" },
};

const ABSOLUTE_MIN_VOLUME = 5000;

const MARKET_CONTEXT: Record<string, { tier: string; strongVolume: number; massiveVolume: number }> = {
  GH: { tier: "emerging",  strongVolume: 15000,  massiveVolume: 40000  },
  NG: { tier: "emerging",  strongVolume: 20000,  massiveVolume: 60000  },
  KE: { tier: "emerging",  strongVolume: 12000,  massiveVolume: 35000  },
  ZA: { tier: "emerging",  strongVolume: 18000,  massiveVolume: 50000  },
  US: { tier: "saturated", strongVolume: 40000,  massiveVolume: 100000 },
  GB: { tier: "saturated", strongVolume: 25000,  massiveVolume: 70000  },
  CA: { tier: "saturated", strongVolume: 20000,  massiveVolume: 60000  },
  AU: { tier: "saturated", strongVolume: 18000,  massiveVolume: 55000  },
};

const DIASPORA_MARKET_CONTEXT: Record<string, { tier: string; strongVolume: number; massiveVolume: number }> = {
  GH: { tier: "diaspora-niche", strongVolume: 3000, massiveVolume: 10000 },
  NG: { tier: "diaspora-niche", strongVolume: 5000, massiveVolume: 15000 },
  KE: { tier: "diaspora-niche", strongVolume: 2000, massiveVolume: 8000  },
  ZA: { tier: "diaspora-niche", strongVolume: 2000, massiveVolume: 8000  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2 — Real search volume via DataForSEO (~$0.0003/keyword)
// Replaces AI-hallucinated volumes with Google's actual monthly search data.
// ─────────────────────────────────────────────────────────────────────────────

const DATAFORSEO_LOCATION: Record<string, number> = {
  GH: 2288, NG: 2566, KE: 2404, ZA: 2710,
  GB: 2826, US: 2840, CA: 2124, AU: 2036,
};

interface VolumeData {
  searchVolume: number;
  cpc: number;
  competition: number;
}

async function fetchRealVolumes(keywords: string[], country: string): Promise<Map<string, VolumeData>> {
  const email = process.env.DATAFORSEO_EMAIL;
  const key   = process.env.DATAFORSEO_KEY;
  if (!email || !key) return new Map();

  const locationCode = DATAFORSEO_LOCATION[country] ?? 2840;
  const result = new Map<string, VolumeData>();

  // Batch in chunks of 50 (API allows 1000 but keep costs predictable)
  for (let i = 0; i < keywords.length; i += 50) {
    const chunk = keywords.slice(i, i + 50);
    try {
      const res = await fetch("https://api.dataforseo.com/v3/keywords_data/google/search_volume/live", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${email}:${key}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ keywords: chunk, location_code: locationCode, language_code: "en" }]),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        console.warn(`[engine] DataForSEO ${res.status} — continuing without real volumes`);
        break;
      }

      const data = await res.json();
      for (const task of (data?.tasks ?? [])) {
        for (const item of (task?.result ?? [])) {
          if (item?.keyword) {
            result.set(item.keyword.toLowerCase(), {
              searchVolume: item.search_volume ?? 0,
              cpc: item.cpc ?? 0,
              competition: item.competition ?? 0,
            });
          }
        }
      }
    } catch (e) {
      console.warn("[engine] DataForSEO fetch failed:", e);
      break;
    }
  }

  console.log(`[engine] DataForSEO: got real volumes for ${result.size}/${keywords.length} keywords`);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 3 — Live PDF competition via Google Custom Search (100 free/day)
// Checks site:gumroad.com + site:payhip.com for each keyword in real-time.
// Only run on top 20 keywords to preserve the daily quota.
// ─────────────────────────────────────────────────────────────────────────────

interface CompetitionData {
  pdfCount: number;
  monopolyScore: number; // 0–100, higher = less competition = better opportunity
}

async function checkPDFCompetition(keywords: string[]): Promise<Map<string, CompetitionData>> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_KEY;
  const cx     = process.env.GOOGLE_CUSTOM_SEARCH_CX;
  if (!apiKey || !cx) return new Map();

  const result = new Map<string, CompetitionData>();
  const limit  = Math.min(keywords.length, 20);

  for (let i = 0; i < limit; i++) {
    const kw = keywords[i];
    try {
      const query = `site:gumroad.com OR site:payhip.com OR site:selar.co OR filetype:pdf "${kw}"`;
      const url   = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=10`;
      const res   = await fetch(url, { signal: AbortSignal.timeout(6000) });

      if (!res.ok) {
        console.warn(`[engine] Custom Search ${res.status} for "${kw}"`);
        continue;
      }

      const data         = await res.json();
      const totalResults = parseInt(data?.searchInformation?.totalResults ?? "0", 10);
      const items        = (data?.items ?? []) as Array<{ link?: string }>;
      const pdfCount     = items.filter((item) =>
        item?.link?.includes("gumroad.com") ||
        item?.link?.includes("payhip.com") ||
        item?.link?.endsWith(".pdf")
      ).length;

      const monopolyScore =
        totalResults === 0  ? 100 :
        totalResults < 3    ? 85  :
        totalResults < 10   ? 65  :
        totalResults < 50   ? 40  : 15;

      result.set(kw.toLowerCase(), { pdfCount, monopolyScore });
    } catch (e) {
      console.warn(`[engine] Competition check failed for "${kw}":`, e);
    }

    // Small delay to respect rate limits
    if (i < limit - 1) await new Promise((r) => setTimeout(r, 120));
  }

  console.log(`[engine] Competition checked ${result.size} keywords — ${[...result.values()].filter(v => v.monopolyScore >= 85).length} monopoly opportunities`);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — Main engine handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
  const { keyword, niche = "", count = 15, country = "US", diaspora = false } = await req.json();

  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json({ error: "Google AI API key not configured" }, { status: 500 });
  }

  const openai = new OpenAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  const queries = buildDiscoveryQueries(country, keyword || "", niche || "", diaspora);

  // Phase 1 — Discovery: autocomplete + Reddit in parallel (unchanged)
  const [suggestionArrays, redditSignals] = await Promise.all([
    Promise.all(queries.map(fetchAutocompleteSuggestions)),
    Promise.race<string[]>([
      fetchRedditSignals(country, keyword || "", niche || "", diaspora).catch(() => []),
      new Promise<string[]>((resolve) => setTimeout(() => resolve([]), 3000)),
    ]),
  ]);

  const rawSearches = [...new Set(suggestionArrays.flat())]
    .filter((s) => s.length > 8)
    .sort((a, b) => {
      const aScore = /^(how|why|what|when|guide|step|complete|can i|avoid|stop|fix|start|make|get|pass|register|apply|manage)/i.test(a) ? 0 : 1;
      const bScore = /^(how|why|what|when|guide|step|complete|can i|avoid|stop|fix|start|make|get|pass|register|apply|manage)/i.test(b) ? 0 : 1;
      return aScore - bScore;
    });

  const pricing = diaspora
    ? (DIASPORA_PRICING[country] ?? PRICING.GB)
    : (PRICING[country] ?? PRICING.US);
  const market = diaspora
    ? (DIASPORA_MARKET_CONTEXT[country] ?? MARKET_CONTEXT.GB)
    : (MARKET_CONTEXT[country] ?? MARKET_CONTEXT.US);

  const minResultsGate = diaspora ? 3 : 10;
  if (rawSearches.length < minResultsGate) {
    return NextResponse.json({
      error: `Could not fetch enough live search data (got ${rawSearches.length} results). Check your internet connection and try again.`,
    }, { status: 503 });
  }

  console.log(`[engine] ${country}${diaspora ? " DIASPORA" : ""} (${market.tier}): ${queries.length} queries → ${rawSearches.length} searches, ${redditSignals.length} Reddit signals`);

  // Phase 2 — Real volumes via DataForSEO (graceful fallback if not configured)
  const top80 = rawSearches.slice(0, 80);
  const volumeMap = await fetchRealVolumes(top80, country);
  const hasRealVolumes = volumeMap.size > 0;

  // Phase 3 — Filter by real volume (only when DataForSEO is live)
  let enrichedKeywords: Array<{ keyword: string; volume?: number; inDataForSEO: boolean }>;
  if (hasRealVolumes) {
    enrichedKeywords = top80
      .map((kw) => {
        const data = volumeMap.get(kw.toLowerCase());
        return { keyword: kw, volume: data?.searchVolume, inDataForSEO: !!data };
      })
      // Hard filter: if DataForSEO has data and it's below the floor, cut it
      .filter(({ volume, inDataForSEO }) => !inDataForSEO || (volume ?? 0) >= ABSOLUTE_MIN_VOLUME)
      .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));

    console.log(`[engine] After volume filter: ${enrichedKeywords.length}/${top80.length} keywords survive ≥${ABSOLUTE_MIN_VOLUME.toLocaleString()}/mo`);
  } else {
    // DataForSEO not configured — pass all to Gemini for estimation
    enrichedKeywords = top80.map((kw) => ({ keyword: kw, inDataForSEO: false }));
  }

  if (enrichedKeywords.length < minResultsGate) {
    return NextResponse.json({
      error: `Real volume data shows fewer than ${minResultsGate} searches above ${ABSOLUTE_MIN_VOLUME.toLocaleString()}/mo for this market. Try a broader keyword or different country.`,
    }, { status: 422 });
  }

  // Phase 4 — Live competition check for top 20 (preserves 100 free/day quota)
  const top20 = enrichedKeywords.slice(0, 20).map((e) => e.keyword);
  const competitionMap = await checkPDFCompetition(top20);
  const hasRealCompetition = competitionMap.size > 0;

  // Phase 5 — Build enriched prompt list for Gemini
  // Gemini's only job now: pain point writing, title crafting, exact questions, urgency/ease scoring.
  // It must NOT estimate volumes or competition — real data is provided where available.
  const enrichedList = enrichedKeywords.slice(0, 60).map((e, i) => {
    const volAnnotation  = e.volume != null ? `${e.volume.toLocaleString()}/mo ✓ REAL` : (hasRealVolumes ? "volume unknown" : "");
    const compData       = competitionMap.get(e.keyword.toLowerCase());
    const compAnnotation = compData
      ? (compData.monopolyScore >= 85 ? `PDF supply: ${compData.pdfCount} ← MONOPOLY OPPORTUNITY` :
         compData.monopolyScore >= 65 ? `PDF supply: ${compData.pdfCount} (low)` :
         compData.monopolyScore >= 40 ? `PDF supply: ${compData.pdfCount} (medium)` :
                                        `PDF supply: ${compData.pdfCount} (saturated)`)
      : "";
    const parts = [`${i + 1}. "${e.keyword}"`];
    if (volAnnotation)  parts.push(`| ${volAnnotation}`);
    if (compAnnotation) parts.push(`| ${compAnnotation}`);
    return parts.join(" ");
  }).join("\n");

  const redditSection = redditSignals.length > 0
    ? `\n\nPAIN SIGNALS FROM REDDIT (how people actually describe these problems):\n${redditSignals.map((s, i) => `${i + 1}. "${s}"`).join("\n")}`
    : "";

  const diasporaContext = diaspora ? `
THIS IS DIASPORA MODE — ${country} diaspora living in the UK (and US, Canada, Australia).
These buyers have Western purchasing power (paying in £ or $) but need ${COUNTRY_LABEL[country] ?? country}-specific solutions.
Their knowledge gap is 10x worse than locals — they have no local contacts to call.
They pay premium prices for clarity and certainty.
Buyer profile: educated, employed, earning Western salaries, extremely frustrated that nobody has built a clear guide for their situation.
Price in GBP (${pricing.symbol}${pricing.min}–${pricing.symbol}${pricing.max}).` : "";

  const realDataNote = hasRealVolumes
    ? `\n\nIMPORTANT — REAL DATA PROVIDED:
Columns marked "✓ REAL" are actual Google monthly search volumes from DataForSEO — not estimates.
Columns marked "← MONOPOLY OPPORTUNITY" mean live Google search found zero competing PDF guides on Gumroad, Payhip, or Selar.
DO NOT override, re-estimate, or second-guess these numbers.
For the searchVolume field: use the exact "✓ REAL" figure. If not marked, make a conservative estimate.
For competition: "MONOPOLY OPPORTUNITY" = "low". High PDF supply count = "high".`
    : "";

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are a digital product strategist who builds a PDF guide business on one principle: solve a specific, painful, widespread problem that tens of thousands of people are actively searching for — and package the solution as the definitive, easy-to-buy guide.

YOUR INTELLIGENCE SYSTEM:

LAYER 1 — SEARCH SIGNAL (Google Autocomplete):
What people TYPE when they need answers. This is your SEO backbone.
The exact search phrase → embedded in the PDF title → page ranks on Google → free organic traffic forever.

LAYER 2 — VOLUME SIGNAL (DataForSEO / real Google data):
Actual monthly search volumes where available. Marked "✓ REAL". Use them exactly — do not adjust.

LAYER 3 — COMPETITION SIGNAL (Live Google Custom Search):
Live count of existing PDF guides on Gumroad, Payhip, Selar. "← MONOPOLY OPPORTUNITY" means zero competing guides exist right now.

LAYER 4 — PAIN SIGNAL (Reddit / social language):
What people SAY when they describe their suffering. Use this for the painPoint and PDF title framing.

HOW THESE LAYERS COMBINE IN ONE TITLE:
The keyword phrase gets the page found (SEO layer).
The pain framing makes the reader buy (conversion layer).

✅ SEARCH: "how to register a business in ghana"
   PAIN: "I've been going in circles for months — forms, wrong offices, missing documents"
   TITLE: "Complete Step-by-Step Guide to Registering a Business in Ghana 2026"
   PAIN POINT: "Thousands of Ghanaian entrepreneurs are losing months to confusing paperwork and wrong advice just to register a business that should take two weeks."

✅ SEARCH: "waec past questions"
   PAIN: "I studied hard but I don't know what the exam actually focuses on"
   TITLE: "WAEC / WASSCE Success Guide: How to Pass All Subjects Easily"

THE PAIN POINT — what it is and how to write it:
A single sentence (40–80 words) describing the specific suffering that creates demand for this PDF.
NOT "many people struggle with this topic." Too vague.
YES: Name the specific group, the specific frustration, the specific consequence.
Format: "[Group of people] [what they're trying to do] [what keeps going wrong] [the real cost of not solving it]"

TITLE RULES:
— Keyword phrase must appear naturally in the title (SEO signal preserved)
— Add year (2026) for registration, legal, exam, visa, government topics
— Use full dual acronyms: "WAEC / WASSCE", "JAMB / UTME", "KCSE / KNEC"
— Subtitle must state a PROMISE or OUTCOME (not just "A Complete Guide")

EXACT QUESTIONS — 4 SHORT HUMAN FRAGMENTS:
Real search fragments people type alongside the main query. These become chapter headings.
✅ "How much?", "Documents needed", "How long it takes", "Tax registration"
❌ "How do I find out what documents are required for this process?"

THE OPPORTUNITY DENSITY MODEL:
  Opportunity Density = Search Demand ÷ Supply of Existing Solutions

A topic with 9,000 monthly searches and ZERO competing PDF guides has infinite opportunity density.
A topic with 60,000 monthly searches and 400 competing PDF guides has low opportunity density.

FOUR SCORING AXES:
AXIS 1 — PDF MONOPOLY (weight: 35 pts max)
  Marked "← MONOPOLY OPPORTUNITY": +35 pts
  Low supply (1–3 PDFs): +20 pts
  Medium supply (several quality PDFs): +5 pts

AXIS 2 — DEMAND (weight: 30 pts max)
  Market: ${country} (${market.tier}). Minimum: ${ABSOLUTE_MIN_VOLUME.toLocaleString()}/month.
  ${ABSOLUTE_MIN_VOLUME.toLocaleString()}–${(market.strongVolume - 1).toLocaleString()}/month → +10 pts
  ${market.strongVolume.toLocaleString()}–${(market.massiveVolume - 1).toLocaleString()}/month → +20 pts
  ${market.massiveVolume.toLocaleString()}+/month → +30 pts

AXIS 3 — PROBLEM URGENCY (weight: 20 pts max)
  Urgent + consequential: +20 pts
  General improvement: +10 pts

AXIS 4 — FIRST-MOVER WINDOW (weight: 15 pts max)
  No quality guide exists: +15 pts
  Some competition but yours can be clearly better: +5 pts

SCORING:
90–100: Plant immediately.
80–89:  Strong seed.
70–79:  Worth planting if portfolio needs this niche.
Below 70: Skip.

REVENUE REALITY CHECK:
Monthly Revenue = Search Volume × (Top-3 CTR ≈ 30%) × Conversion Rate × Price
Example: 9,000/mo × 30% × 4% × ${pricing.symbol}${pricing.min} = ${pricing.symbol}${Math.round(9000 * 0.30 * 0.04 * pricing.min)}/month from ONE PDF.`,
        },
        {
          role: "user",
          content: `Find the ${count} most plantable PDF opportunities for ${diaspora ? `${COUNTRY_LABEL[country] ?? country} diaspora` : country}.
${diasporaContext}${realDataNote}

LIVE SEARCH DATA — what people are actively searching right now:
${enrichedList}${redditSection}

─────────────────────────────────────────
OUTPUT FORMAT (one object per opportunity)
─────────────────────────────────────────

{
  "painPoint": "40–80 words. Name who is suffering, what they are trying to do, what keeps going wrong, and what it costs them.",
  "keyword": "exact verbatim phrase from the search data above — copy precisely, no edits",
  "pdfTitle": "The keyword embedded naturally + reads like a real product someone would buy",
  "niche": "health | finance | education | business | farming | technology | relationships | home | career | mindset | other",
  "searchVolume": <integer — use the ✓ REAL figure if provided, otherwise estimate conservatively. Minimum ${ABSOLUTE_MIN_VOLUME}>,
  "opportunityScore": <integer 70–100, derived from the four-axis scoring above>,
  "competition": "low | medium | high",
  "trend": "rising | stable | declining",
  "easeToSell": "easy | medium | hard",
  "minPrice": ${pricing.min},
  "maxPrice": ${pricing.max},
  "emotionalIntent": "fear | urgency | desire | pain | confusion",
  "exactQuestions": ["Short fragment", "Short fragment", "Short fragment", "Short fragment"]
}

PRICING: ${pricing.symbol}${pricing.min}–${pricing.symbol}${pricing.max} (${pricing.note})

Return ONLY valid JSON: { "results": [...] }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    if (err.status === 429) {
      return NextResponse.json(
        { error: "Gemini quota exceeded — check your usage at aistudio.google.com" },
        { status: 402 }
      );
    }
    return NextResponse.json({ error: err.message ?? "AI request failed" }, { status: 500 });
  }

  let opportunities: Record<string, unknown>[] = [];
  try {
    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    opportunities = parsed.results || parsed.opportunities || [];
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  // Phase 6 — Override AI estimates with real data before saving
  opportunities = opportunities.map((o) => {
    const kw = String(o.keyword ?? "").toLowerCase();

    // Override volume with DataForSEO real data
    const realVolume = volumeMap.get(kw)?.searchVolume;
    if (realVolume != null) {
      o = { ...o, searchVolume: realVolume };
    }

    // Override competition with Google Custom Search data
    const compData = competitionMap.get(kw);
    if (compData) {
      const competition =
        compData.monopolyScore >= 85 ? "low" :
        compData.monopolyScore >= 50 ? "medium" : "high";
      o = { ...o, competition };
    }

    return o;
  });

  // Hard filter by real volume
  opportunities = opportunities.filter((o) => Number(o.searchVolume) >= ABSOLUTE_MIN_VOLUME);

  if (opportunities.length === 0) {
    return NextResponse.json({
      error: `No plantable opportunities found in this scan. Try adding a keyword or niche to focus the search, or switch markets.`,
    }, { status: 422 });
  }

  const saved = [];
  for (const o of opportunities) {
    try {
      const existing = await prisma.opportunity.findFirst({ where: { keyword: String(o.keyword) } });
      if (!existing) {
        const score       = Math.min(100, Math.max(0, Number(o.opportunityScore) || 70));
        const competition = String(o.competition || "medium");
        const kw          = String(o.keyword);
        const volume      = Number(o.searchVolume) || 0;
        const isQuickWin  = score >= 80 && competition === "low" && kw.trim().split(/\s+/).length >= 4 && volume >= ABSOLUTE_MIN_VOLUME * 2;
        const created = await prisma.opportunity.create({
          data: {
            keyword:          kw,
            pdfTitle:         String(o.pdfTitle || kw),
            painPoint:        String(o.painPoint || ""),
            niche:            String(o.niche || "general"),
            country:          String(country),
            searchVolume:     volume,
            opportunityScore: score,
            competition,
            trend:            String(o.trend || "stable"),
            easeToSell:       String(o.easeToSell || "medium"),
            minPrice:         Number(o.minPrice) || pricing.min,
            maxPrice:         Number(o.maxPrice) || pricing.max,
            emotionalIntent:  String(o.emotionalIntent || "desire"),
            exactQuestions:   JSON.stringify(Array.isArray(o.exactQuestions) ? o.exactQuestions : []),
            isQuickWin,
            isDiaspora: Boolean(diaspora),
          },
        });
        saved.push(created);
      } else {
        saved.push(existing);
      }
    } catch (e) {
      console.error("[engine] Failed to save opportunity:", e);
    }
  }

  return NextResponse.json(saved);

  } catch (e: unknown) {
    const err = e as { message?: string };
    console.error("[engine] Unhandled error:", err);
    return NextResponse.json({ error: err.message ?? "Unexpected error — please try again." }, { status: 500 });
  }
}

export async function GET() {
  const opportunities = await prisma.opportunity.findMany({
    orderBy: { opportunityScore: "desc" },
  });
  return NextResponse.json(opportunities);
}

export async function PATCH(req: Request) {
  const { id, saved } = await req.json();
  const updated = await prisma.opportunity.update({ where: { id }, data: { saved } });
  return NextResponse.json(updated);
}
