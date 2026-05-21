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
        content: `You are a direct-response copywriter. Generate conversion page copy for this PDF guide as valid JSON.

The zipper principle: search query → page title → hero → pain → PDF = the answer. Everything says the same thing.

Keyword (exact search query): "${opportunity.keyword}"
PDF title: "${opportunity.pdfTitle || opportunity.keyword}"
Price: ${opportunity.minPrice.toFixed(2)}
Pain: "${opportunity.painPoint}"
Search questions:
${questions.join("\n")}

Return ONLY valid JSON — no markdown, no explanation:
{
  "heroTagline": "One sentence. Contains the keyword concept. States the outcome. Max 15 words.",
  "bulletedPain": [
    "Real lived moment of frustration. Max 12 words. Starts with You or a verb.",
    "Another specific moment they actually experienced or Googled.",
    "A third — fear, confusion, or wasted time."
  ],
  "whatsInside": [
    {"chapter": "Chapter 1", "title": "5-7 word outcome — what they CAN DO", "description": "One sentence, max 10 words."},
    {"chapter": "Chapter 2", "title": "5-7 word outcome", "description": "One sentence, max 10 words."},
    {"chapter": "Chapter 3", "title": "5-7 word outcome", "description": "One sentence, max 10 words."},
    {"chapter": "Chapter 4", "title": "5-7 word outcome", "description": "One sentence, max 10 words."},
    {"chapter": "Quick-Reference", "title": "Action Checklist", "description": "Five steps. Thirty minutes. Done."}
  ],
  "faqItems": [
    {"q": "Biggest objection specific to THIS topic", "a": "Direct answer. 2 sentences max."},
    {"q": "What format does it come in?", "a": "PDF. Works on phone, tablet, and laptop. Instant download."},
    {"q": "What if it does not help me?", "a": "30-day full refund. No questions, no forms."}
  ],
  "urgencyLine": "Honest and specific. Max 12 words. No fake urgency."
}

Rules: exactly 3 pain bullets (12 words max each), exactly 3 FAQ items (2 sentences max each), chapter descriptions 10 words max. Less is more.`,
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
