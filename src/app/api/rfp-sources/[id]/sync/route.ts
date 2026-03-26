import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { rfpSources, rfpListings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { syncSbir }   from "@/lib/rfp-connectors/sbir";
import { syncSamGov } from "@/lib/rfp-connectors/sam-gov";
import { syncRss }    from "@/lib/rfp-connectors/rss";
import { parseFilters, type RfpListingRaw } from "@/lib/rfp-connectors/types";

function parseCredentials(raw: string | null): Record<string, string> {
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

// Upsert listings for a source — INSERT OR REPLACE deduplicates on (source_id, external_id)
async function upsertListings(sourceId: string, sourceType: string, listings: RfpListingRaw[]) {
  if (listings.length === 0) return;
  const now = new Date().toISOString();

  // SQLite doesn't support bulk insert via Drizzle's INSERT OR IGNORE cleanly for many rows,
  // so we use the raw sqlite exec approach with a prepared statement loop.
  for (const l of listings) {
    const id = `lst-${sourceId}-${Buffer.from(l.externalId).toString("base64").slice(0, 16)}`;
    await db
      .insert(rfpListings)
      .values({
        id,
        sourceId,
        externalId:  l.externalId,
        title:       l.title,
        description: l.description,
        agency:      l.agency,
        naicsCode:   l.naicsCode,
        setAside:    l.setAside,
        postedDate:  l.postedDate,
        dueDate:     l.dueDate,
        valueMin:    l.valueMin,
        valueMax:    l.valueMax,
        url:         l.url,
        sourceType,
        rawData:     l.rawData,
        fetchedAt:   now,
      })
      .onConflictDoNothing(); // UNIQUE(source_id, external_id)
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [source] = await db.select().from(rfpSources).where(eq(rfpSources.id, id));
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (source.status === "paused") return NextResponse.json({ error: "Source is paused" }, { status: 409 });

  const filters     = parseFilters(source.filters);
  const credentials = parseCredentials(source.credentials);
  const now         = new Date().toISOString();

  let listings: RfpListingRaw[] = [];
  let errorMessage: string | null = null;
  let newStatus = "active";

  // ── Live connectors ───────────────────────────────────────────────────────
  try {
    switch (source.type) {
      case "sbir":
        listings = await syncSbir(filters);
        break;

      case "sam_gov": {
        const apiKey = credentials.apiKey ?? "";
        if (!apiKey) throw new Error("No API key configured — add your SAM.gov key in source settings.");
        listings = await syncSamGov(apiKey, filters);
        break;
      }

      case "rss": {
        const feedUrl = credentials.feedUrl ?? "";
        if (!feedUrl) throw new Error("No feed URL configured.");
        listings = await syncRss(feedUrl, filters);
        break;
      }

      // ── Mock for source types that need infrastructure ─────────────────
      default: {
        // Simulate for email / upload / webhook / govwin
        await new Promise((r) => setTimeout(r, 600));
        const mockCount = Math.floor(Math.random() * 15) + 1;
        const [updated] = await db
          .update(rfpSources)
          .set({ lastSyncAt: now, lastSyncCount: mockCount, status: "active", updatedAt: now })
          .where(eq(rfpSources.id, id))
          .returning();
        return NextResponse.json({ synced: mockCount, lastSyncAt: now, mock: true, source: updated });
      }
    }

    // Upsert into DB
    await upsertListings(id, source.type, listings);

  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err);
    newStatus    = "error";
  }

  // Update source metadata
  const [updated] = await db
    .update(rfpSources)
    .set({
      lastSyncAt:    errorMessage ? source.lastSyncAt : now,
      lastSyncCount: errorMessage ? source.lastSyncCount : listings.length,
      status:        newStatus,
      statusMessage: errorMessage,
      // Mark as live once a real sync succeeds
      isMock:        errorMessage ? source.isMock : false,
      updatedAt:     now,
    })
    .where(eq(rfpSources.id, id))
    .returning();

  if (errorMessage) {
    return NextResponse.json({ error: errorMessage, source: updated }, { status: 502 });
  }

  return NextResponse.json({
    synced:     listings.length,
    lastSyncAt: now,
    mock:       false,
    source:     updated,
  });
}
