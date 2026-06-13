-- Phase A: Instrumentation
-- Shadow logging for Evidence Validation Engine
-- Zero behavior change. Current system runs unchanged.

-- CreateTable "ValidationLog"
CREATE TABLE "ValidationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "validationId" TEXT NOT NULL UNIQUE,
    "prospectId" TEXT NOT NULL,
    "selectedInsightType" TEXT NOT NULL,
    "selectedBecause" TEXT NOT NULL,
    "rejectedInsightsJson" TEXT NOT NULL,
    "confidenceScore" REAL NOT NULL,
    "confidenceBand" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "evidenceSourcesJson" TEXT NOT NULL,
    "evidenceSourceCount" INTEGER NOT NULL,
    "contradictionsJson" TEXT NOT NULL,
    "contradictionsCount" INTEGER NOT NULL DEFAULT 0,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "emailOpenRate" REAL,
    "pageVisited" BOOLEAN NOT NULL DEFAULT false,
    "pageVisitedAt" TIMESTAMP(3),
    "pageDwellTime" INTEGER,
    "pageScrollDepth" REAL,
    "ctaClicked" BOOLEAN NOT NULL DEFAULT false,
    "ctaClickedAt" TIMESTAMP(3),
    "replyReceived" BOOLEAN NOT NULL DEFAULT false,
    "replyReceivedAt" TIMESTAMP(3),
    "conversionStatus" TEXT,
    "kpiInsightAccuracy" BOOLEAN,
    "kpiEngagementDepth" TEXT,
    "kpiConversationStarts" INTEGER NOT NULL DEFAULT 0,
    "kpiConversion" BOOLEAN NOT NULL DEFAULT false,
    "leadCategory" TEXT NOT NULL,
    "leadLocations" INTEGER NOT NULL,
    "enrichmentLevel" TEXT NOT NULL,
    "validatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "outcomeEvaluatedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ValidationLog_prospectId_idx" ON "ValidationLog"("prospectId");

-- CreateIndex
CREATE INDEX "ValidationLog_status_idx" ON "ValidationLog"("status");

-- CreateIndex
CREATE INDEX "ValidationLog_selectedInsightType_idx" ON "ValidationLog"("selectedInsightType");

-- CreateIndex
CREATE INDEX "ValidationLog_kpiInsightAccuracy_idx" ON "ValidationLog"("kpiInsightAccuracy");

-- CreateIndex
CREATE INDEX "ValidationLog_conversionStatus_idx" ON "ValidationLog"("conversionStatus");
