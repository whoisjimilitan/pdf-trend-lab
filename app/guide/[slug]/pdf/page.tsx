import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

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

  const contentHtml = renderMarkdown(product.pdfContent);
  const isEmpty = !contentHtml.trim();
  const year = new Date().getFullYear();

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        body > aside { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; margin: 0; }
        body > main { overflow: visible !important; height: auto !important; }
        * { box-sizing: border-box; }

        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #F8F7F4;
          color: #1a1a2e;
        }

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
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          color: #15803D;
        }
        .delivery-bar-sub {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.78rem;
          color: #16A34A;
          margin-top: 2px;
        }
        .save-btn {
          font-family: system-ui, -apple-system, sans-serif;
          background: #15803D;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .save-btn:hover { background: #166534; }

        .top-bar {
          background: #fff;
          border-bottom: 1px solid #E2E8F0;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .top-bar-logo {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.9rem;
          font-weight: 800;
          color: #1A1008;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .top-bar-logo span {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem;
        }
        .save-btn-top {
          font-family: system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          color: #fff;
          border: none;
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }
        .save-btn-top:hover { opacity: 0.9; }

        .pdf-wrap {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 32px 80px;
        }

        .guide-cover {
          padding: 52px 0 44px;
          border-bottom: 1px solid #E2E8F0;
          margin-bottom: 52px;
        }
        .guide-brand {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #7C3AED;
          margin-bottom: 22px;
        }
        .guide-title {
          font-family: 'Sora', system-ui, sans-serif;
          font-size: clamp(1.8rem, 5vw, 2.6rem);
          font-weight: 800;
          line-height: 1.15;
          color: #0F0A1A;
          margin: 0 0 20px;
          letter-spacing: -0.03em;
        }
        .guide-meta {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.7rem;
          color: #94A3B8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .guide-divider {
          border: none;
          border-top: 2px solid #7C3AED;
          margin: 22px 0 0;
          width: 40px;
        }

        .content h1 {
          font-family: 'Sora', system-ui, sans-serif;
          font-size: 1.55rem; font-weight: 800; color: #0F0A1A;
          margin: 64px 0 14px; line-height: 1.2; letter-spacing: -0.025em;
          padding-top: 52px; border-top: 1px solid #E2E8F0;
        }
        .content h1:first-child { border-top: none; padding-top: 0; margin-top: 0; }
        .content h2 {
          font-family: 'Sora', system-ui, sans-serif;
          font-size: 1.05rem; font-weight: 700; color: #1e293b;
          margin: 32px 0 10px; line-height: 1.3; letter-spacing: -0.01em;
          text-transform: uppercase; letter-spacing: 0.04em; font-size: 0.72rem; color: #7C3AED;
        }
        .content h3 {
          font-family: 'Sora', system-ui, sans-serif;
          font-size: 0.98rem; font-weight: 600; color: #334155;
          margin: 22px 0 8px; letter-spacing: -0.01em;
        }
        .content p { font-size: 0.97rem; line-height: 1.85; color: #374151; margin: 0 0 16px; }
        .content ul { padding-left: 20px; margin: 0 0 16px; }
        .content ol { padding-left: 20px; margin: 0 0 16px; counter-reset: step-counter; }
        .content ol li { counter-increment: step-counter; list-style: none; padding-left: 8px; position: relative; }
        .content ol li::before { content: counter(step-counter); position: absolute; left: -28px; top: 1px; width: 20px; height: 20px; background: #7C3AED; color: #fff; border-radius: 50%; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; }
        .content li { font-size: 0.97rem; line-height: 1.8; color: #374151; margin-bottom: 8px; }
        .content li.check { list-style: none; padding-left: 4px; font-weight: 600; }
        .content strong { color: #0F0A1A; font-weight: 600; }

        .content-pending {
          background: #F8F7F4;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          padding: 36px 32px;
          text-align: center;
          font-family: system-ui, -apple-system, sans-serif;
          margin-bottom: 40px;
        }
        .content-pending p {
          font-size: 0.95rem;
          color: #64748B;
          line-height: 1.7;
          margin: 0 0 10px;
        }
        .content-pending p:last-child { margin: 0; }

        .save-footer {
          margin-top: 56px;
          padding-top: 32px;
          border-top: 1px solid #E2E8F0;
          text-align: center;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .save-footer p {
          font-size: 0.85rem;
          color: #94A3B8;
          margin: 0 0 16px;
        }
        .save-footer-btn {
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          color: #fff;
          border: none;
          padding: 14px 32px;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 4px 16px rgba(124,58,237,0.3);
        }
        .save-footer-btn:hover { opacity: 0.9; }
        .save-footer-note {
          font-size: 0.75rem;
          color: #CBD5E1;
          margin-top: 12px;
        }
        .copyright {
          text-align: center;
          padding: 24px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.72rem;
          color: #CBD5E1;
          border-top: 1px solid #E2E8F0;
          margin-top: 0;
        }

        @media (max-width: 600px) {
          .pdf-wrap { padding: 32px 18px 60px; }
          .guide-cover { padding: 36px 0 32px; margin-bottom: 36px; }
          .guide-title { font-size: 1.5rem; }
          .content h1 { font-size: 1.25rem; }
          .delivery-bar { flex-direction: column; align-items: flex-start; gap: 10px; }
          .save-btn { width: 100%; text-align: center; }
        }

        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff; font-family: 'Inter', system-ui, sans-serif; }
          .delivery-bar, .top-bar, .save-footer, .copyright { display: none !important; }
          .pdf-wrap { padding: 48px 0 0; }
          .guide-cover { padding: 0 0 40px; }
          .content h1 { break-before: page; }
          .content h1:first-child { break-before: avoid; }
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        function savePdf() { window.print(); }
      ` }} />

      {/* Purchase confirmation banner — only shown after payment redirect */}
      {justPurchased && (
        <div className="delivery-bar">
          <div>
            <div className="delivery-bar-msg">✓ Payment confirmed — your guide is below</div>
            <div className="delivery-bar-sub">Bookmark this page or save it as a PDF to keep it forever. A receipt is on its way to your email.</div>
          </div>
          <button className="save-btn" onClick={() => {}} id="save-btn-banner">
            🖨 Save as PDF
          </button>
        </div>
      )}

      {/* Top bar */}
      <div className="top-bar">
        <a href="/" className="top-bar-logo">
          <span>🌱</span>
          PDF Seeds
        </a>
        <button className="save-btn-top" id="save-btn-top">🖨 Save as PDF</button>
      </div>

      <div className="pdf-wrap">
        <div className="guide-cover">
          <div className="guide-brand">PDF Seeds · Step-by-Step Guide</div>
          <h1 className="guide-title">{product.title}</h1>
          <div className="guide-meta">{year} · Instant Download · Any Device</div>
          <hr className="guide-divider" />
        </div>

        {isEmpty ? (
          <div className="content-pending">
            <p>Your guide is being finalised — it will be ready within a few minutes.</p>
            <p>A copy has been sent to your email. Bookmark this page and refresh shortly.</p>
          </div>
        ) : (
          <div className="content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        )}

        <div className="save-footer">
          <p>Save this guide so you can come back to it any time.</p>
          <button className="save-footer-btn" id="save-btn-footer">🖨 Save as PDF</button>
          <div className="save-footer-note">
            When the print dialog opens, set the destination to &ldquo;Save as PDF&rdquo;
          </div>
        </div>
      </div>

      <div className="copyright">
        © {year} PDF Seeds &nbsp;·&nbsp; Questions? <a href="mailto:hello@pdfseeds.com" style={{ color: "#CBD5E1" }}>hello@pdfseeds.com</a>
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
