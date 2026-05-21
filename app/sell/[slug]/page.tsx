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
  const sd = parseSalesData(product.salesPageCopy);
  return {
    title: `${product.title} — Get Instant Access`,
    description: sd?.heroTagline ?? `Download the complete ${product.title} PDF guide. Instant access.`,
    openGraph: {
      title: product.title,
      description: sd?.heroTagline ?? `Download the complete ${product.title} PDF guide.`,
      type: "website",
    },
  };
}

export default async function SellPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const { opportunity } = product;
  const sd = parseSalesData(product.salesPageCopy);
  const painPoint = opportunity?.painPoint ?? "";

  const currency = opportunity?.isDiaspora ? "£"
    : opportunity?.country === "GH" ? "₵"
    : opportunity?.country === "NG" ? "₦"
    : opportunity?.country === "KE" ? "KSh"
    : opportunity?.country === "ZA" ? "R"
    : opportunity?.country === "GB" ? "£"
    : opportunity?.country === "CA" ? "CA$"
    : opportunity?.country === "AU" ? "A$"
    : "$";

  const price = opportunity ? `${currency}${opportunity.minPrice.toFixed(2)}` : "$9.99";
  const buyUrl = product.gumroadUrl || `/guide/${slug}`;

  return (
    <>
      <style>{`
        /* Override sidebar layout for this standalone conversion page */
        body > aside { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; }
        body > main { overflow: visible !important; height: auto !important; }

        * { box-sizing: border-box; }
        .sell-page { background: #08090D; color: #E2E8F0; font-family: system-ui, -apple-system, sans-serif; min-height: 100vh; }

        /* NAV */
        .sell-nav { background: #0D0E17; border-bottom: 1px solid #1F2333; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
        .sell-nav-brand { font-weight: 800; font-size: 0.9rem; color: #E2E8F0; }
        .sell-nav-cta { background: #6366F1; color: #fff; font-weight: 700; font-size: 0.8rem; padding: 8px 20px; border-radius: 8px; text-decoration: none; }
        .sell-nav-cta:hover { background: #4F46E5; }

        /* HERO */
        .sell-hero { max-width: 700px; margin: 0 auto; padding: 64px 24px 48px; text-align: center; }
        .pain-hook { background: #EF444408; border: 1px solid #EF444420; border-radius: 12px; padding: 16px 22px; margin-bottom: 32px; color: #FCA5A5; font-size: 0.95rem; line-height: 1.7; font-style: italic; }
        .hero-tagline { font-size: 1.05rem; color: #6366F1; font-weight: 600; margin-bottom: 16px; line-height: 1.5; }
        .sell-hero h1 { font-size: clamp(1.8rem, 5vw, 2.6rem); font-weight: 900; line-height: 1.15; color: #F8FAFC; margin: 0 0 24px; }
        .trust-pills { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 32px; }
        .trust-pill { background: #1F2333; border: 1px solid #2A3050; border-radius: 20px; padding: 6px 14px; font-size: 0.78rem; color: #94A3B8; }
        .hero-cta-btn { display: inline-block; background: #6366F1; color: #fff; font-weight: 800; font-size: 1.1rem; padding: 18px 48px; border-radius: 12px; text-decoration: none; letter-spacing: 0.3px; }
        .hero-cta-btn:hover { background: #4F46E5; }
        .hero-sub { margin-top: 14px; font-size: 0.8rem; color: #475569; }
        .urgency-line { margin-top: 16px; font-size: 0.85rem; color: #F59E0B; font-weight: 600; }

        /* PAIN MIRROR */
        .sell-section { max-width: 700px; margin: 0 auto; padding: 56px 24px; }
        .sell-section-dark { background: #0D0E17; }
        .section-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #475569; margin-bottom: 20px; }
        .section-title { font-size: 1.5rem; font-weight: 800; color: #F1F5F9; margin-bottom: 28px; line-height: 1.3; }
        .pain-bullet { display: flex; align-items: flex-start; gap: 12px; padding: 14px 0; border-bottom: 1px solid #1F2333; }
        .pain-bullet:last-child { border-bottom: none; }
        .pain-dot { width: 8px; height: 8px; border-radius: 50%; background: #EF4444; flex-shrink: 0; margin-top: 7px; }
        .pain-text { font-size: 0.95rem; color: #94A3B8; line-height: 1.65; }

        /* WHAT'S INSIDE */
        .chapters-grid { display: grid; gap: 12px; }
        .chapter-card { background: #0F1117; border: 1px solid #1F2333; border-radius: 12px; padding: 18px 20px; display: flex; align-items: flex-start; gap: 16px; }
        .chapter-badge { background: #6366F115; color: #818CF8; border: 1px solid #6366F130; border-radius: 8px; padding: 4px 10px; font-size: 0.7rem; font-weight: 700; white-space: nowrap; flex-shrink: 0; margin-top: 2px; }
        .chapter-title { font-size: 0.9rem; font-weight: 700; color: #E2E8F0; margin-bottom: 4px; }
        .chapter-desc { font-size: 0.82rem; color: #64748B; line-height: 1.55; }

        /* FAQ */
        .faq-wrap { max-width: 640px; margin: 0 auto; }
        details { border-bottom: 1px solid #1F2333; }
        details:last-child { border-bottom: none; }
        summary { list-style: none; display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 0; cursor: pointer; gap: 20px; }
        summary::-webkit-details-marker { display: none; }
        .faq-q { font-size: 0.9rem; font-weight: 600; color: #E2E8F0; line-height: 1.5; }
        details[open] .faq-q { color: #818CF8; }
        .faq-icon { color: #6366F1; font-size: 1.2rem; flex-shrink: 0; margin-top: 2px; transition: transform 0.2s; }
        details[open] .faq-icon { transform: rotate(45deg); }
        .faq-a { font-size: 0.87rem; color: #64748B; line-height: 1.7; padding-bottom: 20px; }

        /* PRICE BOX */
        .price-box { max-width: 560px; margin: 0 auto; background: #0F1117; border: 1px solid #2A3050; border-radius: 20px; padding: 40px 36px; text-align: center; }
        .price-box-title { font-size: 1.2rem; font-weight: 800; color: #F1F5F9; margin-bottom: 6px; }
        .price-box-sub { font-size: 0.85rem; color: #64748B; margin-bottom: 28px; }
        .price-display { font-size: 3rem; font-weight: 900; color: #10B981; margin-bottom: 8px; line-height: 1; }
        .price-label { font-size: 0.78rem; color: #475569; margin-bottom: 28px; }
        .price-includes { text-align: left; margin-bottom: 28px; }
        .price-includes li { font-size: 0.85rem; color: #94A3B8; padding: 5px 0; list-style: none; display: flex; align-items: center; gap: 8px; }
        .price-includes li::before { content: "✓"; color: #10B981; font-weight: 800; flex-shrink: 0; }
        .price-cta-btn { display: block; background: #6366F1; color: #fff; font-weight: 800; font-size: 1rem; padding: 18px 32px; border-radius: 12px; text-decoration: none; margin-bottom: 14px; }
        .price-cta-btn:hover { background: #4F46E5; }
        .guarantee-line { font-size: 0.78rem; color: #475569; line-height: 1.6; }

        /* FOOTER */
        .sell-footer { text-align: center; padding: 32px 24px; border-top: 1px solid #1F2333; font-size: 0.78rem; color: #334155; }
        .sell-footer a { color: #6366F1; text-decoration: none; }
      `}</style>

      <div className="sell-page">
        {/* Nav */}
        <nav className="sell-nav">
          <span className="sell-nav-brand">📚 PDF Trend Lab</span>
          <a href="#buy" className="sell-nav-cta">Get Instant Access →</a>
        </nav>

        {/* Hero */}
        <div className="sell-hero">
          {painPoint && (
            <div className="pain-hook">"{painPoint}"</div>
          )}
          {sd?.heroTagline && (
            <div className="hero-tagline">{sd.heroTagline}</div>
          )}
          <h1>{product.title}</h1>
          <div className="trust-pills">
            <span className="trust-pill">📥 Instant Download</span>
            <span className="trust-pill">📱 Read on Any Device</span>
            <span className="trust-pill">🔒 30-Day Money-Back</span>
            <span className="trust-pill">⚡ Updated 2026</span>
          </div>
          <a href="#buy" className="hero-cta-btn">Get Instant Access — {price}</a>
          <div className="hero-sub">Instant download after payment · Read on phone, tablet, or laptop</div>
          {sd?.urgencyLine && (
            <div className="urgency-line">⏳ {sd.urgencyLine}</div>
          )}
        </div>

        {/* Pain Mirror */}
        {sd?.bulletedPain && sd.bulletedPain.length > 0 && (
          <div className="sell-section-dark">
            <div className="sell-section">
              <div className="section-label">If this is you</div>
              <div className="section-title">You&apos;ve been searching for this answer for a while now.</div>
              <div>
                {sd.bulletedPain.map((line, i) => (
                  <div key={i} className="pain-bullet">
                    <div className="pain-dot" />
                    <div className="pain-text">{line}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* What's Inside */}
        {sd?.whatsInside && sd.whatsInside.length > 0 && (
          <div className="sell-section">
            <div className="section-label">What&apos;s inside</div>
            <div className="section-title">Everything you need to stop guessing and start acting.</div>
            <div className="chapters-grid">
              {sd.whatsInside.map((ch, i) => (
                <div key={i} className="chapter-card">
                  <span className="chapter-badge">{ch.chapter}</span>
                  <div>
                    <div className="chapter-title">{ch.title}</div>
                    <div className="chapter-desc">{ch.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        {sd?.faqItems && sd.faqItems.length > 0 && (
          <div className="sell-section-dark">
            <div className="sell-section">
              <div className="section-label">Questions</div>
              <div className="section-title">Everything you want to know before buying.</div>
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

        {/* Price + CTA */}
        <div className="sell-section" id="buy">
          <div className="price-box">
            <div className="price-box-title">Get the Complete Guide</div>
            <div className="price-box-sub">{product.title}</div>
            <div className="price-display">{price}</div>
            <div className="price-label">One-time payment · No subscription</div>
            <ul className="price-includes">
              <li>Complete PDF guide — instant download</li>
              <li>Read on any device — phone, tablet, laptop</li>
              <li>Printable format</li>
              <li>Updated for 2026</li>
              <li>30-day money-back guarantee</li>
            </ul>
            <a href={buyUrl} className="price-cta-btn">
              📥 GET INSTANT ACCESS NOW
            </a>
            <div className="guarantee-line">
              ✅ 30-day 100% money-back guarantee &nbsp;·&nbsp; No questions asked &nbsp;·&nbsp; No forms to fill
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="sell-footer">
          <p>PDF Trend Lab · <a href="/store">Browse all guides</a> · <a href={`/guide/${slug}`}>Free preview</a></p>
        </footer>
      </div>
    </>
  );
}
