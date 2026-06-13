-- PageEngagementLog table
-- Pure logging infrastructure for page behavior tracking
-- No scoring, no ranking, no optimization logic

CREATE TABLE IF NOT EXISTS "PageEngagementLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "prospectId" TEXT NOT NULL,
  "insightId" TEXT NOT NULL,
  "validationId" TEXT NOT NULL,
  "pageViewed" BOOLEAN NOT NULL DEFAULT false,
  "viewedAt" TIMESTAMP,
  "dwellTimeSeconds" INTEGER,
  "scrollDepthPercent" REAL,
  "ctaClicks" INTEGER NOT NULL DEFAULT 0,
  "ctaClickedAt" TIMESTAMP,
  "returnVisits" INTEGER NOT NULL DEFAULT 0,
  "lastVisitAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast querying by prospect and insight
CREATE INDEX "PageEngagementLog_prospectId_idx" ON "PageEngagementLog"("prospectId");
CREATE INDEX "PageEngagementLog_insightId_idx" ON "PageEngagementLog"("insightId");
CREATE INDEX "PageEngagementLog_validationId_idx" ON "PageEngagementLog"("validationId");
CREATE INDEX "PageEngagementLog_createdAt_idx" ON "PageEngagementLog"("createdAt");

-- Unique constraint: only one log per (prospectId, insightId) pair
CREATE UNIQUE INDEX "PageEngagementLog_prospectId_insightId_idx" ON "PageEngagementLog"("prospectId", "insightId");
