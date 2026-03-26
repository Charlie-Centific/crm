import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { workflows } from "@/db/schema";
import { and, like, or, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * GET /api/workflows
 * Returns all workflows, optionally filtered by ?q=search&vertical=transit&threat=traffic-incident
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const vertical = searchParams.get("vertical");
  const threat = searchParams.get("threat");

  const conditions = [];

  if (q) {
    const pattern = `%${q}%`;
    conditions.push(
      or(
        like(workflows.name, pattern),
        like(sql`COALESCE(${workflows.description}, '')`, pattern),
        like(sql`COALESCE(${workflows.audience}, '')`, pattern),
        like(sql`COALESCE(${workflows.useCasesJson}, '')`, pattern),
      )
    );
  }

  if (vertical) {
    conditions.push(like(workflows.verticalTags, `%"${vertical}"%`));
  }

  if (threat) {
    conditions.push(like(workflows.threatTags, `%"${threat}"%`));
  }

  const rows = await db
    .select()
    .from(workflows)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(workflows.id);

  return NextResponse.json({ workflows: rows });
}

/**
 * POST /api/workflows
 * Create a custom workflow.
 */
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    id?: string;
    name: string;
    description?: string;
    audience?: string;
    users?: string;
    useCases?: string[];
    verticalTags?: string[];
    threatTags?: string[];
  };

  if (!body.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const id = body.id ?? `WF-CUSTOM-${randomUUID().slice(0, 8).toUpperCase()}`;

  await db.insert(workflows).values({
    id,
    name: body.name,
    description: body.description ?? null,
    audience: body.audience ?? null,
    users: body.users ?? null,
    useCasesJson: JSON.stringify(body.useCases ?? []),
    verticalTags: JSON.stringify(body.verticalTags ?? []),
    threatTags: JSON.stringify(body.threatTags ?? []),
    isCustom: true,
  });

  const [created] = await db.select().from(workflows).where(sql`id = ${id}`).limit(1);
  return NextResponse.json({ workflow: created }, { status: 201 });
}
