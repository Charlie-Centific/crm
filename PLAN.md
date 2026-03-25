# VAI CRM — Action Plan

## Key Decisions from Discovery

| Question | Answer |
|---|---|
| Dynamics setup | Standard fields, API connection needed |
| Team model | Unified — everyone uses everything |
| Lead volume | 15–25 leads/month (partners, conferences, cold) |
| Workshop maturity | Moving from ad-hoc → structured |
| Workshop output | Use cases + owners + ROI + timeline + pilot kickoff + hardware/cloud |
| 90-Day Value Report | AI-generated (Claude), human-reviewed |

## Dynamics 365 API — What We Need to Connect

To connect to Dynamics 365 via API you need:

| Credential | Where to find it |
|---|---|
| **Tenant ID** | Azure Portal → Azure Active Directory → Overview |
| **Client ID** | Azure Portal → App Registrations → your app → Application (client) ID |
| **Client Secret** | Azure Portal → App Registrations → your app → Certificates & secrets |
| **Org URL** | Dynamics 365 → Settings → Customizations → Developer Resources (e.g. `https://yourorg.crm.dynamics.com`) |

Endpoint base: `https://{org}.crm.dynamics.com/api/data/v9.2/`
Auth: OAuth 2.0 client credentials flow via `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js (App Router) | Fast, full-stack, good for data-heavy views |
| Backend | Next.js API Routes + Node | Keeps the stack unified |
| Database | PostgreSQL (via Supabase) | Relational, good for pipeline/cohort modeling |
| AI | Claude API (claude-sonnet-4-6) | Pre-call briefs, workshop summaries, 90-Day Report |
| Auth | Supabase Auth | Simple, built-in |
| Dynamics Sync | Scheduled job (cron) + webhook fallback | Real-time where possible |
| Deployment | Vercel | Zero-config for Next.js |

---

## Phase 1 — CRM Command Center

### Task 1.1 — Dynamics 365 Integration

**Goal:** Live sync of Dynamics data into local DB so all other features have a reliable data source.

#### Subtasks
- [ ] 1.1.1 Register Azure AD app, configure API permissions (`Dynamics CRM → user_impersonation`)
- [ ] 1.1.2 Implement OAuth 2.0 client credentials token fetch and refresh
- [ ] 1.1.3 Define DB schema: `accounts`, `opportunities`, `contacts`, `leads`
- [ ] 1.1.4 Write Dynamics fetch jobs for each entity (OData queries)
- [ ] 1.1.5 Map Dynamics fields → local schema (vertical, stage, owner, value, close date)
- [ ] 1.1.6 Implement full sync (initial load) and delta sync (modified since last run)
- [ ] 1.1.7 Schedule sync job (every 15 min via cron)
- [ ] 1.1.8 Error handling: retry logic, dead-letter queue, sync status log

#### Acceptance Criteria
- All accounts/opps/contacts visible in Dynamics appear in local DB within 15 minutes
- Field mapping is lossless for: account name, vertical, stage, close date, opp value, primary contact, contact email/phone
- Sync failures are logged with error reason and do not crash the app
- Delta sync only fetches records modified since last successful sync

#### Tests
- Unit: token fetch returns valid bearer token; expired token triggers refresh
- Unit: field mapper correctly transforms each Dynamics entity type
- Integration: full sync populates DB from a Dynamics sandbox with known fixture data
- Integration: delta sync only upserts changed records (verify with record count + timestamps)
- Integration: sync job recovers from a simulated 401 and 429 (rate limit)
- E2E: create a new opp in Dynamics, wait 15 min, verify it appears in the app

---

### Task 1.2 — Conference Pipeline View

**Goal:** A single view that shows all active leads grouped by source (conference, partner, direct) with stage and next action visible at a glance.

#### Subtasks
- [ ] 1.2.1 Design DB model for `lead_source` (conference name, partner name, campaign) linked to `opportunities`
- [ ] 1.2.2 Build pipeline board UI: columns = sales stages, cards = accounts
- [ ] 1.2.3 Add source filter: view by conference / partner / direct
- [ ] 1.2.4 Add vertical filter: transit / utilities / emergency / smart city
- [ ] 1.2.5 Add "days in stage" indicator and visual warning at thresholds (e.g. >14 days)
- [ ] 1.2.6 Add quick-action on card: update stage, add note, schedule follow-up
- [ ] 1.2.7 Link each card to the full account view (Task 1.3)

#### Acceptance Criteria
- All 15–25 monthly leads are visible and correctly grouped by source
- Stage columns reflect live Dynamics data (no manual entry required)
- "Days in stage" is accurate and visually flags stale deals
- Filters are combinable (e.g. transit + conference)
- Stage update from the board writes back to Dynamics

#### Tests
- Unit: stage grouping logic handles all defined stages and unknown stages gracefully
- Unit: "days in stage" calculation is correct across month boundaries
- Component: pipeline board renders with 0 leads, 1 lead, and 25 leads
- Component: filter combinations show correct subsets
- Integration: stage update from board triggers Dynamics write and reflects on next sync
- E2E: new lead added in Dynamics appears in correct column within 15 min

---

### Task 1.3 — Per-Account Cards

**Goal:** A single account view that gives anyone on the team full context without opening Dynamics.

#### Subtasks
- [ ] 1.3.1 Design account detail page layout
- [ ] 1.3.2 Pull and display: company info, vertical, current stage, opp value, close date
- [ ] 1.3.3 Display contact list with role, email, phone, LinkedIn (if available in Dynamics)
- [ ] 1.3.4 Activity feed: notes, emails, stage changes (synced from Dynamics)
- [ ] 1.3.5 "Next action" field — free text, owned by whoever is running the deal
- [ ] 1.3.6 Link to pre-call brief (Phase 2), workshop (Phase 3), and pilot tracker (Phase 4)
- [ ] 1.3.7 Inline note-taking that syncs note back to Dynamics

#### Acceptance Criteria
- All synced accounts have a populated detail page with no missing required fields
- Contact list shows at least primary contact with email
- Activity feed is ordered chronologically and shows last 90 days by default
- Notes written in the app appear in Dynamics within 1 sync cycle
- Links to Phase 2/3/4 artifacts are present (even if those features aren't built yet — show placeholder)

#### Tests
- Unit: account page renders correctly with partial data (missing contacts, missing close date)
- Component: activity feed handles 0 events, 1 event, and 50+ events
- Integration: note saved in app appears in Dynamics on next sync
- E2E: navigate from pipeline board card → account detail page → verify all fields populated

---

## Phase 2 — Content & Demo Engine

### Task 2.1 — Vertical Playbooks

**Goal:** One-click access to the right playbook for any meeting, keyed to the account's vertical.

#### Subtasks
- [ ] 2.1.1 Define playbook schema: vertical, target persona, pain points, key capabilities, common objections, suggested questions
- [ ] 2.1.2 Author content for all 4 verticals: transit, utilities, emergency services, smart city
- [ ] 2.1.3 Build playbook viewer (read-only, clean layout for pre-meeting use)
- [ ] 2.1.4 Auto-surface correct playbook from account detail page based on vertical field
- [ ] 2.1.5 Allow manual override (e.g. account spans two verticals)
- [ ] 2.1.6 Version control for playbook content (track edits, allow rollback)

#### Acceptance Criteria
- All 4 vertical playbooks authored and accessible
- Correct playbook surfaces automatically from any account page
- Content is readable on a laptop screen without horizontal scrolling
- Edits to playbook content are versioned with timestamp and author

#### Tests
- Unit: vertical-to-playbook mapping returns correct playbook for all 4 verticals and handles unknown vertical
- Component: playbook viewer renders all sections correctly
- Component: manual override persists across page reload
- Integration: updating playbook content creates a new version entry in DB

---

### Task 2.2 — Demo Scripts by Agent Type

**Goal:** Scripts tied to the specific AI agent being demoed, not generic product walkthroughs.

#### Subtasks
- [ ] 2.2.1 Inventory all agent types in the current product
- [ ] 2.2.2 Define script schema: agent type, demo flow steps, key talking points, expected questions, handoff to next step
- [ ] 2.2.3 Author scripts for each agent type
- [ ] 2.2.4 Link scripts to vertical playbooks (transit playbook → transit-relevant agent scripts)
- [ ] 2.2.5 Build script viewer with step-by-step navigation
- [ ] 2.2.6 Allow AE/SE to mark steps complete during a live demo (session state, not persisted)

#### Acceptance Criteria
- Each agent type has a complete script
- Scripts are linked to at least one vertical
- Step-by-step navigation works without page reload
- Live demo progress state resets on page reload (intentional — not a session tracker)

#### Tests
- Unit: script-to-vertical link returns correct scripts for each vertical
- Component: step navigation correctly advances, goes back, and shows completion state
- Component: page reload resets all step checkmarks

---

### Task 2.3 — Pre-Call Brief Generator

**Goal:** One-click AI-generated brief before any call, pulling live account data from Dynamics so no manual prep is needed.

#### Subtasks
- [ ] 2.3.1 Design brief schema: account snapshot, contacts attending, current stage, last activity, key open questions, suggested agenda, relevant playbook excerpts
- [ ] 2.3.2 Build prompt template that pulls live account data and injects into Claude API call
- [ ] 2.3.3 Add "Generate Brief" button to account detail page
- [ ] 2.3.4 Stream Claude response into brief view (don't make user wait for full generation)
- [ ] 2.3.5 Allow user to edit generated brief inline before use
- [ ] 2.3.6 Save finalized brief to account record with timestamp
- [ ] 2.3.7 Show brief history on account page (last 5 briefs)

#### Acceptance Criteria
- Brief generates in under 15 seconds for any account with complete Dynamics data
- Brief includes: account name, vertical, stage, contacts, last activity, open questions, suggested agenda
- Streaming works — text appears progressively, not all at once
- Edited and saved briefs are persisted and visible in history
- Brief generation fails gracefully if Claude API is unavailable (show error, don't crash)

#### Tests
- Unit: prompt builder correctly injects all account fields; handles missing fields with fallback text
- Unit: Claude API error returns structured error response
- Component: streaming UI renders progressive text without layout shifts
- Component: inline edit mode activates, saves, and returns to read mode correctly
- Integration: generated brief is saved to DB and appears in brief history
- E2E: open account with full Dynamics data → generate brief → verify all expected sections present

---

## Phase 3 — Workshop Builder

### Task 3.1 — Workshop Session Setup

**Goal:** Create a structured workshop record tied to an account, capturing all session logistics before it starts.

#### Subtasks
- [ ] 3.1.1 DB schema: `workshops` linked to `accounts` — fields: date, attendees, facilitator, status
- [ ] 3.1.2 "New Workshop" flow from account detail page
- [ ] 3.1.3 Attendee entry: name, role, email (pre-populated from Dynamics contacts, editable)
- [ ] 3.1.4 Workshop status lifecycle: `planned → in_progress → completed → report_generated`

#### Acceptance Criteria
- Workshop can be created from any account page
- Attendees pre-populated from Dynamics contacts with ability to add/remove
- Status transitions are enforced (can't mark complete without use cases entered)

#### Tests
- Unit: status transition rules enforced; invalid transitions return error
- Component: attendee list pre-populates from account contacts
- Integration: new workshop record linked correctly to account in DB

---

### Task 3.2 — Use Case Identification & Prioritization

**Goal:** Structured capture of use cases during the workshop session, with scoring to produce a ranked list.

#### Subtasks
- [ ] 3.2.1 Define use case schema: name, description, vertical category, business owner (name + email), technical owner (name + email), priority score, status
- [ ] 3.2.2 Build use case entry UI — fast, keyboard-friendly for live workshop use
- [ ] 3.2.3 Scoring rubric: impact (1–5), feasibility (1–5), strategic alignment (1–5) → auto-calculates composite score
- [ ] 3.2.4 Drag-and-drop reorder for manual override of score-based ranking
- [ ] 3.2.5 Owner assignment with contact info capture inline
- [ ] 3.2.6 Link use cases to specific agent types (from Phase 2 inventory)

#### Acceptance Criteria
- Minimum 1 use case required to advance workshop to next step
- Scoring calculates and ranks in real time as scores are entered
- Owner fields (name + email) are required before a use case can be marked final
- Manual reorder overrides score rank and is persisted
- Each use case linked to at least one agent type

#### Tests
- Unit: composite score formula is correct across all input combinations
- Unit: rank order updates correctly when scores change
- Component: drag-and-drop reorder persists after page reload
- Component: missing owner fields block "finalize" action with clear error
- Integration: use cases saved to DB with correct workshop association

---

### Task 3.3 — ROI Model

**Goal:** Structured ROI capture tied to each prioritized use case, producing inputs for the 90-Day Value Report.

#### Subtasks
- [ ] 3.3.1 Define ROI schema per use case: current state metric, target state metric, unit (hours saved / incidents reduced / cost avoided), time to value, confidence level
- [ ] 3.3.2 Build ROI entry form, one per use case, linked to workshop
- [ ] 3.3.3 Auto-calculate total estimated value across all use cases
- [ ] 3.3.4 Allow narrative field: "how we calculated this" — freeform text
- [ ] 3.3.5 Flag use cases with incomplete ROI as warnings (not blockers — can still proceed)

#### Acceptance Criteria
- ROI form appears for each finalized use case
- Total value calculation is correct and updates live
- Narrative field accepts plain text, minimum 1 sentence required
- Incomplete ROI shows warning but does not block report generation

#### Tests
- Unit: total value calculation is correct with 1, 5, and 10 use cases
- Unit: use case with missing ROI fields returns correct warning flags
- Component: ROI form renders correctly for each use case type
- Integration: ROI data persists to DB and is retrievable per workshop

---

### Task 3.4 — Pilot Plan Capture

**Goal:** Capture the specific pilot structure agreed in the workshop — the bridge between workshop and the 90-Day clock.

#### Subtasks
- [ ] 3.4.1 Pilot plan schema: kickoff date, go-live target, success criteria, hardware requirements, cloud infrastructure notes, pilot contacts
- [ ] 3.4.2 Build pilot plan form within workshop flow (final step before report generation)
- [ ] 3.4.3 Link pilot plan to Phase 4 pilot tracker on creation
- [ ] 3.4.4 Kickoff date field triggers 90-day clock in Phase 4 automatically

#### Acceptance Criteria
- Kickoff date and at least one success criterion required to complete workshop
- Hardware and cloud fields are free text (no dropdown — too variable)
- Saving pilot plan automatically creates a Phase 4 pilot tracker record
- 90-day clock start date = kickoff date

#### Tests
- Unit: 90-day clock calculates correct target close date from any kickoff date (including month/year boundaries)
- Integration: saving pilot plan creates linked pilot tracker record in DB
- E2E: complete workshop flow end-to-end, verify pilot tracker appears in Phase 4

---

### Task 3.5 — 90-Day Value Report Generator

**Goal:** AI-generated report that consolidates workshop outputs into a structured document ready for the prospect.

#### Subtasks
- [ ] 3.5.1 Define report sections: executive summary, use case table (ranked), ROI summary, pilot plan, next steps
- [ ] 3.5.2 Build prompt template that pulls all workshop data (use cases, ROI, pilot plan, attendees) and generates full report via Claude API
- [ ] 3.5.3 Stream report into editor view
- [ ] 3.5.4 Full rich-text editing of generated report inline
- [ ] 3.5.5 Export to PDF (print-ready)
- [ ] 3.5.6 Save versioned copies to account record
- [ ] 3.5.7 "Regenerate section" — re-run AI on a single section without blowing away edits elsewhere

#### Acceptance Criteria
- Report generates from complete workshop data in under 30 seconds
- All 5 sections present in every generated report
- PDF export is clean: no broken layouts, no truncated text
- Each saved version is timestamped and linked to the workshop that generated it
- Section regeneration only overwrites the targeted section

#### Tests
- Unit: prompt builder includes all workshop fields; missing fields degrade gracefully with placeholder text
- Unit: section regeneration prompt is scoped to correct section
- Component: rich-text editor handles generated markdown correctly
- Component: PDF export produces valid PDF (check file size > 0, page count ≥ 1)
- Integration: saved report versions appear in account history in correct order
- E2E: complete workshop → generate report → edit → export PDF → verify content matches edits

---

## Phase 4 — RevOps Intelligence

### Task 4.1 — Pilot Conversion Tracker

**Goal:** Track every active pilot against its 90-day clock and surface conversion risk early.

#### Subtasks
- [ ] 4.1.1 Pilot tracker schema: account, kickoff date, target close date, status (active/at-risk/converted/lost), milestone checklist, owner
- [ ] 4.1.2 Milestone checklist: kickoff call done, first use case live, mid-point check-in, success criteria reviewed, close conversation started
- [ ] 4.1.3 Auto-calculate days remaining and % of 90-day window consumed
- [ ] 4.1.4 At-risk flag: auto-set if <30 days remain and no milestones completed past "kickoff call done"
- [ ] 4.1.5 Conversion/lost actions: log outcome, revenue, reason (won) or loss reason (lost)
- [ ] 4.1.6 Link back to workshop and 90-Day Value Report for context

#### Acceptance Criteria
- Every pilot has a visible countdown and milestone progress
- At-risk flag triggers automatically based on rule, no manual entry needed
- Converted pilots log revenue and move to closed pipeline
- Lost pilots capture reason and move to churned view
- Tracker links to workshop and report are always present

#### Tests
- Unit: at-risk rule fires correctly at exactly 30 days remaining with correct milestone state
- Unit: days remaining and % consumed calculate correctly
- Component: milestone checklist updates and persists correctly
- Integration: pilot created from workshop (Task 3.4) has correct kickoff date and 90-day target
- E2E: advance pilot through all milestones → mark converted → verify revenue logged and pipeline updated

---

### Task 4.2 — Pipeline Health Dashboard

**Goal:** Single-screen view of all active opportunities, their stage, source, and health — for anyone on the team.

#### Subtasks
- [ ] 4.2.1 Summary metrics: total pipeline value, leads this month, demos scheduled, workshops completed, pilots active
- [ ] 4.2.2 Stage funnel chart: count and value at each stage
- [ ] 4.2.3 Source breakdown: conference vs partner vs direct (by count and value)
- [ ] 4.2.4 Vertical breakdown: pipeline by transit / utilities / emergency / smart city
- [ ] 4.2.5 Stale deal alerts: list of deals with no activity in 14+ days
- [ ] 4.2.6 All metrics pull from live DB (not cached), refresh on page load

#### Acceptance Criteria
- Dashboard loads in under 3 seconds with up to 200 active opportunities
- All 5 summary metrics are accurate against DB state
- Stale deal list is accurate to within 1 sync cycle
- Funnel chart reflects correct counts at each stage
- Clicking any chart segment navigates to filtered pipeline view (Task 1.2)

#### Tests
- Unit: summary metric queries return correct values against known fixture data
- Unit: stale deal query correctly identifies deals with no activity in 14+ days
- Component: funnel chart renders correctly with 0, 1, and 20+ opportunities
- Component: clicking chart segment triggers correct filter navigation
- Performance: dashboard query completes in under 500ms with 200 opportunities in DB

---

### Task 4.3 — Forecast View

**Goal:** Leadership view of expected revenue by quarter, based on pipeline stage and pilot conversion probability.

#### Subtasks
- [ ] 4.3.1 Define forecast model: stage-based probability (e.g. pilot = 60%, close started = 80%)
- [ ] 4.3.2 Weighted pipeline value = opp value × stage probability
- [ ] 4.3.3 Forecast table: this quarter, next quarter, rolling 12 months — by count and weighted value
- [ ] 4.3.4 Scenario toggle: conservative (stage prob −10%) / base / optimistic (+10%)
- [ ] 4.3.5 Export to CSV for leadership reporting

#### Acceptance Criteria
- Forecast table shows 3 time horizons with count and weighted value
- Stage probabilities are configurable (not hardcoded)
- Scenario toggle updates all values in real time
- CSV export includes all rows and columns visible in the table

#### Tests
- Unit: weighted value calculation is correct for each stage probability
- Unit: scenario adjustment applies correct delta to all stage probabilities
- Component: scenario toggle updates all displayed values without page reload
- Integration: stage probabilities loaded from DB (not hardcoded); updating them changes forecast values
- Integration: CSV export contains correct data matching on-screen table

---

## Development Automation Notes

Each task is designed to be handed to an AI coding agent as a discrete unit. For each task:

1. **Input:** subtask list + acceptance criteria + DB schema changes required
2. **Output:** working code + passing tests
3. **Gate:** all acceptance criteria verified before moving to next task

Recommended execution order:
```
1.1 → 1.2 → 1.3 → 2.3 → 2.1 → 2.2 → 3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 4.1 → 4.2 → 4.3
```

Tasks 2.1 and 2.2 can be parallelized with 2.3 after 1.3 is complete.
Tasks 4.2 and 4.3 can be parallelized after 4.1 is complete.
