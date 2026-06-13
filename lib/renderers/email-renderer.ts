/**
 * Email Renderer
 *
 * Pure expression renderer.
 * Expands Insight observation to email depth.
 * Same insight. Deeper explanation.
 * No logic. No decisions. Expression only.
 */

import type { Insight } from "../b2b-insight-object"

/**
 * Render Insight as email body
 *
 * Expands insight into 3–8 paragraphs explaining why it matters.
 * Preserves exact same insight. No new narrative. No CTAs.
 *
 * @param insight Insight to express
 * @returns Email body string
 */
export function renderEmail(insight: Insight): string {
  const paragraphs = buildEmailParagraphs(insight)
  return paragraphs.join("\n\n")
}

/**
 * Build email paragraphs from insight
 */
function buildEmailParagraphs(insight: Insight): string[] {
  const paragraphs: string[] = []

  // Paragraph 1: Open with the core observation
  paragraphs.push(openingObservation(insight))

  // Paragraphs 2-3: Why this matters for their business
  paragraphs.push(...whyItMatters(insight))

  // Paragraphs 4-5: Impact/implications
  paragraphs.push(...impactContext(insight))

  // Paragraph 6-7: Gentle exploration (if appropriate)
  if (insight.framingLevel !== "assertive") {
    paragraphs.push(...gentleExploration(insight))
  }

  // Final paragraph: Closing observation
  paragraphs.push(closingObservation(insight))

  return paragraphs
}

/**
 * Opening paragraph: State the observation clearly
 */
function openingObservation(insight: Insight): string {
  const statement = insight.statement

  switch (insight.framingLevel) {
    case "assertive":
      return `${statement} This is a challenge most businesses in your space encounter.`

    case "gentle":
      return `It seems ${statement.charAt(0).toLowerCase()}${statement.slice(1)} Like many businesses, this might be worth your attention.`

    case "speculative":
      return `It's worth considering: ${statement.toLowerCase()} This is something that affects many businesses at your scale.`

    default:
      return statement
  }
}

/**
 * Why this matters paragraphs
 */
function whyItMatters(insight: Insight): string[] {
  const painPoint = insight.painPoint
  const opportunity = insight.opportunity

  const para1 =
    insight.framingLevel === "assertive"
      ? `The core issue is straightforward: ${painPoint.toLowerCase()} When this happens, it creates friction in your operations.`
      : insight.framingLevel === "gentle"
        ? `The underlying dynamic is subtle. ${painPoint.charAt(0).toLowerCase()}${painPoint.slice(1).toLowerCase()} This affects how your business functions.`
        : `Consider the mechanism at play: ${painPoint.toLowerCase()} It's a pattern that develops quietly over time.`

  const para2 =
    insight.framingLevel === "assertive"
      ? `The opportunity is clear: ${opportunity.toLowerCase()} Addressing this directly would improve consistency.`
      : insight.framingLevel === "gentle"
        ? `There's a path forward: ${opportunity.toLowerCase()} It would create meaningful improvement.`
        : `One approach worth exploring: ${opportunity.toLowerCase()} It could shift how this plays out.`

  return [para1, para2]
}

/**
 * Impact context paragraphs
 */
function impactContext(insight: Insight): string[] {
  const confidence = insight.confidence

  const confidencePhrase =
    confidence >= 0.85
      ? "This pattern is well-established."
      : confidence >= 0.70
        ? "This dynamic is evident."
        : "This tendency appears significant."

  const para1 =
    insight.framingLevel === "assertive"
      ? `${confidencePhrase} The evidence points clearly to this being a real pressure point. It's not theoretical—it's happening in businesses like yours.`
      : insight.framingLevel === "gentle"
        ? `${confidencePhrase} The signals suggest this is a real consideration for your business. It's worth taking seriously, even if it's not always obvious.`
        : `${confidencePhrase} The indicators suggest this is worth your attention. While not universal, the pattern is noticeable.`

  const para2 =
    insight.framingLevel === "assertive"
      ? "The timing matters. Addressing this sooner rather than later creates better outcomes."
      : insight.framingLevel === "gentle"
        ? "There's value in considering this thoughtfully. Acting on it at the right time makes a difference."
        : "Timing could matter. Being aware of this helps you respond when the moment comes."

  return [para1, para2]
}

/**
 * Gentle exploration paragraphs (for non-assertive framing)
 */
function gentleExploration(insight: Insight): string[] {
  if (insight.framingLevel === "assertive") {
    return []
  }

  const para =
    insight.framingLevel === "gentle"
      ? "You might explore how this shows up in your specific context. Every business experiences these dynamics a bit differently."
      : "It could be worth observing how this manifests in your situation. The specifics vary, but the underlying pattern is consistent."

  return [para]
}

/**
 * Closing paragraph: Reinforce the observation
 */
function closingObservation(insight: Insight): string {
  switch (insight.framingLevel) {
    case "assertive":
      return "This is worth addressing. The businesses that tackle this directly see better results."

    case "gentle":
      return "This is something to keep in mind. Understanding it better can help you navigate it more effectively."

    case "speculative":
      return "This is worth keeping an eye on. Awareness is the first step toward better outcomes."

    default:
      return "This observation may be worth considering for your business."
  }
}
