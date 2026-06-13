/**
 * Generate validation samples for human review
 *
 * Creates 9 samples (3 initial, 3 follow-up, 3 pages) without sending
 * Used in Phase 7: Human Validation
 *
 * Run: npx ts-node scripts/generate-validation-samples.ts
 */

import { PrismaClient } from "@prisma/client"
import { generateOutboundEmail, ConversionEngineRequest } from "../lib/b2b-conversion-engine"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

interface ValidationSample {
  type: "initial" | "follow_up" | "page_preview"
  prospectName: string
  category: string
  sample: any
  status: "approved" | "rejected"
  errors?: string[]
}

async function generateValidationSamples() {
  console.log("🔧 CONVERSION ENGINE VALIDATION SAMPLE GENERATOR\n")

  try {
    // Get sample leads from database
    const leads = await prisma.$queryRaw`
      SELECT
        id,
        business_name,
        email,
        category,
        location_count,
        rating_average,
        review_count
      FROM b2b_leads
      WHERE source != 'qa_system_test'
      ORDER BY RANDOM()
      LIMIT 3
    ` as Array<any>

    if (leads.length < 3) {
      console.log(`⚠️  Only found ${leads.length} production leads. Generating mock samples.`)
      await generateMockSamples()
      return
    }

    console.log(`✅ Found ${leads.length} production leads for sampling\n`)

    const samples: ValidationSample[] = []

    // Generate initial outreach samples
    console.log("📧 Generating INITIAL OUTREACH samples...\n")
    for (let i = 0; i < 3; i++) {
      const lead = leads[i]
      console.log(`${i + 1}. ${lead.business_name} (${lead.category || "business"})`)

      const request: ConversionEngineRequest = {
        lead: {
          id: lead.id,
          business_name: lead.business_name,
          email: lead.email,
          category: lead.category || "business",
          location_count: lead.location_count || 1,
          rating_average: lead.rating_average || 4.0,
          review_count: lead.review_count || 0
        },
        context: "initial_outreach"
      }

      const result = await generateOutboundEmail(request)

      if ("approved" in result && !result.approved) {
        samples.push({
          type: "initial",
          prospectName: lead.business_name,
          category: lead.category,
          sample: result,
          status: "rejected",
          errors: [result.rejection_reason]
        })
        console.log(`   ❌ Rejected: ${result.rejection_reason}\n`)
      } else {
        samples.push({
          type: "initial",
          prospectName: lead.business_name,
          category: lead.category,
          sample: result,
          status: "approved"
        })
        console.log(`   ✅ Approved (RRTA ${(result as any).rrat_score}/4)\n`)
      }
    }

    // Generate follow-up samples
    console.log("\n📧 Generating FOLLOW-UP samples...\n")
    for (let i = 0; i < 3; i++) {
      const lead = leads[i]
      console.log(`${i + 1}. ${lead.business_name} (follow-up after email opened)`)

      const request: ConversionEngineRequest = {
        lead: {
          id: lead.id,
          business_name: lead.business_name,
          email: lead.email,
          category: lead.category || "business",
          location_count: lead.location_count || 1,
          rating_average: lead.rating_average || 4.0,
          review_count: lead.review_count || 0,
          engagement_score: 10 // Simulate opened
        },
        context: "follow_up",
        triggerEvent: "email_opened_no_click"
      }

      const result = await generateOutboundEmail(request)

      if ("approved" in result && !result.approved) {
        samples.push({
          type: "follow_up",
          prospectName: lead.business_name,
          category: lead.category,
          sample: result,
          status: "rejected",
          errors: [result.rejection_reason]
        })
        console.log(`   ❌ Rejected: ${result.rejection_reason}\n`)
      } else {
        samples.push({
          type: "follow_up",
          prospectName: lead.business_name,
          category: lead.category,
          sample: result,
          status: "approved"
        })
        console.log(`   ✅ Approved (RRTA ${(result as any).rrat_score}/4)\n`)
      }
    }

    // Generate page preview samples (same leads, showing what page looks like)
    console.log("\n📄 Generating PROSPECT PAGE PREVIEW samples...\n")
    for (let i = 0; i < 3; i++) {
      const lead = leads[i]
      console.log(`${i + 1}. ${lead.business_name} - Prospect Brief Page`)

      // Reuse the approved initial outreach to show page
      const approved = samples.find(
        (s) => s.type === "initial" && s.prospectName === lead.business_name && s.status === "approved"
      )

      if (approved) {
        const emailResult = approved.sample as any
        const pagePreview = {
          prospectName: lead.business_name,
          category: lead.category,
          pageUrl: emailResult.prospect_page_url,
          narrative: {
            recognition: emailResult.recognition,
            relief: emailResult.relief,
            trust: emailResult.trust,
            action: emailResult.action
          },
          cta: {
            text: emailResult.cta_text,
            destination: "book_meeting_or_reply"
          },
          tracking: [
            "Page visit",
            "Scroll depth",
            "Time on page",
            "CTA click",
            "Form submission"
          ]
        }

        samples.push({
          type: "page_preview",
          prospectName: lead.business_name,
          category: lead.category,
          sample: pagePreview,
          status: "approved"
        })
        console.log(`   ✅ Page preview ready\n`)
      }
    }

    // Generate report
    await writeValidationReport(samples)
  } catch (error) {
    console.error("Error generating samples:", error)
  } finally {
    await prisma.$disconnect()
  }
}

