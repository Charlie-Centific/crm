import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { accounts, opportunities } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * GET /api/pipeline
 * Returns all opportunities grouped by stage, with account info.
 * Query params: ?vertical=transit&source=conference
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vertical = searchParams.get("vertical");
  const source = searchParams.get("source");

  const conditions = [];
  if (vertical) conditions.push(eq(accounts.vertical, vertical as never));
  if (source) conditions.push(eq(opportunities.leadSource, source as never));

  const rows = await db
    .select({
      oppId: opportunities.id,
      oppName: opportunities.name,
      stage: opportunities.stage,
      value: opportunities.value,
      closeDate: opportunities.closeDate,
      leadSource: opportunities.leadSource,
      leadSourceDetail: opportunities.leadSourceDetail,
      ownerName: opportunities.ownerName,
      nextAction: opportunities.nextAction,
      stageChangedAt: opportunities.stageChangedAt,
      lastActivityAt: opportunities.lastActivityAt,
      accountId: accounts.id,
      accountName: accounts.name,
      vertical: accounts.vertical,
      city: accounts.city,
      state: accounts.state,
    })
    .from(opportunities)
    .innerJoin(accounts, eq(opportunities.accountId, accounts.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(opportunities.stageChangedAt);

  // Group by stage
  const stages = [
    "lead",
    "discovery",
    "demo",
    "workshop",
    "pilot_start",
    "pilot_close",
    "closed_won",
    "closed_lost",
  ] as const;

  const grouped = Object.fromEntries(
    stages.map((s) => [s, rows.filter((r) => r.stage === s)])
  );

  return NextResponse.json({ pipeline: grouped, total: rows.length });
}

/**
 * PATCH /api/pipeline
 * Update opportunity stage and/or next action.
 */
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { oppId, stage, nextAction } = body;

  if (!oppId) {
    return NextResponse.json({ error: "oppId required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (stage) {
    updates.stage = stage;
    updates.stageChangedAt = new Date();
  }
  if (nextAction !== undefined) updates.nextAction = nextAction;

  const [updated] = await db
    .update(opportunities)
    .set(updates)
    .where(eq(opportunities.id, oppId))
    .returning();

  return NextResponse.json({ opportunity: updated });
}
