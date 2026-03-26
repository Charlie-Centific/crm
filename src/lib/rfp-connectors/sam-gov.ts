/**
 * SAM.gov Opportunities v2 connector.
 * Docs: https://open.gsa.gov/api/get-opportunities-public-api/
 * Endpoint: https://api.sam.gov/opportunities/v2/search
 *
 * Free API key: register at https://sam.gov/profile/details → API Keys tab.
 * Key is emailed instantly; no .gov address required.
 */
import { RfpListingRaw, SourceFilters, mmddyyyy, toIsoDate } from "./types";

const BASE = "https://api.sam.gov/opportunities/v2/search";

interface SamOpportunity {
  noticeId?:                    string;
  solicitationNumber?:          string;
  title?:                       string;
  fullParentPathName?:          string;
  postedDate?:                  string;
  responseDeadLine?:            string;
  archiveDate?:                 string;
  naicsCode?:                   string;
  typeOfSetAsideDescription?:   string;
  typeOfSetAside?:              string;
  description?:                 string;
  uiLink?:                      string;
  type?:                        string;
  baseType?:                    string;
  active?:                      string;
  award?: {
    amount?: number | string | null;
  };
}

interface SamResponse {
  totalRecords?: number;
  opportunitiesData?: SamOpportunity[];
}

export async function syncSamGov(
  apiKey: string,
  filters: SourceFilters
): Promise<RfpListingRaw[]> {
  const today     = new Date();
  const thirtyAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    api_key:    apiKey,
    postedFrom: mmddyyyy(thirtyAgo),
    postedTo:   mmddyyyy(today),
    limit:      "100",
    offset:     "0",
    // ptype=o returns solicitations; leave blank for all notice types
  });

  if (filters.keywords.length > 0) {
    params.set("keywords", filters.keywords.join(" "));
  }
  if (filters.naicsCodes.length > 0) {
    // SAM.gov v2 accepts comma-separated NAICS codes
    params.set("naicsCode", filters.naicsCodes.join(","));
  }

  const url = `${BASE}?${params}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "VAI-SalesBuddy/1.0" },
    cache: "no-store",
  });

  if (res.status === 401) throw new Error("SAM.gov: invalid or missing API key");
  if (res.status === 429) throw new Error("SAM.gov: rate limit exceeded — try again later");
  if (!res.ok)           throw new Error(`SAM.gov API error: HTTP ${res.status}`);

  const body: SamResponse = await res.json();
  const items = body.opportunitiesData ?? [];

  // Filter to only active records (skip if archived/cancelled)
  return items
    .filter((o) => o.active !== "No")
    .map((o): RfpListingRaw => ({
      externalId:  o.noticeId ?? o.solicitationNumber ?? String(Math.random()),
      title:       o.title ?? "Untitled",
      description: o.description ?? null,
      agency:      o.fullParentPathName?.split(".")?.at(0) ?? null,
      naicsCode:   o.naicsCode ?? null,
      setAside:    o.typeOfSetAsideDescription ?? o.typeOfSetAside ?? null,
      postedDate:  toIsoDate(o.postedDate),
      dueDate:     toIsoDate(o.responseDeadLine ?? o.archiveDate),
      valueMin:    null,
      valueMax:    o.award?.amount ? Number(o.award.amount) : null,
      url:         o.uiLink ?? null,
      rawData:     JSON.stringify(o),
    }));
}
