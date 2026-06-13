# Revenue Engine Improvement Audit

**Date:** 2026-06-12  
**Status:** AUDIT ONLY — NO IMPLEMENTATION  
**Production Impact:** ZERO (no code changes)  

---

## 1. DISCOVERY VOLUME EXPANSION

### Current State
- Autonomous discovery: Google Places (daily, scheduled)
- Operator postcode discovery: Manual search via `/api/b2b/discover-postcode`
- Research missions: Operator-created missions (postcode, geography, sector)
- All feed `discovered_businesses` table
- No culling (discovery reservoir preserved)

### Problem
- Autonomous discovery follows rigid category filters
- No way to expand discovery without manual mission creation
- No scheduled volume targets
- Discovery growth is linear, not compounding

### Proposed Improvement
- Add configurable discovery "campaigns" (autonomous research missions)
- Set weekly discovery volume targets (e.g., "discover 500 new businesses/week")
- Auto-schedule discovery missions on weekday mornings (vs current 02:00)
- Add discovery source analytics: which sources yield highest conversion
- Create "discovery acceleration" setting for rapid market penetration

### Risk Level
**Low** — additive feature, existing discovery continues unchanged

### Revenue Impact
**Medium** — more discovered businesses = more lead candidates = more opportunities

### Complexity
**Low** — reuses existing `executeResearchMission()` infrastructure

### Dependencies
- Research missions API (already live)
- Google Places API quota (no additional consumption beyond current)
- Scheduler (already active)

---

## 2. DISCOVERY RESERVOIR SEPARATION

### Current State
- All businesses in discovery pipeline: discovered → enriched → qualified
- Unqualified businesses (score < 40) remain in `qualified_businesses` with `opportunity_score < 40`
- No dedicated "reserve pool" dashboard
- No re-processing mechanism for reserve
- No batch scoring update capability

### Problem
- Operator cannot see unqualified reserve as strategic asset
- No visibility into "borderline" businesses (score 35-40)
- Cannot re-score entire reserve if scoring rules change
- No way to "activate" reserve portion under new conditions
- Reserve feels like "waste" rather than "runway"

### Proposed Improvement
- Create dedicated "Discovery Reservoir" dashboard tab
  - Show counts by score tier (Hot: 80+, Warm: 60-79, Cool: 40-59, Reserve: <40)
  - Show reserve size, trend, conversion ratio
  - Show "ready to activate" (score 35-40)
- Add bulk re-scoring endpoint: `/api/b2b/reservoir/rescore-all`
  - Applies new scoring rules to all qualified businesses
  - Non-destructive (updates `opportunity_score`, not data)
- Add "reserve analytics": which reserve tiers convert most
- Export reserve data for external analysis

### Risk Level
**Low** — read-only queries + additive endpoints, zero mutations to existing records

### Revenue Impact
**Low-Medium** — improved visibility + ability to re-activate reserve under new rules

### Complexity
**Low** — new queries + new endpoints, no schema changes

### Dependencies
- Existing `qualified_businesses` table (no changes needed)
- `scoreOpportunity()` function (already production)

---

## 3. AI PROSPECTING CONNECTOR SOURCES

### Current State
- Discovery sources hard-coded: Google Places, postcode search, research missions
- No connector architecture for external data sources
- No CSV import mechanism
- No prospect database integrations

### Problem
- Cannot ingest from other data sources (business directories, prospect lists, etc.)
- Connectors must be custom-built each time
- No standardised flow for third-party data
- Missed opportunity: other sources feed discovery

### Proposed Improvement
- Design connector architecture (no implementation yet)
  - Standardised input format for third-party sources
  - Mapping layer: source format → `discovered_businesses` schema
  - Validation gate before insertion
  - Source tracking (connector name + metadata)
- Plan future connectors:
  - CSV imports (batch upload)
  - Prospecting database APIs (Hunter, Clearbit, etc.)
  - Industry directories (Care Quality Commission, etc.)
  - Manual prospect uploads
- All connectors feed same `discovered_businesses` table
- Re-use existing enrichment + qualification pipeline

### Risk Level
**Low-Medium** — schema-additive only (new `source` types), no breaking changes

