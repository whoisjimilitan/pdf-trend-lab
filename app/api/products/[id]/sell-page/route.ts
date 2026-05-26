import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY ?? "",
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { opportunity: true },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { opportunity } = product;
  const questions: string[] = (() => {
    try { return JSON.parse(opportunity.exactQuestions) as string[]; } catch { return []; }
  })();

  let salesPageCopy = "";

  try {
    const res = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [{
        role: "user",
        content: `You are a direct-response copywriter generating minimal, high-converting sell page copy for a PDF guide. You write for diaspora communities — people who are capable and motivated but drowning in generic advice that wasn't written for their country or situation.

THE ZIPPER PRINCIPLE: search query → page title → hero → pain → PDF = the answer. Every section says the same thing in a different way. No tangents. No padding.

THE IDENTITY PRINCIPLE: Name WHO the reader is before you tell them what they get. The reader must think "this was written for someone like me." A person who sees themselves in the copy buys. A person who doesn't, leaves. Every field should carry this — not just the tagline.

THE OPEN LOOP PRINCIPLE: The whatsInside chapters are shown as a preview on the sell page — the first 3 are fully visible, the rest are blurred and locked. This creates psychological tension that only purchase resolves. So: make ALL chapter titles compelling. The locked ones must be visible enough to intrigue and specific enough to sting — the reader should think "I need that chapter."

THE TRUST PRINCIPLE: The biggest barrier to purchase is not price — it is doubt that this will be accurate and relevant to THEIR specific situation. The first FAQ must address this directly.

Keyword (the exact search query that found this opportunity): "${opportunity.keyword}"
PDF title: "${opportunity.pdfTitle || opportunity.keyword}"
Core pain: "${opportunity.painPoint}"
Search questions people are asking:
${questions.join("\n")}

Return ONLY valid JSON — no markdown, no explanation, no extra text:

{
  "heroTagline": "...",
  "bulletedPain": ["...", "...", "..."],
  "whatsInside": [
    {"chapter": "Chapter 1", "title": "...", "description": "..."},
    {"chapter": "Chapter 2", "title": "...", "description": "..."},
    {"chapter": "Chapter 3", "title": "...", "description": "..."},
    {"chapter": "Chapter 4", "title": "...", "description": "..."},
    {"chapter": "Chapter 5", "title": "...", "description": "..."},
    {"chapter": "Chapter 6", "title": "...", "description": "..."},
    {"chapter": "Chapter 7", "title": "...", "description": "..."},
    {"chapter": "Quick-Reference", "title": "Action Checklist", "description": "Everything on one page. Tick it off as you go."}
  ],
  "faqItems": [
    {"q": "...", "a": "..."},
    {"q": "What format does it come in?", "a": "PDF. Works on phone, tablet, and laptop. Instant download."},
    {"q": "What if it does not help me?", "a": "30-day full refund. No questions, no forms."}
  ],
  "urgencyLine": "..."
}

RULES FOR EACH FIELD — read these carefully:

heroTagline:
- One sentence. Names WHO the reader is + what they have AFTER reading. Max 15 words.
- Must feel like it was written for one specific person, not a category.
- WRONG: "Everything you need to start earning online"
- WRONG: "Register your business in Ghana today — the plain-English guide, step by step." (too generic)
- RIGHT: "The exact steps a Nigerian in the UK needs to register a business — nothing missing, nothing assumed."
- RIGHT: "You've been searching. Here is the answer written for your exact situation."

bulletedPain:
- Exactly 3 bullets. Each = one real lived moment of this specific person, not a vague category.
- Max 12 words each. Start with "You" or a present-tense verb.
- Name the IDENTITY: who they are, what they've tried, what keeps going wrong.
- WRONG: "You don't know where to start with this process"
- RIGHT: "You've Googled this three times and got three different answers"
- WRONG: "Uncertainty about the process holds you back"
- RIGHT: "Every article stops halfway and says 'consult a professional'"
- WRONG: "The process is confusing and overwhelming"
- RIGHT: "You found a guide — it was written for someone in America"
- Each bullet must reference something from the search questions above — use them as raw material.

whatsInside:
- 7 numbered chapters + 1 Quick-Reference = 8 total. Each chapter maps to a distinct aspect of the topic.
- The page shows the first 3 chapters fully, then blurs the rest. So: chapters 1–3 set the promise; chapters 4–7 must be specific enough that a blurred title still creates hunger.
- title: 5–7 words. Outcome language — what they CAN DO or KNOW after this chapter.
- description: One sentence, max 10 words. The specific thing they walk away with.
- WRONG title: "Understanding the registration process"
- RIGHT title: "Every document you need, in order"
- WRONG description: "This chapter explains the registration process in detail"
- RIGHT description: "Your application submitted correctly, first time."

faqItems:
- Exactly 3. FIRST question must address the TRUST/RISK fear specific to this topic — what makes someone doubt this will actually work for their situation? (accuracy, relevance, jurisdiction, their specific circumstances)
- Answers: 2 sentences max. Direct and confident. No hedging.
- WRONG first Q: "Does this work?" — too generic
- RIGHT first Q (business registration): "Is this specific to my country, or generic advice?" → "Specific. Every step, fee, and form in this guide is for [country]. We do not pad with general business theory."
- RIGHT first Q (visa process): "What if my situation is slightly different from the examples?" → "We cover the main route and the most common variations. If your case is genuinely unusual, the guide tells you exactly when you need specialist advice — and what to ask for."

urgencyLine:
- 1 honest line. Specific, not fake. Max 12 words.
- WRONG: "Limited time offer — act now before it's too late"
- RIGHT: "Introductory price. Goes up after 200 sales."

WORD COUNT CHECK — before finalising, verify:
- heroTagline ≤ 15 words
- Each pain bullet ≤ 12 words
- Each chapter description ≤ 10 words
- Each FAQ answer ≤ 2 sentences
- urgencyLine ≤ 12 words
If any field is over — cut it. Less is more.`,
      }],
    });

    salesPageCopy = res.choices[0].message.content ?? "";

    const match = salesPageCopy.match(/\{[\s\S]*\}/);
    if (match) salesPageCopy = match[0];
  } catch {
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { salesPageCopy },
    include: { opportunity: true },
  });

  return NextResponse.json(updated);
}
