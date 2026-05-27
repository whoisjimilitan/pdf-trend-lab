import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import CopyButton from "./CopyButton";
import GenerateGuide from "./GenerateGuide";
import GenerateCuratorGuides from "./GenerateCuratorGuides";

export const revalidate = 60;

const SITE = "https://pdfseeds.com";

const COUNTRY_LABELS: Record<string, string> = {
  GH: "Ghana",
  NG: "Nigeria",
  KE: "Kenya",
  ZA: "South Africa",
  GB: "UK Diaspora",
  CA: "Canada",
  AU: "Australia",
  US: "United States",
};

const COUNTRY_FLAGS: Record<string, string> = {
  GH: "🇬🇭",
  NG: "🇳🇬",
  KE: "🇰🇪",
  ZA: "🇿🇦",
  GB: "🇬🇧",
  CA: "🇨🇦",
  AU: "🇦🇺",
  US: "🇺🇸",
};

const PLATFORM_META: Record<string, { label: string; icon: string; color: string }> = {
  whatsapp:   { label: "WhatsApp",   icon: "💬", color: "#25D366" },
  youtube:    { label: "YouTube",    icon: "▶",  color: "#DC2626" },
  tiktok:     { label: "TikTok",     icon: "♪",  color: "#374151" },
  instagram:  { label: "Instagram",  icon: "📸", color: "#DB2777" },
  newsletter: { label: "Newsletter", icon: "✉️", color: "#6D28D9" },
};

const TOPIC_NICHE: Record<string, string> = {
  passports: "immigration",
  property: "finance",
  business: "business",
  healthcare: "health",
  education: "education",
  finance: "finance",
  legal: "legal",
  farming: "farming",
};

const PLATFORM_TEMPLATES = (link: string) => [
  {
    platform: "whatsapp",
    platformLabel: "WhatsApp",
    color: "#16A34A",
    bg: "#F0FFF4",
    border: "#BBF7D0",
    icon: "💬",
    templates: [
      {
        label: "Community group",
        text: `Saw this and thought of the group — PDF guides for navigating your home country from abroad. Passports, visas, business, property. No Google rabbit holes. One guide that covers it properly. £9.99 → ${link}`,
      },
      {
        label: "Reactive (someone just asked)",
        text: `Someone just asked about this in the group — found a proper guide: ${link}`,
      },
    ],
  },
  {
    platform: "youtube",
    platformLabel: "YouTube",
    color: "#DC2626",
    bg: "#FFF1F1",
    border: "#FECACA",
    icon: "📹",
    templates: [
      {
        label: "Video description",
        text: `Navigating your home country from abroad? I've been sharing this with my community — step-by-step PDF guides for passports, visas, business, property and more. No agent, no guesswork. Check it out: ${link}`,
      },
      {
        label: "Community post",
        text: `For everyone who's been asking about this — there's a proper guide for it: ${link}`,
      },
    ],
  },
  {
    platform: "tiktok",
    platformLabel: "TikTok",
    color: "#374151",
    bg: "#F9FAFB",
    border: "#E5E7EB",
    icon: "🎵",
    templates: [
      {
        label: "Caption + bio CTA",
        text: `If you're trying to navigate your home country from abroad — this will save you weeks of confusion. Full guide, link in bio → ${link}`,
      },
    ],
  },
  {
    platform: "instagram",
    platformLabel: "Instagram",
    color: "#DB2777",
    bg: "#FDF2F8",
    border: "#FBCFE8",
    icon: "📸",
    templates: [
      {
        label: "Post caption",
        text: `One thing I wish I'd found earlier — proper step-by-step PDF guides for navigating home. Passports. Visas. Business. Property. No agent. No Google rabbit hole. Link in bio → ${link}`,
      },
      {
        label: "Story caption",
        text: `Navigating your home country from abroad? This is what I've been sharing with my community. Swipe up / link in bio → ${link}`,
      },
    ],
  },
  {
    platform: "newsletter",
    platformLabel: "Newsletter",
    color: "#6D28D9",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    icon: "📧",
    templates: [
      {
        label: "Email snippet",
        text: `This week I wanted to share something useful — PDF Seeds has step-by-step guides for navigating your home country from abroad. Passports, visas, property, business — all covered. One guide, instant download, £9.99. Worth it: ${link}`,
      },
    ],
  },
];

