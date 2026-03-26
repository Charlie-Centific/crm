/** Normalised RFP listing that every connector must return. */
export interface RfpListingRaw {
  externalId:  string;
  title:       string;
  description: string | null;
  agency:      string | null;
  naicsCode:   string | null;
  setAside:    string | null;
  postedDate:  string | null;  // ISO date string
  dueDate:     string | null;  // ISO date string
  valueMin:    number | null;
  valueMax:    number | null;
  url:         string | null;
  rawData:     string;         // JSON.stringify of the original record
}

/** Filters parsed from the source.filters JSON field */
export interface SourceFilters {
  keywords:   string[];
  naicsCodes: string[];
  agencies:   string[];
  setAsides:  string[];
  valueMin:   number | null;
  valueMax:   number | null;
}

export function parseFilters(filtersJson: string): SourceFilters {
  try {
    return JSON.parse(filtersJson);
  } catch {
    return { keywords: [], naicsCodes: [], agencies: [], setAsides: [], valueMin: null, valueMax: null };
  }
}

/** Format a date as MM/DD/YYYY for APIs that need it */
export function mmddyyyy(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

/** Coerce any date string to YYYY-MM-DD or return null */
export function toIsoDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    return new Date(raw).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}
