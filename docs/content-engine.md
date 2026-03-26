# Content Engine

The content engine is the collection of modules that power the sales-enablement content in VAI Buddy: playbooks, demo scripts, and pre-call brief generation.

---

## Pre-Call Brief Generator

### Overview

The brief generator assembles a structured, markdown-formatted call prep document from live CRM data. It requires **no API key** — the template engine works entirely from database records.

The optional `ANTHROPIC_API_KEY` enables AI expansion via the Claude API. Without it, a "Copy prompt for Claude.ai" button is provided so reps can paste the brief into claude.ai manually.

### Files

| File | Purpose |
|---|---|
| [src/lib/brief-template.ts](../src/lib/brief-template.ts) | Template engine — generates markdown from CRM data |
| [src/app/(app)/accounts/[id]/brief/page.tsx](../src/app/(app)/accounts/[id]/brief/page.tsx) | Server page — fetches data, calls template engine |
| [src/app/(app)/accounts/[id]/brief/brief-client.tsx](../src/app/(app)/accounts/[id]/brief/brief-client.tsx) | Client component — edit, save, copy |

### Template Engine

**File:** [src/lib/brief-template.ts](../src/lib/brief-template.ts)

The `generateBrief(data: BriefData): string` function takes a structured data object and returns a markdown string. It is deterministic — the same inputs always produce the same output.

**`BriefData` input shape:**

```ts
interface BriefData {
  account: Account & { owner: TeamMember }
  contacts: Contact[]
  opportunity: Opportunity | null
  activities: Activity[]     // last 5 used
  vertical: Vertical
}
```

**Output sections:**

1. **Account Snapshot** — Company name, vertical, city/state, employee count, owner name, website
2. **Active Opportunity** — Deal name, stage, days-in-stage, value, expected close date, next action
3. **Key Contacts** — Name, role, email, phone; primary contact flagged with ★
4. **Recent Activity** — Last 5 activities: type icon, subject, relative date
5. **Open Questions** — Vertical-specific discovery questions drawn from the matching playbook content
6. **Suggested Agenda** — Stage-aware agenda (different talking points for `discovery` vs `demo` vs `pilot_start`, etc.)

**Vertical-specific questions** are loaded from the corresponding playbook markdown file at brief generation time and filtered to the "discovery questions" section.

**Stage-aware agenda** maps each of the 8 pipeline stages to a tailored agenda template:
- `lead`: Intro + pain discovery
- `discovery`: Problem framing + capability alignment
- `demo`: Tailored walkthrough + proof points
- `workshop`: Use case prioritization
- `pilot_start`: Kickoff logistics + success criteria
- `pilot_close`: Value review + expansion conversation
- `closed_won` / `closed_lost`: Retrospective templates

### Saving Briefs

Briefs are saved to the `pre_call_briefs` table with `generated_at` and `edited_at` timestamps. The account detail page shows the last 5 briefs. The brief page always loads the most recent.

### Brief History

On the account detail page, the "Briefs" section lists past briefs with timestamps and links to view them. This lets reps track how conversations have evolved over time.

---

## Vertical Playbooks

### Overview

Playbooks are structured discovery guides, one per vertical. They cover:
- Pain points and business drivers
- VAI capabilities that map to each pain
- Discovery questions (branching by stakeholder role)
- Common objections + responses
- Pilot focus areas

### Files

| File | Purpose |
|---|---|
| [src/lib/playbooks.ts](../src/lib/playbooks.ts) | Playbook metadata + filesystem loader |
| [src/lib/playbook-data.ts](../src/lib/playbook-data.ts) | Helpers for parsing playbook sections |
| [src/content/playbooks/transit.md](../src/content/playbooks/transit.md) | Transit vertical content |
| [src/content/playbooks/smart-city.md](../src/content/playbooks/smart-city.md) | Smart City vertical content |
| [src/content/playbooks/emergency.md](../src/content/playbooks/emergency.md) | Emergency Services content |
| [src/app/(app)/playbooks/[vertical]/page.tsx](../src/app/(app)/playbooks/[vertical]/page.tsx) | Playbook viewer page |

### Playbook Metadata

**File:** [src/lib/playbooks.ts](../src/lib/playbooks.ts)

```ts
const PLAYBOOKS = [
  {
    slug: "transit",
    label: "Transit & Mobility",
    description: "Bus, metro, and rail agencies",
    color: "blue",
    file: "transit.md",
  },
  {
    slug: "smart-city",
    label: "Smart City",
    description: "City governments and municipalities",
    color: "green",
    file: "smart-city.md",
  },
  {
    slug: "emergency",
    label: "Emergency Services",
    description: "Fire, police, and dispatch",
    color: "red",
    file: "emergency.md",
  },
]
```

