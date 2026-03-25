import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import {
  accounts,
  contacts,
  opportunities,
  activities,
  workshops,
  preCallBriefs,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/accounts/[id]
 * Returns full account detail: contacts, opportunities, recent activities, briefs.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id))
      .limit(1);

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const [accountContacts, accountOpps, recentActivities, accountWorkshops, recentBriefs] =
      await Promise.all([
        db
          .select()
          .from(contacts)
          .where(eq(contacts.accountId, id))
          .orderBy(contacts.isPrimary),

        db
          .select()
          .from(opportunities)
          .where(eq(opportunities.accountId, id))
          .orderBy(desc(opportunities.updatedAt)),

        db
          .select()
          .from(activities)
          .where(eq(activities.accountId, id))
          .orderBy(desc(activities.occurredAt))
          .limit(50),

        db
          .select({ id: workshops.id, status: workshops.status, scheduledAt: workshops.scheduledAt })
          .from(workshops)
          .where(eq(workshops.accountId, id))
          .orderBy(desc(workshops.createdAt)),

        db
          .select({ id: preCallBriefs.id, generatedAt: preCallBriefs.generatedAt })
          .from(preCallBriefs)
          .where(eq(preCallBriefs.accountId, id))
          .orderBy(desc(preCallBriefs.generatedAt))
          .limit(5),
      ]);

    return NextResponse.json({
      account,
      contacts: accountContacts,
      opportunities: accountOpps,
      activities: recentActivities,
      workshops: accountWorkshops,
      briefs: recentBriefs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/accounts/[id]
 * Update mutable fields: nextAction, notes.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const allowed = ["notes"];
  const updates: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  updates.updatedAt = new Date();

  const [updated] = await db
    .update(accounts)
    .set(updates)
    .where(eq(accounts.id, id))
    .returning();

  return NextResponse.json({ account: updated });
}
