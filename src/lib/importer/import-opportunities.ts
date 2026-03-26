import { db } from "@/db/client";
import { opportunities, accounts, importLog } from "@/db/schema";
import { parseCsv } from "./parse";
import { OPPORTUNITY_COLUMNS, getCol, inferStage, inferLeadSource } from "./columns";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export async function importOpportunitiesCsv(
  csvText: string,
  fileName: string
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const { rows, errors: parseErrors } = parseCsv(csvText);
  const errors: string[] = [...parseErrors];
  let imported = 0;
  let skipped = 0;

  const accountCache = new Map<string, string>();

  async function resolveAccountId(accountName: string | null): Promise<string | null> {
    if (!accountName) return null;
    if (accountCache.has(accountName)) return accountCache.get(accountName)!;
    const [acct] = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.name, accountName))
      .limit(1);
    const id = acct?.id ?? null;
    if (id) accountCache.set(accountName, id);
    return id;
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = getCol(row, OPPORTUNITY_COLUMNS.name);
    if (!name) {
      skipped++;
      continue;
    }

    const dynamicsId = getCol(row, OPPORTUNITY_COLUMNS.dynamicsId);
    const accountName = getCol(row, OPPORTUNITY_COLUMNS.accountName);
    const accountId = await resolveAccountId(accountName);

    const rawValue = getCol(row, OPPORTUNITY_COLUMNS.value);
    const value = rawValue
      ? parseFloat(rawValue.replace(/[$,]/g, "")) || null
      : null;

    const rawDate = getCol(row, OPPORTUNITY_COLUMNS.closeDate);
    const closeDate = rawDate ? new Date(rawDate).toISOString() : null;

    const record = {
      id: randomUUID(),
      dynamicsId: dynamicsId ?? null,
      accountId,
      name,
      stage: inferStage(getCol(row, OPPORTUNITY_COLUMNS.stage)),
      value,
      closeDate,
      leadSource: inferLeadSource(getCol(row, OPPORTUNITY_COLUMNS.leadSource)),
      ownerName: getCol(row, OPPORTUNITY_COLUMNS.ownerName),
      stageChangedAt: new Date().toISOString(),
      lastImportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await db
        .insert(opportunities)
        .values(record)
        .onConflictDoUpdate({
          target: opportunities.dynamicsId,
          set: {
            accountId: record.accountId,
            name: record.name,
            stage: record.stage,
            value: record.value,
            closeDate: record.closeDate,
            leadSource: record.leadSource,
            ownerName: record.ownerName,
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
    entityType: "opportunity",
    fileName,
    status: errors.length > 0 ? (imported > 0 ? "partial" : "failed") : "success",
    recordsFound: rows.length,
    recordsImported: imported,
    skipped,
    errorMessage: errors.length > 0 ? errors.slice(0, 10).join("\n") : null,
  });

  return { imported, skipped, errors };
}
