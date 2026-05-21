import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

function renderMarkdown(md: string): string {
  return md
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

export default async function PdfPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug },
    include: { opportunity: true },
  });
  if (!product) notFound();

  const { opportunity } = product;
  const price = opportunity ? opportunity.minPrice.toFixed(2) : "9.99";
  const currency = opportunity?.country === "GH" ? "₵"
    : opportunity?.country === "NG" ? "₦"
    : opportunity?.country === "KE" ? "KSh"
    : opportunity?.country === "ZA" ? "R"
    : opportunity?.country === "GB" ? "£"
    : opportunity?.country === "CA" ? "CA$"
    : opportunity?.country === "AU" ? "A$"
    : "$";

  const contentHtml = renderMarkdown(product.pdfContent);
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        body > aside { display: none !important; }
        body { display: block !important; overflow-y: auto !important; height: auto !important; }
        body > main { overflow: visible !important; height: auto !important; }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Georgia, 'Times New Roman', serif; background: #fff; color: #1a1a2e; }

        .pdf-wrap { max-width: 680px; margin: 0 auto; padding: 60px 48px; }

        /* Cover page */
        .cover { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border-bottom: 3px solid #6366F1; padding: 80px 40px; page-break-after: always; }
        .cover .logo { font-size: 0.8rem; letter-spacing: 3px; text-transform: uppercase; color: #6366F1; margin-bottom: 48px; }
        .cover h1 { font-size: 2.4rem; font-weight: 900; line-height: 1.2; color: #1a1a2e; margin-bottom: 20px; }
        .cover .subtitle { font-size: 1.1rem; color: #475569; margin-bottom: 48px; font-style: italic; }
        .cover .price-badge { background: #6366F1; color: #fff; padding: 12px 32px; border-radius: 40px; font-size: 1.2rem; font-weight: 700; display: inline-block; margin-bottom: 32px; }
        .cover .footer-note { font-size: 0.75rem; color: #94a3b8; margin-top: auto; }

        /* Content */
        .content { padding: 48px 0; }
        .content h1 { font-size: 1.8rem; font-weight: 900; color: #1a1a2e; margin: 48px 0 16px; border-bottom: 2px solid #6366F1; padding-bottom: 12px; page-break-before: always; }
        .content h2 { font-size: 1.3rem; font-weight: 700; color: #1e293b; margin: 36px 0 12px; }
        .content h3 { font-size: 1.05rem; font-weight: 700; color: #334155; margin: 24px 0 8px; }
        .content p { font-size: 1rem; line-height: 1.8; color: #334155; margin: 0 0 16px; }
        .content ul { padding-left: 24px; margin: 0 0 16px; }
        .content li { font-size: 1rem; line-height: 1.8; color: #334155; margin-bottom: 6px; }
        .content li.check { list-style: none; padding-left: 4px; font-weight: 500; }
        .content strong { color: #1a1a2e; }

        /* Back cover */
        .back-cover { page-break-before: always; min-height: 60vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 60px 40px; border-top: 3px solid #6366F1; margin-top: 60px; }
        .back-cover h2 { font-size: 1.6rem; font-weight: 900; margin-bottom: 12px; }
        .back-cover p { color: #475569; margin-bottom: 24px; }
        .back-cover .price { font-size: 2.5rem; font-weight: 900; color: #6366F1; margin-bottom: 16px; }
        .back-cover .guarantee { font-size: 0.8rem; color: #94a3b8; }

        /* Print styles */
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .cover { page-break-after: always; }
          .back-cover { page-break-before: always; }
        }

        /* Print button */
        .print-bar { position: fixed; bottom: 24px; right: 24px; z-index: 100; display: flex; gap: 10px; }
        .print-btn { background: #6366F1; color: #fff; border: none; padding: 14px 28px; border-radius: 10px; font-size: 0.95rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 20px #6366F140; }
        .print-btn:hover { background: #4F46E5; }
        .back-btn { background: #1e293b; color: #94a3b8; border: 1px solid #334155; padding: 14px 20px; border-radius: 10px; font-size: 0.95rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        window.addEventListener('load', function() {
          setTimeout(function() { window.print(); }, 800);
          var btn = document.getElementById('pdf-print-btn');
          if (btn) btn.addEventListener('click', function() { window.print(); });
        });
      ` }} />

      {/* Print/back bar */}
      <div className="print-bar no-print">
        <a href={`/guide/${slug}`} className="back-btn">← Back to Guide</a>
        <button id="pdf-print-btn" className="print-btn">
          🖨️ Save as PDF
        </button>
      </div>

      <div className="pdf-wrap">
        {/* Cover */}
        <div className="cover">
          <div className="logo">PDF Seeds — Digital Guide</div>
          <h1>{product.title}</h1>
          <div className="subtitle">Your Complete Step-by-Step Guide</div>
          <div className="price-badge">{currency}{price} — Instant Download</div>
          <div className="footer-note">
            © {year} PDF Seeds &nbsp;|&nbsp; Instant Download &nbsp;|&nbsp; 30-Day Money-Back Guarantee
          </div>
        </div>

        {/* Main content */}
        <div className="content" dangerouslySetInnerHTML={{ __html: contentHtml }} />

        {/* Back cover CTA */}
        <div className="back-cover">
          <h2>Enjoyed This Guide?</h2>
          <p>Share it with someone who needs it, or grab the full collection.</p>
          <div className="price">{currency}{price}</div>
          <div className="guarantee">✅ 30-day money-back guarantee &nbsp;|&nbsp; No questions asked</div>
        </div>
      </div>
    </>
  );
}