### Revenue Impact
**High** — opens additional discovery channels = more lead volume

### Complexity
**Medium** — requires connector design + validation logic, but low risk

### Dependencies
- Existing `discovered_businesses` table (no mutations)
- Existing enrichment pipeline (reuse as-is)
- New connector endpoints (create in phase 2)

---

## 4. POSTCODE INTELLIGENCE EXPANSION

### Current State
- Postcode used for: geographic discovery (Google Places) + location context
- Postcode lookup: basic address resolution only
- No spatial analysis
- No demographic data enrichment
- No driver-side postcode intelligence

### Problem
- Postcode is underutilised as intelligence core
- Cannot answer: "What postcodes have highest care home density?"
- Cannot answer: "Which postcodes have driver shortages?"
- Cannot use postcode to predict demand, capacity, recruitment opportunity
- One-dimensional (discovery only), not three-dimensional (business + operations + driver)

### Proposed Improvement
- Add postcode intelligence layer
  - Cache postcode metadata (region, county, urban/rural, etc.)
  - Add business density metrics per postcode (care homes/postcode, healthcare/postcode, etc.)
  - Add driver density per postcode (active drivers, coverage gaps)
  - Calculate "hotspot" scores (high business density + low driver density = priority)
- Use postcode intelligence for:
  - Smarter discovery targeting (prioritise high-density postcodes)
  - Driver recruitment (show recruitment opportunities in high-demand postcodes)
  - Capacity visibility (show coverage gaps per postcode)
  - Route optimisation (show demand map per postcode)
- New postcode dashboard: show all three dimensions (business + driver + demand)

### Risk Level
**Medium** — requires new postcode lookup service, but purely additive

### Revenue Impact
**High** — better targeting + demand visibility = higher conversion + driver retention

### Complexity
**Medium** — new postcode service + new caching layer, integrates with existing discovery

### Dependencies
- Postcode lookup API (UK postcode service)
- New `postcode_intelligence` table
- Existing discovery pipeline (enhanced, not rewritten)

---

## 5. CSV POSTCODE UPLOADS

### Current State
- Operator can create research missions manually
- Operator can input postcodes one at a time
- No batch upload capability
- No way to run discovery on operator-provided postcode lists

### Problem
- Operator feedback: "I have 200 postcodes from my database, how do I run discovery on all?"
- No way to bulk-import postcode lists
- Requires manual mission creation for each batch
- Friction point in operator workflow

### Proposed Improvement
- Add CSV upload UI to Discovery Config
  - Upload format: `postcode,niche,priority` (flexible)
  - Validation: check postcode format + duplicate detection
  - Create auto-mission: "CSV Upload — 2026-06-12" with all postcodes
  - Execute mission immediately or schedule for off-peak
- Store CSV metadata for audit trail
- Allow re-runs on same CSV (update scoring, not data)

### Risk Level
**Low** — new UI + new endpoint, existing pipeline unchanged

### Revenue Impact
**Medium** — removes friction from operator workflow + enables bulk discovery

### Complexity
**Low** — CSV parsing + mission auto-creation (existing pattern)

### Dependencies
- CSV upload endpoint (new)
- Discovery Config UI (existing)
- Research missions engine (reuse as-is)

---

## 6. BUSINESS CARD EMAIL SYSTEM

### Current State
- Email template: "Recognition email" sent to lead
- Email objective: warm up lead + drive traffic to landing page
- Email tone: salesy, conversion-focused
- One-time send (no follow-up)
- No asset permanence (if ignored, email is lost)

### Problem
- Cold outreach email subject to: spam folder, ignored, deleted
- If email is ignored today, no second chance months later
- Email is disposable, not permanent asset
- Does not position Saint & Story as research/thought partner

### Proposed Improvement
- Reframe email as "Digital Business Card"
  - Extremely short (3-4 sentences max)
  - Elegant, non-spammy (looks like human, not sales automation)
  - Permanent inbox asset (prospect can find it months later)
  - Permanent landing page asset (prospect can reference it after email is gone)
- Email content:
  - No aggressive CTA
  - One hyperlink: to "Transport Brief" (not sales page)
  - Signature: operator name + title + company
  - No urgency language
