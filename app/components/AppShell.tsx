"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Brand = "pdfseeds" | "brotherjimi";

const BRANDS: Record<Brand, {
  icon: string;
  gradient: string;
  shadow: string;
  name: string;
  tagline: string;
  hoverBg: string;
  hoverColor: string;
  footerText: string;
}> = {
  pdfseeds: {
    icon: "🌱",
    gradient: "linear-gradient(135deg, #7C3AED, #4F46E5)",
    shadow: "rgba(124,58,237,0.3)",
    name: "PDF Seeds",
    tagline: "Find confusion. Sell clarity.",
    hoverBg: "#F5F3FF",
    hoverColor: "#7C3AED",
    footerText: "Find confusion. Sell clarity.",
  },
  brotherjimi: {
    icon: "🕊️",
    gradient: "linear-gradient(135deg, #C8973E, #A87930)",
    shadow: "rgba(200,151,62,0.3)",
    name: "Brother Jimi",
    tagline: "The pastoral word",
    hoverBg: "#FEF7ED",
    hoverColor: "#C8973E",
    footerText: "Walk in the Word.",
  },
};

const nav = [
  { href: "/dashboard", label: "Welcome", icon: "🏡", sub: "Overview"          },
  { href: "/engine",   label: "Engine",  icon: "🔍", sub: "Discover gaps"      },
  { href: "/factory",  label: "PDFs",    icon: "📄", sub: "Your planted seeds" },
  { href: "/harvests", label: "Revenue", icon: "💰", sub: "Earnings"           },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<Brand>("pdfseeds");

  useEffect(() => {
    const saved = (localStorage.getItem("engine-brand") ?? "pdfseeds") as Brand;
    setBrand(saved);
    document.documentElement.setAttribute("data-brand", saved);

    const handler = (e: Event) => {
      const next = (e as CustomEvent<Brand>).detail;
      setBrand(next);
      document.documentElement.setAttribute("data-brand", next);
    };
    window.addEventListener("brand-change", handler);
    return () => window.removeEventListener("brand-change", handler);
  }, []);

  const b = BRANDS[brand];

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar — desktop only */}
      <aside
        style={{ background: "var(--surface)", borderRight: "1px solid var(--border)", width: 220, transition: "border-color 0.3s" }}
        className="flex-shrink-0 flex-col hidden md:flex"
      >
        {/* Logo */}
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2.5">
              <div style={{
                width: 28, height: 28,
                background: b.gradient,
                borderRadius: 7,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.85rem", flexShrink: 0,
                boxShadow: `0 3px 8px ${b.shadow}`,
                transition: "background 0.35s, box-shadow 0.35s",
              }}>
                {b.icon}
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em", lineHeight: 1.2, transition: "color 0.3s" }}>
                  {b.name}
                </div>
                <div style={{ fontSize: "0.58rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", transition: "color 0.3s" }}>
                  {b.tagline}
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ href, label, icon, sub }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
              style={{
                textDecoration: "none",
                color: "var(--muted)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = b.hoverBg;
                (e.currentTarget as HTMLAnchorElement).style.color = b.hoverColor;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--muted)";
              }}
            >
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
          <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 600, letterSpacing: "0.02em", transition: "color 0.3s" }}>
            {b.footerText}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0" style={{ background: "var(--bg)" }}>
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", boxShadow: "0 -2px 12px rgba(0,0,0,0.08)" }}
      >
        {nav.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
            style={{ textDecoration: "none", color: "var(--muted)", minHeight: 56 }}
          >
            <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.02em" }}>{label}</span>
          </Link>
        ))}
      </nav>

    </div>
  );
}
