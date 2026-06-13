/**
 * Evidence Validation Engine Feature Flags
 *
 * Controls Evidence Validation Engine behavior:
 * - OFF (default): Current system runs unchanged
 * - SHADOW: Evidence Validation Engine runs in parallel, logs everything, influences nothing
 * - AUTHORITY: Evidence Validation Engine makes production decisions (after promotion thresholds met)
 *
 * Promotion from SHADOW → AUTHORITY is data-driven only, never time-based.
 */

export type EvidenceValidationMode = "off" | "shadow" | "authority"

/**
 * Get current Evidence Validation mode from environment
 */
export function getEvidenceValidationMode(): EvidenceValidationMode {
  const mode = process.env.EVIDENCE_VALIDATION_MODE || "off"

  if (mode === "shadow" || mode === "authority") {
    return mode as EvidenceValidationMode
  }

  return "off"
}

/**
 * Check if Evidence Validation Engine is enabled (either shadow or authority)
 */
export function isEvidenceValidationEnabled(): boolean {
  return getEvidenceValidationMode() !== "off"
}

/**
 * Check if Evidence Validation Engine is in shadow mode (observer only)
 */
export function isEvidenceValidationShadowMode(): boolean {
  return getEvidenceValidationMode() === "shadow"
}

/**
 * Check if Evidence Validation Engine has authority (makes production decisions)
 */
export function isEvidenceValidationAuthoritative(): boolean {
  return getEvidenceValidationMode() === "authority"
}

/**
 * Log current Evidence Validation state
 *
 * Called at application startup to confirm state.
 */
export function logEvidenceValidationState(): void {
  const mode = getEvidenceValidationMode()

  switch (mode) {
    case "off":
      console.log("✅ Evidence Validation Engine: OFF (current system running unchanged)")
      break
    case "shadow":
      console.log("📊 Evidence Validation Engine: SHADOW MODE (observer only, collecting data)")
      break
    case "authority":
      console.log("🚀 Evidence Validation Engine: AUTHORITY (making production decisions)")
      break
  }
}

/**
 * Promotion thresholds
 *
 * These define when Evidence Validation Engine can transition from SHADOW → AUTHORITY
 * Only statistical superiority triggers promotion, never time-based.
 */
export const PROMOTION_THRESHOLDS = {
  // Minimum samples required before considering promotion
  MIN_SAMPLES: 1000,

  // Conversion rate must be at least this much better than baseline
  MIN_CONVERSION_IMPROVEMENT: 0.15, // 15% minimum

  // Engagement depth must reach this % of higher-value interactions
  MIN_ENGAGEMENT_QUALITY: 0.70, // 70%

  // Insight accuracy (approved insights leading to engagement) must be this high
  MIN_INSIGHT_ACCURACY: 0.90, // 90%

  // Statistical significance level required
  MIN_STATISTICAL_SIGNIFICANCE: 0.95 // 95% confidence
}

/**
 * Validate promotion threshold
 *
 * Checks if a given metric meets its threshold.
 */
export function meetsPromotionThreshold(
  metricName: keyof typeof PROMOTION_THRESHOLDS,
  value: number
): boolean {
  const threshold = PROMOTION_THRESHOLDS[metricName]
  return typeof threshold === "number" && value >= threshold
}
