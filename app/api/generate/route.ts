import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { type Brand, buildBrandSystemContext, buildSocialCaptionContext, BRAND_CONFIG } from "@/lib/brand-config";

export const maxDuration = 300;

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); }
    catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastErr;
}

const COUNTRY_MAP: Record<string, { code: string; currency: string; isDiaspora: boolean }> = {
  ghana: { code: "GH", currency: "₵", isDiaspora: false },
  gh: { code: "GH", currency: "₵", isDiaspora: false },
  nigeria: { code: "NG", currency: "₦", isDiaspora: false },
  ng: { code: "NG", currency: "₦", isDiaspora: false },
  kenya: { code: "KE", currency: "KSh", isDiaspora: false },
  ke: { code: "KE", currency: "KSh", isDiaspora: false },
  "south africa": { code: "ZA", currency: "R", isDiaspora: false },
  za: { code: "ZA", currency: "R", isDiaspora: false },
  "united kingdom": { code: "GB", currency: "£", isDiaspora: false },
  uk: { code: "GB", currency: "£", isDiaspora: false },
  england: { code: "GB", currency: "£", isDiaspora: false },
  britain: { code: "GB", currency: "£", isDiaspora: false },
  canada: { code: "CA", currency: "CA$", isDiaspora: false },
  ca: { code: "CA", currency: "CA$", isDiaspora: false },
  australia: { code: "AU", currency: "A$", isDiaspora: false },
  au: { code: "AU", currency: "A$", isDiaspora: false },
  "united states": { code: "US", currency: "$", isDiaspora: false },
  usa: { code: "US", currency: "$", isDiaspora: false },
  america: { code: "US", currency: "$", isDiaspora: false },
  us: { code: "US", currency: "$", isDiaspora: false },
};

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 72);
}

function resolveCountry(input: string) {
  const key = input.toLowerCase().trim();
  return COUNTRY_MAP[key] ?? { code: "GB", currency: "£", isDiaspora: false };
}

type OppData = {
  keyword: string;
  pdfTitle: string;
  niche: string;
  painPoint: string;
  price: number;
  questions: string[];
};

function chaptersFromSalesCopy(salesPageCopy: string) {
  try {
    const raw = salesPageCopy.match(/\{[\s\S]*\}/)?.[0] ?? "{}";
    return (JSON.parse(raw).whatsInside ?? []) as { chapter: string; title: string; description: string }[];
  } catch { return []; }
}

