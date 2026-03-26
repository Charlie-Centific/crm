# VAI CRM — Action Plan

## Key Decisions (locked)

| Question | Decision |
|---|---|
| Dynamics integration | No API — Excel export → CSV/Excel import. Re-import anytime. |
| Team model | Unified — everyone sees everything, filtered by owner |
| Lead volume | 15–25 leads/month (partners, conferences, direct) |
| Workshop output | Use cases + owners + ROI + timeline + pilot kickoff + hardware/cloud |
| 90-Day Value Report | AI-generated (Claude), human-reviewed, exported to PDF |
| Owner assignment | Tied to import file — `--owner "Name"` flag on seed script |

## Tech Stack (actual)

| Layer | Choice |
|---|---|
| Frontend | Next.js 16, App Router, TypeScript, Tailwind |
| Database | SQLite via better-sqlite3 + Drizzle ORM (`/data/vai-crm.db`, no server) |
| AI | Claude API (`claude-sonnet-4-6`) — briefs + 90-Day Report |
| Data import | CSV/Excel upload (`/import`) or `node scripts/seed-from-excel.mjs` |
| Avatars | WebP at 32/64/128/256px, served from `/public/avatars/` |
| Deployment | Vercel (only env var needed: `ANTHROPIC_API_KEY`) |

## Current data state
- **21 opportunities** — Charlie (15, $5.89M) + Jordan (6, $2.05M) = **$7.94M TCV**
- **16 accounts** across smart_city, emergency, transit verticals
- **4 team members** with real photos: Charlie Gonzalez, Cynthia Colbert, Michael Underwood, Jordan Ripoll

---

## Phase 1 — CRM Command Center ✅ COMPLETE (with scope change)

### Task 1.1 — Data Import System ✅
~~Dynamics 365 API sync~~ → replaced with Excel/CSV import (no IT credentials needed)

- [x] 1.1.1 SQLite DB with full schema — all 4 phases covered
- [x] 1.1.2 Column mapper with Dynamics export header variants
- [x] 1.1.3 Full import (accounts → contacts → opportunities, in order)
- [x] 1.1.4 Upsert on `dynamics_id` — re-imports are idempotent
- [x] 1.1.5 Import log per entity (file name, records found/imported/skipped)
- [x] 1.1.6 `/import` page — drag-and-drop CSV upload per entity type
- [x] 1.1.7 `seed-from-excel.mjs --file X --owner Y` for direct Excel seeding
- [x] 1.1.8 Vertical/stage/lead-source inference from Dynamics field values

---

### Task 1.2 — Pipeline Board ✅
- [x] 1.2.1 `lead_source` field on opportunities (conference/partner/direct/inbound)
- [x] 1.2.2 Kanban board: columns = stages, cards = accounts
- [x] 1.2.3 Source filter chips
- [x] 1.2.4 Vertical filter chips
- [x] 1.2.5 **Owner filter** (CG / CC / MU / JR) — bonus beyond original plan
- [x] 1.2.6 Days-in-stage badge (yellow ≥7d, red ≥14d)
- [x] 1.2.7 TCV subtotal per stage column
- [x] 1.2.8 Cards link to account detail
- [ ] 1.2.9 **Quick-action on card: update stage, add note** — not yet built

---

### Task 1.3 — Account Detail Cards ✅ (mostly)
- [x] 1.3.1 Account detail page layout
- [x] 1.3.2 Company info, vertical, owner, stage, value, close date
- [x] 1.3.3 Contact list with role, email, phone
- [x] 1.3.4 Activity feed (last 30 events, ordered by date)
- [x] 1.3.5 Owner avatar in header
- [x] 1.3.6 Links to workshop (Phase 3) and brief (Phase 2) — buttons present
- [ ] 1.3.7 **Inline next-action edit** — field in DB, no edit UI yet
- [ ] 1.3.8 **Inline note-taking** — field in DB, no edit UI yet

---

### Task 1.4 — Team & Owner System ✅ (new — not in original plan)
- [x] 1.4.1 `team_members` table with name, initials, color, slug
- [x] 1.4.2 `owner_name` on both accounts and opportunities
- [x] 1.4.3 `OwnerAvatar` component — real photo, initials fallback
- [x] 1.4.4 Avatar processing script: 4 people × 4 sizes = 16 WebP files
- [x] 1.4.5 Owner filter across pipeline and accounts views
- [x] 1.4.6 `--owner` flag on seed script for future imports

---

## Phase 2 — Content & Demo Engine 🔜 NEXT

### Content Library ✅ (new — built from PDF source docs)
- [x] `src/content/playbooks/smart-city.md` — discovery questions, demo scenarios, objections, proof points
- [x] `src/content/playbooks/transit.md` — VAI™ SLiM for Transit, 4 pilot focus areas, proven metrics
- [x] `src/content/playbooks/emergency.md` — Law enforcement + DA personas, pain points, capabilities
- [x] `src/content/agents/vai.md` — Full VAI platform profile, value shifts, engagement model
- [x] `src/content/agents/slim.md` — SLiM product profile, demo script, hardware, deployment model
- [x] `data/raw/` cleared — all source files processed and removed

---

### Task 2.3 — Pre-Call Brief Generator ✅ COMPLETE (template mode, no API key)

**Goal:** One click before any call → structured brief assembled from CRM data.

- [x] 2.3.1 `/accounts/[id]/brief` page
- [x] 2.3.2 Template engine: account snapshot, contacts, recent activity, stage-aware agenda, vertical-specific discovery questions
- [x] 2.3.3 No API key required — instant generation from CRM data
- [x] 2.3.4 Inline edit of generated brief (textarea toggle)
- [x] 2.3.5 Save brief to DB with timestamp + editedAt tracking
- [x] 2.3.6 Brief history on account detail page (last 5)
- [x] 2.3.7 "Copy prompt for Claude.ai" button — generates expanded prompt for manual AI use

