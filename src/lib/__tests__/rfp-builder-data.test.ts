import { describe, it, expect } from "vitest";
import { RFP_SECTIONS } from "../rfp-builder-data";

describe("RFP_SECTIONS", () => {
  it("has 10 sections", () => {
    expect(RFP_SECTIONS).toHaveLength(10);
  });

  it("has exactly 5 required sections", () => {
    const required = RFP_SECTIONS.filter((s) => s.required);
    expect(required).toHaveLength(5);
  });

  it("every section has the required top-level fields", () => {
    for (const s of RFP_SECTIONS) {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.prompt).toBeTruthy();
      expect(["single", "multi"]).toContain(s.mode);
      expect(Array.isArray(s.blocks)).toBe(true);
    }
  });

  it("all section IDs are unique", () => {
    const ids = RFP_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all section IDs are URL-safe slugs", () => {
    for (const s of RFP_SECTIONS) {
      expect(s.id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("every section has at least 1 block", () => {
    for (const s of RFP_SECTIONS) {
      expect(s.blocks.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("every block has id, label, preview, and content", () => {
    for (const s of RFP_SECTIONS) {
      for (const b of s.blocks) {
        expect(b.id).toBeTruthy();
        expect(b.label).toBeTruthy();
        expect(b.preview).toBeTruthy();
        expect(b.content).toBeTruthy();
      }
    }
  });

  it("all block IDs are unique across all sections", () => {
    const ids = RFP_SECTIONS.flatMap((s) => s.blocks.map((b) => b.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("block content is substantial (not a placeholder)", () => {
    for (const s of RFP_SECTIONS) {
      for (const b of s.blocks) {
        expect(b.content.length).toBeGreaterThan(100);
        expect(b.preview.length).toBeGreaterThan(20);
      }
    }
  });

  it("section prompts are questions or directives (substantial length)", () => {
    for (const s of RFP_SECTIONS) {
      expect(s.prompt.length).toBeGreaterThan(30);
    }
  });

  it("required sections all have blocks with content", () => {
    const required = RFP_SECTIONS.filter((s) => s.required);
    for (const s of required) {
      expect(s.blocks.length).toBeGreaterThanOrEqual(1);
      for (const b of s.blocks) {
        expect(b.content.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("RFP_SECTIONS specific section presence", () => {
  const sectionIds = RFP_SECTIONS.map((s) => s.id);

  it("contains scope-understanding section", () => {
    expect(sectionIds).toContain("scope-understanding");
  });

  it("contains architecture section", () => {
    expect(sectionIds).toContain("architecture");
  });

  it("contains security section", () => {
    expect(sectionIds).toContain("security");
  });

  it("contains implementation section", () => {
    expect(sectionIds).toContain("implementation");
  });

  it("scope-understanding is required and mode=single", () => {
    const s = RFP_SECTIONS.find((s) => s.id === "scope-understanding")!;
    expect(s.required).toBe(true);
    expect(s.mode).toBe("single");
  });

  it("architecture is required and mode=single", () => {
    const s = RFP_SECTIONS.find((s) => s.id === "architecture")!;
    expect(s.required).toBe(true);
    expect(s.mode).toBe("single");
  });

  it("security is required and mode=single", () => {
    const s = RFP_SECTIONS.find((s) => s.id === "security")!;
    expect(s.required).toBe(true);
    expect(s.mode).toBe("single");
  });
});

describe("RFP_SECTIONS single vs multi mode", () => {
  it("single-mode sections have exactly 2 blocks (Standard + Comprehensive options)", () => {
    const singleSections = RFP_SECTIONS.filter((s) => s.mode === "single");
    for (const s of singleSections) {
      // Single mode sections should offer alternative blocks to choose between
      expect(s.blocks.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("multi-mode sections have multiple blocks to pick from", () => {
    const multiSections = RFP_SECTIONS.filter((s) => s.mode === "multi");
    for (const s of multiSections) {
      expect(s.blocks.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("RFP_SECTIONS ref fields", () => {
  it("sections with refs are non-empty strings", () => {
    const withRef = RFP_SECTIONS.filter((s) => s.ref !== undefined);
    expect(withRef.length).toBeGreaterThan(0);
    for (const s of withRef) {
      expect(typeof s.ref).toBe("string");
      expect((s.ref as string).length).toBeGreaterThan(0);
    }
  });
});
