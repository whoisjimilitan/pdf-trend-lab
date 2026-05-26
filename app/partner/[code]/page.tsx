import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CopyButton from "./CopyButton";
import GenerateGuide from "./GenerateGuide";

export const revalidate = 60;

const SITE = "https://pdfseeds.com";

const TEMPLATES = (link: string) => [
  {
    type: "General community",
    icon: "💬",
    text: `Saw this and thought of the group — a site with clear PDF guides for things like visa applications, business registration, and tax returns. No Google rabbit holes. Just one guide that explains it properly. Only £9.99 → ${link}`,
  },
  {
    type: "Diaspora / immigration",
    icon: "🌍",
    text: `For anyone in the group navigating UK systems — visas, indefinite leave, self-employment, HMRC, NHS. I found a site with guides written specifically for people in our position. Way more useful than Googling. Check it out → ${link}`,
  },
  {
    type: "Faith community",
    icon: "🕊️",
    text: `For anyone who's asked me about navigating life admin — business registration, visas, tax — I found a resource worth sharing. Clear, step-by-step guides, not overwhelming. It's from PDF Seeds → ${link}`,
  },
  {
    type: "Professional network",
    icon: "💼",
    text: `Sharing this for anyone who needs it — PDF Seeds has practical guides on business registration, tax returns, immigration processes and more. Useful for clients and contacts alike. Instant download, £9.99 → ${link}`,
  },
];

