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
  { href: "/dashboard", label: "My Farm",  icon: "🏡", sub: "Overview"          },
  { href: "/engine",   label: "Seeds",    icon: "🌱", sub: "Discover gaps"      },
  { href: "/factory",  label: "Guides",   icon: "📄", sub: "Your planted seeds" },
  { href: "/harvests", label: "Harvests", icon: "🌾", sub: "Earnings"           },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="flex h-screen overflow-hidden">

        {/* Sidebar — desktop only */}
        <aside style={{ background: "var(--surface)", borderRight: "1px solid var(--border)", width: 220 }}
          className="flex-shrink-0 flex-col hidden md:flex">

          {/* Logo */}
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #7C3AED, #4F46E5)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0, boxShadow: "0 3px 8px rgba(124,58,237,0.3)" }}>
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[#F5F3FF] hover:text-[#7C3AED]"
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

        {/* Main content — extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0" style={{ background: "var(--bg)" }}>
          {children}
        </main>

        {/* Mobile bottom nav — hidden on desktop */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
          style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", boxShadow: "0 -2px 12px rgba(0,0,0,0.08)" }}>
          {nav.map(({ href, label, icon }) => (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
              style={{ textDecoration: "none", color: "var(--muted)", minHeight: 56 }}>
              <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>{icon}</span>
              <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.02em" }}>{label}</span>
            </Link>
          ))}
        </nav>

      </body>
    </html>
  );
}
