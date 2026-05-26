import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { type Brand, buildBrandSystemContext, buildSocialCaptionContext, BRAND_CONFIG } from "@/lib/brand-config";

const BJ_NICHES = new Set(["grief","doubt","shame","loneliness","fear","exhaustion","faith","healing","identity"]);

function detectBrand(niche: string): Brand {
  return BJ_NICHES.has(niche) ? "brotherjimi" : "pdfseeds";
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function POST(req: Request) {
  const { opportunityId } = await req.json();

  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const brand       = detectBrand(opportunity.niche);
  const brandCtx    = buildBrandSystemContext(brand);
  const socialCtx   = buildSocialCaptionContext(brand);
  const brandCfg    = BRAND_CONFIG[brand];
  const isBJ        = brand === "brotherjimi";

  const questions: string[] = (() => {
    try { return JSON.parse(opportunity.exactQuestions); }
    catch { return []; }
  })();

  const painPoint = opportunity.painPoint || "";

  const openai = new OpenAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  // ── PDF content prompt ──────────────────────────────────────────────────────
  const pdfPrompt = isBJ ? `
Write a pastoral reflection guide for someone carrying: "${painPoint}"

TITLE: "${opportunity.pdfTitle || opportunity.keyword}"

Follow the 6-stage pastoral arc exactly — one stage per chapter:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

PASTORAL WRITING RULES (non-negotiable):
- Open Ch 1 by naming the feeling precisely — not fixing it, naming it. The reader must feel seen before anything else.
- No preaching. No moral explanations. No instruction in the imperative voice.
- Each chapter moves inward before it moves outward — acknowledge before suggesting.
- Short paragraphs. Breathing room between thoughts. Never a list of bullet points in the body text.
- Sentences are unhurried. Write for someone reading slowly at 6am with something on their chest.
- End with a benediction: a specific wish for this reader, crafted from the exact topic. Not a prayer instruction. A gift.
- Offer 1–2 further reading verses as an invitation: "If this reached you, there is more here: [verse]"
- Write in markdown but use it sparingly — no heavy formatting, mostly flowing paragraphs.
`.trim() : `
Write a practical PDF guide for someone with this exact situation: "${painPoint}"

TITLE: "${opportunity.pdfTitle || opportunity.keyword}"
NICHE: ${opportunity.niche}

CHAPTERS — answer each question completely, one per chapter, in this order:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

PERSONA — hold this identity for the entire guide:
You are a world-class ${opportunity.niche} specialist with 15+ years helping people navigate this exact process — not as a generalist, as someone who has personally seen every mistake, every delay, and every shortcut that exists. You are also a bestselling author of practical how-to guides and a master educator. Your style is authoritative, precise, and deeply actionable. Expert knowledge delivered in a human voice — if the two ever conflict, the human voice wins. Write for readers who have already wasted time on generic advice and now expect the real answer.

STRUCTURAL MANDATE — reason silently before writing:
Before drafting any chapter, identify:
1. What is the single most important action this reader must take first?
2. Where will they feel most overwhelmed — and how do you sequence around it?
3. Which chapter has the highest practical leverage?
4. Where does a real-world example land hardest?
5. What supplemental materials make this guide worth keeping forever?
Use this reasoning to refine the chapter order if it improves the reader's journey. Your structural judgment takes priority over the rigid question sequence where sequence matters. Do not show this reasoning — use it.

Core principle: Do not simplify information. Simplify decision-making.

PRESERVE in every chapter: all facts, all examples, all fees and timelines, all warnings, all caveats, all eligibility notes, all payment flows, all practical details.

DO NOT: remove information, invent facts, turn specifics into vague advice, replace instructions with summaries, sound academic, sound AI-generated.

CHAPTER STRUCTURE — use this EXACT layout for every chapter:

# [Chapter heading — phrased as an Outcome or Milestone the reader achieves]

[Design Note: Chapter opener — large chapter number, outcome headline, one-line context description]

**What This Is**
One short paragraph: what this chapter accomplishes and WHY this stage matters.

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
2. Name every form, office, website, fee, and deadline as applicable.

**Real-World Example**
[Design Note: Case study box — contrasting background, italic, specific outcome highlighted]
A concrete example of someone completing this step. Name the specific outcome and timeframe. If a verified case is unavailable, construct a realistic composite — "Someone like you — [specific profile] — typically finds that [specific result]." Never abstract. Never vague.

**Payment / Money Flow** (include only if money is involved in this chapter)
[Design Note: Cost badge — amount in bold, context in smaller secondary text]
Exact amount or range, how to pay, timing, what confirmation looks like.

**What to Expect**
Realistic outcomes. Likely delays. What "normal" looks like. Normalise difficulty.

**Common Mistakes**
[Design Note: Mistakes as red-flagged list with warning icon]
Specific operational errors people actually make. Not generic warnings.

**Reflection & Action**
[Design Note: Reflection box — light purple background, question mark icon, three numbered items]
Three questions the reader answers before moving on:
1. [Verification: "Have you [completed specific action]?"]
2. [Confirmation: "Do you have [specific document or confirmation] in hand?"]
3. [Contingency: "What is your plan if [the most common obstacle for this step] happens?"]

**Move Forward When**
A specific trigger. "Move to Chapter X once Y is complete." Not "when ready."

---

SUPPLEMENTAL MATERIALS — add after the final chapter:

## Your Step-by-Step Checklist
[Design Note: Per-chapter checklist — chapter header tabs, checkbox icons, two columns, printable]
Every action from Exact Steps, grouped by chapter, condensed to a single printable checklist.

## Resource Library
[Design Note: Resource cards — icon per resource, name bold, one-line description, URL or office name]
Curated tools, official portals, templates, and authoritative further reading:
- [Official government portal, regulatory body, or office + URL where known]
- [Relevant professional body or authority]
- [Useful template, form, or official calculator]
- [Trusted further reading — official guide, book, or authoritative source]
Only include resources you are confident are real and relevant. If uncertain, tell the reader how to verify.

---

DESIGN NOTES — embed throughout wherever layout would help:
Use [Design Note: ...] to flag layout decisions — specific about visual treatment, colour, and purpose. Stripped from display, used only by the layout engine.

WRITING RULES:
- Authoritative expertise, human voice — expert talking to a person, not writing for other experts
- Short paragraphs — 4 sentences max. Direct. No passive voice. No filler.
- Never: "in conclusion", "moreover", "it is important to note"
- Reader must feel: expert-guided, completely clear, capable of acting immediately

FINAL QUALITY TEST — verify before outputting:
1. Could someone act immediately after reading each chapter?
2. Is every useful detail preserved?
3. Does each chapter reduce decisions, not multiply them?
4. Does the Real-World Example feel specific and real, not generic?
5. Does this feel worth paying for — or like a free blog post?
If any answer is no — rewrite that section.

8–10 pages. Real processes, real fees, real offices, real deadlines. Specificity IS authority.
Write in markdown.
`.trim();

  // ── Sales copy prompt ───────────────────────────────────────────────────────
  const salesPrompt = isBJ ? `
Write the landing page copy for this Brother Jimi pastoral guide.

Title: "${opportunity.pdfTitle || opportunity.keyword}"
What they are carrying: "${painPoint}"
Price framing: Appreciation-based — £${brandCfg.pricing.min.toFixed(2)}

THE STAGES THIS GUIDE TAKES THEM THROUGH:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return ONLY valid JSON — no markdown, no explanation:
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
Generate conversion page copy for this PDF guide as valid JSON.

PDF title: "${opportunity.pdfTitle || opportunity.keyword}"
Price: £${opportunity.minPrice.toFixed(2)}. Niche: ${opportunity.niche}.
Core pain this guide solves: "${painPoint}"
Exact search questions (one chapter per question, in this order):
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return ONLY valid JSON — no markdown, no explanation:
{
  "heroTagline": "One sentence. Names their exact situation. Max 15 words.",
  "bulletedPain": [
    "One real lived moment of frustration. Max 12 words.",
    "Another specific moment — something they actually Googled or experienced.",
    "A third specific moment — fear, confusion, or wasted time."
  ],
  "whatsInside": [
    {"chapter": "Chapter 1", "title": "What they walk away knowing — 5–7 words", "description": "One sentence, what they can do after this chapter. Max 10 words."},
    {"chapter": "Chapter 2", "title": "5–7 words", "description": "One sentence. Max 10 words."},
    {"chapter": "Chapter 3", "title": "5–7 words", "description": "One sentence. Max 10 words."},
    {"chapter": "Chapter 4", "title": "5–7 words", "description": "One sentence. Max 10 words."},
    {"chapter": "Chapter 5", "title": "5–7 words", "description": "One sentence. Max 10 words."},
    {"chapter": "Quick-Reference", "title": "Action Checklist", "description": "Five steps. Thirty minutes. Done."}
  ],
  "faqItems": [
    {"q": "Biggest objection specific to THIS topic", "a": "Direct answer. 2 sentences max."},
    {"q": "What format does it come in?", "a": "PDF. Works on phone, tablet, and laptop. Instant download."},
    {"q": "What if it doesn't help me?", "a": "30-day full refund. No questions, no forms."}
  ],
  "urgencyLine": "Honest, specific. Max 12 words."
}`;

  // ── SEO article prompt ──────────────────────────────────────────────────────
  const seoPrompt = isBJ ? `
Write a pastoral reflection article for someone searching: "${opportunity.keyword}"
${painPoint ? `\nWhat they are carrying: "${painPoint}"\n` : ""}

This article is for Google — it must rank for the search query and send readers to a pastoral guide. It should feel like a Brother Jimi piece: warm, unhurried, personal.

Structure:
1. H1: "${opportunity.keyword}" — quiet, direct
2. Opening (60–80 words): Name the feeling. Name why they're here. Make them feel immediately understood. No solutions yet.
3. One H2 section per question below (use these as headings):
${questions.map((q, i) => `   ${i + 1}. ## ${q}`).join("\n")}
   Each section: 80–120 words. Reflective but grounded. No bullet points — flowing sentences.
4. ## A word before you go
   A closing paragraph (40–60 words) that offers the pastoral guide as a natural next step. Warm, not salesy. "If this reached you..."

Write in markdown. Pastoral tone throughout. No preaching.` : `
Write a long-form SEO article that will rank on Google for: "${opportunity.keyword}"
${painPoint ? `\nCore pain this article addresses: "${painPoint}"\nUse this exact language in the opening.\n` : ""}

Structure (exact):
1. H1 — exact keyword: "${opportunity.keyword}" (add ${new Date().getFullYear()} if it's a process topic)
2. Opening paragraph (80–120 words): answer the query directly, name the specific pain, state what this article gives them.
3. One H2 per question below (these ARE the H2 headings):
${questions.map((q, i) => `   ${i + 1}. ## ${q}`).join("\n")}
   Each section: 120–200 words. Lead with the most important info. Steps as numbered lists. Specific details — costs, timelines, office names.
4. ## Common Mistakes to Avoid (3–5 specific mistakes)
5. ## Frequently Asked Questions (3 Q&A pairs)
6. Closing paragraph (40–60 words): natural bridge to downloading the PDF guide. Not salesy.

SEO rules: use exact keyword "${opportunity.keyword}" in H1, opening, 2+ H2s, and closing. 900–1,400 words total. Write in markdown.`;

  // ── Social hooks prompt ─────────────────────────────────────────────────────
  const hooksPrompt = isBJ ? `
Write social captions for this Brother Jimi pastoral guide.

Title: "${opportunity.pdfTitle || opportunity.keyword}"
What they are carrying: "${painPoint}"

Return ONLY valid JSON — 6 caption objects:
[
  {"text": "One sentence that stops someone mid-scroll. Does NOT summarise the guide. Opens a door to it. No hashtags. No CTA.", "platform": "whatsapp", "emotionType": "${opportunity.emotionalIntent || "grief"}"},
  {"text": "One sentence that stops someone mid-scroll. Does NOT summarise the guide. Opens a door to it. No hashtags. No CTA.", "platform": "whatsapp", "emotionType": "${opportunity.emotionalIntent || "loneliness"}"},
  {"text": "One sentence caption.\\n\\nToday's word is linked in bio.", "platform": "instagram", "emotionType": "${opportunity.emotionalIntent || "grief"}"},
  {"text": "One sentence caption.\\n\\nLink in bio.", "platform": "instagram", "emotionType": "${opportunity.emotionalIntent || "shame"}"},
  {"text": "Two sentences max. Warm. Intimate. For a faith community group.", "platform": "facebook", "emotionType": "${opportunity.emotionalIntent || "faith"}"},
  {"text": "Two sentences max. Warm. Intimate. For a faith community group.", "platform": "facebook", "emotionType": "${opportunity.emotionalIntent || "doubt"}"}
]

RULES: Never transactional. No "buy", "product", "guide". Never exclamation marks. Tone: like receiving a message from someone who knows what you're carrying.` : `
Generate 10 platform-native marketing hooks for this PDF guide: "${opportunity.pdfTitle || opportunity.keyword}"
Niche: ${opportunity.niche}.
${painPoint ? `Core pain: "${painPoint}"\n` : ""}

Return as JSON array with 10 objects — 2 per platform:
[
  {"text": "HOOK: ...\nPROBLEM: ...\nCTA: Download the complete guide in bio", "platform": "tiktok", "emotionType": "fear|curiosity|urgency|mistake"},
  {"text": "HOOK: ...\nPROBLEM: ...\nCTA: ...", "platform": "tiktok", "emotionType": "..."},
  {"text": "[scroll-stopping first line]\\n[3–4 short lines expanding the pain]\\nLink in bio to get the full guide\\n#tag1 #tag2 #tag3 #tag4 #tag5", "platform": "instagram", "emotionType": "..."},
  {"text": "[scroll-stopping first line]\\n[3–4 short lines]\\nLink in bio\\n#tag1 #tag2 #tag3 #tag4 #tag5", "platform": "instagram", "emotionType": "..."},
  {"text": "TITLE: [keyword-rich, 60 chars max]\\nDESCRIPTION: [100–150 words keyword-dense, helpful]\\nBOARD: [suggested board]\\nHASHTAGS: #tag1 #tag2 #tag3 #tag4 #tag5", "platform": "pinterest", "emotionType": "..."},
  {"text": "TITLE: ...\\nDESCRIPTION: ...\\nBOARD: ...\\nHASHTAGS: ...", "platform": "pinterest", "emotionType": "..."},
  {"text": "SUBJECT: [compelling, 50 chars max]\\nPREVIEW: [completes subject, 90 chars max]", "platform": "email", "emotionType": "..."},
  {"text": "SUBJECT: ...\\nPREVIEW: ...", "platform": "email", "emotionType": "..."},
  {"text": "[tweet under 240 chars — specific, calls out the situation, ends with hook]", "platform": "twitter", "emotionType": "..."},
  {"text": "[tweet under 240 chars]", "platform": "twitter", "emotionType": "..."}
]`;

  const [pdfRes, salesRes, seoRes, hooksRes, scriptRes] = await Promise.all([
    openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: brandCtx },
        { role: "user", content: pdfPrompt },
      ],
    }),
    openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: brandCtx },
        { role: "user", content: salesPrompt },
      ],
    }),
    openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: brandCtx },
        { role: "user", content: seoPrompt },
      ],
    }),
    openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: socialCtx },
        { role: "user", content: hooksPrompt },
      ],
    }),
    openai.chat.completions.create({
      model: "gemini-2.5-flash",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: brandCtx },
        { role: "user", content: isBJ ? `
Write a short social caption for Brother Jimi to accompany this pastoral guide.

Title: "${opportunity.pdfTitle || opportunity.keyword}"
Carrying: "${painPoint}"

Return ONLY valid JSON with these three keys — each a single sentence spoken by Brother Jimi:
{
  "hook": "One sentence that names what they are carrying. Intimate. No exclamation marks.",
  "tease": "One sentence that names what shifts for the reader in this guide. Warm, not promotional.",
  "cta": "Receive this word — it's linked in bio."
}` : `
Write a 5–7 second faceless video script for this PDF guide.
Topic: "${opportunity.pdfTitle || opportunity.keyword}"
${painPoint ? `Pain: "${painPoint}"` : ""}

Return ONLY valid JSON with exactly these three keys:
{
  "hook": "Hook (0–2s): PSA format or fear trigger. Name the exact situation. Person who has this problem MUST stop scrolling.",
  "tease": "Tease (2–4s): The stakes or payoff. One specific sentence. Don't explain the guide.",
  "cta": "CTA (4–7s): Point to bio. Short. 'Link in bio for the complete step-by-step guide' is enough."
}`,
      },
      ],
    }),
  ]);

  const rawPdfContent = pdfRes.choices[0].message.content ?? "";
  const pdfContent = isBJ
    ? `## A Christian perspective to ${opportunity.pdfTitle || opportunity.keyword}\n\n${rawPdfContent}`
    : rawPdfContent;
  const salesPageCopy = salesRes.choices[0].message.content ?? "";
  const seoPageContent = seoRes.choices[0].message.content ?? "";

  const generatedHooks: { text: string; platform: string; emotionType: string }[] = (() => {
    try {
      const raw = hooksRes.choices[0].message.content ?? "[]";
      const match = raw.match(/\[[\s\S]*\]/);
      return JSON.parse(match ? match[0] : "[]");
    } catch { return []; }
  })();

  // Save video/caption script back to the opportunity
  try {
    const vsRaw = scriptRes.choices[0].message.content ?? "{}";
    const vs = JSON.parse(vsRaw);
    if (vs.hook || vs.tease || vs.cta) {
      await prisma.opportunity.update({
        where: { id: opportunityId },
        data: { videoScript: vsRaw },
      });
    }
  } catch { /* non-fatal */ }

  const slug = toSlug(opportunity.keyword);

  const product = await prisma.product.create({
    data: {
      opportunityId,
      title: opportunity.pdfTitle || opportunity.keyword,
      slug,
      pdfContent,
      salesPageCopy,
      seoPageContent,
    },
  });

  for (const h of generatedHooks) {
    await prisma.hook.create({
      data: { opportunityId, text: h.text, platform: h.platform, emotionType: h.emotionType, niche: opportunity.niche },
    });
  }

  return NextResponse.json({ product, hooks: generatedHooks, brand });
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: { opportunity: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}
