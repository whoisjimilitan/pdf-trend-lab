import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Seeds — Guide Store",
  description: "Instant answers to real problems. Practical PDF guides and pastoral reflection words — instant download, read on any device.",
};

export const revalidate = 300;

const BJ_NICHES = new Set(["grief","doubt","shame","loneliness","fear","exhaustion","faith","healing","identity"]);

const SEED_NICHE_META: Record<string, { label: string; icon: string; caption: string }> = {
  immigration:  { label: "Immigration",   icon: "✈️",  caption: "Passports, visas, residency, work permits" },
  business:     { label: "Business",      icon: "🏢",  caption: "Registration, tax, contracts, trading" },
  finance:      { label: "Finance",       icon: "💰",  caption: "Banking, credit, investments, savings" },
  health:       { label: "Health",        icon: "🏥",  caption: "Navigation, entitlements, processes" },
  legal:        { label: "Legal",         icon: "⚖️",  caption: "Rights, compliance, documentation" },
  education:    { label: "Education",     icon: "📚",  caption: "Applications, funding, qualifications" },
  farming:      { label: "Farming",       icon: "🌱",  caption: "Agribusiness, subsidies, equipment" },
  career:       { label: "Career",        icon: "💼",  caption: "Jobs, CVs, professional development" },
};

const BJ_DOMAIN_META: Record<string, { label: string; icon: string; caption: string }> = {
  grief:        { label: "Grief & Loss",         icon: "🕊️", caption: "For what can't be explained away" },
  doubt:        { label: "Doubt & Distance",     icon: "🌫️", caption: "For when faith feels out of reach" },
  shame:        { label: "Shame & Guilt",        icon: "🔒", caption: "For what you haven't said out loud" },
  loneliness:   { label: "Loneliness",           icon: "🌑", caption: "For the 3am kind of alone" },
  fear:         { label: "Fear & Anxiety",       icon: "⚡", caption: "For when worry won't let you rest" },
  exhaustion:   { label: "Exhaustion & Burnout", icon: "🍂", caption: "For the tired that sleep doesn't fix" },
  identity:     { label: "Identity & Purpose",   icon: "🧭", caption: "For when you've lost the thread of yourself" },
  faith:        { label: "Faith & Healing",      icon: "✨", caption: "For what you're still believing for" },
  healing:      { label: "Healing",              icon: "✦",  caption: "For what is slowly coming back together" },
};

const FLAG: Record<string, string> = {
  GH: "🇬🇭", NG: "🇳🇬", KE: "🇰🇪", ZA: "🇿🇦", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", US: "🇺🇸",
};

const CURRENCY: Record<string, string> = {
  GH: "₵", NG: "₦", KE: "KSh", ZA: "R", GB: "£", CA: "CA$", AU: "A$", US: "$",
};

