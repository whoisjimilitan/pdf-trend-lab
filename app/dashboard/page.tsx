import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CURRENCY: Record<string, string> = {
  GH: "₵", NG: "₦", KE: "KSh", ZA: "R", GB: "£", CA: "CA$", AU: "A$", US: "$",
};

export default async function DashboardPage() {
  const [
    totalProducts,
    totalOpportunities,
    publishedProducts,
    recentProducts,
    recentOpportunities,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.opportunity.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { opportunity: true },
    }),
    prisma.opportunity.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const salesData = await prisma.product.aggregate({
    _sum: { revenue: true, salesCount: true },
  });

  const totalRevenue = salesData._sum.revenue ?? 0;
  const totalSales = salesData._sum.salesCount ?? 0;

  const TARGET = 50;
  const progress = Math.min(100, Math.round((totalProducts / TARGET) * 100));

  const isEmpty = totalProducts === 0 && totalOpportunities === 0;

  return (
    <div className="p-8 max-w-5xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
          🌱 Your Farm
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {totalRevenue > 0
            ? `You've earned ${CURRENCY["GB"]}${totalRevenue.toFixed(2)} so far. Keep planting.`
            : "Every PDF you plant earns money while you sleep. Start with one."}
        </p>
      </div>

      {/* First-time empty state */}
      {isEmpty && (
        <div className="rounded-xl p-8 mb-8 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-3">🌱</div>
          <div className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>
            Your farm is empty. Let's plant your first seed.
          </div>
          <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
            Start by finding a topic people are searching for. The engine will find it in 60 seconds.
          </p>
          <Link href="/engine"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white"
            style={{ background: "var(--accent)" }}>
            🔍 Find My First Topic →
          </Link>
        </div>
      )}

      {/* Stats */}
      {!isEmpty && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "PDFs Made",
              value: totalProducts,
              icon: "📄",
              color: "#6366F1",
              sub: "guides in your library",
            },
            {
              label: "Live & Selling",
              value: publishedProducts,
              icon: "🟢",
              color: "#10B981",
              sub: "pages Google can find",
            },
            {
              label: "Copies Sold",
              value: totalSales,
              icon: "🛒",
              color: "#F59E0B",
              sub: "real people bought",
            },
            {
              label: "Total Earned",
              value: `£${totalRevenue.toFixed(2)}`,
              icon: "💰",
              color: "#10B981",
              sub: "income harvested",
            },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--text)" }}>{s.label}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {!isEmpty && (
        <div className="p-5 rounded-xl mb-8"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm font-bold mb-0.5" style={{ color: "var(--text)" }}>
                🎯 {totalProducts} of {TARGET} seeds planted
              </div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                {TARGET - totalProducts > 0
                  ? `${TARGET - totalProducts} more to go. At ${TARGET} PDFs, your farm earns roughly £2,400/month — passively.`
                  : "🎉 Goal reached! Your farm is fully planted."}
              </div>
            </div>
            <div className="text-xl font-black ml-4 flex-shrink-0"
              style={{ color: progress >= 80 ? "#10B981" : progress >= 40 ? "#F59E0B" : "#6366F1" }}>
              {progress}%
            </div>
          </div>
          <div className="w-full rounded-full h-2.5" style={{ background: "var(--surface2)" }}>
            <div className="h-2.5 rounded-full transition-all"
              style={{
                width: `${progress || 2}%`,
                background: progress >= 80 ? "#10B981" : progress >= 40 ? "#F59E0B" : "#6366F1",
              }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">

        {/* Recent PDFs */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "var(--border)" }}>
            <div>
              <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>Your PDFs</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                Click "Buy Page" to get the link for your TikTok or Instagram bio
              </div>
            </div>
            <Link href="/factory" className="text-xs flex-shrink-0 ml-3" style={{ color: "#6366F1" }}>
              Manage all →
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {recentProducts.length === 0 ? (
              <div className="p-5 text-center text-sm" style={{ color: "var(--muted)" }}>
                No PDFs yet.{" "}
                <Link href="/engine" style={{ color: "#6366F1" }}>Find your first topic →</Link>
              </div>
            ) : recentProducts.map((p) => {
              const sym = CURRENCY[p.opportunity?.country ?? "US"] ?? "$";
              return (
                <div key={p.id} className="px-4 py-3">
                  <div className="text-xs font-semibold mb-2 leading-snug" style={{ color: "var(--text)" }}>
                    {p.title}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.published ? (
                      <span style={{ fontSize: 10, background: "#10B98120", color: "#10B981", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                        ● Live
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, background: "var(--surface2)", color: "var(--muted)", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>
                        Draft
                      </span>
                    )}
                    {p.salesCount > 0 && (
                      <span style={{ fontSize: 10, background: "#F59E0B20", color: "#F59E0B", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                        {p.salesCount} sold · {sym}{p.revenue.toFixed(0)}
                      </span>
                    )}
                    {p.slug && (
                      <div className="ml-auto flex items-center gap-1.5">
                        <a href={`/sell/${p.slug}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-2 py-1 rounded font-bold"
                          style={{ background: "#6366F120", color: "#818CF8", border: "1px solid #6366F130" }}>
                          🛒 Buy Page
                        </a>
                        <a href={`/guide/${p.slug}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-2 py-1 rounded"
                          style={{ color: "var(--muted)" }}>
                          SEO
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Topics ready to build */}
          <div className="rounded-xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: "var(--border)" }}>
              <div>
                <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                  Topics Ready to Plant
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Real search queries — no PDF exists for these yet
                </div>
              </div>
              <Link href="/engine" className="text-xs flex-shrink-0 ml-3" style={{ color: "#6366F1" }}>
                Find more →
              </Link>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentOpportunities.length === 0 ? (
                <div className="p-5 text-center text-sm" style={{ color: "var(--muted)" }}>
                  No topics yet.{" "}
                  <Link href="/engine" style={{ color: "#6366F1" }}>Run the idea finder →</Link>
                </div>
              ) : recentOpportunities.map((o) => (
                <div key={o.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold mb-0.5 leading-snug truncate"
                      style={{ color: "var(--text)" }}>
                      {o.pdfTitle || o.keyword}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {o.niche} ·{" "}
                      <span style={{
                        color: o.opportunityScore >= 85 ? "#10B981" : o.opportunityScore >= 70 ? "#F59E0B" : "#94A3B8",
                        fontWeight: 700,
                      }}>
                        {o.opportunityScore >= 85 ? "High demand" : o.opportunityScore >= 70 ? "Good opportunity" : "Worth trying"}
                      </span>
                    </div>
                  </div>
                  <Link href={`/factory?id=${o.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold flex-shrink-0"
                    style={{ background: "var(--accent)", color: "#fff" }}>
                    Plant →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* What to do next */}
          <div className="rounded-xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
              What to do next
            </div>
            <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>
              The loop: find a topic → build a PDF → share the buy link → earn.
            </div>
            <div className="space-y-2">
              <Link href="/engine"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full"
                style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}>
                <span>🔍</span>
                <div>
                  <div className="font-semibold text-xs">Find a new topic</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>60 seconds to 10–15 opportunities</div>
                </div>
              </Link>
              <Link href="/factory"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full"
                style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}>
                <span>📄</span>
                <div>
                  <div className="font-semibold text-xs">Build a PDF</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>One click → guide + buy page + hooks</div>
                </div>
              </Link>
              <Link href="/hooks"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full"
                style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}>
                <span>🎣</span>
                <div>
                  <div className="font-semibold text-xs">Get social hooks</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>Ready-to-post TikTok & Instagram copy</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
