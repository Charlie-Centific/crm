import {
  sqliteTable,
  text,
  real,
  integer,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// SQLite has no native enums — we use text with CHECK constraints via application logic.
// All IDs are text (UUIDs generated in app code).

// ─── Team Members ─────────────────────────────────────────────────────────────

export const teamMembers = sqliteTable("team_members", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  email: text("email"),
  initials: text("initials").notNull(),
  color: text("color").notNull().default("blue"), // blue|purple|green|orange
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// ─── Accounts ─────────────────────────────────────────────────────────────────

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  dynamicsId: text("dynamics_id").unique(),
  name: text("name").notNull(),
  vertical: text("vertical"), // transit | utilities | emergency | smart_city | other
  ownerName: text("owner_name"),
  website: text("website"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  employeeCount: integer("employee_count"),
  notes: text("notes"),
  lastImportedAt: text("last_imported_at"), // ISO string
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey(),
  dynamicsId: text("dynamics_id").unique(),
  accountId: text("account_id").references(() => accounts.id, { onDelete: "cascade" }),
  firstName: text("first_name"),
  lastName: text("last_name").notNull(),
  role: text("role"),
  email: text("email"),
  phone: text("phone"),
  linkedin: text("linkedin"),
  isPrimary: integer("is_primary", { mode: "boolean" }).default(false),
  lastImportedAt: text("last_imported_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── Opportunities ────────────────────────────────────────────────────────────

export const opportunities = sqliteTable("opportunities", {
  id: text("id").primaryKey(),
  dynamicsId: text("dynamics_id").unique(),
  accountId: text("account_id").references(() => accounts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  stage: text("stage").default("lead"), // lead|discovery|demo|workshop|pilot_start|pilot_close|closed_won|closed_lost
  value: real("value"),
  closeDate: text("close_date"), // ISO string
  leadSource: text("lead_source"), // conference|partner|direct|inbound
  leadSourceDetail: text("lead_source_detail"),
  ownerName: text("owner_name"),
  ownerEmail: text("owner_email"),
  stageChangedAt: text("stage_changed_at"),
  lastActivityAt: text("last_activity_at"),
  nextAction: text("next_action"),
  lastImportedAt: text("last_imported_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── Activities ───────────────────────────────────────────────────────────────

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  dynamicsId: text("dynamics_id").unique(),
  accountId: text("account_id").references(() => accounts.id, { onDelete: "cascade" }),
  opportunityId: text("opportunity_id").references(() => opportunities.id, { onDelete: "set null" }),
  type: text("type").notNull(), // note|email|call|meeting
  subject: text("subject"),
  body: text("body"),
  authorName: text("author_name"),
  occurredAt: text("occurred_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// ─── Import Log ───────────────────────────────────────────────────────────────

export const importLog = sqliteTable("import_log", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(), // account|opportunity|contact|activity
  fileName: text("file_name"),
  status: text("status").notNull(), // success|failed|partial
  recordsFound: integer("records_found").default(0),
  recordsImported: integer("records_imported").default(0),
  skipped: integer("skipped").default(0),
  errorMessage: text("error_message"),
  importedAt: text("imported_at").default(sql`(datetime('now'))`),
});

// ─── Workshops ────────────────────────────────────────────────────────────────

export const workshops = sqliteTable("workshops", {
  id: text("id").primaryKey(),
  accountId: text("account_id").references(() => accounts.id, { onDelete: "cascade" }).notNull(),
  opportunityId: text("opportunity_id").references(() => opportunities.id),
  status: text("status").default("planned"), // planned|in_progress|completed|report_generated
  scheduledAt: text("scheduled_at"),
  completedAt: text("completed_at"),
  facilitatorName: text("facilitator_name"),
  facilitatorEmail: text("facilitator_email"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── Workshop Attendees ───────────────────────────────────────────────────────

export const workshopAttendees = sqliteTable("workshop_attendees", {
  id: text("id").primaryKey(),
  workshopId: text("workshop_id").references(() => workshops.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  role: text("role"),
  email: text("email"),
  isProspect: integer("is_prospect", { mode: "boolean" }).default(true),
});

// ─── Workflows ────────────────────────────────────────────────────────────────
// Canonical AI/CV workflow dictionary (seeded from data/raw/workflows.md).
// IDs use the "WF-##-CODE" format from the markdown (e.g. "WF-13-WTHR").

export const workflows = sqliteTable("workflows", {
  id: text("id").primaryKey(), // e.g. "WF-13-WTHR"
  name: text("name").notNull(),
  description: text("description"),
  audience: text("audience"),          // free-text audience line from markdown
  users: text("users"),                // free-text users line from markdown
  useCasesJson: text("use_cases_json"),// JSON array of use-case strings
  verticalTags: text("vertical_tags"), // JSON array of vertical tag slugs
  threatTags: text("threat_tags"),     // JSON array of threat tag slugs
  isCustom: integer("is_custom", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── Use Cases ────────────────────────────────────────────────────────────────

export const useCases = sqliteTable("use_cases", {
  id: text("id").primaryKey(),
  workshopId: text("workshop_id").references(() => workshops.id, { onDelete: "cascade" }).notNull(),
  workflowId: text("workflow_id").references(() => workflows.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description"),
  agentType: text("agent_type"),
  businessOwnerName: text("business_owner_name"),
  businessOwnerEmail: text("business_owner_email"),
  technicalOwnerName: text("technical_owner_name"),
  technicalOwnerEmail: text("technical_owner_email"),
  impactScore: integer("impact_score"),
  feasibilityScore: integer("feasibility_score"),
  alignmentScore: integer("alignment_score"),
  compositeScore: real("composite_score"),
  rank: integer("rank"),
  isFinalized: integer("is_finalized", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── ROI Models ───────────────────────────────────────────────────────────────

export const roiModels = sqliteTable("roi_models", {
  id: text("id").primaryKey(),
  useCaseId: text("use_case_id").references(() => useCases.id, { onDelete: "cascade" }).notNull(),
  currentStateMetric: text("current_state_metric"),
  targetStateMetric: text("target_state_metric"),
  unit: text("unit"),
  estimatedAnnualValue: real("estimated_annual_value"),
  timeToValueMonths: integer("time_to_value_months"),
  confidenceLevel: integer("confidence_level"),
  narrative: text("narrative"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── Pilot Plans ──────────────────────────────────────────────────────────────

export const pilotPlans = sqliteTable("pilot_plans", {
  id: text("id").primaryKey(),
  workshopId: text("workshop_id").references(() => workshops.id, { onDelete: "cascade" }).notNull().unique(),
  accountId: text("account_id").references(() => accounts.id).notNull(),
  kickoffDate: text("kickoff_date"),
  targetCloseDate: text("target_close_date"),
  successCriteria: text("success_criteria"), // JSON array stored as text
  hardwareNotes: text("hardware_notes"),
  cloudNotes: text("cloud_notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── Pilots ───────────────────────────────────────────────────────────────────

export const pilots = sqliteTable("pilots", {
  id: text("id").primaryKey(),
  pilotPlanId: text("pilot_plan_id").references(() => pilotPlans.id),
  accountId: text("account_id").references(() => accounts.id).notNull(),
  opportunityId: text("opportunity_id").references(() => opportunities.id),
  status: text("status").default("active"), // active|at_risk|converted|lost
  kickoffDate: text("kickoff_date").notNull(),
  targetCloseDate: text("target_close_date").notNull(),
  actualCloseDate: text("actual_close_date"),
  closedRevenue: real("closed_revenue"),
  lossReason: text("loss_reason"),
  milestoneKickoffDone: integer("milestone_kickoff_done", { mode: "boolean" }).default(false),
  milestoneFirstUseCaseLive: integer("milestone_first_use_case_live", { mode: "boolean" }).default(false),
  milestoneMidpointCheckin: integer("milestone_midpoint_checkin", { mode: "boolean" }).default(false),
  milestoneSuccessCriteriaReviewed: integer("milestone_success_criteria_reviewed", { mode: "boolean" }).default(false),
  milestoneCloseConversationStarted: integer("milestone_close_conversation_started", { mode: "boolean" }).default(false),
  ownerName: text("owner_name"),
  ownerEmail: text("owner_email"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── Value Reports ────────────────────────────────────────────────────────────

export const valueReports = sqliteTable("value_reports", {
  id: text("id").primaryKey(),
  workshopId: text("workshop_id").references(() => workshops.id, { onDelete: "cascade" }).notNull(),
  accountId: text("account_id").references(() => accounts.id).notNull(),
  version: integer("version").default(1),
  content: text("content").notNull(),
  generatedAt: text("generated_at").default(sql`(datetime('now'))`),
  editedAt: text("edited_at"),
});

// ─── Pre-call Briefs ──────────────────────────────────────────────────────────

export const preCallBriefs = sqliteTable("pre_call_briefs", {
  id: text("id").primaryKey(),
  accountId: text("account_id").references(() => accounts.id, { onDelete: "cascade" }).notNull(),
  opportunityId: text("opportunity_id").references(() => opportunities.id),
  content: text("content").notNull(),
  generatedAt: text("generated_at").default(sql`(datetime('now'))`),
  editedAt: text("edited_at"),
});

// ─── RFP Sources ──────────────────────────────────────────────────────────────
// Configurable connectors that pull/push RFP opportunities into the platform.
// Credentials are stored as JSON (encrypt in v2 before production use).

export const rfpSources = sqliteTable("rfp_sources", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // sam_gov|sbir|govwin|email|upload|webhook|rss
  label: text("label").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  credentials: text("credentials").default("{}"), // JSON — type-specific auth fields
  filters: text("filters").notNull().default("{}"), // JSON — keywords, naics, agencies, etc.
  schedule: text("schedule").notNull().default("daily"), // realtime|hourly|daily|weekly
  lastSyncAt: text("last_sync_at"),
  lastSyncCount: integer("last_sync_count"),
  status: text("status").notNull().default("active"), // active|paused|error
  statusMessage: text("status_message"),
  isMock: integer("is_mock", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ─── RFP Listings ─────────────────────────────────────────────────────────────
// Actual RFP/solicitation records fetched from live or mock sources.
// Unique per (source_id, external_id) so re-syncing is idempotent.

export const rfpListings = sqliteTable("rfp_listings", {
  id:          text("id").primaryKey(),
  sourceId:    text("source_id").notNull().references(() => rfpSources.id, { onDelete: "cascade" }),
  externalId:  text("external_id").notNull(),        // ID from the upstream system
  title:       text("title").notNull(),
  description: text("description"),
  agency:      text("agency"),
  naicsCode:   text("naics_code"),
  setAside:    text("set_aside"),
  postedDate:  text("posted_date"),
  dueDate:     text("due_date"),
  valueMin:    real("value_min"),
  valueMax:    real("value_max"),
  url:         text("url"),
  sourceType:  text("source_type").notNull(),        // denormalised for quick queries
  rawData:     text("raw_data"),                     // full JSON from upstream
  fetchedAt:   text("fetched_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const accountRelations = relations(accounts, ({ many }) => ({
  contacts: many(contacts),
  opportunities: many(opportunities),
  activities: many(activities),
  workshops: many(workshops),
  pilots: many(pilots),
  preCallBriefs: many(preCallBriefs),
}));

export const opportunityRelations = relations(opportunities, ({ one, many }) => ({
  account: one(accounts, { fields: [opportunities.accountId], references: [accounts.id] }),
  activities: many(activities),
}));

export const workshopRelations = relations(workshops, ({ one, many }) => ({
  account: one(accounts, { fields: [workshops.accountId], references: [accounts.id] }),
  opportunity: one(opportunities, { fields: [workshops.opportunityId], references: [opportunities.id] }),
  attendees: many(workshopAttendees),
  useCases: many(useCases),
  pilotPlan: one(pilotPlans),
  valueReports: many(valueReports),
}));

export const workflowRelations = relations(workflows, ({ many }) => ({
  useCases: many(useCases),
}));

export const useCaseRelations = relations(useCases, ({ one }) => ({
  workshop: one(workshops, { fields: [useCases.workshopId], references: [workshops.id] }),
  roiModel: one(roiModels),
  workflow: one(workflows, { fields: [useCases.workflowId], references: [workflows.id] }),
}));
