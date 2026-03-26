import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { rfpSources } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(rfpSources)
    .orderBy(desc(rfpSources.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, label, enabled, credentials, filters, schedule } = body;

  if (!type || !label) {
    return NextResponse.json({ error: "type and label are required" }, { status: 400 });
  }

  const id = `src-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  const [row] = await db
    .insert(rfpSources)
    .values({
      id,
      type,
      label,
      enabled: enabled ?? true,
      credentials: JSON.stringify(credentials ?? {}),
      filters: JSON.stringify(filters ?? { keywords: [], naicsCodes: [], agencies: [], setAsides: [], valueMin: null, valueMax: null }),
      schedule: schedule ?? "daily",
      status: "active",
      isMock: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