export default async function PartnerDashboard({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const [partner, topGuides] = await Promise.all([
    prisma.partner.findUnique({
      where: { code },
      include: { sales: { orderBy: { createdAt: "desc" }, take: 10 } },
    }),
    prisma.product.findMany({
      where: { published: true },
      orderBy: { salesCount: "desc" },
      take: 3,
      include: { opportunity: { select: { minPrice: true, country: true } } },
    }),
  ]);

  if (!partner) notFound();

  const myLink = `${SITE}/?ref=${partner.code}`;
  const templates = TEMPLATES(myLink);
  const payout = partner.totalEarned.toFixed(2);
  const nextPayout = Math.max(0, 19.99 - partner.totalEarned).toFixed(2);
  const recovered = partner.totalEarned >= 19.99;

  return (
    <>
      <style>{`
        body { background: #FAF9F7 !important; font-family: -apple-system,"Inter",system-ui,sans-serif; color: #1A1008; }
        * { box-sizing: border-box; }
        .pd { max-width: 640px; margin: 0 auto; padding: 48px 24px 80px; }
        .pd-header { margin-bottom: 36px; }
        .pd-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 32px; }
        .pd-logo-mark { width: 32px; height: 32px; background: linear-gradient(135deg,#7C3AED,#4F46E5); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
        .pd-logo-name { font-size: 0.95rem; font-weight: 800; color: #1A1008; letter-spacing: -0.02em; }
        .pd-welcome { font-size: 1.5rem; font-weight: 900; color: #1A1008; letter-spacing: -0.03em; margin: 0 0 6px; }
        .pd-sub { font-size: 0.88rem; color: #8C7D6E; margin: 0; }

        .pd-code-block { background: #F5F3FF; border: 1.5px solid #DDD6FE; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; }
        .pd-code-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #7C3AED; margin-bottom: 8px; }
        .pd-code-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .pd-code-link { font-size: 0.88rem; font-weight: 600; color: #1A1008; word-break: break-all; }
        .pd-code-badge { font-size: 0.72rem; font-weight: 700; color: #7C3AED; background: #EDE9FE; border-radius: 999px; padding: 3px 10px; flex-shrink: 0; }

        .pd-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 32px; }
        .pd-stat { background: #FFFFFF; border: 1px solid #EAE6E0; border-radius: 12px; padding: 16px; text-align: center; }
        .pd-stat-val { font-size: 1.35rem; font-weight: 800; color: #1A1008; letter-spacing: -0.02em; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pd-stat-label { font-size: 0.62rem; color: #B0A89A; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 600; }

        .pd-section { margin-bottom: 32px; }
        .pd-section-title { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9B8AF0; margin-bottom: 14px; }
        .pd-section-h { font-size: 1.05rem; font-weight: 800; color: #1A1008; letter-spacing: -0.02em; margin: 0 0 14px; }

        .pd-guide-card { background: #FFFFFF; border: 1.5px solid #EAE6E0; border-radius: 14px; padding: 16px 18px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .pd-guide-title { font-size: 0.88rem; font-weight: 600; color: #1A1008; line-height: 1.4; }
        .pd-guide-meta { font-size: 0.72rem; color: #B0A89A; margin-top: 3px; }
        .pd-guide-copy { flex-shrink: 0; }

        .pd-template { background: #FFFFFF; border: 1.5px solid #EAE6E0; border-radius: 14px; padding: 18px 20px; margin-bottom: 10px; }
        .pd-template-type { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .pd-template-icon { font-size: 1rem; }
        .pd-template-label { font-size: 0.78rem; font-weight: 700; color: #7C3AED; }
        .pd-template-text { font-size: 0.85rem; color: #4B3D30; line-height: 1.7; margin-bottom: 14px; }

        .pd-recover { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 14px 18px; margin-bottom: 32px; font-size: 0.83rem; color: #15803D; font-weight: 600; line-height: 1.6; }
        .pd-recover.pending { background: #FFF7ED; border-color: #FED7AA; color: #C2410C; }

        .pd-sales { background: #FFFFFF; border: 1.5px solid #EAE6E0; border-radius: 14px; overflow: hidden; }
        .pd-sales-row { padding: 12px 18px; border-bottom: 1px solid #F5F0EB; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 0.83rem; }
        .pd-sales-row:last-child { border-bottom: none; }
        .pd-sales-slug { color: #4B3D30; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
        .pd-sales-earn { color: #7C3AED; font-weight: 700; flex-shrink: 0; }
        .pd-sales-date { color: #C4BAB0; font-size: 0.72rem; flex-shrink: 0; }

        .pd-tip { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px 18px; font-size: 0.85rem; color: #92400E; line-height: 1.7; }
        .pd-tip strong { color: #78350F; }

        @media (max-width: 600px) {
          .pd { padding: 32px 16px 64px; }
          .pd-stats { grid-template-columns: repeat(3,1fr); gap: 8px; }
          .pd-stat-val { font-size: 1.1rem; }
          .pd-code-link { font-size: 0.8rem; }
        }
      `}</style>

      <div className="pd">

        <div className="pd-header">
          <a href="/" className="pd-logo">
            <div className="pd-logo-mark">🌱</div>
            <span className="pd-logo-name">PDF Seeds</span>
          </a>
          <div className="pd-welcome">Your Affiliate Dashboard</div>
          <p className="pd-sub">Everything you need to start earning. Bookmark this page.</p>
        </div>

        {/* Your unique link */}
        <div className="pd-code-block">
          <div className="pd-code-label">Your unique affiliate link</div>
          <div className="pd-code-row">
            <div className="pd-code-link">{myLink}</div>
            <div className="pd-code-badge">{partner.code}</div>
          </div>
          <div style={{ marginTop: 12 }}>
            <CopyButton text={myLink} label="Copy link" />
          </div>
        </div>

        {/* Stats */}
        <div className="pd-stats">
          <div className="pd-stat">
            <div className="pd-stat-val">{partner.salesCount}</div>
            <div className="pd-stat-label">Sales</div>
          </div>
          <div className="pd-stat">
            <div className="pd-stat-val">£{payout}</div>
            <div className="pd-stat-label">Earned</div>
          </div>
          <div className="pd-stat">
            <div className="pd-stat-val">80%</div>
            <div className="pd-stat-label">Your cut</div>
          </div>
        </div>

        {/* Recovery status */}
        {recovered ? (
          <div className="pd-recover">
            ✓ You&apos;ve recovered your £19.99. Everything from here is pure profit.
          </div>
        ) : (
          <div className="pd-recover pending">
            £{nextPayout} more in earnings will cover your £19.99 join fee. After that, it&apos;s all yours.
          </div>
        )}

        {/* Generate a guide on demand */}
        <GenerateGuide partnerCode={partner.code} />

        {/* Start here — top 3 guides */}
        <div className="pd-section">
          <div className="pd-section-title">Start here</div>
          <div className="pd-section-h">The 3 guides that convert best</div>
          {topGuides.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "#B0A89A" }}>Guides coming soon — check back shortly.</p>
          ) : topGuides.map(g => {
            const guideLink = `${SITE}/sell/${g.slug}?ref=${partner.code}`;
            return (
              <div key={g.id} className="pd-guide-card">
                <div>
                  <div className="pd-guide-title">{g.title}</div>
                  <div className="pd-guide-meta">
                    £{(g.opportunity.minPrice ?? 9.99).toFixed(2)} · {g.salesCount} sold · you earn £{((g.opportunity.minPrice ?? 9.99) * 0.80).toFixed(2)}
                  </div>
                </div>
                <div className="pd-guide-copy">
                  <CopyButton text={guideLink} label="Copy link" small />
                </div>
              </div>
            );
          })}
        </div>

        {/* WhatsApp templates */}
        <div className="pd-section">
          <div className="pd-section-title">Ready to send</div>
          <div className="pd-section-h">WhatsApp templates — pick your community</div>
          {templates.map(t => (
            <div key={t.type} className="pd-template">
              <div className="pd-template-type">
                <span className="pd-template-icon">{t.icon}</span>
                <span className="pd-template-label">{t.type}</span>
              </div>
              <div className="pd-template-text">{t.text}</div>
              <CopyButton text={t.text} label="Copy message" />
            </div>
          ))}
        </div>

        {/* This week's tip */}
        <div className="pd-section">
          <div className="pd-tip">
            <strong>This week&apos;s tip:</strong> Don&apos;t broadcast — plant. Send the guide directly in response to a question someone just asked in your group. &ldquo;Someone just asked about X — I actually found a guide for this&rdquo; converts 3–5x better than a generic recommendation.
          </div>
        </div>

        {/* Recent sales */}
        {partner.sales.length > 0 && (
          <div className="pd-section">
            <div className="pd-section-title">Your recent sales</div>
            <div className="pd-sales">
              {partner.sales.map(s => (
                <div key={s.id} className="pd-sales-row">
                  <div className="pd-sales-slug">{s.productSlug}</div>
                  <div className="pd-sales-earn">+£{s.commission.toFixed(2)}</div>
                  <div className="pd-sales-date">{new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize: "0.75rem", color: "#C4BAB0", textAlign: "center", marginTop: 16 }}>
          Questions? Email <a href="mailto:hello@pdfseeds.com" style={{ color: "#9B8AF0" }}>hello@pdfseeds.com</a>
        </div>

      </div>
    </>
  );
}