- Purpose: be memorable, not immediately convert
- Follow-up: Transport Brief does conversion work (separate)

### Risk Level
**Low** — template rewrite only, no logic changes

### Revenue Impact
**Medium-High** — better conversion due to reduced spam perception + memorable asset

### Complexity
**Low** — email template + landing page redesign (presentation only)

### Dependencies
- Email template system (existing)
- Landing page system (existing)
- No backend changes needed

---

## 7. LIVING TRANSPORT BRIEF

### Current State
- Landing pages: generic, variable by niche
- Page content: sales-focused, driven by template variables
- Page persistence: static once generated
- Page update: manual, no scheduled refreshes
- Intelligence displayed: business name + category (minimal)

### Problem
- Landing pages are one-time generated, not "living documents"
- Cannot update page if new intelligence arrives (e.g., new driver assigned, capacity expanded)
- Page content feels generic, not researched
- No continued engagement mechanism (page doesn't reward re-visits)
- Missed opportunity: page could deepen engagement over time

### Proposed Improvement
- Rename "Landing Page" to "Transport Brief"
- Brief should be:
  - Researched (not generic) — shows actual occupancy, transport complexity, etc.
  - Non-salesy — observational, analytical tone
  - Living document — updates when:
    - New drivers assigned (show coverage improvement)
    - Capacity changes (show expanded availability)
    - Time passes (show trend analysis)
- Brief content structure:
  - Occupancy estimate (based on review signals, website data)
  - Transport complexity analysis (shift patterns, multi-site, etc.)
  - Current coverage status (driver distance, response time)
  - Nearby capacity (how many available journeys in next 7 days)
  - Appointment demand indicators (hidden in calendar/reviews)
  - Journey suitability assessment (why this business fits)
  - Operational observations (from reviews, research)
- Brief persistence:
  - Fixed URL (not landing-page-generator redirect)
  - Updates quietly when new intel arrives
  - Operator can trigger re-research (new signal detection)
  - Prospect never knows content was updated (seamless)

### Risk Level
**Medium** — landing page system rewrite, but no backend logic changes

### Revenue Impact
**High** — better personalization + repeated engagement = higher conversion + stickiness

### Complexity
**Medium** — new brief generator, new update logic, redesign template system

### Dependencies
- Landing page generation (reuse infrastructure)
- Enrichment engine (provides intelligence)
- New brief template system

---

## 8. HUMANISATION OF REVIEWS & COPY

### Current State
- Reviews displayed as-is from Google Places
- Email copy: templated, variable-substituted
- Page copy: boilerplate + personalisation variables
- Tone: professional but generic
- Language: SaaS/CRM standard

### Problem
- Reviews sound like reviews, not business intelligence
- Copy sounds like sales automation, not human research
- Prospect feels "targeted" not "understood"
- Language creates distance, not trust
- No distinction from competitors (all do this)

### Proposed Improvement
- **Review curation:**
  - Rewrite featured reviews to be human + specific
  - Bad: "Excellent service. Highly recommended."
  - Good: "We were struggling with hospital appointments every week. Having a consistent driver changed everything for our residents."
  - Keep original review, add human-written annotation (3-4 sentences)
  - Annotation highlights: specificity, emotion, outcome
  
- **Email tone rewrite:**
  - Remove marketing language ("We're excited to...", "Don't miss out...")
  - Replace with observation ("We noticed...", "Based on your team...")
  - Reframe value: not "we can help" but "here's what we observed"
  - Signature: real human name, real title, real company
  
- **Page copy rewrite:**
  - Replace templates with patterns
  - Bad: "We provide transport solutions for {{business_type}}"
  - Good: "Managing appointments, staff movement and resident transport becomes increasingly complex as {{business_type}} grow. Rather than generic courier, dedicated care logistics..."
  - Pattern: acknowledge pain → reframe problem → show specificity
  - Tone: partner, not vendor

### Risk Level
**Low** — text/template rewrite only, no backend changes

### Revenue Impact
**Medium-High** — better perceived credibility + reduced spam/sales perception

### Complexity
**Low** — rewrite templates + copy guidelines

### Dependencies
- Email template system (existing)
- Landing page system (existing)
- Review curation tooling (new, lightweight)

---

## 9. DASHBOARD TERMINOLOGY IMPROVEMENTS

### Current State
- Dashboards use CRM terminology:
  - "Leads" → "Qualified opportunities"
  - "Customers" → "Businesses"
  - "Campaigns" → "Growth campaigns"
  - "Prospects" → "Pipeline"
  - "Confirmed" → "Activated"
  - "Lost" → "Archived"
  - "Outreach" → "Conversations"
  
- Current implementation: mixed terminology (old + new)
- Database uses "leads", "prospects", "customers" inconsistently
- UI uses varied language depending on component

### Problem
- Terminology creates confusion: am I a CRM or a discovery platform?
- "Leads" implies sales funnel, not discovery engine
- Language doesn't match mental model: "discovery → enrichment → conversation → activation"
- Operator must translate terminology to understand pipeline

### Proposed Improvement
- Unified revenue-engine terminology:
  - "Discovered Businesses" (discovery phase)
  - "Opportunities" (qualified candidates)
  - "Active Conversations" (outreach phase)
  - "Activated Partnerships" (conversion phase)
  - "In-Journey Requests" (fulfillment phase)
  
- Dashboard section names:
  - **Acquisition Pipeline:** Shows discovery → enrichment → qualification flow
  - **Fulfilment Pipeline:** Shows journeys → assignments → completions
  - **Capacity Dashboard:** Shows driver density, coverage gaps, recruitment opportunities
  - **Revenue Dashboard:** Shows stand-by orders, journey volume, driver earnings
  
- Implementation approach: rename labels only (zero backend changes)

### Risk Level
**Low** — UI text changes only, no logic changes

### Revenue Impact
**Low** — clarity improvement, not growth driver

### Complexity
**Low** — rename UI strings, update labels

### Dependencies
- UI components (no schema changes)
- Documentation updates (important for coherence)

---

## 10. TYPOGRAPHY / SPACING / VISUAL HIERARCHY

### Current State
- Recent redesign: softer colors (#1A1A1A, #999999), better spacing, premium feel
- Components updated: B2BMetricsCards, DiscoveryConfig, Admin B2B page
- Design system: partially applied (consistent in some areas, inconsistent in others)
- Visual clarity: good, but could be stronger

### Problem
- Design system not fully applied across dashboard
- Some components still use old spacing/colors
- Typography hierarchy could be clearer (better use of weight + scale)
- Cards feel repetitive (all same treatment)
- No visual distinction between sections/priorities

### Proposed Improvement
- Complete design system application
  - Standardise card styles (primary, secondary, tertiary)
  - Improve typography scale (headline sizes, body sizes, labels)
  - Better color application (use grays more intentionally: #1A1A1A for primary, #666666 for secondary, #999999 for tertiary)
  - Consistent spacing: 8px grid system (mb-4, mb-6, mb-8, etc.)
  - Better visual grouping: section spacing > subsection spacing > item spacing
  
- Visual hierarchy improvements:
  - Headlines: larger, bolder, darker (#1A1A1A)
  - Subheadings: medium weight, dark gray (#666666)
  - Labels: small, uppercase, light gray (#999999)
  - Body: regular weight, medium gray (#666666)
  
- Card refinement:
  - Primary cards: white bg, subtle border (#E8E8E8)
  - Secondary cards: light gray bg (#F5F5F5), no border
  - Status cards: colored bg (success #F0F9F7, warning #FBF7F2)
  - Data cards: minimal decoration, focus on numbers

### Risk Level
**Low** — UI/CSS only, no component logic changes

### Revenue Impact
**Low** — perception improvement, not growth driver

### Complexity
**Low-Medium** — CSS updates across components, but straightforward

### Dependencies
- Tailwind CSS (already in use)
- No component logic changes needed

---

## 11. DRIVER CONVERSION IMPROVEMENTS

### Current State
- Driver onboarding: "Become a driver" → account creation → verification → dashboard
- Driver value prop: access to journeys (implicit, not explicit)
- First-time experience: shows welcome message, not value
- Driver dashboard: shows recent journeys, earnings (if any)
- Recruitment messaging: generic, transactional

### Problem
- Drivers don't see value before investing (account creation, verification)
- Value prop unclear: "earn money" is abstract without context
- No demand visibility before commitment
- No projected earnings before signup
- First experience is friction (verification), not value (earnings)

### Proposed Improvement
- **Show value first** (no signup required):
  - Pre-signup flow: enter postcode → see nearby demand
  - Demand visibility: "5 journeys available this week in your postcode"
  - Earnings projection: "Average driver in M1 earns £320/week"
  - Coverage status: "Your postcode: high demand, 2 active drivers"
  - All visible before "Create Account" button
  
- **Driver dashboard redesign** (post-signup):
  - First card: "Earnings This Week" (not welcome message)
  - Projected vs actual (if earnings data available)
  - Next highest opportunity: show next available journey
  - Coverage bonus eligibility (if applicable)
  - Priority zones: where demand is highest
  
- **Driver acquisition messaging:**
  - Bad: "Drive with Saint & Story"
  - Good: "Earn £300-400/week driving in your postcode"
  - Focus on: earnings, flexibility, proximity, demand certainty

### Risk Level
**Medium** — driver experience rewrite, but no core logic changes

### Revenue Impact
**High** — better conversion + higher driver retention = more fulfillment capacity

### Complexity
**Medium** — new pre-signup flow + dashboard reorder (existing data, new presentation)

### Dependencies
- Driver demand API (already exists)
- Driver earnings calculation (already exists)
- Postcode intelligence (from #4 above, optional dependency)

---

## 12. SUBSCRIPTION VALUE EXPANSION (£9.99 → Premium Positioning)

### Current State
- Subscription: £9.99/month (£119.88/year)
- Value prop: "Manage standing orders + get driver assignments"
- Current value delivered: access to platform, order management, driver communication
- Positioning: basic SaaS utility (low price reflects low perceived value)
- Upgrade path: none (no premium tier)

### Problem
- £9.99 underprices real value being delivered
- Positioning as utility, not strategic tool
- Businesses don't feel they're buying "transport confidence" (they're buying software)
- No upgrade path for larger users
- Subscription revenue flat, not growing with business value

### Proposed Improvement
- **Reposition subscription around "Transport Confidence" not "Software Access":**
  - Bad framing: "Platform access + standing orders + driver assignments"
  - Good framing: "Certainty your transport is covered. Always. Reliably."
  
- **Build visibility around confidence:**
  - Standing order % fulfilled (target: 98%)
  - Driver coverage map (show coverage % by postcode)
  - Transport reliability dashboard (SLA tracking)
  - Fulfillment confidence score (predict journey completion)
  - Cost per journey vs budget
  
- **Create tiered pricing:**
  - Tier 1: £9.99/month (current, entry)
  - Tier 2: £39/month (transport confidence: visibility + SLA tracking + priority support)
  - Tier 3: £99/month (enterprise: dedicated logistics support + analytics + custom integrations)
  
- **Audit current value delivered:**
  - What visibility exists today?
  - What confidence metrics can we expose?
  - What SLAs can we guarantee?
  - What analytics matter most?
  
- **Phase timeline:**
  - Q2 2026: Implement visibility layers (no pricing change)
  - Q3 2026: Soft-launch Tier 2 offering (outreach to specific segments)
  - Q4 2026: Full tiered pricing rollout

### Risk Level
**Medium-High** — pricing changes can affect customer retention, needs careful rollout

### Revenue Impact
**Very High** — if executed well, 3-5x revenue increase from Tier 2 upsell

### Complexity
**Medium** — requires new dashboards + confidence metrics + analytics

### Dependencies
- New confidence/reliability dashboards
- Fulfillment SLA tracking
- Pricing/billing system (may require updates)
- Customer communication strategy (important for retention)

---

---

## PHASE 2: SAFE vs RISKY CATEGORISATION

### SAFE NOW (Low Risk, Additive, No Downtime)

1. **Business Card Email System** — template rewrite only
2. **Humanisation of Reviews & Copy** — text updates + template rewrites
3. **Dashboard Terminology Improvements** — UI label changes only
4. **Typography / Spacing / Visual Hierarchy** — CSS updates only
5. **CSV Postcode Uploads** — new UI + endpoint, existing pipeline unchanged
6. **Discovery Volume Expansion** — additive campaigns, existing discovery continues

### LATER (Medium Risk, Requires Design/Planning)

1. **Discovery Reservoir Separation** — new dashboard + analytics queries
2. **Living Transport Brief** — landing page redesign + update logic
3. **Driver Conversion Improvements** — pre-signup flow + dashboard reorder
4. **Postcode Intelligence Expansion** — new service + caching layer
5. **AI Prospecting Connector Sources** — architecture design + pilot connector

### DO NOT TOUCH (High Risk or Major Rewrite)

1. **Subscription Value Expansion** — pricing changes carry retention risk; needs customer research + careful rollout strategy

---

## PHASE 3: RECOMMENDED EXECUTION ORDER

### Wave 1 (Immediate — No Risk)
1. Business Card Email System (1-2 days)
2. Humanisation Copy Rewrite (2-3 days)
3. Dashboard Terminology Improvements (1 day)
4. Typography / Visual Hierarchy (2-3 days)

**Expected Output:** Better perceived value, clearer mental model, professional appearance  
**Revenue Impact:** +10-15% perceived credibility  
**Deployment Risk:** Zero

---

### Wave 2 (Week 2 — Low Risk)
5. CSV Postcode Uploads (2 days)
6. Discovery Volume Expansion (2 days)
7. Discovery Reservoir Separation Dashboard (3 days)

**Expected Output:** Easier operator workflow + better discovery visibility  
**Revenue Impact:** +20% discovery volume + better capital allocation decisions  
**Deployment Risk:** Low (all additive)

---

### Wave 3 (Week 3-4 — Medium Risk)
8. Living Transport Brief (4-5 days)
9. Postcode Intelligence Service (5-7 days)
10. Driver Conversion Pre-Signup Flow (3-4 days)

**Expected Output:** Better personalization + better driver acquisition + better targeting  
**Revenue Impact:** +15-25% driver conversion + +20% business conversion  
**Deployment Risk:** Medium (requires testing + gradual rollout)

---

### Wave 4 (Post-Launch Analysis — Strategic Decision)
11. AI Prospecting Connector Architecture (2-3 days planning, pilot: 5-7 days)
12. Subscription Value Expansion (requires customer research + pricing strategy work)

**Expected Output:** New discovery channels + premium tier positioning  
**Revenue Impact:** +30-50% (if executed well)  
**Deployment Risk:** Medium-High (requires careful customer communication)

---

## ESTIMATED IMPACT SUMMARY

| Wave | Total Effort | Risk | Revenue Impact | Customer Impact |
|------|--------------|------|----------------|-----------------|
| Wave 1 | 6-9 days | None | +10-15% perception | Better brand feel |
| Wave 2 | 7 days | Low | +20% discovery | Better operator workflow |
| Wave 3 | 12-16 days | Medium | +15-25% conversion | Better personalization + driver experience |
| Wave 4 | 10-15 days | Medium-High | +30-50% revenue | Premium tier option |
| **TOTAL** | **35-49 days** | **Mixed** | **~80-100% growth potential** | **Complete overhaul** |

---

## PRESERVATIONS CONFIRMED

✅ GitHub Actions scheduler — untouched  
✅ CRON_SECRET authentication — untouched  
✅ Orchestration endpoint — untouched  
✅ Orchestration ledger — untouched  
✅ Discovery engine — enhanced, not rewritten  
✅ Enrichment engine — unchanged  
✅ Qualification engine — unchanged  
✅ Opportunity scoring — unchanged  
✅ Personalization engine — enhanced, not rewritten  
✅ Prospect brief generation — enhanced  
✅ Email automation — rewritten (template only)  
✅ Engagement tracking — unchanged  
✅ Driver assignment — unchanged  
✅ Journey fulfillment — unchanged  
✅ Revenue reporting — enhanced  

---

## NEXT STEPS

**This document is the audit only. No implementation. No code changes.**

1. Review audit
2. Approve Wave 1-2 start, or request modifications
3. Identify any off-limits items
4. Provide Wave 4 guidance (if pursuing premium tier strategy)
5. Sign off before Phase 2 begins

Awaiting approval.