The `loadPlaybook(slug)` function reads the matching markdown file from the filesystem (server-side only) and returns the raw content.

### Vertical → Playbook Routing

On the account detail page, the "Open Playbook" button links directly to `/playbooks/[account.vertical]`. This ensures reps always land in the right playbook for their account.

### Adding a New Playbook

1. Create `src/content/playbooks/your-vertical.md`
2. Add an entry to the `PLAYBOOKS` array in [src/lib/playbooks.ts](../src/lib/playbooks.ts)
3. Add the vertical value to the `inferVertical()` function in [src/lib/importer/columns.ts](../src/lib/importer/columns.ts)
4. Update the `VERTICAL_LABELS` map in [src/lib/utils.ts](../src/lib/utils.ts)

---

## Demo Scripts

### Overview

Demo scripts are step-by-step guides for running live product demos. Each step has talking points, presenter notes, and a time estimate. The `DemoClient` component tracks progress during a live demo.

### Files

| File | Purpose |
|---|---|
| [src/lib/demo-scripts.ts](../src/lib/demo-scripts.ts) | Script data definitions |
| [src/content/agents/vai.md](../src/content/agents/vai.md) | VAI platform product profile |
| [src/content/agents/slim.md](../src/content/agents/slim.md) | SLiM entry product profile |
| [src/app/(app)/demo-scripts/[agent]/page.tsx](../src/app/(app)/demo-scripts/[agent]/page.tsx) | Script loader page |
| [src/app/(app)/demo-scripts/[agent]/demo-client.tsx](../src/app/(app)/demo-scripts/[agent]/demo-client.tsx) | Interactive step tracker |

### Script Structure

**File:** [src/lib/demo-scripts.ts](../src/lib/demo-scripts.ts)

```ts
interface DemoScript {
  agent: "vai" | "slim"
  title: string
  description: string
  total_duration: number    // minutes
  steps: DemoStep[]
  closing_message: string
}

interface DemoStep {
  id: string
  title: string
  duration: number          // minutes for this step
  talking_points: string[]  // bullet list to cover
  presenter_notes: string   // collapse/expand tips for the rep
}
```

**Available scripts:**
- `vai` — Full VAI platform demo (longer, executive-level)
- `slim` — SLiM entry product demo (shorter, technical-first)

### Adding a New Demo Script

1. Add a new `DemoScript` object to the `DEMO_SCRIPTS` array in [src/lib/demo-scripts.ts](../src/lib/demo-scripts.ts)
2. The route `[agent]` will automatically resolve — no page changes needed

---

## Agent Profiles

**Files:**
- [src/content/agents/vai.md](../src/content/agents/vai.md)
- [src/content/agents/slim.md](../src/content/agents/slim.md)

These markdown files describe each AI agent product (VAI and SLiM) in depth: capabilities, use cases, technical architecture, integration requirements, pricing model. They are used as reference material and as context injected into Claude API prompts when generating briefs with AI expansion.

---

## RFP Builder

**File:** [src/app/(app)/rfp/page.tsx](../src/app/(app)/rfp/page.tsx)
**Data:** [src/lib/rfp-builder-data.ts](../src/lib/rfp-builder-data.ts)

The RFP builder provides a library of pre-written response blocks that reps can select and arrange to build a proposal response quickly.

**Block types:**
- `content` — Paragraph response to an RFP question
- `heading` — Section header
- `callout` — Highlighted key point or proof statement

**Current state:** UI is functional but PDF export is a stub. Blocks can be selected and previewed; export button is placeholder.

---

## Content Editing Guide

All playbook content lives in markdown files — any text editor can update them. No database changes required.

**To update a playbook:**
1. Open `src/content/playbooks/{vertical}.md`
2. Edit the markdown
3. Restart the dev server (changes are read at request time in dev; in production, redeploy)

**Playbook markdown conventions:**
```markdown
## Pain Points
- **High incident response time**: ...

## VAI Capabilities
| Capability | How It Helps |
|---|---|
| Real-time video analytics | ... |

## Discovery Questions
### For IT Leaders
- What camera infrastructure do you currently have?

## Common Objections
**"We already have a VMS"**
Response: ...

## Pilot Focus Areas
- ...
```

The `prose` class from `@tailwindcss/typography` renders all of this correctly without any custom CSS.
