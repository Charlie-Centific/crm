/**
 * Column name mappings for standard Dynamics 365 Excel exports.
 *
 * Dynamics exports use display names that vary slightly by org config.
 * Each array lists known variants — the importer tries them in order.
 *
 * To add a new column variant: just append to the array.
 */

export const ACCOUNT_COLUMNS = {
  dynamicsId: ["Account", "accountid", "Account ID", "Id"],
  name: ["Account Name", "name", "Company Name", "Organization Name"],
  website: ["Website", "websiteurl", "Web Site"],
  city: ["City", "address1_city", "Address 1: City"],
  state: ["State/Province", "address1_stateorprovince", "State", "Province"],
  country: ["Country/Region", "address1_country", "Country"],
  employeeCount: ["Number of Employees", "numberofemployees", "Employees"],
  vertical: ["Industry", "industrycode", "Vertical", "Sector"],
} as const;

export const CONTACT_COLUMNS = {
  dynamicsId: ["Contact", "contactid", "Contact ID", "Id"],
  firstName: ["First Name", "firstname"],
  lastName: ["Last Name", "lastname", "Surname"],
  role: ["Job Title", "jobtitle", "Title", "Role"],
  email: ["Email", "emailaddress1", "Email Address", "Business Email"],
  phone: ["Business Phone", "telephone1", "Phone", "Mobile Phone"],
  accountName: ["Company Name", "Account Name", "parentcustomerid", "Account"],
} as const;

export const OPPORTUNITY_COLUMNS = {
  dynamicsId: ["Opportunity", "opportunityid", "Opportunity ID", "Id"],
  name: ["Topic", "name", "Opportunity Name", "Subject"],
  accountName: ["Account Name", "parentaccountid", "Company", "Account"],
  stage: ["Sales Stage", "stepname", "Stage", "Pipeline Stage", "Process Stage"],
  value: ["Est. Revenue", "estimatedvalue", "Revenue", "Estimated Revenue", "Value"],
  closeDate: ["Est. Close Date", "estimatedclosedate", "Close Date", "Expected Close"],
  leadSource: ["Lead Source", "leadsourcecode", "Source"],
  ownerName: ["Owner", "ownerid", "Assigned To", "Sales Rep"],
} as const;

// Vertical inference from Dynamics Industry field values
const VERTICAL_MAP: Record<string, string> = {
  "Transportation": "transit",
  "Transportation/Communication/Electric/Gas/Sanitary Service": "utilities",
  "Public Administration": "smart_city",
  "Electric, Gas, and Sanitary Services": "utilities",
  "Municipal Government": "smart_city",
  "State Government": "smart_city",
  "Federal Government": "smart_city",
  "Emergency Services": "emergency",
  "Public Safety": "emergency",
  "Mass Transit": "transit",
  "Rail Transportation": "transit",
  "Local and Suburban Transit": "transit",
  "Water Supply": "utilities",
  "Electric Services": "utilities",
  "Gas Production and Distribution": "utilities",
};

const VERTICAL_KEYWORDS: Record<string, string[]> = {
  transit: ["transit", "transport", "bus", "rail", "metro", "mta", "rtd", "bart", "subway", "commute"],
  utilities: ["utility", "utilities", "electric", "water", "gas", "power", "energy", "sanitary"],
  emergency: ["emergency", "911", "dispatch", "fire", "police", "safety", "ems", "first responder"],
  smart_city: ["smart city", "municipality", "city of", "county of", "town of", "government", "gov", "municipal"],
};

export function inferVertical(raw: string | null | undefined): string {
  if (!raw) return "other";
  const mapped = VERTICAL_MAP[raw.trim()];
  if (mapped) return mapped;
  const lower = raw.toLowerCase();
  for (const [vertical, keywords] of Object.entries(VERTICAL_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return vertical;
  }
  return "other";
}

// Stage inference from Dynamics step names
const STAGE_MAP: Record<string, string> = {
  "qualify": "lead",
  "lead": "lead",
  "develop": "discovery",
  "discovery": "discovery",
  "propose": "demo",
  "demo": "demo",
  "workshop": "workshop",
  "close": "pilot_close",
  "pilot": "pilot_start",
  "pilot start": "pilot_start",
  "pilot close": "pilot_close",
  "won": "closed_won",
  "closed won": "closed_won",
  "lost": "closed_lost",
  "closed lost": "closed_lost",
};

export function inferStage(raw: string | null | undefined): string {
  if (!raw) return "lead";
  const lower = raw.toLowerCase().trim();
  for (const [key, stage] of Object.entries(STAGE_MAP)) {
    if (lower.includes(key)) return stage;
  }
  return "lead";
}

// Lead source inference
export function inferLeadSource(raw: string | null | undefined): string {
  if (!raw) return "direct";
  const lower = raw.toLowerCase();
  if (lower.includes("conference") || lower.includes("trade show") || lower.includes("event")) return "conference";
  if (lower.includes("partner") || lower.includes("referral")) return "partner";
  if (lower.includes("web") || lower.includes("inbound") || lower.includes("marketing")) return "inbound";
  return "direct";
}

// Find the value of a column by trying multiple known header variants
export function getCol(
  row: Record<string, string>,
  variants: readonly string[]
): string | null {
  for (const v of variants) {
    if (v in row && row[v] !== undefined && row[v] !== "") {
      return row[v].trim();
    }
  }
  return null;
}
