import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

function renderMarkdown(md: string | null | undefined): string {
  if (!md) return "";
  const cleaned = md.replace(/\[Design Note:[^\]]*\]/gi, "").replace(/\n{3,}/g, "\n\n").trim();
  return cleaned
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- \[ \] (.+)$/gm, "<li class=\"check\">☐ $1</li>")
    .replace(/^- \[x\] (.+)$/gm, "<li class=\"check\">☑ $1</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^([^<\n].+)$/gm, (line) => line.startsWith("<") ? line : `<p>${line}</p>`)
    .replace(/<p><\/p>/g, "");
}

export default async function PdfPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const justPurchased = !!sp?.session_id;

  let product;
  try {
    product = await prisma.product.findFirst({
      where: { slug },
      include: { opportunity: true },
    });
  } catch {
    product = null;
  }
  if (!product) notFound();

  const opp = product.opportunity;
  const isReturning = opp?.isReturning ?? false;
  const isExpat = opp?.isExpat ?? false;

  const accent = isReturning ? "#D97706" : isExpat ? "#0EA5E9" : "#7C3AED";
  const accentGlow = isReturning
    ? "rgba(217,119,6,0.22)"
    : isExpat
    ? "rgba(14,165,233,0.22)"
    : "rgba(124,58,237,0.22)";

  const contentHtml = renderMarkdown(product.pdfContent);
  const isEmpty = !contentHtml.trim();
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        body > aside { display: none !important; }
        body > nav  { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; margin: 0; }
        body > main { overflow: visible !important; height: auto !important; }
        * { box-sizing: border-box; }

        :root {
          --accent: ${accent};
          --accent-glow: ${accentGlow};
        }

        body {
          font-family: var(--font-geist-sans), -apple-system, system-ui, sans-serif;
          background: #FAF9F7;
          color: #1A1008;
        }

        /* ── DELIVERY BAR ── */
        .delivery-bar {
          background: #F0FDF4;
          border-bottom: 1px solid #BBF7D0;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .delivery-bar-msg {
          font-size: 0.9rem; font-weight: 700; color: #15803D;
        }
        .delivery-bar-sub {
          font-size: 0.78rem; color: #16A34A; margin-top: 2px;
        }
        .save-btn {
          background: #15803D; color: #fff;
          border: none; padding: 10px 20px;
          border-radius: 8px; font-size: 0.85rem;
          font-weight: 700; cursor: pointer;
          white-space: nowrap; flex-shrink: 0;
          font-family: inherit;
        }
        .save-btn:hover { background: #166534; }

        /* ── TOP BAR ── */
        .top-bar {
          background: #FEFCF8;
          border-bottom: 1px solid #EDE9E2;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .top-bar-logo {
          font-size: 0.9rem; font-weight: 800;
          color: #1A1008;
          display: flex; align-items: center; gap: 8px;
          text-decoration: none;
        }
        .top-bar-logo-mark {
          width: 28px; height: 28px;
          background: var(--accent);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem;
        }
        .save-btn-top {
          background: var(--accent);
          color: #fff; border: none;
          padding: 8px 18px; border-radius: 8px;
          font-size: 0.82rem; font-weight: 700;
          cursor: pointer; white-space: nowrap;
          font-family: inherit;
        }
        .save-btn-top:hover { opacity: 0.9; }

        /* ── LAYOUT ── */
        .pdf-wrap {
          max-width: 720px;
          margin: 0 auto;
          padding: 0 32px 80px;
        }

        /* ── COVER / TITLE PAGE ── */
        .guide-cover {
          padding: 64px 0 48px;
          margin-bottom: 56px;
          border-bottom: 1px solid #EDE9E2;
          text-align: center;
        }
        .guide-brand-mark {
          font-size: 0.52rem; font-weight: 700;
          color: #C4BAB0; letter-spacing: 0.26em;
          text-transform: uppercase;
          margin-bottom: 40px;
        }
        .guide-title {
          font-size: clamp(1.8rem, 5vw, 2.6rem);
          font-weight: 900; line-height: 1.15;
          color: #1A1008; margin: 0 0 40px;
          letter-spacing: -0.035em;
        }
        .guide-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, #DDD6C8 20%, #DDD6C8 80%, transparent);
          margin-bottom: 22px;
        }
        .guide-meta {
          font-size: 0.6rem; color: #C4BAB0;
          letter-spacing: 0.16em; text-transform: uppercase;
        }
        .guide-page-num {
          font-size: 0.56rem; color: #DDD6C8;
          letter-spacing: 0.14em; margin-top: 22px;
        }

        /* ── CONTENT TYPOGRAPHY ── */
        .content h1 {
          font-size: 1.45rem; font-weight: 900;
          color: #1A1008;
          margin: 64px 0 14px; line-height: 1.2;
          letter-spacing: -0.025em;
          padding-top: 48px; border-top: 1px solid #EDE9E2;
        }
        .content h1:first-child { border-top: none; padding-top: 0; margin-top: 0; }
        .content h2 {
          font-size: 0.62rem; font-weight: 700;
          color: var(--accent); margin: 28px 0 8px;
          text-transform: uppercase; letter-spacing: 0.12em;
        }
        .content h3 {
          font-size: 0.95rem; font-weight: 700;
          color: #1A1008; margin: 18px 0 6px;
          letter-spacing: -0.01em;
        }
        .content p {
          font-size: 0.97rem; line-height: 1.88;
          color: #374151; margin: 0 0 16px;
        }
        .content ul { padding-left: 20px; margin: 0 0 16px; }
        .content ol {
          padding-left: 20px; margin: 0 0 16px;
          counter-reset: step-counter;
        }
        .content ol li {
          counter-increment: step-counter;
          list-style: none; padding-left: 8px; position: relative;
        }
        .content ol li::before {
          content: counter(step-counter);
          position: absolute; left: -28px; top: 2px;
          width: 18px; height: 18px;
          background: var(--accent); color: #fff;
          border-radius: 50%; font-size: 0.6rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .content li {
          font-size: 0.97rem; line-height: 1.8;
          color: #374151; margin-bottom: 8px;
        }
        .content li.check {
          list-style: none; padding-left: 4px;
          font-weight: 600; color: #1A1008;
        }
        .content strong { color: #1A1008; font-weight: 700; }
        .content em { color: #6B5E52; }

        /* ── EMPTY STATE ── */
        .content-pending {
          background: #FEFCF8;
          border: 1.5px solid #EDE9E2;
          border-radius: 14px; padding: 36px 32px;
          text-align: center; margin-bottom: 40px;
        }
        .content-pending p {
          font-size: 0.95rem; color: #8C7D6E;
          line-height: 1.7; margin: 0 0 10px;
        }

        /* ── SAVE FOOTER ── */
        .save-footer {
          margin-top: 56px; padding-top: 32px;
          border-top: 1px solid #EDE9E2;
          text-align: center;
        }
        .save-footer p {
          font-size: 0.85rem; color: #C4BAB0; margin: 0 0 16px;
        }
        .save-footer-btn {
          background: var(--accent); color: #fff;
          border: none; padding: 14px 32px;
          border-radius: 10px; font-size: 0.95rem;
          font-weight: 700; cursor: pointer;
          font-family: inherit;
          box-shadow: 0 4px 16px var(--accent-glow);
        }
        .save-footer-btn:hover { opacity: 0.9; }
        .save-footer-note {
          font-size: 0.75rem; color: #C4BAB0; margin-top: 10px;
        }

        /* ── COPYRIGHT ── */
        .copyright {
          text-align: center; padding: 24px;
          font-size: 0.72rem; color: #C4BAB0;
          border-top: 1px solid #EDE9E2;
        }

        /* ── MOBILE ── */
        @media (max-width: 600px) {
          .pdf-wrap { padding: 0 18px 60px; }
          .guide-cover { padding: 40px 0 32px; margin-bottom: 36px; }
          .guide-title { font-size: 1.55rem; }
          .content h1 { font-size: 1.2rem; }
          .delivery-bar { flex-direction: column; align-items: flex-start; gap: 10px; }
          .save-btn { width: 100%; text-align: center; }
        }

        /* ── PRINT ── */
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff; }
          .delivery-bar, .top-bar, .save-footer, .copyright { display: none !important; }
          .pdf-wrap { padding: 48px 0 0; }
          .guide-cover { padding: 0 0 40px; }
          .content h1 { break-before: page; }
          .content h1:first-child { break-before: avoid; }
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `function savePdf() { window.print(); }` }} />

      {justPurchased && (
        <div className="delivery-bar">
          <div>
            <div className="delivery-bar-msg">✓ Payment confirmed — your guide is below</div>
            <div className="delivery-bar-sub">Bookmark this page or save it as a PDF to keep it. A receipt is on its way to your email.</div>
          </div>
          <button className="save-btn" id="save-btn-banner">Save as PDF</button>
        </div>
      )}

      <div className="top-bar">
        <a href="/" className="top-bar-logo">
          <div className="top-bar-logo-mark">🌱</div>
          PDF Seeds
        </a>
        <button className="save-btn-top" id="save-btn-top">Save as PDF</button>
      </div>

      <div className="pdf-wrap">
        <div className="guide-cover">
          <div className="guide-brand-mark">PDF Seeds</div>
          <h1 className="guide-title">{product.title}</h1>
          <div className="guide-rule" />
          <div className="guide-meta">Step-by-Step Guide · {year}</div>
          <div className="guide-page-num">— i —</div>
        </div>

        {isEmpty ? (
          <div className="content-pending">
            <p>Your guide is being finalised — it will be ready within a few minutes.</p>
            <p>Bookmark this page and refresh shortly. A copy has been sent to your email.</p>
          </div>
        ) : (
          <div className="content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        )}

        <div className="save-footer">
          <p>Save this guide to come back to it any time.</p>
          <button className="save-footer-btn" id="save-btn-footer">Save as PDF</button>
          <div className="save-footer-note">
            When the print dialog opens, set the destination to &ldquo;Save as PDF&rdquo;
          </div>
        </div>
      </div>

      <div className="copyright">
        © {year} PDF Seeds &nbsp;·&nbsp; <a href="mailto:hello@pdfseeds.com" style={{ color: "#C4BAB0" }}>hello@pdfseeds.com</a>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        ['save-btn-banner','save-btn-top','save-btn-footer'].forEach(function(id) {
          var el = document.getElementById(id);
          if (el) el.addEventListener('click', function() { window.print(); });
        });
      ` }} />
    </>
  );
}
