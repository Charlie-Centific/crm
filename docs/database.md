# Database

VAI Sales Buddy uses **SQLite** via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) with **Drizzle ORM** for type-safe queries. The database file lives at `data/vai-crm.db` and is auto-created on first run.

- Schema definition: [src/db/schema.ts](../src/db/schema.ts)
- ORM client + initialization: [src/db/client.ts](../src/db/client.ts)
- Drizzle config: [drizzle.config.ts](../drizzle.config.ts)

---

## Tables (14 total)

### Core CRM

#### `team_members`
The 4 Centific sales reps. Hardcoded via seed; also defined statically in [src/lib/team.ts](../src/lib/team.ts).

| Column | Type | Notes |
|---|---|---|
| id | text (UUID) | Primary key |
| name | text | Full name |
| initials | text | 2-letter initials |
| color | text | Tailwind color class |
| avatar_slug | text | Used to resolve `/public/avatars/{slug}-{size}.webp` |
| created_at | text | ISO 8601 |

Current members: Charlie Gonzalez (CG), Cynthia Colbert (CC), Michael Underwood (MU), Jordan Ripoll (JR).

---

#### `accounts`
Companies/organizations being tracked. Sourced from Dynamics 365 via CSV import or `seed-from-excel.mjs`.

| Column | Type | Notes |
|---|---|---|
| id | text (UUID) | Primary key |
| dynamics_id | text | Unique — used for upsert on re-import |
| name | text | Company name |
| vertical | text | `smart_city`, `transit`, `emergency`, `utilities` |
| city | text | |
| state | text | |
| employee_count | integer | |
| website | text | |
| owner_id | text | FK → team_members.id |
| created_at | text | |
| updated_at | text | |

**16 accounts** currently loaded. Vertical is inferred from account name during import if not explicitly mapped.

---

#### `contacts`
People at accounts. Linked to one account.

| Column | Type | Notes |
|---|---|---|
| id | text (UUID) | Primary key |
| dynamics_id | text | Unique — used for upsert |
| account_id | text | FK → accounts.id |
| first_name | text | |
| last_name | text | |
| role | text | Job title |
| email | text | |
| phone | text | |
| is_primary | integer | 0 or 1 — primary contact badge |
| created_at | text | |
| updated_at | text | |

---

#### `opportunities`
Deals/revenue. Each opportunity belongs to one account and one owner.

| Column | Type | Notes |
|---|---|---|
| id | text (UUID) | Primary key |
| dynamics_id | text | Unique — used for upsert |
| account_id | text | FK → accounts.id |
| owner_id | text | FK → team_members.id |
| name | text | Deal name |
| stage | text | See stage values below |
| value | real | Deal value in USD |
| close_date | text | ISO date |
| lead_source | text | `conference`, `partner`, `direct`, `inbound` |
| vertical | text | Redundant with account but allows direct filtering |
| next_action | text | Free text — what's the next step |
| stage_changed_at | text | Used to compute days-in-stage |
| created_at | text | |
| updated_at | text | |

**Stage values** (ordered):
`lead` → `discovery` → `demo` → `workshop` → `pilot_start` → `pilot_close` → `closed_won` → `closed_lost`

**21 opportunities** currently loaded. Total TCV: $7.94M.

---

#### `activities`
Notes, emails, calls, and meetings. Attached to an account (and optionally an opportunity or contact).

| Column | Type | Notes |
|---|---|---|
| id | text (UUID) | Primary key |
| account_id | text | FK → accounts.id |
| opportunity_id | text | FK → opportunities.id (nullable) |
| contact_id | text | FK → contacts.id (nullable) |
| owner_id | text | FK → team_members.id (nullable) |
| type | text | `note`, `email`, `call`, `meeting` |
| subject | text | |
| body | text | |
| occurred_at | text | ISO 8601 |
| created_at | text | |

Account detail pages show the last 30 activities sorted by `occurred_at`.

---

#### `import_log`
Tracks every CSV import run for auditing.

| Column | Type | Notes |
|---|---|---|
| id | text (UUID) | Primary key |
| entity_type | text | `account`, `contact`, `opportunity` |
| records_found | integer | Total rows in CSV |
| imported | integer | New records created |
| skipped | integer | Existing records (already had dynamics_id) |
| errors | integer | Parse/validation failures |
| source_file | text | Original filename |
| imported_at | text | ISO 8601 |

---

### Workshop & Pilot

#### `workshops`
A workshop is a structured discovery session tied to an account and optionally an opportunity.

| Column | Type | Notes |
|---|---|---|
| id | text (UUID) | Primary key |
| account_id | text | FK → accounts.id |
| opportunity_id | text | FK → opportunities.id (nullable) |
| status | text | `planned`, `in_progress`, `completed`, `report_generated` |
| scheduled_at | text | |
| completed_at | text | |
| notes | text | |
| created_at | text | |
| updated_at | text | |

