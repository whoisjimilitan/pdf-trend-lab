import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Guide Store — Instant Downloads",
  description: "Find the guide that answers your exact problem. Instant download, read on any device.",
};

export const dynamic = "force-dynamic";

const CURRENCY: Record<string, string> = {
  GH: "₵", NG: "₦", KE: "KSh", ZA: "R", GB: "£", CA: "CA$", AU: "A$", US: "$",
};

const FLAG: Record<string, string> = {
  GH: "🇬🇭", NG: "🇳🇬", KE: "🇰🇪", ZA: "🇿🇦", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", US: "🇺🇸",
};

const COUNTRY_NAME: Record<string, string> = {
  GH: "Ghana", NG: "Nigeria", KE: "Kenya", ZA: "South Africa",
  GB: "United Kingdom", CA: "Canada", AU: "Australia", US: "United States",
};

export default async function StorePage() {
  const products = await prisma.product.findMany({
    where: { published: true },
    include: { opportunity: true },
    orderBy: { createdAt: "desc" },
  });

  // Group by country, with diaspora as a special group
  const groups: Record<string, typeof products> = {};
  for (const p of products) {
    const key = p.opportunity.isDiaspora
      ? `${p.opportunity.country}_DIASPORA`
      : (p.opportunity.country ?? "US");
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }

  // Sort: diaspora groups first (highest price point), then by product count desc
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const aDiaspora = a.includes("DIASPORA") ? 1 : 0;
    const bDiaspora = b.includes("DIASPORA") ? 1 : 0;
    if (aDiaspora !== bDiaspora) return bDiaspora - aDiaspora;
    return groups[b].length - groups[a].length;
  });

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #08090D; color: #E8EAF0; font-family: system-ui, -apple-system, sans-serif; }
        .store-wrap { max-width: 680px; margin: 0 auto; padding: 40px 20px 80px; }
        .store-hero { text-align: center; margin-bottom: 48px; }
        .store-hero h1 { font-size: 2rem; font-weight: 900; line-height: 1.2; margin-bottom: 12px; }
        .store-hero p { color: #5A6080; font-size: 0.95rem; line-height: 1.6; max-width: 460px; margin: 0 auto; }
        .group-header { display: flex; align-items: center; gap: 10px; padding: 10px 0; margin: 36px 0 16px; border-bottom: 1px solid #1F2333; }
        .group-header .flag { font-size: 1.5rem; }
        .group-header .name { font-size: 1rem; font-weight: 700; color: #E8EAF0; }
        .group-header .count { font-size: 0.75rem; color: #5A6080; margin-left: auto; }
        .diaspora-badge { display: inline-flex; align-items: center; gap: 4px; background: #6366F115; color: #818CF8; border: 1px solid #6366F130; border-radius: 20px; padding: 2px 10px; font-size: 0.7rem; font-weight: 700; }
        .product-card { background: #0F1117; border: 1px solid #1F2333; border-radius: 14px; padding: 20px; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 16px; transition: border-color 0.15s; }
        .product-card:hover { border-color: #6366F1; }
        .product-icon { width: 48px; height: 48px; border-radius: 10px; background: #6366F115; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
        .product-body { flex: 1; min-width: 0; }
        .product-title { font-size: 0.95rem; font-weight: 700; line-height: 1.3; color: #E8EAF0; margin-bottom: 6px; }
        .product-niche { font-size: 0.75rem; color: #5A6080; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
        .product-footer { display: flex; align-items: center; gap: 12px; }
        .product-price { font-size: 1.1rem; font-weight: 900; color: #10B981; }
        .buy-btn { display: inline-block; background: #6366F1; color: #fff; font-weight: 700; font-size: 0.8rem; padding: 8px 18px; border-radius: 8px; text-decoration: none; flex-shrink: 0; }
        .buy-btn:hover { background: #4F46E5; }
        .preview-btn { font-size: 0.8rem; color: #5A6080; text-decoration: none; }
        .preview-btn:hover { color: #818CF8; }
        .empty { text-align: center; padding: 80px 20px; color: #5A6080; }
        .empty h2 { font-size: 1.2rem; margin-bottom: 8px; }
        .store-footer { text-align: center; margin-top: 60px; padding-top: 24px; border-top: 1px solid #1F2333; }
        .store-footer p { font-size: 0.8rem; color: #5A6080; }
        .store-footer a { color: #6366F1; text-decoration: none; }
      `}</style>

      <div className="store-wrap">
        <div className="store-hero">
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📚</div>
          <h1>PDF Guide Store</h1>
          <p>Instant answers to real problems — downloadable guides you can read on your phone, right now.</p>
        </div>

        {products.length === 0 ? (
          <div className="empty">
            <h2>Guides coming soon</h2>
            <p>Check back shortly — new guides are being added regularly.</p>
          </div>
        ) : (
          sortedKeys.map((key) => {
            const isDiasporaGroup = key.includes("_DIASPORA");
            const countryCode = key.replace("_DIASPORA", "");
            const sym = isDiasporaGroup ? "£" : (CURRENCY[countryCode] ?? "$");
            const flag = FLAG[countryCode] ?? "🌍";
            const name = COUNTRY_NAME[countryCode] ?? countryCode;
            const groupProducts = groups[key];

            return (
              <div key={key}>
                <div className="group-header">
                  <span className="flag">{flag}</span>
                  <span className="name">{name}</span>
                  {isDiasporaGroup && (
                    <span className="diaspora-badge">✈️ Diaspora Guides · £</span>
                  )}
                  <span className="count">{groupProducts.length} guide{groupProducts.length !== 1 ? "s" : ""}</span>
                </div>

                {groupProducts.map((p) => {
                  const price = p.opportunity.minPrice.toFixed(2);
                  const niche = p.opportunity.niche;
                  const emoji = niche === "finance" ? "💰" : niche === "education" ? "📚" : niche === "health" ? "🏥" : niche === "farming" ? "🌱" : niche === "business" ? "🏢" : niche === "career" ? "💼" : "📄";

                  return (
                    <div key={p.id} className="product-card">
                      <div className="product-icon">{emoji}</div>
                      <div className="product-body">
                        <div className="product-title">{p.title}</div>
                        <div className="product-niche">{niche}</div>
                        <div className="product-footer">
                          <span className="product-price">{sym}{price}</span>
                          {p.slug && (
                            <a href={`/guide/${p.slug}`} className="preview-btn">Free preview →</a>
                          )}
                          <a href={`/sell/${p.slug}`} className="buy-btn" style={{ marginLeft: "auto" }}>
                            Get Guide →
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}

        <div className="store-footer">
          <p>All guides are instant downloads · 30-day money-back guarantee · <a href="/">PDF Trend Lab</a></p>
        </div>
      </div>
    </>
  );
}
