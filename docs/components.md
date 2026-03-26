# UI Components

This document covers every significant UI component: what it renders, what props it takes, and how it connects to data and other components.

The app uses the **React Server Components** pattern throughout. Server components handle data fetching; client components handle interactivity.

---

## Shared Components

### `Nav` — Navigation Bar
**File:** [src/components/nav.tsx](../src/components/nav.tsx)

Top sticky navigation bar rendered by the `(app)` layout. Contains:
- VAI Buddy logo + wordmark
- Links to all 8 app modules: Pipeline, Accounts, Playbooks, Demo, RFP, Workshops, Pilots, Import
- Active link highlighting (uses `usePathname` from Next.js)

**Type:** Client component (needs `usePathname`)
**Used by:** [src/app/(app)/layout.tsx](../src/app/(app)/layout.tsx)

---

### `OwnerAvatar` — Team Member Avatar
**File:** [src/components/owner-avatar.tsx](../src/components/owner-avatar.tsx)

Renders a team member avatar. Tries to load `/{slug}-{size}.webp` from `/public/avatars/`; falls back to a colored circle with initials if the image fails or `avatar_slug` is null.

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `owner` | `TeamMember` | required | Team member object from DB or static config |
| `size` | `32 \| 64 \| 128 \| 256` | `32` | Pixel size — must match available WebP sizes |
| `className` | `string` | `""` | Additional Tailwind classes |

**Avatar files:** `public/avatars/{slug}-{size}.webp` (4 sizes per person)

---

## Pipeline Components

### `PipelineBoard` — Kanban Grid
**File:** [src/app/(app)/pipeline/pipeline-board.tsx](../src/app/(app)/pipeline/pipeline-board.tsx)

Client component that renders the full Kanban board. Receives pre-fetched, pre-grouped opportunities from the server page.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `grouped` | `Record<Stage, Opportunity[]>` | Opportunities grouped by stage |

**Features:**
- One column per stage (lead → closed_lost)
- Per-column TCV subtotal displayed in column header
- Each card shows: account name, deal name, value, days-in-stage badge, owner avatar
- Days-in-stage badge: yellow if ≥7 days, red if ≥14 days
- Cards link to `/accounts/[id]`
- Drag-and-drop is not implemented — stage changes happen via the account detail page

**Used by:** [src/app/(app)/pipeline/page.tsx](../src/app/(app)/pipeline/page.tsx)

---

## Account Components

### Account Detail Page
**File:** [src/app/(app)/accounts/[id]/page.tsx](../src/app/(app)/accounts/[id]/page.tsx)

Server component. Fetches in parallel:
- Account record + owner
- Contacts (sorted: primary first)
- Active opportunity + stage info
- Last 30 activities (sorted by `occurred_at` desc)
- Workshops
- Last 5 pre-call briefs

Renders:
- Account header (name, vertical badge, city/state, employee count, owner avatar)
- Quick-action buttons: "Generate Brief", "Open Playbook", "Start Workshop"
- Contact list with role, email, phone (primary contact marked with ★)
- Opportunity summary (stage, value, close date, days-in-stage)
- Activity feed (icon per type, relative timestamps)
- Brief history (last 5 — links to brief page)

---

### `BriefClient` — Pre-Call Brief Editor
**File:** [src/app/(app)/accounts/[id]/brief/brief-client.tsx](../src/app/(app)/accounts/[id]/brief/brief-client.tsx)

Client component. Handles all interactivity on the brief page.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `initialContent` | `string` | Latest saved brief (markdown) or freshly generated template |
| `accountId` | `string` | Used for save API call |
| `generatedAt` | `string` | Timestamp of last generation |
| `editedAt` | `string \| null` | Timestamp of last manual edit |

**Features:**
- Displays brief as rendered markdown (uses `@tailwindcss/typography` via `prose` class)
- "Edit" button toggles to a `<textarea>` with the raw markdown
- "Save" button POSTs to `/api/accounts/[id]/brief` and refreshes
- "Regenerate" re-runs the template engine server-side
- "Copy prompt for Claude.ai" assembles a prompt with the brief + system context and copies to clipboard — allows manual AI expansion without the API key
- Shows `generated_at` and `edited_at` timestamps

**Used by:** [src/app/(app)/accounts/[id]/brief/page.tsx](../src/app/(app)/accounts/[id]/brief/page.tsx)

---

## Playbook Components

### `PlaybookInteractive` — Playbook Navigator
**File:** [src/app/(app)/playbooks/[vertical]/playbook-interactive.tsx](../src/app/(app)/playbooks/[vertical]/playbook-interactive.tsx)

Client component for the playbook view. Wraps the rendered markdown with:
- Section jump links (pain points, capabilities, discovery questions, objections, pilot focus areas)
- Smooth scroll navigation
- Collapsed/expanded sections on mobile

**Used by:** [src/app/(app)/playbooks/[vertical]/page.tsx](../src/app/(app)/playbooks/[vertical]/page.tsx)

---

## Demo Script Components

### `DemoClient` — Live Demo Tracker
**File:** [src/app/(app)/demo-scripts/[agent]/demo-client.tsx](../src/app/(app)/demo-scripts/[agent]/demo-client.tsx)

Client component. Manages state for a live demo walkthrough.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `script` | `DemoScript` | Full script object from `demo-scripts.ts` |

**Features:**
- Progress bar (steps completed / total steps)
- Elapsed timer (counts up from first interaction)
- Each step: title, duration estimate, talking points list, presenter notes (collapsible)
- Checkbox per step — check to mark complete and auto-scroll to next
- "Reset" button clears all checkboxes + timer
- Closing message shown when all steps complete

**Used by:** [src/app/(app)/demo-scripts/[agent]/page.tsx](../src/app/(app)/demo-scripts/[agent]/page.tsx)

---

## Import Component

### Import Page
**File:** [src/app/(app)/import/page.tsx](../src/app/(app)/import/page.tsx)

Client component. Provides drag-and-drop file upload UI for CSV/Excel imports.

**Features:**
- Three upload targets: Accounts, Contacts, Opportunities
- Drag-and-drop or click-to-browse per entity type
- Shows import result summary after upload: `{ imported, skipped, errors }`
- Error list for rows that failed validation
- Import history table (reads from `import_log`)

**Calls:** `POST /api/import`

---

## Landing Page

### `page.tsx` — Hero + Module Grid
**File:** [src/app/page.tsx](../src/app/page.tsx)

Server component. The root landing page. Does not require auth or session.

**Sections:**
- Hero banner with VAI logo and tagline
- Pipeline snapshot: total TCV, opportunities by stage, team distribution
- Module grid: 8 cards (one per app module) with description and link
- Recent activity feed (last 10 activities across all accounts)

---

## Layout Files

### Root Layout
**File:** [src/app/layout.tsx](../src/app/layout.tsx)

Sets HTML metadata, loads fonts, applies global CSS. Wraps everything in `<html><body>`.

### App Group Layout
**File:** [src/app/(app)/layout.tsx](../src/app/(app)/layout.tsx)

Applied to all routes inside `(app)/`. Renders the `<Nav>` component above a max-width content container. All module pages inherit this layout.

---

## Utility: `cn()`

**File:** [src/lib/utils.ts](../src/lib/utils.ts)

```ts
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Used everywhere for conditional Tailwind class application. Avoids class conflicts from both `clsx` and `twMerge`.
