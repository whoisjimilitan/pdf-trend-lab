import { NextRequest, NextResponse } from "next/server";

interface EmailGenerationRequest {
  industry: string;
  company: string;
  city: string;
}

interface EmailSection {
  sectionType: "Observation" | "PatternRecognition" | "DeferredDecision";
  contentFrame:
    | "specificObservation"
    | "trackingPattern"
    | "softInevitability"
    | "referenceLandingPageContent";
  content: string;
  characterCount: number;
}

interface ValidationViolation {
  code: string;
  message: string;
}

interface ValidationResult {
  passed: boolean;
  violations: ValidationViolation[];
  violationCount: number;
}

// Locked narrative frames (immutable, hard-locked from Tier 2 Step 3 execution payload)
const NARRATIVE_FRAMES = {
  specificObservation: (industry: string, city: string) =>
    `We're tracking what's happening in ${industry} operations across ${city}. This pattern of operational coordination is becoming standard practice.`,

  trackingPattern: (company: string, industry: string) =>
    `For ${company}, this would translate into structured visibility across daily coordination and delivery. Right now, this visibility is distributed across emails, phone calls, and manual tracking.`,

  softInevitability: (company: string, industry: string) =>
    `When operations are owned rather than brokered, the coordination becomes a competitive asset instead of a cost center. This is why we brought this to your attention now — it's becoming a standard expectation in ${industry}.`,
};

// Format industry name (slug to title case)
function formatIndustryName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Generate email sections according to locked schema
function generateEmailSections(params: EmailGenerationRequest): EmailSection[] {
  const { industry, company, city } = params;
  const industryName = formatIndustryName(industry);

  return [
    {
      sectionType: "Observation",
      contentFrame: "specificObservation",
      content: NARRATIVE_FRAMES.specificObservation(
        industryName.toLowerCase(),
        city
      ),
      characterCount: NARRATIVE_FRAMES.specificObservation(
        industryName.toLowerCase(),
        city
      ).length,
    },
    {
      sectionType: "PatternRecognition",
      contentFrame: "trackingPattern",
      content: NARRATIVE_FRAMES.trackingPattern(company, industryName),
      characterCount: NARRATIVE_FRAMES.trackingPattern(company, industryName)
        .length,
    },
    {
      sectionType: "DeferredDecision",
      contentFrame: "softInevitability",
      content: NARRATIVE_FRAMES.softInevitability(
        company,
        industryName.toLowerCase()
      ),
      characterCount: NARRATIVE_FRAMES.softInevitability(
        company,
        industryName.toLowerCase()
      ).length,
    },
  ];
}

// Generate email subject line
function generateSubjectLine(company: string, industry: string): string {
  const industryName = formatIndustryName(industry);
  const subject = `${industryName} operations pattern — ${company}`;
  return subject.substring(0, 60); // Hard limit
}

// Validate email sections against schema
function validateEmailSections(sections: EmailSection[]): ValidationResult {
  const violations: ValidationViolation[] = [];

  // Check section count
  if (sections.length !== 3) {
    violations.push({
      code: "SECTION_COUNT_MISMATCH",
      message: `Expected 3 sections, got ${sections.length}`,
    });
  }

  // Validate each section
  sections.forEach((section, index) => {
    // Check character limit (250 max)
    if (section.characterCount > 250) {
      violations.push({
        code: "SECTION_EXCEEDS_CHAR_LIMIT",
        message: `Section ${index + 1} (${section.sectionType}) exceeds 250 chars: ${section.characterCount}`,
      });
    }

    // Check for rhetorical questions
    if (/\?/.test(section.content) && section.sectionType !== "DeferredDecision") {
      // DeferredDecision can have a question
      violations.push({
        code: "RHETORICAL_QUESTION_DETECTED",
        message: `Section ${index + 1} contains rhetorical question`,
      });
    }

    // Check for vendor-speak patterns
    const vendorPatterns = [
      /we help/i,
      /our solution/i,
      /sign up/i,
      /industry-leading/i,
      /cutting-edge/i,
      /proven results/i,
      /do you need/i,
      /are you interested/i,
    ];

    vendorPatterns.forEach((pattern) => {
      if (pattern.test(section.content)) {
        violations.push({
          code: "VENDOR_SPEAK_DETECTED",
          message: `Section ${index + 1} contains vendor-speak: ${pattern.source}`,
        });
      }
    });
  });

  // Check frame types are locked (hard-locked from Tier 2 Step 3 payload)
  const allowedFrames = {
    Observation: ["specificObservation"],
    PatternRecognition: ["trackingPattern"],
    DeferredDecision: ["softInevitability"],
  };

  sections.forEach((section, index) => {
    const allowed = allowedFrames[section.sectionType as keyof typeof allowedFrames];
    if (!allowed.includes(section.contentFrame)) {
      violations.push({
        code: "INVALID_CONTENT_FRAME",
        message: `Section ${index + 1} (${section.sectionType}) has invalid frame: ${section.contentFrame}`,
      });
    }
  });

  return {
    passed: violations.length === 0,
    violations,
    violationCount: violations.length,
  };
}

// Generate mailto: link
function generateMailtoLink(
  subject: string,
  body: string,
  to?: string
): string {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  const mailto = to
    ? `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`
    : `mailto:?subject=${encodedSubject}&body=${encodedBody}`;

  return mailto;
}

// Format email body from sections
function formatEmailBody(sections: EmailSection[]): string {
  return sections.map((section) => section.content).join("\n\n");
}

// Main API handler
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const industry = searchParams.get("industry");
    const company = searchParams.get("company");
    const city = searchParams.get("city");
    const validateOnly = searchParams.get("validate") === "true";

    // Validate required params
    if (!industry || !company || !city) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          required: ["industry", "company", "city"],
        },
        { status: 400 }
      );
    }

    const params: EmailGenerationRequest = {
      industry: industry.toLowerCase(),
      company,
      city,
    };

    // Generate email sections
    const sections = generateEmailSections(params);

    // Validate sections
    const validation = validateEmailSections(sections);

    // If validation fails, return error
    if (!validation.passed) {
      return NextResponse.json(
        {
          error: "Email validation failed",
          violations: validation.violations,
          violationCount: validation.violationCount,
        },
        { status: 400 }
      );
    }

    // Generate subject and body
    const subject = generateSubjectLine(company, industry);
    const body = formatEmailBody(sections);
    const recipientEmail = searchParams.get("to");

    // Generate mailto: link
    const mailtoLink = generateMailtoLink(subject, body, recipientEmail || undefined);

    // Return structured response
    const response = {
      success: true,
      metadata: {
        industry: params.industry,
        company: params.company,
        city: params.city,
        recipientEmail: recipientEmail || null,
      },
      email: {
        subject,
        body,
        sections: sections.map((s) => ({
          type: s.sectionType,
          frame: s.contentFrame,
          content: s.content,
          characterCount: s.characterCount,
        })),
      },
      validation: {
        passed: true,
        violations: [],
        violationCount: 0,
      },
      mailtoLink,
    };

    if (validateOnly) {
      return NextResponse.json(response);
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST: Validate external email data against schema
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract email sections from request
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: "Missing or invalid 'sections' array" },
        { status: 400 }
      );
    }

    // Validate
    const validation = validateEmailSections(sections as EmailSection[]);

    return NextResponse.json({
      success: validation.passed,
      validation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
