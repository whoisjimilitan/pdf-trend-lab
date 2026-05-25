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
  sidebarBg: string;
  sidebarBorder: string;
  headerBg: string;
  hoverBg: string;
  hoverColor: string;
  footerText: string;
  footerColor: string;
  nameColor: string;
  taglineColor: string;
}> = {
  pdfseeds: {
    icon: "🌱",
    gradient: "linear-gradient(135deg, #7C3AED, #4F46E5)",
    shadow: "rgba(124,58,237,0.3)",
    name: "PDF Seeds",
    tagline: "Find confusion. Sell clarity.",
    sidebarBg: "var(--surface)",
    sidebarBorder: "var(--border)",
    headerBg: "transparent",
    hoverBg: "#F5F3FF",
    hoverColor: "#7C3AED",
    footerText: "Find confusion. Sell clarity.",
    footerColor: "var(--muted)",
    nameColor: "var(--text)",
    taglineColor: "var(--muted)",
  },
  brotherjimi: {
    icon: "🕊️",
    gradient: "linear-gradient(135deg, #D4A243, #B88830)",
    shadow: "rgba(212,162,67,0.4)",
    name: "Brother Jimi",
    tagline: "The pastoral word",
    sidebarBg: "#FBF6EC",
    sidebarBorder: "#D4A24328",
    headerBg: "linear-gradient(135deg, #D4A243 0%, #B88830 100%)",
    hoverBg: "#FEF0D4",
    hoverColor: "#96610A",
    footerText: "Walk in the Word.",
    footerColor: "#B88830",
    nameColor: "#FFFFFF",
    taglineColor: "rgba(255,255,255,0.75)",
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
  const isBJ = brand === "brotherjimi";

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar — desktop only */}
      <aside
        style={{
          background: b.sidebarBg,
          borderRight: `1px solid ${b.sidebarBorder}`,
          width: 220,
          transition: "background 0.4s, border-color 0.4s",
        }}
        className="flex-shrink-0 flex-col hidden md:flex"
      >
        {/* Logo / brand header — full gradient when BJ */}
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <div
            style={{
              background: b.headerBg,
              borderBottom: `1px solid ${b.sidebarBorder}`,
              padding: "20px",
              transition: "background 0.4s",
            }}
          >
            <div className="flex items-center gap-2.5">
              {/* Icon badge */}
              <div style={{
                width: 32, height: 32,
                background: isBJ ? "rgba(255,255,255,0.2)" : b.gradient,
                borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isBJ ? "1.1rem" : "0.9rem",
                flexShrink: 0,
                boxShadow: isBJ ? "0 2px 8px rgba(0,0,0,0.15)" : `0 3px 8px ${b.shadow}`,
                transition: "all 0.4s",
                border: isBJ ? "1px solid rgba(255,255,255,0.3)" : "none",
              }}>
                {b.icon}
              </div>
              <div>
                <div style={{
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  color: b.nameColor,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                  transition: "color 0.4s",
                  fontStyle: isBJ ? "italic" : "normal",
                }}>
                  {b.name}
                </div>
                <div style={{
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  color: b.taglineColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  transition: "color 0.4s",
                }}>
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
              style={{ textDecoration: "none", color: isBJ ? "#7A5010" : "var(--muted)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = b.hoverBg;
                (e.currentTarget as HTMLAnchorElement).style.color = b.hoverColor;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "";
                (e.currentTarget as HTMLAnchorElement).style.color = isBJ ? "#7A5010" : "var(--muted)";
              }}
            >
              <span style={{ fontSize: "1rem" }}>{icon}</span>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.2 }}>{label}</div>
                <div style={{ fontSize: "0.68rem", opacity: 0.6, lineHeight: 1.2 }}>{sub}</div>
              </div>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="px-5 py-4"
          style={{ borderTop: `1px solid ${b.sidebarBorder}` }}
        >
          <div style={{
            fontSize: "0.72rem",
            color: b.footerColor,
            fontWeight: 600,
            letterSpacing: "0.02em",
            transition: "color 0.4s",
            fontStyle: isBJ ? "italic" : "normal",
          }}>
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
        style={{
          background: isBJ ? "#FBF6EC" : "var(--surface)",
          borderTop: `1px solid ${b.sidebarBorder}`,
          boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
          transition: "background 0.4s",
        }}
      >
        {nav.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
            style={{ textDecoration: "none", color: isBJ ? "#96610A" : "var(--muted)", minHeight: 56 }}
          >
            <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.02em" }}>{label}</span>
          </Link>
        ))}
      </nav>

    </div>
  );
}
