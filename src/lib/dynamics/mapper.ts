/**
 * Maps raw Dynamics 365 API payloads to our local DB schema shapes.
 * All fields are explicitly mapped so we catch breaking Dynamics changes early.
 */

type Vertical = "transit" | "utilities" | "emergency" | "smart_city" | "other";
type Stage = "lead" | "discovery" | "demo" | "workshop" | "pilot_start" | "pilot_close" | "closed_won" | "closed_lost";
type LeadSource = "conference" | "partner" | "direct" | "inbound";

// ─── Vertical detection from account industry / name ──────────────────────────

const VERTICAL_KEYWORDS: Record<string, string[]> = {
  transit: ["transit", "transport", "bus", "rail", "metro", "mta", "rtd", "bart"],
  utilities: ["utility", "utilities", "electric", "water", "gas", "power", "energy"],
  emergency: ["emergency", "911", "dispatch", "fire", "police", "public safety", "ems"],
  smart_city: ["smart city", "municipality", "city of", "county", "town of", "gov"],
};

function inferVertical(name: string, description?: string): Vertical {
  const text = `${name} ${description ?? ""}`.toLowerCase();
  for (const [vertical, keywords] of Object.entries(VERTICAL_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return vertical as Vertical;
  }
  return "other";
}

// ─── Stage mapping from Dynamics step names ────────────────────────────────────

const STAGE_MAP: Record<string, string> = {
  "1-lead": "lead",
  lead: "lead",
  "2-discovery": "discovery",
  discovery: "discovery",
  "3-demo": "demo",
  demo: "demo",
  "4-workshop": "workshop",
  workshop: "workshop",
  "5-pilot start": "pilot_start",
  "pilot start": "pilot_start",
  "6-pilot close": "pilot_close",
  "pilot close": "pilot_close",
  won: "closed_won",
  closed: "closed_won",
  lost: "closed_lost",
};

function mapStage(stepname: string | null | undefined): Stage {
  if (!stepname) return "lead";
  const key = stepname.toLowerCase().trim();
  return (STAGE_MAP[key] ?? "lead") as Stage;
}

// ─── Lead source mapping ───────────────────────────────────────────────────────

const LEAD_SOURCE_MAP: Record<number, string> = {
  1: "inbound",   // Advertisement
  2: "inbound",   // Employee Referral
  3: "partner",   // External Referral
  4: "conference", // Partner
  5: "conference", // Public Relations
  6: "direct",    // Seminar/Conference
  7: "direct",    // Trade Show
  8: "inbound",   // Web
  9: "direct",    // Word of Mouth
  10: "direct",   // Other
};

function mapLeadSource(code: number | null | undefined): LeadSource {
  if (code == null) return "direct";
  return (LEAD_SOURCE_MAP[code] ?? "direct") as LeadSource;
}

// ─── Public mappers ───────────────────────────────────────────────────────────

export function mapAccount(raw: Record<string, unknown>) {
  return {
    dynamicsId: raw["accountid"] as string,
    name: (raw["name"] as string) ?? "Unknown",
    vertical: inferVertical(
      raw["name"] as string,
      raw["description"] as string | undefined
    ),
    website: (raw["websiteurl"] as string | null) ?? null,
    city: (raw["address1_city"] as string | null) ?? null,
    state: (raw["address1_stateorprovince"] as string | null) ?? null,
    country: (raw["address1_country"] as string | null) ?? null,
    employeeCount: (raw["numberofemployees"] as number | null) ?? null,
    notes: (raw["description"] as string | null) ?? null,
    dynamicsData: raw,
    lastSyncedAt: new Date(),
    updatedAt: new Date(),
  };
}

export function mapContact(raw: Record<string, unknown>) {
  return {
    dynamicsId: raw["contactid"] as string,
    accountDynamicsId: raw["_parentcustomerid_value"] as string | null,
    firstName: (raw["firstname"] as string | null) ?? null,
    lastName: (raw["lastname"] as string) ?? "",
    role: (raw["jobtitle"] as string | null) ?? null,
    email: (raw["emailaddress1"] as string | null) ?? null,
    phone: (raw["telephone1"] as string | null) ?? null,
    lastSyncedAt: new Date(),
    updatedAt: new Date(),
  };
}

export function mapOpportunity(raw: Record<string, unknown>) {
  const owner = raw["ownerid"] as Record<string, string> | null;

  return {
    dynamicsId: raw["opportunityid"] as string,
    accountDynamicsId: raw["_parentaccountid_value"] as string | null,
    name: (raw["name"] as string) ?? "Unknown",
    stage: mapStage(raw["stepname"] as string | null),
    value: raw["estimatedvalue"] != null
      ? String(raw["estimatedvalue"])
      : null,
    closeDate: raw["estimatedclosedate"]
      ? new Date(raw["estimatedclosedate"] as string)
      : null,
    leadSource: mapLeadSource(raw["leadsourcecode"] as number | null),
    ownerName: owner?.["fullname"] ?? null,
    ownerEmail: owner?.["internalemailaddress"] ?? null,
    stageChangedAt: new Date(), // Dynamics doesn't expose this directly
    lastActivityAt: raw["modifiedon"]
      ? new Date(raw["modifiedon"] as string)
      : null,
    dynamicsData: raw,
    lastSyncedAt: new Date(),
    updatedAt: new Date(),
  };
}

export function mapActivity(raw: Record<string, unknown>) {
  const typeMap: Record<string, string> = {
    email: "email",
    phonecall: "call",
    appointment: "meeting",
    task: "note",
    annotation: "note",
  };

  return {
    dynamicsId: raw["activityid"] as string,
    type: typeMap[raw["activitytypecode"] as string] ?? "note",
    subject: (raw["subject"] as string | null) ?? null,
    body: (raw["description"] as string | null) ?? null,
    occurredAt: raw["scheduledstart"]
      ? new Date(raw["scheduledstart"] as string)
      : raw["modifiedon"]
      ? new Date(raw["modifiedon"] as string)
      : null,
    lastSyncedAt: new Date(),
  };
}
