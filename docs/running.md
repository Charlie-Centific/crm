# Running the App

Everything needed to develop, test, and deploy VAI Sales Buddy.

---

## Prerequisites

- **Node.js 20+** (`node -v` to check)
- **npm 10+** (comes with Node)
- No external database, no Docker, no cloud credentials required for local development

---

## Quick Start

```bash
# Clone / navigate to the project
cd vai/

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQLite database is auto-created at `data/vai-crm.db` on first run.

---

## NPM Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start dev server on port 3000 with hot reload |
| `build` | `next build` | Production build (runs type checks + lint) |
| `start` | `next start` | Run production server (after `build`) |
| `lint` | `next lint` | ESLint check |
| `test` | `vitest run` | Run all unit tests once |
| `test:watch` | `vitest` | Run tests in watch mode |
| `test:coverage` | `vitest run --coverage` | Run tests with v8 coverage report |
| `db:push` | `drizzle-kit push` | Apply schema changes to the SQLite file |
| `db:studio` | `drizzle-kit studio` | Open Drizzle Studio at localhost:5173 |
| `db:migrate` | `drizzle-kit migrate` | Run migrations from `drizzle/migrations/` |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Optional | Enables AI-powered brief expansion via Claude API. Without it, brief generation works in template mode only. |

Create a `.env.local` file in the `vai/` root:

```
ANTHROPIC_API_KEY=sk-ant-...
```

This file is gitignored. Never commit API keys.

---

## Database Setup

### First Run

The database is auto-created at `data/vai-crm.db` when the dev server starts. The schema is applied via [src/db/client.ts](../src/db/client.ts) which runs a `CREATE TABLE IF NOT EXISTS` initialization on startup.

### Seeding Data

**From an Excel file** (recommended for initial setup):

```bash
node scripts/seed-from-excel.mjs \
  --file "data/raw/pipeline-export.xlsx" \
  --owner "Charlie Gonzalez"
```

**From CSV files** (via the UI):

1. Navigate to [/import](http://localhost:3000/import)
2. Upload `accounts.csv` → select "Account"
3. Upload `contacts.csv` → select "Contact"
4. Upload `opportunities.csv` → select "Opportunity"

Always import in that order: accounts → contacts → opportunities.

### Schema Changes

When modifying [src/db/schema.ts](../src/db/schema.ts):

```bash
# Development — push directly to the SQLite file
npm run db:push

# Production — generate a migration file then apply
npm run db:migrate
```

### Drizzle Studio

```bash
npm run db:studio
# → Opens http://localhost:5173
```

Visual table browser for inspecting and editing data. Useful for debugging import issues.

---

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-runs on file save)
npm run test:watch

# Coverage report
npm run test:coverage
# → HTML report at coverage/index.html
```

**Test files:** [src/lib/__tests__/](../src/lib/__tests__/)

| Test File | What It Tests |
|---|---|
| `utils.test.ts` | `formatCurrency`, `daysInStage`, `relativeTime`, label maps |
| `team.test.ts` | Team member config structure |
| `brief-template.test.ts` | Brief generation with mock CRM data |
| `demo-scripts.test.ts` | Demo script data structure + step counts |
| `playbook-data.test.ts` | Playbook loading + section parsing |

---

## Production Deployment (Vercel)

The app is configured for Vercel deployment.

### Steps

```bash
# 1. Install Vercel CLI (if needed)
npm install -g vercel

# 2. Link project
vercel link

# 3. Set environment variable
vercel env add ANTHROPIC_API_KEY

# 4. Deploy
vercel --prod
```

### Important: SQLite on Vercel

SQLite runs on the server. On Vercel's serverless functions, the filesystem is **read-only** in production. This means:

- The database must be either bundled at deploy time or use a writable volume
- For a persistent production database, consider switching to **Turso** (SQLite-compatible, edge-native) or **PlanetScale**/**Neon** (PostgreSQL)
- For a small internal tool with infrequent writes, deploying with the DB pre-seeded and using the import API is a viable short-term approach

The `next.config.ts` includes `serverExternalPackages: ["better-sqlite3"]` to prevent Next.js from bundling the native SQLite module.

### Vercel Configuration

```ts
// next.config.ts
const nextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  images: {
    unoptimized: false,
  },
}
```

---

## Local Development Tips

### Resetting the Database

```bash
rm data/vai-crm.db
npm run dev  # recreates empty database
```

Then re-seed from your export files.

### Adding a Team Member

1. Add to `scripts/seed-from-excel.mjs` seed data
2. Add to [src/lib/team.ts](../src/lib/team.ts) static config
3. Process avatar: `node scripts/process-avatars.mjs`
4. Re-run `npm run db:push` if schema changed

### Processing Avatar Images

```bash
# Place source image as public/avatars/{name}-source.jpg
node scripts/process-avatars.mjs
# Outputs: {name}-32.webp, {name}-64.webp, {name}-128.webp, {name}-256.webp
```

### Debugging Import Failures

1. Check the `/import` page for the error list
2. Open Drizzle Studio (`npm run db:studio`) to inspect raw rows
3. Check [src/lib/importer/columns.ts](../src/lib/importer/columns.ts) for the field variant that's not being matched
4. Add the missing variant to the column map

### Tailwind CSS IntelliSense

Install the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) VS Code extension for autocomplete on class names.

---

## Project Structure for New Developers

If you're new to this codebase, start with:

1. [docs/architecture.md](./architecture.md) — How everything fits together
2. [src/db/schema.ts](../src/db/schema.ts) — The data model
3. [src/app/(app)/pipeline/page.tsx](../src/app/(app)/pipeline/page.tsx) — A typical server page
4. [src/app/(app)/accounts/[id]/brief/brief-client.tsx](../src/app/(app)/accounts/[id]/brief/brief-client.tsx) — A typical client component
5. [PLAN.md](../PLAN.md) — What's been built and what's coming next
