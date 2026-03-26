import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { rfpSources } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (body.label     !== undefined) updates.label       = body.label;
  if (body.enabled   !== undefined) updates.enabled     = body.enabled;
  if (body.status    !== undefined) updates.status      = body.status;
  if (body.schedule  !== undefined) updates.schedule    = body.schedule;
  if (body.credentials !== undefined) updates.credentials = JSON.stringify(body.credentials);
  if (body.filters   !== undefined) updates.filters     = JSON.stringify(body.filters);
  if (body.isMock    !== undefined) updates.isMock      = body.isMock;

  const [row] = await db
    .update(rfpSources)
    .set(updates)
    .where(eq(rfpSources.id, id))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(rfpSources).where(eq(rfpSources.id, id));
  return new NextResponse(null, { status: 204 });
}
