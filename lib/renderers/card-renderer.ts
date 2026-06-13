/**
 * Card Renderer
 *
 * Pure expression renderer.
 * Transforms Insight statement into human observation card.
 * No logic. No decisions. Expression only.
 */

import type { Insight } from "../b2b-insight-object"

/**
 * Render Insight as card observation
 *
 * Expresses insight statement with tone matching framingLevel.
 * 1–3 sentences. Human voice. No marketing.
 *
 * @param insight Insight to express
 * @returns Card text (string only)
 */
export function renderCard(insight: Insight): string {
  const statement = insight.statement
  const tone = insight.framingLevel

  return applyToning(statement, tone)
}

/**
 * Apply toning to statement based on framing level
 *
 * @param statement Original statement
 * @param tone assertive | gentle | speculative
 * @returns Toned statement
 */
function applyToning(statement: string, tone: "assertive" | "gentle" | "speculative"): string {
  switch (tone) {
    case "assertive":
      return toAssertive(statement)
    case "gentle":
      return toGentle(statement)
    case "speculative":
      return toSpeculative(statement)
    default:
      return statement
  }
}

/**
 * Transform to assertive tone (confident, direct)
 */
function toAssertive(statement: string): string {
  // Direct second-person address
  if (!statement.includes("Your ") && !statement.includes("your ")) {
    // Check if it's a general statement about the category
    if (
      statement.includes("Most ") ||
      statement.includes("Many ") ||
      statement.includes("Businesses ") ||
      statement.includes("Companies ")
    ) {
      // Convert to specific address
      return statement
        .replace(/^Most /, "Your business likely ")
        .replace(/^Many /, "Your business likely ")
        .replace(/^Businesses /, "Your business ")
        .replace(/^Companies /, "Your business ")
    }
  }
  return statement + "."
}

/**
 * Transform to gentle tone (softened, tentative)
 */
function toGentle(statement: string): string {
  // Add softening language
  let gentled = statement

  // Convert direct statements to softer observations
  if (!gentled.includes("seem") && !gentled.includes("may") && !gentled.includes("might")) {
    gentled = "It seems " + statement.charAt(0).toLowerCase() + statement.slice(1)
  }

  // Add uncertainty markers
  if (!gentled.includes("may ") && !gentled.includes("might ")) {
    gentled = gentled.replace(/^It seems /, "It seems ")
    if (!gentled.includes("like yours")) {
      gentled = gentled.replace(/\.$/, " for businesses like yours.")
    }
  }

  return gentled.endsWith(".") ? gentled : gentled + "."
}

/**
 * Transform to speculative tone (observational, questioning)
 */
function toSpeculative(statement: string): string {
  // Convert to conditional, observational phrasing
  let speculative = statement

  // Add hedging language
  if (!speculative.includes("might") && !speculative.includes("could") && !speculative.includes("worth")) {
    speculative = "It might be worth considering how " + statement.toLowerCase()

    // Remove existing period if present
    if (speculative.endsWith(".")) {
      speculative = speculative.slice(0, -1)
    }

    // Close with question-like observation
    if (!speculative.includes("?")) {
      speculative += "."
    }
  }

  return speculative.endsWith(".") || speculative.endsWith("?") ? speculative : speculative + "."
}
