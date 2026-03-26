import { describe, it, expect } from "vitest";
import { getPlaybook, ALL_PLAYBOOKS, PLAYBOOKS } from "../playbook-data";

const EXPECTED_SLUGS = ["smart-city", "transit", "emergency"];

describe("ALL_PLAYBOOKS", () => {
  it("has exactly 3 playbooks", () => {
    expect(ALL_PLAYBOOKS).toHaveLength(3);
  });

  it("contains smart-city, transit, and emergency", () => {
    const slugs = ALL_PLAYBOOKS.map((p) => p.slug);
    for (const slug of EXPECTED_SLUGS) {
      expect(slugs).toContain(slug);
    }
  });
});

describe("getPlaybook", () => {
  it("returns the correct playbook by slug", () => {
    const p = getPlaybook("transit");
    expect(p).not.toBeNull();
    expect(p?.label).toBe("Transit");
    expect(p?.vertical).toBe("transit");
  });

  it("returns null for an unknown slug", () => {
    expect(getPlaybook("unknown-vertical")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getPlaybook("")).toBeNull();
  });
});

describe("playbook data integrity", () => {
  for (const slug of EXPECTED_SLUGS) {
    describe(`${slug} playbook`, () => {
      const p = PLAYBOOKS[slug]!;

      it("has required top-level fields", () => {
        expect(p.slug).toBeTruthy();
        expect(p.vertical).toBeTruthy();
        expect(p.label).toBeTruthy();
        expect(p.tagline).toBeTruthy();
        expect(p.buyer).toBeTruthy();
        expect(p.overview).toBeTruthy();
      });

      it("has at least 3 discovery questions", () => {
        expect(p.discovery.length).toBeGreaterThanOrEqual(3);
      });

      it("every discovery question has all required fields", () => {
        for (const q of p.discovery) {
          expect(q.id).toBeTruthy();
          expect(q.question).toBeTruthy();
          expect(q.intent).toBeTruthy();
          // whenHit
          expect(q.whenHit.signal).toBeTruthy();
          expect(q.whenHit.response).toBeTruthy();
          expect(q.whenHit.bridge).toBeTruthy();
          expect(q.whenHit.capability).toBeTruthy();
          // whenMiss
          expect(q.whenMiss.signal).toBeTruthy();
          expect(q.whenMiss.redirect).toBeTruthy();
          expect(q.whenMiss.probe).toBeTruthy();
        }
      });

      it("has at least 3 pain points", () => {
        expect(p.painPoints.length).toBeGreaterThanOrEqual(3);
      });

      it("every pain point has all required fields", () => {
        for (const pp of p.painPoints) {
          expect(pp.id).toBeTruthy();
          expect(pp.label).toBeTruthy();
          expect(pp.signal).toBeTruthy();
          expect(pp.response).toBeTruthy();
          expect(pp.bridge).toBeTruthy();
          expect(pp.capability).toBeTruthy();
        }
      });

      it("has at least 3 objections", () => {
        expect(p.objections.length).toBeGreaterThanOrEqual(3);
      });

      it("every objection has objection text and response", () => {
        for (const o of p.objections) {
          expect(o.id).toBeTruthy();
          expect(o.objection).toBeTruthy();
          expect(o.response).toBeTruthy();
        }
      });

      it("has at least 1 scenario", () => {
        expect(p.scenarios.length).toBeGreaterThanOrEqual(1);
      });

      it("every scenario has all required fields", () => {
        for (const s of p.scenarios) {
          expect(s.id).toBeTruthy();
          expect(s.title).toBeTruthy();
          expect(s.setup).toBeTruthy();
          expect(s.walkthrough).toBeTruthy();
          expect(s.punchline).toBeTruthy();
        }
      });

      it("all discovery question IDs are unique", () => {
        const ids = p.discovery.map((q) => q.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it("all pain point IDs are unique", () => {
        const ids = p.painPoints.map((pp) => pp.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it("all objection IDs are unique", () => {
        const ids = p.objections.map((o) => o.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });
  }
});
