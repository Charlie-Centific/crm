import { describe, it, expect } from "vitest";
import { getDemoScript, ALL_DEMO_SCRIPTS, DEMO_SCRIPTS } from "../demo-scripts";

const EXPECTED_SLUGS = ["slim", "verityai"];

describe("ALL_DEMO_SCRIPTS", () => {
  it("has exactly 2 scripts", () => {
    expect(ALL_DEMO_SCRIPTS).toHaveLength(2);
  });

  it("contains slim and verityai", () => {
    const slugs = ALL_DEMO_SCRIPTS.map((s) => s.slug);
    expect(slugs).toContain("slim");
    expect(slugs).toContain("verityai");
  });
});

describe("getDemoScript", () => {
  it("returns the SLiM script by slug", () => {
    const s = getDemoScript("slim");
    expect(s).not.toBeNull();
    expect(s?.name).toContain("SLiM");
  });

  it("returns the VerityAI script by slug", () => {
    const s = getDemoScript("verityai");
    expect(s).not.toBeNull();
    expect(s?.name).toContain("VerityAI");
  });

  it("returns null for unknown slug", () => {
    expect(getDemoScript("unknown")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getDemoScript("")).toBeNull();
  });
});

describe("demo script data integrity", () => {
  for (const slug of EXPECTED_SLUGS) {
    describe(`${slug} script`, () => {
      const s = DEMO_SCRIPTS[slug]!;

      it("has required top-level fields", () => {
        expect(s.slug).toBeTruthy();
        expect(s.name).toBeTruthy();
        expect(s.tagline).toBeTruthy();
        expect(s.description).toBeTruthy();
        expect(s.closingMessage).toBeTruthy();
      });

      it("has at least 5 steps", () => {
        expect(s.steps.length).toBeGreaterThanOrEqual(5);
      });

      it("every step has a title and talking content", () => {
        for (const step of s.steps) {
          expect(step.title).toBeTruthy();
          expect(step.talking).toBeTruthy();
          // talking points should be substantial
          expect(step.talking.length).toBeGreaterThan(50);
        }
      });

      it("every step with a duration uses a parseable format", () => {
        for (const step of s.steps) {
          if (step.duration) {
            expect(step.duration).toMatch(/\d+ min/);
          }
        }
      });

      it("total estimated duration is between 10 and 60 minutes", () => {
        const total = s.steps.reduce((sum, step) => {
          const match = step.duration?.match(/(\d+)/);
          return sum + (match ? parseInt(match[1]) : 0);
        }, 0);
        expect(total).toBeGreaterThanOrEqual(10);
        expect(total).toBeLessThanOrEqual(60);
      });

      it("closing message is a meaningful string", () => {
        expect(s.closingMessage.length).toBeGreaterThan(30);
      });
    });
  }
});
