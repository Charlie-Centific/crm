/**
 * One-time seed script: imports Vision AI pipeline Excel export into the SQLite DB.
 * Run with: node scripts/seed-from-excel.mjs
 */

import XLSX from "xlsx";
import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DB_PATH = path.join(ROOT, "data", "vai-crm.db");
const EXCEL_PATH = path.join(
  ROOT,
  "data",
  "raw",
  "Vision AI- Charlie_2026 3-25-2026 5-06-14 PM.xlsx"
);

// ─── DB setup ─────────────────────────────────────────────────────────────────

const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

// ─── Excel helpers ────────────────────────────────────────────────────────────

function excelDateToISO(serial) {
  if (!serial || typeof serial !== "number") return null;
  // Excel date serial → JS date (accounting for Excel's 1900 leap year bug)
  const date = new Date(Math.round((serial - 25569) * 864e5));
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

// ─── Vertical inference ───────────────────────────────────────────────────────

const VERTICAL_KEYWORDS = {
  transit: ["transit", "transport", "bus", "rail", "metro", "mta", "rtd", "bart", "airport", "aviation"],
  utilities: ["utility", "utilities", "electric", "water", "gas", "power", "energy"],
  emergency: ["emergency", "911", "dispatch", "fire", "police", "safety", "ems", "criminal", "district attorney", "juvenile", "correctional"],
  smart_city: ["city of", "county", "town of", "municipality", "facilities commission", "development services", "government"],
};

function inferVertical(accountName) {
  const lower = accountName.toLowerCase();
  for (const [v, keywords] of Object.entries(VERTICAL_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return v;
  }
  return "other";
}

// ─── Stage mapping ────────────────────────────────────────────────────────────

const STAGE_MAP = {
  "1-qualify": "lead",
  "1-lead": "lead",
  "2-develop": "discovery",
  "2-discovery": "discovery",
  "3-propose": "demo",
  "3-demo": "demo",
  "4-negotiate": "workshop",
  "4-workshop": "workshop",
  "5-pilot": "pilot_start",
  "6-close": "pilot_close",
};

function mapStage(phase) {
  if (!phase) return "lead";
  const key = phase.toLowerCase().trim();
  for (const [k, v] of Object.entries(STAGE_MAP)) {
    if (key.includes(k.split("-")[1])) return v;
  }
  return "lead";
}

// ─── Lead source inference from Topic prefix ──────────────────────────────────

function inferLeadSource(topic) {
  if (!topic) return "direct";
  const prefix = topic.split("_")[0].toUpperCase();
  if (prefix === "LD") return "direct";   // Lead Direct
  if (prefix === "SD") return "partner";  // Sales Direct / Partner
  if (prefix === "RFI") return "inbound"; // Inbound RFI
  if (prefix === "CONF") return "conference";
  return "direct";
}

// ─── Import ───────────────────────────────────────────────────────────────────

const wb = XLSX.readFile(EXCEL_PATH);
const ws = wb.Sheets["Vision AI_ Charlie_2026"];
const rows = XLSX.utils.sheet_to_json(ws);

console.log(`\nReading ${rows.length} opportunities from Excel...\n`);

// Collect unique accounts
const accountNameToId = new Map();

const upsertAccount = db.prepare(`
  INSERT INTO accounts (id, dynamics_id, name, vertical, last_imported_at, updated_at)
  VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  ON CONFLICT(dynamics_id) DO UPDATE SET
    name = excluded.name,
    vertical = excluded.vertical,
    last_imported_at = excluded.last_imported_at,
    updated_at = excluded.updated_at
`);

const upsertOpp = db.prepare(`
  INSERT INTO opportunities (
    id, dynamics_id, account_id, name, stage, value,
    close_date, lead_source, last_imported_at, updated_at, stage_changed_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
  ON CONFLICT(dynamics_id) DO UPDATE SET
    account_id = excluded.account_id,
    name = excluded.name,
    stage = excluded.stage,
    value = excluded.value,
    close_date = excluded.close_date,
    lead_source = excluded.lead_source,
    last_imported_at = excluded.last_imported_at,
    updated_at = excluded.updated_at
`);

const importAll = db.transaction(() => {
  // First pass: create all accounts
  for (const row of rows) {
    const accountName = row["Account"];
    if (!accountName || accountNameToId.has(accountName)) continue;

    const id = randomUUID();
    const dynamicsAccountId = `acct-${accountName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const vertical = inferVertical(accountName);

    upsertAccount.run(id, dynamicsAccountId, accountName, vertical);
    accountNameToId.set(accountName, id);
    console.log(`  ✓ Account: ${accountName} [${vertical}]`);
  }

  console.log(`\n  ${accountNameToId.size} accounts created/updated.\n`);

  // Second pass: create opportunities
  let oppCount = 0;
  for (const row of rows) {
    const dynamicsId = row["(Do Not Modify) Opportunity"];
    const topic = row["Topic"];
    const accountName = row["Account"];
    const phase = row["Pipeline Phase"];
    const closeSerial = row["Close Date"];
    const tcv = row["TCV"];

    if (!dynamicsId || !topic) continue;

    const accountId = accountNameToId.get(accountName) ?? null;
    const stage = mapStage(phase);
    const closeDate = excelDateToISO(closeSerial);
    const leadSource = inferLeadSource(topic);

    upsertOpp.run(
      randomUUID(),
      dynamicsId,
      accountId,
      topic,
      stage,
      tcv ?? null,
      closeDate,
      leadSource
    );

    console.log(`  ✓ Opp: ${topic} → ${accountName} [${stage}] $${tcv?.toLocaleString() ?? "—"}`);
    oppCount++;
  }

  console.log(`\n  ${oppCount} opportunities created/updated.`);
});

importAll();

// ─── Log the import ───────────────────────────────────────────────────────────

db.prepare(`
  INSERT INTO import_log (id, entity_type, file_name, status, records_found, records_imported, skipped)
  VALUES (?, 'opportunity', ?, 'success', ?, ?, 0)
`).run(randomUUID(), "Vision AI- Charlie_2026 3-25-2026 5-06-14 PM.xlsx", rows.length, rows.length);

db.prepare(`
  INSERT INTO import_log (id, entity_type, file_name, status, records_found, records_imported, skipped)
  VALUES (?, 'account', ?, 'success', ?, ?, 0)
`).run(randomUUID(), "Vision AI- Charlie_2026 3-25-2026 5-06-14 PM.xlsx", accountNameToId.size, accountNameToId.size);

console.log("\n✓ Done. Database seeded from Excel export.\n");
db.close();
