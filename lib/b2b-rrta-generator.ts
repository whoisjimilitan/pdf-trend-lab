/**
 * RRTA (Recognition, Relief, Trust, Action) Copy Generator
 *
 * Converts lead intelligence into framework-compliant email copy
 * Each component designed to pass the "understood vs informed" test
 *
 * Framework from: IMPLEMENTATION_NORTH_STAR.md
 */

import { LeadIntelligence } from "./b2b-intelligence-extract"

export interface RRTACopy {
  recognition: string
  relief: string
  trust: string
  action: string
}

export interface RRTAEmailFull {
  recognition: string
  relief: string
  trust: string
  action: string
  closing: string
}

/**
 * Generate RRTA copy from lead intelligence
 *
 * Recognition: "One Thing That Stood Out"
 * Relief: "This Might Sound Familiar"
 * Trust: "We've Built Our Process Around"
 * Action: "Quick Question"
 */
export function generateRRTACopy(
  businessName: string,
  category: string,
  intelligence: LeadIntelligence
): RRTACopy {
  return {
    recognition: generateRecognition(businessName, intelligence),
    relief: generateRelief(businessName, category, intelligence),
    trust: generateTrust(category, intelligence),
    action: generateAction(businessName, intelligence)
  }
}

/**
 * Recognition: Specific observation about their business
 * Pattern: "One Thing That Stood Out: [specific observation]"
 * Pass test: Makes prospect think "Yes, they see me"
 */
function generateRecognition(businessName: string, intelligence: LeadIntelligence): string {
  return `One thing that stood out about ${businessName}: ${intelligence.pain_point}.`
}

/**
 * Relief: Acknowledge their specific burden
 * Pattern: "This Might Sound Familiar: [their operational reality]"
 * Pass test: Makes prospect think "That's exactly what I'm dealing with"
 */
function generateRelief(
  businessName: string,
  category: string,
  intelligence: LeadIntelligence
): string {
  const categoryLower = (category || "").toLowerCase()

  // Build relief based on what we know about their situation
  let reliefStatement = ""

  if (intelligence.operational_challenge) {
    reliefStatement = `When you're ${intelligence.operational_challenge}, it becomes a constraint on growth.`
  }

  if (intelligence.scale_indicator) {
    if (
      intelligence.scale_indicator.includes("enterprise") ||
      intelligence.scale_indicator.includes("large")
    ) {
      reliefStatement += ` At your scale, that's not just inefficient—it's risky.`
    } else if (
      intelligence.scale_indicator.includes("mid") ||
      intelligence.scale_indicator.includes("regional")
    ) {
      reliefStatement += ` For a business your size, that's where you end up managing it personally.`
    }
  }

  return `This might sound familiar: ${reliefStatement}`
}

/**
 * Trust: Proof that we understand their specific problem
 * Pattern: "We've Built Our Process Around: [specific proof]"
 * Pass test: Makes prospect think "They get it"
 */
function generateTrust(category: string, intelligence: LeadIntelligence): string {
  const categoryLower = (category || "").toLowerCase()

  // Category-specific proof points
  const proofPoints: Record<string, string> = {
    estate_agent: `making multi-location coordination seamless. Estate agents that use us reduce coordination time by 40% and improve consistency scores across all branches.`,
    pharmacy: `helping pharmacies keep customers through transitions. Pharmacies we've worked with maintain 92% of their customer base during relocations versus 75% industry average.`,
    dental: `making patient continuity automatic. Dental practices using our system reduce scheduling conflicts by 60% and improve patient retention across location changes.`,
    legal: `ensuring file integrity and client communication across offices. Legal firms reduce case file coordination time by 50% and improve client satisfaction scores.`,
    events: `handling vendor and logistics coordination at scale. Event businesses reduce coordination overhead by 45% and scale without proportional headcount increases.`,
    removal: `managing seasonal peaks without hiring chaos. Removal companies handle 3x seasonal volume with the same core team using our process.`,
    "care home": `maintaining both care quality and staffing efficiency. Care homes improve staff satisfaction scores by 35% while reducing vacancy rates.`,
    logistics: `keeping fleet consistency and route quality as you grow. Logistics companies reduce misdeliveries by 50% while growing capacity by 40%.`
  }

  for (const [key, proof] of Object.entries(proofPoints)) {
    if (categoryLower.includes(key)) {
      return `We've built our process around ${proof}`
    }
  }

  // Fallback
  return `We've built our process around helping businesses like yours operate consistently as they scale.`
}

/**
 * Action: Validation question that assumes understanding
 * Pattern: "Quick Question: [validation that proves we understand]"
 * Pass test: Makes prospect think "Yes, let's talk about that"
 */
function generateAction(businessName: string, intelligence: LeadIntelligence): string {
  const challenge = intelligence.operational_challenge

  if (challenge) {
    return `Quick question: When you're ${challenge}, does that create friction with your team or your customers? If it does, here's how we solve it.`
  }

  return `Quick question: Does operational consistency ever become a blocker for growth? If it does, we should talk about how to fix it.`
}

/**
 * Build full email body from RRTA components
 */
export function buildEmailBody(rrta: RRTACopy, businessName: string): string {
  return `Hi there,

${rrta.recognition}

${rrta.relief}

${rrta.trust}

${rrta.action}

Best,
Saint & Story`
}

/**
 * Generate CTA text from action component
 * Not generic "Want to chat?" but specific to understanding we've demonstrated
 */
export function generateCTAText(intelligence: LeadIntelligence): string {
  const challenge = intelligence.operational_challenge

  if (challenge.includes("consistency") || challenge.includes("scale")) {
    return "Show me how you solve this"
  }

  if (challenge.includes("customer") || challenge.includes("retention")) {
    return "Let's talk about customer impact"
  }

  if (challenge.includes("volume") || challenge.includes("seasonal")) {
    return "How do you handle the peaks?"
  }

  return "Let's explore this"
}

/**
 * Generate email subject based on intelligence
 * Not generic, but tied to what we observed
 */
export function generateSubject(
  businessName: string,
  category: string,
  intelligence: LeadIntelligence
): string {
  const categoryLower = (category || "").toLowerCase()

  // Category-specific subject lines (all demonstrate specificity)
  const subjects: Record<string, (name: string) => string> = {
    estate_agent: (name) => `${name} — multi-location consistency challenge`,
    pharmacy: (name) => `${name} — customer retention during change`,
    dental: (name) => `${name} — patient continuity workflow`,
    legal: (name) => `${name} — file coordination at scale`,
    events: (name) => `${name} — vendor coordination efficiency`,
    removal: (name) => `${name} — seasonal scaling without chaos`,
    "care home": (name) => `${name} — care quality + staffing balance`,
    logistics: (name) => `${name} — fleet consistency at scale`
  }

  for (const [key, subjectFn] of Object.entries(subjects)) {
    if (categoryLower.includes(key)) {
      return subjectFn(businessName)
    }
  }

  // Fallback to generic but structured
  return `${businessName} — operational consistency`
}