const DAILY_TIPS: Record<number, { platform: string; tip: string; hook: string }> = {
  0: { platform: "WhatsApp", hook: "React, don't broadcast.", tip: "Reply directly to a question someone just asked. 'Found a guide for this exact thing' converts 3–5× better than a generic group post." },
  1: { platform: "TikTok",   hook: "Ask the question your audience is thinking.", tip: "Start with 15 seconds: 'Did you know you can register a business in Ghana from the UK in 48 hours?' End with 'Full guide, link in bio'." },
  2: { platform: "Instagram", hook: "The FAQ carousel is the highest-performing format.", tip: "Turn one question your community keeps asking into a 5-slide carousel. Last slide: 'Get the full guide →'. Carousels save 3× better than single images." },
  3: { platform: "Newsletter", hook: "One sentence outperforms a paragraph every time.", tip: "Drop this into your next email: 'For anyone navigating X, I found a proper guide — not a Google rabbit hole.' Trust does the selling." },
  4: { platform: "YouTube",   hook: "Your description is permanent — make it work.", tip: "Add your link to the description of any relevant video — including old ones. Description traffic is passive and builds for months after upload." },
  5: { platform: "Instagram", hook: "The poll pre-qualifies your audience for free.", tip: "Run a Story poll: 'Do you know how to [do X back home]?' Yes/No. Follow up with 'Here's the guide if you said No.'" },
  6: { platform: "WhatsApp",  hook: "Set it and forget it.", tip: "Pin your referral link in your WhatsApp group description — not a post, the group info itself. Every new member sees it before anything else." },
};