export default async function StorePage() {
  const products = await prisma.product.findMany({
    where: { published: true },
    include: { opportunity: true },
    orderBy: { createdAt: "desc" },
  });

  // Split by brand
  const bjProducts   = products.filter((p) => BJ_NICHES.has(p.opportunity?.niche ?? ""));
  const seedProducts = products.filter((p) => !BJ_NICHES.has(p.opportunity?.niche ?? ""));

  // Group PDFSeeds by niche (topic) — not country
  const seedGroups: Record<string, typeof seedProducts> = {};
  for (const p of seedProducts) {
    const key = p.opportunity?.niche ?? "other";
    if (!seedGroups[key]) seedGroups[key] = [];
    seedGroups[key].push(p);
  }
  const seedKeys = Object.keys(seedGroups).sort((a, b) => seedGroups[b].length - seedGroups[a].length);

  // Group Brother Jimi by emotional domain
  const bjGroups: Record<string, typeof bjProducts> = {};
  for (const p of bjProducts) {
    const key = p.opportunity?.niche ?? "faith";
    if (!bjGroups[key]) bjGroups[key] = [];
    bjGroups[key].push(p);
  }
  const bjKeys = Object.keys(bjGroups).sort((a, b) => bjGroups[b].length - bjGroups[a].length);

  const hasSeeds = seedProducts.length > 0;
  const hasBJ    = bjProducts.length > 0;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #08090D; color: #E8EAF0; font-family: system-ui, -apple-system, sans-serif; }

        .store-wrap { max-width: 720px; margin: 0 auto; padding: 40px 20px 100px; }

        /* HERO */
        .store-hero { text-align: center; margin-bottom: 60px; padding-bottom: 40px; border-bottom: 1px solid #1F2333; }
        .store-hero-icon { font-size: 2.2rem; margin-bottom: 12px; }
        .store-hero h1 { font-size: 1.9rem; font-weight: 900; line-height: 1.2; margin-bottom: 10px; }
        .store-hero p { color: #5A6080; font-size: 0.9rem; line-height: 1.7; max-width: 460px; margin: 0 auto; }

        /* BRAND SECTION HEADERS */
        .brand-section { margin-bottom: 64px; }
        .brand-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 24px; }
        .brand-header-name { font-size: 1.25rem; font-weight: 900; }
        .brand-header-tag { font-size: 0.75rem; color: #5A6080; margin-top: 3px; }

        /* TOPIC GROUP HEADERS */
        .topic-header { display: flex; align-items: flex-start; gap: 12px; margin: 32px 0 14px; padding-bottom: 12px; border-bottom: 1px solid #1F2333; }
        .topic-icon { font-size: 1.4rem; flex-shrink: 0; margin-top: 2px; }
        .topic-name { font-size: 0.9rem; font-weight: 700; color: #E8EAF0; margin-bottom: 2px; }
        .topic-caption { font-size: 0.75rem; color: #5A6080; }
        .topic-count { font-size: 0.72rem; color: #5A6080; margin-left: auto; padding-top: 4px; }

        /* SEEDS — product cards */
        .seeds-card { background: #0F1117; border: 1px solid #1F2333; border-radius: 14px; padding: 18px; margin-bottom: 10px; display: flex; align-items: flex-start; gap: 14px; transition: border-color 0.15s; }
        .seeds-card:hover { border-color: #6366F150; }
        .seeds-body { flex: 1; min-width: 0; }
        .seeds-title { font-size: 0.9rem; font-weight: 700; line-height: 1.35; color: #E8EAF0; margin-bottom: 8px; }
        .seeds-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
        .seeds-country-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: #5A6080; background: #1A1D2A; border: 1px solid #1F2333; border-radius: 6px; padding: 2px 8px; }
        .seeds-footer { display: flex; align-items: center; gap: 10px; }
        .seeds-price { font-size: 1rem; font-weight: 900; color: #10B981; }
        .seeds-preview { font-size: 0.75rem; color: #5A6080; text-decoration: none; }
        .seeds-preview:hover { color: #818CF8; }
        .seeds-buy { display: inline-block; background: #6366F1; color: #fff; font-weight: 700; font-size: 0.78rem; padding: 7px 16px; border-radius: 8px; text-decoration: none; margin-left: auto; transition: background 0.15s; }
        .seeds-buy:hover { background: #4F46E5; }

        /* BJ — domain group headers */
        .bj-domain-header { display: flex; align-items: flex-start; gap: 12px; margin: 32px 0 14px; padding-bottom: 12px; border-bottom: 1px solid #D4A24318; }
        .bj-domain-icon { font-size: 1.4rem; flex-shrink: 0; margin-top: 2px; }
        .bj-domain-name { font-size: 0.9rem; font-weight: 600; color: #D4A574; font-style: italic; margin-bottom: 2px; }
        .bj-domain-caption { font-size: 0.75rem; color: #5A6080; font-style: italic; }
        .bj-domain-count { font-size: 0.72rem; color: #5A6080; margin-left: auto; padding-top: 4px; }

        /* BJ — product cards */
        .bj-card { background: #0A0B0F; border: 1px solid #1A1B22; border-radius: 14px; padding: 20px 22px; margin-bottom: 10px; transition: border-color 0.2s; }
        .bj-card:hover { border-color: #D4A24340; }
        .bj-card-title { font-size: 0.95rem; font-weight: 500; color: #D4C4B0; line-height: 1.45; margin-bottom: 10px; font-style: italic; font-family: Georgia, 'Times New Roman', serif; }
        .bj-card-pain { font-size: 0.82rem; color: #5A6080; line-height: 1.65; margin-bottom: 14px; font-style: italic; font-family: Georgia, 'Times New Roman', serif; }
        .bj-card-footer { display: flex; align-items: center; gap: 10px; }
        .bj-price { font-size: 0.95rem; font-weight: 700; color: #D4A243; }
        .bj-receive { display: inline-block; background: transparent; color: #D4A243; font-size: 0.78rem; padding: 7px 16px; border-radius: 8px; text-decoration: none; border: 1px solid #D4A24340; font-style: italic; margin-left: auto; transition: all 0.15s; }
        .bj-receive:hover { background: #D4A24318; border-color: #D4A243; }

        /* DIVIDER */
        .brand-divider { border: none; border-top: 1px solid #1F2333; margin: 48px 0; }

        /* EMPTY */
        .empty { text-align: center; padding: 60px 20px; color: #5A6080; }
        .empty h2 { font-size: 1.1rem; margin-bottom: 8px; }

        /* FOOTER */
        .store-footer { text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid #1F2333; }
        .store-footer p { font-size: 0.78rem; color: #5A6080; }
        .store-footer a { color: #6366F1; text-decoration: none; }

        @media (max-width: 480px) {
          .store-hero h1 { font-size: 1.5rem; }
          .seeds-card, .bj-card { padding: 14px; }
        }
        @media (max-width: 400px) {
          .seeds-footer { flex-wrap: wrap; gap: 8px; }
          .seeds-buy { margin-left: 0; width: 100%; text-align: center; }
          .bj-card-footer { flex-wrap: wrap; gap: 8px; }
          .bj-receive { margin-left: 0; width: 100%; text-align: center; }
        }
      `}</style>

      <div className="store-wrap">

        {/* Hero */}
        <div className="store-hero">
          <div className="store-hero-icon">📚</div>
          <h1>The Full Collection</h1>
          <p>Practical guides that solve real problems. Pastoral words for what you&apos;re carrying. Instant download — read on your phone right now.</p>
        </div>

        {/* ── PDF SEEDS ────────────────────────────────────────────────────────── */}
        {hasSeeds && (
          <section className="brand-section" id="pdfseeds">
            <div className="brand-header">
              <div>
                <div className="brand-header-name">🌱 PDF Seeds</div>
                <div className="brand-header-tag">Practical clarity guides · {seedProducts.length} guide{seedProducts.length !== 1 ? "s" : ""}</div>
              </div>
            </div>

            {seedKeys.map((niche) => {
              const group = seedGroups[niche];
              const meta = SEED_NICHE_META[niche] ?? { label: niche, icon: "📄", caption: "" };

              return (
                <div key={niche}>
                  <div className="topic-header">
                    <span className="topic-icon">{meta.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div className="topic-name">{meta.label}</div>
                      <div className="topic-caption">{meta.caption}</div>
                    </div>
                    <span className="topic-count">{group.length} guide{group.length !== 1 ? "s" : ""}</span>
                  </div>

                  {group.map((p) => {
                    const countryCode = p.opportunity?.country ?? "GB";
                    const flag = FLAG[countryCode] ?? "🌍";
                    const sym = p.opportunity?.isDiaspora ? "£" : (CURRENCY[countryCode] ?? "£");
                    const priceAmt = p.opportunity?.minPrice ?? 9.99;

                    return (
                      <div key={p.id} className="seeds-card">
                        <div className="seeds-body">
                          <div className="seeds-title">{p.title}</div>
                          <div className="seeds-meta">
                            <span className="seeds-country-tag">
                              {flag} {p.opportunity?.isReturning ? "Return guide" : p.opportunity?.isExpat ? "Expat guide" : p.opportunity?.isDiaspora ? "Diaspora guide" : countryCode}
                            </span>
                          </div>
                          <div className="seeds-footer">
                            <span className="seeds-price">{sym}{priceAmt.toFixed(2)}</span>
                            {p.slug && (
                              <a href={`/guide/${p.slug}`} className="seeds-preview">Preview →</a>
                            )}
                            <a href={`/sell/${p.slug}`} className="seeds-buy">Get Guide →</a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </section>
        )}

        {hasSeeds && hasBJ && <hr className="brand-divider" />}

        {/* ── BROTHER JIMI ─────────────────────────────────────────────────────── */}
        {hasBJ && (
          <section className="brand-section" id="brotherjimi">
            <div className="brand-header">
              <div>
                <div className="brand-header-name" style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: "#D4A574" }}>✦ Brother Jimi</div>
                <div className="brand-header-tag">Pastoral reflection guides · {bjProducts.length} word{bjProducts.length !== 1 ? "s" : ""}</div>
              </div>
            </div>

            {bjKeys.map((domain) => {
              const group = bjGroups[domain];
              const meta = BJ_DOMAIN_META[domain] ?? { label: domain, icon: "✦", caption: "" };

              return (
                <div key={domain}>
                  <div className="bj-domain-header">
                    <span className="bj-domain-icon">{meta.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div className="bj-domain-name">{meta.label}</div>
                      <div className="bj-domain-caption">{meta.caption}</div>
                    </div>
                    <span className="bj-domain-count">{group.length} word{group.length !== 1 ? "s" : ""}</span>
                  </div>

                  {group.map((p) => {
                    const painPoint = p.opportunity?.painPoint ?? "";
                    const priceAmt = p.opportunity?.minPrice ?? 7;

                    return (
                      <div key={p.id} className="bj-card">
                        <div className="bj-card-title">{p.title}</div>
                        {painPoint && (
                          <div className="bj-card-pain">&ldquo;{painPoint}&rdquo;</div>
                        )}
                        <div className="bj-card-footer">
                          <span className="bj-price">£{priceAmt.toFixed(2)}</span>
                          <a href={`/sell/${p.slug}`} className="bj-receive">Receive this word →</a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </section>
        )}

        {!hasSeeds && !hasBJ && (
          <div className="empty">
            <h2>Guides coming soon</h2>
            <p>Check back shortly — new guides are being added regularly.</p>
          </div>
        )}

        <div className="store-footer">
          <p>All guides are instant downloads &nbsp;·&nbsp; 30-day money-back guarantee &nbsp;·&nbsp; <a href="/">PDF Seeds</a></p>
        </div>
      </div>
    </>
  );
}
