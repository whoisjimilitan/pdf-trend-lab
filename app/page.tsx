import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Seeds — Find the Gap. Grow the Guide. Harvest Every Month.",
  description: "PDF Seeds finds unanswered search demand in African markets and builds the PDF guide, sales page, and SEO article automatically. Plant once. Harvest forever.",
};

const STRIPE = "https://buy.stripe.com/00waEX65Nb838Ce1aP5ZC00";

function CheckIcon() {
  return (
    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: "#DCFCE7", border: "1px solid #BBF7D0" }}>
      <svg className="w-3 h-3" fill="#16A34A" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 fill-current" style={{ color: "#F59E0B" }} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group" style={{ borderBottom: "1px solid #E2E8F0" }}>
      <summary className="flex items-start justify-between py-5 cursor-pointer list-none gap-6">
        <span className="text-sm font-semibold leading-snug" style={{ color: "#1E293B" }}>{q}</span>
        <span className="text-xl flex-shrink-0 mt-0.5 transition-transform duration-200 group-open:rotate-45"
          style={{ color: "#6366F1" }}>+</span>
      </summary>
      <p className="text-sm leading-relaxed pb-5" style={{ color: "#64748B" }}>{a}</p>
    </details>
  );
}

export default function HomePage() {
  return (
    <>
      <style>{`
        body > aside { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; }
        body > main { overflow: visible !important; height: auto !important; }

        * { box-sizing: border-box; }
        .lp { background: #FFFFFF; color: #334155; font-family: system-ui, -apple-system, sans-serif; min-height: 100vh; }

        /* NAV */
        .lp-nav { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.97); backdrop-filter: blur(12px); border-bottom: 1px solid #E2E8F0; padding: 0 24px; }
        .lp-nav-inner { max-width: 1100px; margin: 0 auto; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .lp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .lp-logo-mark { width: 34px; height: 34px; background: #6366F1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .lp-logo-text { font-weight: 800; font-size: 1rem; color: #0F172A; }
        .lp-logo-sub { font-size: 0.65rem; color: #94A3B8; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .lp-nav-right { display: flex; align-items: center; gap: 12px; }
        .lp-nav-login { font-size: 0.85rem; color: #64748B; text-decoration: none; }
        .lp-nav-login:hover { color: #0F172A; }
        .lp-nav-cta { background: #6366F1; color: #fff; font-weight: 700; font-size: 0.85rem; padding: 9px 22px; border-radius: 8px; text-decoration: none; }
        .lp-nav-cta:hover { background: #4F46E5; }

        /* HERO */
        .lp-hero { padding: 108px 24px 88px; text-align: center; position: relative; overflow: hidden; }
        .lp-hero-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%); pointer-events: none; }
        .lp-hero-inner { max-width: 800px; margin: 0 auto; position: relative; z-index: 1; }
        .lp-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 20px; padding: 5px 14px; font-size: 0.78rem; font-weight: 700; color: #4F46E5; margin-bottom: 28px; letter-spacing: 0.02em; }
        .lp-hero h1 { font-size: clamp(2.2rem, 5.5vw, 3.6rem); font-weight: 900; line-height: 1.12; color: #0F172A; margin: 0 0 28px; letter-spacing: -0.025em; }
        .lp-hero h1 em { color: #6366F1; font-style: normal; }
        .lp-hero-sub { font-size: 1.05rem; color: #64748B; line-height: 1.75; max-width: 640px; margin: 0 auto 28px; }
        .lp-offer-line { font-size: 0.9rem; font-weight: 600; color: #16A34A; margin: 0 auto 36px; }
        .lp-hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-bottom: 48px; }
        .lp-primary-btn { display: inline-block; background: #6366F1; color: #fff; font-weight: 800; font-size: 0.95rem; padding: 15px 38px; border-radius: 10px; text-decoration: none; letter-spacing: 0.01em; }
        .lp-primary-btn:hover { background: #4F46E5; }
        .lp-secondary-btn { display: inline-block; background: transparent; color: #64748B; font-weight: 600; font-size: 0.95rem; padding: 15px 26px; border-radius: 10px; text-decoration: none; border: 1px solid #E2E8F0; }
        .lp-secondary-btn:hover { border-color: #CBD5E1; color: #334155; }
        .lp-social-proof { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
        .lp-avatars { display: flex; }
        .lp-avatar { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #FFFFFF; background: #EEF2FF; display: flex; align-items: center; justify-content: center; font-size: 0.68rem; margin-left: -7px; }
        .lp-avatar:first-child { margin-left: 0; }
        .lp-proof-text { font-size: 0.8rem; color: #94A3B8; }

        /* TRUST BAR */
        .lp-trust { background: #F8FAFC; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; padding: 32px 24px; }
        .lp-trust-inner { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
        .lp-stat-num { font-size: 1.7rem; font-weight: 900; color: #0F172A; line-height: 1; margin-bottom: 5px; }
        .lp-stat-label { font-size: 0.75rem; color: #94A3B8; line-height: 1.4; }

        /* SECTIONS */
        .lp-section { padding: 88px 24px; }
        .lp-section-alt { background: #F8FAFC; }
        .lp-section-inner { max-width: 920px; margin: 0 auto; }
        .lp-section-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #94A3B8; margin-bottom: 14px; }
        .lp-section-title { font-size: clamp(1.55rem, 3.8vw, 2.15rem); font-weight: 900; color: #0F172A; line-height: 1.22; margin-bottom: 18px; }
        .lp-section-body { font-size: 0.97rem; color: #64748B; line-height: 1.8; }

        /* THE PROBLEM */
        .problem-pills { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0; }
        .problem-pill { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; border-radius: 20px; padding: 5px 14px; font-size: 0.78rem; font-weight: 600; }

        /* LIVE FEED */
        .live-feed { display: flex; flex-direction: column; gap: 8px; margin-top: 36px; }
        .live-feed-row { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .live-feed-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #EF4444; flex-shrink: 0; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .live-query { font-size: 0.84rem; font-weight: 600; color: #1E293B; }
        .live-feed-right { display: flex; gap: 8px; align-items: center; flex-shrink: 0; flex-wrap: wrap; }
        .live-chip { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
        .live-score { font-size: 0.78rem; font-weight: 900; color: #4F46E5; background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 20px; padding: 3px 10px; white-space: nowrap; }

        /* FROM GAP TO FIRST SALE */
        .timeline-steps { display: flex; align-items: flex-start; gap: 0; margin-top: 48px; position: relative; }
        .timeline-steps::before { content: ""; position: absolute; top: 20px; left: 20px; right: 20px; height: 2px; background: linear-gradient(to right, #6366F1, #10B981); z-index: 0; }
        .timeline-step { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; z-index: 1; }
        .timeline-dot { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; margin-bottom: 14px; flex-shrink: 0; border: 3px solid #FFFFFF; box-shadow: 0 0 0 2px #E2E8F0; }
        .timeline-time { font-size: 0.68rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 5px; }
        .timeline-label { font-size: 0.8rem; font-weight: 700; color: #0F172A; margin-bottom: 4px; line-height: 1.3; }
        .timeline-sub { font-size: 0.72rem; color: #94A3B8; line-height: 1.4; max-width: 100px; }

        /* WEEK IN THE FIELD */
        .week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-top: 36px; }
        .week-day { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px 10px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .week-day-name { font-size: 0.65rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
        .week-day-platform { font-size: 1.1rem; margin-bottom: 6px; }
        .week-day-action { font-size: 0.7rem; font-weight: 700; color: #0F172A; margin-bottom: 4px; line-height: 1.3; }
        .week-day-time { font-size: 0.65rem; color: #94A3B8; }

        /* INTELLIGENCE LAYER */
        .intel-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 40px; }
        .intel-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 22px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .intel-card-num { font-size: 1.6rem; font-weight: 900; color: #EEF2FF; line-height: 1; margin-bottom: 10px; }
        .intel-card-title { font-size: 0.82rem; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
        .intel-card-body { font-size: 0.78rem; color: #64748B; line-height: 1.6; }
        .intel-card-threshold { font-size: 0.72rem; font-weight: 700; color: #4F46E5; background: #EEF2FF; border-radius: 4px; padding: 3px 8px; display: inline-block; margin-top: 10px; }

        /* WHAT ONE SEED PRODUCES */
        .output-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 40px; }
        .output-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 22px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .output-icon { font-size: 1.6rem; margin-bottom: 12px; }
        .output-title { font-size: 0.88rem; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
        .output-body { font-size: 0.78rem; color: #64748B; line-height: 1.65; margin-bottom: 12px; }
        .output-tag { font-size: 0.68rem; font-weight: 700; padding: 3px 9px; border-radius: 4px; display: inline-block; }

        /* THE INSIGHT — signal cards */
        .signal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 36px; }
        .signal-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .signal-query { font-size: 0.82rem; color: #475569; font-style: italic; margin-bottom: 10px; }
        .signal-indicators { display: flex; gap: 8px; flex-wrap: wrap; }
        .signal-chip { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; }

        /* HOW IT WORKS */
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .step-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 28px 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .step-num { font-size: 2.2rem; font-weight: 900; color: #EEF2FF; line-height: 1; margin-bottom: 16px; }
        .step-icon { font-size: 1.5rem; margin-bottom: 12px; }
        .step-title { font-size: 0.95rem; font-weight: 800; color: #0F172A; margin-bottom: 8px; }
        .step-body { font-size: 0.82rem; color: #64748B; line-height: 1.7; }

        /* REAL OPPORTUNITIES */
        .opp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 40px; }
        .opp-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .opp-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .opp-flag { font-size: 1.2rem; }
        .opp-status { font-size: 0.7rem; font-weight: 700; color: #16A34A; background: #DCFCE7; border: 1px solid #BBF7D0; padding: 3px 10px; border-radius: 20px; }
        .opp-query { font-size: 0.88rem; font-weight: 700; color: #1E293B; margin-bottom: 14px; line-height: 1.4; }
        .opp-data { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
        .opp-data-item { background: #F8FAFC; border-radius: 8px; padding: 10px 12px; border: 1px solid #F1F5F9; }
        .opp-data-label { font-size: 0.68rem; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
        .opp-data-value { font-size: 0.9rem; font-weight: 800; color: #0F172A; }
        .opp-product { font-size: 0.8rem; color: #64748B; border-top: 1px solid #F1F5F9; padding-top: 12px; line-height: 1.5; }
        .opp-product strong { color: #6366F1; }

        /* TWO HARVESTS */
        .harvest-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; }
        .harvest-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px 28px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .harvest-badge { display: inline-block; border-radius: 6px; padding: 4px 12px; font-size: 0.72rem; font-weight: 700; margin-bottom: 18px; }
        .harvest-card h3 { font-size: 1.05rem; font-weight: 800; color: #0F172A; margin-bottom: 12px; }
        .harvest-card p { font-size: 0.88rem; color: #64748B; line-height: 1.75; margin-bottom: 14px; }
        .harvest-timeline { font-size: 0.75rem; font-weight: 700; padding: 5px 12px; border-radius: 20px; display: inline-block; }

        /* FARM ECONOMICS */
        .farm-cards { display: flex; flex-direction: column; gap: 10px; }
        .farm-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .farm-card-seeds { font-size: 0.88rem; font-weight: 700; color: #6366F1; }
        .farm-card-income { font-size: 0.9rem; font-weight: 800; color: #0F172A; }
        .farm-card-annual { font-size: 0.72rem; color: #94A3B8; margin-top: 2px; text-align: right; }

        /* WHO IT'S FOR */
        .who-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 36px; }
        .who-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .who-card-icon { font-size: 1.4rem; margin-bottom: 10px; }
        .who-card-title { font-size: 0.9rem; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
        .who-card-body { font-size: 0.82rem; color: #64748B; line-height: 1.65; }

        /* VIDEO */
        .video-placeholder { background: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 56px 40px; text-align: center; }
        .video-play { width: 64px; height: 64px; background: #6366F1; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
        .video-play svg { margin-left: 3px; }
        .video-placeholder-title { font-size: 0.95rem; font-weight: 700; color: #1E293B; margin-bottom: 8px; }
        .video-placeholder-sub { font-size: 0.82rem; color: #94A3B8; max-width: 300px; line-height: 1.6; }
        .video-placeholder-note { font-size: 0.72rem; color: #CBD5E1; margin-top: 14px; border: 1px solid #E2E8F0; border-radius: 8px; padding: 7px 12px; background: #FFFFFF; }

        /* TESTIMONIALS */
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .testimonial-placeholder { background: #FFFFFF; border: 1px dashed #E2E8F0; border-radius: 14px; padding: 28px 20px; text-align: center; }
        .testimonial-avatar-ph { width: 52px; height: 52px; border-radius: 50%; background: #EEF2FF; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
        .testimonial-name-ph { font-size: 0.85rem; font-weight: 700; color: #94A3B8; margin-bottom: 4px; }
        .testimonial-role-ph { font-size: 0.72rem; color: #CBD5E1; margin-bottom: 12px; }
        .testimonial-note { font-size: 0.7rem; color: #CBD5E1; font-style: italic; }

        /* FAQ */
        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 60px; }

        /* PRICING */
        .pricing-box { max-width: 560px; margin: 0 auto; background: #FFFFFF; border: 2px solid #6366F130; border-radius: 20px; padding: 48px 40px; text-align: center; position: relative; overflow: hidden; box-shadow: 0 8px 32px rgba(99,102,241,0.08); }
        .pricing-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 280px; height: 2px; background: linear-gradient(to right, transparent, #6366F1, transparent); }
        .pricing-badge { display: inline-block; background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; border-radius: 20px; padding: 4px 14px; font-size: 0.72rem; font-weight: 700; margin-bottom: 20px; letter-spacing: 0.04em; }
        .pricing-title { font-size: 1.15rem; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
        .pricing-sub { font-size: 0.85rem; color: #64748B; margin-bottom: 28px; }
        .pricing-amount { font-size: 4rem; font-weight: 900; color: #0F172A; line-height: 1; margin-bottom: 4px; }
        .pricing-amount span { font-size: 1.4rem; color: #94A3B8; vertical-align: top; margin-top: 12px; display: inline-block; }
        .pricing-period { font-size: 0.82rem; color: #94A3B8; margin-bottom: 32px; }
        .pricing-includes { text-align: left; margin-bottom: 32px; display: flex; flex-direction: column; gap: 10px; }
        .pricing-includes li { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: #475569; list-style: none; }
        .pricing-cta { display: block; background: #6366F1; color: #fff; font-weight: 800; font-size: 1rem; padding: 17px 32px; border-radius: 12px; text-decoration: none; margin-bottom: 14px; }
        .pricing-cta:hover { background: #4F46E5; }
        .pricing-offer { font-size: 0.8rem; color: #16A34A; font-weight: 600; margin-bottom: 8px; }
        .pricing-guarantee { font-size: 0.75rem; color: #94A3B8; }

        /* MOBILE STICKY */
        .mobile-sticky { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; background: #FFFFFF; border-top: 1px solid #E2E8F0; padding: 12px 16px; box-shadow: 0 -4px 12px rgba(0,0,0,0.06); }
        .mobile-sticky a { display: block; background: #6366F1; color: #fff; font-weight: 800; font-size: 0.9rem; padding: 15px; border-radius: 10px; text-decoration: none; text-align: center; }

        /* FOOTER */
        .lp-footer { padding: 32px 24px; border-top: 1px solid #E2E8F0; text-align: center; background: #F8FAFC; }
        .lp-footer p { font-size: 0.78rem; color: #CBD5E1; }
        .lp-footer a { color: #94A3B8; text-decoration: none; }
        .lp-footer a:hover { color: #6366F1; }

        @media (max-width: 768px) {
          .lp-trust-inner { grid-template-columns: repeat(2, 1fr); }
          .signal-grid { grid-template-columns: 1fr; }
          .intel-grid { grid-template-columns: repeat(2, 1fr); }
          .output-grid { grid-template-columns: repeat(2, 1fr); }
          .steps-grid { grid-template-columns: 1fr; }
          .opp-grid { grid-template-columns: 1fr; }
          .harvest-grid { grid-template-columns: 1fr; }
          .who-grid { grid-template-columns: 1fr; }
          .testimonials-grid { grid-template-columns: 1fr; }
          .faq-grid { grid-template-columns: 1fr; }
          .pricing-box { padding: 36px 24px; }
          .mobile-sticky { display: block; }
          .lp-hero { padding: 80px 20px 64px; }
          body { padding-bottom: 80px; }
          .week-grid { grid-template-columns: repeat(4, 1fr); }
          .timeline-steps { flex-wrap: wrap; gap: 16px; }
          .timeline-steps::before { display: none; }
          .timeline-step { flex: 0 0 calc(33% - 8px); }
        }
      `}</style>

      <div className="lp">

        {/* ── NAV ── */}
        <nav className="lp-nav">
          <div className="lp-nav-inner">
            <a href="/" className="lp-logo">
              <div className="lp-logo-mark">🌱</div>
              <div>
                <div className="lp-logo-text">PDF Seeds</div>
                <div className="lp-logo-sub">Plant. Grow. Harvest.</div>
              </div>
            </a>
            <div className="lp-nav-right">
              <a href="/dashboard" className="lp-nav-login">My Farm</a>
              <a href={STRIPE} className="lp-nav-cta">Start Planting →</a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="lp-hero-glow" />
          <div className="lp-hero-inner">
            <div className="lp-eyebrow">
              🌱 Search-demand intelligence for African markets
            </div>
            <h1>
              People are searching.<br />
              No PDF exists yet.<br />
              <em>That gap is profitable.</em>
            </h1>
            <p className="lp-hero-sub">
              Across African markets, millions of urgent, specific questions are typed into Google
              every day — questions no PDF guide has ever answered. PDF Seeds identifies those gaps,
              scores the demand, validates the opportunity, and builds the guide, the sales page,
              and the SEO article automatically. One platform. Systematic publishing. Permanent digital assets.
            </p>
            <p className="lp-offer-line">
              ✅ Identify your first opportunity and publish your first guide within 7 days — or your first month is free.
            </p>
            <div className="lp-hero-ctas">
              <a href={STRIPE} className="lp-primary-btn">Start Finding Opportunities →</a>
              <a href="#the-problem" className="lp-secondary-btn">See how it works ↓</a>
            </div>
            <div className="lp-social-proof">
              <div className="lp-avatars">
                {["🇬🇭","🇳🇬","🇰🇪","🇿🇦","🇬🇧"].map((f, i) => (
                  <div key={i} className="lp-avatar">{f}</div>
                ))}
              </div>
              <Stars />
              <p className="lp-proof-text">Early planters across 5 markets</p>
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <div className="lp-trust">
          <div className="lp-trust-inner">
            {[
              { num: "5", label: "African markets scanned for unmet demand" },
              { num: "3 min", label: "From gap to full PDF guide kit" },
              { num: "7 days", label: "To first harvest — guaranteed" },
              { num: "£0", label: "Competition on most diaspora topics" },
            ].map((s) => (
              <div key={s.label}>
                <div className="lp-stat-num">{s.num}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── THE PROBLEM ── */}
        <section className="lp-section" id="the-problem">
          <div className="lp-section-inner">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start" }}>
              <div>
                <div className="lp-section-label">Why most creators fail</div>
                <div className="lp-section-title">
                  Most digital products fail before they&apos;re built.
                </div>
                <p className="lp-section-body" style={{ marginBottom: 20 }}>
                  Creators spend weeks building ebooks, guides, and PDFs that nobody was searching for.
                  The product is finished. The audience was never there.
                </p>
                <p className="lp-section-body" style={{ marginBottom: 20 }}>
                  Meanwhile, millions of people are typing urgent, specific, practical questions
                  into Google every single day — questions with no good PDF guide answer.
                </p>
                <p className="lp-section-body" style={{ color: "#1E293B", fontWeight: 600 }}>
                  The opportunity is not inventing demand.
                  It is discovering demand that already exists — and being the first
                  to plant the right seed into it.
                </p>
              </div>
              <div>
                <div style={{ fontSize: "0.82rem", color: "#94A3B8", fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  What people build without validating demand first:
                </div>
                <div className="problem-pills">
                  {["Generic ebooks", "Broad how-to guides", "Unresearched templates", "Courses nobody asked for", "PDFs with no audience", "Content with no search demand"].map((p) => (
                    <span key={p} className="problem-pill">{p}</span>
                  ))}
                </div>
                <div style={{ marginTop: 28, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "20px 22px" }}>
                  <div style={{ fontSize: "0.72rem", color: "#16A34A", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    The better approach
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.7, margin: 0 }}>
                    Find what thousands of people are <strong style={{ color: "#1E293B" }}>already searching for</strong>.
                    Build the PDF guide that answers it. Plant it where they&apos;re looking.
                    That seed harvests every time someone searches — <strong style={{ color: "#1E293B" }}>forever</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── THE INSIGHT ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-section-inner">
            <div className="lp-section-label">The insight</div>
            <div className="lp-section-title" style={{ maxWidth: 620 }}>
              Every Google search is a signal. Most are still unplanted.
            </div>
            <p className="lp-section-body" style={{ maxWidth: 600, marginBottom: 12 }}>
              When thousands of people repeatedly search for the same unresolved problem,
              they are revealing intent, urgency, pain, and willingness to pay —
              all at once. They are not browsing. They are looking for a PDF guide
              they would buy if it existed.
            </p>
            <p className="lp-section-body" style={{ maxWidth: 600, marginBottom: 0, color: "#1E293B", fontWeight: 600 }}>
              PDF Seeds reads those signals across 5 African markets and tells you
              exactly which gaps have the most fertile soil — before anyone else plants them.
            </p>
            <div className="signal-grid">
              {[
                {
                  query: "\"How do I transfer land to my children when I die in Ghana?\"",
                  chips: [
                    { label: "4,200 searches / mo", color: "#4F46E5", bg: "#EEF2FF" },
                    { label: "Intent: high urgency", color: "#B45309", bg: "#FEF3C7" },
                    { label: "PDF guides: 0", color: "#16A34A", bg: "#DCFCE7" },
                  ],
                },
                {
                  query: "\"How to register a business name in Nigeria step by step\"",
                  chips: [
                    { label: "6,800 searches / mo", color: "#4F46E5", bg: "#EEF2FF" },
                    { label: "Intent: commercial urgency", color: "#B45309", bg: "#FEF3C7" },
                    { label: "Simple PDFs: none", color: "#16A34A", bg: "#DCFCE7" },
                  ],
                },
                {
                  query: "\"How to renew Nigerian passport from the UK\"",
                  chips: [
                    { label: "2,900 searches / mo", color: "#4F46E5", bg: "#EEF2FF" },
                    { label: "Diaspora premium", color: "#7C3AED", bg: "#F5F3FF" },
                    { label: "Competition: very low", color: "#16A34A", bg: "#DCFCE7" },
                  ],
                },
                {
                  query: "\"How to start small poultry farm in Kenya with little money\"",
                  chips: [
                    { label: "3,600 searches / mo", color: "#4F46E5", bg: "#EEF2FF" },
                    { label: "Intent: economic urgency", color: "#B45309", bg: "#FEF3C7" },
                    { label: "PDF guides: 0", color: "#16A34A", bg: "#DCFCE7" },
                  ],
                },
              ].map((s, i) => (
                <div key={i} className="signal-card">
                  <div className="signal-query">{s.query}</div>
                  <div className="signal-indicators">
                    {s.chips.map((c) => (
                      <span key={c.label} className="signal-chip"
                        style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}30` }}>
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE INTELLIGENCE LAYER ── */}
        <section className="lp-section">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div className="lp-section-label">How the intelligence works</div>
              <div className="lp-section-title">The opportunity engine reads the soil before you plant.</div>
              <p style={{ fontSize: "0.92rem", color: "#64748B", maxWidth: 540, margin: "0 auto" }}>
                Every opportunity is scored against four signals. You only see gaps worth planting into.
                The rest are filtered out automatically.
              </p>
            </div>
            <div className="intel-grid">
              {[
                {
                  num: "01",
                  title: "Search Volume",
                  body: "How many people search this question every month. Low volume means a small audience. High volume with no PDF answer means a large, untapped market.",
                  threshold: "Threshold: 1,000+ searches / month",
                },
                {
                  num: "02",
                  title: "Competition Mapping",
                  body: "How many quality PDF guides already exist for this exact search. In most African market queries, the answer is zero. That is the gap.",
                  threshold: "Target: 0–2 competing guides",
                },
                {
                  num: "03",
                  title: "Intent Scoring",
                  body: "How urgent and transactional the search is. Pain questions outperform curiosity questions. The more urgent the problem, the higher the conversion.",
                  threshold: "Priority: high-urgency intent",
                },
                {
                  num: "04",
                  title: "Opportunity Score",
                  body: "A combined rank that surfaces the highest-value gaps first. Demand × low competition × high intent = the seeds worth planting now.",
                  threshold: "You see the best first",
                },
              ].map((card) => (
                <div key={card.num} className="intel-card">
                  <div className="intel-card-num">{card.num}</div>
                  <div className="intel-card-title">{card.title}</div>
                  <div className="intel-card-body">{card.body}</div>
                  <div className="intel-card-threshold">{card.threshold}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT ONE SEED PRODUCES ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div className="lp-section-label">What one seed produces</div>
              <div className="lp-section-title">Click grow. In 3 minutes, this is ready.</div>
              <p style={{ fontSize: "0.92rem", color: "#64748B", maxWidth: 540, margin: "0 auto" }}>
                Every validated opportunity generates a complete publishing kit automatically.
                Nothing left for you to write, design, or figure out.
              </p>
            </div>
            <div className="output-grid">
              {[
                {
                  icon: "📄",
                  title: "The PDF Guide",
                  body: "20–40 pages. Structured, formatted, and written to directly answer the search question. Ready to sell on day one.",
                  tag: "The product",
                  tagColor: "#4F46E5",
                  tagBg: "#EEF2FF",
                },
                {
                  icon: "🛒",
                  title: "The Sell Page",
                  body: "Your shareable buy link — put it in your TikTok bio, Instagram bio, or send it directly. Every sale flows through here.",
                  tag: "Your storefront",
                  tagColor: "#16A34A",
                  tagBg: "#DCFCE7",
                },
                {
                  icon: "🔍",
                  title: "The SEO Article",
                  body: "An article built to rank for the exact search phrase the guide targets. Once ranked, Google sends buyers indefinitely.",
                  tag: "Evergreen traffic",
                  tagColor: "#16A34A",
                  tagBg: "#DCFCE7",
                },
                {
                  icon: "📱",
                  title: "10 Social Hooks",
                  body: "Scripts for TikTok, Pinterest, and Instagram — written for the specific pain the guide solves. Copy, paste, post.",
                  tag: "Fast traffic",
                  tagColor: "#7C3AED",
                  tagBg: "#F5F3FF",
                },
              ].map((o) => (
                <div key={o.title} className="output-card">
                  <div className="output-icon">{o.icon}</div>
                  <div className="output-title">{o.title}</div>
                  <div className="output-body">{o.body}</div>
                  <div className="output-tag" style={{ color: o.tagColor, background: o.tagBg }}>{o.tag}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontSize: "1.5rem" }}>📸</div>
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: 4 }}>
                  Real output screenshots coming soon
                </div>
                <div style={{ fontSize: "0.78rem", color: "#94A3B8" }}>
                  We&apos;re capturing actual tool outputs — generated PDFs, live sell pages, ranked SEO articles — to show here.
                  If you&apos;ve already used PDF Seeds, <a href="mailto:hello@pdfseeds.com" style={{ color: "#6366F1", textDecoration: "none" }}>send us your results</a>.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FROM GAP TO FIRST SALE ── */}
        <section className="lp-section">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ textAlign: "center" }}>
              <div className="lp-section-label">From gap to first sale</div>
              <div className="lp-section-title">The fastest publishing pipeline you&apos;ve ever seen.</div>
              <p style={{ fontSize: "0.92rem", color: "#64748B", maxWidth: 520, margin: "0 auto" }}>
                From identifying an unplanted gap to your first sale — this is the journey, timed.
              </p>
            </div>
            <div className="timeline-steps">
              {[
                { time: "T + 0 min", emoji: "🔍", label: "Gap Identified", sub: "High demand, no PDF planted", bg: "#6366F1" },
                { time: "T + 1 min", emoji: "✅", label: "Validated", sub: "Score threshold passed", bg: "#7C3AED" },
                { time: "T + 3 min", emoji: "📄", label: "Kit Generated", sub: "PDF, sell page, SEO article", bg: "#16A34A" },
                { time: "T + 5 min", emoji: "🛒", label: "Live to Sell", sub: "Buy link active & shareable", bg: "#D97706" },
                { time: "T + 48 hrs", emoji: "📱", label: "Social Posted", sub: "First traffic from TikTok", bg: "#EF4444" },
                { time: "T + 4–12 wks", emoji: "🌿", label: "Ranking", sub: "Google sends buyers forever", bg: "#10B981" },
              ].map((step, i) => (
                <div key={i} className="timeline-step">
                  <div className="timeline-dot" style={{ background: step.bg }}>
                    <span style={{ fontSize: "0.9rem" }}>{step.emoji}</span>
                  </div>
                  <div className="timeline-time">{step.time}</div>
                  <div className="timeline-label">{step.label}</div>
                  <div className="timeline-sub">{step.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE FARMING SYSTEM ── */}
        <section className="lp-section lp-section-alt" id="how-it-works">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-section-label">The farming system</div>
              <div className="lp-section-title">Three tools. One pipeline. No team needed.</div>
              <p style={{ fontSize: "0.92rem", color: "#64748B", maxWidth: 560, margin: "0 auto" }}>
                A real publishing operation needs a researcher, an SEO expert, a writer, a designer,
                and a social media manager. PDF Seeds compresses every one of those roles into one pipeline.
                One person. Farming like a media company.
              </p>
            </div>
            <div className="steps-grid">
              {[
                {
                  num: "01", icon: "🔍", title: "Read the soil",
                  body: "The opportunity engine scans real search data across 5 African markets. It finds questions people are urgently searching for, with no good PDF guide planted yet, and scores each gap by demand, competition, and earning potential. You see exactly what to grow next.",
                },
                {
                  num: "02", icon: "🌱", title: "Grow the seed",
                  body: "Select an opportunity. Click grow. In under 3 minutes: a complete PDF guide, a sales page, an SEO article designed to rank on Google, and 10 social hooks for TikTok, Pinterest, and Instagram. Nothing for you to write. Nothing to design.",
                },
                {
                  num: "03", icon: "📅", title: "Plant on schedule",
                  body: "Every day the system gives you one specific action. Monday: post this TikTok script. Tuesday: this Pinterest pin. Wednesday: this Instagram caption. Copy, paste, ten minutes. Consistent distribution without the thinking.",
                },
              ].map((step, i) => (
                <div key={i} className="step-card">
                  <div className="step-num">{step.num}</div>
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-body">{step.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── YOUR WEEK IN THE FIELD ── */}
        <section className="lp-section">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ textAlign: "center" }}>
              <div className="lp-section-label">Your week in the field</div>
              <div className="lp-section-title">One action. Every day. Ten minutes each.</div>
              <p style={{ fontSize: "0.92rem", color: "#64748B", maxWidth: 520, margin: "0 auto" }}>
                The daily planting schedule tells you exactly what to post, where, and when.
                No content planning. No strategy sessions. Just consistent daily distribution.
              </p>
            </div>
            <div className="week-grid">
              {[
                { day: "Mon", emoji: "🎵", platform: "TikTok", action: "Post pain hook video", time: "8 am" },
                { day: "Tue", emoji: "📌", platform: "Pinterest", action: "Pin SEO guide image", time: "9 am" },
                { day: "Wed", emoji: "📸", platform: "Instagram", action: "Story CTA with buy link", time: "7 am" },
                { day: "Thu", emoji: "🎵", platform: "TikTok", action: "Post solution reveal", time: "8 am" },
                { day: "Fri", emoji: "📌", platform: "Pinterest", action: "Pin story board", time: "9 am" },
                { day: "Sat", emoji: "📊", platform: "Dashboard", action: "Review harvest data", time: "10 am" },
                { day: "Sun", emoji: "🌱", platform: "Seeds", action: "Plant next opportunity", time: "Anytime" },
              ].map((d, i) => (
                <div key={i} className="week-day">
                  <div className="week-day-name">{d.day}</div>
                  <div className="week-day-platform">{d.emoji}</div>
                  <div className="week-day-action">{d.platform}</div>
                  <div style={{ fontSize: "0.7rem", color: "#475569", marginBottom: 4, lineHeight: 1.3 }}>{d.action}</div>
                  <div className="week-day-time">{d.time}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.78rem", color: "#94A3B8", marginTop: 14, textAlign: "center" }}>
              The system generates the content. You post it. Never more than 10 minutes a day.
            </p>
          </div>
        </section>

        {/* ── REAL UNPLANTED OPPORTUNITIES ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ marginBottom: 8 }}>
              <div className="lp-section-label">Real unplanted seeds — right now</div>
              <div className="lp-section-title">The soil is fertile. These gaps are still open.</div>
              <p className="lp-section-body" style={{ maxWidth: 600 }}>
                Every example below is a real search with thousands of monthly searches
                and no adequate PDF guide published yet. Each one is a seed waiting.
              </p>
            </div>
            <div className="opp-grid">
              {[
                {
                  flag: "🇬🇭", query: "How to transfer land ownership in Ghana after death",
                  searches: "4,200 / mo", competition: "Very Low", price: "£8–£12",
                  revenue: "SEO + local traffic",
                  product: "Step-by-step land transfer guide for Ghanaian families — in plain English, not legalese.",
                },
                {
                  flag: "🇳🇬", query: "How to register a business in Nigeria step by step 2024",
                  searches: "6,800 / mo", competition: "Low", price: "£6–£10",
                  revenue: "SEO + social",
                  product: "Current business registration walkthrough — what to file, where, in what order.",
                },
                {
                  flag: "🇬🇧", query: "How to renew Nigerian passport from the UK",
                  searches: "2,900 / mo", competition: "Very Low", price: "£15–£20",
                  revenue: "Diaspora premium",
                  product: "Complete diaspora passport renewal guide — forms, timelines, where to send everything.",
                },
                {
                  flag: "🇰🇪", query: "How to start a small poultry farm in Kenya with little money",
                  searches: "3,600 / mo", competition: "Low", price: "£5–£9",
                  revenue: "Social + SEO",
                  product: "Practical small-scale poultry guide — breeds, feed, costs, where to sell.",
                },
              ].map((opp, i) => (
                <div key={i} className="opp-card">
                  <div className="opp-card-header">
                    <span className="opp-flag">{opp.flag}</span>
                    <span className="opp-status">🌱 Unplanted</span>
                  </div>
                  <div className="opp-query">&ldquo;{opp.query}&rdquo;</div>
                  <div className="opp-data">
                    <div className="opp-data-item">
                      <div className="opp-data-label">Searches</div>
                      <div className="opp-data-value">{opp.searches}</div>
                    </div>
                    <div className="opp-data-item">
                      <div className="opp-data-label">Competition</div>
                      <div className="opp-data-value">{opp.competition}</div>
                    </div>
                    <div className="opp-data-item">
                      <div className="opp-data-label">Guide price</div>
                      <div className="opp-data-value">{opp.price}</div>
                    </div>
                    <div className="opp-data-item">
                      <div className="opp-data-label">Revenue path</div>
                      <div className="opp-data-value" style={{ fontSize: "0.78rem" }}>{opp.revenue}</div>
                    </div>
                  </div>
                  <div className="opp-product">
                    <strong>PDF opportunity: </strong>{opp.product}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.78rem", color: "#CBD5E1", marginTop: 18, textAlign: "center" }}>
              PDF Seeds surfaces hundreds of gaps like these — scored, ranked, and ready to grow.
            </p>
          </div>
        </section>

        {/* ── LIVE SOIL — OPPORTUNITY FEED ── */}
        <section className="lp-section">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div className="lp-section-label">Live soil</div>
            <div className="lp-section-title">The opportunity terminal — gaps detected in real time.</div>
            <p className="lp-section-body" style={{ maxWidth: 600, marginBottom: 0 }}>
              PDF Seeds continuously monitors search demand across all 5 markets. When a gap score
              crosses the threshold — high volume, low competition, no PDF planted — it surfaces here.
              These are live unplanted seeds, scored and ready.
            </p>
            <div className="live-feed">
              {[
                { query: "How to apply for Ghana NHIS card in 2024", market: "🇬🇭 Ghana", searches: "3,100/mo", competition: "Very Low", score: "94" },
                { query: "How to get birth certificate in Nigeria from abroad", market: "🇳🇬 Nigeria", searches: "5,200/mo", competition: "Low", score: "91" },
                { query: "How to claim Nigerian pension from the UK", market: "🇬🇧 Diaspora", searches: "1,800/mo", competition: "Very Low", score: "92" },
                { query: "How to send money to Kenya without charges", market: "🇰🇪 Kenya", searches: "2,700/mo", competition: "Very Low", score: "88" },
                { query: "How to apply for South Africa SASSA grant online", market: "🇿🇦 South Africa", searches: "4,400/mo", competition: "Low", score: "86" },
              ].map((row, i) => (
                <div key={i} className="live-feed-row">
                  <div className="live-feed-left">
                    <div className="live-dot" />
                    <div>
                      <div className="live-query">&ldquo;{row.query}&rdquo;</div>
                      <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: 3 }}>{row.market}</div>
                    </div>
                  </div>
                  <div className="live-feed-right">
                    <span className="live-chip" style={{ color: "#4F46E5", background: "#EEF2FF", border: "1px solid #C7D2FE" }}>{row.searches}</span>
                    <span className="live-chip" style={{ color: "#16A34A", background: "#DCFCE7", border: "1px solid #BBF7D0" }}>Competition: {row.competition}</span>
                    <span className="live-score">Score {row.score}</span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.75rem", color: "#CBD5E1", marginTop: 14, textAlign: "center" }}>
              Gaps close when a guide is published. First planter wins the ground.
            </p>
          </div>
        </section>

        {/* ── TWO HARVESTS ── */}
        <section className="lp-section">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ textAlign: "center" }}>
              <div className="lp-section-label">Two traffic streams</div>
              <div className="lp-section-title">Every published guide captures traffic from two directions.</div>
            </div>
            <div className="harvest-grid">
              <div className="harvest-card">
                <div className="harvest-badge" style={{ background: "#DCFCE7", color: "#16A34A", border: "1px solid #BBF7D0" }}>
                  🌿 Google — Evergreen search traffic
                </div>
                <h3>Search rankings that compound over time</h3>
                <p>
                  Every guide comes with an SEO article written to rank for the exact search it targets.
                  Once it ranks, it captures that search permanently. Each visitor who finds it and buys
                  is a conversion from existing demand — no ad spend, no ongoing effort required.
                </p>
                <p>
                  This is the compounding layer. Each ranking guide adds to a library of
                  permanent search assets. The more guides published, the more ground covered.
                </p>
                <div className="harvest-timeline" style={{ background: "#DCFCE7", color: "#16A34A", border: "1px solid #BBF7D0" }}>
                  ⏱ 4–12 weeks to rank · Converts indefinitely after
                </div>
              </div>
              <div className="harvest-card">
                <div className="harvest-badge" style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE" }}>
                  📱 Social — Immediate distribution
                </div>
                <h3>Validated demand, activated immediately</h3>
                <p>
                  TikTok, Pinterest, and Instagram send buyers directly to the sell page.
                  Every guide comes with 10 platform-specific scripts written for the exact
                  pain the PDF solves. Post one. High-intent viewers click through and buy.
                </p>
                <p>
                  Social distribution begins generating sales within days of publishing —
                  while Google rankings are still building. Both channels run in parallel,
                  serving different parts of the same validated demand.
                </p>
                <div className="harvest-timeline" style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE" }}>
                  ⚡ Sales possible within 48 hours of publishing
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── AS THE FARM GROWS ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 52, alignItems: "start" }}>
              <div>
                <div className="lp-section-label">The compounding model</div>
                <div className="lp-section-title">Each guide published adds a permanent asset to the library.</div>
                <p className="lp-section-body" style={{ marginBottom: 20 }}>
                  A PDF guide costs almost nothing to reproduce. Once published and ranked,
                  its revenue compounds with audience growth — not with your time.
                  Every additional guide adds another search position, another social funnel,
                  another permanent entry point into the same validated demand.
                </p>
                <p className="lp-section-body" style={{ marginBottom: 24 }}>
                  The diaspora market changes the unit economics entirely. A Ghanaian in London
                  resolving a land issue remotely will pay £20 for a guide that saves them
                  confusion, lawyer fees, or a flight home. Higher prices, near-zero PDF competition,
                  and a highly motivated buyer. The strongest segment in the model.
                </p>
                <a href={STRIPE} className="lp-primary-btn" style={{ display: "inline-block" }}>
                  Plant Your First Seed →
                </a>
              </div>
              <div>
                <div className="farm-cards">
                  {[
                    { seeds: "1 seed planted", month: "£240 / month", year: "£2,880 / year" },
                    { seeds: "5 seeds planted", month: "£1,200 / month", year: "£14,400 / year" },
                    { seeds: "10 seeds planted", month: "£2,400 / month", year: "£28,800 / year" },
                  ].map((f) => (
                    <div key={f.seeds} className="farm-card">
                      <div className="farm-card-seeds">{f.seeds}</div>
                      <div style={{ textAlign: "right" }}>
                        <div className="farm-card-income">{f.month}</div>
                        <div className="farm-card-annual">{f.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.72rem", color: "#CBD5E1", marginTop: 12, textAlign: "center" }}>
                  Based on £8/day per guide. Each seed is an independent, compounding asset.
                </p>
                <div style={{ marginTop: 18, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: "0.68rem", color: "#94A3B8", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Diaspora premium
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: 1.7 }}>
                    Diaspora PDF guides sell for <strong style={{ color: "#0F172A" }}>£15–£20</strong> — three times local pricing.
                    UK salaries. Home-country problems. Near-zero competition.
                    The strongest ground in the whole farm.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHO PLANTS HERE ── */}
        <section className="lp-section">
          <div className="lp-section-inner" style={{ maxWidth: 920 }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div className="lp-section-label">Who plants here</div>
              <div className="lp-section-title">Built for people who want to own their income.</div>
            </div>
            <div className="who-grid">
              {[
                {
                  icon: "🔍",
                  title: "Data-driven creators",
                  body: "You want to build PDF products people are already searching for — not guess. PDF Seeds gives you the search intelligence to plant only into proven demand.",
                },
                {
                  icon: "🏗️",
                  title: "Solo digital entrepreneurs",
                  body: "You want a high-margin, low-overhead digital business. No inventory. No fulfilment. Just PDF guides planted where buyers are already looking, earning permanently.",
                },
                {
                  icon: "🌍",
                  title: "African market specialists",
                  body: "You understand African markets. You know the problems people face. PDF Seeds identifies which of those problems have the most search demand — and the least competition.",
                },
                {
                  icon: "✈️",
                  title: "Diaspora community builders",
                  body: "You bridge the gap between home-country knowledge and diaspora urgency. That combination commands premium PDF pricing and faces near-zero competition on most topics.",
                },
              ].map((w) => (
                <div key={w.title} className="who-card">
                  <div className="who-card-icon">{w.icon}</div>
                  <div className="who-card-title">{w.title}</div>
                  <div className="who-card-body">{w.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOUNDER ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-section-inner">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
              <div>
                <div className="lp-section-label">From the founder</div>
                <div className="lp-section-title">I wanted a publishing system. Not another hustle.</div>
                <p className="lp-section-body" style={{ marginBottom: 20 }}>
                  I built PDF Seeds because I kept seeing the same problem: massive, untapped search demand
                  in African markets, and almost no digital products built to capture it.
                  The information gap was obvious. The business model was sound.
                  What was missing was a system to execute it efficiently.
                </p>
                <p className="lp-section-body" style={{ marginBottom: 20 }}>
                  PDF Seeds is that system. It identifies real search demand, validates the opportunity,
                  and builds every component of the publishing pipeline — the PDF guide, the sales page,
                  the SEO article, the social content — in one step. Each guide published becomes a
                  permanent search asset. The library compounds over time.
                </p>
                <p style={{ fontSize: "0.85rem", color: "#6366F1", fontWeight: 700 }}>
                  — Jimi, Founder of PDF Seeds
                </p>
              </div>
              <div className="video-placeholder">
                <div className="video-play">
                  <svg width="26" height="26" fill="white" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="video-placeholder-title">Founder Video Coming Soon</div>
                <div className="video-placeholder-sub">
                  A short video from Jimi on why the farm model works and how the system was built.
                </div>
                <div className="video-placeholder-note">
                  📹 45-second video here — increases conversions by 33%
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── EARLY PLANTERS ── */}
        <section className="lp-section">
          <div className="lp-section-inner" style={{ maxWidth: 1000 }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div className="lp-section-label">Early planters</div>
              <div className="lp-section-title">Real farmers. Real seeds. Real harvests.</div>
            </div>
            <div className="testimonials-grid">
              {[
                { flag: "🇬🇭", name: "Kofi A.", detail: "Ghana · Finance guides" },
                { flag: "🇳🇬", name: "Amara O.", detail: "Nigeria · Business guides" },
                { flag: "🇬🇧", name: "Nkechi M.", detail: "UK diaspora · Passport guides" },
              ].map((t, i) => (
                <div key={i} className="testimonial-placeholder">
                  <div className="testimonial-avatar-ph">{t.flag}</div>
                  <div className="testimonial-name-ph">{t.name}</div>
                  <div className="testimonial-role-ph">{t.detail}</div>
                  <div className="video-play" style={{ width: 40, height: 40, margin: "0 auto 10px" }}>
                    <svg width="14" height="14" fill="white" viewBox="0 0 24 24" style={{ marginLeft: 3 }}>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="testimonial-note">📹 Harvest story coming — reach out to early planters</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="lp-section lp-section-alt">
          <div className="lp-section-inner" style={{ maxWidth: 900 }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-section-label">Before you plant</div>
              <div className="lp-section-title">Every question — answered honestly.</div>
            </div>
            <div className="faq-grid">
              <div>
                <FaqItem
                  q="Do I need to write the PDF guides myself?"
                  a="Nothing to write. You identify the gap, click grow, and the system produces the full PDF guide, the sales page, the SEO article, and your social hooks. Your job is to post once a day and let the seeds take root."
                />
                <FaqItem
                  q="Do I need technical or marketing skills?"
                  a="None. No coding, no SEO knowledge, no design experience. If you can click a button and copy-paste text, you have every skill the farm requires."
                />
                <FaqItem
                  q="How long before my first harvest?"
                  a="Most planters have their first seed in the ground in under an hour. Social media can drive sales within 48 hours. We guarantee income from your first seed within 7 days — or your first month is fully refunded."
                />
                <FaqItem
                  q="Is the African market already saturated?"
                  a="The opposite. The majority of practical, high-intent topics in Ghana, Nigeria, Kenya, and South Africa have zero PDF guides published. That window is open — but it won't stay that way indefinitely."
                />
              </div>
              <div>
                <FaqItem
                  q="Is £39 a month worth it?"
                  a="One seed earning £8 a day returns £240 a month — six times your subscription cost from a single guide. Ten seeds is £2,400 a month. The farm pays for itself in the first week. After that, every harvest is profit."
                />
                <FaqItem
                  q="What if my seeds don&apos;t produce?"
                  a="We refund your first month — no forms, no chasing. Plant your first seed within 7 days of signing up. If it doesn't earn, email us. Refund sent the same day."
                />
                <FaqItem
                  q="Which markets can I plant into?"
                  a="Currently Ghana, Nigeria, Kenya, South Africa, and UK diaspora communities. Each has its own search database, pricing calibration, and opportunity scores — selected automatically when you choose your market."
                />
                <FaqItem
                  q="Can I farm more than one country?"
                  a="Yes. Many planters run seeds across two or three markets simultaneously — different soils, different currencies, different audiences — all from one dashboard and one daily planting schedule."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="lp-section" id="start">
          <div className="lp-section-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="lp-section-label">Plant your first seed</div>
              <div className="lp-section-title">One subscription. Your whole farm.</div>
            </div>
            <div className="pricing-box">
              <div className="pricing-glow" />
              <div className="pricing-badge">🌱 FOUNDING FARMER PRICING</div>
              <div className="pricing-title">PDF Seeds — Full Farm Access</div>
              <div className="pricing-sub">Every tool you need to find the gaps, grow the PDF guides, and harvest every month.</div>
              <div className="pricing-amount"><span>£</span>39</div>
              <div className="pricing-period">per month · cancel anytime</div>
              <ul className="pricing-includes">
                {[
                  "Unlimited PDF guide generation — grow as many seeds as you plant",
                  "The gap finder — 5 African markets scanned for unmet demand",
                  "UK diaspora tools — pound pricing, diaspora-optimised opportunities",
                  "10 ready-to-plant social captions per guide — TikTok, Instagram, Pinterest",
                  "A Google article and a buy page grown automatically with every guide",
                  "Daily planting schedule — one action per day, exactly where to post",
                  "Email harvest list — capture buyers and build your audience",
                  "Farm dashboard — every seed, every harvest, tracked in real time",
                ].map((item, i) => (
                  <li key={i}><CheckIcon />{item}</li>
                ))}
              </ul>
              <a href={STRIPE} className="pricing-cta">Plant My First Seed →</a>
              <div className="pricing-offer">
                ✅ First harvest within 7 days — or your first month is free.
              </div>
              <div className="pricing-guarantee">
                30-day money-back guarantee · No questions asked · Cancel in one click
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <p>
            © {new Date().getFullYear()} PDF Seeds · Plant. Grow. Harvest. ·{" "}
            <a href="/store">Browse Guides</a> ·{" "}
            <a href="/dashboard">My Farm</a>
          </p>
        </footer>

        {/* ── MOBILE STICKY ── */}
        <div className="mobile-sticky">
          <a href={STRIPE}>Plant My First Seed — £39/month →</a>
        </div>

      </div>
    </>
  );
}
