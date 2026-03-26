import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { workflows } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/workflows/[id]
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [row] = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  return NextResponse.json({ workflow: row });
}

/**
 * PATCH /api/workflows/[id]
 * Update any editable fields on a workflow.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json() as {
    name?: string;
    description?: string;
    audience?: string;
    users?: string;
    useCases?: string[];
    verticalTags?: string[];
    threatTags?: string[];
  };

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.audience !== undefined) updates.audience = body.audience;
  if (body.users !== undefined) updates.users = body.users;
  if (body.useCases !== undefined) updates.useCasesJson = JSON.stringify(body.useCases);
  if (body.verticalTags !== undefined) updates.verticalTags = JSON.stringify(body.verticalTags);
  if (body.threatTags !== undefined) updates.threatTags = JSON.stringify(body.threatTags);

  const [updated] = await db
    .update(workflows)
    .set(updates)
    .where(eq(workflows.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  return NextResponse.json({ workflow: updated });
}

/**
 * DELETE /api/workflows/[id]
 * Only custom workflows can be deleted.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [row] = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  if (!row.isCustom) {
    return NextResponse.json({ error: "Cannot delete built-in workflows" }, { status: 403 });
  }
  await db.delete(workflows).where(eq(workflows.id, id));
  return NextResponse.json({ ok: true });
}
