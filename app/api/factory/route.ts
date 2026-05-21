import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import OpenAI from "openai";

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
  console.log("[/api/factory] POST — generating content");
  const { opportunityId } = await req.json();

  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const questions: string[] = JSON.parse(opportunity.exactQuestions);
  const hasGoogleAI = !!process.env.GOOGLE_AI_API_KEY;

  let pdfContent = "";
  let salesPageCopy = "";
  let seoPageContent = "";
  const generatedHooks: { text: string; platform: string; emotionType: string }[] = [];

  const painPoint = opportunity.painPoint || "";

  if (hasGoogleAI) {
    const openai = new OpenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });

    const [pdfRes, salesRes, seoRes, hooksRes] = await Promise.all([
      openai.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [{
          role: "user",
          content: `You are writing a PDF guide that will be sold. The reader paid money for this. They have a specific problem. Your only job is to give them the exact answer — nothing more, nothing less.

TOPIC: "${opportunity.pdfTitle || opportunity.keyword}"
NICHE: ${opportunity.niche}
${painPoint ? `CORE PAIN: "${painPoint}"` : ""}

QUESTIONS THIS GUIDE MUST ANSWER — one chapter per question:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

---

STRUCTURE:
1. Title: "${opportunity.pdfTitle || opportunity.keyword}"
2. Introduction (3 sentences only): Name the exact problem the reader is living through right now. State what this guide gives them. Tell them how long it takes to read.
3. One chapter per question above. Each chapter answers its question completely.
4. Final page: A numbered action checklist — the 5 steps the reader takes immediately after finishing.

---

WRITING RULES — follow every one of these without exception:

RULE 1 — CORRECT AND SPECIFIC, NOT VAGUE.
Every claim must be both true and as precise as possible. "Fees may apply" is forbidden. "The fee is X" is correct. If you know the typical amount, name it. If you know the typical timeframe, state it. If a step usually happens at a specific place or office, say so. Precision is the product. The reader is paying for specifics they couldn't easily piece together themselves.

RULE 2 — NO VAGUE CORRECTNESS.
Never write a sentence that is technically true but contains no usable information. These phrases are banned:
- "It depends on many factors"
- "There are several things to consider"
- "This is a complex issue"
- "Results may vary"
- "It is important to note that"
If you are tempted to write any of these, stop. Instead name the factors, list the things, specify the conditions. If you genuinely cannot be specific, say exactly what the reader needs to do to get the specific answer — e.g. "Call the Lands Commission directly on [number] to confirm the current fee, as it changes annually."

RULE 3 — BOLD BUT TRUE. NEVER BOLD AND INVENTED.
Make your claims as strong as they can be without becoming false. Do not invent specific numbers, names, fees, laws, or procedures you are not certain of. If you are certain, be direct and state it plainly. If you are not certain of a specific detail, say what IS certain and tell the reader how to verify the uncertain part. A guide that is honest about its limits is more useful than one that confidently invents.

RULE 4 — CONCRETE, NOT SURPRISING.
Do not try to surprise the reader or manufacture insights. Instead, be concrete. Concrete information feels new because most sources are vague. You do not need to invent novelty — you only need to be specific where others are vague. Real fees. Real timelines. Real steps. Real common mistakes people actually make. That is enough.

RULE 5 — EVERY SENTENCE EARNS ITS PLACE.
Read each sentence and ask: does this directly help the reader solve the problem? If no, cut it. Do not restate the question at the start of each chapter. Do not summarise what you are about to say — just say it. Do not close chapters with "in summary" paragraphs. The reader can see what they just read.

RULE 6 — IMPORTANT INFORMATION FIRST.
Within each chapter, lead with the most consequential information. The thing that, if the reader got it wrong, would cost them the most — time, money, or stress. Common mistakes that trip people up belong near the top, not at the end.

RULE 7 — LENGTH.
8–10 pages. No padding to reach a page count. No cutting to fit a page count. The right length is however many words it takes to fully answer every question with nothing wasted.

Write in markdown. Plain language. Short paragraphs. Bullet points for steps and lists.`
        }],
      }),
      openai.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [{
          role: "user",
          content: `You are a direct-response copywriter. Generate structured conversion page data for this PDF guide as valid JSON.

PDF title: "${opportunity.pdfTitle || opportunity.keyword}"
Price: ${opportunity.minPrice.toFixed(2)} ${opportunity.isDiaspora ? "GBP" : ""}. Niche: ${opportunity.niche}.
${painPoint ? `Core pain this guide solves: "${painPoint}"` : ""}
Exact search questions:
${questions.join("\n")}

Return ONLY a valid JSON object — no markdown, no explanation — in this exact shape:
{
  "heroTagline": "One devastating sentence that names the exact pain. Make them feel completely seen. Max 20 words.",
  "bulletedPain": [
    "If you've spent hours searching online and still don't have a clear answer...",
    "If you've tried [specific thing] and it didn't work...",
    "If you're worried about [specific fear from the questions]...",
    "If you feel stuck because [frustration derived from the questions]...",
    "If you're losing [money/time/opportunity] every day this stays unsolved..."
  ],
  "whatsInside": [
    {"chapter": "Chapter 1", "title": "Exact chapter title", "description": "What they can DO after reading this chapter — outcome language, not content summary"},
    {"chapter": "Chapter 2", "title": "Exact chapter title", "description": "Outcome language"},
    {"chapter": "Chapter 3", "title": "Exact chapter title", "description": "Outcome language"},
    {"chapter": "Chapter 4", "title": "Exact chapter title", "description": "Outcome language"},
    {"chapter": "Quick-Reference", "title": "Action Checklist", "description": "The 5 exact steps to implement everything, done in 30 minutes"}
  ],
  "faqItems": [
    {"q": "Will this actually work for [specific situation from the questions]?", "a": "Direct, confident answer. Name the specific outcome. 2-3 sentences."},
    {"q": "What format does it come in?", "a": "PDF. Works on phone, tablet, laptop, and can be printed. You get it instantly after purchase."},
    {"q": "What if it doesn't solve my problem?", "a": "30-day full refund. No questions, no forms, just email us."},
    {"q": "How is this different from free info online?", "a": "Answer directly — free info is scattered, incomplete, contradictory. This is [specific value prop]."},
    {"q": "[Objection specific to this topic — derived from the questions]", "a": "Handle it directly and confidently."}
  ],
  "urgencyLine": "Short, specific, honest urgency statement. E.g. 'Introductory price — goes up when we hit 500 copies.' Max 15 words."
}

Rules for the copy:
- bulletedPain: each bullet must reference something a real person actually typed into Google — use the search questions as raw material
- whatsInside: chapters must map to the exact search questions above
- faqItems: first question must address the biggest objection someone in this niche has before buying
- urgencyLine: do NOT use fake scarcity — make it honest and specific`
        }],
      }),
      openai.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [{
          role: "user",
          content: `Write an SEO-optimised landing page for this topic: "${opportunity.keyword}"
This page ranks on Google and sends free buyers to a PDF guide.
${painPoint ? `\nCore pain this page addresses: "${painPoint}"\n` : ""}
Rules:
- Page title = exact keyword phrase
- First paragraph: answer the exact question directly, then name the pain in one sentence
- Use the exact search phrases: ${questions.slice(0, 3).join(", ")}
- 300–500 words
- End with a natural CTA to download the guide
- Simple, clear language

Write in markdown.`
        }],
      }),
      openai.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [{
          role: "user",
          content: `Generate 10 platform-native marketing hooks for this PDF guide: "${opportunity.pdfTitle || opportunity.keyword}"
Emotional intent: ${opportunity.emotionalIntent}. Niche: ${opportunity.niche}.
${painPoint ? `\nCore pain to lead with: "${painPoint}"\nLet this pain language drive the hooks — use its specific words and emotions, not generic phrases.\n` : ""}

Create 2 hooks per platform in EXACTLY the format specified below. These hooks market the PAIN/FEAR/DESIRE — NOT the PDF.

TIKTOK (video script format — 3 lines):
Line 1: HOOK — the first 3 seconds, visual or shocking statement that stops the scroll
Line 2: PROBLEM — name the pain or struggle in 1 sentence
Line 3: CTA — "Download the free guide in bio"

INSTAGRAM (full caption format):
Line 1: Scroll-stopping first line (the hook)
Lines 2–5: 3–4 short lines expanding the problem or insight
Line 6: CTA — "Link in bio to get the full guide"
Include 5 relevant hashtags on the last line

PINTEREST (pin description format — optimised for Pinterest search):
Title: Keyword-rich pin title (60 chars max)
Description: 100–150 word keyword-dense description written as helpful content that naturally includes the search phrase multiple times. Pinterest is a search engine — write for discovery.
Board: Suggested board name
Hashtags: 5 hashtags

EMAIL (subject + preview pair):
Subject: compelling email subject line (50 chars max)
Preview: the email preview text (90 chars max, completes the subject)

TWITTER (punchy tweet):
Single tweet under 240 chars. Specific, makes people feel called out, ends with hook.

Return as JSON array:
[
  {"text": "HOOK: ...\nPROBLEM: ...\nCTA: ...", "platform": "tiktok", "emotionType": "fear|curiosity|urgency|transformation|mistake"},
  {"text": "HOOK: ...\nPROBLEM: ...\nCTA: ...", "platform": "tiktok", "emotionType": "..."},
  {"text": "[first line]\n[lines 2-5]\n[CTA]\n#tag1 #tag2 #tag3 #tag4 #tag5", "platform": "instagram", "emotionType": "..."},
  {"text": "[first line]\n[lines 2-5]\n[CTA]\n#tag1 #tag2 #tag3 #tag4 #tag5", "platform": "instagram", "emotionType": "..."},
  {"text": "TITLE: ...\nDESCRIPTION: ...\nBOARD: ...\nHASHTAGS: ...", "platform": "pinterest", "emotionType": "..."},
  {"text": "TITLE: ...\nDESCRIPTION: ...\nBOARD: ...\nHASHTAGS: ...", "platform": "pinterest", "emotionType": "..."},
  {"text": "SUBJECT: ...\nPREVIEW: ...", "platform": "email", "emotionType": "..."},
  {"text": "SUBJECT: ...\nPREVIEW: ...", "platform": "email", "emotionType": "..."},
  {"text": "...", "platform": "twitter", "emotionType": "..."},
  {"text": "...", "platform": "twitter", "emotionType": "..."}
]`
        }],
      }),
    ]);

    pdfContent = pdfRes.choices[0].message.content ?? "";
    salesPageCopy = salesRes.choices[0].message.content ?? "";
    seoPageContent = seoRes.choices[0].message.content ?? "";
    try {
      const raw = hooksRes.choices[0].message.content ?? "[]";
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
      generatedHooks.push(...parsed);
    } catch { /* use empty hooks */ }

  } else {
    pdfContent = `# ${opportunity.keyword}\n\n## The Complete Guide\n\n${questions.map((q, i) => `## ${i + 1}. ${q}\n\n- Key point 1\n- Key point 2\n- Key point 3\n`).join("\n")}\n\n## Your 5-Step Action Plan\n\n${questions.slice(0, 5).map((q, i) => `${i + 1}. ${q}`).join("\n")}`;
    salesPageCopy = JSON.stringify({
      heroTagline: `Still searching for answers about ${opportunity.keyword}? You're not alone — and you don't have to figure this out alone.`,
      bulletedPain: questions.map(q => `If you've been wondering: "${q}"...`),
      whatsInside: questions.map((q, i) => ({ chapter: `Chapter ${i + 1}`, title: q, description: `Clear, direct answer to ${q} — so you can stop guessing and start acting.` })),
      faqItems: [
        { q: "Will this work for my specific situation?", a: "Yes — every chapter addresses a real search question people in your situation are typing into Google right now. If you found this page, the guide is for you." },
        { q: "What format does it come in?", a: "PDF. Works on phone, tablet, laptop, and can be printed. You get it instantly after purchase." },
        { q: "What if it doesn't solve my problem?", a: "30-day full refund. No questions, no forms, just email us." },
        { q: "How is this different from free info online?", a: "Free info is scattered, incomplete, and often contradictory. This guide gives you one clear, tested answer in one place — no more tab-hopping." },
      ],
      urgencyLine: "Introductory price — goes up when we hit 500 copies sold.",
    });
    seoPageContent = `# ${opportunity.keyword}\n\n${questions.map(q => `## ${q}\n\nClear, direct answer to ${q}.\n`).join("\n")}`;
    generatedHooks.push(
      { text: `HOOK: Did you know most people get ${opportunity.keyword} completely wrong?\nPROBLEM: You've been searching for answers but everything you try doesn't work.\nCTA: Download the free guide in bio`, platform: "tiktok", emotionType: "curiosity" },
      { text: `HOOK: This changed everything for me about ${opportunity.keyword}\nPROBLEM: I was stuck for months until I found this out.\nCTA: Download the free guide in bio`, platform: "tiktok", emotionType: "transformation" },
      { text: `Nobody tells you this about ${opportunity.keyword}…\n\nI spent months trying everything.\nNothing worked until I found this.\nNow I'm sharing it with you for free.\nLink in bio to get the full guide\n#${opportunity.niche.replace(/\s/g, "")} #howto #guide #tips #freeguide`, platform: "instagram", emotionType: "transformation" },
      { text: `Stop scrolling — if you're struggling with ${opportunity.keyword} you need to see this\n\nMost people make the same 3 mistakes.\nI made them all too.\nHere's what actually works.\nLink in bio to get the full guide\n#${opportunity.niche.replace(/\s/g, "")} #tips #help #guide #free`, platform: "instagram", emotionType: "mistake" },
      { text: `TITLE: ${opportunity.keyword} — Complete Guide\nDESCRIPTION: Everything you need to know about ${opportunity.keyword}. This step-by-step guide covers ${questions.slice(0, 2).join(" and ")}. Whether you're a beginner or have been struggling for a while, this guide gives you the exact answers you need. Save this pin and download the free guide.\nBOARD: ${opportunity.niche} Tips\nHASHTAGS: #${opportunity.niche.replace(/[\s&]/g, "")} #howto #guide #tips #freeguide`, platform: "pinterest", emotionType: "curiosity" },
      { text: `TITLE: How to Solve ${opportunity.keyword} — Step by Step\nDESCRIPTION: Struggling with ${opportunity.keyword}? You're not alone. Thousands of people search for this every day. This complete guide answers ${questions.slice(0, 3).join(", ")}. Download free and start getting results today.\nBOARD: ${opportunity.niche} Resources\nHASHTAGS: #${opportunity.niche.replace(/[\s&]/g, "")} #stepbystep #download #free #guide`, platform: "pinterest", emotionType: "desire" },
      { text: `SUBJECT: The ${opportunity.keyword} mistake you're probably making\nPREVIEW: Most people never figure this out. Here's what actually works (free guide inside)`, platform: "email", emotionType: "fear" },
      { text: `SUBJECT: Free guide: ${opportunity.keyword.slice(0, 40)}\nPREVIEW: Download it now — covers everything you need step by step, no fluff`, platform: "email", emotionType: "desire" },
      { text: `Most people searching "${opportunity.keyword}" never get the answer they need because they're looking in the wrong places. Here's what actually works 🧵`, platform: "twitter", emotionType: "mistake" },
      { text: `The real reason you're struggling with ${opportunity.keyword}: you don't have a clear step-by-step system. Once you do, everything changes.`, platform: "twitter", emotionType: "transformation" },
    );
  }

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

  console.log("[/api/factory] Product created:", product.id, "slug:", slug);
  return NextResponse.json({ product, hooks: generatedHooks });
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: { opportunity: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}
