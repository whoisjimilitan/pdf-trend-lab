import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    totalProducts,
    totalHooks,
    totalOpportunities,
    publishedProducts,
    recentProducts,
    recentOpportunities,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.hook.count(),
    prisma.opportunity.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { opportunity: true },
    }),
    prisma.opportunity.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const salesData = await prisma.product.aggregate({
    _sum: { revenue: true, salesCount: true },
  });

  const totalRevenue = salesData._sum.revenue ?? 0;
  const totalSales = salesData._sum.salesCount ?? 0;

  const nicheGroups = await prisma.product.groupBy({
    by: ["opportunityId"],
    _sum: { revenue: true, salesCount: true },
    orderBy: { _sum: { revenue: "desc" } },
    take: 1,
  });

  let bestNiche = "—";
  if (nicheGroups.length > 0 && nicheGroups[0].opportunityId) {
    const opp = await prisma.opportunity.findUnique({ where: { id: nicheGroups[0].opportunityId } });
    if (opp) bestNiche = opp.niche;
  }

  const TARGET = 50;
  const progress = Math.min(100, Math.round((totalProducts / TARGET) * 100));

  const CURRENCY: Record<string, string> = {
    GH: "₵", NG: "₦", KE: "KSh", ZA: "R", GB: "£", CA: "CA$", AU: "A$", US: "$",
  };

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
          PDF Farming Dashboard
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Build 50 pages. Rank on Google. Earn passive income.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Products", value: totalProducts, icon: "📄", color: "#6366F1" },
          { label: "Live Pages", value: publishedProducts, icon: "🟢", color: "#10B981" },
          { label: "Total Sales", value: totalSales, icon: "💰", color: "#F59E0B" },
          { label: "Revenue Earned", value: `$${totalRevenue.toFixed(2)}`, icon: "💵", color: "#10B981" },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress tracker */}
      <div className="p-5 rounded-xl mb-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-bold" style={{ color: "var(--text)" }}>
              🎯 Progress to 50 Pages
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {totalProducts} of {TARGET} pages built — {TARGET - totalProducts > 0 ? `${TARGET - totalProducts} to go` : "Goal reached! 🎉"}
            </div>
          </div>
          <div className="text-2xl font-black" style={{ color: progress >= 80 ? "#10B981" : progress >= 40 ? "#F59E0B" : "#6366F1" }}>
            {progress}%
          </div>
        </div>
        <div className="w-full rounded-full h-3" style={{ background: "var(--surface2)" }}>
          <div className="h-3 rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: progress >= 80 ? "#10B981" : progress >= 40 ? "#F59E0B" : "#6366F1",
            }} />
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs" style={{ color: "var(--muted)" }}>
          <span>💡 {totalOpportunities} ideas found</span>
          <span>🎣 {totalHooks} hooks generated</span>
          <span>🌐 {publishedProducts} live SEO pages</span>
          {bestNiche !== "—" && <span>🏆 Best niche: {bestNiche}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent products */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>Recent Products</div>
            <Link href="/factory" className="text-xs" style={{ color: "#6366F1" }}>View all →</Link>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {recentProducts.length === 0 ? (
              <div className="p-5 text-center text-sm" style={{ color: "var(--muted)" }}>
                No products yet. <Link href="/engine" style={{ color: "#6366F1" }}>Generate ideas →</Link>
              </div>
            ) : recentProducts.map((p) => {
              const sym = CURRENCY[p.opportunity?.country ?? "US"] ?? "$";
              return (
                <div key={p.id} className="px-5 py-3">
                  <div className="text-xs font-medium mb-1 leading-snug" style={{ color: "var(--text)" }}>
                    {p.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{p.opportunity?.niche}</span>
                    {p.published && (
                      <span style={{ fontSize: 10, background: "#10B98120", color: "#10B981", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>
                        Live
                      </span>
                    )}
                    {p.salesCount > 0 && (
                      <span style={{ fontSize: 10, background: "#F59E0B20", color: "#F59E0B", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>
                        {p.salesCount} sold · {sym}{p.revenue.toFixed(0)}
                      </span>
                    )}
                    {p.slug && (
                      <a href={`/guide/${p.slug}`} target="_blank" rel="noopener noreferrer"
                        className="ml-auto text-xs" style={{ color: "#6366F1" }}>
                        View →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent opportunities + quick actions */}
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>Hot Opportunities</div>
              <Link href="/engine" className="text-xs" style={{ color: "#6366F1" }}>Find more →</Link>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentOpportunities.length === 0 ? (
                <div className="p-5 text-center text-sm" style={{ color: "var(--muted)" }}>
                  No ideas yet. <Link href="/engine" style={{ color: "#6366F1" }}>Run the engine →</Link>
                </div>
              ) : recentOpportunities.map((o) => (
                <div key={o.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium mb-0.5 leading-snug" style={{ color: "var(--text)" }}>
                      {o.pdfTitle || o.keyword}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      Score: <span style={{ color: o.opportunityScore >= 90 ? "#10B981" : o.opportunityScore >= 80 ? "#F59E0B" : "#F97316", fontWeight: 700 }}>{o.opportunityScore}</span>
                      {" · "}{o.niche}
                    </div>
                  </div>
                  <Link href={`/factory?id=${o.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold ml-3 flex-shrink-0"
                    style={{ background: "var(--accent)", color: "#fff" }}>
                    Build →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Quick Actions</div>
            <div className="space-y-2">
              <Link href="/engine"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full"
                style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}>
                💡 Find New PDF Ideas
              </Link>
              <Link href="/factory"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full"
                style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}>
                🏭 Open Content Factory
              </Link>
              <Link href="/hooks"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full"
                style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}>
                🎣 Browse Hook Library
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
