import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import EmailCapture from "./email-capture";

type Props = { params: Promise<{ slug: string }> };

const BJ_NICHES = new Set(["grief","doubt","shame","loneliness","fear","exhaustion","faith","healing","identity"]);

const getProduct = cache(async (slug: string) => {
  return prisma.product.findFirst({
    where: { slug },
    include: { opportunity: true },
  });
});

const BASE = "https://pdfseeds.com";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Guide Not Found" };

  const isBJ       = BJ_NICHES.has(product.opportunity?.niche ?? "");
  const keyword    = product.opportunity?.keyword ?? product.title;
  const painPoint  = product.opportunity?.painPoint ?? "";
  const year       = new Date().getFullYear();
  const siteName   = isBJ ? "Brother Jimi" : "PDF Seeds";
  const title      = isBJ
    ? `${product.title} — A Pastoral Reflection`
    : `${product.title} — Complete Step-by-Step Guide ${year}`;
  const description = isBJ
    ? (painPoint ? `${painPoint.slice(0, 140).trim()}. A pastoral reflection guide — receive it today.` : `A pastoral word for ${keyword}.`)
    : (painPoint ? `${painPoint.slice(0, 140).trim()}. Download the complete PDF guide — instant access.` : `Complete guide to ${keyword}. Everything you need, step by step.`);
  const canonical  = `${BASE}/guide/${slug}`;

  return {
    title,
    description,
    keywords: isBJ
      ? `${keyword}, pastoral reflection, Brother Jimi, ${keyword} guidance, faith, devotional`
      : `${keyword}, ${keyword} guide, how to ${keyword}, ${keyword} PDF, ${keyword} step by step`,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      siteName,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^([^<\n].+)$/gm, (line) => line.startsWith("<") ? line : `<p>${line}</p>`)
    .replace(/<p><\/p>/g, "");
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;

  // getProduct is cached — this call is deduplicated with generateMetadata's call
  const product = await getProduct(slug);
  if (!product) notFound();

  const { opportunity } = product;

  const currency = opportunity?.isDiaspora ? "£"
    : opportunity?.country === "GH" ? "₵"
    : opportunity?.country === "NG" ? "₦"
    : opportunity?.country === "KE" ? "KSh"
    : opportunity?.country === "ZA" ? "R"
    : opportunity?.country === "GB" ? "£"
    : opportunity?.country === "CA" ? "CA$"
    : opportunity?.country === "AU" ? "A$"
    : "$";

  const price = opportunity ? `${opportunity.minPrice.toFixed(2)}` : "9.99";
  const related = await prisma.product.findMany({
    where: {
      published: true,
      id: { not: product.id },
      opportunity: {
        OR: [
          { niche: opportunity?.niche },
          { country: opportunity?.country },
        ],
      },
    },
    include: { opportunity: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const isBJ       = BJ_NICHES.has(opportunity?.niche ?? "");
  const accent     = isBJ ? "#D4A243" : "#6366F1";
  const accentHover = isBJ ? "#B88830" : "#4F46E5";

  const seoHtml    = renderMarkdown(product.seoPageContent);
  const keyword    = opportunity?.keyword ?? product.title;
  const painPoint  = opportunity?.painPoint ?? "";
  const year       = new Date().getFullYear();
  const canonical  = `${BASE}/guide/${slug}`;
  const title      = isBJ
    ? `${product.title} — A Pastoral Reflection`
    : `${product.title} — Complete Step-by-Step Guide ${year}`;
  const description = painPoint
    ? `${painPoint.slice(0, 140).trim()}. ${isBJ ? "A pastoral reflection guide — receive it today." : "Download the complete PDF guide — instant access."}`
    : (isBJ ? `A pastoral word for ${keyword}.` : `Complete guide to ${keyword}. Everything you need, step by step.`);

  const questions: string[] = (() => {
    try { return JSON.parse(opportunity?.exactQuestions ?? "[]"); } catch { return []; }
  })();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": canonical,
    "datePublished": product.createdAt,
    "dateModified": product.createdAt,
    "author": { "@type": "Organization", "name": "PDF Seeds", "url": BASE },
    "publisher": { "@type": "Organization", "name": "PDF Seeds", "url": BASE },
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonical },
  };

  const faqSchema = questions.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map((q) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `This is covered in full in our guide: ${product.title}. Download the complete PDF for the step-by-step answer.`,
      },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <style>{`
        body { margin: 0; font-family: ${isBJ ? "Georgia, 'Times New Roman', serif" : "system-ui, sans-serif"}; background: #0f0f11; color: #e2e8f0; }
        .guide-wrap { max-width: 720px; margin: 0 auto; padding: 40px 24px 80px; }
        .guide-wrap h1 { font-size: ${isBJ ? "1.75rem" : "2rem"}; font-weight: ${isBJ ? "600" : "800"}; line-height: 1.25; color: #f8fafc; margin: 0 0 16px; font-style: ${isBJ ? "italic" : "normal"}; }
        .guide-wrap h2 { font-size: 1.2rem; font-weight: ${isBJ ? "500" : "700"}; color: #f1f5f9; margin: 32px 0 10px; font-style: ${isBJ ? "italic" : "normal"}; }
        .guide-wrap h3 { font-size: 1rem; font-weight: 600; color: #cbd5e1; margin: 20px 0 8px; }
        .guide-wrap p { line-height: ${isBJ ? "1.9" : "1.75"}; color: #94a3b8; margin: 0 0 ${isBJ ? "20px" : "14px"}; font-style: ${isBJ ? "italic" : "normal"}; }
        .guide-wrap ul { padding-left: 20px; margin: 0 0 14px; }
        .guide-wrap li { line-height: 1.75; color: #94a3b8; margin-bottom: 4px; }
        .pain-banner { background: ${isBJ ? "#D4A24308" : "#EF444410"}; border-left: 3px solid ${isBJ ? "#D4A243" : "#EF4444"}; border-radius: 0 10px 10px 0; padding: 14px 18px; margin: 0 0 28px; color: ${isBJ ? "#D4A574" : "#fca5a5"}; font-size: 0.95rem; line-height: 1.75; font-style: italic; }
        .cta-box { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid ${isBJ ? "#D4A24330" : "#334155"}; border-radius: 16px; padding: 36px 32px; text-align: center; margin: 40px 0; }
        .cta-box .cta-title { font-size: ${isBJ ? "1.3rem" : "1.5rem"}; font-weight: ${isBJ ? "500" : "800"}; color: #f8fafc; margin: 0 0 8px; font-style: ${isBJ ? "italic" : "normal"}; }
        .cta-box .cta-sub { color: #94a3b8; font-size: 0.9rem; margin: 0 0 24px; font-style: ${isBJ ? "italic" : "normal"}; }
        .cta-box .cta-price { font-size: 2rem; font-weight: 900; color: ${accent}; margin: 0 0 20px; }
        .cta-btn { display: inline-block; background: ${accent}; color: #fff; font-weight: ${isBJ ? "500" : "800"}; font-size: 1rem; padding: 16px 40px; border-radius: 10px; text-decoration: none; letter-spacing: ${isBJ ? "0.03em" : "0.5px"}; }
        .cta-btn:hover { background: ${accentHover}; }
        .guarantee { margin-top: 14px; font-size: 0.8rem; color: #64748b; font-style: ${isBJ ? "italic" : "normal"}; }
        .breadcrumb { font-size: 0.8rem; color: #64748b; margin-bottom: 24px; }
        .breadcrumb a { color: ${accent}; text-decoration: none; }
        .badge { display: inline-block; background: ${accent}20; color: ${accent}; border: 1px solid ${accent}30; border-radius: 6px; padding: 4px 12px; font-size: 0.75rem; font-weight: ${isBJ ? "400" : "600"}; margin-bottom: 16px; font-style: ${isBJ ? "italic" : "normal"}; }
        .upsell-section { margin: 48px 0 0; border-top: 1px solid #1e293b; padding-top: 32px; }
        .upsell-label { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; margin-bottom: 14px; }
        .upsell-card { display: flex; align-items: center; gap: 14px; background: #0f1117; border: 1px solid #1e293b; border-radius: 12px; padding: 14px 18px; margin-bottom: 10px; text-decoration: none; transition: border-color 0.15s; }
        .upsell-card:hover { border-color: #6366F1; }
        .upsell-icon { font-size: 1.4rem; flex-shrink: 0; }
        .upsell-body { flex: 1; min-width: 0; }
        .upsell-title { font-size: 0.88rem; font-weight: 600; color: #e2e8f0; margin-bottom: 2px; }
        .upsell-niche { font-size: 0.72rem; color: #475569; text-transform: uppercase; }
        .upsell-price { font-size: 0.95rem; font-weight: 800; color: #10B981; flex-shrink: 0; }

        @media (max-width: 600px) {
          .guide-wrap { padding: 24px 16px 60px; }
          .guide-wrap h1 { font-size: 1.45rem; }
          .guide-wrap h2 { font-size: 1.05rem; }
          .cta-box { padding: 24px 18px; }
          .cta-box .cta-price { font-size: 1.6rem; }
          .cta-btn { display: block; text-align: center; padding: 14px 20px; }
          .upsell-card { flex-wrap: wrap; }
        }
      `}</style>

      <div className="guide-wrap">
        <div className="breadcrumb">
          <a href={isBJ ? "/store#brotherjimi" : "/store"}>{isBJ ? "All Words" : "All Guides"}</a> / {product.title}
        </div>
        <span className="badge">{isBJ ? "✦ Free Reflection" : "📖 Free Guide"}</span>

        {painPoint && (
          <div className="pain-banner">"{painPoint}"</div>
        )}

        <div dangerouslySetInnerHTML={{ __html: seoHtml }} />

        {/* Email capture — convert readers who aren't ready to buy today */}
        <EmailCapture slug={slug} country={opportunity?.country ?? "US"} />

        <div className="cta-box">
          <div className="cta-title">{isBJ ? "Receive the complete word" : "Get the Complete PDF Guide"}</div>
          <div className="cta-sub">{isBJ ? "Yours to keep and return to — read on any device" : "Everything in one place — downloadable, printable, read on any device"}</div>
          <div className="cta-price">{currency}{price}</div>
          <a href={`/sell/${slug}`} className="cta-btn">
            {isBJ ? "✦ RECEIVE THIS WORD" : "📥 GET INSTANT ACCESS NOW"}
          </a>
          <div className="guarantee">{isBJ ? "If it doesn't reach you — return it in 30 days. No question asked." : "✅ Instant download · 30-day money-back guarantee · No questions asked"}</div>
        </div>

        {related.length > 0 && (
          <div className="upsell-section">
            <div className="upsell-label">People who read this also needed</div>
            {related.map((r) => {
              const sym = r.opportunity.isDiaspora ? "£"
                : r.opportunity.country === "GH" ? "₵"
                : r.opportunity.country === "NG" ? "₦"
                : r.opportunity.country === "KE" ? "KSh"
                : r.opportunity.country === "ZA" ? "R" : "$";
              const emoji = r.opportunity.niche === "finance" ? "💰"
                : r.opportunity.niche === "education" ? "📚"
                : r.opportunity.niche === "health" ? "🏥"
                : r.opportunity.niche === "farming" ? "🌱"
                : r.opportunity.niche === "business" ? "🏢" : "📄";
              return (
                <a key={r.id} href={`/sell/${r.slug}`} className="upsell-card">
                  <span className="upsell-icon">{emoji}</span>
                  <div className="upsell-body">
                    <div className="upsell-title">{r.title}</div>
                    <div className="upsell-niche">{r.opportunity.niche}</div>
                  </div>
                  <span className="upsell-price">{sym}{r.opportunity.minPrice.toFixed(2)}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
