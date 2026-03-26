import { NextRequest, NextResponse } from "next/server";
import { importAccountsCsv } from "@/lib/importer/import-accounts";
import { importContactsCsv } from "@/lib/importer/import-contacts";
import { importOpportunitiesCsv } from "@/lib/importer/import-opportunities";

/**
 * POST /api/import
 * Accepts a multipart form upload:
 *   - file: CSV file (Dynamics 365 export)
 *   - type: "accounts" | "contacts" | "opportunities"
 */
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;

  if (!file || !type) {
    return NextResponse.json(
      { error: "Missing file or type" },
      { status: 400 }
    );
  }

  const validTypes = ["accounts", "contacts", "opportunities"];
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  const csvText = await file.text();

  try {
    let result;
    if (type === "accounts") {
      result = await importAccountsCsv(csvText, file.name);
    } else if (type === "contacts") {
      result = await importContactsCsv(csvText, file.name);
    } else {
      result = await importOpportunitiesCsv(csvText, file.name);
    }

    return NextResponse.json({ ok: true, type, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
