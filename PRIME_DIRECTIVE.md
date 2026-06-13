# B2B System Prime Directive

**Date**: 2026-06-13  
**Status**: LOCKED GOVERNANCE LAYER  
**Authority**: Non-negotiable. Prevents drift. Prevents endless iteration.

---

## Purpose

The product is NOT:
- A card
- An email
- A page
- A conversation
- A Westpoint campaign

The product IS:

**A self-improving B2B relationship-acceleration engine that discovers prospects, generates personalized experiences, tracks engagement, prioritizes leads, and continuously improves insight quality.**

Westpoint is a calibration target only.

**Never optimize for Westpoint.**

**Always optimize for the generator.**

---

## Core Invariant

Everything originates from ONE Insight Object.

Nothing may create a second narrative.

Nothing may introduce a different idea.

Everything is a different depth rendering of the same insight.

```
Discovery
    ↓
Truth Discovery
    ↓
Evidence Validation
    ↓
Relevance Selection
    ↓
Readiness Detection
    ↓
Insight Object
    ↓
Renderers (Card, Email, Page, Conversation)
```

**Renderers never think.**

**Renderers only express.**

---

## Renderer Responsibilities

**Card Renderer:**
Introduce the insight.

**Email Renderer:**
Explain why the insight matters.

**Page Renderer:**
Expand the insight.

**Conversation Renderer:**
Apply the insight.

**VIOLATION RULE**: If any renderer introduces a new narrative, it is wrong.

---

## Optimization Hierarchy

When making any design decision, optimize in this order:

1. **System Integrity** — Does it maintain coherence?
2. **Evidence Accuracy** — Is it supported by proof?
3. **Insight Quality** — Does it represent the strongest useful truth?
4. **Page Engagement Quality** — Does it drive meaningful interaction?
5. **Lead Prioritization Quality** — Does it identify ready prospects?
6. **Conversion** — Does it eventually sell?

**Never reverse this order.**

Persuasion without accuracy is manipulation.

Conversion without integrity is unsustainable.

---

## Learning Hierarchy

Authoritative learning signals (strongest to weakest):

1. **Conversion** — Prospect bought
2. **Conversation Start** — Prospect replied or called
3. **Return Visit** — Prospect came back
4. **CTA Interaction** — Prospect clicked on action
5. **Dwell Time** — Prospect spent time on page
6. **Scroll Depth** — Prospect engaged with content
7. **Page Visit** — Prospect saw the page
8. **Email Click** — Prospect clicked email link
9. **Email Open** — Prospect opened email

**RULE: Never optimize using a weaker signal if a stronger signal exists.**

Page behavior is more valuable than email behavior.

---

## Authority Constraint

The new system has NO authority.

The existing production system retains authority.

The new system may:
- ✅ Observe
- ✅ Score
- ✅ Compare
- ✅ Log
- ✅ Learn

The new system may NOT:
- ❌ Override
- ❌ Replace
- ❌ Influence production decisions

**Until statistical superiority is proven.**

**Observer first.**

**Authority later.**

---

## Safety Constraint

Never ask:

> "What is the most persuasive insight?"

Always ask:

> "What is the strongest insight supported by evidence?"

**Evidence precedes insight.**

**Insight precedes rendering.**

**Rendering precedes engagement.**

**Engagement precedes learning.**

**Learning precedes optimization.**

---

## Development Order

Always build in this order:

**Phase A: Instrumentation**
- Logging infrastructure
- Evidence provenance tracking
- Confidence storage
- Zero behavior change

**Phase B: Observer Engines**
- Evidence Validation Engine
- Insight Object
- Relevance Selection
- Readiness Detection
- Run in parallel, influence nothing

**Phase C: Insight Object Contract**
- Lock interface
- Stable for all renderers
- Cannot change after this phase

**Phase D: Page Renderer**
- Most valuable learning signal
- Highest engagement quality
- Build first, before card or email

**Phase E: Card Renderer**
- Validate continuity with page
- Same insight, different depth

**Phase F: Email Renderer**
- Modify existing RRTA generator
- Accept InsightObject input
- Maintain backward compatibility

**Phase G: Conversation Renderer**
- Build after page, card, email stable
- Apply insight to dialogue

**DO NOT REORDER WITHOUT EXPLICIT APPROVAL.**

---

## Drift Detection Rule

If a proposal focuses on:
- Better copy
- Stronger persuasion
- Westpoint specifically
- A single campaign
- A single page
- A single email

**STOP.**

Reframe the proposal as:

> "How does this improve the generator?"

**If it does not improve the generator, reject it.**

---

## Final Test

Before approving any design, implementation, or architecture decision:

Ask:

> "Does this make the generator better?"

Not:

> "Does this make Westpoint better?"

**DECISION TREE:**

```
Generator = YES
Westpoint = Incidental
    ↓
✅ CORRECT

Westpoint = YES
Generator = NO
    ↓
❌ WRONG

Both = YES
    ↓
✅ ACCEPTABLE
(but only if generator benefit is primary)

Both = NO
    ↓
❌ WRONG
```

---

## Enforcement

This Prime Directive is locked.

It may only be changed by explicit, written approval.

Every design decision, implementation step, and architectural choice must be measured against these principles.

If you find yourself optimizing for Westpoint instead of the generator, stop.

If you find yourself choosing persuasion over accuracy, stop.

If you find yourself introducing a second narrative, stop.

**The system is defined by this constraint, not despite it.**

Constraint enables scaling.

Without constraint, you optimize for one customer.

With constraint, you optimize for thousands.

---

## Measurement

The system is working when:

1. ✅ One Insight Object drives all four renderers
2. ✅ No narrative inconsistency across card → email → page → conversation
3. ✅ Page engagement outperforms email engagement
4. ✅ Return visit rate increases (audience retention)
5. ✅ Insight accuracy improves over time (learning loop works)
6. ✅ Conversion rate improves (output of accurate insights)
7. ✅ Generator scales to 1,000+ prospects with same quality

Measurement order: #1-5 before #6. #6 follows naturally from #1-5.

---

## When to Invoke This Directive

Anytime someone asks:
- "How can we make this email more persuasive?"
- "What if we tried a different angle for Westpoint?"
- "Can we test this card variation?"
- "Should we personalize the page more?"

Answer:
> "Does that improve the generator or just Westpoint?"

If just Westpoint: Reject.

If generator: Approve.

---

## Document Status

**LOCKED**

This is not a proposal.

This is not a suggestion.

This is the operating system of the product.

Everything built from here forward must respect this directive.

No exceptions.

No deviations.

No "just this once for Westpoint."

The moment you optimize for one customer, you stop building a generator.
