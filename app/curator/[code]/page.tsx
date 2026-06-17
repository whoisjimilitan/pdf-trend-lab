import { notFound } from "next/navigation";

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

  // Feature: Partner affiliate program — database model removed from schema in Phase 3.4A
  const partner = null;

  if (!partner) notFound();
}
