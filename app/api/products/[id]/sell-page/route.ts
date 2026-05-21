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
        content: `You are a direct-response copywriter generating minimal, high-converting sell page copy for a PDF guide.

THE ZIPPER PRINCIPLE: search query → page title → hero → pain → PDF = the answer. Every section says the same thing in a different way. No tangents. No padding.

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
    {"chapter": "Quick-Reference", "title": "Action Checklist", "description": "Five steps. Thirty minutes. Done."}
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
- One sentence. Must contain the keyword concept. States what they have AFTER reading.
- Max 15 words.
- WRONG: "Everything you need to start earning online"
- RIGHT: "Register your business in Ghana today — the plain-English guide, step by step."

bulletedPain:
- Exactly 3 bullets. Each = one real lived moment, not a vague category.
- Max 12 words each. Start with "You" or a verb.
- WRONG: "You don't know where to start with this process"
- RIGHT: "You've Googled this three times and got three different answers"
- WRONG: "Uncertainty about the process holds you back"
- RIGHT: "Every article stops halfway and says 'consult a professional'"
- Each bullet must reference something from the search questions above — use them as raw material.

whatsInside:
- 4 numbered chapters + 1 Quick-Reference. Each chapter maps to one of the search questions above.
- title: 5–7 words. Outcome language — what they CAN DO after this chapter.
- description: One sentence, max 10 words. The specific thing they walk away with.
- WRONG description: "This chapter explains the registration process in detail"
- RIGHT description: "Your business registered in one afternoon."

faqItems:
- Exactly 3. First question = the biggest objection for THIS specific topic (not generic).
- Answers: 2 sentences max. Direct and confident.
- WRONG: "Q: Does this work? A: Yes, this guide has helped many people..."
- RIGHT: "Q: Do I need a business registration to apply? A: No. We cover both individual and registered business routes."

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
