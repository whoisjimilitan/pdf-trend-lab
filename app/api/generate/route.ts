import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { type Brand, buildBrandSystemContext, buildSocialCaptionContext, BRAND_CONFIG } from "@/lib/brand-config";

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
  const { situation, country, brand: brandParam } = await req.json();
  if (!situation?.trim() || !country?.trim()) {
    return NextResponse.json({ error: "Missing situation or country" }, { status: 400 });
  }

  const brand: Brand = brandParam === "brotherjimi" ? "brotherjimi" : "pdfseeds";
  const brandContext = buildBrandSystemContext(brand);
  const brandCfg = BRAND_CONFIG[brand];
  const resolved = resolveCountry(country);

  const openai = new OpenAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  // ── Step 0: Quick keyword extraction for deduplication check ──────────────
  const kwRes = await openai.chat.completions.create({
    model: "gemini-2.5-flash",
    response_format: { type: "json_object" },
    messages: [{
      role: "user",
      content: `Extract the core search keyword (4–7 words) from this situation: "${situation}". Return ONLY: {"keyword": "..."}`,
    }],
  });
  const quickKeyword: string = (() => {
    try { return (JSON.parse(kwRes.choices[0].message.content ?? "{}").keyword ?? "").toLowerCase(); }
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
  const parseRes = await openai.chat.completions.create({
    model: "gemini-2.5-flash",
    response_format: { type: "json_object" },
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
  : `This is a practical clarity product for PDFSeeds. The "pdfTitle" should follow the PDFSeeds title formula system. The "questions" should cover: requirements, steps, costs, timelines, common mistakes, checklist.`
}

Return ONLY valid JSON — no markdown, no explanation:
{
  "keyword": "4–8 word search phrase they would type into Google",
  "pdfTitle": "Specific, compelling title — 10–15 words${brand === "brotherjimi" ? " — pastoral, warm, names the emotional state not the solution" : " — names the country and exact outcome"}",
  "niche": "${brand === "brotherjimi" ? "single word: grief OR doubt OR shame OR loneliness OR fear OR exhaustion OR faith OR healing OR identity" : "single word: immigration OR business OR health OR finance OR legal OR education OR farming"}",
  "painPoint": "One sentence — ${brand === "brotherjimi" ? "the exact thing they are carrying right now. What they woke up with this morning that they haven't been able to say out loud." : "the exact frustration they are living. Personal, specific, named precisely."}",
  "price": ${brandCfg.pricing.min},
  "questions": [
    "7 to 8 specific questions this guide must fully answer, each 8–15 words, ordered by ${brand === "brotherjimi" ? "emotional depth — from naming the feeling to practical movement to life-pattern" : "urgency — most pressing first"}"
  ]
}`,
      },
    ],
  });

  let oppData: OppData;
  try {
    oppData = JSON.parse(parseRes.choices[0].message.content ?? "{}") as OppData;
    if (!oppData.keyword || !oppData.questions?.length) throw new Error("bad parse");
  } catch {
    return NextResponse.json({ error: "Could not understand your situation. Please try describing it differently." }, { status: 422 });
  }

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
      isDiaspora: resolved.isDiaspora,
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
You are a world-class ${oppData.niche} specialist — not a generalist. You have 15+ years of hands-on experience helping people in ${country} navigate this exact topic. You have seen every mistake, every delay, every shortcut. Expert knowledge, human voice. If they ever conflict, human voice wins.

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

Before outputting: would a smart stranger voluntarily read the next paragraph? If no — rewrite it.`;

  const [pdfRes, salesRes, socialRes] = await Promise.all([
    openai.chat.completions.create({
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
    }),

    openai.chat.completions.create({
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

{
  "heroTagline": "One sentence, max 15 words, names their exact situation.",
  "bulletedPain": [
    "Specific frustration they've had — max 12 words",
    "Another real moment of confusion or wasted time — max 12 words",
    "A third specific pain — fear, cost, or wrong information — max 12 words"
  ],
  "whatsInside": [
    {"chapter": "Chapter 1", "title": "Answer to question 1 — phrased as what they walk away knowing, 6–9 words", "description": "One sentence. What specifically they can do after this chapter. Max 12 words."},
    {"chapter": "Chapter 2", "title": "6–9 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Chapter 3", "title": "6–9 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Chapter 4", "title": "6–9 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Chapter 5", "title": "6–9 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Chapter 6", "title": "6–9 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Chapter 7", "title": "6–9 words", "description": "One sentence. Max 12 words."},
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
    }),

    openai.chat.completions.create({
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
    }),
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
}
