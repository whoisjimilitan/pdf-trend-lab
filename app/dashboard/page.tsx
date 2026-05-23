import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const FLAG: Record<string, string> = {
  GH: "🇬🇭", NG: "🇳🇬", KE: "🇰🇪", ZA: "🇿🇦", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", US: "🇺🇸",
};

const COUNTRY: Record<string, string> = {
  GH: "Ghana", NG: "Nigeria", KE: "Kenya", ZA: "South Africa",
  GB: "United Kingdom", CA: "Canada", AU: "Australia", US: "United States",
};

const DAILY: Record<number, { icon: string; action: string; tip: string; est: string; href: string }> = {
  0: { icon: "🌱", action: "Plant a new seed today",          tip: "Browse Seeds, pick the top opportunity, grow it into a guide in 3 minutes.",  est: "30 min", href: "/engine"   },
  1: { icon: "🎵", action: "Post your TikTok hook",           tip: "Film 7 seconds. Hook line first. Buy link in bio.",                            est: "10 min", href: "/factory"  },
  2: { icon: "📌", action: "Publish a Pinterest pin",         tip: "Text-on-image in Canva. Link directly to your guide page.",                    est: "10 min", href: "/factory"  },
  3: { icon: "📸", action: "Share your Instagram story",      tip: "Quote card or reel. 'Link in bio' points to your guide.",                      est: "10 min", href: "/factory"  },
  4: { icon: "📧", action: "Send your email to the list",     tip: "Even 50 subscribers get real sales. Copy the hook from your Guides page.",    est: "10 min", href: "/factory"  },
  5: { icon: "🎵", action: "Post a second TikTok angle",      tip: "Different hook, same guide. Captures a different viewer — same demand.",       est: "10 min", href: "/factory"  },
  6: { icon: "📌", action: "Create a Pinterest keyword pin",  tip: "Slightly different title. Same link. More search ground covered.",             est: "10 min", href: "/factory"  },
};

export default async function DashboardPage() {
  const [totalSeeds, liveSeeds, salesData, featuredSeed, recentGuides] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.product.aggregate({ _sum: { revenue: true } }),
    prisma.opportunity.findFirst({
      where: { products: { none: {} } },
      orderBy: { opportunityScore: "desc" },
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { opportunity: true },
    }),
  ]);

  const totalEarned = salesData._sum.revenue ?? 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = DAILY[new Date().getDay()];

  const card: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 32px 64px" }}>

      {/* Greeting */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: "1.55rem", fontWeight: 700, color: "var(--text)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          {greeting}, Jimi 🌱
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Featured seed */}
      {featuredSeed ? (
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 16 }}>
            A seed worth planting today
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>{FLAG[featuredSeed.country] ?? "🌍"}</span>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 3 }}>
                {COUNTRY[featuredSeed.country] ?? featuredSeed.country}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>
                &ldquo;{featuredSeed.pdfTitle || featuredSeed.keyword}&rdquo;
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 18, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              {featuredSeed.searchVolume >= 1000
                ? `${(featuredSeed.searchVolume / 1000).toFixed(1)}k searches / month`
                : `${featuredSeed.searchVolume} searches / month`}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)", textTransform: "capitalize" }}>
              {featuredSeed.competition} competition
            </span>
          </div>
          <p style={{ fontSize: "0.83rem", color: "var(--muted)", margin: "0 0 20px", lineHeight: 1.7, fontStyle: "italic" }}>
            People are already searching for this. No useful PDF guide exists yet.
          </p>
          <Link href={`/factory?id=${featuredSeed.id}`}
            style={{ display: "inline-block", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", color: "#fff", fontWeight: 700, fontSize: "0.88rem", padding: "12px 28px", borderRadius: 999, textDecoration: "none", boxShadow: "0 4px 14px rgba(124,58,237,0.28)" }}>
            Plant This Seed →
          </Link>
        </div>
      ) : (
        <div style={{ ...card, marginBottom: 16, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>🌱</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Ready to find your next seed?</div>
          <p style={{ fontSize: "0.83rem", color: "var(--muted)", margin: "0 0 18px" }}>Browse today&apos;s opportunities and pick one worth planting.</p>
          <Link href="/engine"
            style={{ display: "inline-block", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", color: "#fff", fontWeight: 700, fontSize: "0.88rem", padding: "12px 28px", borderRadius: 999, textDecoration: "none", boxShadow: "0 4px 14px rgba(124,58,237,0.28)" }}>
            Find a Seed →
          </Link>
        </div>
      )}

      {/* Today's planting */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>
            Today&apos;s Planting
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>~{today.est}</div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18 }}>
          <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{today.icon}</span>
          <div>
            <div style={{ fontSize: "0.97rem", fontWeight: 600, color: "var(--text)", marginBottom: 5 }}>{today.action}</div>
            <div style={{ fontSize: "0.83rem", color: "var(--muted)", lineHeight: 1.65 }}>{today.tip}</div>
          </div>
        </div>
        <Link href={today.href}
          style={{ display: "inline-block", background: "#F5F3FF", color: "#7C3AED", fontWeight: 700, fontSize: "0.83rem", padding: "10px 22px", borderRadius: 999, textDecoration: "none", border: "1px solid #DDD6FE" }}>
          Start Today&apos;s Planting →
        </Link>
      </div>

      {/* Farm stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 32 }}>
        {[
          { icon: "🌱", value: totalSeeds,                       label: "Seeds planted"  },
          { icon: "📄", value: liveSeeds,                        label: "Guides live"    },
          { icon: "🌾", value: `£${totalEarned.toFixed(0)}`,     label: "Total harvested" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "1.1rem", marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 3 }}>{s.value}</div>
            <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent guides */}
      {recentGuides.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: "0.83rem", fontWeight: 600, color: "var(--text)" }}>Your recent guides</div>
            <Link href="/factory" style={{ fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          {recentGuides.map((g, i) => (
            <div key={g.id} style={{ padding: "13px 20px", borderBottom: i < recentGuides.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text)", marginBottom: 2 }}>{g.title}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                  {g.published ? "🟢 Live" : "◦ Draft"}
                  {g.salesCount > 0 && ` · ${g.salesCount} sold · £${g.revenue.toFixed(0)}`}
                </div>
              </div>
              {g.published && g.slug ? (
                <a href={`/sell/${g.slug}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none", fontWeight: 600, flexShrink: 0 }}>
                  Buy page ↗
                </a>
              ) : (
                <Link href={`/factory?id=${g.id}`}
                  style={{ fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none", fontWeight: 600, flexShrink: 0 }}>
                  Publish →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
