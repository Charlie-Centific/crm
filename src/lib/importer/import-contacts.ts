import { db } from "@/db/client";
import { contacts, accounts, importLog } from "@/db/schema";
import { parseCsv } from "./parse";
import { CONTACT_COLUMNS, getCol } from "./columns";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export async function importContactsCsv(
  csvText: string,
  fileName: string
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const { rows, errors: parseErrors } = parseCsv(csvText);
  const errors: string[] = [...parseErrors];
  let imported = 0;
  let skipped = 0;

  // Cache account name → id lookups to avoid N+1
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
    const lastName = getCol(row, CONTACT_COLUMNS.lastName);
    if (!lastName) {
      skipped++;
      continue;
    }

    const dynamicsId = getCol(row, CONTACT_COLUMNS.dynamicsId);
    const accountName = getCol(row, CONTACT_COLUMNS.accountName);
    const accountId = await resolveAccountId(accountName);

    const record = {
      id: randomUUID(),
      dynamicsId: dynamicsId ?? null,
      accountId,
      firstName: getCol(row, CONTACT_COLUMNS.firstName),
      lastName,
      role: getCol(row, CONTACT_COLUMNS.role),
      email: getCol(row, CONTACT_COLUMNS.email),
      phone: getCol(row, CONTACT_COLUMNS.phone),
      lastImportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await db
        .insert(contacts)
        .values(record)
        .onConflictDoUpdate({
          target: contacts.dynamicsId,
          set: {
            accountId: record.accountId,
            firstName: record.firstName,
            lastName: record.lastName,
            role: record.role,
            email: record.email,
            phone: record.phone,
            lastImportedAt: record.lastImportedAt,
            updatedAt: record.updatedAt,
          },
        });
      imported++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Row ${i + 2} (${lastName}): ${msg}`);
      skipped++;
    }
  }

  await db.insert(importLog).values({
    id: randomUUID(),
    entityType: "contact",
    fileName,
    status: errors.length > 0 ? (imported > 0 ? "partial" : "failed") : "success",
    recordsFound: rows.length,
    recordsImported: imported,
    skipped,
    errorMessage: errors.length > 0 ? errors.slice(0, 10).join("\n") : null,
  });

  return { imported, skipped, errors };
}
