/**
 * SBIR.gov connector — no credentials required.
 * Docs: https://www.sbir.gov/api
 * Endpoint: https://www.sbir.gov/api/solicitations.json
 */
import { RfpListingRaw, SourceFilters, toIsoDate } from "./types";

const BASE = "https://www.sbir.gov/api/solicitations.json";

// Shape returned by the SBIR.gov API (fields may be absent)
interface SbirSolicitation {
  solicitation_id?:     number | string;
  solicitation_number?: string;
  solicitation_title?:  string;
  title?:               string;
  program?:             string;
  phase?:               string;
  agency?:              string;
  branch?:              string;
  solicitation_year?:   number | string;
  open_date?:           string;
  close_date?:          string;
  description?:         string;
  program_description?: string;
  solicitation_agency_url?: string;
  url?:                 string;
  award_ceiling?:       number | string | null;
  award_floor?:         number | string | null;
}

export async function syncSbir(filters: SourceFilters): Promise<RfpListingRaw[]> {
  const params = new URLSearchParams();
  if (filters.keywords.length > 0) params.set("keyword", filters.keywords.join(" "));
  params.set("open", "1");
  params.set("rows", "50");

  const url = `${BASE}?${params}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "VAI-SalesBuddy/1.0" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`SBIR API error: HTTP ${res.status}`);

  const raw = await res.json();

  // The API may return an array directly or wrap it
  const items: SbirSolicitation[] = Array.isArray(raw)
    ? raw
    : (raw.solicitations ?? raw.results ?? raw.data ?? []);

  return items.map((item): RfpListingRaw => {
    const id = String(item.solicitation_id ?? item.solicitation_number ?? Math.random());
    const title = item.solicitation_title ?? item.title ?? "Untitled Solicitation";
    const agency = [item.agency, item.branch].filter(Boolean).join(" / ") || null;

    return {
      externalId:  id,
      title,
      description: item.description ?? item.program_description ?? null,
      agency,
      naicsCode:   null,
      setAside:    item.program ?? null,
      postedDate:  toIsoDate(item.open_date),
      dueDate:     toIsoDate(item.close_date),
      valueMin:    item.award_floor   ? Number(item.award_floor)   : null,
      valueMax:    item.award_ceiling ? Number(item.award_ceiling) : null,
      url:         item.solicitation_agency_url ?? item.url ?? null,
      rawData:     JSON.stringify(item),
    };
  });
}
