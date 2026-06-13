/**
 * Prospect Page Renderer
 *
 * Pure HTML expression renderer.
 * Deepens Insight into visual page structure.
 * Same insight. Deeper narrative depth.
 * No logic. No decisions. Expression only.
 */

import type { Insight } from "../b2b-insight-object"

/**
 * Render Insight as prospect page HTML
 *
 * Creates structured HTML page that deepens the insight narrative.
 * Four sections: observation, pain, opportunity, reflection.
 *
 * @param insight Insight to express
 * @returns HTML string
 */
export function renderProspectPage(insight: Insight): string {
  return buildPageHTML(insight)
}

/**
 * Build complete page HTML
 */
function buildPageHTML(insight: Insight): string {
  const statement = insight.statement
  const painPoint = insight.painPoint
  const opportunity = insight.opportunity
  const tone = insight.framingLevel

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Insight</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #fafafa;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .section {
            margin-bottom: 40px;
        }
        .section-number {
            font-size: 12px;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }
        h1 {
            font-size: 28px;
            margin: 0 0 16px 0;
            font-weight: 600;
            color: #222;
        }
        h2 {
            font-size: 20px;
            margin: 0 0 12px 0;
            font-weight: 600;
            color: #222;
        }
        p {
            margin: 0 0 12px 0;
            color: #555;
        }
        p:last-child {
            margin-bottom: 0;
        }
        .reflection {
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .tone-assertive {
            color: #1a1a1a;
        }
        .tone-gentle {
            color: #444;
        }
        .tone-speculative {
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        ${section1Observation(statement, tone)}
        ${section2PainPoint(painPoint, tone)}
        ${section3Opportunity(opportunity, tone)}
        ${section4Reflection(statement, tone)}
    </div>
</body>
</html>`
}

/**
 * Section 1: Restate the core observation
 */
function section1Observation(statement: string, tone: string): string {
  return `<div class="section tone-${tone}">
    <div class="section-number">The Observation</div>
    <h1>${escapeHtml(statement)}</h1>
</div>`
}

/**
 * Section 2: Expand the pain point
 */
function section2PainPoint(painPoint: string, tone: string): string {
  return `<div class="section tone-${tone}">
    <div class="section-number">The Challenge</div>
    <h2>${escapeHtml(painPoint)}</h2>
</div>`
}

/**
 * Section 3: Expand the opportunity
 */
function section3Opportunity(opportunity: string, tone: string): string {
  return `<div class="section tone-${tone}">
    <div class="section-number">The Path Forward</div>
    <h2>${escapeHtml(opportunity)}</h2>
</div>`
}

/**
 * Section 4: Reflection and continuation
 */
function section4Reflection(statement: string, tone: string): string {
  return `<div class="section reflection tone-${tone}">
    <p>${escapeHtml(statement)}</p>
</div>`
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
