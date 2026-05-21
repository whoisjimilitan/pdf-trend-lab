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
  { href: "/engine",   label: "PDF Idea Finder",  icon: "💡" },
  { href: "/factory",  label: "Content Factory",   icon: "🏭" },
  { href: "/schedule", label: "Plant & Schedule",  icon: "🗓️" },
  { href: "/store",    label: "Store",             icon: "🛍️" },
  { href: "/hooks",    label: "Hook Library",      icon: "🎣" },
  { href: "/clusters", label: "Cluster Map",       icon: "🗺️" },
  { href: "/",         label: "Dashboard",         icon: "📊" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
          className="w-56 flex-shrink-0 flex flex-col">
          <div className="px-5 py-6 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "var(--muted)" }}>
              PDF Seeds
            </div>
            <div className="text-sm font-medium" style={{ color: "var(--text)" }}>
              Plant. Grow. Harvest.
            </div>
          </div>
          <div className="px-3 pt-4 pb-2">
            <Link href="/engine"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-bold text-white"
              style={{ background: "var(--accent)" }}>
              🔍 Generate New Ideas
            </Link>
          </div>
          <nav className="flex-1 px-3 py-2 space-y-1">
            {nav.map(({ href, label, icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:text-white"
                style={{ color: "var(--muted)" }}>
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            ))}
          </nav>
          <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              Plant seeds. Harvest income.
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto" style={{ background: "var(--bg)" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
