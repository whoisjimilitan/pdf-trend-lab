import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

type SalesData = {
  heroTagline: string;
  bulletedPain: string[];
  whatsInside: { chapter: string; title: string; description: string }[];
  faqItems: { q: string; a: string }[];
  urgencyLine: string;
};

const BJ_NICHES = new Set(["grief","doubt","shame","loneliness","fear","exhaustion","faith","healing","identity"]);

function parseSalesData(raw: string): SalesData | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]) as Partial<SalesData>;
    if (!parsed.heroTagline) return null;
    return parsed as SalesData;
  } catch {
    return null;
  }
}

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug },
    include: { opportunity: true },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Guide Not Found" };
  const isBJ = BJ_NICHES.has(product.opportunity?.niche ?? "");
  const sd = parseSalesData(product.salesPageCopy);
  const siteName = isBJ ? "Brother Jimi" : "PDF Seeds";
  const desc = sd?.heroTagline ?? (isBJ
    ? `A pastoral reflection guide — ${product.title}. Instant access.`
    : `Download the complete ${product.title} PDF guide. Instant access.`);
  return {
    title: `${product.title} — ${isBJ ? "Receive the Word" : "Get Instant Access"}`,
    description: desc,
    openGraph: { title: product.title, description: desc, type: "website", siteName },
  };
}