**Sections generated:** Account Snapshot · Key Contacts · Recent Activity · Open Questions (vertical-aware) · Suggested Agenda (stage-aware)

---

### Task 2.1 — Vertical Playbooks

**Goal:** One-click access to the right pre-meeting playbook, auto-matched to the account's vertical.

- [ ] 2.1.1 Playbook schema: vertical, persona, pain points, capabilities, objections, suggested questions
- [ ] 2.1.2 Author content — 4 verticals: transit, utilities, emergency, smart city
- [ ] 2.1.3 Playbook viewer page (read-only, clean layout)
- [ ] 2.1.4 Auto-surface from account page based on vertical
- [ ] 2.1.5 Manual vertical override on account page

Content now available in `src/content/playbooks/`. Ready to build.

---

### Task 2.2 — Demo Scripts by Agent Type

**Goal:** Step-by-step demo scripts tied to the specific VAI agent being shown.

- [ ] 2.2.1 Inventory agent types (VAI, SLiM, others?)
- [ ] 2.2.2 Script schema: agent type, steps, talking points, expected questions
- [ ] 2.2.3 Author scripts per agent type
- [ ] 2.2.4 Script viewer with step-by-step navigation
- [ ] 2.2.5 Mark steps complete during live demo (session state, resets on reload)

Agent profiles now in `src/content/agents/`. VAI (platform) + SLiM (entry product). Ready to build.

---

## Phase 3 — Workshop Builder

**DB schemas built. UI is a stub. Start after Phase 2 is complete.**

### Task 3.1 — Workshop Session Setup
- [x] DB: `workshops`, `workshop_attendees` tables
- [ ] 3.1.1 `/workshops/new?accountId=X` form (date, facilitator, attendees)
- [ ] 3.1.2 Attendees pre-filled from account contacts, editable
- [ ] 3.1.3 Status lifecycle enforced: planned → in_progress → completed → report_generated

### Task 3.2 — Use Case Capture & Prioritization
- [x] DB: `use_cases` table with scoring fields
- [ ] 3.2.1 Use case entry form (keyboard-friendly for live session)
- [ ] 3.2.2 Impact / feasibility / alignment scores → composite score auto-calc
- [ ] 3.2.3 Ranked list with drag-and-drop reorder
- [ ] 3.2.4 Business + technical owner assignment inline

### Task 3.3 — ROI Model
- [x] DB: `roi_models` table
- [ ] 3.3.1 ROI form per use case: current state → target state → unit → annual value
- [ ] 3.3.2 Total value rollup across all use cases
- [ ] 3.3.3 Narrative field ("how we calculated this")

### Task 3.4 — Pilot Plan Capture
- [x] DB: `pilot_plans` table
- [ ] 3.4.1 Pilot plan form: kickoff date, success criteria, hardware/cloud notes
- [ ] 3.4.2 Auto-creates Phase 4 pilot tracker on save
- [ ] 3.4.3 90-day clock = kickoff date + 90 days

### Task 3.5 — 90-Day Value Report Generator
- [x] DB: `value_reports` table
- [ ] 3.5.1 Prompt template: all workshop data → Claude → structured report
- [ ] 3.5.2 Streaming into rich-text editor
- [ ] 3.5.3 Section-level regeneration (re-run AI on one section only)
- [ ] 3.5.4 PDF export (print-ready)
- [ ] 3.5.5 Versioned saves linked to account

---

## Phase 4 — RevOps Intelligence

**DB schemas built. UI is a stub. Start after Phase 3 is complete.**

### Task 4.1 — Pilot Conversion Tracker
- [x] DB: `pilots` table with milestone flags
- [ ] 4.1.1 `/pilots` page: list of active pilots with 90-day countdown
- [ ] 4.1.2 Milestone checklist per pilot
- [ ] 4.1.3 At-risk flag: <30 days remaining + stalled milestones
- [ ] 4.1.4 Convert / lost actions with revenue capture

### Task 4.2 — Pipeline Health Dashboard
- [ ] 4.2.1 Summary metrics: total TCV, opps by stage, stale deals
- [ ] 4.2.2 Stage funnel (count + value)
- [ ] 4.2.3 Source + vertical breakdowns
- [ ] 4.2.4 Owner performance side-by-side

### Task 4.3 — Forecast View
- [ ] 4.3.1 Stage-weighted probability model (configurable)
- [ ] 4.3.2 This quarter / next quarter / rolling 12 months
- [ ] 4.3.3 Conservative / base / optimistic scenario toggle
- [ ] 4.3.4 CSV export for leadership

---

## Build order

```
[DONE] 1.1 → 1.2 → 1.3 → 1.4
[NEXT] 2.3 → 2.1 → 2.2
       3.1 → 3.2 → 3.3 → 3.4 → 3.5
       4.1 → 4.2 + 4.3 (parallel)
```

---

## Open questions before we proceed

**For 2.3 (Pre-Call Brief):**
1. **Anthropic API key**: The key lets the app call Claude directly so briefs stream inside the app. Without it, we can build a "template mode" that auto-assembles the account data into a clean structured brief (no AI) — plus a "Copy prompt to Claude.ai" button as the AI path. Both modes work. Do you want to: (a) add the API key and get streaming AI, or (b) build template mode now + API upgrade later?

**Resolved:**
- ✅ Playbook content — extracted from PDFs into `src/content/playbooks/`
- ✅ Agent types — VAI (platform) + SLiM (entry product), profiled in `src/content/agents/`
