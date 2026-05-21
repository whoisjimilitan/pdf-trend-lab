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

// Diaspora search anchors — exactly how diaspora members phrase their searches.
// These people have Western purchasing power and face knowledge gaps their local
// contacts can't help with. Competition for these guides is near zero.
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

/**
 * Fetch Reddit posts to harvest real emotional pain language.
 * People describe their problems on Reddit in raw, unfiltered terms —
 * different from how they phrase a Google search.
 */
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

/**
 * Two-layer query strategy:
 * Layer 1 — Universal starters (always return results)
 * Layer 2 — Country-specific anchors (real local search phrases)
 */
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

  // DIASPORA MODE — queries specifically for diaspora members searching from abroad
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

  // KEYWORD MODE — explore a specific topic from all angles
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

  // NICHE MODE — focus discovery on a specific domain
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

  // AUTO DISCOVERY MODE — universal starters + country anchors
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
// A Ghanaian in the UK pays £14.99 without thinking twice for a guide
// that solves a problem their UK contacts cannot help with.
export const DIASPORA_PRICING: Record<string, { symbol: string; min: number; max: number; note: string }> = {
  GH: { symbol: "£", min: 9.99,  max: 19.99, note: "British Pounds — Ghanaian diaspora" },
  NG: { symbol: "£", min: 9.99,  max: 19.99, note: "British Pounds — Nigerian diaspora" },
  KE: { symbol: "£", min: 9.99,  max: 14.99, note: "British Pounds — Kenyan diaspora" },
  ZA: { symbol: "£", min: 9.99,  max: 14.99, note: "British Pounds — South African diaspora" },
};

// Absolute floor — below this, even a monopoly doesn't generate meaningful income.
// Everything above 5k is evaluated by Opportunity Density, not raw volume alone.
const ABSOLUTE_MIN_VOLUME = 5000;

// Market size context — used to calibrate what "strong demand" means per country.
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

