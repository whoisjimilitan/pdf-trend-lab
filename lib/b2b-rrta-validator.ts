/**
 * RRTA Compliance Validator
 *
 * Validates that email copy meets Recognition/Relief/Trust/Action framework
 * Enforces the "understood vs informed" test
 *
 * RULES:
 * - Recognition: Must be SPECIFIC observation (not generic category insight)
 * - Relief: Must acknowledge THEIR burden (not universal problem)
 * - Trust: Must provide PROOF (not unsupported claim)
 * - Action: Must be VALIDATION question (not generic meeting request)
 *
 * Score: 0-4
 * Pass threshold: 4/4 (no partial credit)
 */

import { RRTACopy } from "./b2b-rrta-generator"

export interface RRTAValidation {
  recognition_present: boolean
  relief_present: boolean
  trust_present: boolean
  action_present: boolean

  score: number // 0-4
  passed: boolean // true if 4/4
  issues: string[]

  details: {
    recognition: ValidationDetail
    relief: ValidationDetail
    trust: ValidationDetail
    action: ValidationDetail
  }
}

interface ValidationDetail {
  present: boolean
  issues: string[]
  suggestion?: string
}

/**
 * Validate RRTA compliance
 */
export function validateRRTA(copy: RRTACopy): RRTAValidation {
  const recognition = validateRecognition(copy.recognition)
  const relief = validateRelief(copy.relief)
  const trust = validateTrust(copy.trust)
  const action = validateAction(copy.action)

  const presentCount = [
    recognition.present,
    relief.present,
    trust.present,
    action.present
  ].filter(Boolean).length

  const allIssues = [
    ...recognition.issues,
    ...relief.issues,
    ...trust.issues,
    ...action.issues
  ]

  return {
    recognition_present: recognition.present,
    relief_present: relief.present,
    trust_present: trust.present,
    action_present: action.present,

    score: presentCount,
    passed: presentCount === 4,
    issues: allIssues,

    details: {
      recognition,
      relief,
      trust,
      action
    }
  }
}

/**
 * Validate Recognition component
 *
 * MUST be: Specific observation about THEIR business
 * MUST NOT be: Generic category insight
 *
 * Patterns that PASS:
 * - "One thing that stood out about [business name]"
 * - References specific aspect (locations, volume, customer segment)
 * - Ties to actual observable fact (ratings, reviews, scale)
 *
 * Patterns that FAIL:
 * - "I think we might have something"
 * - "Managing X is complex"
 * - "We handle same-day logistics"
 * - Generic category statement
 */
function validateRecognition(recognition: string): ValidationDetail {
  const issues: string[] = []

  // Check for generic opening that signals unsupported claim
  const genericOpeners = [
    "I think we might",
    "I think you probably",
    "I had a thought",
    "It seems like",
    "Managing X is",
    "Most businesses"
  ]

  for (const opener of genericOpeners) {
    if (recognition.toLowerCase().includes(opener.toLowerCase())) {
      issues.push(`Contains generic phrase: "${opener}"`)
    }
  }

  // Check for required specificity markers
  const specificityMarkers = [
    "One thing",
    "stood out",
    "customers mention",
    "your reviews",
    "your locations",
    "your team"
  ]

  const hasSpecificity = specificityMarkers.some((marker) =>
    recognition.toLowerCase().includes(marker.toLowerCase())
  )

  if (!hasSpecificity) {
    issues.push(
      "Lacks specificity markers (needs 'One thing', 'stood out', 'your', etc.)"
    )
  }

  // Check length (too short suggests superficial)
  if (recognition.length < 40) {
    issues.push("Too short to be specific observation")
  }

  return {
    present: issues.length === 0,
    issues,
    suggestion: issues.length > 0 ? "Rephrase as specific observation about THEIR business" : undefined
  }
}

/**
 * Validate Relief component
 *
 * MUST be: Acknowledgment of THEIR specific burden
 * MUST NOT be: Universal problem statement
 *
 * Patterns that PASS:
 * - "This might sound familiar"
 * - References their personal/operational burden
 * - Connects challenge to consequence they care about
 *
 * Patterns that FAIL:
 * - "Managing X is hard" (universal)
 * - "Businesses often" (not about THEM)
 * - "What we learned" (analytical, not empathetic)
 */
function validateRelief(relief: string): ValidationDetail {
  const issues: string[] = []

  // Check for empathy markers
  const empathyMarkers = [
    "This might sound familiar",
    "probably means",
    "when that happens",
    "creates",
    "becomes",
    "managing"
  ]

  const hasEmpathy = empathyMarkers.some((marker) =>
    relief.toLowerCase().includes(marker.toLowerCase())
  )

  if (!hasEmpathy) {
    issues.push(
      "Lacks empathy markers (needs 'familiar', 'when that happens', 'creates', etc.)"
    )
  }

  // Check for burden acknowledgment (personal cost named)
  const burdenMarkers = [
    "personally",
    "your team",
    "you",
    "constraint",
    "bottleneck",
    "friction"
  ]

  const hasBurden = burdenMarkers.some((marker) =>
    relief.toLowerCase().includes(marker.toLowerCase())
  )

  if (!hasBurden) {
    issues.push(
      "Doesn't acknowledge their personal burden or cost (needs 'your team', 'constraint', 'bottleneck', etc.)"
    )
  }

  // Check for analytical framing (bad)
  const analyticalPhrases = ["What we learned", "We found", "We analyzed", "Our data shows"]

  for (const phrase of analyticalPhrases) {
    if (relief.toLowerCase().includes(phrase.toLowerCase())) {
      issues.push(`Contains analytical framing: "${phrase}" (should be empathetic, not analytical)`)
    }
  }

  // Check length
  if (relief.length < 50) {
    issues.push("Too short to adequately acknowledge their burden")
  }

  return {
    present: issues.length === 0,
    issues,
    suggestion: issues.length > 0 ? "Acknowledge THEIR specific operational burden and its consequence" : undefined
  }
}

