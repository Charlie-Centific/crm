import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { accounts, opportunities } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";

/**
 * GET /api/accounts
 * Returns all accounts with their active opportunity summary.
 * Query params: ?q=search&vertical=transit&stage=demo
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const vertical = searchParams.get("vertical");

  try {
    const rows = await db
      .select({
        id: accounts.id,
        name: accounts.name,
        vertical: accounts.vertical,
        city: accounts.city,
        state: accounts.state,
        website: accounts.website,
        lastImportedAt: accounts.lastImportedAt,
        updatedAt: accounts.updatedAt,
      })
      .from(accounts)
      .where(
        q
          ? or(
              ilike(accounts.name, `%${q}%`),
              ilike(accounts.city, `%${q}%`)
            )
          : undefined
      )
      .orderBy(accounts.name);

    return NextResponse.json({ accounts: rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
