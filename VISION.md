# VAI CRM — Product Vision

## Sales Motion

The platform is built around one specific arc:

**Direct/partner enables or conference → Discovery → Demo → Workshop → Pilot Start → Pilot Close**

Every phase below serves this arc.

---

## Phase 1 — CRM Command Center

**The data layer everything else depends on.**

- Sync Microsoft Dynamics for live opportunity data: account, vertical, stage, contacts
- Conference pipeline view tied directly to the conference plan
- Per-account cards AEs actually use day-to-day

Nothing in later phases works without this foundation.

---

## Phase 2 — Content & Demo Engine

**Where SEs and AEs get leverage.**

- Vertical-specific playbooks: transit, utilities, emergency services, smart city
- Demo scripts keyed to agent type
- Pre-call briefs auto-generated from Dynamics account data — so the SE isn't rebuilding context from scratch before every call

---

## Phase 3 — Workshop Builder

**The most differentiated piece.**

A structured session run with the prospect to:
1. Identify their top use cases
2. Rank and prioritize them
3. Generate a ROI model

The output maps directly to the **90-Day Value Report** format — the workshop becomes the seed of the conversion document.

---

## Phase 4 — RevOps Intelligence

**Makes the motion manageable at scale.**

- Pilot conversion tracking
- Pipeline health tied to the 90-day clock
- Forecast views for leadership

Supports running multiple conferences and cohorts simultaneously.

---

## Open Questions

Before going deeper on any phase, a few things that will shape how we build:

1. **Dynamics integration** — What does your current Dynamics setup look like? Are fields standardized across verticals, or is there inconsistency we need to account for in the sync layer? standard. what do you need to connect via api to dynamics ?

2. **Who are the primary users day-to-day?** — Is this mostly AE-driven with SE support, or do SEs own the platform and AEs consume outputs (briefs, ROI models)? not sure we are a small team, so we need everything in one place for everybody

3. **Conference cadence** — How many conferences are you running per quarter, and how many accounts per conference on average? This shapes the pipeline view and the cohort tracking in Phase 4. we are adding between 15-25 leads per month via partners, conferences, and direct cold calls

4. **Workshop format** — Is the workshop currently a structured internal process, an ad-hoc conversation, or something in between? Do you have an existing template or scoring rubric we should replicate digitally? we want to move from ad-hoc to something that has a clear structure with a focus on the outcome being: use cases identified and prioritized, owners identified and contact info added, ROI metrics, timeline, and pilot kickoff dates and hardware/cloud structure

5. **90-Day Value Report** — Who owns that document today — SE, AE, or shared? And is it currently generated manually from scratch, or pulled from existing materials? me. you and me baby. you and me.
