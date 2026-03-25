/**
 * Dynamics 365 sync engine.
 * Supports full sync (initial load) and delta sync (modified since last run).
 * All upserts are keyed on dynamicsId so re-runs are idempotent.
 */

import { db } from "@/db/client";
import { accounts, contacts, opportunities, activities, syncLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  fetchAccounts,
  fetchContacts,
  fetchOpportunities,
} from "./client";
import { mapAccount, mapContact, mapOpportunity } from "./mapper";

async function getLastSyncTime(entityType: string): Promise<Date | undefined> {
  const logs = await db
    .select({ completedAt: syncLog.completedAt })
    .from(syncLog)
    .where(eq(syncLog.entityType, entityType))
    .orderBy(syncLog.startedAt)
    .limit(1);

  const last = logs[0]?.completedAt;
  return last ?? undefined;
}

async function logSync(
  entityType: string,
  syncType: "full" | "delta",
  result: { fetched: number; upserted: number; error?: string }
) {
  await db.insert(syncLog).values({
    entityType,
    syncType,
    status: result.error ? "failed" : "success",
    recordsFetched: result.fetched,
    recordsUpserted: result.upserted,
    errorMessage: result.error ?? null,
    completedAt: new Date(),
  });
}

// ─── Account sync ─────────────────────────────────────────────────────────────

export async function syncAccounts(full = false) {
  const modifiedSince = full ? undefined : await getLastSyncTime("account");
  const syncType = modifiedSince ? "delta" : "full";

  try {
    const raw = await fetchAccounts(modifiedSince);
    let upserted = 0;

    for (const record of raw) {
      const mapped = mapAccount(record);
      await db
        .insert(accounts)
        .values(mapped)
        .onConflictDoUpdate({
          target: accounts.dynamicsId,
          set: mapped,
        });
      upserted++;
    }

    await logSync("account", syncType, {
      fetched: raw.length,
      upserted,
    });

    return { fetched: raw.length, upserted };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logSync("account", syncType, {
      fetched: 0,
      upserted: 0,
      error: message,
    });
    throw err;
  }
}

// ─── Contact sync ─────────────────────────────────────────────────────────────

export async function syncContacts(full = false) {
  const modifiedSince = full ? undefined : await getLastSyncTime("contact");
  const syncType = modifiedSince ? "delta" : "full";

  try {
    const raw = await fetchContacts(modifiedSince);
    let upserted = 0;

    for (const record of raw) {
      const mapped = mapContact(record);
      const { accountDynamicsId, ...contactData } = mapped;

      // Resolve account FK from Dynamics ID
      let accountId: string | null = null;
      if (accountDynamicsId) {
        const [acct] = await db
          .select({ id: accounts.id })
          .from(accounts)
          .where(eq(accounts.dynamicsId, accountDynamicsId))
          .limit(1);
        accountId = acct?.id ?? null;
      }

      await db
        .insert(contacts)
        .values({ ...contactData, accountId })
        .onConflictDoUpdate({
          target: contacts.dynamicsId,
          set: { ...contactData, accountId },
        });
      upserted++;
    }

    await logSync("contact", syncType, { fetched: raw.length, upserted });
    return { fetched: raw.length, upserted };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logSync("contact", syncType, { fetched: 0, upserted: 0, error: message });
    throw err;
  }
}

// ─── Opportunity sync ─────────────────────────────────────────────────────────

export async function syncOpportunities(full = false) {
  const modifiedSince = full ? undefined : await getLastSyncTime("opportunity");
  const syncType = modifiedSince ? "delta" : "full";

  try {
    const raw = await fetchOpportunities(modifiedSince);
    let upserted = 0;

    for (const record of raw) {
      const mapped = mapOpportunity(record);
      const { accountDynamicsId, ...oppData } = mapped;

      let accountId: string | null = null;
      if (accountDynamicsId) {
        const [acct] = await db
          .select({ id: accounts.id })
          .from(accounts)
          .where(eq(accounts.dynamicsId, accountDynamicsId))
          .limit(1);
        accountId = acct?.id ?? null;
      }

      await db
        .insert(opportunities)
        .values({ ...oppData, accountId })
        .onConflictDoUpdate({
          target: opportunities.dynamicsId,
          set: { ...oppData, accountId },
        });
      upserted++;
    }

    await logSync("opportunity", syncType, { fetched: raw.length, upserted });
    return { fetched: raw.length, upserted };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logSync("opportunity", syncType, { fetched: 0, upserted: 0, error: message });
    throw err;
  }
}

// ─── Full sync orchestrator ───────────────────────────────────────────────────

export async function runFullSync() {
  console.log("[sync] Starting full sync from Dynamics 365...");

  const acctResult = await syncAccounts(true);
  console.log(`[sync] Accounts: ${acctResult.upserted} upserted`);

  const contactResult = await syncContacts(true);
  console.log(`[sync] Contacts: ${contactResult.upserted} upserted`);

  const oppResult = await syncOpportunities(true);
  console.log(`[sync] Opportunities: ${oppResult.upserted} upserted`);

  console.log("[sync] Full sync complete.");
  return { acctResult, contactResult, oppResult };
}

// ─── Delta sync orchestrator ──────────────────────────────────────────────────

export async function runDeltaSync() {
  console.log("[sync] Starting delta sync from Dynamics 365...");

  const acctResult = await syncAccounts(false);
  console.log(`[sync] Accounts: ${acctResult.upserted} upserted`);

  const contactResult = await syncContacts(false);
  console.log(`[sync] Contacts: ${contactResult.upserted} upserted`);

  const oppResult = await syncOpportunities(false);
  console.log(`[sync] Opportunities: ${oppResult.upserted} upserted`);

  console.log("[sync] Delta sync complete.");
  return { acctResult, contactResult, oppResult };
}
