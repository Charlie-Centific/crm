import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cn, formatCurrency, daysInStage, relativeTime, VERTICAL_LABELS, STAGE_LABELS, SOURCE_LABELS } from "../utils";

describe("cn", () => {
  it("returns a string", () => {
    expect(typeof cn("foo", "bar")).toBe("string");
  });

  it("joins multiple class strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("omits falsy values", () => {
    expect(cn("base", false && "hidden", undefined, null as unknown as string, "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    // twMerge: later p-4 overrides p-2
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("supports conditional classes via object syntax", () => {
    expect(cn({ "font-bold": true, "font-normal": false })).toBe("font-bold");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });
});

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

  it("returns a negative or 0 for a future date", () => {
    // stage_changed_at in the future means just entered (shouldn't happen in prod, but guard)
    expect(daysInStage("2026-03-26T12:00:00Z")).toBeLessThanOrEqual(0);
  });

  it("returns a large number for dates far in the past", () => {
    expect(daysInStage("2025-01-01T00:00:00Z")).toBeGreaterThan(80);
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

  it("returns 'in ...' for a future date", () => {
    const result = relativeTime("2026-04-10T12:00:00Z");
    expect(result).toMatch(/^in /);
  });

  it("returns a non-empty string for a Date object", () => {
    const result = relativeTime(new Date("2026-03-24T12:00:00Z"));
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
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