export default async function SellPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const { opportunity } = product;
  const isBJ = BJ_NICHES.has(opportunity?.niche ?? "");
  const sd = parseSalesData(product.salesPageCopy);
  const painPoint = opportunity?.painPoint ?? "";

  // ── Brand tokens ──────────────────────────────────────────────────────────
  const accent      = isBJ ? "#D4A243" : "#6366F1";
  const accentHover = isBJ ? "#B88830" : "#4F46E5";
  const accentDim   = isBJ ? "#D4A24318" : "#6366F115";
  const accentBdr   = isBJ ? "#D4A24335" : "#6366F130";
  const painDot     = isBJ ? "#D4A243" : "#EF4444";
  const painBg      = isBJ ? "#D4A24308" : "#EF444408";
  const painBdr     = isBJ ? "#D4A24320" : "#EF444420";
  const painText    = isBJ ? "#D4A574" : "#FCA5A5";

  const brandName   = isBJ ? "✦ Brother Jimi" : "🌱 PDF Seeds";
  const storeHref   = isBJ ? "/store#brotherjimi" : "/store";

  // ── Price ─────────────────────────────────────────────────────────────────
  const currency = (() => {
    if (opportunity?.isDiaspora) return "£";
    const c = opportunity?.country ?? "GB";
    if (c === "GH") return "₵";
    if (c === "NG") return "₦";
    if (c === "KE") return "KSh";
    if (c === "ZA") return "R";
    if (c === "CA") return "CA$";
    if (c === "AU") return "A$";
    return "£";
  })();

  const priceNum  = opportunity?.minPrice ?? (isBJ ? 7 : 9.99);
  const price     = `${currency}${priceNum.toFixed(2)}`;
  const buyUrl    = product.gumroadUrl || `/guide/${slug}`;

  // ── JSON-LD ────────────────────────────────────────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": sd?.heroTagline ?? painPoint,
    "brand": { "@type": "Brand", "name": isBJ ? "Brother Jimi" : "PDF Seeds" },
    "offers": {
      "@type": "Offer",
      "price": priceNum.toFixed(2),
      "priceCurrency": currency === "£" ? "GBP" : currency === "₵" ? "GHS" : currency === "₦" ? "NGN" : currency === "KSh" ? "KES" : "GBP",
      "availability": "https://schema.org/InStock",
      "url": `https://pdfseeds.com/sell/${slug}`,
    },
  };

  // ── Psychology copy variants ──────────────────────────────────────────────

  // PERMISSION SLIP — removes guilt/blame before asking for money (Kennedy #1)
  const permissionSlip = isBJ
    ? "You haven't been failing at faith. You've been carrying something real — without a word for it, without anyone who named it clearly enough for you to set it down."
    : `You're not stuck because you're not capable. You're stuck because the real answer is buried across dozens of browser tabs, half-finished forum threads, and people who gave you different advice. That's not a you problem. That's an information problem.`;

  // FEAR ESCALATOR — cost of inaction (Kennedy #3)
  const fearTitle = isBJ ? "What staying here costs you" : "The real cost of not having this";
  const fearBody = isBJ
    ? "The weight doesn't go away on its own. It either finds a word — or it compounds. Every week you carry it unnamed is a week it gets heavier. Not because you're weak. Because weight needs to be named before it can be set down."
    : `Every week without this answer costs you something. Time spent re-searching the same questions. Decisions made with incomplete information. Mistakes you couldn't have known to avoid. The guide doesn't cost ${price}. Staying without it costs far more.`;

  // TRANSFORMATION — before/after (who they become)
  const transformTitle = isBJ ? "Where this takes you" : "Before and after this guide";
  const beforeState = isBJ
    ? "You arrive carrying something you haven't been able to name. It's heavier than it looks. You've tried talking about it. You've tried praying through it. But it's still there."
    : "You're spending hours searching for the same answer in different places. Getting contradictory advice. Afraid to make the wrong move. Wondering if you're missing something obvious.";
  const afterState = isBJ
    ? "You leave with a word for it. Not a fix — a word. And when you can name what you're carrying, you can finally begin to set it down."
    : "You have the complete map. Every step in order. The right fees, the right forms, the right sequence. You stop searching. You start doing.";

  // PRICE ANCHOR — what they'd pay for the same value elsewhere
  const priceAnchor = isBJ
    ? `A single pastoral counselling session costs £60–£120 — and you may leave without a word for what you walked in with. This guide gives you that word, written specifically for what you're carrying. Yours to return to whenever you need it. For ${price}.`
    : `A consultant would charge you £150–£300 for advice this specific. A professional — more. This guide gives you the same clarity, in structured steps, instantly. For ${price}.`;

  // IMPLIED SOCIAL PROOF — no fake reviews, just implication (Makepeace)
  const socialProof = isBJ
    ? "People who received this word weren't at the end of their rope. They were faithful people — people who already prayed, already tried — who simply needed someone to name what they were carrying."
    : "People who found this guide were already doing the hard work. Asking the right questions. Trying the right things. They just needed the right map. That's you.";

  // ESTEEM REFRAME — you deserve clarity (Kennedy #2)
  const esteemLine = isBJ
    ? "You deserve to carry this with a word for it."
    : "You deserve an answer that's actually complete.";

  const heroCtaText  = isBJ ? `Receive this word — ${price}` : `Get Instant Access — ${price}`;
  const finalCtaText = isBJ ? `✦ RECEIVE THIS GUIDE` : `📥 GET INSTANT ACCESS NOW`;
  const insideTitle  = isBJ ? "What shifts in you" : "What's inside";
  const priceNote    = isBJ ? "Appreciation-based · Yours to keep and return to" : "One-time payment · No subscription · Instant download";
  const guarantee    = isBJ
    ? "If it doesn't reach you — return it in 30 days. No question asked. Not because you have to prove it didn't work. Because that's what this should feel like."
    : "30-day 100% money-back guarantee. If this doesn't give you the clarity you came for — full refund. No forms. No questions. No arguments.";

  const trustPills = isBJ
    ? ["📖 Pastoral reflection guide", "🕊️ Yours to return to whenever you need it", "✦ Written for this exact moment", "🔒 30-day full return"]
    : ["📥 Instant Download", "📱 Read on Any Device", "🔒 30-Day Money-Back", "⚡ Complete & Specific"];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <style>{`
        * { box-sizing: border-box; }

        .sp { background: #08090D; color: #E2E8F0; font-family: ${isBJ ? "'Georgia', 'Times New Roman', serif" : "system-ui, -apple-system, sans-serif"}; min-height: 100vh; }

        /* NAV */
        .sp-nav { background: #0D0E17; border-bottom: 1px solid #1F2333; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
        .sp-nav-brand { font-weight: ${isBJ ? "400" : "800"}; font-size: 0.9rem; color: #E2E8F0; letter-spacing: ${isBJ ? "0.06em" : "0"}; font-style: ${isBJ ? "italic" : "normal"}; }
        .sp-nav-cta { background: ${accent}; color: #fff; font-weight: 700; font-size: 0.8rem; padding: 8px 20px; border-radius: 8px; text-decoration: none; transition: background 0.15s; }
        .sp-nav-cta:hover { background: ${accentHover}; }

        /* HERO */
        .sp-hero { max-width: 700px; margin: 0 auto; padding: 64px 24px 48px; text-align: center; }
        .pain-hook { background: ${painBg}; border: 1px solid ${painBdr}; border-radius: 12px; padding: 16px 22px; margin-bottom: 24px; color: ${painText}; font-size: 0.95rem; line-height: 1.8; font-style: italic; }

        /* PERMISSION SLIP — guilt release before the ask */
        .permission-slip { max-width: 600px; margin: 0 auto 28px; padding: 18px 24px; background: ${accent}08; border-left: 3px solid ${accent}60; border-radius: 0 10px 10px 0; font-size: 0.92rem; color: #94A3B8; line-height: 1.8; font-style: ${isBJ ? "italic" : "normal"}; text-align: left; }

        .hero-tagline { font-size: 1.05rem; color: ${accent}; font-weight: 600; margin-bottom: 16px; line-height: 1.6; font-style: ${isBJ ? "italic" : "normal"}; }
        .sp-hero h1 { font-size: clamp(1.8rem, 5vw, 2.6rem); font-weight: ${isBJ ? "700" : "900"}; line-height: 1.2; color: #F8FAFC; margin: 0 0 24px; letter-spacing: ${isBJ ? "-0.01em" : "0"}; }
        .trust-pills { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 32px; }
        .trust-pill { background: #1F2333; border: 1px solid #2A3050; border-radius: 20px; padding: 6px 14px; font-size: 0.78rem; color: #94A3B8; font-style: ${isBJ ? "italic" : "normal"}; }
        .hero-cta-btn { display: inline-block; background: ${accent}; color: #fff; font-weight: ${isBJ ? "500" : "800"}; font-size: 1.05rem; padding: 18px 48px; border-radius: 12px; text-decoration: none; letter-spacing: ${isBJ ? "0.02em" : "0.3px"}; transition: background 0.15s; }
        .hero-cta-btn:hover { background: ${accentHover}; }
        .urgency-line { margin-top: 16px; font-size: 0.85rem; color: ${isBJ ? "#D4A243" : "#F59E0B"}; font-weight: 500; font-style: ${isBJ ? "italic" : "normal"}; }

        /* ESTEEM STRIP */
        .esteem-strip { background: ${accent}10; border-top: 1px solid ${accent}20; border-bottom: 1px solid ${accent}20; padding: 14px 24px; text-align: center; font-size: 0.88rem; color: ${accent}; font-weight: 600; letter-spacing: 0.02em; font-style: ${isBJ ? "italic" : "normal"}; }

        /* SECTIONS */
        .sp-section { max-width: 700px; margin: 0 auto; padding: 56px 24px; }
        .sp-section-dark { background: #0D0E17; }
        .section-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #475569; margin-bottom: 20px; }
        .section-title { font-size: 1.4rem; font-weight: ${isBJ ? "600" : "800"}; color: #F1F5F9; margin-bottom: 16px; line-height: 1.35; font-style: ${isBJ ? "italic" : "normal"}; }
        .section-body { font-size: 0.95rem; color: #64748B; line-height: 1.8; font-style: ${isBJ ? "italic" : "normal"}; }

        /* PAIN BULLETS */
        .pain-bullet { display: flex; align-items: flex-start; gap: 14px; padding: 16px 0; border-bottom: 1px solid #1F2333; }
        .pain-bullet:last-child { border-bottom: none; }
        .pain-marker { width: ${isBJ ? "6px" : "8px"}; height: ${isBJ ? "6px" : "8px"}; border-radius: 50%; background: ${painDot}; flex-shrink: 0; margin-top: 8px; ${isBJ ? "opacity: 0.7;" : ""} }
        .pain-text { font-size: 0.95rem; color: #94A3B8; line-height: 1.7; font-style: ${isBJ ? "italic" : "normal"}; }

        /* FEAR ESCALATOR */
        .fear-box { background: #EF444406; border: 1px solid #EF444418; border-radius: 14px; padding: 28px 28px; }
        .fear-title { font-size: 1rem; font-weight: ${isBJ ? "500" : "700"}; color: #FCA5A5; margin-bottom: 12px; font-style: ${isBJ ? "italic" : "normal"}; }
        .fear-body { font-size: 0.9rem; color: #94A3B8; line-height: 1.8; font-style: ${isBJ ? "italic" : "normal"}; }

        /* TRANSFORMATION — before/after */
        .transform-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 560px) { .transform-grid { grid-template-columns: 1fr; } }
        .transform-card { background: #0F1117; border: 1px solid #1F2333; border-radius: 12px; padding: 22px 20px; }
        .transform-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
        .transform-label-before { color: #EF4444; }
        .transform-label-after { color: #10B981; }
        .transform-text { font-size: 0.88rem; color: #94A3B8; line-height: 1.75; font-style: ${isBJ ? "italic" : "normal"}; }

        /* WHAT'S INSIDE */
        .chapters-wrap { border: 1px solid #1F2333; border-radius: 16px; overflow: hidden; }
        .chapters-head { padding: 12px 18px; border-bottom: 1px solid #1F2333; display: flex; align-items: center; justify-content: space-between; font-size: 0.68rem; font-weight: 700; color: ${accent}; letter-spacing: 0.1em; text-transform: uppercase; background: #0D0E17; }
        .chapters-grid { display: grid; gap: 0; }
        .chapter-card { background: #0F1117; border-bottom: 1px solid #1F2333; padding: 16px 20px; display: flex; align-items: flex-start; gap: 16px; transition: border-color 0.15s; }
        .chapter-card:last-child { border-bottom: none; }
        .chapter-card:hover { background: #111420; }
        .chapter-badge { background: ${accentDim}; color: ${accent}; border: 1px solid ${accentBdr}; border-radius: 8px; padding: 4px 10px; font-size: 0.7rem; font-weight: ${isBJ ? "400" : "700"}; white-space: nowrap; flex-shrink: 0; margin-top: 2px; font-style: ${isBJ ? "italic" : "normal"}; }
        .chapter-title { font-size: 0.9rem; font-weight: ${isBJ ? "500" : "700"}; color: #E2E8F0; margin-bottom: 5px; line-height: 1.4; }
        .chapter-desc { font-size: 0.82rem; color: #64748B; line-height: 1.6; font-style: ${isBJ ? "italic" : "normal"}; }
        /* Locked chapters */
        .chapters-locked { position: relative; }
        .chapters-locked-fade { position: absolute; top: 0; left: 0; right: 0; height: 36px; background: linear-gradient(to bottom, #0F1117, transparent); pointer-events: none; z-index: 1; }
        .chapter-card--locked { opacity: 0.32; user-select: none; }
        .chapter-card--locked .chapter-title { filter: blur(4px); }
        .chapter-card--locked .chapter-desc { display: none; }
        .chapters-lock { padding: 12px 18px; border-top: 1px solid #1F2333; display: flex; align-items: center; justify-content: center; gap: 7px; font-size: 0.75rem; font-weight: 600; color: ${accent}; background: #0D0E17; opacity: 0.8; }

        /* SOCIAL PROOF (implied) */
        .social-proof-box { background: #0F1117; border: 1px solid #1F2333; border-radius: 14px; padding: 24px 26px; }
        .social-proof-text { font-size: 0.95rem; color: #94A3B8; line-height: 1.8; font-style: italic; }
        .social-proof-attr { margin-top: 14px; font-size: 0.78rem; color: #475569; font-style: normal; }

        /* PRICE ANCHOR */
        .anchor-strip { text-align: center; padding: 16px 24px; border-radius: 10px; background: ${accentDim}; border: 1px solid ${accentBdr}; font-size: 0.88rem; color: #94A3B8; line-height: 1.75; font-style: ${isBJ ? "italic" : "normal"}; }
        .anchor-strip strong { color: ${accent}; }

        /* FAQ */
        .faq-wrap { max-width: 640px; margin: 0 auto; }
        details { border-bottom: 1px solid #1F2333; }
        details:last-child { border-bottom: none; }
        summary { list-style: none; display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 0; cursor: pointer; gap: 20px; }
        summary::-webkit-details-marker { display: none; }
        .faq-q { font-size: 0.9rem; font-weight: ${isBJ ? "400" : "600"}; color: #E2E8F0; line-height: 1.55; font-style: ${isBJ ? "italic" : "normal"}; }
        details[open] .faq-q { color: ${accent}; }
        .faq-icon { color: ${accent}; font-size: 1.2rem; flex-shrink: 0; margin-top: 2px; transition: transform 0.2s; }
        details[open] .faq-icon { transform: rotate(45deg); }
        .faq-a { font-size: 0.87rem; color: #64748B; line-height: 1.75; padding-bottom: 20px; font-style: ${isBJ ? "italic" : "normal"}; }

        /* PRICE BOX */
        .price-box { max-width: 560px; margin: 0 auto; background: #0F1117; border: 1px solid ${accentBdr}; border-radius: 20px; padding: 40px 36px; text-align: center; }
        .price-box-title { font-size: 1.2rem; font-weight: ${isBJ ? "500" : "800"}; color: #F1F5F9; margin-bottom: 6px; font-style: ${isBJ ? "italic" : "normal"}; letter-spacing: ${isBJ ? "0.02em" : "0"}; }
        .price-box-sub { font-size: 0.85rem; color: #64748B; margin-bottom: 28px; line-height: 1.6; }
        .price-display { font-size: 3rem; font-weight: 900; color: ${accent}; margin-bottom: 4px; line-height: 1; }
        .price-vs { font-size: 0.75rem; color: #334155; margin-bottom: 24px; }
        .price-note { font-size: 0.78rem; color: #475569; margin-bottom: 28px; font-style: ${isBJ ? "italic" : "normal"}; }
        .price-includes { text-align: left; margin-bottom: 28px; list-style: none; padding: 0; }
        .price-includes li { font-size: 0.85rem; color: #94A3B8; padding: 6px 0; display: flex; align-items: flex-start; gap: 10px; line-height: 1.5; font-style: ${isBJ ? "italic" : "normal"}; }
        .price-includes li::before { content: "${isBJ ? "✦" : "✓"}"; color: ${accent}; font-weight: 800; flex-shrink: 0; margin-top: 1px; }
        .price-cta-btn { display: block; background: ${accent}; color: #fff; font-weight: ${isBJ ? "500" : "800"}; font-size: 1rem; padding: 18px 32px; border-radius: 12px; text-decoration: none; margin-bottom: 14px; letter-spacing: ${isBJ ? "0.04em" : "0"}; transition: background 0.15s; }
        .price-cta-btn:hover { background: ${accentHover}; }

        /* GUARANTEE — strong risk reversal */
        .guarantee-block { margin-top: 20px; padding: 20px; background: #10B98108; border: 1px solid #10B98120; border-radius: 12px; }
        .guarantee-title { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #10B981; margin-bottom: 8px; }
        .guarantee-text { font-size: 0.82rem; color: #64748B; line-height: 1.7; font-style: ${isBJ ? "italic" : "normal"}; }

        /* FOOTER */
        .sp-footer { text-align: center; padding: 32px 24px; border-top: 1px solid #1F2333; font-size: 0.78rem; color: #334155; }
        .sp-footer a { color: ${accent}; text-decoration: none; }
        .sp-footer a:hover { text-decoration: underline; }
      `}</style>

      <div className="sp">

        {/* Sticky nav */}
        <nav className="sp-nav">
          <span className="sp-nav-brand">{brandName}</span>
          <a href="#buy" className="sp-nav-cta">
            {isBJ ? "Receive this word →" : "Get Instant Access →"}
          </a>
        </nav>

        {/* HERO — pain recognition + permission slip */}
        <div className="sp-hero">
          {painPoint && (
            <div className="pain-hook">&ldquo;{painPoint}&rdquo;</div>
          )}

          {/* Permission slip — guilt release (Kennedy #1) */}
          <div className="permission-slip">{permissionSlip}</div>

          {sd?.heroTagline && (
            <div className="hero-tagline">{sd.heroTagline}</div>
          )}
          <h1>{product.title}</h1>

          <div className="trust-pills">
            {trustPills.map((p, i) => (
              <span key={i} className="trust-pill">{p}</span>
            ))}
          </div>

          <a href="#buy" className="hero-cta-btn">{heroCtaText}</a>

          {sd?.urgencyLine && (
            <div className="urgency-line">
              {isBJ ? sd.urgencyLine : `⏳ ${sd.urgencyLine}`}
            </div>
          )}
        </div>

        {/* Esteem strip — you deserve this (Kennedy #2) */}
        <div className="esteem-strip">{esteemLine}</div>

        {/* Pain recognition — they feel seen */}
        {sd?.bulletedPain && sd.bulletedPain.length > 0 && (
          <div className="sp-section-dark">
            <div className="sp-section">
              <div className="section-label">{isBJ ? "What you've been carrying" : "Sound familiar?"}</div>
              <div>
                {sd.bulletedPain.map((line, i) => (
                  <div key={i} className="pain-bullet">
                    <div className="pain-marker" />
                    <div className="pain-text">{line}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fear escalator — cost of inaction (Kennedy #3) */}
        <div className="sp-section">
          <div className="fear-box">
            <div className="fear-title">{fearTitle}</div>
            <div className="fear-body">{fearBody}</div>
          </div>
        </div>

        {/* Transformation — before/after (who they become) */}
        <div className="sp-section-dark">
          <div className="sp-section">
            <div className="section-label">{transformTitle}</div>
            <div className="transform-grid">
              <div className="transform-card">
                <div className="transform-label transform-label-before">Before</div>
                <div className="transform-text">{beforeState}</div>
              </div>
              <div className="transform-card">
                <div className="transform-label transform-label-after">After</div>
                <div className="transform-text">{afterState}</div>
              </div>
            </div>
          </div>
        </div>

        {/* What's inside */}
        {sd?.whatsInside && sd.whatsInside.length > 0 && (
          <div className="sp-section">
            <div className="section-label">{insideTitle}</div>
            <div className="chapters-wrap">
              <div className="chapters-head">
                <span>What&apos;s inside</span>
                <span>{sd.whatsInside.length} chapters</span>
              </div>
              <div className="chapters-grid">
                {/* Visible chapters — first 3 fully revealed */}
                {sd.whatsInside.slice(0, 3).map((ch, i) => (
                  <div key={i} className="chapter-card">
                    <span className="chapter-badge">{ch.chapter}</span>
                    <div>
                      <div className="chapter-title">{ch.title}</div>
                      <div className="chapter-desc">{ch.description}</div>
                    </div>
                  </div>
                ))}
                {/* Locked chapters — blurred to create open loop */}
                {sd.whatsInside.length > 3 && (
                  <div className="chapters-locked">
                    <div className="chapters-locked-fade" />
                    {sd.whatsInside.slice(3).map((ch, i) => (
                      <div key={i} className="chapter-card chapter-card--locked">
                        <span className="chapter-badge">{ch.chapter}</span>
                        <div>
                          <div className="chapter-title">{ch.title}</div>
                        </div>
                      </div>
                    ))}
                    <div className="chapters-lock">
                      🔒 {sd.whatsInside.length - 3} more chapters — unlocked with your guide
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Implied social proof — Makepeace principle */}
        <div className="sp-section-dark">
          <div className="sp-section">
            <div className="section-label">{isBJ ? "Who this is for" : "Who finds this guide"}</div>
            <div className="social-proof-box">
              <div className="social-proof-text">&ldquo;{socialProof}&rdquo;</div>
              <div className="social-proof-attr">— {isBJ ? "Brother Jimi" : "PDF Seeds"}</div>
            </div>
          </div>
        </div>

        {/* Price anchor — compare against alternative cost */}
        <div className="sp-section">
          <div className="anchor-strip">{priceAnchor}</div>
        </div>

        {/* FAQ */}
        {sd?.faqItems && sd.faqItems.length > 0 && (
          <div className="sp-section-dark">
            <div className="sp-section">
              <div className="section-label">{isBJ ? "A few things" : "Questions"}</div>
              <div className="faq-wrap">
                {sd.faqItems.map((item, i) => (
                  <details key={i}>
                    <summary>
                      <span className="faq-q">{item.q}</span>
                      <span className="faq-icon">+</span>
                    </summary>
                    <p className="faq-a">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Final CTA + price box + strong guarantee */}
        <div className="sp-section" id="buy">
          <div className="price-box">
            <div className="price-box-title">
              {isBJ ? "Receive this word" : "Get the Complete Guide"}
            </div>
            <div className="price-box-sub">{product.title}</div>
            <div className="price-display">{price}</div>
            <div className="price-vs">{isBJ ? "appreciation-based" : "one-time · no subscription"}</div>
            <div className="price-note">{priceNote}</div>

            <ul className="price-includes">
              {isBJ ? (
                <>
                  <li>The complete pastoral reflection — yours to keep</li>
                  <li>Read on any device at any hour</li>
                  <li>Return to it whenever the weight returns</li>
                  <li>30-day full return — no question asked</li>
                </>
              ) : (
                <>
                  <li>Complete PDF guide — download immediately</li>
                  <li>Read on any device — phone, tablet, laptop</li>
                  <li>Printable format — works offline</li>
                  <li>Specific to your exact situation</li>
                  <li>30-day money-back guarantee</li>
                </>
              )}
            </ul>

            <a href={buyUrl} className="price-cta-btn">
              {finalCtaText}
            </a>

            {/* Strong risk reversal guarantee */}
            <div className="guarantee-block">
              <div className="guarantee-title">🛡️ {isBJ ? "30-Day Return" : "30-Day Money-Back Guarantee"}</div>
              <div className="guarantee-text">{guarantee}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="sp-footer">
          <p>
            {isBJ ? "Brother Jimi" : "PDF Seeds"}
            {" · "}
            <a href={storeHref}>
              {isBJ ? "Browse all words" : "Browse all guides"}
            </a>
            {" · "}
            <a href={`/guide/${slug}`}>
              {isBJ ? "Read a passage first" : "Free preview"}
            </a>
          </p>
        </footer>

      </div>
    </>
  );
}
