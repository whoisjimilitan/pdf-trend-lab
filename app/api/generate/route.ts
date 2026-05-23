import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import OpenAI from "openai";

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
  const { situation, country } = await req.json();
  if (!situation?.trim() || !country?.trim()) {
    return NextResponse.json({ error: "Missing situation or country" }, { status: 400 });
  }

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
      const currency = existing.opportunity?.isDiaspora ? "£" : (resolved.currency);
      const price = existing.opportunity?.minPrice ?? 9.99;
      return NextResponse.json({
        slug: existing.slug,
        title: existing.title,
        price: `${currency}${price.toFixed(2)}`,
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
    messages: [{
      role: "user",
      content: `A person in ${country} needs help with: "${situation}"

Return ONLY valid JSON — no markdown, no explanation:
{
  "keyword": "4–8 word search phrase they would type into Google",
  "pdfTitle": "Specific, compelling guide title — 10–15 words, names the country where relevant",
  "niche": "single word: immigration OR business OR health OR finance OR legal OR education OR farming",
  "painPoint": "One sentence — the exact frustration they are living right now. Personal, specific.",
  "price": 9.99,
  "questions": [
    "7 to 8 specific questions this guide must fully answer, each 8–15 words, ordered by urgency"
  ]
}`,
    }],
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

  // Step 3: Generate PDF content + sales copy in parallel
  const [pdfRes, salesRes] = await Promise.all([
    openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [{
        role: "user",
        content: `Write a practical PDF guide for someone in ${country} who said: "${situation}"

TITLE: "${oppData.pdfTitle}"
THE EXACT PAIN THEY HAVE: "${oppData.painPoint}"

CHAPTERS — answer each question completely, one per chapter:
${oppData.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

WRITING RULES:
- 8–10 pages. Specific to ${country} — real processes, fees, offices where known.
- Start each chapter with the single most important thing to know.
- Short paragraphs. Numbered steps. No filler.
- Final page: "Your 5-Step Action Checklist" — what they do immediately after reading.

Write in markdown.`,
      }],
    }),
    openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [{
        role: "user",
        content: `Sales page copy for this PDF guide:
Title: "${oppData.pdfTitle}"
Country: ${country} | Price: ${resolved.currency}${(oppData.price ?? 9.99).toFixed(2)}
Pain: "${oppData.painPoint}"

THE EXACT QUESTIONS THIS GUIDE ANSWERS — one chapter per question, in this exact order:
${oppData.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return ONLY valid JSON. CRITICAL RULE: each whatsInside entry MUST directly correspond to one question above — the title is what the reader knows or can do after that chapter. Do NOT write generic titles. The titles must feel like they were written for this specific person's situation.

{
  "heroTagline": "One sentence, max 15 words, names their exact situation.",
  "bulletedPain": [
    "Specific frustration they've had — max 12 words",
    "Another real moment of confusion or wasted time — max 12 words",
    "A third specific pain — fear, cost, or wrong information — max 12 words"
  ],
  "whatsInside": [
    {"chapter": "Chapter 1", "title": "Answer to question 1 — phrased as what they walk away knowing, 6–9 words", "description": "One sentence. What specifically they can do after this chapter. Max 12 words."},
    {"chapter": "Chapter 2", "title": "Answer to question 2 — specific to their situation, 6–9 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Chapter 3", "title": "Answer to question 3 — specific to their situation, 6–9 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Chapter 4", "title": "Answer to question 4 — specific to their situation, 6–9 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Chapter 5", "title": "Answer to question 5 — specific to their situation, 6–9 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Chapter 6", "title": "Answer to question 6 — specific to their situation, 6–9 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Chapter 7", "title": "Answer to question 7 — specific to their situation, 6–9 words", "description": "One sentence. Max 12 words."},
    {"chapter": "Checklist", "title": "Your Step-by-Step Action Plan", "description": "Everything in one place. Done in 30 minutes."}
  ],
  "faqItems": [
    {"q": "Most common objection specific to this topic", "a": "Direct answer. 2 sentences max."},
    {"q": "What format does it come in?", "a": "PDF. Instant download on any device."},
    {"q": "What if it doesn't help me?", "a": "30-day full refund. No questions asked."}
  ],
  "urgencyLine": "Honest, specific. Max 12 words."
}`,
      }],
    }),
  ]);

  const pdfContent = pdfRes.choices[0].message.content ?? "";
  const salesPageCopy = salesRes.choices[0].message.content ?? "";

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

  return NextResponse.json({
    slug: product.slug,
    title: product.title,
    price: `${resolved.currency}${(oppData.price ?? 9.99).toFixed(2)}`,
    painPoint: oppData.painPoint,
    chapters,
  });
}