export default async function PartnerDashboard({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const partner = await prisma.partner.findUnique({
    where: { code },
    include: { sales: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  if (!partner) notFound();

  if (!partner.onboarded) {
    redirect(`/curator/${code}/onboard`);
  }

  // Parse stored community data
  const topics: string[] = JSON.parse(partner.communityTopics || "[]");
  const niches = topics.map((t) => TOPIC_NICHE[t]).filter(Boolean);

  // Personalized guide query
  const myGuides = await prisma.product.findMany({
    where: {
      published: true,
      ...(niches.length > 0 || partner.communityCountry
        ? {
            opportunity: {
              OR: [
                ...(partner.communityCountry ? [{ country: partner.communityCountry }] : []),
                ...(niches.length > 0 ? [{ niche: { in: niches } }] : []),
              ],
            },
          }
        : {}),
    },
    orderBy: { salesCount: "desc" },
    take: 6,
    include: { opportunity: true },
  });

  // Pending engine-curated opportunities (not yet products)
  const curatedIds: string[] = JSON.parse(partner.curatedGuides || "[]");
  const pendingOpps =
    curatedIds.length > 0
      ? await prisma.opportunity.findMany({
          where: { id: { in: curatedIds }, products: { none: {} } },
          take: 5,
          select: { id: true, pdfTitle: true, niche: true, country: true },
        })
      : [];

  // Fallback guides if no personalized results
  const fallbackGuides =
    myGuides.length === 0
      ? await prisma.product.findMany({
          where: { published: true },
          orderBy: { salesCount: "desc" },
          take: 3,
          include: { opportunity: { select: { minPrice: true, country: true } } },
        })
      : null;

  const myLink = `${SITE}/?ref=${partner.code}`;
  const allPlatformTemplates = PLATFORM_TEMPLATES(myLink);

  // Sort: partner's platform first, then rest
  const platformKey = partner.platform ?? "";
  const orderedTemplates = [
    ...allPlatformTemplates.filter((p) => p.platform === platformKey),
    ...allPlatformTemplates.filter((p) => p.platform !== platformKey),
  ];

  const payout = partner.totalEarned.toFixed(2);
  const nextPayout = Math.max(0, 19.99 - partner.totalEarned).toFixed(2);
  const recovered = partner.totalEarned >= 19.99;
  const recoveryPct = Math.min(100, (partner.totalEarned / 19.99) * 100);
  const todayTip = DAILY_TIPS[new Date().getDay()];

  const countryLabel = partner.communityCountry ? COUNTRY_LABELS[partner.communityCountry] ?? partner.communityCountry : null;
  const countryFlag = partner.communityCountry ? COUNTRY_FLAGS[partner.communityCountry] ?? "" : "";
  const platformMeta = partner.platform ? PLATFORM_META[partner.platform] : null;

  const topicLabels: Record<string, string> = {
    passports: "Passports",
    property: "Property",
    business: "Business",
    healthcare: "Healthcare",
    education: "Education",
    finance: "Finance",
    legal: "Legal",
    farming: "Farming",
  };

  const guidesToShow = myGuides.length > 0 ? myGuides : (fallbackGuides ?? []);
  const isPersonalized = myGuides.length > 0;

  return (
    <>
      <style>{`
        body { background: #FAF9F7 !important; font-family: -apple-system,"Inter",system-ui,sans-serif; color: #1A1008; }
        * { box-sizing: border-box; }
        .pd { max-width: 640px; margin: 0 auto; padding: 48px 24px 80px; }
        .pd-header { margin-bottom: 36px; }
        .pd-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 32px; }
        .pd-logo-mark { width: 32px; height: 32px; background: linear-gradient(135deg,#7C3AED,#4F46E5); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
        .pd-logo-name { font-size: 0.95rem; font-weight: 800; color: #1A1008; letter-spacing: -0.02em; }
        .pd-welcome { font-size: 1.5rem; font-weight: 900; color: #1A1008; letter-spacing: -0.03em; margin: 0 0 6px; }
        .pd-sub { font-size: 0.88rem; color: #8C7D6E; margin: 0 0 10px; }
        .pd-profile-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
        .pd-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 0.72rem; font-weight: 700; background: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 999px; padding: 3px 10px; color: #7C3AED; }

        .pd-code-block { background: #F5F3FF; border: 1.5px solid #DDD6FE; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; }
        .pd-code-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #7C3AED; margin-bottom: 8px; }
        .pd-code-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .pd-code-link { font-size: 0.88rem; font-weight: 600; color: #1A1008; word-break: break-all; }
        .pd-code-badge { font-size: 0.72rem; font-weight: 700; color: #7C3AED; background: #EDE9FE; border-radius: 999px; padding: 3px 10px; flex-shrink: 0; }

        .pd-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 32px; }
        .pd-stat { background: #FFFFFF; border: 1px solid #EAE6E0; border-radius: 12px; padding: 16px; text-align: center; }
        .pd-stat-val { font-size: 1.35rem; font-weight: 800; color: #1A1008; letter-spacing: -0.02em; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pd-stat-label { font-size: 0.62rem; color: #B0A89A; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 600; }

        .pd-section { margin-bottom: 32px; }
        .pd-section-title { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9B8AF0; margin-bottom: 14px; }
        .pd-section-h { font-size: 1.05rem; font-weight: 800; color: #1A1008; letter-spacing: -0.02em; margin: 0 0 14px; }

        .pd-guide-card { background: #FFFFFF; border: 1.5px solid #EAE6E0; border-radius: 14px; padding: 16px 18px; margin-bottom: 10px; }
        .pd-guide-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .pd-guide-title { font-size: 0.88rem; font-weight: 600; color: #1A1008; line-height: 1.4; }
        .pd-guide-meta { font-size: 0.72rem; color: #B0A89A; margin-top: 3px; }
        .pd-guide-caption { font-size: 0.78rem; color: #6B5E52; line-height: 1.6; margin-top: 10px; padding-top: 10px; border-top: 1px solid #F5F0EB; }
        .pd-guide-copy { flex-shrink: 0; }

        .pd-pending { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 14px; padding: 16px 18px; margin-bottom: 10px; }
        .pd-pending-title { font-size: 0.88rem; font-weight: 600; color: #92400E; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .pd-coming-badge { font-size: 0.62rem; font-weight: 700; background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 999px; padding: 2px 8px; color: #92400E; text-transform: uppercase; letter-spacing: 0.05em; flex-shrink: 0; }

        .pd-template { background: #FFFFFF; border: 1.5px solid #EAE6E0; border-radius: 14px; padding: 18px 20px; margin-bottom: 10px; }
        .pd-template-type { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .pd-template-icon { font-size: 1rem; }
        .pd-template-label { font-size: 0.78rem; font-weight: 700; color: #7C3AED; }
        .pd-template-text { font-size: 0.85rem; color: #4B3D30; line-height: 1.7; margin-bottom: 14px; }

        .pd-recover-bar { background: #FFFFFF; border: 1px solid #EAE6E0; border-radius: 12px; padding: 14px 18px; margin-bottom: 32px; }
        .pd-recover-bar-label { display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; font-weight: 600; margin-bottom: 10px; }
        .pd-recover-bar-track { height: 6px; background: #EAE6E0; border-radius: 999px; overflow: hidden; }
        .pd-recover-bar-fill { height: 100%; background: linear-gradient(90deg, #7C3AED, #A78BFA); border-radius: 999px; transition: width 0.6s ease; }

        .pd-platform-section { margin-bottom: 20px; }
        .pd-platform-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .pd-platform-name { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.04em; }
        .pd-template { background: #FFFFFF; border: 1.5px solid #EAE6E0; border-radius: 14px; padding: 16px 18px; margin-bottom: 8px; }
        .pd-template-label { font-size: 0.65rem; font-weight: 700; color: #B0A89A; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 8px; }
        .pd-template-text { font-size: 0.84rem; color: #4B3D30; line-height: 1.7; margin-bottom: 12px; }

        .pd-platform-primary { border: 2px solid #7C3AED; border-radius: 16px; padding: 16px; background: #FAF5FF; margin-bottom: 20px; }
        .pd-platform-primary-label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #7C3AED; margin-bottom: 12px; }

        .pd-sales { background: #FFFFFF; border: 1.5px solid #EAE6E0; border-radius: 14px; overflow: hidden; }
        .pd-sales-row { padding: 12px 18px; border-bottom: 1px solid #F5F0EB; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 0.83rem; }
        .pd-sales-row:last-child { border-bottom: none; }
        .pd-sales-slug { color: #4B3D30; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
        .pd-sales-earn { color: #7C3AED; font-weight: 700; flex-shrink: 0; }
        .pd-sales-date { color: #C4BAB0; font-size: 0.72rem; flex-shrink: 0; }

        .pd-tip { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px 18px; font-size: 0.85rem; color: #92400E; line-height: 1.7; }
        .pd-tip strong { color: #78350F; }
        .pd-tip-platform { display: inline-flex; align-items: center; font-size: 0.62rem; font-weight: 800; background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 999px; padding: 2px 9px; color: #92400E; letter-spacing: 0.04em; margin-bottom: 8px; text-transform: uppercase; }

        @media (max-width: 600px) {
          .pd { padding: 32px 16px 64px; }
          .pd-stats { grid-template-columns: repeat(3,1fr); gap: 8px; }
          .pd-stat-val { font-size: 1.1rem; }
          .pd-code-link { font-size: 0.8rem; }
        }
      `}</style>

      <div className="pd">

        <div className="pd-header">
          <a href="/" className="pd-logo">
            <div className="pd-logo-mark">🌱</div>
            <span className="pd-logo-name">PDF Seeds</span>
          </a>
          <div className="pd-welcome">Your Curator Dashboard</div>
          <p className="pd-sub">Everything you need to start earning. Bookmark this page.</p>
          {(countryLabel || platformMeta) && (
            <div className="pd-profile-badges">
              {countryLabel && (
                <span className="pd-badge">
                  {countryFlag} {countryLabel} community
                </span>
              )}
              {platformMeta && (
                <span className="pd-badge" style={{ color: platformMeta.color, borderColor: platformMeta.color, background: "#FAFAFA" }}>
                  {platformMeta.icon} {platformMeta.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Your unique link */}
        <div className="pd-code-block">
          <div className="pd-code-label">Your curator link</div>
          <div className="pd-code-row">
            <div className="pd-code-link">{myLink}</div>
            <div className="pd-code-badge">{partner.code}</div>
          </div>
          <div style={{ marginTop: 12 }}>
            <CopyButton text={myLink} label="Copy link" />
          </div>
        </div>

        {/* Stats */}
        <div className="pd-stats">
          <div className="pd-stat">
            <div className="pd-stat-val">{partner.salesCount}</div>
            <div className="pd-stat-label">Sales</div>
          </div>
          <div className="pd-stat">
            <div className="pd-stat-val">£{payout}</div>
            <div className="pd-stat-label">Earned</div>
          </div>
          <div className="pd-stat">
            <div className="pd-stat-val">80%</div>
            <div className="pd-stat-label">Your cut</div>
          </div>
        </div>

        {/* Recovery progress bar */}
        <div className="pd-recover-bar">
          <div className="pd-recover-bar-label">
            <span style={{ color: recovered ? "#15803D" : "#6B5E52" }}>
              {recovered ? "✓ Join fee recovered — all profit from here" : `£${nextPayout} to recover your join fee`}
            </span>
            <span style={{ color: "#C4BAB0", fontWeight: 500 }}>{Math.round(recoveryPct)}%</span>
          </div>
          <div className="pd-recover-bar-track">
            <div className="pd-recover-bar-fill" style={{ width: `${recoveryPct}%`, background: recovered ? "linear-gradient(90deg,#10B981,#34D399)" : undefined }} />
          </div>
        </div>

        {/* Generate a guide on demand */}
        <GenerateGuide partnerCode={partner.code} />

        {/* Your community's guides */}
        <div className="pd-section">
          <div className="pd-section-title">
            {isPersonalized ? "Your community's guides" : "Start here"}
          </div>
          <div className="pd-section-h">
            {isPersonalized && countryLabel
              ? `Matched to ${countryLabel}${topics.length > 0 ? " · " + topics.map((t) => topicLabels[t] ?? t).join(", ") : ""}`
              : "The guides that convert best"}
          </div>
          {guidesToShow.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "#B0A89A" }}>Guides coming soon — check back shortly.</p>
          ) : guidesToShow.map((g) => {
            const guideLink = `${SITE}/sell/${g.slug}?ref=${partner.code}`;
            const price = g.opportunity.minPrice ?? 9.99;
            const platformCaption: Record<string, string> = {
              whatsapp: `Found this for the group — proper step-by-step on "${g.title}". Saves hours of back and forth. ${guideLink}`,
              youtube: `For anyone asking about this — I linked the full guide in the description. "${g.title}" covers every step. ${guideLink}`,
              tiktok: `Link in bio → ${g.title}. Full step-by-step, no fluff.`,
              instagram: `Sharing this for anyone navigating this 👇 "${g.title}" — everything you need in one PDF. Link in bio → ${guideLink}`,
              newsletter: `One for your reading list: "${g.title}" — a clean, step-by-step guide that removes the guesswork. ${guideLink}`,
            };
            const caption = partner.platform ? platformCaption[partner.platform] : null;
            return (
              <div key={g.id} className="pd-guide-card">
                <div className="pd-guide-row">
                  <div>
                    <div className="pd-guide-title">{g.title}</div>
                    <div className="pd-guide-meta">
                      £{price.toFixed(2)} · {g.salesCount} sold · you earn £{(price * 0.80).toFixed(2)}
                    </div>
                  </div>
                  <div className="pd-guide-copy">
                    <CopyButton text={guideLink} label="Copy link" small />
                  </div>
                </div>
                {caption && (
                  <div className="pd-guide-caption">
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#9B8AF0", display: "block", marginBottom: 4 }}>
                      {PLATFORM_META[partner.platform!]?.icon} Ready to send
                    </span>
                    {caption}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* In preparation section */}
        {pendingOpps.length > 0 && (
          <div className="pd-section">
            <div className="pd-section-title">Being prepared for your community</div>
            <div className="pd-section-h" style={{ marginBottom: 8 }}>
              {pendingOpps.length} guide{pendingOpps.length !== 1 ? "s" : ""} {pendingOpps.length !== 1 ? "are" : "is"} being built based on your community profile. {pendingOpps.length !== 1 ? "They'll" : "It'll"} appear here when ready.
            </div>
            {pendingOpps.map((opp) => (
              <div key={opp.id} className="pd-pending">
                <div className="pd-pending-title">
                  <span>{opp.pdfTitle || opp.niche}</span>
                  <span className="pd-coming-badge">Coming soon</span>
                </div>
              </div>
            ))}
            <GenerateCuratorGuides code={partner.code} />
          </div>
        )}

        {/* Platform templates */}
        <div className="pd-section">
          <div className="pd-section-title">Ready to send</div>
          <div className="pd-section-h">Platform templates — pick your channel</div>

          {/* Primary platform — prominent */}
          {partner.platform && (
            <>
              {orderedTemplates.filter((p) => p.platform === partner.platform).map((p) => (
                <div key={p.platform} className="pd-platform-primary">
                  <div className="pd-platform-primary-label">Your platform · {p.platformLabel}</div>
                  <div className="pd-platform-header">
                    <span>{p.icon}</span>
                    <span className="pd-platform-name" style={{ color: p.color }}>{p.platformLabel}</span>
                  </div>
                  {p.templates.map((t) => (
                    <div key={t.label} className="pd-template">
                      <div className="pd-template-label">{t.label}</div>
                      <div className="pd-template-text">{t.text}</div>
                      <CopyButton text={t.text} label="Copy message" />
                    </div>
                  ))}
                </div>
              ))}

              {/* Other platforms — secondary */}
              {orderedTemplates.filter((p) => p.platform !== partner.platform).map((p) => (
                <div key={p.platform} className="pd-platform-section">
                  <div className="pd-platform-header">
                    <span>{p.icon}</span>
                    <span className="pd-platform-name" style={{ color: p.color }}>{p.platformLabel}</span>
                  </div>
                  {p.templates.map((t) => (
                    <div key={t.label} className="pd-template">
                      <div className="pd-template-label">{t.label}</div>
                      <div className="pd-template-text">{t.text}</div>
                      <CopyButton text={t.text} label="Copy message" />
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* No platform set — show all */}
          {!partner.platform && orderedTemplates.map((p) => (
            <div key={p.platform} className="pd-platform-section">
              <div className="pd-platform-header">
                <span>{p.icon}</span>
                <span className="pd-platform-name" style={{ color: p.color }}>{p.platformLabel}</span>
              </div>
              {p.templates.map((t) => (
                <div key={t.label} className="pd-template">
                  <div className="pd-template-label">{t.label}</div>
                  <div className="pd-template-text">{t.text}</div>
                  <CopyButton text={t.text} label="Copy message" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Today's action tip */}
        <div className="pd-section">
          <div className="pd-tip">
            <div className="pd-tip-platform">{todayTip.platform} · Today&apos;s action</div>
            <strong>{todayTip.hook}</strong> {todayTip.tip}
          </div>
        </div>

        {/* Recent sales */}
        {partner.sales.length > 0 && (
          <div className="pd-section">
            <div className="pd-section-title">Your recent sales</div>
            <div className="pd-sales">
              {partner.sales.map((s) => (
                <div key={s.id} className="pd-sales-row">
                  <div className="pd-sales-slug">{s.productSlug}</div>
                  <div className="pd-sales-earn">+£{s.commission.toFixed(2)}</div>
                  <div className="pd-sales-date">{new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize: "0.75rem", color: "#C4BAB0", textAlign: "center", marginTop: 16 }}>
          Questions? Email <a href="mailto:hello@pdfseeds.com" style={{ color: "#9B8AF0" }}>hello@pdfseeds.com</a>
        </div>

      </div>
    </>
  );
}
