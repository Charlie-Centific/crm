# VAI Sales Buddy

An internal CRM and sales enablement tool for the Centific sales team selling the **VAI™** (Vision AI) platform — real-time AI intelligence for cities, transit agencies, utilities, and emergency services.

Built with Next.js 16 + SQLite. No external database, no auth service, no infrastructure required. Just `npm install && npm run dev`.

---

## What's Inside

| Module | Route | Description |
|---|---|---|
| Pipeline | `/pipeline` | Kanban board across 8 deal stages, filtered by owner / vertical / source |
| Accounts | `/accounts` | Account list + full detail view (contacts, activities, opportunities) |
| Brief Generator | `/accounts/[id]/brief` | Pre-call brief auto-generated from CRM data |
| Playbooks | `/playbooks` | Vertical-specific discovery guides (transit, smart city, emergency) |
| Demo Scripts | `/demo-scripts` | Step-by-step VAI and SLiM demo walkthroughs |
| RFP Builder | `/rfp` | Response block library with SAM.gov source integration |
| Workshops | `/workshops` | Use case prioritization + ROI capture |
| Pilots | `/pilots` | 90-day pilot tracker |
| Workflows | `/workflows` | 29 AI/CV workflow library — diagrams, ROI, personas, data sources, RBAC matrix |
| Settings | `/settings` | Canonical role and persona registry; JSON export for the tech team |
| Import | `/import` | CSV/Excel import from Dynamics 365 |

---

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:3000
```

The SQLite database is created automatically at `data/vai-crm.db` on first run. See [docs/running.md](docs/running.md) for full setup instructions including seeding data.

**Optional:** Set `ANTHROPIC_API_KEY` in `.env.local` to enable AI-powered brief expansion. Without it, briefs generate in template mode.

---

## Documentation

| Doc | Description |
|---|---|
| [docs/architecture.md](docs/architecture.md) | System design, request lifecycle, data flow between modules |
| [docs/database.md](docs/database.md) | All 14 tables: columns, types, relationships, ER diagram |
| [docs/api.md](docs/api.md) | API routes: params, request/response shapes, error codes |
| [docs/components.md](docs/components.md) | Every UI component: props, features, data connections |
| [docs/import-system.md](docs/import-system.md) | CSV import pipeline: parsing, field mapping, upsert logic |
| [docs/content-engine.md](docs/content-engine.md) | Playbooks, demo scripts, brief template engine |
| [docs/running.md](docs/running.md) | Dev setup, env vars, testing, deployment, debugging tips |

For the feature roadmap and task status, see [PLAN.md](PLAN.md). For the product vision, see [VISION.md](VISION.md).

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 (strict) |
| Database | SQLite via `better-sqlite3` + Drizzle ORM |
| Styling | Tailwind CSS 3.4 + @tailwindcss/typography |
| Testing | Vitest |
| AI (optional) | Anthropic Claude SDK |

---

## Key Commands

```bash
npm run dev            # Start dev server
npm test               # Run unit tests
npm run test:coverage  # Coverage report
npm run db:studio      # Drizzle Studio (visual DB browser) → localhost:5173
npm run db:push        # Apply schema changes
npm run lint           # ESLint

# Seed from Excel export
node scripts/seed-from-excel.mjs --file "data/raw/file.xlsx" --owner "Jordan Ripoll"
```

---

## Project Status

| Phase | Description | Status |
|---|---|---|
| 1 | CRM Command Center — pipeline, accounts, import, team | Complete |
| 2 | Content Engine — playbooks, demo scripts, brief generator | Complete |
| 3 | Workflow Intelligence — 29 AI/CV workflows, personas, RBAC matrix, data sources | Complete |
| 4 | Settings & Exports — role/persona universe, JSON export for tech team | Complete |
| 5 | Workshop Builder + Pilot Tracker | Schema ready, UI in progress |

---

## Workflow Coverage

29 VAI™ workflows seeded in the database. 14 workflows have full data (ROI metrics, step-level diagrams, personas, data sources, RBAC matrix). 6 have swimlane `.webp` diagrams. See [`data/WORKFLOW_COVERAGE.md`](data/WORKFLOW_COVERAGE.md) for the full audit.

---

## Export

The Settings page includes an **Export JSON** button (`GET /api/export`) that produces a structured `vai-universe-<date>.json` containing all roles, personas, access levels, and workflows — ready to share with the engineering team.

```bash
curl http://localhost:3000/api/export > vai-universe.json
```
