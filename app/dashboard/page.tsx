import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CURRENCY: Record<string, string> = {
  GH: "₵", NG: "₦", KE: "KSh", ZA: "R", GB: "£", CA: "CA$", AU: "A$", US: "$",
};

const DAILY_PLAN = [
  { day: 0, platform: "Seeds",     icon: "🌱", action: "Find and plant your next seed",   tip: "Open the gap finder. Pick the highest-scored opportunity. Grow it into a guide." },
  { day: 1, platform: "TikTok",    icon: "🎵", action: "Post your TikTok pain hook",      tip: "7 seconds. Hook line first. Look straight at camera. Buy link in bio." },
  { day: 2, platform: "Pinterest", icon: "📌", action: "Publish your Pinterest pin",      tip: "Text-on-image in Canva. Link directly to your guide page." },
  { day: 3, platform: "Instagram", icon: "📸", action: "Post Instagram story with CTA",   tip: "Quote card or reel. 'Link in bio' points to your store page." },
  { day: 4, platform: "Email",     icon: "📧", action: "Send your email hook",            tip: "Even 50 subscribers = real sales. Use the hook from the Content Factory." },
  { day: 5, platform: "TikTok",    icon: "🎵", action: "Post your second angle hook",     tip: "Different hook. Same guide. Captures a different viewer — same validated demand." },
  { day: 6, platform: "Pinterest", icon: "📌", action: "Create a keyword variation pin",  tip: "Slightly different title. Same link. More search ground covered." },
];

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
      take: 5,
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

  const dayOfWeek = new Date().getDay();
  const todayPlan = DAILY_PLAN[dayOfWeek];
  const dayName = new Date().toLocaleDateString("en-GB", { weekday: "long" });

  const stage: "new" | "exploring" | "growing" | "farming" =
    totalProducts === 0 && totalOpportunities === 0 ? "new" :
    totalProducts === 0 ? "exploring" :
    publishedProducts === 0 ? "growing" :
    "farming";

  return (
    <div className="p-8 max-w-4xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl mb-1" style={{ color: "var(--text)", fontFamily: "Georgia, serif", fontWeight: 400 }}>
          My Farm
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {stage === "new" && "The soil is ready. Let's find your first gap."}
          {stage === "exploring" && `${totalOpportunities} gap${totalOpportunities === 1 ? "" : "s"} identified. Time to grow your first guide.`}
          {stage === "growing" && `${totalProducts} guide${totalProducts === 1 ? "" : "s"} grown. Time to plant ${totalProducts === 1 ? "it" : "them"}.`}
          {stage === "farming" && (totalRevenue > 0
            ? `£${totalRevenue.toFixed(2)} harvested. ${publishedProducts} guide${publishedProducts === 1 ? "" : "s"} live and earning.`
            : `${publishedProducts} guide${publishedProducts === 1 ? "" : "s"} live. Your first harvest is on its way.`)}
        </p>
      </div>

      {/* ── TODAY'S ACTION — always first ── */}
      <div className="rounded-2xl p-6 mb-6"
        style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: "var(--accent)", letterSpacing: "0.12em" }}>
          Today&apos;s Action · {dayName}
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
            {todayPlan.icon}
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>
              {todayPlan.platform}
            </div>
            <div className="text-base font-bold mb-1.5" style={{ color: "var(--text)" }}>
              {todayPlan.action}
            </div>
            <div className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              {todayPlan.tip}
            </div>
          </div>
          <Link href="/schedule"
            className="flex-shrink-0 self-center text-sm font-bold px-4 py-2 rounded-lg"
            style={{ background: "var(--accent)", color: "#fff", textDecoration: "none" }}>
            Get hook →
          </Link>
        </div>
      </div>

      {/* ── STAGE PROMPTS ── */}

      {stage === "new" && (
        <div className="rounded-2xl p-8 mb-6 text-center"
          style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-4">🌱</div>
          <div className="text-lg font-bold mb-2" style={{ color: "var(--text)", fontFamily: "Georgia, serif", fontWeight: 400 }}>
            Your farm is ready. Let&apos;s plant your first seed.
          </div>
          <p className="text-sm mb-6" style={{ color: "var(--muted)", maxWidth: 400, margin: "0 auto 24px" }}>
            Start by finding a real search gap — a question thousands of people ask every month
            with no PDF guide answering it yet.
          </p>
          <Link href="/engine"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "var(--accent)" }}>
            🔍 Find Your First Gap →
          </Link>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-sm mx-auto">
            {[
              { icon: "🔍", label: "Find the gap", sub: "60 seconds" },
              { icon: "📄", label: "Grow the guide", sub: "3 minutes" },
              { icon: "🌾", label: "Earn", sub: "While you sleep" },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl text-center"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-xs font-bold mb-0.5" style={{ color: "var(--text)" }}>{s.label}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === "exploring" && (
        <div className="rounded-2xl p-6 mb-6"
          style={{ background: "#FEF9EE", border: "1px solid #E4DDD5" }}>
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">🌾</div>
            <div className="flex-1">
              <div className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>
                {totalOpportunities} gap{totalOpportunities === 1 ? "" : "s"} identified. Time to grow your first guide.
              </div>
              <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
                Pick the highest-scored gap and grow your first PDF guide in 3 minutes.
              </p>
              <Link href="/factory"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white"
                style={{ background: "var(--accent)" }}>
                📄 Grow Your First Guide →
              </Link>
            </div>
          </div>
        </div>
      )}

      {stage === "growing" && (
        <div className="rounded-2xl p-6 mb-6"
          style={{ background: "#EFF5ED", border: "1px solid #C5D9C0" }}>
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">📄</div>
            <div className="flex-1">
              <div className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>
                {totalProducts} guide{totalProducts === 1 ? "" : "s"} grown. Time to plant {totalProducts === 1 ? "it" : "them"}.
              </div>
              <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
                Publishing creates a live buy page you can drop in your social bio. Thirty seconds to go live.
              </p>
              <Link href="/factory"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white"
                style={{ background: "var(--accent)" }}>
                🚀 Publish Your Guide →
              </Link>
            </div>
          </div>
        </div>
      )}

      {stage === "farming" && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Seeds planted",   value: totalProducts,                icon: "📄" },
            { label: "Live & earning",  value: publishedProducts,            icon: "🟢" },
            { label: "Total harvested", value: `£${totalRevenue.toFixed(0)}`, icon: "🌾" },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="text-xl mb-1.5">{s.icon}</div>
              <div className="text-2xl font-bold mb-0.5" style={{ color: "var(--text)" }}>{s.value}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Your Seeds */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "var(--border)" }}>
            <div>
              <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>Your Seeds</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                Buy link → put in your TikTok or Instagram bio
              </div>
            </div>
            <Link href="/factory" className="text-xs font-medium"
              style={{ color: "var(--accent)", textDecoration: "none" }}>
              View all →
            </Link>
          </div>
          <div>
            {recentProducts.length === 0 ? (
              <div className="p-6 text-center text-sm" style={{ color: "var(--muted)" }}>
                No seeds yet.{" "}
                <Link href="/engine" style={{ color: "var(--accent)", textDecoration: "none" }}>
                  Find your first gap →
                </Link>
              </div>
            ) : recentProducts.map((p) => {
              const sym = CURRENCY[p.opportunity?.country ?? "US"] ?? "$";
              return (
                <div key={p.id} className="px-4 py-3 border-b last:border-b-0"
                  style={{ borderColor: "var(--border)" }}>
                  <div className="text-xs font-semibold mb-1.5 leading-snug" style={{ color: "var(--text)" }}>
                    {p.title}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.published ? (
                      <span style={{ fontSize: 10, background: "#EFF5ED", color: "#4A6741", padding: "2px 7px", borderRadius: 4, fontWeight: 700, border: "1px solid #C5D9C0" }}>
                        🟢 Live
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, background: "var(--surface2)", color: "var(--muted)", padding: "2px 7px", borderRadius: 4 }}>
                        Draft
                      </span>
                    )}
                    {p.salesCount > 0 && (
                      <span style={{ fontSize: 10, background: "#FEF9EE", color: "#B5834A", padding: "2px 7px", borderRadius: 4, fontWeight: 700, border: "1px solid #E4DDD5" }}>
                        {p.salesCount} sold · {sym}{p.revenue.toFixed(0)}
                      </span>
                    )}
                    <div className="ml-auto flex gap-1.5">
                      {p.slug && p.published ? (
                        <a href={`/sell/${p.slug}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-2.5 py-1 rounded font-bold"
                          style={{ background: "var(--surface2)", color: "var(--accent)", border: "1px solid var(--border)", textDecoration: "none" }}>
                          🛒 Buy Page
                        </a>
                      ) : p.slug ? (
                        <Link href={`/factory?id=${p.id}`}
                          className="text-xs px-2.5 py-1 rounded font-semibold"
                          style={{ background: "#EFF5ED", color: "#4A6741", border: "1px solid #C5D9C0", textDecoration: "none" }}>
                          Publish →
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Gaps to grow */}
          <div className="rounded-xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: "var(--border)" }}>
              <div>
                <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>Gaps to Grow</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Unplanted seeds — no PDF exists yet
                </div>
              </div>
              <Link href="/engine" className="text-xs font-medium"
                style={{ color: "var(--accent)", textDecoration: "none" }}>
                Find more →
              </Link>
            </div>
            <div>
              {recentOpportunities.length === 0 ? (
                <div className="p-6 text-center text-sm" style={{ color: "var(--muted)" }}>
                  <Link href="/engine" style={{ color: "var(--accent)", textDecoration: "none" }}>
                    Find your first gap →
                  </Link>
                </div>
              ) : recentOpportunities.map((o) => (
                <div key={o.id} className="px-4 py-3 border-b last:border-b-0 flex items-center justify-between gap-3"
                  style={{ borderColor: "var(--border)" }}>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold mb-0.5 leading-snug truncate"
                      style={{ color: "var(--text)" }}>
                      {o.pdfTitle || o.keyword}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      Score{" "}
                      <span style={{ color: o.opportunityScore >= 85 ? "#4A6741" : "#B5834A", fontWeight: 700 }}>
                        {o.opportunityScore}
                      </span>
                      {" · "}{o.niche}
                    </div>
                  </div>
                  <Link href={`/factory?id=${o.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold flex-shrink-0"
                    style={{ background: "var(--accent)", color: "#fff", textDecoration: "none" }}>
                    Grow →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--text)" }}>The Loop</div>
            <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>
              Find gap → Grow guide → Plant daily → Harvest.
            </div>
            <div className="space-y-2">
              {[
                { href: "/engine",   icon: "🔍", label: "Find a new gap",    sub: "60 sec · 10–15 scored opportunities" },
                { href: "/factory",  icon: "📄", label: "Grow a guide",       sub: "One click → PDF + buy page + hooks" },
                { href: "/schedule", icon: "📅", label: "Get today's hook",   sub: "Copy and post — 10 minutes" },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full"
                  style={{ background: "var(--surface2)", border: "1px solid var(--border)", textDecoration: "none" }}>
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold" style={{ color: "var(--text)" }}>{item.label}</div>
                    <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{item.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