---

#### `workshop_attendees`
People who attended a workshop.

| Column | Type | Notes |
|---|---|---|
| id | text (UUID) | Primary key |
| workshop_id | text | FK → workshops.id |
| name | text | |
| role | text | |
| email | text | |
| is_prospect | integer | 0 = Centific staff, 1 = prospect attendee |

---

#### `use_cases`
Prioritized use cases captured during a workshop.

| Column | Type | Notes |
|---|---|---|
| id | text (UUID) | Primary key |
| workshop_id | text | FK → workshops.id |
| title | text | |
| description | text | |
| agent_type | text | `vai`, `slim`, `both` |
| impact_score | integer | 1–5 — business impact |
| feasibility_score | integer | 1–5 — technical feasibility |
| alignment_score | integer | 1–5 — strategic alignment |
| rank | integer | Final priority rank |

---

#### `roi_models`
ROI estimates per use case.

| Column | Type | Notes |
|---|---|---|
| id | text (UUID) | Primary key |
| use_case_id | text | FK → use_cases.id |
| current_state_metric | text | Baseline KPI description |
| target_state_metric | text | Expected outcome |
| estimated_annual_value | real | USD |
| notes | text | |

---

#### `pilot_plans`
Technical deployment details for a pilot.

| Column | Type | Notes |
|---|---|---|
| id | text (UUID) | Primary key |
| workshop_id | text | FK → workshops.id |
| kickoff_date | text | |
| success_criteria | text | What "success" looks like |
| hardware_notes | text | Camera/sensor requirements |
| cloud_notes | text | Cloud/VMS integration details |
| stakeholders | text | Key contacts for pilot |

---

#### `pilots`
Live pilot tracking. Created when a pilot_plan is activated.

| Column | Type | Notes |
|---|---|---|
| id | text (UUID) | Primary key |
| account_id | text | FK → accounts.id |
| opportunity_id | text | FK → opportunities.id |
| pilot_plan_id | text | FK → pilot_plans.id (nullable) |
| status | text | `active`, `at_risk`, `converted`, `lost` |
| started_at | text | |
| ends_at | text | 90 days from started_at |
| kickoff_done | integer | Milestone flag (0/1) |
| training_done | integer | Milestone flag |
| mid_review_done | integer | Milestone flag |
| exec_review_done | integer | Milestone flag |
| closed_revenue | real | Final ACV on conversion |
| notes | text | |

---

### Content

#### `pre_call_briefs`
Stores generated and edited pre-call briefs per account.

| Column | Type | Notes |
|---|---|---|
| id | text (UUID) | Primary key |
| account_id | text | FK → accounts.id |
| content | text | Markdown brief content |
| generated_at | text | ISO 8601 |
| edited_at | text | ISO 8601 (nullable) |

Account detail shows last 5 briefs. Brief page shows latest.

---

#### `value_reports`
90-day value reports generated after a pilot or workshop.

| Column | Type | Notes |
|---|---|---|
| id | text (UUID) | Primary key |
| workshop_id | text | FK → workshops.id |
| version | integer | Increment on re-generation |
| content | text | Markdown report content |
| generated_at | text | |

---

## Entity Relationship Diagram

```
team_members
  ├── accounts (owner_id)
  │     ├── contacts (account_id)
  │     ├── opportunities (account_id, owner_id)
  │     │     └── activities (opportunity_id)
  │     ├── activities (account_id)
  │     ├── workshops (account_id)
  │     │     ├── workshop_attendees (workshop_id)
  │     │     ├── use_cases (workshop_id)
  │     │     │     └── roi_models (use_case_id)
  │     │     ├── pilot_plans (workshop_id)
  │     │     │     └── pilots (pilot_plan_id)
  │     │     └── value_reports (workshop_id)
  │     └── pre_call_briefs (account_id)
  └── opportunities (owner_id)
```

---

## ORM Usage

Drizzle is used for all reads and writes. No raw SQL except in [client.ts](../src/db/client.ts) for initialization (WAL pragma, etc.).

```ts
// Example: fetch account with contacts and active opportunity
const account = await db.query.accounts.findFirst({
  where: eq(accounts.id, id),
  with: {
    contacts: { orderBy: [desc(contacts.is_primary)] },
    opportunities: { orderBy: [desc(opportunities.updated_at)], limit: 1 },
    owner: true,
  },
})
```

---

## Managing the Database

```bash
# Push schema changes (development)
npm run db:push

# Open Drizzle Studio (visual table browser)
npm run db:studio   # → http://localhost:5173

# Run migrations (production-style)
npm run db:migrate

# Seed from Excel export
node scripts/seed-from-excel.mjs --file "data/raw/file.xlsx" --owner "Jordan Ripoll"
```

The database file (`data/vai-crm.db`) is in `.gitignore`. Each developer maintains their own local copy. Production state should be seeded from a fresh Dynamics export.
