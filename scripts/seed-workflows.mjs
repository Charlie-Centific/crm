#!/usr/bin/env node
/**
 * Seed the workflows table from data/raw/workflows.md.
 * Idempotent: uses INSERT OR REPLACE so re-running is safe.
 * Run from the vai/ directory: node scripts/seed-workflows.mjs
 */

import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DB_PATH = join(ROOT, "data", "vai-crm.db");
const MD_PATH = join(ROOT, "data", "raw", "workflows.md");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Parse workflows.md ────────────────────────────────────────────────────────

const md = readFileSync(MD_PATH, "utf8");

// Split on "### WF-" headings — each block is one workflow
const blocks = md.split(/\n(?=### WF-)/).filter((b) => b.trim().startsWith("### WF-"));

/**
 * Extract a line value after a bold label, e.g. "**Audience:** foo" → "foo"
 */
function extractField(text, label) {
  const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`);
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

/**
 * Extract the backtick-delimited tags from the Tags line.
 * e.g. "**Tags:** `transit` `smart-city`" → ["transit","smart-city"]
 */
function extractTags(text) {
  const line = text.match(/\*\*Tags:\*\*(.+)/);
  if (!line) return [];
  return [...line[1].matchAll(/`([^`]+)`/g)].map((m) => m[1]);
}

// Vertical tag slugs (from taxonomy in the md)
const VERTICALS = new Set([
  "law-enforcement","public-safety","transit","smart-city","transportation",
  "logistics","retail","healthcare","enterprise","industrial","environment",
  "maritime","events",
]);

/**
 * Extract bullet list items under a given heading.
 */
function extractBullets(text, heading) {
  const re = new RegExp(`\\*\\*${heading}:\\*\\*\\n((?:- .+\\n?)+)`);
  const m = text.match(re);
  if (!m) return [];
  return m[1]
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim());
}

/**
 * Extract the description paragraph (after **Description:** label).
 */
function extractDescription(text) {
  const m = text.match(/\*\*Description:\*\*\s*\n\n(.+?)(?:\n\n|\n\*\*)/s);
  if (m) return m[1].trim();
  // Inline variant: **Description:** text on same line
  const inline = text.match(/\*\*Description:\*\*\s*(.+)/);
  return inline ? inline[1].trim() : null;
}

const workflows = blocks.map((block) => {
  // Heading line: "### WF-13-WTHR — Weather"
  const headingMatch = block.match(/^### (WF-[\w-]+)\s*[—-]\s*(.+)/m);
  if (!headingMatch) return null;

  const id = headingMatch[1].trim();
  const name = headingMatch[2].trim();

  // ID line: "**ID:** `WF-13-WTHR`"
  // (already extracted from heading, but confirm)

  const allTags = extractTags(block);
  const verticalTags = allTags.filter((t) => VERTICALS.has(t));
  const threatTags = allTags.filter((t) => !VERTICALS.has(t));

  const description = extractField(block, "Description");
  const audience = extractField(block, "Audience");
  const users = extractField(block, "Users");
  const useCases = extractBullets(block, "Use Cases");

  return {
    id,
    name,
    description,
    audience,
    users,
    useCasesJson: JSON.stringify(useCases),
    verticalTags: JSON.stringify(verticalTags),
    threatTags: JSON.stringify(threatTags),
    isCustom: 0,
  };
}).filter(Boolean);

// ── Upsert into DB ────────────────────────────────────────────────────────────

const upsert = db.prepare(`
  INSERT OR REPLACE INTO workflows
    (id, name, description, audience, users, use_cases_json, vertical_tags, threat_tags, is_custom, updated_at)
  VALUES
    (@id, @name, @description, @audience, @users, @useCasesJson, @verticalTags, @threatTags, @isCustom, datetime('now'))
`);

const upsertMany = db.transaction((rows) => {
  for (const row of rows) upsert.run(row);
});

upsertMany(workflows);

console.log(`✓ Seeded ${workflows.length} workflows into ${DB_PATH}`);
workflows.forEach((w) => console.log(`  ${w.id}  ${w.name}`));
