import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrichLeadWithOutreach } from "@/lib/b2b-enrichment-orchestrator";

export const maxDuration = 300;

export async function GET() {
  try {
    const allLeads = await prisma.b2b_leads.findMany({
      select: { id: true, business_name: true },
      orderBy: { created_at: "asc" },
    });

    console.log(`[BATCH-ENRICH] Starting enrichment for ${allLeads.length} leads`);

    const results = {
      total: allLeads.length,
      succeeded: 0,
      failed: 0,
      partial: 0,
      details: [] as any[],
    };

    // Process in series to avoid overwhelming the database
    for (const lead of allLeads) {
      try {
        const result = await enrichLeadWithOutreach(lead.id);

        const detail = {
          lead_id: lead.id,
          business_name: lead.business_name,
          brief_generated: result.brief_generated,
          angle_generated: result.angle_generated,
          email_generated: result.email_generated,
          status: result.brief_generated && result.angle_generated && result.email_generated
            ? "success"
            : result.brief_generated || result.angle_generated || result.email_generated
            ? "partial"
            : "failed",
        };

        if (detail.status === "success") results.succeeded++;
        else if (detail.status === "partial") results.partial++;
        else results.failed++;

        results.details.push(detail);

        // Log every 10 for progress
        if ((results.succeeded + results.partial + results.failed) % 10 === 0) {
          console.log(
            `[BATCH-ENRICH] Progress: ${results.succeeded + results.partial + results.failed}/${allLeads.length}`
          );
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          lead_id: lead.id,
          business_name: lead.business_name,
          error: error instanceof Error ? error.message : "Unknown error",
          status: "error",
        });
        console.error(`[BATCH-ENRICH] Error enriching ${lead.id}:`, error);
      }

      // Small delay between leads
      await new Promise((r) => setTimeout(r, 50));
    }

    console.log(`[BATCH-ENRICH] Completed: ${results.succeeded} success, ${results.partial} partial, ${results.failed} failed`);

    return NextResponse.json({
      status: "completed",
      summary: {
        total: results.total,
        succeeded: results.succeeded,
        partial: results.partial,
        failed: results.failed,
        success_rate: Math.round((results.succeeded / results.total) * 100) + "%",
      },
      details: results.details,
    });
  } catch (error) {
    console.error("[BATCH-ENRICH] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
