import { NextRequest, NextResponse } from "next/server";
import { runDeltaSync, runFullSync } from "@/lib/dynamics/sync";

/**
 * POST /api/sync
 * Triggers a Dynamics 365 sync.
 * Query param: ?type=full  (default: delta)
 *
 * This endpoint is called by the cron job every 15 minutes.
 * Protect it with a shared secret in production.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-sync-secret");
  if (
    process.env.NODE_ENV === "production" &&
    secret !== process.env.SYNC_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "delta";

  try {
    const result = type === "full" ? await runFullSync() : await runDeltaSync();
    return NextResponse.json({ ok: true, type, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sync] Error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to trigger sync" });
}