async function generateMockSamples() {
  console.log("📊 Generating MOCK samples (no production data available)\n")

  const mockLeads = [
    {
      business_name: "haart Estate and Lettings Agents Leeds",
      email: "contact@haart.co.uk",
      category: "estate_agent",
      location_count: 12,
      rating_average: 4.3,
      review_count: 87
    },
    {
      business_name: "Westpoint Pharmacy",
      email: "info@westfieldpharmacy.co.uk",
      category: "pharmacy",
      location_count: 3,
      rating_average: 4.6,
      review_count: 142
    },
    {
      business_name: "Cornerstone Sales and Lettings",
      email: "contact@cornerstoneleeds.co.uk",
      category: "estate_agent",
      location_count: 8,
      rating_average: 4.1,
      review_count: 64
    }
  ]

  const samples: ValidationSample[] = []

  // Initial outreach
  for (const lead of mockLeads) {
    const request: ConversionEngineRequest = {
      lead: {
        id: `mock_${lead.business_name.replace(/\s+/g, "_")}`,
        business_name: lead.business_name,
        email: lead.email,
        category: lead.category || "business",
        location_count: lead.location_count,
        rating_average: lead.rating_average,
        review_count: lead.review_count
      },
      context: "initial_outreach"
    }

    const result = await generateOutboundEmail(request)

    if ("approved" in result && !result.approved) {
      samples.push({
        type: "initial",
        prospectName: lead.business_name,
        category: lead.category,
        sample: result,
        status: "rejected",
        errors: [result.rejection_reason]
      })
    } else {
      samples.push({
        type: "initial",
        prospectName: lead.business_name,
        category: lead.category,
        sample: result,
        status: "approved"
      })
    }
  }

  // Follow-ups
  for (const lead of mockLeads) {
    const request: ConversionEngineRequest = {
      lead: {
        id: `mock_${lead.business_name.replace(/\s+/g, "_")}`,
        business_name: lead.business_name,
        email: lead.email,
        category: lead.category || "business",
        location_count: lead.location_count,
        rating_average: lead.rating_average,
        review_count: lead.review_count,
        engagement_score: 10
      },
      context: "follow_up",
      triggerEvent: "email_opened_no_click"
    }

    const result = await generateOutboundEmail(request)

    if ("approved" in result && !result.approved) {
      samples.push({
        type: "follow_up",
        prospectName: lead.business_name,
        category: lead.category,
        sample: result,
        status: "rejected",
        errors: [result.rejection_reason]
      })
    } else {
      samples.push({
        type: "follow_up",
        prospectName: lead.business_name,
        category: lead.category,
        sample: result,
        status: "approved"
      })
    }
  }

  await writeValidationReport(samples)
}

