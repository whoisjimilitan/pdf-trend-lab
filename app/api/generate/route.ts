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
PERSONA — hold this identity for the entire guide:
You are a world-class ${oppData.niche} specialist with 15+ years helping people in ${country} navigate this exact process — not as a generalist, as someone who has personally seen every mistake, every delay, and every shortcut. You are also a bestselling author of practical how-to guides and a master educator. Your writing style is authoritative, precise, and deeply actionable. Expert knowledge delivered in a human voice — if the two ever conflict, the human voice wins. Write for readers who have already wasted time on generic advice. They expect the real answer, specific to their country and situation.

STRUCTURAL MANDATE — reason silently before writing:
Before drafting any chapter, identify:
1. What is the single most important action this reader must take first?
2. Where will they feel most overwhelmed — and how do you sequence around it?
3. Which chapter has the highest practical leverage — where the wrong move has the biggest consequence?
4. Where does a real-world example land hardest?
5. What supplemental materials make this guide worth keeping forever?
Use this reasoning to refine the chapter order if it improves the reader's journey. Your structural judgment takes priority over the rigid question sequence where sequence matters. Do not show this reasoning — use it.

Core principle: Do not simplify information. Simplify decision-making.

PRESERVE in every chapter: all facts, all examples, all fees and timelines (specific to ${country}), all warnings, all caveats, all eligibility notes, all payment flows, all practical details.

DO NOT: remove information, invent facts, turn specifics into vague advice, replace instructions with summaries, sound academic, sound AI-generated.

CHAPTER STRUCTURE — use this EXACT layout for every chapter:

# [Chapter heading — phrased as an Outcome or Milestone the reader achieves]

[Design Note: Chapter opener — large chapter number, outcome headline, one-line context description]

**What This Is**
One short paragraph: what this chapter accomplishes and WHY this stage matters to the reader's journey.

**Goal**
One concrete sentence. "Submit X to Y by doing Z." Not "Understand X."

**Time Required**
Realistic estimate. If genuinely unknown: "varies — usually X to Y weeks."

**What You Need**
Required: [list every document, account, fee, tool, or prerequisite]
You do NOT need: [name fears that are not real blockers — remove psychological friction]

**Exact Steps**
[Design Note: Numbered steps as callout blocks with step number in accent colour]
1. [Action verb + one specific action. One action per step, never two.]
2. Name every form, office, website, fee, and deadline as it applies to ${country}.

**Real-World Example**
[Design Note: Case study box — contrasting background, italic, specific outcome highlighted]
A concrete example of someone in this situation completing this step. Name the specific outcome and timeframe. If a verified case is unavailable, construct a realistic composite — "Someone like you — [specific profile] — typically finds that [specific result]." Never abstract. Never vague.

**Payment / Money Flow** (include only if money is involved in this chapter)
[Design Note: Cost badge — amount in bold, context in smaller secondary text]
Exact amount or range, how to pay, timing, what confirmation looks like. Never leave money vague.

**What to Expect**
Realistic outcomes. Likely delays. What "normal" looks like. Normalise difficulty without catastrophising.

**Common Mistakes**
[Design Note: Mistakes as red-flagged list with warning icon]
Specific operational errors people actually make in ${country} for this step. Not generic warnings.

**Reflection & Action**
[Design Note: Reflection box — light purple background, question mark icon, three numbered items]
Three questions the reader answers before moving on:
1. [Verification: "Have you [completed specific action]?"]
2. [Confirmation: "Do you have [specific document or confirmation] in hand?"]
3. [Contingency: "What is your plan if [the most common obstacle for this step] happens?"]

**Move Forward When**
A specific trigger. "Move to Chapter X once Y is complete." Not "when ready."

---

SUPPLEMENTAL MATERIALS — add these after the final chapter:

## Your Step-by-Step Checklist
[Design Note: Per-chapter checklist — chapter header tabs, checkbox icons, two columns, printable]
For each chapter: a condensed list of every action from Exact Steps. Reader checks off as they go. Grouped by chapter. Labelled clearly.

## Resource Library
[Design Note: Resource cards — icon per resource, name bold, one-line description, URL or office name in smaller text]
Curated tools, official websites, government portals, templates, and authoritative further reading specific to ${country}:
- [Official government portal, office name, or regulatory body + URL where known]
- [Relevant professional body or authority]
- [Useful template, form, or official calculator]
- [Trusted further reading — official guide, book, or authoritative source]
Only include resources you are confident are real and relevant to ${country}. If uncertain, say so and tell the reader how to verify.

---

DESIGN NOTES — embed throughout wherever layout would help the reader:
Use [Design Note: ...] to flag layout decisions for the template engine — be specific about visual treatment, colour, and purpose. These are stripped from display and used only by the layout engine.

WRITING RULES:
- Authoritative expertise, human voice — expert talking to a person, not writing for other experts
- Short paragraphs — 4 sentences max. Direct. No passive voice. No filler.
- Never: "in conclusion", "moreover", "it is important to note", "this section explores"
- Reader must feel: expert-guided, completely clear, capable of acting immediately

FLOW: Start → Do → Get Result → Avoid Mistakes → Move Forward

FINAL QUALITY TEST — verify before outputting:
1. Could someone act immediately after reading each chapter?
2. Is every useful detail preserved and specific to ${country}?
3. Does each chapter reduce decisions, not multiply them?
4. Does the Real-World Example feel specific and real, not generic?
5. Does this feel worth paying for — or does it read like a free blog post?
If any answer is no — rewrite that section.

8–10 pages of content. Specific to ${country} — real processes, real fees, real offices, real deadlines.
Specificity IS authority. Write in markdown.`;

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
