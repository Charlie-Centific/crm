import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatCurrency, daysInStage, relativeTime, VERTICAL_LABELS, STAGE_LABELS, SOURCE_LABELS } from "../utils";

describe("formatCurrency", () => {
  it("formats a number correctly", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000");
  });

  it("formats a string number", () => {
    expect(formatCurrency("500000")).toBe("$500,000");
  });

  it("returns — for null", () => {
    expect(formatCurrency(null)).toBe("—");
  });

  it("returns — for NaN string", () => {
    expect(formatCurrency("not-a-number")).toBe("—");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("drops decimal places", () => {
    expect(formatCurrency(1234.99)).toBe("$1,235");
  });

  it("handles large TCV values seen in the DB", () => {
    expect(formatCurrency(5890000)).toBe("$5,890,000");
  });
});

describe("daysInStage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-25T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 for null", () => {
    expect(daysInStage(null)).toBe(0);
  });

  it("returns 0 for today", () => {
    expect(daysInStage("2026-03-25T12:00:00Z")).toBe(0);
  });

  it("returns 7 for a date 7 days ago", () => {
    expect(daysInStage("2026-03-18T12:00:00Z")).toBe(7);
  });

  it("returns 14 for a date 14 days ago", () => {
    expect(daysInStage("2026-03-11T12:00:00Z")).toBe(14);
  });

  it("accepts string ISO date", () => {
    expect(daysInStage("2026-03-15")).toBeGreaterThanOrEqual(9);
  });
});

describe("relativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-25T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "never" for null', () => {
    expect(relativeTime(null)).toBe("never");
  });

  it("returns a string for a valid date", () => {
    const result = relativeTime("2026-03-24T12:00:00Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("mentions days ago for a date in the past", () => {
    const result = relativeTime("2026-03-20T12:00:00Z");
    expect(result).toMatch(/ago/);
  });
});

describe("label maps", () => {
  it("VERTICAL_LABELS covers all verticals", () => {
    const verticals = ["transit", "utilities", "emergency", "smart_city", "other"];
    for (const v of verticals) {
      expect(VERTICAL_LABELS[v]).toBeTruthy();
    }
  });

  it("STAGE_LABELS covers all stages", () => {
    const stages = ["lead", "discovery", "demo", "workshop", "pilot_start", "pilot_close", "closed_won", "closed_lost"];
    for (const s of stages) {
      expect(STAGE_LABELS[s]).toBeTruthy();
    }
  });

  it("SOURCE_LABELS covers all lead sources", () => {
    const sources = ["conference", "partner", "direct", "inbound"];
    for (const s of sources) {
      expect(SOURCE_LABELS[s]).toBeTruthy();
    }
  });
});
