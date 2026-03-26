import { db } from "@/db/client";
import { accounts, contacts, opportunities, activities, preCallBriefs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { generateBriefContent } from "@/lib/brief-template";
import { randomUUID } from "crypto";

// POST /api/accounts/[id]/brief — generate and save a new brief
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [account] = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const [accountContacts, accountOpps, recentActivities] = await Promise.all([
    db.select().from(contacts).where(eq(contacts.accountId, id)).orderBy(contacts.isPrimary),
    db.select().from(opportunities).where(eq(opportunities.accountId, id)).orderBy(desc(opportunities.updatedAt)),
    db.select().from(activities).where(eq(activities.accountId, id)).orderBy(desc(activities.occurredAt)).limit(10),
  ]);

  const content = generateBriefContent({
    account,
    contacts: accountContacts,
    opportunities: accountOpps,
    activities: recentActivities,
  });

  const briefId = randomUUID();
  await db.insert(preCallBriefs).values({
    id: briefId,
    accountId: id,
    opportunityId: accountOpps[0]?.id ?? null,
    content,
  });

  return NextResponse.json({ id: briefId, content });
}

// PUT /api/accounts/[id]/brief — save edits to the latest brief
export async function PUT(
  req: NextRequest,
) {
  const { briefId, content } = await req.json() as { briefId: string; content: string };

  if (!briefId || !content) {
    return NextResponse.json({ error: "briefId and content required" }, { status: 400 });
  }

  await db
    .update(preCallBriefs)
    .set({ content, editedAt: new Date().toISOString() })
    .where(eq(preCallBriefs.id, briefId));

  return NextResponse.json({ ok: true });
}
