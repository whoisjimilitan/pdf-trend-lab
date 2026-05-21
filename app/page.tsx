import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Seeds — Plant once. Earn for years.",
  description: "PDF Seeds finds unanswered questions across African markets and helps you turn them into simple PDF guides that keep selling over time.",
};

const STRIPE = "https://buy.stripe.com/00waEX65Nb838Ce1aP5ZC00";

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="faq-item group">
      <summary className="faq-summary">
        <span className="faq-q">{q}</span>
        <span className="faq-icon">+</span>
      </summary>
      <p className="faq-a">{a}</p>
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

        .lp { background: #F7F4EF; color: #1A1A18; font-family: system-ui, -apple-system, sans-serif; min-height: 100vh; }
        .lp h1 { font-family: Georgia, "Times New Roman", serif; font-size: clamp(2.8rem, 6vw, 4.4rem); font-weight: 400; line-height: 1.08; color: #1A1A18; margin: 0 0 24px; }
        .lp h2 { font-family: Georgia, "Times New Roman", serif; font-size: clamp(1.5rem, 3.2vw, 2.2rem); font-weight: 400; color: #1A1A18; line-height: 1.2; margin: 0 0 14px; }
        .lp p { font-size: 1rem; color: #6B6558; line-height: 1.8; margin: 0 0 16px; }

        /* NAV */
        .lp-nav { position: sticky; top: 0; z-index: 50; background: rgba(247,244,239,0.96); backdrop-filter: blur(10px); border-bottom: 1px solid #E4DDD5; padding: 0 24px; }
        .lp-nav-inner { max-width: 1040px; margin: 0 auto; height: 62px; display: flex; align-items: center; justify-content: space-between; }
        .lp-logo { text-decoration: none; display: flex; align-items: center; gap: 8px; }
        .lp-logo-text { font-family: Georgia, serif; font-size: 1rem; color: #1A1A18; }
        .lp-nav-right { display: flex; align-items: center; gap: 14px; }
        .lp-nav-login { font-size: 0.85rem; color: #6B6558; text-decoration: none; }
        .lp-nav-login:hover { color: #1A1A18; }
        .lp-btn-primary { display: inline-block; background: #4A6741; color: #fff; font-weight: 700; font-size: 0.95rem; padding: 12px 26px; border-radius: 9px; text-decoration: none; }
        .lp-btn-primary:hover { background: #3D5635; }

        /* HERO */
        .lp-hero { padding: 104px 24px 84px; text-align: center; background: #F7F4EF; }
        .lp-hero-inner { max-width: 580px; margin: 0 auto; }
        .lp-hero p { font-size: 1.05rem; color: #6B6558; line-height: 1.8; max-width: 500px; margin: 0 auto 32px; }
        .lp-hero-cta { display: inline-block; background: #4A6741; color: #fff; font-weight: 700; font-size: 1.05rem; padding: 17px 44px; border-radius: 10px; text-decoration: none; }
        .lp-hero-cta:hover { background: #3D5635; }
        .lp-trust-line { font-size: 0.78rem; color: #B5834A; margin-top: 18px; display: block; }

        /* SECTIONS */
        .lp-section { padding: 88px 24px; background: #F7F4EF; }
        .lp-section-white { background: #FFFFFF; }
        .lp-inner { max-width: 960px; margin: 0 auto; }
        .lp-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #B5834A; margin-bottom: 12px; }

        /* WHAT IS A SEED */
        .seed-split { display: grid; grid-template-columns: 1fr 1fr; gap: 52px; align-items: start; }
        .flow-steps { display: flex; flex-direction: column; gap: 0; margin-top: 28px; }
        .flow-step { display: flex; gap: 14px; align-items: flex-start; padding-bottom: 28px; position: relative; }
        .flow-step:not(:last-child)::before { content: ""; position: absolute; left: 15px; top: 33px; bottom: 0; width: 1px; background: #E4DDD5; }
        .flow-dot { width: 32px; height: 32px; border-radius: 50%; background: #EFF5ED; border: 1.5px solid #C5D9C0; display: flex; align-items: center; justify-content: center; font-size: 0.88rem; flex-shrink: 0; }
        .flow-label { font-size: 0.88rem; font-weight: 600; color: #1A1A18; margin-bottom: 3px; line-height: 1.3; }
        .flow-sub { font-size: 0.82rem; color: #6B6558; line-height: 1.55; }
        .seed-card { background: #FFFFFF; border: 1.5px solid #E4DDD5; border-radius: 14px; padding: 26px; }
        .seed-badge { display: inline-block; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: #FEF9EE; border: 1px solid #E4DDD5; color: #B5834A; }
        .seed-query { font-family: Georgia, serif; font-style: italic; font-size: 0.95rem; color: #1A1A18; line-height: 1.55; margin: 14px 0 20px; }
        .seed-stat-label { font-size: 0.65rem; color: #6B6558; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
        .seed-stat-value { font-size: 0.92rem; font-weight: 700; color: #1A1A18; }

        /* OPPORTUNITY CARDS */
        .opp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 40px; }
        .opp-simple { background: #FFFFFF; border: 1px solid #E4DDD5; border-radius: 14px; padding: 24px 20px; }
        .opp-simple-query { font-family: Georgia, serif; font-style: italic; font-size: 0.9rem; color: #1A1A18; line-height: 1.55; margin: 10px 0 14px; }
        .opp-demand { font-size: 0.78rem; color: #6B6558; }
        .opp-badge { display: inline-block; font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: #FEF9EE; border: 1px solid #E4DDD5; color: #B5834A; margin-top: 14px; }

        /* FOUNDER */
        .founder-section { text-align: center; padding: 96px 24px; background: #FFFFFF; }
        .founder-quote { font-family: Georgia, "Times New Roman", serif; font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 400; font-style: italic; color: #1A1A18; line-height: 1.35; max-width: 680px; margin: 0 auto 24px; }
        .founder-body { font-size: 0.95rem; color: #6B6558; line-height: 1.8; max-width: 500px; margin: 0 auto 16px; }
        .founder-cite { font-size: 0.85rem; color: #B5834A; }

        /* HOW IT WORKS */
        .steps-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 44px; }
        .step-simple { background: #FFFFFF; border: 1px solid #E4DDD5; border-radius: 14px; padding: 32px 24px; }
        .step-num-big { font-family: Georgia, serif; font-size: 3rem; font-weight: 400; color: #E4DDD5; line-height: 1; margin-bottom: 18px; }
        .step-icon-lg { font-size: 1.4rem; margin-bottom: 12px; }
        .step-title { font-size: 1rem; font-weight: 700; color: #1A1A18; margin-bottom: 8px; }
        .step-body { font-size: 0.88rem; color: #6B6558; line-height: 1.75; }

        /* PRICING */
        .pricing-wrap { max-width: 500px; margin: 0 auto; }
        .pricing-box { background: #FFFFFF; border: 1.5px solid #C5D9C0; border-radius: 18px; padding: 48px 40px; text-align: center; }
        .pricing-badge { font-size: 0.72rem; font-weight: 700; color: #B5834A; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; display: block; }
        .pricing-amount { font-family: Georgia, serif; font-size: 5rem; font-weight: 400; color: #1A1A18; line-height: 1; }
        .pricing-per { font-size: 0.9rem; color: #6B6558; margin: 8px 0 28px; }
        .pricing-list { text-align: left; list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 10px; }
        .pricing-list li { font-size: 0.88rem; color: #6B6558; display: flex; gap: 10px; align-items: flex-start; }
        .pricing-check { color: #4A6741; flex-shrink: 0; margin-top: 1px; }
        .pricing-cta { display: block; background: #4A6741; color: #fff; font-weight: 700; font-size: 1rem; padding: 17px; border-radius: 10px; text-decoration: none; margin-bottom: 14px; }
        .pricing-cta:hover { background: #3D5635; }
        .pricing-offer { font-size: 0.82rem; color: #4A6741; font-weight: 600; margin-bottom: 8px; }
        .pricing-guarantee { font-size: 0.75rem; color: #B5834A; }

        /* FAQ */
        .faq-max { max-width: 680px; margin: 0 auto; }
        .faq-item { border-bottom: 1px solid #E4DDD5; }
        .faq-item:last-child { border-bottom: none; }
        .faq-summary { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 0; cursor: pointer; list-style: none; gap: 16px; }
        .faq-q { font-size: 0.92rem; font-weight: 600; color: #1A1A18; line-height: 1.4; }
        .faq-icon { color: #4A6741; font-size: 1.2rem; flex-shrink: 0; margin-top: 1px; transition: transform 0.2s; }
        details[open] .faq-icon { transform: rotate(45deg); }
        .faq-a { font-size: 0.88rem; color: #6B6558; line-height: 1.75; padding-bottom: 20px; margin: 0; }

        /* FOOTER */
        .lp-footer { padding: 28px 24px; border-top: 1px solid #E4DDD5; text-align: center; background: #F7F4EF; }
        .lp-footer p { font-size: 0.78rem; color: #6B6558; margin: 0; }
        .lp-footer a { color: #6B6558; text-decoration: none; }
        .lp-footer a:hover { color: #1A1A18; }

        /* MOBILE STICKY */
        .mobile-sticky { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; background: #F7F4EF; border-top: 1px solid #E4DDD5; padding: 12px 16px; }
        .mobile-sticky a { display: block; background: #4A6741; color: #fff; font-weight: 700; font-size: 0.9rem; padding: 15px; border-radius: 10px; text-decoration: none; text-align: center; }

        @media (max-width: 768px) {
          .lp h1 { font-size: 2.4rem; }
          .lp h2 { font-size: 1.5rem; }
          .lp-section { padding: 56px 20px; }
          .lp-hero { padding: 72px 20px 56px; }
          .seed-split { grid-template-columns: 1fr; gap: 32px; }
          .opp-grid-3 { grid-template-columns: 1fr; }
          .steps-3 { grid-template-columns: 1fr; }
          .pricing-box { padding: 36px 22px; }
          .pricing-amount { font-size: 4rem; }
          .mobile-sticky { display: block; }
          body { padding-bottom: 80px; }
        }
      `}</style>

      <div className="lp">

        {/* ── NAV ── */}
        <nav className="lp-nav">
          <div className="lp-nav-inner">
            <a href="/" className="lp-logo">
              <span style={{ fontSize: "1.1rem" }}>🌱</span>
              <span className="lp-logo-text">PDF Seeds</span>
            </a>
            <div className="lp-nav-right">
              <a href="/dashboard" className="lp-nav-login">My Farm</a>
              <a href={STRIPE} className="lp-btn-primary">Plant Your First Seed →</a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="lp-hero-inner">
            <h1>Plant once.<br />Earn for years.</h1>
            <p>
              PDF Seeds finds questions people are already searching for across African markets —
              then helps you turn them into simple digital products that can keep selling over time.
            </p>
            <a href={STRIPE} className="lp-hero-cta">Plant Your First Seed →</a>
            <span className="lp-trust-line">5 African markets scanned daily · Diaspora opportunities included</span>
          </div>
        </section>

        {/* ── WHAT IS A SEED? ── */}
        <section className="lp-section lp-section-white">
          <div className="lp-inner">
            <div className="lp-label">What is a seed?</div>
            <div className="seed-split">
              <div>
                <h2>A question with no answer.<br />Yet.</h2>
                <p>
                  A seed is a real question that thousands of people search for every month —
                  and nobody has written the PDF guide to answer it.
                  When you plant that seed, you own that ground.
                </p>
                <div className="flow-steps">
                  {[
                    { dot: "🔍", label: "Real question", sub: "Thousands search it every month. No PDF exists." },
                    { dot: "📄", label: "Your PDF guide", sub: "You plant a simple guide that answers it." },
                    { dot: "💰", label: "Sale", sub: "They find it. They buy it." },
                    { dot: "♾️", label: "Keeps earning", sub: "Same guide. Same search. Month after month." },
                  ].map((s, i) => (
                    <div key={i} className="flow-step">
                      <div className="flow-dot">{s.dot}</div>
                      <div>
                        <div className="flow-label">{s.label}</div>
                        <div className="flow-sub">{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.78rem", color: "#6B6558", marginBottom: 12, fontWeight: 600 }}>
                  A real seed — right now, unplanted
                </div>
                <div className="seed-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "1.4rem" }}>🇬🇭</span>
                    <span className="seed-badge">🟡 Unplanted</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#6B6558", marginTop: 8 }}>Ghana · Inheritance & Land</div>
                  <div className="seed-query">&ldquo;How to transfer land ownership in Ghana after death&rdquo;</div>
                  <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                    <div>
                      <div className="seed-stat-label">Monthly searches</div>
                      <div className="seed-stat-value">4,200</div>
                    </div>
                    <div>
                      <div className="seed-stat-label">Competition</div>
                      <div className="seed-stat-value" style={{ color: "#4A6741" }}>Very Low</div>
                    </div>
                    <div>
                      <div className="seed-stat-label">PDF guides</div>
                      <div className="seed-stat-value">0 existing</div>
                    </div>
                  </div>
                  <a href={STRIPE} className="lp-btn-primary" style={{ display: "block", textAlign: "center", fontSize: "0.9rem", padding: "13px 20px" }}>
                    Plant This Seed →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── THREE SEEDS WAITING ── */}
        <section className="lp-section">
          <div className="lp-inner">
            <div className="lp-label">Unplanted opportunities</div>
            <h2>Three seeds waiting to be planted.</h2>
            <p style={{ maxWidth: 540 }}>
              Real searches. Real demand. No PDF guide has answered any of them yet.
            </p>
            <div className="opp-grid-3">
              {[
                {
                  flag: "🇳🇬",
                  country: "Nigeria",
                  query: "How to register a business in Nigeria step by step",
                  demand: "6,800 searches / month",
                },
                {
                  flag: "🇰🇪",
                  country: "Kenya",
                  query: "How to start a small poultry farm in Kenya with little money",
                  demand: "3,600 searches / month",
                },
                {
                  flag: "🇬🇧",
                  country: "UK Diaspora",
                  query: "How to renew a Nigerian passport from the UK",
                  demand: "2,900 searches / month",
                },
              ].map((opp, i) => (
                <div key={i} className="opp-simple">
                  <span style={{ fontSize: "1.4rem" }}>{opp.flag}</span>
                  <div style={{ fontSize: "0.72rem", color: "#6B6558", fontWeight: 600, margin: "6px 0 0" }}>{opp.country}</div>
                  <div className="opp-simple-query">&ldquo;{opp.query}&rdquo;</div>
                  <div className="opp-demand">{opp.demand}</div>
                  <div className="opp-badge">🟡 Still Unplanted</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.78rem", color: "#B5834A", marginTop: 20, textAlign: "center" }}>
              PDF Seeds surfaces hundreds of gaps like these — scored, ranked, and ready to grow.
            </p>
          </div>
        </section>

        {/* ── FOUNDER ── */}
        <section className="founder-section">
          <div className="lp-label" style={{ marginBottom: 28 }}>From the founder</div>
          <p className="founder-quote">&ldquo;I wanted a farm. Not another job.&rdquo;</p>
          <p className="founder-body">
            I built PDF Seeds because I kept seeing the same gap: millions of urgent searches
            in African markets, and almost no simple PDF guides answering them.
            The opportunity was obvious. The system to act on it wasn&apos;t. So I built it.
          </p>
          <span className="founder-cite">— Jimi, Founder of PDF Seeds</span>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="lp-section" id="how-it-works">
          <div className="lp-inner">
            <div className="lp-label">How it works</div>
            <h2>Three steps. One afternoon to start.</h2>
            <div className="steps-3">
              {[
                {
                  num: "01",
                  icon: "🔍",
                  title: "Find the gap",
                  body: "We scan real search data across 5 African markets and surface questions with high demand and no PDF guide. You pick the one you want to plant.",
                },
                {
                  num: "02",
                  icon: "🌱",
                  title: "Grow the guide",
                  body: "One click generates your complete PDF guide, a buy page, an SEO article, and 10 social hooks. Nothing to write. Ready in 3 minutes.",
                },
                {
                  num: "03",
                  icon: "🌾",
                  title: "Earn while it grows",
                  body: "Share the buy link. Post the social hooks. Over time, Google sends buyers automatically. The guide keeps selling. You keep earning.",
                },
              ].map((s, i) => (
                <div key={i} className="step-simple">
                  <div className="step-num-big">{s.num}</div>
                  <div className="step-icon-lg">{s.icon}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-body">{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="lp-section lp-section-white" id="start">
          <div className="lp-inner" style={{ textAlign: "center", marginBottom: 36 }}>
            <div className="lp-label">Start your farm</div>
            <h2>One subscription. Your whole farm.</h2>
          </div>
          <div className="pricing-wrap">
            <div className="pricing-box">
              <span className="pricing-badge">🌱 Founding Farmer Price</span>
              <div className="pricing-amount">£39</div>
              <div className="pricing-per">per month · cancel anytime</div>
              <ul className="pricing-list">
                {[
                  "Gap finder — 5 African markets scanned for unplanted demand",
                  "PDF guide generation — unlimited seeds, one click each",
                  "Buy page + SEO article grown automatically with every guide",
                  "10 social hooks per guide — TikTok, Pinterest, Instagram",
                  "Daily planting schedule — one action per day",
                  "Farm dashboard — every seed tracked in one place",
                ].map((item, i) => (
                  <li key={i}>
                    <span className="pricing-check">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href={STRIPE} className="pricing-cta">Plant My First Seed →</a>
              <div className="pricing-offer">✅ First harvest within 7 days — or your first month is free.</div>
              <div className="pricing-guarantee">30-day money-back guarantee · No questions asked · Cancel anytime</div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="lp-section" id="faq">
          <div className="lp-inner">
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div className="lp-label">Before you plant</div>
              <h2>Every question, answered honestly.</h2>
            </div>
            <div className="faq-max">
              <FaqItem
                q="Do I need to write the PDF guides myself?"
                a="Nothing to write. You pick the gap, click grow, and the system produces the full PDF guide, sales page, SEO article, and social hooks automatically. Your job is to share the buy link."
              />
              <FaqItem
                q="Do I need technical or marketing skills?"
                a="None. No coding, no design experience, no SEO knowledge required. If you can click a button and copy-paste text, you have everything you need."
              />
              <FaqItem
                q="How long before my first harvest?"
                a="Most planters have their first seed in the ground within an hour. Social can drive sales within 48 hours. We guarantee income from your first seed within 7 days — or your first month is fully refunded."
              />
              <FaqItem
                q="Is the African market already saturated?"
                a="The opposite. Most practical, high-intent topics in Ghana, Nigeria, Kenya, and South Africa have zero PDF guides published. The window is open — but it won't stay that way indefinitely."
              />
              <FaqItem
                q="Is £39 a month worth it?"
                a="One seed earning £8 a day returns £240 a month — six times your subscription cost from a single guide. The farm pays for itself in the first week. After that, every harvest is profit."
              />
              <FaqItem
                q="What if my seeds don't produce?"
                a="We refund your first month — no forms, no chasing. Plant your first seed within 7 days. If it doesn't earn, email us. Refund sent the same day."
              />
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <p>
            © {new Date().getFullYear()} PDF Seeds · Plant. Grow. Harvest. ·{" "}
            <a href="/dashboard">My Farm</a> ·{" "}
            <a href="/store">Browse Guides</a>
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
