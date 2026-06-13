/**
 * Page Engagement Tracker
 *
 * Pure logging infrastructure for page behavior.
 * Records what happens. Does not interpret, score, rank, or optimize.
 * Non-blocking async operations.
 */

import { prisma } from "./prisma"
import { v4 as uuidv4 } from "uuid"

/**
 * Record page view
 *
 * @param prospectId Lead identifier
 * @param insightId Insight being expressed on page
 * @param validationId Validation log reference
 */
export async function recordPageView(params: {
  prospectId: string
  insightId: string
  validationId: string
}): Promise<string> {
  try {
    const log = await prisma.pageEngagementLog.create({
      data: {
        id: uuidv4(),
        prospectId: params.prospectId,
        insightId: params.insightId,
        validationId: params.validationId,
        pageViewed: true,
        viewedAt: new Date()
      }
    })
    return log.id
  } catch (error) {
    console.error(`Failed to record page view: ${error}`)
    throw error
  }
}

/**
 * Record scroll depth
 *
 * @param prospectId Lead identifier
 * @param depth Scroll depth as percentage (0.0-1.0)
 */
export async function recordScrollDepth(params: {
  prospectId: string
  insightId: string
  depth: number
}): Promise<void> {
  try {
    await prisma.pageEngagementLog.updateMany({
      where: {
        prospectId: params.prospectId,
        insightId: params.insightId
      },
      data: {
        scrollDepthPercent: Math.min(1.0, Math.max(0.0, params.depth)),
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error(`Failed to record scroll depth: ${error}`)
  }
}

/**
 * Record dwell time
 *
 * @param prospectId Lead identifier
 * @param seconds Time spent on page in seconds
 */
export async function recordDwellTime(params: {
  prospectId: string
  insightId: string
  seconds: number
}): Promise<void> {
  try {
    await prisma.pageEngagementLog.updateMany({
      where: {
        prospectId: params.prospectId,
        insightId: params.insightId
      },
      data: {
        dwellTimeSeconds: Math.max(0, Math.floor(params.seconds)),
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error(`Failed to record dwell time: ${error}`)
  }
}

/**
 * Record CTA click
 *
 * @param prospectId Lead identifier
 */
export async function recordCTAClick(params: {
  prospectId: string
  insightId: string
}): Promise<void> {
  try {
    await prisma.pageEngagementLog.updateMany({
      where: {
        prospectId: params.prospectId,
        insightId: params.insightId
      },
      data: {
        ctaClicks: { increment: 1 },
        ctaClickedAt: new Date(),
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error(`Failed to record CTA click: ${error}`)
  }
}

/**
 * Record return visit
 *
 * @param prospectId Lead identifier
 */
export async function recordReturnVisit(params: {
  prospectId: string
  insightId: string
}): Promise<void> {
  try {
    await prisma.pageEngagementLog.updateMany({
      where: {
        prospectId: params.prospectId,
        insightId: params.insightId
      },
      data: {
        returnVisits: { increment: 1 },
        lastVisitAt: new Date(),
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error(`Failed to record return visit: ${error}`)
  }
}

/**
 * Query engagement logs for analysis
 *
 * @param prospectId Lead identifier
 */
export async function getEngagementLog(params: {
  prospectId: string
  insightId?: string
}): Promise<any[]> {
  try {
    const logs = await prisma.pageEngagementLog.findMany({
      where: {
        prospectId: params.prospectId,
        insightId: params.insightId
      },
      orderBy: { createdAt: "desc" }
    })
    return logs
  } catch (error) {
    console.error(`Failed to query engagement logs: ${error}`)
    return []
  }
}
