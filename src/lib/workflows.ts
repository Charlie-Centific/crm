import { db } from "@/db/client";
import { workflows } from "@/db/schema";
import { eq, like, or, sql } from "drizzle-orm";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Workflow {
  id: string;                 // "WF-13-WTHR"
  name: string;
  description: string | null;
  audience: string | null;
  users: string | null;
  useCases: string[];         // parsed from useCasesJson
  verticalTags: string[];     // parsed from verticalTags
  threatTags: string[];       // parsed from threatTags
  isCustom: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

// Maps CRM vertical slug → workflow vertical tag(s)
export const VERTICAL_TO_TAGS: Record<string, string[]> = {
  transit:    ["transit", "transportation"],
  utilities:  ["industrial"],
  emergency:  ["law-enforcement", "public-safety"],
  smart_city: ["smart-city"],
};

// ── Parsing helpers ───────────────────────────────────────────────────────────

function parseRow(row: typeof workflows.$inferSelect): Workflow {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    audience: row.audience ?? null,
    users: row.users ?? null,
    useCases: safeParseJson(row.useCasesJson),
    verticalTags: safeParseJson(row.verticalTags),
    threatTags: safeParseJson(row.threatTags),
    isCustom: Boolean(row.isCustom),
    createdAt: row.createdAt ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}

function safeParseJson(v: string | null | undefined): string[] {
  if (!v) return [];
  try { return JSON.parse(v); } catch { return []; }
}

// ── Query functions ───────────────────────────────────────────────────────────

/** Return all workflows ordered by ID. */
export async function getAllWorkflows(): Promise<Workflow[]> {
  const rows = await db.select().from(workflows).orderBy(workflows.id);
  return rows.map(parseRow);
}

/** Return a single workflow by its ID (e.g. "WF-13-WTHR"). */
export async function getWorkflowById(id: string): Promise<Workflow | null> {
  const [row] = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  return row ? parseRow(row) : null;
}

/** Return workflows whose verticalTags JSON contains any of the given tag slugs. */
export async function getWorkflowsByVertical(verticalSlug: string): Promise<Workflow[]> {
  const tags = VERTICAL_TO_TAGS[verticalSlug] ?? [verticalSlug];
  const rows = await db
    .select()
    .from(workflows)
    .where(or(...tags.map((t) => like(workflows.verticalTags, `%"${t}"%`))))
    .orderBy(workflows.id);
  return rows.map(parseRow);
}

/** Return specific workflows by an array of IDs. */
export async function getWorkflowsByIds(ids: string[]): Promise<Workflow[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .select()
    .from(workflows)
    .where(
      or(...ids.map((id) => eq(workflows.id, id)))
    )
    .orderBy(workflows.id);
  return rows.map(parseRow);
}

/** Full-text search across name, description, audience, users, use_cases_json. */
export async function searchWorkflows(query: string): Promise<Workflow[]> {
  const q = `%${query}%`;
  const rows = await db
    .select()
    .from(workflows)
    .where(
      or(
        like(workflows.name, q),
        like(sql`COALESCE(${workflows.description}, '')`, q),
        like(sql`COALESCE(${workflows.audience}, '')`, q),
        like(sql`COALESCE(${workflows.users}, '')`, q),
        like(sql`COALESCE(${workflows.useCasesJson}, '')`, q),
      )
    )
    .orderBy(workflows.id);
  return rows.map(parseRow);
}
