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

  // Phase 1 — Discovery: Google + YouTube + Bing autocomplete + Reddit in parallel.
  // Three independent algorithms — if all three surface the same query, it's confirmed
  // real demand (not autocomplete noise). Each has different ranking signals:
  // Google = web intent, YouTube = how-to/tutorial intent, Bing = independent validation.
  const [googleArrays, youtubeArrays, bingArrays, redditSignals] = await Promise.all([
    Promise.all(queries.map(fetchAutocompleteSuggestions)),
    Promise.all(queries.map(fetchYouTubeSuggestions)),
    Promise.all(queries.map(fetchBingSuggestions)),
    Promise.race<string[]>([
      fetchRedditSignals(country, keyword || "", niche || "", diaspora).catch(() => []),
      new Promise<string[]>((resolve) => setTimeout(() => resolve([]), 3000)),
    ]),
  ]);

  // Cross-source demand validation: count distinct sources (max 3) per query.
  // Dedup within each source first — then count source appearances.
  const googleSet  = new Set(googleArrays.flat().filter((q) => q.length > 8));
  const youtubeSet = new Set(youtubeArrays.flat().filter((q) => q.length > 8));
  const bingSet    = new Set(bingArrays.flat().filter((q) => q.length > 8));

  const sourceFrequency = new Map<string, number>();
  for (const q of [...googleSet, ...youtubeSet, ...bingSet]) {
    sourceFrequency.set(q, (sourceFrequency.get(q) ?? 0) + 1);
  }

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

  const confirmedCount  = [...sourceFrequency.values()].filter((n) => n >= 3).length;
  const validatedCount  = [...sourceFrequency.values()].filter((n) => n === 2).length;
  console.log(`[engine] ${country}${diaspora ? " DIASPORA" : ""} (${market.tier}): ${rawSearches.length} raw (${confirmedCount} 3-source confirmed, ${validatedCount} 2-source validated) → ${allScored.length} pain-scored (depth added ${depthScored.length}). Top score: ${allScored[0]?.score ?? 0} [${allScored[0]?.flags.join("+")}]`);

  // Phase 2 — Real volumes via DataForSEO on pain-scored queries
  const topForVolume = allScored.slice(0, 80).map((s) => s.query);
  const volumeMap    = await fetchRealVolumes(topForVolume, country);
  const hasRealVolumes = volumeMap.size > 0;

  // Phase 3 — Volume filter: cut confirmed low-volume queries, keep unknowns
  let enrichedKeywords: Array<{ keyword: string; painScore: number; flags: string[]; volume?: number; inDataForSEO: boolean }>;
  if (hasRealVolumes) {
    enrichedKeywords = allScored
      .map((s) => {
        const data = volumeMap.get(s.query.toLowerCase());
        return { keyword: s.query, painScore: s.score, flags: s.flags, volume: data?.searchVolume, inDataForSEO: !!data };
      })
      .filter(({ volume, inDataForSEO }) => !inDataForSEO || (volume ?? 0) >= ABSOLUTE_MIN_VOLUME)
      // Re-sort: pain score + volume together (pain is primary signal)
      .sort((a, b) => (b.painScore * 1000 + (b.volume ?? 0)) - (a.painScore * 1000 + (a.volume ?? 0)));

    console.log(`[engine] After volume filter: ${enrichedKeywords.length}/${topForVolume.length} keywords survive`);
  } else {
    enrichedKeywords = allScored.map((s) => ({ keyword: s.query, painScore: s.score, flags: s.flags, inDataForSEO: false }));
  }

  if (enrichedKeywords.length < minResultsGate) {
    return NextResponse.json({
      error: `No strong pain signals found above volume floor for this market. Try a more specific keyword or switch to Diaspora mode.`,
    }, { status: 422 });
  }

  // Phase 4 — Competition check for top pain-scored keywords
  const top20 = enrichedKeywords.slice(0, 20).map((e) => e.keyword);
  const competitionMap   = await checkPDFCompetition(top20);
  const hasRealCompetition = competitionMap.size > 0;

  // Phase 5 — Build fully annotated prompt list for Gemini
  // Every query arrives with: pain score + emotional flags + real volume + competition reality
  const enrichedList = enrichedKeywords.slice(0, 60).map((e, i) => {
    const painAnnotation = e.flags.length > 0 ? `[${e.flags.join("+")}]` : "";
    const priority       = e.painScore >= 35 ? " ← HIGH PRIORITY" : e.painScore >= 20 ? " ← WORTH CHECKING" : "";
    const volAnnotation  = e.volume != null ? `${e.volume.toLocaleString()}/mo ✓` : "";
    const compData       = competitionMap.get(e.keyword.toLowerCase());
    const compAnnotation = compData
      ? (compData.monopolyScore >= 85 ? `MONOPOLY (${compData.pdfCount} PDFs exist)` :
         compData.monopolyScore >= 65 ? `low competition` :
         compData.monopolyScore >= 40 ? `medium competition` : `saturated`)
      : "";
    // Cross-source demand confidence — how many independent search engines returned this query
    const sourcesCount    = sourceFrequency.get(e.keyword) ?? 0;
    const demandSignal    =
      sourcesCount >= 3 ? "CONFIRMED [Google+YouTube+Bing]" :
      sourcesCount >= 2 ? "validated [2 sources]" : "";
    const parts = [`${i + 1}. "${e.keyword}" | pain:${e.painScore} ${painAnnotation}`];
    if (volAnnotation)  parts.push(volAnnotation);
    if (compAnnotation) parts.push(compAnnotation);
    if (demandSignal)   parts.push(demandSignal);
    parts.push(priority);
    return parts.join(" | ").replace(/\s\|\s$/, "");
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
          content: `You are a commercial pain detection engine. Your only job is to identify searches where someone is confused, stressed, or afraid — and where a clean, downloadable PDF guide is the obvious solution.

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
— Volume marked "✓" = real Google monthly data. Use it exactly.
— "MONOPOLY" = live Google search found zero competing PDFs on Gumroad/Payhip right now.
— "CONFIRMED [Google+YouTube+Bing]" = this query was independently surfaced by all three search engines. This is the strongest demand signal possible — three separate algorithms agree real people are searching for this. Treat like a volume-confirmed keyword.
— "validated [2 sources]" = confirmed by two independent engines. Strong signal, not noise.
— No source annotation = single-source, treat with slightly more caution on volume estimates.

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
75–79:  Acceptable if diaspora or monopoly opportunity.
Below 75: Do not include. Return nothing rather than a weak seed.

FINAL GATE — ask this before including any result:
"Would someone who just discovered they have a problem RIGHT NOW pay ${pricing.symbol}${pricing.min} for a clear PDF answer to this?"
If the honest answer is "maybe" or "probably not" — exclude it.

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
${diasporaContext}${realDataNote}

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
  "searchVolume": <integer — use ✓ figure if provided, otherwise estimate conservatively. Minimum ${ABSOLUTE_MIN_VOLUME}>,
  "opportunityScore": <integer 70–100 from the four-axis scoring>,
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
  opportunities = opportunities.filter((o) =>
    Number(o.searchVolume) >= ABSOLUTE_MIN_VOLUME &&
    Number(o.opportunityScore) >= 75
  );

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
