import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// Store the database file in /data at the project root
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "vai-crm.db");

// Ensure /data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const sqlite = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Initialize tables on first run
export function initDb() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      dynamics_id TEXT UNIQUE,
      name TEXT NOT NULL,
      vertical TEXT,
      website TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      employee_count INTEGER,
      notes TEXT,
      last_imported_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      dynamics_id TEXT UNIQUE,
      account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
      first_name TEXT,
      last_name TEXT NOT NULL,
      role TEXT,
      email TEXT,
      phone TEXT,
      linkedin TEXT,
      is_primary INTEGER DEFAULT 0,
      last_imported_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      dynamics_id TEXT UNIQUE,
      account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      stage TEXT DEFAULT 'lead',
      value REAL,
      close_date TEXT,
      lead_source TEXT,
      lead_source_detail TEXT,
      owner_name TEXT,
      owner_email TEXT,
      stage_changed_at TEXT,
      last_activity_at TEXT,
      next_action TEXT,
      last_imported_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      dynamics_id TEXT UNIQUE,
      account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
      opportunity_id TEXT REFERENCES opportunities(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      subject TEXT,
      body TEXT,
      author_name TEXT,
      occurred_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS import_log (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      file_name TEXT,
      status TEXT NOT NULL,
      records_found INTEGER DEFAULT 0,
      records_imported INTEGER DEFAULT 0,
      skipped INTEGER DEFAULT 0,
      error_message TEXT,
      imported_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workshops (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      opportunity_id TEXT REFERENCES opportunities(id),
      status TEXT DEFAULT 'planned',
      scheduled_at TEXT,
      completed_at TEXT,
      facilitator_name TEXT,
      facilitator_email TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workshop_attendees (
      id TEXT PRIMARY KEY,
      workshop_id TEXT NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      role TEXT,
      email TEXT,
      is_prospect INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS use_cases (
      id TEXT PRIMARY KEY,
      workshop_id TEXT NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      agent_type TEXT,
      business_owner_name TEXT,
      business_owner_email TEXT,
      technical_owner_name TEXT,
      technical_owner_email TEXT,
      impact_score INTEGER,
      feasibility_score INTEGER,
      alignment_score INTEGER,
      composite_score REAL,
      rank INTEGER,
      is_finalized INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS roi_models (
      id TEXT PRIMARY KEY,
      use_case_id TEXT NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
      current_state_metric TEXT,
      target_state_metric TEXT,
      unit TEXT,
      estimated_annual_value REAL,
      time_to_value_months INTEGER,
      confidence_level INTEGER,
      narrative TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pilot_plans (
      id TEXT PRIMARY KEY,
      workshop_id TEXT NOT NULL UNIQUE REFERENCES workshops(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL REFERENCES accounts(id),
      kickoff_date TEXT,
      target_close_date TEXT,
      success_criteria TEXT,
      hardware_notes TEXT,
      cloud_notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pilots (
      id TEXT PRIMARY KEY,
      pilot_plan_id TEXT REFERENCES pilot_plans(id),
      account_id TEXT NOT NULL REFERENCES accounts(id),
      opportunity_id TEXT REFERENCES opportunities(id),
      status TEXT DEFAULT 'active',
      kickoff_date TEXT NOT NULL,
      target_close_date TEXT NOT NULL,
      actual_close_date TEXT,
      closed_revenue REAL,
      loss_reason TEXT,
      milestone_kickoff_done INTEGER DEFAULT 0,
      milestone_first_use_case_live INTEGER DEFAULT 0,
      milestone_midpoint_checkin INTEGER DEFAULT 0,
      milestone_success_criteria_reviewed INTEGER DEFAULT 0,
      milestone_close_conversation_started INTEGER DEFAULT 0,
      owner_name TEXT,
      owner_email TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS value_reports (
      id TEXT PRIMARY KEY,
      workshop_id TEXT NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL REFERENCES accounts(id),
      version INTEGER DEFAULT 1,
      content TEXT NOT NULL,
      generated_at TEXT DEFAULT (datetime('now')),
      edited_at TEXT
    );

    CREATE TABLE IF NOT EXISTS pre_call_briefs (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      opportunity_id TEXT REFERENCES opportunities(id),
      content TEXT NOT NULL,
      generated_at TEXT DEFAULT (datetime('now')),
      edited_at TEXT
    );
  `);
}

// Auto-init on import (safe — CREATE TABLE IF NOT EXISTS is idempotent)
initDb();
