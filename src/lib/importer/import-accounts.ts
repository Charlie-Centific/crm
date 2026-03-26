import { db } from "@/db/client";
import { accounts, importLog } from "@/db/schema";
import { parseCsv } from "./parse";
import {
  ACCOUNT_COLUMNS,
  getCol,
  inferVertical,
} from "./columns";
import { randomUUID } from "crypto";

export async function importAccountsCsv(
  csvText: string,
  fileName: string
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const { rows, errors: parseErrors } = parseCsv(csvText);
  const errors: string[] = [...parseErrors];
  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = getCol(row, ACCOUNT_COLUMNS.name);
    if (!name) {
      errors.push(`Row ${i + 2}: skipped — no account name`);
      skipped++;
      continue;
    }

    const dynamicsId = getCol(row, ACCOUNT_COLUMNS.dynamicsId);
    const rawVertical = getCol(row, ACCOUNT_COLUMNS.vertical);

    const record = {
      id: randomUUID(),
      dynamicsId: dynamicsId ?? null,
      name,
      vertical: inferVertical(rawVertical),
      website: getCol(row, ACCOUNT_COLUMNS.website),
      city: getCol(row, ACCOUNT_COLUMNS.city),
      state: getCol(row, ACCOUNT_COLUMNS.state),
      country: getCol(row, ACCOUNT_COLUMNS.country),
      employeeCount: (() => {
        const raw = getCol(row, ACCOUNT_COLUMNS.employeeCount);
        if (!raw) return null;
        const n = parseInt(raw.replace(/,/g, ""), 10);
        return isNaN(n) ? null : n;
      })(),
      lastImportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await db
        .insert(accounts)
        .values(record)
        .onConflictDoUpdate({
          target: accounts.dynamicsId,
          set: {
            name: record.name,
            vertical: record.vertical,
            website: record.website,
            city: record.city,
            state: record.state,
            country: record.country,
            employeeCount: record.employeeCount,
            lastImportedAt: record.lastImportedAt,
            updatedAt: record.updatedAt,
          },
        });
      imported++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Row ${i + 2} (${name}): ${msg}`);
      skipped++;
    }
  }

  await db.insert(importLog).values({
    id: randomUUID(),
    entityType: "account",
    fileName,
    status: errors.length > 0 ? (imported > 0 ? "partial" : "failed") : "success",
    recordsFound: rows.length,
    recordsImported: imported,
    skipped,
    errorMessage: errors.length > 0 ? errors.slice(0, 10).join("\n") : null,
  });

  return { imported, skipped, errors };
}
