import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
export const FROM = process.env.RESEND_FROM ?? "PDF Seeds <hello@pdfseeds.com>";

function base(body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>PDF Seeds</title>
</head>
<body style="margin:0;padding:0;background:#FAF9F7;font-family:-apple-system,'Inter',system-ui,sans-serif;color:#1A1008;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF9F7;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:32px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:32px;height:32px;background:linear-gradient(135deg,#7C3AED,#4F46E5);border-radius:8px;text-align:center;vertical-align:middle;font-size:1rem;">🌱</td>
              <td style="padding-left:10px;font-size:1rem;font-weight:800;color:#1A1008;letter-spacing:-0.02em;">PDF Seeds</td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#FFFFFF;border-radius:16px;border:1px solid #EAE6E0;padding:36px 40px;">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:24px;font-size:0.72rem;color:#C4BAB0;text-align:center;line-height:1.6;">
          © ${new Date().getFullYear()} PDF Seeds · <a href="https://pdfseeds.com" style="color:#C4BAB0;">pdfseeds.com</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#5B21B6);color:#fff;font-weight:700;font-size:0.95rem;padding:14px 28px;border-radius:12px;text-decoration:none;margin-top:24px;">${label}</a>`;
}

function p(text: string) {
  return `<p style="margin:0 0 16px;font-size:0.97rem;color:#4B3D30;line-height:1.75;">${text}</p>`;
}

function h(text: string) {
  return `<h1 style="margin:0 0 20px;font-size:1.35rem;font-weight:800;color:#1A1008;letter-spacing:-0.02em;line-height:1.3;">${text}</h1>`;
}

function muted(text: string) {
  return `<p style="margin:20px 0 0;font-size:0.82rem;color:#B0A89A;line-height:1.65;">${text}</p>`;
}

// ── Email 1 — Immediate: waitlist confirmation ─────────────────────────────
export function waitlistEmail1(query: string) {
  const subject = "We're on it — your guide is being built";
  const html = base(`
    ${h("We're building it now.")}
    ${p(`You asked about <strong style="color:#1A1008;">"${query}"</strong> — and we heard you.`)}
    ${p("We create guides specifically for the country and situation you described. Not generic information you could Google. A proper step-by-step PDF — the kind you save, share, and come back to.")}
    ${p("You'll get an email the moment it's ready, usually within 24 hours.")}
    ${p("While you wait, browse the library in case we already have something close.")}
    ${btn("https://pdfseeds.com", "Browse the library →")}
    ${muted("You're receiving this because you left your email on pdfseeds.com. Reply any time if you need something specific.")}
  `);
  return { subject, html };
}

// ── Email 2 — 24h later: what's inside ────────────────────────────────────
export function waitlistEmail2(query: string) {
  const subject = "A preview of what we're building for you";
  const html = base(`
    ${h("Here's what your guide will cover.")}
    ${p(`You asked about <strong style="color:#1A1008;">"${query}"</strong> yesterday. We're still working on it — here's a preview of what's inside.`)}
    <ul style="margin:0 0 16px;padding-left:20px;color:#4B3D30;font-size:0.97rem;line-height:1.9;">
      <li>The exact step-by-step process — no assumptions, no skipped steps</li>
      <li>Documents, fees, and timelines specific to your situation</li>
      <li>The most common mistakes people make — and how to avoid each one</li>
      <li>What to do if something doesn't go as expected</li>
    </ul>
    ${p("We'll email you the link the moment it's live.")}
    ${p("Can't wait? We may already have a guide that covers related ground.")}
    ${btn("https://pdfseeds.com", "Check the library now →")}
    ${muted("Reply to this email if you need something more specific — we read every reply.")}
  `);
  return { subject, html };
}

// ── Email 3 — 72h later: nudge + store link ───────────────────────────────
export function waitlistEmail3(query: string) {
  const subject = "Still looking for help with this?";
  const html = base(`
    ${h("Your guide is almost there.")}
    ${p(`A few days ago you were looking for help with <strong style="color:#1A1008;">"${query}"</strong>.`)}
    ${p("Your specific guide is still being prepared. But there's a good chance we already have something in our library that covers similar ground — immigration, business registration, tax, housing, health.")}
    ${p("It takes 30 seconds to search. If nothing fits, reply to this email and tell us exactly what you need. We build guides based on what real people ask for — your message directly shapes what gets made next.")}
    ${btn("https://pdfseeds.com", "Search the library →")}
    ${muted("This is the last email we'll send about this guide. Reply any time to tell us what you still need.")}
  `);
  return { subject, html };
}

// ── Partner welcome ───────────────────────────────────────────────────────
export function partnerWelcomeEmail(code: string, dashboardUrl: string) {
  const subject = "You're in — here's your curator dashboard";
  const html = base(`
    ${h("Welcome to the Curator Programme. 🌱")}
    ${p("Your curator access is confirmed. Here's everything you need to start earning.")}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3FF;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #DDD6FE;">
      <tr>
        <td>
          <div style="font-size:0.72rem;font-weight:700;color:#7C3AED;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">Your curator link</div>
          <div style="font-size:1.5rem;font-weight:900;color:#1A1008;letter-spacing:0.05em;">${code}</div>
          <div style="font-size:0.82rem;color:#8C7D6E;margin-top:4px;">Your link: https://pdfseeds.com/?ref=${code}</div>
        </td>
      </tr>
    </table>
    ${p("Your dashboard has guides to read and recommend, WhatsApp templates, and your earnings — all in one place.")}
    ${p("Bookmark the link below. It's your permanent dashboard — no password needed.")}
    ${btn(dashboardUrl, "Open My Curator Dashboard →")}
    ${p("Start by reading the top guides in your dashboard. Find the one your community needs most — then share it the way you'd share anything you believe in.")}
    ${muted("Questions? Reply to this email. We read every one.")}
  `);
  return { subject, html };
}

// ── Post-purchase confirmation ─────────────────────────────────────────────
export function purchaseConfirmEmail(title: string, guideUrl: string) {
  const subject = `Your guide is ready: ${title}`;
  const html = base(`
    ${h("Your guide is ready. 🌾")}
    ${p(`You just got <strong style="color:#1A1008;">${title}</strong>.`)}
    ${p("Click the button below to open it. You can read it on any device, save it, and come back to it any time.")}
    ${btn(guideUrl, "Open My Guide →")}
    ${p("If you ever have a question the guide doesn't answer, reply to this email.")}
    ${muted("30-day money-back guarantee — no questions asked. Just reply to this email.")}
  `);
  return { subject, html };
}