// Diaspora markets are niche but high-intent. Lower absolute volumes are expected
// because the audience is a subset of the origin country's diaspora population.
const DIASPORA_MARKET_CONTEXT: Record<string, { tier: string; strongVolume: number; massiveVolume: number }> = {
  GH: { tier: "diaspora-niche", strongVolume: 3000, massiveVolume: 10000 },
  NG: { tier: "diaspora-niche", strongVolume: 5000, massiveVolume: 15000 },
  KE: { tier: "diaspora-niche", strongVolume: 2000, massiveVolume: 8000  },
  ZA: { tier: "diaspora-niche", strongVolume: 2000, massiveVolume: 8000  },
};

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

  const suggestionArrays = await Promise.all(queries.map(fetchAutocompleteSuggestions));

  const redditSignals = await Promise.race<string[]>([
    fetchRedditSignals(country, keyword || "", niche || "", diaspora).catch(() => []),
    new Promise<string[]>((resolve) => setTimeout(() => resolve([]), 3000)),
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

  console.log(`[engine] ${country}${diaspora ? " DIASPORA" : ""} (${market.tier}): ${queries.length} queries → ${rawSearches.length} searches, ${redditSignals.length} Reddit signals`);

  // For diaspora, even 5 good results is fine — anchors are very specific
  const minResultsGate = diaspora ? 3 : 10;

  if (rawSearches.length < minResultsGate) {
    return NextResponse.json({
      error: `Could not fetch enough live search data (got ${rawSearches.length} results). Check your internet connection and try again.`,
    }, { status: 503 });
  }
  const realSearchList = rawSearches.slice(0, 80).map((s, i) => `${i + 1}. ${s}`).join("\n");
  const redditSection = redditSignals.length > 0
    ? `\n\nPAIN SIGNALS FROM REDDIT (how diaspora members actually describe these problems):\n${redditSignals.map((s, i) => `${i + 1}. "${s}"`).join("\n")}`
    : "";
  const diasporaContext = diaspora ? `
THIS IS DIASPORA MODE — ${country} diaspora living in the UK (and US, Canada, Australia).
These buyers have Western purchasing power (paying in £ or $) but need ${COUNTRY_LABEL[country] ?? country}-specific solutions.
Their knowledge gap is 10x worse than locals — they have no local contacts to call.
They pay premium prices for clarity and certainty.
Buyer profile: educated, employed, earning Western salaries, extremely frustrated that nobody has built a clear guide for their situation.
Price in GBP (${pricing.symbol}${pricing.min}–${pricing.symbol}${pricing.max}).` : "";

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are a digital product strategist who builds a PDF guide business on one principle: solve a specific, painful, widespread problem that tens of thousands of people are actively searching for — and package the solution as the definitive, easy-to-buy guide.

YOUR TWO-LAYER INTELLIGENCE SYSTEM:

LAYER 1 — SEARCH SIGNAL (Google Autocomplete):
What people TYPE when they need answers. This is your SEO backbone.
The exact search phrase → embedded in the PDF title → page ranks on Google → free organic traffic forever.
The keyword IS the title IS the SEO anchor. Never lose this connection.

LAYER 2 — PAIN SIGNAL (Reddit / social language):
What people SAY when they describe their suffering. This is your conversion engine.
Reddit threads, Quora posts, forum complaints use raw, emotional, first-person language:
"I've been trying for 3 months and I still can't register my business"
"Every time I try to withdraw my mobile money it fails and nobody can tell me why"
This language tells you WHAT the PDF must fix and HOW to frame it so buyers feel seen.

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
   PAIN POINT: "Students across West Africa prepare for months only to fail WAEC because nobody teaches them the exam's actual patterns and question types."

✅ SEARCH: "mobile money scams ghana"
   PAIN: "I lost money to a scam last year and still don't know how it happened"
   TITLE: "Mobile Money Safety Guide: Avoid Scams, Fraud & Loss in Ghana"
   PAIN POINT: "Every week in Ghana, people lose their savings to mobile money fraud — not because they're careless, but because nobody has ever explained the exact tactics scammers use."

THE PAIN POINT — what it is and how to write it:
A single sentence (40–80 words) describing the specific suffering that creates demand for this PDF.
NOT "many people struggle with this topic." Too vague.
YES: Name the specific group, the specific frustration, the specific consequence.
Format: "[Group of people] [what they're trying to do] [what keeps going wrong] [the real cost of not solving it]"
The pain point becomes the emotional hook — the intro of the PDF, the opening of the sales page, the TikTok script.

TITLE RULES:
— Keyword phrase must appear naturally in the title (SEO signal preserved)
— Add year (2026) for registration, legal, exam, visa, government topics
— Use full dual acronyms: "WAEC / WASSCE", "JAMB / UTME", "KCSE / KNEC"
— Subtitle must state a PROMISE or OUTCOME (not just "A Complete Guide")
— Title reads like a real product, not a keyword list

EXACT QUESTIONS — 4 SHORT HUMAN FRAGMENTS:
Real search fragments people type alongside the main query. These become chapter headings.
✅ "How much?", "Documents needed", "How long it takes", "Tax registration"
❌ "How do I find out what documents are required for this process?"

THE OPPORTUNITY DENSITY MODEL — HOW TO ACTUALLY REASON ABOUT WHAT'S WORTH MAKING:

Raw search volume is NOT the primary signal. Opportunity Density is:

  Opportunity Density = Search Demand ÷ Supply of Existing Solutions

A topic with 9,000 monthly searches and ZERO competing PDF guides has infinite opportunity density.
A topic with 60,000 monthly searches and 400 competing PDF guides has low opportunity density.
The first is a better business than the second, every time.

This means you must evaluate each topic on four axes — not volume alone:

AXIS 1 — PDF MONOPOLY POTENTIAL (most important signal):
Does a comprehensive, easy-to-buy PDF guide already exist for this exact market + topic?
For location-specific topics in emerging markets (national exams, business registration, mobile payments, local farming, government processes, scholarships, local health systems) — the answer is almost always NO.
  → No competing PDF exists: this is a monopoly opportunity. Build it and own the topic.
  → 1–3 basic PDFs exist: still a strong gap if yours is clearly better.
  → 10+ quality PDFs: oversupplied, move on.

AXIS 2 — DEMAND REALISM (volume calibrated to this market, not US standards):
${country} is a ${market.tier} market. Strong demand here means ${market.strongVolume.toLocaleString()}+/month. Massive demand means ${market.massiveVolume.toLocaleString()}+/month.
The absolute minimum is ${ABSOLUTE_MIN_VOLUME.toLocaleString()}/month — below this, even owning the topic won't generate meaningful income.

AXIS 3 — PROBLEM URGENCY (will people pay immediately?):
Urgent, consequential problems (failing an exam, being blocked from starting a business, losing money to fraud, needing a government document) convert at 3–5%.
General improvement topics (getting fitter, learning a skill) convert at 0.5–1%.
Higher urgency = smaller volume can still generate strong revenue.

AXIS 4 — FIRST-MOVER WINDOW:
In ${market.tier} digital markets, being the FIRST quality PDF on a topic means you rank, you own the search result, and you keep the traffic for years. This is the farming strategy — plant it once, harvest forever.

REVENUE REALITY CHECK (use this to validate each opportunity):
Monthly Revenue = Search Volume × (Top-3 Ranking Click Rate ≈ 30%) × Conversion Rate × Price
Example: 9,000/mo × 30% CTR × 4% conversion × ${pricing.symbol}${pricing.min} = ${pricing.symbol}${Math.round(9000 * 0.30 * 0.04 * pricing.min)}/month from ONE PDF.
That is a plantable, passive income seed.`,
        },
        {
          role: "user",
          content: `You have two live data sources for ${diaspora ? `${COUNTRY_LABEL[country] ?? country} diaspora (primarily UK-based)` : country}. Your job is to find the ${count} most plantable PDF opportunities — products that can be built once and generate passive income for years.
${diasporaContext}
LIVE SEARCHES — what ${diaspora ? `${COUNTRY_LABEL[country] ?? country} diaspora members` : `people in ${country}`} are actively searching right now:
${realSearchList}${redditSection}

─────────────────────────────────────────
HOW TO EVALUATE EACH OPPORTUNITY
─────────────────────────────────────────

For each search phrase, reason through all four axes before scoring:

AXIS 1 — PDF MONOPOLY (weight: 35 pts max)
Ask: "If I search Google right now for this exact topic + ${country}, does a well-made, easy-to-buy PDF guide come up?"
For most local topics in ${country} — government processes, national exams, local financial tools, farming, scholarships — the answer is NO. That is the entire business case.
  No competing PDF exists                    → +35 pts (own this topic entirely)
  1–3 thin or low-quality PDFs exist         → +20 pts (yours will dominate)
  Several quality PDFs already compete       → +5 pts

AXIS 2 — DEMAND (weight: 30 pts max)
Minimum to include: ${ABSOLUTE_MIN_VOLUME.toLocaleString()}/month. Below this, even a monopoly won't pay.
  ${ABSOLUTE_MIN_VOLUME.toLocaleString()}–${(market.strongVolume - 1).toLocaleString()}/month  → +10 pts
  ${market.strongVolume.toLocaleString()}–${(market.massiveVolume - 1).toLocaleString()}/month  → +20 pts
  ${market.massiveVolume.toLocaleString()}+/month            → +30 pts

AXIS 3 — PROBLEM URGENCY (weight: 20 pts max)
High urgency = there are real consequences for not solving this (failing an exam, being blocked from registering a business, losing money to fraud, missing a visa deadline).
  Urgent, consequential problem              → +20 pts
  General improvement / lifestyle topic     → +10 pts

AXIS 4 — FIRST-MOVER WINDOW (weight: 15 pts max)
In ${country}'s digital market, being first with a quality PDF means owning that search result for years.
  Clear first-mover — no quality guide exists yet  → +15 pts
  Some competition but yours can be clearly better → +5 pts

SCORING LOGIC:
90–100: Plant immediately. Monopoly + real demand + urgent problem. This is a passive income machine.
80–89:  Strong seed. Build after the 90+ ones.
70–79:  Worth planting if the portfolio needs volume in this niche.
Below 70: Skip.

IMPORTANT — RETURN ${count} RESULTS:
Be thorough. Scan every phrase. If the data supports ${count} viable opportunities, return all ${count}.
Do not self-limit. A 6,000/month search with zero competing PDFs and a real knowledge gap belongs in the results.

─────────────────────────────────────────
OUTPUT FORMAT (one object per opportunity)
─────────────────────────────────────────

{
  "painPoint": "40–80 words. Name who is suffering, what they are trying to do, what keeps going wrong, and what it costs them. Write in raw, honest language — as if the person is describing it themselves.",
  "keyword": "exact verbatim phrase from the search data above — copy precisely, no edits",
  "pdfTitle": "The keyword embedded naturally + reads like a real product someone would buy",
  "niche": "health | finance | education | business | farming | technology | relationships | home | career | mindset | other",
  "searchVolume": <integer — be conservative, do not inflate. Minimum ${ABSOLUTE_MIN_VOLUME}>,
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
