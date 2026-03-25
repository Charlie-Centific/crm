import {
  pgTable,
  text,
  varchar,
  numeric,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const verticalEnum = pgEnum("vertical", [
  "transit",
  "utilities",
  "emergency",
  "smart_city",
  "other",
]);

export const stageEnum = pgEnum("stage", [
  "lead",
  "discovery",
  "demo",
  "workshop",
  "pilot_start",
  "pilot_close",
  "closed_won",
  "closed_lost",
]);

export const leadSourceEnum = pgEnum("lead_source", [
  "conference",
  "partner",
  "direct",
  "inbound",
]);

export const workshopStatusEnum = pgEnum("workshop_status", [
  "planned",
  "in_progress",
  "completed",
  "report_generated",
]);

export const pilotStatusEnum = pgEnum("pilot_status", [
  "active",
  "at_risk",
  "converted",
  "lost",
]);

// ─── Accounts ─────────────────────────────────────────────────────────────────

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  dynamicsId: varchar("dynamics_id", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  vertical: verticalEnum("vertical"),
  website: varchar("website", { length: 255 }),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  employeeCount: integer("employee_count"),
  notes: text("notes"),
  dynamicsData: jsonb("dynamics_data"), // raw Dynamics payload for reference
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  dynamicsId: varchar("dynamics_id", { length: 255 }).unique(),
  accountId: uuid("account_id").references(() => accounts.id, {
    onDelete: "cascade",
  }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  linkedin: varchar("linkedin", { length: 255 }),
  isPrimary: boolean("is_primary").default(false),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Opportunities ────────────────────────────────────────────────────────────

export const opportunities = pgTable("opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  dynamicsId: varchar("dynamics_id", { length: 255 }).unique(),
  accountId: uuid("account_id").references(() => accounts.id, {
    onDelete: "cascade",
  }),
  name: varchar("name", { length: 255 }).notNull(),
  stage: stageEnum("stage").default("lead"),
  value: numeric("value", { precision: 15, scale: 2 }),
  closeDate: timestamp("close_date"),
  leadSource: leadSourceEnum("lead_source"),
  leadSourceDetail: varchar("lead_source_detail", { length: 255 }), // e.g. conference name
  ownerEmail: varchar("owner_email", { length: 255 }),
  ownerName: varchar("owner_name", { length: 255 }),
  stageChangedAt: timestamp("stage_changed_at"),
  lastActivityAt: timestamp("last_activity_at"),
  nextAction: text("next_action"),
  dynamicsData: jsonb("dynamics_data"),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Activities (notes, emails, calls) ───────────────────────────────────────

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  dynamicsId: varchar("dynamics_id", { length: 255 }).unique(),
  accountId: uuid("account_id").references(() => accounts.id, {
    onDelete: "cascade",
  }),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id, {
    onDelete: "cascade",
  }),
  type: varchar("type", { length: 50 }).notNull(), // note | email | call | meeting
  subject: varchar("subject", { length: 255 }),
  body: text("body"),
  authorName: varchar("author_name", { length: 255 }),
  authorEmail: varchar("author_email", { length: 255 }),
  occurredAt: timestamp("occurred_at"),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Sync Log ─────────────────────────────────────────────────────────────────

export const syncLog = pgTable("sync_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // account | opportunity | contact | activity
  status: varchar("status", { length: 20 }).notNull(), // success | failed | partial
  recordsFetched: integer("records_fetched").default(0),
  recordsUpserted: integer("records_upserted").default(0),
  errorMessage: text("error_message"),
  syncType: varchar("sync_type", { length: 20 }).default("delta"), // full | delta
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// ─── Workshops ────────────────────────────────────────────────────────────────

export const workshops = pgTable("workshops", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .references(() => accounts.id, { onDelete: "cascade" })
    .notNull(),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id),
  status: workshopStatusEnum("status").default("planned"),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  facilitatorName: varchar("facilitator_name", { length: 255 }),
  facilitatorEmail: varchar("facilitator_email", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Workshop Attendees ───────────────────────────────────────────────────────

export const workshopAttendees = pgTable("workshop_attendees", {
  id: uuid("id").primaryKey().defaultRandom(),
  workshopId: uuid("workshop_id")
    .references(() => workshops.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }),
  email: varchar("email", { length: 255 }),
  isProspect: boolean("is_prospect").default(true), // false = internal team
});

// ─── Use Cases ────────────────────────────────────────────────────────────────

export const useCases = pgTable("use_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  workshopId: uuid("workshop_id")
    .references(() => workshops.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  agentType: varchar("agent_type", { length: 255 }),
  businessOwnerName: varchar("business_owner_name", { length: 255 }),
  businessOwnerEmail: varchar("business_owner_email", { length: 255 }),
  technicalOwnerName: varchar("technical_owner_name", { length: 255 }),
  technicalOwnerEmail: varchar("technical_owner_email", { length: 255 }),
  impactScore: integer("impact_score"), // 1-5
  feasibilityScore: integer("feasibility_score"), // 1-5
  alignmentScore: integer("alignment_score"), // 1-5
  compositeScore: numeric("composite_score", { precision: 5, scale: 2 }),
  rank: integer("rank"),
  isFinalized: boolean("is_finalized").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── ROI Models ───────────────────────────────────────────────────────────────

export const roiModels = pgTable("roi_models", {
  id: uuid("id").primaryKey().defaultRandom(),
  useCaseId: uuid("use_case_id")
    .references(() => useCases.id, { onDelete: "cascade" })
    .notNull(),
  currentStateMetric: varchar("current_state_metric", { length: 255 }),
  targetStateMetric: varchar("target_state_metric", { length: 255 }),
  unit: varchar("unit", { length: 100 }), // hours_saved | incidents_reduced | cost_avoided
  estimatedAnnualValue: numeric("estimated_annual_value", {
    precision: 15,
    scale: 2,
  }),
  timeToValueMonths: integer("time_to_value_months"),
  confidenceLevel: integer("confidence_level"), // 1-5
  narrative: text("narrative"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Pilot Plans ──────────────────────────────────────────────────────────────

export const pilotPlans = pgTable("pilot_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  workshopId: uuid("workshop_id")
    .references(() => workshops.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  accountId: uuid("account_id")
    .references(() => accounts.id)
    .notNull(),
  kickoffDate: timestamp("kickoff_date"),
  targetCloseDate: timestamp("target_close_date"), // kickoff + 90 days
  successCriteria: jsonb("success_criteria"), // string[]
  hardwareNotes: text("hardware_notes"),
  cloudNotes: text("cloud_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Pilots (Phase 4 tracker) ─────────────────────────────────────────────────

export const pilots = pgTable("pilots", {
  id: uuid("id").primaryKey().defaultRandom(),
  pilotPlanId: uuid("pilot_plan_id").references(() => pilotPlans.id),
  accountId: uuid("account_id")
    .references(() => accounts.id)
    .notNull(),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id),
  status: pilotStatusEnum("status").default("active"),
  kickoffDate: timestamp("kickoff_date").notNull(),
  targetCloseDate: timestamp("target_close_date").notNull(),
  actualCloseDate: timestamp("actual_close_date"),
  closedRevenue: numeric("closed_revenue", { precision: 15, scale: 2 }),
  lossReason: text("loss_reason"),
  // Milestones stored as flags
  milestoneKickoffDone: boolean("milestone_kickoff_done").default(false),
  milestoneFirstUseCaseLive: boolean("milestone_first_use_case_live").default(
    false
  ),
  milestoneMidpointCheckin: boolean("milestone_midpoint_checkin").default(
    false
  ),
  milestoneSuccessCriteriaReviewed: boolean(
    "milestone_success_criteria_reviewed"
  ).default(false),
  milestoneCloseConversationStarted: boolean(
    "milestone_close_conversation_started"
  ).default(false),
  ownerName: varchar("owner_name", { length: 255 }),
  ownerEmail: varchar("owner_email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Value Reports ────────────────────────────────────────────────────────────

export const valueReports = pgTable("value_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  workshopId: uuid("workshop_id")
    .references(() => workshops.id, { onDelete: "cascade" })
    .notNull(),
  accountId: uuid("account_id")
    .references(() => accounts.id)
    .notNull(),
  version: integer("version").default(1),
  content: text("content").notNull(), // full markdown
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at"),
});

// ─── Pre-call Briefs ──────────────────────────────────────────────────────────

export const preCallBriefs = pgTable("pre_call_briefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .references(() => accounts.id, { onDelete: "cascade" })
    .notNull(),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id),
  content: text("content").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at"),
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

export const opportunityRelations = relations(
  opportunities,
  ({ one, many }) => ({
    account: one(accounts, {
      fields: [opportunities.accountId],
      references: [accounts.id],
    }),
    activities: many(activities),
  })
);

export const workshopRelations = relations(workshops, ({ one, many }) => ({
  account: one(accounts, {
    fields: [workshops.accountId],
    references: [accounts.id],
  }),
  opportunity: one(opportunities, {
    fields: [workshops.opportunityId],
    references: [opportunities.id],
  }),
  attendees: many(workshopAttendees),
  useCases: many(useCases),
  pilotPlan: one(pilotPlans),
  valueReports: many(valueReports),
}));

export const useCaseRelations = relations(useCases, ({ one }) => ({
  workshop: one(workshops, {
    fields: [useCases.workshopId],
    references: [workshops.id],
  }),
  roiModel: one(roiModels),
}));
