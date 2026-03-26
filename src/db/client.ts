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
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      email TEXT,
      initials TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT 'blue',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      dynamics_id TEXT UNIQUE,
      name TEXT NOT NULL,
      vertical TEXT,
      owner_name TEXT,
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

    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      audience TEXT,
      users TEXT,
      use_cases_json TEXT,
      vertical_tags TEXT,
      threat_tags TEXT,
      is_custom INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS use_cases (
      id TEXT PRIMARY KEY,
      workshop_id TEXT NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
      workflow_id TEXT REFERENCES workflows(id) ON DELETE SET NULL,
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

    CREATE TABLE IF NOT EXISTS rfp_sources (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      label TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      credentials TEXT DEFAULT '{}',
      filters TEXT NOT NULL DEFAULT '{}',
      schedule TEXT NOT NULL DEFAULT 'daily',
      last_sync_at TEXT,
      last_sync_count INTEGER,
      status TEXT NOT NULL DEFAULT 'active',
      status_message TEXT,
      is_mock INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rfp_listings (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL REFERENCES rfp_sources(id) ON DELETE CASCADE,
      external_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      agency TEXT,
      naics_code TEXT,
      set_aside TEXT,
      posted_date TEXT,
      due_date TEXT,
      value_min REAL,
      value_max REAL,
      url TEXT,
      source_type TEXT NOT NULL,
      raw_data TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(source_id, external_id)
    );
  `);

  // ── Seed mock RFP sources (INSERT OR IGNORE — safe to re-run) ─────────────
  sqlite.exec(`
    INSERT OR IGNORE INTO rfp_sources
      (id, type, label, enabled, credentials, filters, schedule, last_sync_at, last_sync_count, status, is_mock, created_at, updated_at)
    VALUES
      (
        'src-001', 'sam_gov', 'SAM.gov — Federal Opportunities', 1,
        '{"apiKey":"MOCK_KEY_SAMGOV_****"}',
        '{"keywords":["computer vision","agentic AI","intelligent video","machine learning"],"naicsCodes":["541511","541519","541715"],"agencies":["DoD","DHS","DOT"],"setAsides":[],"valueMin":null,"valueMax":null}',
        'daily', datetime('now', '-2 hours'), 47, 'active', 1, datetime('now'), datetime('now')
      ),
      (
        'src-002', 'sbir', 'SBIR.gov — R&D Grants', 1,
        '{}',
        '{"keywords":["computer vision","autonomous systems","agentic","real-time video analytics"],"naicsCodes":["541715"],"agencies":["NSF","DARPA","NIH","DoD"],"setAsides":[],"valueMin":null,"valueMax":500000}',
        'weekly', datetime('now', '-3 days'), 12, 'active', 1, datetime('now'), datetime('now')
      ),
      (
        'src-003', 'email', 'Sales Team Email Ingest', 1,
        '{"emailAddress":"rfp@centific.com"}',
        '{"keywords":[],"naicsCodes":[],"agencies":[],"setAsides":[],"valueMin":null,"valueMax":null}',
        'realtime', datetime('now', '-45 minutes'), 3, 'active', 1, datetime('now'), datetime('now')
      ),
      (
        'src-004', 'govwin', 'GovWin IQ', 0,
        '{}',
        '{"keywords":["computer vision","AI","surveillance","smart city"],"naicsCodes":["541511","541519"],"agencies":[],"setAsides":["8a","WOSB"],"valueMin":100000,"valueMax":null}',
        'daily', null, null, 'paused', 1, datetime('now'), datetime('now')
      ),
      (
        'src-005', 'rss', 'California CALOPPS Feed', 1,
        '{"feedUrl":"https://www.calopps.org/feeds/rss.xml"}',
        '{"keywords":["technology","AI","computer vision","surveillance"],"naicsCodes":[],"agencies":[],"setAsides":[],"valueMin":null,"valueMax":null}',
        'daily', datetime('now', '-6 hours'), 5, 'active', 1, datetime('now'), datetime('now')
      );
  `);
}

// Auto-init on import (safe — CREATE TABLE IF NOT EXISTS is idempotent)
initDb();
