import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EmailCapture from "./email-capture";

type Props = { params: Promise<{ slug: string }> };

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
  return {
    title: product.title,
    description: `Free guide: ${product.title}. Download the complete step-by-step PDF guide.`,
    openGraph: {
      title: product.title,
      description: `Free guide: ${product.title}. Download the complete step-by-step PDF guide.`,
      type: "article",
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
  const painPoint = opportunity?.painPoint ?? "";

  // Related guides — same niche or same country, different product
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

  const seoHtml = renderMarkdown(product.seoPageContent);

  return (
    <>
      <style>{`
        body { margin: 0; font-family: system-ui, sans-serif; background: #0f0f11; color: #e2e8f0; }
        .guide-wrap { max-width: 720px; margin: 0 auto; padding: 40px 24px 80px; }
        .guide-wrap h1 { font-size: 2rem; font-weight: 800; line-height: 1.2; color: #f8fafc; margin: 0 0 16px; }
        .guide-wrap h2 { font-size: 1.25rem; font-weight: 700; color: #f1f5f9; margin: 28px 0 10px; }
        .guide-wrap h3 { font-size: 1rem; font-weight: 600; color: #cbd5e1; margin: 20px 0 8px; }
        .guide-wrap p { line-height: 1.75; color: #94a3b8; margin: 0 0 14px; }
        .guide-wrap ul { padding-left: 20px; margin: 0 0 14px; }
        .guide-wrap li { line-height: 1.75; color: #94a3b8; margin-bottom: 4px; }
        .pain-banner { background: #EF444410; border-left: 3px solid #EF4444; border-radius: 0 10px 10px 0; padding: 14px 18px; margin: 0 0 28px; color: #fca5a5; font-size: 0.95rem; line-height: 1.65; font-style: italic; }
        .cta-box { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid #334155; border-radius: 16px; padding: 36px 32px; text-align: center; margin: 40px 0; }
        .cta-box .cta-title { font-size: 1.5rem; font-weight: 800; color: #f8fafc; margin: 0 0 8px; }
        .cta-box .cta-sub { color: #94a3b8; font-size: 0.95rem; margin: 0 0 24px; }
        .cta-box .cta-price { font-size: 2rem; font-weight: 900; color: #10B981; margin: 0 0 20px; }
        .cta-btn { display: inline-block; background: #6366F1; color: #fff; font-weight: 800; font-size: 1rem; padding: 16px 40px; border-radius: 10px; text-decoration: none; letter-spacing: 0.5px; }
        .cta-btn:hover { background: #4F46E5; }
        .guarantee { margin-top: 14px; font-size: 0.8rem; color: #64748b; }
        .breadcrumb { font-size: 0.8rem; color: #64748b; margin-bottom: 24px; }
        .breadcrumb a { color: #6366F1; text-decoration: none; }
        .badge { display: inline-block; background: #6366F120; color: #818CF8; border: 1px solid #6366F130; border-radius: 6px; padding: 4px 12px; font-size: 0.75rem; font-weight: 600; margin-bottom: 16px; }
        .upsell-section { margin: 48px 0 0; border-top: 1px solid #1e293b; padding-top: 32px; }
        .upsell-label { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; margin-bottom: 14px; }
        .upsell-card { display: flex; align-items: center; gap: 14px; background: #0f1117; border: 1px solid #1e293b; border-radius: 12px; padding: 14px 18px; margin-bottom: 10px; text-decoration: none; transition: border-color 0.15s; }
        .upsell-card:hover { border-color: #6366F1; }
        .upsell-icon { font-size: 1.4rem; flex-shrink: 0; }
        .upsell-body { flex: 1; min-width: 0; }
        .upsell-title { font-size: 0.88rem; font-weight: 600; color: #e2e8f0; margin-bottom: 2px; }
        .upsell-niche { font-size: 0.72rem; color: #475569; text-transform: uppercase; }
        .upsell-price { font-size: 0.95rem; font-weight: 800; color: #10B981; flex-shrink: 0; }
      `}</style>

      <div className="guide-wrap">
        <div className="breadcrumb">
          <a href="/store">All Guides</a> / {product.title}
        </div>
        <span className="badge">📖 Free Guide</span>

        {painPoint && (
          <div className="pain-banner">"{painPoint}"</div>
        )}

        <div dangerouslySetInnerHTML={{ __html: seoHtml }} />

        {/* Email capture — convert readers who aren't ready to buy today */}
        <EmailCapture slug={slug} country={opportunity?.country ?? "US"} />

        <div className="cta-box">
          <div className="cta-title">Get the Complete PDF Guide</div>
          <div className="cta-sub">Everything in one place — downloadable, printable, read on any device</div>
          <div className="cta-price">{currency}{price}</div>
          <a href={`/sell/${slug}`} className="cta-btn">
            📥 GET INSTANT ACCESS NOW
          </a>
          <div className="guarantee">✅ Instant download &nbsp;|&nbsp; 30-day money-back guarantee &nbsp;|&nbsp; No questions asked</div>
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
