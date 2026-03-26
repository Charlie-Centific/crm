import { describe, it, expect } from "vitest";
import { PLAYBOOK_META, getPlaybookByVertical } from "../playbooks";

describe("PLAYBOOK_META", () => {
  it("has 3 entries", () => {
    expect(PLAYBOOK_META).toHaveLength(3);
  });

  it("every entry has slug, vertical, label, description, color", () => {
    for (const p of PLAYBOOK_META) {
      expect(p.slug).toBeTruthy();
      expect(p.vertical).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.color).toBeTruthy();
    }
  });

  it("slugs are URL-safe (lowercase, hyphens only)", () => {
    for (const p of PLAYBOOK_META) {
      expect(p.slug).toMatch(/^[a-z-]+$/);
    }
  });

  it("verticals match known schema values", () => {
    const validVerticals = ["transit", "utilities", "emergency", "smart_city", "other"];
    for (const p of PLAYBOOK_META) {
      expect(validVerticals).toContain(p.vertical);
    }
  });
});

describe("getPlaybookByVertical", () => {
  it("returns the transit playbook for 'transit'", () => {
    const p = getPlaybookByVertical("transit");
    expect(p).not.toBeNull();
    expect(p?.label).toBe("Transit");
  });

  it("returns the emergency playbook for 'emergency'", () => {
    const p = getPlaybookByVertical("emergency");
    expect(p?.label).toBe("Emergency Services");
  });

  it("returns the smart city playbook for 'smart_city'", () => {
    const p = getPlaybookByVertical("smart_city");
    expect(p?.label).toBe("Smart City");
  });

  it("returns null for 'utilities' (no playbook yet)", () => {
    expect(getPlaybookByVertical("utilities")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getPlaybookByVertical("")).toBeNull();
  });

  it("returns null for an unknown vertical", () => {
    expect(getPlaybookByVertical("aerospace")).toBeNull();
  });
});