export async function POST(req: Request) {
  try {
  const { situation, country, brand: brandParam, forExpat, forReturning } = await req.json();
  if (!situation?.trim() || !country?.trim()) {
    return NextResponse.json({ error: "Missing situation or country" }, { status: 400 });
  }

  const isExpat = !!forExpat;
  const isReturning = !!forReturning;
  const brand: Brand = brandParam === "brotherjimi" ? "brotherjimi" : "pdfseeds";
  const brandContext = buildBrandSystemContext(brand);
  const brandCfg = BRAND_CONFIG[brand];
  const resolved = resolveCountry(country);

  const openai = new OpenAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  // ── Step 0: Quick keyword extraction for deduplication check ──────────────
  const kwRes = await withRetry(() => openai.chat.completions.create({
    model: "gemini-2.5-flash",
    messages: [{
      role: "user",
      content: `Extract the core search keyword (4–7 words) from this situation: "${situation}". Return ONLY valid JSON: {"keyword": "..."}`,
    }],
  }));
  const quickKeyword: string = (() => {
    try {
      const raw = kwRes.choices[0].message.content ?? "{}";
      const jsonStr = raw.match(/\{[\s\S]*?\}/)?.[0] ?? "{}";
      return (JSON.parse(jsonStr).keyword ?? "").toLowerCase();
    }
    catch { return ""; }
  })();

  // Check for an existing published guide that closely matches
  if (quickKeyword.length > 4) {
    const words = quickKeyword.split(" ").filter(w => w.length > 3).slice(0, 3);
    const existing = await prisma.product.findFirst({
      where: {
        published: true,
        opportunity: { country: resolved.code },
        AND: words.map(w => ({ title: { contains: w, mode: "insensitive" as const } })),
      },
      include: { opportunity: true },
      orderBy: { createdAt: "desc" },
    });
    if (existing) {
      const price = existing.opportunity?.minPrice ?? 9.99;
      return NextResponse.json({
        slug: existing.slug,
        title: existing.title,
        price: `£${price.toFixed(2)}`,
        painPoint: existing.opportunity?.painPoint ?? "",
        chapters: chaptersFromSalesCopy(existing.salesPageCopy),
        cached: true,
      });
    }
  }

  // Step 1: Parse the user's situation into structured opportunity data
  const parseRes = await withRetry(() => openai.chat.completions.create({
    model: "gemini-2.5-flash",
    messages: [
      {
        role: "system",
        content: brandContext,
      },
      {
        role: "user",
        content: `A person in ${country} needs help with: "${situation}"

Brand: ${brand}
${brand === "brotherjimi"
  ? `This is a PASTORAL/DEVOTIONAL product for Brother Jimi. The "niche" should reflect spiritual/emotional pain. The "painPoint" should name what they are CARRYING, not what they need to DO. The "questions" should reflect the 6-stage pastoral arc: emotional insight, reflection, spiritual perspective, practical wisdom, faith encouragement, life-pattern.`
  : isReturning
  ? `This is a practical clarity product for PDFSeeds. The user is a DIASPORA MEMBER who has been living abroad (UK, US, Canada, Australia, or similar) and is planning to physically relocate back to ${country} permanently. The "pdfTitle" must address the specific challenge of returning home after years abroad — name the country and the return. The "painPoint" should name the real fear: making an irreversible life decision without knowing what has changed, what the financial implications are, or whether they can actually make it work. The "questions" must cover the FULL RETURN JOURNEY in this order: (1) what has legally and practically changed in ${country} since they left — laws, costs, processes; (2) their citizenship and residency status on return — dual nationality, re-entry rights, paperwork required; (3) tax and financial exit from the country they are leaving — pension transfer, NI contributions, savings and investment transfer, exit tax; (4) banking and financial setup in ${country} on arrival — accounts, transfers, exchange rates; (5) housing and property in ${country} — realistic costs now, renting vs buying on return, the market as it actually is; (6) healthcare — transitioning off NHS or foreign insurance, private options in ${country}; (7) qualifications and work — getting foreign credentials recognised, job market, starting a business with foreign savings and experience; (8) a complete return timeline checklist — what to do 12 months out, 6 months out, 1 month out, and arrival day.`
  : isExpat
  ? `This is a practical clarity product for PDFSeeds. The user is a FOREIGN NATIONAL (expat) living in ${country} — NOT a local citizen. The "pdfTitle" must explicitly address foreigners/expats and name the country. The "painPoint" should name the exact frustration of navigating ${country} as an outsider — the opacity, the different rules, the vulnerability to being misled. The "questions" must cover the FULL EXPAT JOURNEY specific to foreign nationals: what foreigners can and cannot legally do in this area (ownership limits, restrictions), the exact process for non-citizens vs citizens, required documentation that only foreigners need, relevant government body or department for foreigners (investment boards, immigration authorities, foreign national registration), timelines, the most common and costly mistakes expats make that locals never would, what to do when things go wrong as a foreigner (who to contact, what leverage you have), and a final action checklist for a foreign national starting from scratch.`
  : `This is a practical clarity product for PDFSeeds. The user is likely in the diaspora — living abroad and navigating their home country's systems remotely. The "pdfTitle" should follow the PDFSeeds title formula system. The "questions" must cover the FULL JOURNEY: requirements and eligibility, exact steps and costs, timelines, common mistakes and how to avoid them, what happens after submission (status tracking, support contacts, delays), and what to do if something goes wrong — plus a final action checklist.`
}

Return ONLY valid JSON — no markdown, no explanation:
{
  "keyword": "4–8 word search phrase they would type into Google",
  "pdfTitle": "Specific, compelling title — 10–15 words${brand === "brotherjimi" ? " — pastoral, warm, names the emotional state not the solution" : " — names the country and exact outcome"}",
  "niche": "${brand === "brotherjimi" ? "single word: grief OR doubt OR shame OR loneliness OR fear OR exhaustion OR faith OR healing OR identity" : "single word: immigration OR business OR health OR finance OR legal OR education OR farming"}",
  "painPoint": "One sentence — ${brand === "brotherjimi" ? "the exact thing they are carrying right now. What they woke up with this morning that they haven't been able to say out loud." : "the exact frustration they are living. Personal, specific, named precisely."}",
  "price": ${brandCfg.pricing.min},
  "questions": [
    "7 to 8 specific questions this guide must fully answer, each 8–15 words, ordered by ${brand === "brotherjimi" ? "emotional depth — from naming the feeling to practical movement to life-pattern" : isReturning ? "the return journey — what changed first, then citizenship/status, then financial exit from abroad, then banking setup, then housing, then healthcare, then qualifications/work, then complete timeline checklist" : isExpat ? "the expat journey — foreign national eligibility and restrictions first, then exact process for non-citizens, then required foreigner-specific documentation, then timelines, then post-submission tracking and support for foreigners, then what goes wrong for expats specifically, then checklist" : "the journey — eligibility/requirements first, then steps and costs, then timelines, then post-submission (status tracking, delays, support), then problems and recovery, then checklist"}"
  ]
}`,
      },
    ],
  }));

  let oppData: OppData;
  try {
    const raw = parseRes.choices[0].message.content ?? "{}";
    const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}";
    oppData = JSON.parse(jsonStr) as OppData;
    if (!oppData.keyword || !oppData.questions?.length) throw new Error("bad parse");
  } catch {
    return NextResponse.json({ error: "Could not understand your situation. Please try describing it differently." }, { status: 422 });
  }

  // Price by audience — returning is the most complex life decision, expat mid-tier
  oppData.price = isReturning ? 19.99 : isExpat ? 12.99 : 9.99;

  // Step 2: Save opportunity
  const opportunity = await prisma.opportunity.create({
    data: {
      keyword: oppData.keyword,
      pdfTitle: oppData.pdfTitle,
      niche: oppData.niche,
      country: resolved.code,
      searchVolume: 1000,
      opportunityScore: 80,
      competition: "low",
      trend: "stable",
      easeToSell: "high",
      minPrice: oppData.price ?? 9.99,
      maxPrice: (oppData.price ?? 9.99) * 1.5,
      emotionalIntent: "problem-solving",
      exactQuestions: JSON.stringify(oppData.questions),
      painPoint: oppData.painPoint,
      isDiaspora: !isExpat && !isReturning,
      isExpat,
      isReturning,
      platformOfOrigin: "user-generated",
    },
  });

  // Step 3: Generate PDF content + sales copy + social caption in parallel
  const pdfWritingRules = brand === "brotherjimi" ? `
WRITING RULES — Brother Jimi pastoral standard:
- Follow the 6-stage arc exactly: Emotional Insight → Reflection → Spiritual Perspective → Practical Wisdom → Faith Encouragement → Life-Pattern
- Open Ch 1 by naming the feeling precisely — not fixing it, naming it. The reader must feel seen before anything else.
- No preaching. No moral explanations. No instruction in the imperative voice.
- Each chapter moves inward before it moves outward — acknowledge before suggesting.
- Short paragraphs. Breathing room between thoughts. Never a list of bullet points in the body text.
- Sentences are unhurried. Write for someone reading slowly at 6am with something on their chest.
- End with a benediction: a specific wish for this reader, crafted from the exact topic. Not a prayer instruction. A gift.
- Offer 1–2 further reading verses as an invitation: "If this reached you, there is more here: [verse]"
- Write in markdown but use it sparingly — no heavy formatting, mostly flowing paragraphs.` : `
You are a world-class ${oppData.niche} specialist — not a generalist. You have 15+ years of hands-on experience helping ${isReturning ? `diaspora members plan and execute their return to ${country} after years abroad` : isExpat ? `foreign nationals and expats navigate ${country}` : `people in ${country} navigate this exact topic`}. You have seen every mistake, every delay, every shortcut. Expert knowledge, human voice. If they ever conflict, human voice wins.${isReturning ? ` You know exactly what catches returning diaspora off guard — the things that changed while they were away, the financial traps of leaving a Western system, the emotional and practical reality of arriving back. You write directly to that.` : isExpat ? ` You know exactly where the system treats foreigners differently — the extra steps, the extra fees, the hidden restrictions — and you write directly to that.` : ""}

Before writing each chapter, identify silently: what most people believe about this step, and what is actually true. Write toward that gap — not toward the obvious.

WRITING RULES — PDFSeeds clarity standard:
- 8–10 pages. Specific to ${country} — real processes, real fees, real offices, real deadlines.
- Start each chapter with the single most important thing to know.
- Short paragraphs. Numbered steps. No filler.
- Specificity IS authority — name the form, the fee, the office, the timeline.
- Say something the reader didn't already know. Surface the hidden pattern, the thing a generic guide would miss.
- Delete: "leverage", "moreover", "facilitate", "in conclusion", "it is important to note", "needless to say". Use clear nouns and strong verbs instead.
- Final page: "Your Action Checklist" — every key step condensed, actionable in 30 minutes.
- Write in markdown.

THINKING RULES — how to diagnose what this guide must cover:

COVER THE FULL JOURNEY. Every process has stages beyond the obvious steps: before you start → doing it → submitting → waiting → getting a response → what happens when each stage goes wrong. Ask yourself: what does someone need to know at every one of these stages? A guide that only covers the middle is incomplete.

GO DEEP ON PROBLEMS. When covering errors, mistakes, or failure points — do not stop at the 3-5 obvious ones. A practitioner with 15 years of experience has seen the long tail: the edge cases, the rare-but-real failures, the things that only appear once you have handled hundreds of cases. List them. Cover them. That depth is what separates a paid guide from a free article.

TEMPLATES ARE PREMIUM VALUE. Any time this topic requires the reader to communicate with an authority — a government office, embassy, company, institution — include a ready-to-use copy-paste template. A template is worth more than three paragraphs of advice on what to write. Always include: what to say, what reference details to include, and what to ask for specifically.

CONFIDENCE, NOT HEDGING. Replace "might", "often", "usually", "in some cases" with specific, definitive language. If something is true 90% of the time, say "90% of the time." If something always applies, say "always." Where you have a specific number — a fee, a file size, a timeline — give the exact number, not a range. Hedge only where genuine uncertainty exists, and name the uncertainty precisely.

EXPERT NOTES. Throughout the guide, mark 3–5 insights that only someone with real hands-on experience would know — the kind of thing that does not appear on any official website and that makes a reader think "I would never have found this on my own." Label them clearly: **Expert Note:** followed by the insight. These are the moments that justify the price.

Before outputting: would a smart stranger voluntarily read the next paragraph? If no — rewrite it.`;

  const [pdfRes, salesRes, socialRes] = await Promise.all([
    withRetry(() => openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: brandContext },
        {
          role: "user",
          content: `Write a ${brand === "brotherjimi" ? "pastoral reflection guide" : "practical PDF guide"} for someone in ${country} who said: "${situation}"

TITLE: "${oppData.pdfTitle}"
THE EXACT ${brand === "brotherjimi" ? "THING THEY ARE CARRYING" : "PAIN THEY HAVE"}: "${oppData.painPoint}"

CHAPTERS — address each question completely, one per chapter, in this exact order:
${oppData.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

${pdfWritingRules}`,
        },
      ],
    })),

    withRetry(() => openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: brandContext },
        {
          role: "user",
          content: brand === "brotherjimi" ? `
Write the landing page copy for this Brother Jimi pastoral guide:
Title: "${oppData.pdfTitle}"
What they are carrying: "${oppData.painPoint}"
Price framing: Appreciation-based — ${brandCfg.pricing.symbol}${(oppData.price ?? brandCfg.pricing.min).toFixed(2)}

THE 6-STAGE JOURNEY THIS GUIDE TAKES THEM THROUGH:
${oppData.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return ONLY valid JSON:
{
  "heroTagline": "One sentence, max 15 words. Names what they are carrying — not what the guide does. Reads like Brother Jimi is speaking directly to them.",
  "bulletedPain": [
    "A specific feeling or moment they have had — not a problem to fix, a recognition. Max 12 words.",
    "Another moment of feeling unseen or unheard or unable to speak. Max 12 words.",
    "The weight of it — what it costs them to keep carrying this alone. Max 12 words."
  ],
  "whatsInside": [
    {"chapter": "Part 1", "title": "What they will feel after this section — 6–8 words", "description": "One sentence. What shifts in them after reading this part. Max 12 words."},
    {"chapter": "Part 2", "title": "6–8 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Part 3", "title": "6–8 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Part 4", "title": "6–8 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Part 5", "title": "6–8 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Part 6", "title": "6–8 words", "description": "One sentence. Max 12 words."}
  ],
  "faqItems": [
    {"q": "Most common hesitation someone would feel before reading this", "a": "Warm, direct. 2 sentences max."},
    {"q": "What format does it come in?", "a": "A PDF — yours to keep, to return to."},
    {"q": "What if it doesn't reach me?", "a": "30 days. Full return. No question asked."}
  ],
  "urgencyLine": "Not urgency — a quiet invitation. One sentence. Max 12 words."
}` : `
Sales page copy for this PDF guide:
Title: "${oppData.pdfTitle}"
Country: ${country} | Price: ${resolved.currency}${(oppData.price ?? 9.99).toFixed(2)}
Pain: "${oppData.painPoint}"

THE EXACT QUESTIONS THIS GUIDE ANSWERS — one chapter per question, in this exact order:
${oppData.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return ONLY valid JSON. CRITICAL RULE: each whatsInside entry MUST directly correspond to one question above — the title is what the reader knows or can do after that chapter. Titles must feel written for this specific person's situation.

WHATS INSIDE — DESCRIPTION STRATEGY (non-negotiable):
Chapters 1–3 descriptions: VALIDATION copy. The reader thinks "yes, exactly what I expected." Confirms the guide covers the foundational need. E.g. "Exactly which forms, in what order, and where to submit them." Max 12 words.
Chapters 4–7 descriptions: DESIRE copy. The reader thinks "I hadn't thought about that." Name the hidden risk, costly mistake, or overlooked step this chapter prevents. Use "What most [returnees/expats/people] miss about…" or "The [mistake/trap] that [specific consequence]" framing. Max 14 words.

{
  "heroTagline": "One sentence, max 15 words, names their exact situation.",
  "bulletedPain": [
    "Specific frustration they've had — max 12 words",
    "Another real moment of confusion or wasted time — max 12 words",
    "A third specific pain — fear, cost, or wrong information — max 12 words"
  ],
  "whatsInside": [
    {"chapter": "Chapter 1", "title": "Answer to question 1 — what the reader walks away knowing, 6–9 words", "description": "Validation copy — confirms the guide covers what they expected. Max 12 words."},
    {"chapter": "Chapter 2", "title": "6–9 words", "description": "Validation copy — confirms a second expected area. Max 12 words."},
    {"chapter": "Chapter 3", "title": "6–9 words", "description": "Validation copy — confirms a third expected area. Max 12 words."},
    {"chapter": "Chapter 4", "title": "6–9 words", "description": "Desire copy — names the hidden risk or costly mistake this chapter prevents. Max 14 words."},
    {"chapter": "Chapter 5", "title": "6–9 words", "description": "Desire copy — the overlooked step most people miss until it's too late. Max 14 words."},
    {"chapter": "Chapter 6", "title": "6–9 words", "description": "Desire copy — what they would have regretted not knowing. Max 14 words."},
    {"chapter": "Chapter 7", "title": "6–9 words", "description": "Desire copy — the thing that separates those who get it right. Max 14 words."},
    {"chapter": "Checklist", "title": "Your Step-by-Step Action Plan", "description": "Everything in one place. Done in 30 minutes."}
  ],
  "faqItems": [
    {"q": "Most common objection specific to this topic", "a": "Direct answer. 2 sentences max."},
    {"q": "What format does it come in?", "a": "PDF. Instant download on any device."},
    {"q": "What if it doesn't help me?", "a": "30-day full refund. No questions asked."}
  ],
  "urgencyLine": "Honest, specific. Max 12 words."
}`,
        },
      ],
    })),

    withRetry(() => openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: buildSocialCaptionContext(brand) },
        {
          role: "user",
          content: `Write social captions for this ${brand === "brotherjimi" ? "pastoral guide" : "PDF guide"}:
Title: "${oppData.pdfTitle}"
Pain: "${oppData.painPoint}"
Brand: ${brand}

Return ONLY valid JSON:
{
  "instagram": "One sentence caption — stops someone mid-scroll. Followed by a new line and 'Link in bio.'",
  "whatsapp": "One sentence only. No CTA. Just the truth of it.",
  ${brand === "pdfseeds" ? `"tiktok": "Three short lines:\\nLine 1: The hook — exact situation named.\\nLine 2: The stakes.\\nLine 3: 'Complete guide in bio.'"` : `"facebook": "Two sentences max. Warm. Intimate. For a faith community group."`}
}`,
        },
      ],
    })),
  ]);

  const rawPdfContent = pdfRes.choices[0].message.content ?? "";
  const pdfContent = brand === "brotherjimi"
    ? `## A Christian perspective to ${oppData.pdfTitle}\n\n${rawPdfContent}`
    : rawPdfContent;
  const salesPageCopy = salesRes.choices[0].message.content ?? "";
  const socialCaptions: Record<string, string> = (() => {
    try { return JSON.parse(socialRes.choices[0].message.content ?? "{}"); }
    catch { return {}; }
  })();

  // Step 4: Save and publish the product
  const baseSlug = toSlug(oppData.keyword);
  const slug = `${baseSlug}-${resolved.code.toLowerCase()}-${Date.now().toString(36)}`;

  const product = await prisma.product.create({
    data: {
      opportunityId: opportunity.id,
      title: oppData.pdfTitle,
      slug,
      pdfContent,
      salesPageCopy,
      seoPageContent: "",
      published: true,
    },
  });

  const chapters = chaptersFromSalesCopy(salesPageCopy);
  const price = oppData.price ?? brandCfg.pricing.min;

  return NextResponse.json({
    slug: product.slug,
    title: product.title,
    price: `${brandCfg.pricing.symbol}${price.toFixed(2)}`,
    painPoint: oppData.painPoint,
    brand,
    chapters,
    socialCaptions,
  });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[generate] error:", msg);
    return NextResponse.json(
      { error: "We hit a snag building your guide. Please try again." },
      { status: 500 }
    );
  }
}
