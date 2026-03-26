import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { rfpListings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "50");

  const rows = await db
    .select()
    .from(rfpListings)
    .where(eq(rfpListings.sourceId, id))
    .orderBy(desc(rfpListings.fetchedAt))
    .limit(limit);

  return NextResponse.json(rows);
}
