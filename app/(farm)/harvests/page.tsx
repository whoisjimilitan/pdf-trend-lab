import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HarvestsPage() {
  const guides = await prisma.product.findMany({
    where: { published: true },
    include: { opportunity: true },
    orderBy: { revenue: "desc" },
  });

  const totalEarned = guides.reduce((sum, g) => sum + g.revenue, 0);
  const totalSales  = guides.reduce((sum, g) => sum + g.salesCount, 0);

  const card: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 32px 64px" }}>

      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: "1.55rem", fontWeight: 700, color: "var(--text)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Revenue 💰
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
          What your farm has earned so far.
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 32 }}>
        {[
          { value: guides.length,              label: "Guides live"    },
          { value: totalSales,                 label: "Total sales"    },
          { value: `£${totalEarned.toFixed(0)}`, label: "Total earned" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 3 }}>{s.value}</div>
            <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {guides.length === 0 ? (
        <div style={{ ...card, padding: "48px 32px", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🌾</div>
          <div style={{ fontSize: "0.97rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>No revenue yet.</div>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0 0 20px", lineHeight: 1.7 }}>
            Plant your first seed and publish a guide to start earning.
          </p>
          <Link href="/engine"
            style={{ display: "inline-block", background: "var(--accent)", color: "#fff", fontWeight: 700, fontSize: "0.88rem", padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>
            Find a Seed →
          </Link>
        </div>
      ) : (
        <div style={{ ...card, overflow: "hidden" }}>
          {guides.map((g, i) => (
            <div key={g.id}
              style={{ padding: "18px 22px", borderBottom: i < guides.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", marginBottom: 4, lineHeight: 1.35 }}>{g.title}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {g.salesCount} sale{g.salesCount !== 1 ? "s" : ""}
                  {g.opportunity?.niche ? ` · ${g.opportunity.niche}` : ""}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em", marginBottom: 3 }}>
                  £{g.revenue.toFixed(0)}
                </div>
                {g.slug && (
                  <a href={`/sell/${g.slug}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "0.72rem", color: "var(--accent)", textDecoration: "none" }}>
                    Buy page ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
