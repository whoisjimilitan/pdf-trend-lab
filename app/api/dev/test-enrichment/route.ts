import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateProspectBrief } from "@/lib/b2b-prospect-brief-generator";
import { generateOutreachAngles } from "@/lib/b2b-outreach-angle-generator";
import { generateEmailDraft } from "@/lib/b2b-email-draft-generator";

export const maxDuration = 60;

export async function GET() {
  try {
    // Get the first lead without a brief
    const leadWithoutBrief = await prisma.b2b_leads.findFirst({
      where: {
        b2b_prospect_brief_cache: {
          is: null,
        },
      },
    });

    if (!leadWithoutBrief) {
      return NextResponse.json({
        status: "no_test_lead",
        message: "All leads already have briefs generated",
      });
    }

    console.log(`[TEST] Testing enrichment for: ${leadWithoutBrief.business_name}`);

    // Test brief generation
    const brief = await generateProspectBrief(leadWithoutBrief.id);
    if (!brief) {
      return NextResponse.json({
        status: "failed",
        error: "Brief generation failed",
      });
    }

    console.log(`[TEST] Brief generated`);

    // Test angle generation
    const angle = await generateOutreachAngles(brief);
    if (!angle) {
      return NextResponse.json({
        status: "failed",
        error: "Angle generation failed",
      });
    }

    console.log(`[TEST] Angle generated`);

    // Test email generation
    const email = await generateEmailDraft(brief, angle);
    if (!email) {
      return NextResponse.json({
        status: "failed",
        error: "Email generation failed",
      });
    }

    console.log(`[TEST] Email generated`);

    // Verify all stored
    const storedBrief = await prisma.b2b_prospect_brief_cache.findUnique({
      where: { lead_id: leadWithoutBrief.id },
    });

    const storedEmail = await prisma.b2b_outreach.findFirst({
      where: { lead_id: leadWithoutBrief.id },
    });

    return NextResponse.json({
      status: "success",
      lead_id: leadWithoutBrief.id,
      business_name: leadWithoutBrief.business_name,
      brief_generated: !!storedBrief,
      brief_data: storedBrief?.brief_data,
      angle_generated: !!angle,
      angle_data: angle,
      email_generated: !!storedEmail,
      email_subject: storedEmail?.subject,
      email_preview: storedEmail?.body?.substring(0, 100),
    });
  } catch (error) {
    console.error("[TEST] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
