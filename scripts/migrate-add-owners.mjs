/**
 * Migration: add team_members table and owner_name to accounts.
 * Run once: node scripts/migrate-add-owners.mjs
 */

import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "vai-crm.db");
const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

db.exec(`
  -- Team members table
  CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    email TEXT,
    initials TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'blue',
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Add owner_name to accounts if not present
  ALTER TABLE accounts ADD COLUMN owner_name TEXT;

  -- Update opportunities table: ensure owner_name column exists (it already does in schema)
`);

// Seed the four team members
const insert = db.prepare(`
  INSERT OR IGNORE INTO team_members (id, name, email, initials, color)
  VALUES (?, ?, ?, ?, ?)
`);

const team = [
  { name: "Charlie Gonzalez", email: "charlie.gonzalez@centific.com", initials: "CG", color: "blue" },
  { name: "Cynthia Colbert",  email: "cynthia.colbert@centific.com",  initials: "CC", color: "purple" },
  { name: "Michael Underwood",email: "michael.underwood@centific.com",initials: "MU", color: "green" },
  { name: "Jordan Ripoll",    email: "jordan.ripoll@centific.com",    initials: "JR", color: "orange" },
];

for (const m of team) {
  insert.run(randomUUID(), m.name, m.email, m.initials, m.color);
  console.log(`  ✓ Team member: ${m.name} (${m.initials})`);
}

// Assign Charlie to all existing unowned opportunities and accounts
const oppUpdate = db.prepare(`UPDATE opportunities SET owner_name = 'Charlie Gonzalez' WHERE owner_name IS NULL OR owner_name = ''`);
const acctUpdate = db.prepare(`UPDATE accounts SET owner_name = 'Charlie Gonzalez' WHERE owner_name IS NULL OR owner_name = ''`);

const { changes: oppChanges } = oppUpdate.run();
const { changes: acctChanges } = acctUpdate.run();

console.log(`\n  ✓ Assigned Charlie Gonzalez to ${oppChanges} opportunities`);
console.log(`  ✓ Assigned Charlie Gonzalez to ${acctChanges} accounts`);
console.log("\n✓ Migration complete.\n");

db.close();
