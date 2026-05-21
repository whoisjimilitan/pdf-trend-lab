import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDF Seeds",
  description: "Plant PDF guides. Grow passive income. Harvest every month.",
};

const nav = [
  { href: "/engine",   label: "Seeds",    icon: "🌱", sub: "Discover gaps" },
  { href: "/factory",  label: "Guides",   icon: "📄", sub: "Your planted seeds" },
  { href: "/harvests", label: "Harvests", icon: "🌾", sub: "Earnings" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="flex h-screen overflow-hidden">
        <aside style={{ background: "var(--surface)", borderRight: "1px solid var(--border)", width: 220 }}
          className="flex-shrink-0 flex flex-col">

          {/* Logo */}
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <div style={{ width: 28, height: 28, background: "var(--accent)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0 }}>
                  🌱
                </div>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>PDF Seeds</div>
                  <div style={{ fontSize: "0.58rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Plant · Grow · Harvest</div>
                </div>
              </div>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {nav.map(({ href, label, icon, sub }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[#EEF2FF] hover:text-[#4F46E5]"
                style={{ textDecoration: "none", color: "var(--muted)" }}>
                <span style={{ fontSize: "1rem" }}>{icon}</span>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.2 }}>{label}</div>
                  <div style={{ fontSize: "0.68rem", opacity: 0.7, lineHeight: 1.2 }}>{sub}</div>
                </div>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 600, letterSpacing: "0.02em" }}>
              Plant. Grow. Harvest.
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto" style={{ background: "var(--bg)" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
