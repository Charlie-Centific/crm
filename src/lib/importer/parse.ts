/**
 * Server-side CSV parsing for Dynamics 365 exports.
 * Accepts raw CSV text and returns structured rows.
 */

import Papa from "papaparse";

export interface ParseResult {
  rows: Record<string, string>[];
  headers: string[];
  errors: string[];
}

export function parseCsv(csvText: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  });

  const errors = result.errors.map(
    (e) => `Row ${e.row ?? "?"}: ${e.message}`
  );

  return {
    rows: result.data,
    headers: result.meta.fields ?? [],
    errors,
  };
}