/**
 * Validate Trust component
 *
 * MUST be: Proof that we understand their problem
 * MUST NOT be: Unsupported claim
 *
 * Patterns that PASS:
 * - "We've built our process around"
 * - Includes specific proof (case study, quantified result, process detail)
 * - Connects proof to their specific challenge
 *
 * Patterns that FAIL:
 * - "We make it simple"
 * - "We specialize in"
 * - "We handle X" (all claim, no proof)
 * - Generic capability statement
 */
function validateTrust(trust: string): ValidationDetail {
  const issues: string[] = []

  // Must have trust intro
  const trustIntro = [
    "We've built",
    "We've developed",
    "We've created",
    "Our process"
  ]

  const hasIntro = trustIntro.some((intro) =>
    trust.toLowerCase().includes(intro.toLowerCase())
  )

  if (!hasIntro) {
    issues.push(
      "Missing trust frame ('We've built', 'Our process', etc.) — seems like unsupported claim"
    )
  }

  // Must have proof (quantified or specific)
  const proofMarkers = [
    "reduce",
    "improve",
    "increase",
    "maintain",
    "handle",
    "manage",
    "%",
    "X%",
    "result",
    "outcome"
  ]

  const hasProof = proofMarkers.some((marker) =>
    trust.toLowerCase().includes(marker.toLowerCase())
  )

  if (!hasProof) {
    issues.push("No quantified proof or specific outcome mentioned (add % improvement, result, etc.)")
  }

  // Check for credibility indicators
  const credibilityMarkers = ["we've worked with", "similar businesses", "our customers"]

  const hasCredibility = credibilityMarkers.some((marker) =>
    trust.toLowerCase().includes(marker.toLowerCase())
  )

  if (!hasCredibility && !hasProof) {
    issues.push(
      "Missing both proof and credibility indicators (add result % OR mention similar businesses)"
    )
  }

  // Check for weak claims
  const weakClaims = ["We make it simple", "We specialize in", "We're good at"]

  for (const claim of weakClaims) {
    if (trust.toLowerCase().includes(claim.toLowerCase())) {
      issues.push(`Contains weak claim without proof: "${claim}"`)
    }
  }

  // Check length
  if (trust.length < 60) {
    issues.push("Too short to credibly establish trust (need space for proof)")
  }

  return {
    present: issues.length === 0,
    issues,
    suggestion: issues.length > 0 ? "Add specific proof or case study demonstrating you've solved this before" : undefined
  }
}

/**
 * Validate Action component
 *
 * MUST be: Validation question (assumes understanding, invites confirmation)
 * MUST NOT be: Generic meeting request
 *
 * Patterns that PASS:
 * - "Quick question:"
 * - Question that validates understanding
 * - Assumes prospect is dealing with the issue
 *
 * Patterns that FAIL:
 * - "Want to chat?"
 * - "Want to set up a call?"
 * - "Can we talk next week?"
 * - Generic CTA without validation
 */
function validateAction(action: string): ValidationDetail {
  const issues: string[] = []

  // Must have validation frame
  const validationFrames = ["Quick question", "One question", "Here's a question"]

  const hasValidation = validationFrames.some((frame) =>
    action.toLowerCase().includes(frame.toLowerCase())
  )

  if (!hasValidation) {
    issues.push(
      "Missing validation question frame ('Quick question:', 'One question:', etc.)"
    )
  }

  // Must ask question, not request meeting
  const meetingRequests = [
    "would you like",
    "want to chat",
    "want to talk",
    "can we set up",
    "can we schedule",
    "would you be available"
  ]

  for (const request of meetingRequests) {
    if (action.toLowerCase().includes(request.toLowerCase())) {
      issues.push(`Contains generic meeting request: "${request}" (should be validation question)`)
    }
  }

  // Must actually ask a question
  if (!action.includes("?")) {
    issues.push("No question mark (should be validation question, not statement)")
  }

  // Must reference the challenge we identified
  const challengeMarkers = [
    "when",
    "if you",
    "does that",
    "does this",
    "is that"
  ]

  const hasChallengeRef = challengeMarkers.some((marker) =>
    action.toLowerCase().includes(marker.toLowerCase())
  )

  if (!hasChallengeRef) {
    issues.push(
      "Doesn't reference the specific challenge we identified (add 'when', 'if you', 'does that')"
    )
  }

  // Must have implied next step
  if (action.length < 60) {
    issues.push("Too short to be effective validation question")
  }

  return {
    present: issues.length === 0,
    issues,
    suggestion: issues.length > 0 ? "Rephrase as validation question that assumes they're dealing with this challenge" : undefined
  }
}

/**
 * Generate explanation of failures
 */
export function explainValidationFailure(validation: RRTAValidation): string {
  if (validation.passed) {
    return "✅ Validation passed. Email meets RRTA framework."
  }

  const failed: string[] = []

  if (!validation.recognition_present) {
    failed.push(`❌ Recognition: ${validation.details.recognition.issues.join("; ")}`)
  }
  if (!validation.relief_present) {
    failed.push(`❌ Relief: ${validation.details.relief.issues.join("; ")}`)
  }
  if (!validation.trust_present) {
    failed.push(`❌ Trust: ${validation.details.trust.issues.join("; ")}`)
  }
  if (!validation.action_present) {
    failed.push(`❌ Action: ${validation.details.action.issues.join("; ")}`)
  }

  return `❌ Validation failed (${validation.score}/4 components valid):\n${failed.join("\n")}`
}