async function writeValidationReport(samples: ValidationSample[]) {
  const initialSamples = samples.filter((s) => s.type === "initial")
  const followUpSamples = samples.filter((s) => s.type === "follow_up")
  const pageSamples = samples.filter((s) => s.type === "page_preview")

  let report = `# CONVERSION ENGINE VALIDATION SAMPLES

**Generated**: ${new Date().toISOString()}
**Status**: AWAITING HUMAN REVIEW

---

## SUMMARY

- Initial Outreach: ${initialSamples.length} samples
- Follow-Up: ${followUpSamples.length} samples
- Prospect Pages: ${pageSamples.length} samples

**Approval Status**:
- ✅ Approved: ${samples.filter((s) => s.status === "approved").length}
- ❌ Rejected: ${samples.filter((s) => s.status === "rejected").length}

---

## REVIEW CHECKLIST

Before approval, verify:

- [ ] Recognition feels SPECIFIC (not generic category insight)?
- [ ] Relief acknowledges THEIR actual burden?
- [ ] Trust provides CREDIBLE proof (not unsupported claim)?
- [ ] Action is VALIDATION question (not generic meeting ask)?
- [ ] Email flows naturally without template feel?
- [ ] Page mirrors and deepens email narrative?
- [ ] CTA is clear and drives to prospect page?
- [ ] Each email would make ME click (psychological test)?

---

## INITIAL OUTREACH SAMPLES

`

  for (const sample of initialSamples) {
    if (sample.status === "approved") {
      const email = sample.sample as any
      report += `
### ${sample.prospectName}

**Category**: ${sample.category}
**Status**: ✅ APPROVED (RRTA ${email.rrat_score}/4)

**TO**: ${email.prospect_page_url.match(/leads?\/([^?]+)/)?.[1] || "prospect@email.com"}
**SUBJECT**: ${email.subject}

**EMAIL BODY**:
\`\`\`
${email.body}

[CTA: "${email.cta_text}"]
[Link: ${email.prospect_page_url}]
\`\`\`

**RRTA BREAKDOWN**:
- Recognition: ${email.recognition}
- Relief: ${email.relief}
- Trust: ${email.trust}
- Action: ${email.action}

---
`
    } else {
      report += `
### ${sample.prospectName}

**Category**: ${sample.category}
**Status**: ❌ REJECTED

**Reason**: ${sample.errors?.[0] || "Unknown"}

---
`
    }
  }

  report += `
## FOLLOW-UP SAMPLES

`

  for (const sample of followUpSamples) {
    if (sample.status === "approved") {
      const email = sample.sample as any
      report += `
### ${sample.prospectName} (After Open, No Click)

**Status**: ✅ APPROVED (RRTA ${email.rrat_score}/4)

**SUBJECT**: ${email.subject}

**EMAIL BODY**:
\`\`\`
${email.body}

[CTA: "${email.cta_text}"]
[Link: ${email.prospect_page_url}]
\`\`\`

---
`
    }
  }

  report += `
## NEXT STEPS

If samples are approved:
1. Proceed to Phase 8: Migration (audit 6 currently-live prospects)
2. Update email sending paths to use conversion engine
3. Deploy to staging
4. Test 1 send, verify tracking
5. Deploy to production

If samples need changes:
1. Identify specific issues
2. Debug RRTA generation
3. Regenerate samples
4. Review again

---

**GENERATED BY**: Conversion Engine V1
**DO NOT SEND TO PROSPECTS YET** — Awaiting human approval
`

  const reportPath = path.join(
    process.cwd(),
    "CONVERSION_ENGINE_VALIDATION_SAMPLES.md"
  )
  fs.writeFileSync(reportPath, report)

  console.log(`\n✅ Report written to: ${reportPath}`)
  console.log(`\n📋 NEXT STEP: Review samples and approve/request changes`)
}

generateValidationSamples().catch(console.error)
