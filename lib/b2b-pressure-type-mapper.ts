/**
 * Pressure Type Mapper
 *
 * Maps business categories to operational pressure types.
 * Used during enrichment to assign pressure_type to outreach emails.
 *
 * Pressure types represent the operational challenges we help solve:
 * - Time-Critical Movement: Moving/delivering with tight timelines
 * - Capacity Overflow: Demand exceeds current capacity
 * - Service Quality: Inconsistent service delivery
 * - Geographic Service Gaps: Can't reach all geographic areas
 * - Customer Acquisition: Hard to find new customers
 * - Customer Churn: Losing customers to competitors
 */

export type PressureType =
  | "Time-Critical Movement"
  | "Capacity Overflow"
  | "Service Quality Inconsistency"
  | "Geographic Service Gaps"
  | "Customer Acquisition Friction"
  | "Customer Churn"
  | "Delivery Reliability"
  | "Appointment Scheduling Friction"
  | "Communication Breakdown";

/**
 * Map business category to primary pressure type
 */
export function mapCategoryToPressureType(category: string): PressureType {
  const categoryMap: Record<string, PressureType> = {
    "removal-companies": "Time-Critical Movement",
    "estate-agents": "Customer Acquisition Friction",
    "dental-practices": "Appointment Scheduling Friction",
    "legal": "Customer Acquisition Friction",
    "pharmacies": "Time-Critical Movement",
    "event-organisers": "Delivery Reliability",
    "driving-schools": "Appointment Scheduling Friction",
    "plumbing": "Time-Critical Movement",
    "electricians": "Time-Critical Movement",
    "accounting": "Customer Acquisition Friction",
  };

  return categoryMap[category] || "Customer Acquisition Friction";
}

/**
 * Get alternative pressure types for a category
 * (for future A/B testing across different pressures)
 */
export function getAlternativePressureTypes(
  category: string
): PressureType[] {
  const category_lower = category.toLowerCase();

  if (
    category_lower.includes("removal") ||
    category_lower.includes("courier") ||
    category_lower.includes("delivery")
  ) {
    return [
      "Time-Critical Movement",
      "Delivery Reliability",
      "Capacity Overflow",
    ];
  }

  if (
    category_lower.includes("dental") ||
    category_lower.includes("salon") ||
    category_lower.includes("clinic")
  ) {
    return [
      "Appointment Scheduling Friction",
      "Capacity Overflow",
      "Customer Churn",
    ];
  }

  if (
    category_lower.includes("pharmacy") ||
    category_lower.includes("medical")
  ) {
    return [
      "Time-Critical Movement",
      "Delivery Reliability",
      "Communication Breakdown",
    ];
  }

  return [
    "Customer Acquisition Friction",
    "Customer Churn",
    "Communication Breakdown",
  ];
}

/**
 * Get pressure-specific email context variables
 * Used by email template generator to customize messages
 */
export function getPressureEmailContext(
  pressureType: PressureType,
  category: string,
  location: string | null
): Record<string, string> {
  const locationStr = location || "your area";

  const contextMap: Record<PressureType, Record<string, string>> = {
    "Time-Critical Movement": {
      situation: `businesses need to move things urgently with tight delivery windows`,
      coping: `you're probably asking "can you get this there by noon?" and scrambling to find coverage`,
      variability: `Some days you solve it. Some days they go to competitors.`,
      timeframe: "morning",
    },
    "Capacity Overflow": {
      situation: `service providers are fully booked with demand outpacing capacity`,
      coping: `you're turning away business or squeezing in last-minute appointments`,
      variability: `Some days you're overwhelmed. Some days you have gaps.`,
      timeframe: "week",
    },
    "Service Quality Inconsistency": {
      situation: `service quality varies because you're stretched thin managing growth`,
      coping: `you're worried about consistency as you scale`,
      variability: `Some clients get great service. Others see the cracks.`,
      timeframe: "month",
    },
    "Geographic Service Gaps": {
      situation: `you can't reach all areas customers are asking for`,
      coping: `you're missing opportunities because of geographic limitations`,
      variability: `Some locations are covered. Others are completely dark.`,
      timeframe: "quarter",
    },
    "Customer Acquisition Friction": {
      situation: `it's hard to find new customers consistently`,
      coping: `you're spending too much time and money on marketing with low returns`,
      variability: `Some campaigns work. Most don't.`,
      timeframe: "month",
    },
    "Customer Churn": {
      situation: `you're losing customers to competitors or better alternatives`,
      coping: `acquiring new customers costs more than keeping existing ones`,
      variability: `Some customers stay. Others leave quietly.`,
      timeframe: "year",
    },
    "Delivery Reliability": {
      situation: `delivery partners are unreliable, causing customer frustration`,
      coping: `you're managing upset customers when deliveries fail`,
      variability: `Some deliveries are perfect. Others create chaos.`,
      timeframe: "day",
    },
    "Appointment Scheduling Friction": {
      situation: `appointment scheduling is chaotic with no-shows and rescheduling`,
      coping: `you're wasting time managing the calendar instead of running your business`,
      variability: `Some days flow smoothly. Others are a nightmare.`,
      timeframe: "day",
    },
    "Communication Breakdown": {
      situation: `customers don't know what's happening, creating support chaos`,
      coping: `you're spending hours on status updates instead of actual work`,
      variability: `Some customers understand. Others get frustrated.`,
      timeframe: "interaction",
    },
  };

  return contextMap[pressureType] || contextMap["Customer Acquisition Friction"];
}
