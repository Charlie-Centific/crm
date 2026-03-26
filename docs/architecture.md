# Architecture Overview

VAI Sales Buddy is a **Next.js 16 App Router** application built as an internal CRM tool for the Centific sales team selling the VAI™ platform. The system is designed for fast iteration with zero infrastructure overhead: SQLite on the server, no auth service, no external APIs required for core functionality.

---

## Stack at a Glance

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server components + API routes in one repo |
| Language | TypeScript 5 (strict) | Type safety across DB → API → UI |
| Database | SQLite via `better-sqlite3` | Zero infra, single-file DB, fast reads |
| ORM | Drizzle ORM | Type-safe queries, schema-as-code, migrations |
| Styling | Tailwind CSS 3.4 | Utility-first, brand token config |
| Testing | Vitest | Fast unit tests on lib logic |
| AI | `@anthropic-ai/sdk` | Optional — Claude integration for brief gen |

---

## Directory Layout

```
vai/
├── src/
│   ├── app/                      # Next.js pages + API routes
│   │   ├── (app)/                # Layout group: all app modules share the Nav
│   │   │   ├── accounts/
│   │   │   ├── pipeline/
│   │   │   ├── playbooks/
│   │   │   ├── demo-scripts/
│   │   │   ├── rfp/
│   │   │   ├── workshops/
│   │   │   ├── pilots/
│   │   │   └── import/
│   │   ├── api/                  # API route handlers
│   │   │   ├── accounts/
│   │   │   ├── pipeline/
│   │   │   └── import/
│   │   ├── page.tsx              # Landing page (hero + module grid)
│   │   └── layout.tsx            # Root layout
│   ├── components/               # Shared UI components
│   ├── db/                       # Schema + ORM client
│   ├── lib/                      # Business logic + utilities
│   │   └── importer/             # CSV/Excel import pipeline
│   └── content/                  # Markdown content (playbooks, agents)
├── data/
│   └── vai-crm.db               # SQLite database (auto-created)
├── public/
│   ├── avatars/                  # WebP avatar images
│   └── brand/                    # VAI brand assets
├── scripts/                      # One-off seeding + migration scripts
├── docs/                         # This documentation
├── PLAN.md                       # 4-phase feature roadmap
└── VISION.md                     # Product vision
```

---

## Request Lifecycle

### Server-Rendered Page (e.g., Pipeline)

```
Browser GET /pipeline
  ↓
Next.js App Router (server component)
  ↓
src/app/(app)/pipeline/page.tsx
  ↓
Direct DB call via Drizzle ORM (no HTTP round-trip)
  ↓
src/db/client.ts → SQLite (data/vai-crm.db)
  ↓
Server renders HTML (opportunities grouped by stage)
  ↓
Hydrates src/app/(app)/pipeline/pipeline-board.tsx (client component)
  ↓
User interacts: filter chips update URL → page re-renders server-side
```

### API Route (e.g., Move Card)

```
Client PATCH /api/pipeline  { id, stage }
  ↓
src/app/api/pipeline/route.ts
  ↓
Drizzle ORM update → SQLite
  ↓
Returns { ok: true }
  ↓
Client re-fetches or optimistically updates UI
```

### CSV Import

```
User selects file in /import
  ↓
POST /api/import (multipart/form-data: file, type)
  ↓
src/app/api/import/route.ts
  ↓
src/lib/importer/parse.ts → PapaParse
  ↓
src/lib/importer/columns.ts (field mapping + vertical/stage inference)
  ↓
src/lib/importer/import-{entity}.ts (upsert on dynamics_id)
  ↓
Writes to DB, returns { imported, skipped, errors }
  ↓
Import log entry written to import_log table
```

---

## Component Architecture

The app uses the **React Server Components (RSC)** pattern throughout:

- **Server components** (`page.tsx`) own data fetching — they query the DB directly using Drizzle and pass typed props to children.
- **Client components** (`*-client.tsx`, `*-board.tsx`) own interactivity — checkboxes, forms, filter state, clipboard actions.
- There is **no Redux or Zustand** — server re-renders on URL param changes handle most state.

### Component Ownership Map

```
src/app/(app)/layout.tsx           ← Nav wrapper (server)
  ├── src/components/nav.tsx        ← Navigation bar (server)
  │
  ├── /pipeline/page.tsx            ← Fetches opps from DB (server)
  │     └── pipeline-board.tsx      ← Kanban grid + cards (client)
  │
  ├── /accounts/page.tsx            ← Account list (server)
  │
  ├── /accounts/[id]/page.tsx       ← Account detail (server)
  │     └── brief/page.tsx          ← Brief fetcher (server)
  │           └── brief-client.tsx  ← Editor + save + copy (client)
  │
  ├── /playbooks/[vertical]/page.tsx          ← Markdown renderer (server)
  │     └── playbook-interactive.tsx          ← Filter/nav (client)
  │
  ├── /demo-scripts/[agent]/page.tsx          ← Script loader (server)
  │     └── demo-client.tsx                  ← Step checkboxes + timer (client)
  │
  └── /import/page.tsx             ← File upload UI (client)
```

---

## Data Flow Between Modules

```
Import System
  → Writes to: accounts, contacts, opportunities, import_log
  → Upserts on dynamics_id (idempotent)

Pipeline Board
  → Reads from: opportunities JOIN accounts
  → Writes to: opportunities (stage, next_action)
  → Links to: /accounts/[id]

Account Detail
  → Reads from: accounts, contacts, opportunities, activities, workshops, pre_call_briefs
  → Links to: /playbooks/[vertical], /accounts/[id]/brief

Brief Generator
  → Reads from: accounts, contacts, opportunities, activities
  → Uses: src/lib/brief-template.ts (vertical + stage aware)
  → Writes to: pre_call_briefs
  → Optional: Claude API (ANTHROPIC_API_KEY)

Playbooks
  → Reads from: src/content/playbooks/*.md (filesystem)
  → No DB writes

Demo Scripts
  → Reads from: src/lib/demo-scripts.ts (static data)
  → No DB reads or writes (session-only state)
```

---

## Key Design Decisions

### SQLite over PostgreSQL
SQLite runs as a single file next to the app. No managed database, no connection pools, no environment-specific credentials. `better-sqlite3` is synchronous and very fast for read-heavy workloads. WAL mode enabled for concurrent reads.

### No Authentication
This is an internal tool for 4 sales reps. Owner filtering (by team member) is sufficient for data organization without the overhead of an auth provider.

### Content as Code
Playbooks and demo scripts live in markdown files and TypeScript data files. This means:
- Easy editing via any text editor
- Version-controlled with the app
- No CMS latency

### Template-First Brief Generation
Pre-call briefs work with zero configuration — the template engine in [brief-template.ts](../src/lib/brief-template.ts) assembles structured markdown from CRM data. The `ANTHROPIC_API_KEY` only adds optional AI expansion; the core feature works without it.

### Idempotent Imports
All CSV importers upsert on `dynamics_id`. Re-importing the same export from Dynamics 365 is safe and will update changed records without creating duplicates.

---

## Phase Status

| Phase | Description | Status |
|---|---|---|
| 1 | CRM Command Center (data, pipeline, accounts, team) | Complete |
| 2 | Content & Demo Engine (playbooks, briefs, demo scripts) | Mostly complete |
| 3 | Workshop Builder (attendees, use cases, ROI, pilot plan) | Schema ready, UI stub |
| 4 | RevOps Intelligence (pilot tracking, value reports) | Schema ready, UI stub |

See [PLAN.md](../PLAN.md) for full task breakdown and [VISION.md](../VISION.md) for product context.
