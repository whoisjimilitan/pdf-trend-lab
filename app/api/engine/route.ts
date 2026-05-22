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

// YouTube search suggestions — different algorithm to Google, surfaces video-demand queries.
// People searching YouTube for "how to" topics = very high intent, very PDF-compatible.
async function fetchYouTubeSuggestions(query: string): Promise<string[]> {
  try {
    const url = `https://suggestqueries-clients6.youtube.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}&hl=en`;
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

// Bing suggestions — independent algorithm, different ranking signals.
// A query appearing in both Google + Bing = confirmed real demand (not autocomplete noise).
async function fetchBingSuggestions(query: string): Promise<string[]> {
  try {
    const url = `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(query)}&mkt=en-GB`;
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

const COUNTRY_LABEL: Record<string, string> = {
  GH: "ghana", NG: "nigeria", KE: "kenya", ZA: "south africa",
  GB: "uk", CA: "canada", AU: "australia", US: "", GLOBAL: "",
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
  GLOBAL: ["personalfinance", "selfimprovement", "Anxiety", "relationship_advice", "careerguidance", "mentalhealth", "Parenting"],
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

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 5 — Question Variants (People Also Ask equivalent — zero scraping)
// Appends question words to proven pain queries to surface hyper-specific variants.
// The same autocomplete API, different angle — reveals what confused people ask next.
// ─────────────────────────────────────────────────────────────────────────────

async function fetchQuestionVariants(query: string): Promise<string[]> {
  const prefixes = ["how", "what", "when", "why", "which", "can i", "do i need"];
  try {
    const results = await Promise.allSettled(
      prefixes.map((p) => fetchAutocompleteSuggestions(`${query} ${p}`))
    );
    const all: string[] = [];
    for (const r of results) if (r.status === "fulfilled") all.push(...r.value);
    return [...new Set(all)].filter((q) => q.length > 12 && q !== query).slice(0, 20);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 6 — DuckDuckGo Related Topics (free, no auth)
// Independent algorithm surfaces adjacent pain clusters Google and Bing miss.
// ─────────────────────────────────────────────────────────────────────────────

async function fetchDuckDuckGoTopics(query: string): Promise<string[]> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "PDFTrendLab/1.0 (research)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const topics: string[] = [];
    for (const item of (data?.RelatedTopics ?? [])) {
      if (item?.Text && item.Text.length > 10) topics.push(item.Text.split(" - ")[0].trim());
      if (Array.isArray(item?.Topics)) {
        for (const sub of item.Topics) {
          if (sub?.Text && sub.Text.length > 10) topics.push(sub.Text.split(" - ")[0].trim());
        }
      }
    }
    return [...new Set(topics)].slice(0, 15);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 7 — Community Pain Signals (Quora + Reddit via Custom Search)
// Real questions from forums = verified pain in exact human language, highest intent.
// Uses 1 Custom Search query — preserves quota for competition check and gap scoring.
// ─────────────────────────────────────────────────────────────────────────────

async function fetchCommunitySignals(query: string, country: string): Promise<string[]> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_KEY;
  const cx     = process.env.GOOGLE_CUSTOM_SEARCH_CX;
  if (!apiKey || !cx) return [];
  const label = COUNTRY_LABEL[country] ?? "";
  const searchQuery = `(site:quora.com OR site:reddit.com) "${query}"${label ? " " + label : ""}`;
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(searchQuery)}&num=10`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    const data = await res.json();
    const items = (data?.items ?? []) as Array<{ title?: string; link?: string }>;
    const signals: string[] = [];
    for (const item of items) {
      const title = item?.title?.replace(/ - Quora$| - Reddit$/i, "").trim();
      if (title && title.length > 10 && title.length < 150) signals.push(title);
    }
    return [...new Set(signals)].slice(0, 12);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 8 — Answer Gap Scoring
// Measures HOW POORLY the internet currently answers a question.
// High gap = gov sites, Wikipedia, outdated content, or video-only results dominate.
// An empty shelf = easier first-mover sale, lower ad costs, less review resistance.
// Runs on top 15 keywords only — costs Custom Search quota, worth every query.
// ─────────────────────────────────────────────────────────────────────────────

async function scoreAnswerGaps(keywords: string[]): Promise<Map<string, number>> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_KEY;
  const cx     = process.env.GOOGLE_CUSTOM_SEARCH_CX;
  if (!apiKey || !cx) return new Map();
  const result = new Map<string, number>();
  const limit  = Math.min(keywords.length, 15);

  for (let i = 0; i < limit; i++) {
    const kw = keywords[i];
    try {
      const url  = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(kw)}&num=10`;
      const res  = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) continue;
      const data  = await res.json();
      const items = (data?.items ?? []) as Array<{ link?: string; snippet?: string }>;
      const total = parseInt(data?.searchInformation?.totalResults ?? "0", 10);
      let score = 0;

      // Government domain = authoritative but impenetrable for regular people → gap for plain-language guide
      if (items.some((item) => /\.gov\.|\.gov$|\.go\.|government\./i.test(item?.link ?? ""))) score += 35;
      // Wikipedia = generic overview, no steps → gap for actionable guide
      if (items.some((item) => item?.link?.includes("wikipedia.org"))) score += 20;
      // Old content (2018–2022) = outdated → gap for 2025/2026 updated guide
      if (items.some((item) => /201[89]|2020|2021|2022/.test(item?.snippet ?? ""))) score += 25;
      // No step-by-step structure in snippets → gap for structured guide
      const hasSteps = items.some((item) => /step [0-9]|1\.\s|2\.\s|first.*then/i.test(item?.snippet ?? ""));
      if (!hasSteps && items.length > 0) score += 15;
      // Video-only first result → gap for readable/downloadable guide
      if (items[0]?.link?.includes("youtube.com") || items[0]?.link?.includes("youtu.be")) score += 20;
      // Very thin coverage → almost certain gap
      if (total < 1000) score += 20;
      else if (total < 10000) score += 10;

      result.set(kw.toLowerCase(), Math.min(score, 100));
    } catch { /* ignore individual failures */ }
    if (i < limit - 1) await new Promise((r) => setTimeout(r, 120));
  }

  console.log(`[engine] Gap scored ${result.size} keywords — ${[...result.values()].filter(v => v >= 50).length} high-gap opportunities`);
  return result;
}

// Pain-pattern discovery starters — behavior-based, not topic-based.
// Each pattern combined with a country label surfaces ANY niche organically via autocomplete.
// The engine discovers niches from data; the developer makes no assumption about what to sell.
const PAIN_PATTERNS = [
  "how to apply for",
  "how to register",
  "how to renew",
  "how to get",
  "how to open",
  "how to start",
  "requirements for",
  "how to recover from",
  "problems with",
  "how to make money",
  "how to invest",
  "how to save money",
  "how to transfer",
  "how to pay",
  "how to claim",
  "how to avoid",
  "how to understand",
  "what happens when",
  "how to deal with",
  "what to do if",
  "how to prove",
  "how to fight",
  "how to appeal",
  "how to protect",
  "how much does it cost to",
];

// Universal human pain domains — no country, no niche assumption.
// Used in Global mode as autocomplete seeds. Covers mental health, physical health,
// financial hardship, relationships, career, and universal bureaucracy.
const GLOBAL_PAIN_SEEDS = [
  // Mental & emotional
  "anxiety", "depression", "grief", "trauma", "burnout", "loneliness", "panic attack", "anger",
  // Physical health
  "chronic pain", "insomnia", "weight loss", "diabetes", "hair loss", "infertility",
  // Relationships & family
  "divorce", "toxic relationship", "narcissist", "co-parenting", "bereavement",
  // Financial hardship
  "debt", "credit score", "bankruptcy", "side hustle", "investing for beginners",
  // Career & work
  "job loss", "career change", "freelancing", "job interview",
  // Universal admin
  "visa application", "tax return", "driving test", "employment contract",
  // Personal struggles
  "procrastination", "social anxiety", "low self-esteem", "productivity",
];

function buildDiscoveryQueries(country: string, keyword: string, niche: string, diaspora = false): string[] {
  const label = COUNTRY_LABEL[country] ?? "";

  if (country === "GLOBAL") {
    if (keyword) {
      return [
        `how to ${keyword}`, `how do i ${keyword}`, `${keyword} guide`, `${keyword} for beginners`,
        `${keyword} step by step`, `how to fix ${keyword}`, `${keyword} tips`, `${keyword} problems`,
        `${keyword} help`, `how to deal with ${keyword}`, `how to recover from ${keyword}`,
      ];
    }
    if (niche) {
      return [
        `how to ${niche}`, `${niche} guide`, `${niche} problems`, `${niche} help`,
        `${niche} tips`, `${niche} for beginners`, `${niche} mistakes`,
        `how to deal with ${niche}`, `how to recover from ${niche}`, `${niche} step by step`,
      ];
    }
    // Broad global scan: seeds + behavioral pattern combinations surface any niche from autocomplete
    return [
      ...GLOBAL_PAIN_SEEDS,
      ...GLOBAL_PAIN_SEEDS.slice(0, 18).map((s) => `how to deal with ${s}`),
      ...GLOBAL_PAIN_SEEDS.slice(0, 14).map((s) => `how to recover from ${s}`),
      ...GLOBAL_PAIN_SEEDS.slice(14).map((s) => `${s} help`),
    ].slice(0, 65);
  }

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
    return nicheQueries;
  }

  // Broad scan — no keyword, no niche. Pain patterns + country label let autocomplete
  // surface whatever people are actually searching, with no niche pre-assumed by the developer.
  return PAIN_PATTERNS.map((p) => (label ? `${p} ${label}` : p));
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
  GLOBAL: { symbol: "$", min: 12.99, max: 24.99, note: "USD — borderless digital product" },
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
  GLOBAL: { tier: "global", strongVolume: 40000, massiveVolume: 100000 },
};

const DIASPORA_MARKET_CONTEXT: Record<string, { tier: string; strongVolume: number; massiveVolume: number }> = {
  GH: { tier: "diaspora-niche", strongVolume: 3000, massiveVolume: 10000 },
  NG: { tier: "diaspora-niche", strongVolume: 5000, massiveVolume: 15000 },
  KE: { tier: "diaspora-niche", strongVolume: 2000, massiveVolume: 8000  },
  ZA: { tier: "diaspora-niche", strongVolume: 2000, massiveVolume: 8000  },
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY LAYER — Deterministic helpers that run before AI touches anything.
// These eliminate the three gaps: fabricated trends, guessed volumes, near-duplicate waste.
// ─────────────────────────────────────────────────────────────────────────────

// GAP 1 FIX: Rule-based trend classifier — deterministic, not AI-guessed.
// Year-specific queries → rising. Exam prep → seasonal. Diaspora/bureaucracy → stable.
// Cross-source confirmation level also feeds in as a signal.
function inferTrend(query: string, sourceCount: number): "rising" | "stable" | "seasonal" | "exploding" {
  const q = query.toLowerCase();
  if (/2026|2025/.test(q))                                                         return "rising";
  if (/waec|jamb|kcse|wassce|utme|matric|nsfas|exam|admission/.test(q))            return "seasonal";
  if (/recover|lost|stolen|blocked|failed|rejected|denied|urgent|emergency/.test(q)) return "rising";
  if (/new.*law|new.*regulation|new.*policy|just.*passed|recently.*changed/.test(q)) return "exploding";
  if (sourceCount >= 3) return "stable"; // confirmed across all 3 engines = proven steady demand
  return "stable";
}

// GAP 2 FIX: Semantic fingerprint for deduplication.
// Strips stop-words and sorts content words so near-duplicates collapse to the same key.
// "ghana passport renewal from uk" → "ghana+passport+renewal+uk"
// "how to renew ghana passport from uk" → "ghana+passport+renewal+uk"  (same cluster → one slot)
const STOP_WORDS = new Set([
  "how", "to", "do", "i", "can", "the", "a", "an", "in", "from", "for",
  "is", "are", "my", "your", "and", "or", "of", "at", "by", "with",
  "about", "into", "what", "why", "when", "where", "who", "which", "get",
  "step", "guide", "complete", "beginners", "easy", "fast", "quick",
]);

function getQueryFingerprint(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => !STOP_WORDS.has(w) && w.length > 2)
    .sort()
    .slice(0, 5)
    .join("+");
}

// GAP 3 FIX: Cross-source frequency → volume proxy.
// Replaces AI-hallucinated volume estimates with a signal derived from real data already in hand.
// A query appearing in Google + YouTube + Bing simultaneously is definitionally being searched.
// Pain score multiplier applied: high-pain queries have higher real search volume than peers.
function estimateVolumeFromSources(query: string, sourceCount: number, painScore: number): number {
  const isDiaspora = /from uk|from abroad|overseas|from usa|from canada|from australia/.test(query.toLowerCase());
  let base = sourceCount >= 3 ? 9000 : sourceCount >= 2 ? 3500 : 1200;
  if (painScore >= 35) base = Math.round(base * 1.4);
  else if (painScore >= 20) base = Math.round(base * 1.2);
  if (isDiaspora) base = Math.max(base, 2500);
  return base;
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2 — Real search volume via DataForSEO (~$0.0003/keyword)
// Replaces AI-hallucinated volumes with Google's actual monthly search data.
// ─────────────────────────────────────────────────────────────────────────────

const DATAFORSEO_LOCATION: Record<string, number> = {
  GH: 2288, NG: 2566, KE: 2404, ZA: 2710,
  GB: 2826, US: 2840, CA: 2124, AU: 2036,
  GLOBAL: 2840, // US as proxy — largest English market, broadest autocomplete coverage
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
// LAYER 4 — Commercial Pain Detector
// Scores every query for urgency, confusion, and willingness-to-pay BEFORE
// sending anything to Gemini. A 2k/mo search with panic + money beats a
// 50k/mo "what is…" query every time. This is the engine's moat.
// ─────────────────────────────────────────────────────────────────────────────

interface PainScore {
  score: number;
  flags: string[];
  isPDFSuitable: boolean;
}

function scoreCommercialPain(query: string): PainScore {
  const q = query.toLowerCase();
  const flags: string[] = [];
  let score = 0;

  // FEAR & MONEY — highest conversion signals. Panic + cash = instant buyer.
  if (/recover|lost|stolen|blocked|failed|rejected|denied|wrong|mistake|fix|scam|fraud|cheat/.test(q)) {
    score += 15; flags.push("FEAR");
  }
  if (/money|payment|transfer|fund|fee|cost|salary|income|debt|loan|refund|withdraw|charge/.test(q)) {
    score += 15; flags.push("MONEY");
  }

  // DEADLINE URGENCY — people pay to avoid consequences
  if (/urgent|emergency|deadline|expire|expired|late|overdue|asap|last chance/.test(q)) {
    score += 12; flags.push("DEADLINE");
  }

  // DIASPORA — highest willingness to pay. Western salary, African problem, zero local help.
  if (/from uk|from abroad|from usa|from canada|from australia|overseas|international|diaspora/.test(q)) {
    score += 15; flags.push("DIASPORA");
  }
  if (/embassy|high commission|visa|passport|immigration|citizenship|dual nationality/.test(q)) {
    score += 12; flags.push("IMMIGRATION");
  }

  // PROCESS COMPLEXITY — people pay for someone to untangle bureaucracy
  if (/register|registration|apply|application|renew|renewal|submit|obtain|procedure|process/.test(q)) {
    score += 10; flags.push("PROCESS");
  }
  if (/document|certificate|form|checklist|requirement|proof/.test(q)) {
    score += 8; flags.push("PAPERWORK");
  }

  // LEGAL / OFFICIAL — high stakes, low tolerance for mistakes
  if (/tax|legal|law|court|fine|penalty|compliance|licence|license|regulation/.test(q)) {
    score += 10; flags.push("LEGAL");
  }

  // CONFUSION — buyer is lost and willing to pay for clarity
  if (/confused|don.t know|not sure|understand|explain|what happens|what do i|help me/.test(q)) {
    score += 8; flags.push("CONFUSION");
  }

  // STEP-BY-STEP INTENT — explicitly wants a guide
  if (/how to|step by step|complete guide|beginners|without mistake|correctly/.test(q)) {
    score += 8; flags.push("GUIDE-INTENT");
  }

  // HEALTH ANXIETY — always high-intent
  if (/symptom|sick|disease|hospital|medical|health|pain|treatment|cure/.test(q)) {
    score += 8; flags.push("HEALTH");
  }

  // CAREER / FINANCIAL STRESS
  if (/job|career|fired|unemployed|promotion|interview|salary|business|start a business/.test(q)) {
    score += 6; flags.push("CAREER");
  }

  // CONSEQUENCE SCORING — what happens if they get this wrong?
  // Higher consequence = higher willingness to pay immediately.
  if (/visa.*(reject|denied|refused|fail)|rejected.*visa|denied.*visa/.test(q)) {
    score += 20; flags.push("CONSEQUENCE-VISA");
  }
  if (/deportat|removal order|illegal stay|overstay/.test(q)) {
    score += 20; flags.push("CONSEQUENCE-DEPORTATION");
  }
  if (/inheritance|probate|land.*death|property.*death|after.*death/.test(q)) {
    score += 18; flags.push("CONSEQUENCE-INHERITANCE");
  }
  if (/land.*dispute|property.*dispute|ownership.*dispute|title.*fraud/.test(q)) {
    score += 18; flags.push("CONSEQUENCE-DISPUTE");
  }
  if (/pension|retirement.*claim|claim.*pension/.test(q)) {
    score += 15; flags.push("CONSEQUENCE-PENSION");
  }
  if (/tax.*penalty|tax.*fine|tax.*mistake|tax.*error|wrong.*tax/.test(q)) {
    score += 15; flags.push("CONSEQUENCE-TAX");
  }
  if (/exam.*fail|fail.*exam|repeat.*exam|resit/.test(q)) {
    score += 12; flags.push("CONSEQUENCE-EXAM");
  }
  if (/account.*frozen|account.*blocked|bank.*block|momo.*block|momo.*fail|recover.*momo|recover.*transfer/.test(q)) {
    score += 18; flags.push("CONSEQUENCE-FROZEN");
  }

  // PAIN DENSITY BONUS — queries with 3+ primary flags simultaneously
  // are where real PDF sales happen. Multi-pain = multi-motivated buyer.
  const primaryFlagCount = flags.filter((f) =>
    ["FEAR","MONEY","DIASPORA","DEADLINE","IMMIGRATION","LEGAL","PROCESS","HEALTH"].includes(f)
  ).length;
  if (primaryFlagCount >= 3) { score += 20; flags.push("HIGH-DENSITY"); }
  else if (primaryFlagCount >= 2) { score += 10; flags.push("MULTI-PAIN"); }

  // ANTI-PATTERNS — subtract for signals that don't convert to PDF sales
  if (/^what is |^who is |^where is |^when did |^why is |history of |definition |meaning of /.test(q)) {
    score -= 20; flags.push("INFORMATIONAL");
  }
  if (/news|latest|today|celebrity|movie|song|music|sport|game|entertainment|gossip/.test(q)) {
    score -= 25; flags.push("ENTERTAINMENT");
  }
  if (/reddit|twitter|instagram|tiktok|youtube|facebook|social media/.test(q)) {
    score -= 15; flags.push("SOCIAL-META");
  }
  if (/funny|joke|meme|quiz/.test(q)) {
    score -= 30; flags.push("JUNK");
  }
  if (/^review |best .* for |vs |compared to |difference between /.test(q)) {
    score -= 8; flags.push("COMPARATIVE");
  }

  // ── HARD REJECTION GATES ──────────────────────────────────────────────────
  // These disqualify a query entirely regardless of other signals.

  // Gate 1: Junk categories — will never become a sellable PDF
  const isJunk = /news|celebrity|movie|song|music|sport|game|funny|meme|quiz|twitter|instagram|tiktok|reddit|facebook|youtube/.test(q);

  // Gate 2: Pure information — answerable in 10 seconds on Google, no PDF needed
  const isPureInfo = /^what is |^who is |^where is |^when did |^why is |^definition of |^meaning of |^history of /.test(q);

  // Gate 3: Too vague or too broad — no specific problem being solved
  const isTooVague = q.trim().split(/\s+/).length < 3; // fewer than 3 words

  // Gate 4: Free answer exists — no one pays for this
  const hasFreeAnswer = /wikipedia|dictionary|translate|convert|calculator|weather|time in |capital of |population of /.test(q);

  // ── PDF SUITABILITY — positive confirmation ────────────────────────────────
  // Must contain at least one signal that a structured guide is the right format
  const hasPDFFormat = /how to|step by step|guide|process|register|apply|renew|obtain|recover|documents|checklist|requirements|procedure|certificate|application|from uk|from abroad|abroad|setup|start a|side hustle|exam|pass |avoid|without mistake|correctly/.test(q);

  const isPDFSuitable =
    !isJunk &&
    !isPureInfo &&
    !isTooVague &&
    !hasFreeAnswer &&
    hasPDFFormat;

  return { score, flags, isPDFSuitable };
}

function computeVolumeTier(volume: number): string {
  if (volume >= 50000) return "mass-market";
  if (volume >= 20000) return "strong";
  if (volume >= 5000)  return "niche";
  return "micro-niche";
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — Main engine handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
  const { keyword, niche = "", count = 20, country = "US", diaspora = false } = await req.json();

  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json({ error: "Google AI API key not configured" }, { status: 500 });
  }

  const openai = new OpenAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  // ── PROGRESSIVE DISCOVERY (LIGHTBULB) ────────────────────────────────────
  // Pull winning keywords from previous runs (score ≥ 80) as additional discovery anchors.
  // The engine builds on its own successes — each run expands the frontier by autocompleting
  // off proven winners to surface hyper-specific variations. Run 5 finds what Run 1 missed.
  // Progressive seeds: include 72+ (not just 80+) for wider frontier expansion.
  // Exclude very recent (<48h) seeds — they're already in rawSearches from the previous run.
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const progressiveRaw = await prisma.opportunity.findMany({
    where: {
      country,
      isDiaspora: diaspora,
      opportunityScore: { gte: 72 },
      createdAt: { lt: twoDaysAgo },
    },
    orderBy: { opportunityScore: "desc" },
    take: 20,
    select: { keyword: true },
  });
  const progressiveSeeds = progressiveRaw.map((r) => r.keyword);

  const baseQueries = buildDiscoveryQueries(country, keyword || "", niche || "", diaspora);
  // Union: fixed anchors + progressive seeds. Seeds run through autocomplete to surface
  // deeper, more specific variations of what's already proven to be commercially painful.
  const queries = [...new Set([...baseQueries, ...progressiveSeeds])];

  // Phase 1 — 7-source parallel discovery.
  // Google/YouTube/Bing = cross-algorithm autocomplete validation.
  // Question variants = PAA-equivalent (appends question words to surface what confused people ask next).
  // DuckDuckGo = adjacent topic clusters Google/Bing miss.
  // Community signals = Quora/Reddit forum questions (verified pain in exact human language).
  // Reddit = community posts for real problem phrasing.
  const top3Queries = baseQueries.slice(0, 3);
  const mainQuery   = keyword || niche || COUNTRY_LABEL[country] || "";

  const [googleArrays, youtubeArrays, bingArrays, redditSignals, questionVariants, ddgResults, communitySignals] = await Promise.all([
    Promise.all(queries.map(fetchAutocompleteSuggestions)),
    Promise.all(queries.map(fetchYouTubeSuggestions)),
    Promise.all(queries.map(fetchBingSuggestions)),
    Promise.race<string[]>([
      fetchRedditSignals(country, keyword || "", niche || "", diaspora).catch(() => []),
      new Promise<string[]>((resolve) => setTimeout(() => resolve([]), 3000)),
    ]),
    Promise.allSettled(top3Queries.map(fetchQuestionVariants)).then((rs) =>
      rs.flatMap((r) => r.status === "fulfilled" ? r.value : [])
    ),
    fetchDuckDuckGoTopics(mainQuery).catch(() => [] as string[]),
    fetchCommunitySignals(mainQuery, country).catch(() => [] as string[]),
  ]);

  // Cross-source demand validation: count distinct sources per query.
  // Dedup within each source first — then count source appearances.
  const googleSet  = new Set(googleArrays.flat().filter((q) => q.length > 8));
  const youtubeSet = new Set(youtubeArrays.flat().filter((q) => q.length > 8));
  const bingSet    = new Set(bingArrays.flat().filter((q) => q.length > 8));

  const sourceFrequency = new Map<string, number>();
  for (const q of [...googleSet, ...youtubeSet, ...bingSet]) {
    sourceFrequency.set(q, (sourceFrequency.get(q) ?? 0) + 1);
  }

  // Merge new signal sources — each adds +1 to frequency (community signals +2: forum = strong confirmation)
  const questionVariantSet = new Set(questionVariants.filter((q) => q.length > 8));
  const ddgSet             = new Set(ddgResults.filter((q) => q.length > 8));
  const communitySet       = new Set(communitySignals.filter((q) => q.length > 8));

  for (const q of questionVariantSet) sourceFrequency.set(q, (sourceFrequency.get(q) ?? 0) + 1);
  for (const q of ddgSet) sourceFrequency.set(q, (sourceFrequency.get(q) ?? 0) + 1);
  for (const q of communitySet) sourceFrequency.set(q, (sourceFrequency.get(q) ?? 0) + 2);

  // Track platform origin per signal — used to set platformOfOrigin field
  const signalOrigins = new Map<string, string>();
  for (const q of questionVariantSet) signalOrigins.set(q.toLowerCase(), "paa");
  for (const q of ddgSet) if (!signalOrigins.has(q.toLowerCase())) signalOrigins.set(q.toLowerCase(), "duckduckgo");
  for (const q of communitySet) signalOrigins.set(q.toLowerCase(), "community"); // override — highest signal quality

  const rawSearches = [...sourceFrequency.keys()];

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

  // ── LAYER 4: Commercial Pain Detection ────────────────────────────────────
  // Score and filter every query before anything else touches it.
  // This stops weak seeds at the door.
  // PRIMARY CONVERSION FLAGS — at least one must be present to pass
  const PRIMARY_FLAGS = new Set(["FEAR", "MONEY", "DIASPORA", "DEADLINE", "IMMIGRATION", "LEGAL", "PROCESS", "HEALTH"]);
  const MIN_PAIN_SCORE = 12;

  const initialScored = rawSearches
    .map((q) => ({ query: q, ...scoreCommercialPain(q) }))
    .filter((s) =>
      s.isPDFSuitable &&
      s.score >= MIN_PAIN_SCORE &&
      s.flags.some((f) => PRIMARY_FLAGS.has(f))
    )
    .sort((a, b) => b.score - a.score);

  // Depth drill: autocomplete the top 8 highest-pain queries to surface
  // MORE SPECIFIC, MORE URGENT variations (e.g. "ghana passport renewal uk"
  // → "ghana passport renewal uk documents needed", "how long does it take", etc.)
  const top8forDepth = initialScored.slice(0, 8).map((s) => s.query);
  const depthArrays  = await Promise.all(top8forDepth.map(fetchAutocompleteSuggestions));
  const depthRaw     = [...new Set(depthArrays.flat())].filter((s) => s.length > 8);
  const initialSet   = new Set(initialScored.map((s) => s.query));
  const depthScored  = depthRaw
    .map((q) => ({ query: q, ...scoreCommercialPain(q) }))
    .filter((s) =>
      s.isPDFSuitable &&
      s.score >= MIN_PAIN_SCORE &&
      s.flags.some((f) => PRIMARY_FLAGS.has(f)) &&
      !initialSet.has(s.query)
    );

  // Merge Level 1 + Level 2 signals, re-sort by pain score
  const allScored = [...initialScored, ...depthScored].sort((a, b) => b.score - a.score);

  // ── SEMANTIC CLUSTER DEDUP ────────────────────────────────────────────────
  // Keeps only the best-scored query per topic fingerprint. Near-duplicates no longer
  // compete for the same AI output slots — every slot goes to a distinct opportunity.
  let clusterDeduped = (() => {
    const seen = new Map<string, typeof allScored[0]>();
    for (const item of allScored) {
      const fp = getQueryFingerprint(item.query);
      const existing = seen.get(fp);
      if (!existing || item.score > existing.score) seen.set(fp, item);
    }
    return [...seen.values()].sort((a, b) => b.score - a.score);
  })();

  const confirmedCount  = [...sourceFrequency.values()].filter((n) => n >= 3).length;
  const validatedCount  = [...sourceFrequency.values()].filter((n) => n === 2).length;
  console.log(`[engine] ${country}${diaspora ? " DIASPORA" : ""} (${market.tier}): ${rawSearches.length} raw (${confirmedCount} 3-src, ${validatedCount} 2-src, ${communitySet.size} community, ${questionVariantSet.size} paa-variant) → ${allScored.length} pain-scored → ${clusterDeduped.length} clusters. Top: ${clusterDeduped[0]?.score ?? 0} [${clusterDeduped[0]?.flags.join("+")}]`);

  // ── ADAPTIVE SIGNAL AMPLIFICATION ─────────────────────────────────────────
  // When pain-scored signal is thin, automatically drill deeper on the best signals found.
  // Preserves full quality standards — only expands the INPUT, never relaxes the OUTPUT.
  // The AI always receives rich material; we just make sure it has enough to work with.
  const MIN_SIGNALS_FOR_AI = 20;

  if (clusterDeduped.length < MIN_SIGNALS_FOR_AI && clusterDeduped.length > 0) {
    console.log(`[engine] Signal thin (${clusterDeduped.length}) — auto-expanding with question variants + depth autocomplete...`);
    const topForDrill = clusterDeduped.slice(0, Math.min(5, clusterDeduped.length)).map((s) => s.query);

    // Drill 1: Question variants — surfaces "what documents", "how long does it take", "can I", etc.
    const variantArrays = await Promise.allSettled(topForDrill.map(fetchQuestionVariants));
    const variantRaw = variantArrays.flatMap((r) => r.status === "fulfilled" ? r.value : []);

    // Drill 2: Second-pass autocomplete on the best 3 signals — different completions on re-query
    const depth2Arrays = await Promise.allSettled(topForDrill.slice(0, 3).map(fetchAutocompleteSuggestions));
    const depth2Raw = depth2Arrays.flatMap((r) => r.status === "fulfilled" ? r.value : []);

    // Pain-score the new signals with the same full quality gate
    const newSignalSet = [...new Set([...variantRaw, ...depth2Raw])].filter((q) => q.length > 8);
    const drillScored  = newSignalSet
      .map((q) => ({ query: q, ...scoreCommercialPain(q) }))
      .filter((s) =>
        s.isPDFSuitable &&
        s.score >= MIN_PAIN_SCORE &&
        s.flags.some((f) => PRIMARY_FLAGS.has(f))
      );

    // Register new signals (1-source, not yet cross-validated)
    for (const s of drillScored) {
      if (!sourceFrequency.has(s.query)) sourceFrequency.set(s.query, 1);
    }

    // Merge all signals and re-deduplicate at semantic level
    const combinedScored = [...allScored, ...drillScored].sort((a, b) => b.score - a.score);
    const rededuped = (() => {
      const seen = new Map<string, typeof combinedScored[0]>();
      for (const item of combinedScored) {
        const fp = getQueryFingerprint(item.query);
        const existing = seen.get(fp);
        if (!existing || item.score > existing.score) seen.set(fp, item);
      }
      return [...seen.values()].sort((a, b) => b.score - a.score);
    })();

    clusterDeduped = rededuped;
    console.log(`[engine] Expansion complete: ${clusterDeduped.length} clusters (was ${confirmedCount + validatedCount} cross-validated + ${drillScored.length} drilled)`);
  }

  // Phase 2 — Real volumes via DataForSEO on clustered queries
  const topForVolume = clusterDeduped.slice(0, 80).map((s) => s.query);
  const volumeMap    = await fetchRealVolumes(topForVolume, country);
  const hasRealVolumes = volumeMap.size > 0;

  // Phase 3 — Volume filter: cut confirmed low-volume queries, keep unknowns
  let enrichedKeywords: Array<{ keyword: string; painScore: number; flags: string[]; volume?: number; inDataForSEO: boolean }>;
  if (hasRealVolumes) {
    enrichedKeywords = clusterDeduped
      .map((s) => {
        const data = volumeMap.get(s.query.toLowerCase());
        return { keyword: s.query, painScore: s.score, flags: s.flags, volume: data?.searchVolume, inDataForSEO: !!data };
      })
      .filter(({ volume, inDataForSEO }) => !inDataForSEO || (volume ?? 0) >= ABSOLUTE_MIN_VOLUME)
      .sort((a, b) => (b.painScore * 1000 + (b.volume ?? 0)) - (a.painScore * 1000 + (a.volume ?? 0)));

    console.log(`[engine] After volume filter: ${enrichedKeywords.length}/${topForVolume.length} keywords survive`);
  } else {
    enrichedKeywords = clusterDeduped.map((s) => ({ keyword: s.query, painScore: s.score, flags: s.flags, inDataForSEO: false }));
  }

  if (enrichedKeywords.length < minResultsGate) {
    return NextResponse.json({
      error: `No strong pain signals found above volume floor for this market. Try a more specific keyword or switch to Diaspora mode.`,
    }, { status: 422 });
  }

  // Phase 4 — Competition check for top pain-scored keywords
  const top20 = enrichedKeywords.slice(0, 20).map((e) => e.keyword);
  const competitionMap     = await checkPDFCompetition(top20);
  const hasRealCompetition = competitionMap.size > 0;

  // Phase 4b — Answer Gap Scoring: how poorly does the internet currently answer these?
  // High gap = empty shelf = easier first-mover win. Runs only when Custom Search is configured.
  const top15ForGap = enrichedKeywords.slice(0, 15).map((e) => e.keyword);
  const gapScoreMap = await scoreAnswerGaps(top15ForGap);

  // Phase 5 — Build fully annotated prompt list for Gemini
  // Every query arrives pre-computed: pain score + flags + deterministic trend + proxy volume + competition
  // AI's job is packaging and writing — not estimating numbers it cannot know.

  // Pre-compute trend map (deterministic, not AI-guessed) for all enriched keywords
  const precomputedTrendMap = new Map<string, string>();
  for (const e of enrichedKeywords) {
    const sc = sourceFrequency.get(e.keyword) ?? 0;
    precomputedTrendMap.set(e.keyword.toLowerCase(), inferTrend(e.keyword, sc));
  }

  const enrichedList = enrichedKeywords.slice(0, 80).map((e, i) => {
    const painAnnotation   = e.flags.length > 0 ? `[${e.flags.join("+")}]` : "";
    const priority         = e.painScore >= 35 ? " ← HIGH PRIORITY" : e.painScore >= 20 ? " ← WORTH CHECKING" : "";
    const sourcesCount     = sourceFrequency.get(e.keyword) ?? 0;
    // Volume: real DataForSEO data if available; cross-source proxy otherwise. AI must not override.
    const proxyVolume      = estimateVolumeFromSources(e.keyword, sourcesCount, e.painScore);
    const volAnnotation    = e.volume != null
      ? `${e.volume.toLocaleString()}/mo ✓REAL`
      : `~${proxyVolume.toLocaleString()}/mo est[${sourcesCount}src]`;
    const precomputedTrend = precomputedTrendMap.get(e.keyword.toLowerCase()) ?? "stable";
    const compData         = competitionMap.get(e.keyword.toLowerCase());
    const compAnnotation   = compData
      ? (compData.monopolyScore >= 85 ? `MONOPOLY (${compData.pdfCount} PDFs exist)` :
         compData.monopolyScore >= 65 ? `low competition` :
         compData.monopolyScore >= 40 ? `medium competition` : `saturated`)
      : "";
    const demandSignal     =
      sourcesCount >= 3 ? "CONFIRMED [Google+YouTube+Bing]" :
      sourcesCount >= 2 ? "validated [2 sources]" : "";
    const gapScore       = gapScoreMap.get(e.keyword.toLowerCase());
    const gapAnnotation  = gapScore != null ? `gap:${gapScore}` : "";
    const origin         = signalOrigins.get(e.keyword.toLowerCase()) ?? "autocomplete";
    const originTag      = origin !== "autocomplete" ? `origin:${origin}` : "";

    const parts = [`${i + 1}. "${e.keyword}" | pain:${e.painScore} ${painAnnotation}`];
    parts.push(volAnnotation);
    if (compAnnotation) parts.push(compAnnotation);
    if (demandSignal)   parts.push(demandSignal);
    parts.push(`trend:${precomputedTrend}`);
    if (gapAnnotation)  parts.push(gapAnnotation);
    if (originTag)      parts.push(originTag);
    parts.push(priority);
    return parts.join(" | ").replace(/\s\|\s$/, "");
  }).join("\n");

  const communityParts: string[] = [];
  if (redditSignals.length > 0) communityParts.push(`REDDIT:\n${redditSignals.slice(0, 15).map((s, i) => `${i + 1}. "${s}"`).join("\n")}`);
  if (communitySignals.length > 0) communityParts.push(`QUORA/COMMUNITY:\n${communitySignals.slice(0, 10).map((s, i) => `${i + 1}. "${s}"`).join("\n")}`);
  const redditSection = communityParts.length > 0
    ? `\n\nPAIN SIGNALS FROM COMMUNITY FORUMS (real problems in exact language people use):\n${communityParts.join("\n\n")}`
    : "";

  const isGlobal = country === "GLOBAL";

  const globalContext = isGlobal ? `
THIS IS GLOBAL MODE — universal human pain topics with no country anchor.
These PDFs sell in any English-speaking market because the pain is not tied to any geography.
The buyer is anyone, anywhere, who has this specific problem right now.

GLOBAL MODE RULES:
— Do NOT include country-specific bureaucracy or local regulations (no "ghana passport", no "universal credit UK")
— Focus exclusively on universal human challenges: mental health, relationships, financial hardship, career, health, personal struggles
— For each opportunity, include in distributionStrategy: "Top markets: US · UK · AU · CA" (adjust based on topic)
— Use Pinterest, TikTok, YouTube Shorts, and Quora as primary platforms — they index globally, not just nationally
— The PDF you're evaluating is a borderless product. Someone buys it at 2am in Lagos, London, or Los Angeles.
Price in USD ($12.99–$24.99) — the universal digital product standard.
` : "";

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
    : `\n\nNOTE — NO REAL VOLUME DATA:
Real search volume data is unavailable for this scan. You must estimate searchVolume yourself.
IMPORTANT: Do NOT underestimate for African and diaspora markets. AI models systematically undercount demand in these markets.
Ghana, Nigeria, Kenya passport/registration/business topics routinely hit 5,000–30,000/month.
Diaspora topics (from UK, from abroad) often hit 3,000–15,000/month.
Be realistic and generous — a topic surfaced by cross-source autocomplete validation almost certainly exceeds 3,000/month.
Minimum estimate for any included result: 2,500/month.`;

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are an opportunity compression engine. You compress raw search demand into three decisions per opportunity: Problem → Product → Placement.

PROBLEM: Identify who is confused, afraid, or stuck — and what exactly they need to do.
PRODUCT: Specify the PDF format that solves it (checklist, step-by-step guide, template, reference sheet).
PLACEMENT: Identify where the buyer ALREADY IS when they have this pain (TikTok, Pinterest, Facebook groups, Quora, Instagram Reels, WhatsApp communities).

This compression model is why a "ghana passport renewal from uk" PDF sells — the diaspora person has a specific bureaucratic problem (PROBLEM), the step-by-step checklist with embassy dates and document list is the product (PRODUCT), and Ghanaians in UK Facebook groups is exactly where they're asking about it (PLACEMENT).

THE CORE PRINCIPLE:
You are NOT building an SEO keyword tool.
You are detecting profitable uncertainty.

The buyer pays because they are unsure, overwhelmed, confused, or afraid of making a mistake.
That changes everything about how you evaluate a search.

SEARCH VOLUME IS NOT THE PRIMARY SIGNAL.
A 2,000/month search with FEAR + MONEY + PROCESS beats a 50,000/month "what is cryptocurrency" every time.
Why? Because the first person is in pain and needs a solution today. The second is browsing.

THE COMMERCIAL PAIN HIERARCHY (in order of conversion power):
1. FEAR — "how to recover lost momo transaction" → they're panicking. Instant buyer.
2. MONEY — anything involving payments, fees, transfers, income → financial stakes = willingness to pay
3. DIASPORA — someone in the UK trying to solve a Ghana/Nigeria/Kenya problem → Western salary, African bureaucracy, zero local help → premium pricing, instant sale
4. DEADLINE — something expires, a form is overdue, a certificate needs renewal → urgency = conversion
5. PROCESS COMPLEXITY — government forms, registrations, applications → people pay to untangle bureaucracy
6. LEGAL / COMPLIANCE — tax, licenses, court, certificates → high stakes, low tolerance for mistakes
7. CONFUSION — they don't know where to start → they'll pay for a clear first step

WHAT MAKES A GOOD PDF TOPIC:
✅ Processes, paperwork, applications, registrations, renewals
✅ Bureaucracy simplification (government, legal, financial)
✅ Exam prep (WAEC, JAMB, KCSE — students pay for pattern clarity)
✅ Diaspora logistics (passport renewal abroad, dual citizenship, sending money home)
✅ Step-by-step systems (farming, business setup, side hustles)
✅ "From abroad" problems (certificate verification, property from UK, embassy processes)

❌ Reject these — they will NOT sell as PDFs:
❌ "What is…" / "Who is…" / "History of…" — pure information, no pain
❌ Entertainment, news, celebrity, sports, music
❌ Broad motivation / general inspiration
❌ Anything with a free, complete, obvious Google answer in 10 seconds

THE PACKAGING GAP (your hidden edge):
There may be 200 blog posts, confusing government websites, and YouTube videos.
But if there's NO clean, downloadable, step-by-step PDF guide — that IS a gap.
You're selling convenience and certainty, not information.

DATA PROVIDED (use it, do not override it):
— "pain:" score = pre-calculated commercial pain score. Higher = more urgent, more likely to convert.
— Flags = emotional signals detected: FEAR, MONEY, DIASPORA, DEADLINE, PROCESS, LEGAL, CONFUSION
— "← HIGH PRIORITY" = pre-scored as high commercial intensity. These are your best seeds.
— Volume marked "✓REAL" = exact Google monthly data from DataForSEO. Use it exactly. Do NOT change it.
— Volume marked "est[Nsrc]" = derived from cross-source validation frequency (N sources confirmed it). Use this figure. Do NOT override with your own estimate — this is a real signal, not a guess.
— "trend:" = pre-computed from rule patterns and cross-source signals. Use this value exactly. Do NOT re-estimate or change it.
— "MONOPOLY" = live Google search found zero competing PDFs on Gumroad/Payhip right now.
— "CONFIRMED [Google+YouTube+Bing]" = independently surfaced by all three search engines. Strongest possible demand signal — treat as volume-confirmed.
— "validated [2 sources]" = confirmed by two independent engines. Strong signal, not noise.
— "gap:" score (0-100) = how poorly the internet currently answers this question. 80+ = only gov sites, Wikipedia, or outdated 2020 content exists → empty shelf → easiest first-mover win. Use this to inform gapScore output.
— "origin:" tag = where the signal was first detected (paa = People Also Ask equivalent, duckduckgo = adjacent topic cluster, community = Quora/Reddit forum question, autocomplete = standard search suggestion). Community and paa signals = highest intent — someone already committed to the topic. Use this for platformOfOrigin output.

SCORING AXES:
AXIS 1 — PDF MONOPOLY (35 pts max)
  MONOPOLY label: +35 pts
  Low competition: +20 pts
  Some PDFs exist but yours can be clearly better: +8 pts
  Saturated: +0 pts

AXIS 2 — COMMERCIAL PAIN INTENSITY (30 pts max)
  pain: score ≥ 35 (FEAR/MONEY/DIASPORA combination): +30 pts
  pain: score 20–34: +20 pts
  pain: score 10–19: +10 pts
  pain: score < 10: +0 pts (probably skip)

AXIS 3 — DEMAND REALITY (20 pts max)
  Market: ${country} (${market.tier}). Floor: ${ABSOLUTE_MIN_VOLUME.toLocaleString()}/month.
  ${market.strongVolume.toLocaleString()}+/month → +20 pts
  ${ABSOLUTE_MIN_VOLUME.toLocaleString()}–${(market.strongVolume - 1).toLocaleString()}/month → +10 pts

AXIS 4 — FIRST-MOVER WINDOW (15 pts max)
  No quality guide exists yet: +15 pts
  Thin or poor-quality guides only: +8 pts

SCORING:
90–100: Plant immediately. Commercial pain + monopoly + real demand.
80–89:  Strong seed. Build after the 90+ ones.
70–79:  Good opportunity — include it.
Below 70: Do not include. A weak seed wastes build time on a guide that won't sell.

FINAL GATE — ask this before including any result:
"Would someone who just discovered they have a problem RIGHT NOW pay ${pricing.symbol}${pricing.min} for a clear PDF answer to this?"
If the honest answer is "maybe" or "probably not" — exclude it. Integrity of results is everything.

HOOK POTENTIAL — every PDF opportunity must be evaluated for TikTok/Reels/Pinterest virality.
This is the discovery engine: a 5-second faceless video drives strangers to the profile, 1–2% buy the PDF.
Hook potential scoring:
  HIGH — topic spreads automatically (strong emotional trigger, PSA format, relatable fear):
    • FEAR + CONSEQUENCE: "If you do X without knowing this, you lose everything"
    • DIASPORA + PROCESS: "For [Ghanaians/Nigerians] in the UK — the step nobody tells you about"
    • MONEY + MISTAKE: "This mistake costs people [price] — most don't even realise"
    • DEADLINE + PANIC: "Your [document] expires soon — here's what to do RIGHT NOW"
  MEDIUM — topic motivates but requires setup to hook:
    • PROCESS + CONFUSION without strong fear component
    • CAREER + SIDE HUSTLE topics
    • Exam prep with seasonal urgency (WAEC, JAMB, KCSE period)
  LOW — informational, general how-to, requires long explanation to hook:
    • General guides without emotional urgency
    • Topics where the payoff isn't instantly clear in 5 seconds

HOOK ANGLE — write the EXACT opening line of a 5-second faceless TikTok/Reels video.
This is the scroll-stopper. One sentence. Direct PSA, fear trigger, surprising fact, or relatable frustration.
✅ "PSA for Ghanaians in the UK — if you book the wrong embassy slot, you lose your fee AND your appointment 🚨"
✅ "If your MoMo transfer disappeared, DON'T call customer service. Do this first:"
✅ "This one mistake on your JAMB registration gets you disqualified — most students don't know this"
❌ "Today I'm going to teach you how to renew your passport" (too soft, no pattern interrupt)

PDF SUITABILITY EXPLANATION — in 1–2 sentences, explain specifically WHY this topic is better as a downloadable PDF than a blog post or YouTube video.
Focus on: portability, offline access, the user keeps it and refers back, checklists they tick off, step clarity that video can't replicate.

DISTRIBUTION STRATEGY — the PLACEMENT in Problem → Product → Placement.
Specify EXACTLY where to put the content to reach the buyer when they have this problem.
Platform must match where this type of person actually spends time AND discusses this topic.
Format: 2-3 sentences. Primary platform + content format. Secondary channel.

Platform matching rules:
• DIASPORA topics → Facebook groups first (Ghanaians in UK, Nigerians in London). Then Instagram Reels, TikTok PSA.
• EXAM topics (WAEC, JAMB, KCSE) → TikTok/WhatsApp status (students scroll here). Pinterest study boards.
• GOVERNMENT/PROCESS topics → Pinterest (how-to guides index well). Quora answers (seed with partial answer + link).
• MONEY/BUSINESS → TikTok Reels (fear hook format). Facebook Groups (entrepreneur communities).
• HEALTH/URGENCY → TikTok PSA format (high completion rate). Instagram Reels.
• IMMIGRATION → Facebook groups, Quora, YouTube Shorts.

Always include: primary platform + content format + specific community type (e.g. "Ghanaians in UK Facebook groups", "WAEC students WhatsApp", not just "Facebook" or "social media").

ACTIONABILITY RATING:
  easy: clear steps, limited variables, one correct path (e.g., passport renewal checklist — same for everyone)
  medium: process varies by situation, 2–3 possible paths, user needs to make some judgment calls
  hard: highly variable, depends heavily on individual circumstances, difficult to make universally useful

VIDEO SCRIPT — write a complete 5-7 second faceless video script engineered for maximum watch completion.
This IS the distribution machine. High completion rate → algorithm pushes it → strangers see the PDF link → 1–2% buy.
Three lines. Each line spoken in ~2 seconds. No intro. No "hey guys". Start with the pain — immediately.

Structure:
  hook (0-2s): The scroll-stopper. Name the exact situation — not a category. PSA, fear trigger, or "did you know" format.
    Someone who has this exact problem must STOP scrolling the moment they hear this.
  tease (2-4s): The stakes or payoff. What they risk getting wrong. Or what they'll gain. One specific sentence.
    Do NOT explain the guide here. Raise the stakes. Create the desire to know more.
  cta (4-7s): Direct them to the bio. Short. "I put the complete step-by-step guide in my bio" is enough.
    Do NOT sell the guide. Just point to it.

✅ EXAMPLES:
  TOPIC: ghana passport renewal from uk
  hook: "PSA for Ghanaians in the UK — if you book the wrong embassy appointment you lose your slot AND your fee 🚨"
  tease: "The process changed in 2024 and most guides online are outdated — here's what's actually required now"
  cta: "Complete step-by-step guide in bio — I put every document and step in one PDF"

  TOPIC: how to recover momo transaction ghana
  hook: "If your MoMo transfer disappeared, do NOT call customer service first — do this instead:"
  tease: "Customer service can't reverse most failed transfers — but this specific step can recover it within 24 hours"
  cta: "Full recovery guide in bio — covers every type of failed MoMo transaction"

  TOPIC: jamb registration 2026
  hook: "This one mistake on your JAMB registration gets you disqualified — and most students don't even know it"
  tease: "JAMB has changed the document requirements — using last year's list is why applications get rejected"
  cta: "Download the updated checklist in bio — every requirement for 2026 in one place"

Output as a JSON object with three string keys: hook, tease, cta.

PAIN POINT WRITING — this is your most important output:
Format: "[Specific group of people] [what they're trying to do] [what keeps going wrong] [the real cost of not solving it]"
40–80 words. Raw, honest, first-person. This becomes the emotional hook — the intro of the PDF, the TikTok script, the buy page opener.

✅ EXAMPLE:
SEARCH: "how to recover deleted momo transaction ghana" | pain:52 [FEAR+MONEY+PROCESS] ← HIGH PRIORITY
PAIN POINT: "Ghanaians who've lost money through a failed or deleted MoMo transaction are going in circles — calling customer service, visiting branches, getting different answers every time, while their money sits frozen or missing and nobody gives them a clear recovery path."
TITLE: "MoMo Transaction Recovery Guide: How to Get Your Money Back in Ghana (Step-by-Step)"

✅ EXAMPLE:
SEARCH: "ghana passport renewal uk" | pain:47 [DIASPORA+IMMIGRATION+PROCESS] ← HIGH PRIORITY
PAIN POINT: "Ghanaians living in the UK who need to renew their passport are navigating a confusing process with no clear guide — wrong appointment slots, missing documents, embassy delays, and no one to call who actually knows the correct current procedure."
TITLE: "Ghana Passport Renewal from the UK: Complete Step-by-Step Guide 2026"

TITLE RULES:
— Keyword phrase must appear naturally in the title
— Add year (2026) for registration, legal, exam, visa, government topics
— Use dual acronyms: "WAEC / WASSCE", "JAMB / UTME", "KCSE / KNEC"
— Subtitle states a PROMISE or OUTCOME

EXACT QUESTIONS — 4 short human search fragments (these become chapter headings):
✅ "Documents needed", "How long it takes", "How much it costs", "Common mistakes"
❌ "How do I find out what documents are required for this process?"`,
        },
        {
          role: "user",
          content: `Detect the ${count} most commercially painful PDF opportunities from this pre-scored search data.
${globalContext}${diasporaContext}${realDataNote}

PAIN-SCORED SEARCH DATA — sorted by commercial intensity (highest pain first):
${enrichedList}${redditSection}

INSTRUCTIONS:
— Prioritise "← HIGH PRIORITY" queries. These have the strongest emotional-commercial signals.
— Queries with FEAR+MONEY, DIASPORA+PROCESS, or DEADLINE flags convert best to PDF sales.
— Reject any query that wouldn't make a clean, structured, downloadable guide.
— For each opportunity, write a pain point that makes a reader say: "that's exactly my situation."

─────────────────────────────────────────
OUTPUT FORMAT
─────────────────────────────────────────

{
  "painPoint": "40–80 words. Specific group + what they're trying to do + what keeps going wrong + the real cost. Raw and honest.",
  "keyword": "exact verbatim phrase from the data above — copy precisely",
  "pdfTitle": "Keyword embedded naturally. Reads like a real product. Subtitle states a promise.",
  "niche": "health | finance | education | business | farming | technology | relationships | home | career | mindset | other",
  "searchVolume": <integer — use ✓REAL figure if provided; use est[Nsrc] figure if provided; only estimate freely if neither is marked. Minimum 2000>,
  "opportunityScore": <integer 70–100 from the four-axis scoring>,
  "competition": "low | medium | high",
  "trend": "copy the pre-computed trend: value from the data exactly — do not change it",
  "easeToSell": "easy | medium | hard",
  "minPrice": ${pricing.min},
  "maxPrice": ${pricing.max},
  "emotionalIntent": "fear | urgency | desire | pain | confusion",
  "exactQuestions": ["Short fragment", "Short fragment", "Short fragment", "Short fragment"],
  "hookPotential": "high | medium | low",
  "hookAngle": "The exact opening line of a 5-second TikTok/Reels — one sentence, scroll-stopping",
  "pdfSuitability": "1–2 sentences: why this is better as a PDF than a blog post or video",
  "actionabilityRating": "easy | medium | hard",
  "gapScore": <integer 0-100 — copy from gap: annotation if provided; otherwise: 0 if strong guides exist, 50 if gov/Wikipedia only, 80 if outdated or video-only coverage>,
  "platformOfOrigin": "autocomplete | paa | duckduckgo | community — copy from origin: annotation if provided, otherwise autocomplete",
  "distributionStrategy": "Primary: [platform + content format + specific community]. Secondary: [backup channel]. 2-3 sentences max.",
  "videoScript": {
    "hook": "The scroll-stopper — 0-2s. Exact situation named. Immediate pain or PSA. No intro.",
    "tease": "Stakes or payoff — 2-4s. What they risk or gain. One specific sentence.",
    "cta": "The CTA — 4-7s. Point to bio. Do not sell. Just direct."
  }
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

  // Phase 6 — Override AI estimates with pre-computed / real data before saving
  opportunities = opportunities.map((o) => {
    const rawKw = String(o.keyword ?? "");
    const kw    = rawKw.toLowerCase();

    // Override volume: DataForSEO real data > cross-source proxy > AI guess
    const realVolume = volumeMap.get(kw)?.searchVolume;
    if (realVolume != null) {
      o = { ...o, searchVolume: realVolume };
    } else if (!hasRealVolumes) {
      const sc        = sourceFrequency.get(rawKw) ?? sourceFrequency.get(kw) ?? 0;
      const proxyVol  = estimateVolumeFromSources(kw, sc, Number((o as Record<string, unknown>).painScore ?? 0));
      if (proxyVol > Number(o.searchVolume ?? 0)) {
        o = { ...o, searchVolume: proxyVol };
      }
    }

    // Override competition with Google Custom Search data
    const compData = competitionMap.get(kw);
    if (compData) {
      const competition =
        compData.monopolyScore >= 85 ? "low" :
        compData.monopolyScore >= 50 ? "medium" : "high";
      o = { ...o, competition };
    }

    // Override trend with pre-computed deterministic value — AI must not fabricate this
    const precomputedTrend = precomputedTrendMap.get(kw);
    if (precomputedTrend) o = { ...o, trend: precomputedTrend };

    // Override gap score with computed value (Custom Search analysis > AI estimate)
    const computedGap = gapScoreMap.get(kw);
    if (computedGap != null) o = { ...o, gapScore: computedGap };

    // Override platform origin with tracked value (signal tracing > AI guess)
    const trackedOrigin = signalOrigins.get(kw);
    if (trackedOrigin) o = { ...o, platformOfOrigin: trackedOrigin };

    return o;
  });

  // Context-sensitive volume floor — smarter than a flat number.
  // Diaspora: small market but high-intent + Western price point → low floor.
  // Emerging African markets: AI undercounts → generous floor.
  // Saturated (US/GB): strong noise filter needed → higher floor.
  const volumeFloor = (() => {
    if (hasRealVolumes) return ABSOLUTE_MIN_VOLUME; // trust real DataForSEO data
    if (diaspora) return 800;                        // diaspora = niche but premium
    const tier = MARKET_CONTEXT[country]?.tier;
    if (tier === "global" || tier === "saturated") return 3000; // global + US/GB/CA/AU
    return 1500;                                     // emerging markets (GH/NG/KE/ZA)
  })();

  const allAiResults = [...opportunities];
  opportunities = opportunities.filter((o) =>
    Number(o.searchVolume) >= volumeFloor &&
    Number(o.opportunityScore) >= 70
  );

  if (opportunities.length === 0) {
    // Helpful error: tell the user what almost made it, so they know what to dig into
    const topMissed = allAiResults
      .sort((a, b) => Number(b.opportunityScore ?? 0) - Number(a.opportunityScore ?? 0))
      .slice(0, 3)
      .map((o) => `"${String(o.keyword)}"`)
      .join(", ");
    const suggestion = topMissed
      ? ` Closest signals found: ${topMissed} — try one of these as a keyword to get a deeper, focused scan.`
      : ` Try a specific keyword like "passport renewal", "business registration", or "mobile money" to anchor the search.`;
    return NextResponse.json({
      error: `Scan complete — strong pain signals found but none hit the commercial threshold for this market.${suggestion}`,
    }, { status: 422 });
  }

  // Smart semantic dedup — balances freshness against variety.
  // Block: (1) anything seen in the last 7 days (prevents immediate repeats),
  //        (2) anything already turned into a product (no point re-doing done work).
  // Allow: opportunities older than 7 days that haven't been acted on — good ideas deserve a second look.
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [recentRecs, convertedRecs] = await Promise.all([
    prisma.opportunity.findMany({
      where: { country, createdAt: { gte: sevenDaysAgo } },
      select: { keyword: true },
    }),
    prisma.opportunity.findMany({
      where: { country, products: { some: {} } },
      select: { keyword: true },
    }),
  ]);
  const existingFingerprints = new Set([
    ...recentRecs.map((r) => getQueryFingerprint(r.keyword)),
    ...convertedRecs.map((r) => getQueryFingerprint(r.keyword)),
  ]);

  const saved = [];
  for (const o of opportunities) {
    try {
      const kw = String(o.keyword);
      const fp = getQueryFingerprint(kw);

      if (existingFingerprints.has(fp)) {
        // Topic cluster already planted — skip silently (no duplicate saved)
        continue;
      }
      existingFingerprints.add(fp); // block within-run duplication too

      const score       = Math.min(100, Math.max(0, Number(o.opportunityScore) || 70));
      const competition = String(o.competition || "medium");
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
          emotionalIntent:     String(o.emotionalIntent || "desire"),
          exactQuestions:      JSON.stringify(Array.isArray(o.exactQuestions) ? o.exactQuestions : []),
          hookPotential:       String(o.hookPotential || "medium"),
          hookAngle:           String(o.hookAngle || ""),
          pdfSuitability:      String(o.pdfSuitability || ""),
          actionabilityRating: String(o.actionabilityRating || "medium"),
          videoScript:         typeof o.videoScript === "object" && o.videoScript !== null
                                 ? JSON.stringify(o.videoScript)
                                 : String(o.videoScript || "{}"),
          volumeTier:          computeVolumeTier(Number(o.searchVolume) || 0),
          gapScore:            Math.min(100, Math.max(0, Number(o.gapScore) || 0)),
          platformOfOrigin:    String(o.platformOfOrigin || "autocomplete"),
          distributionStrategy: String(o.distributionStrategy || ""),
          isQuickWin,
          isDiaspora: Boolean(diaspora),
        },
      });
      saved.push(created);
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
