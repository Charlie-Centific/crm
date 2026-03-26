import { describe, it, expect } from "vitest";
import { getMember, avatarUrl, TEAM, TEAM_BY_NAME, AVATAR_COLORS } from "../team";

describe("getMember", () => {
  it("returns the correct member by exact name", () => {
    const m = getMember("Charlie Gonzalez");
    expect(m).not.toBeNull();
    expect(m?.initials).toBe("CG");
    expect(m?.slug).toBe("charlie-gonzalez");
  });

  it("returns all 4 team members by name", () => {
    expect(getMember("Charlie Gonzalez")?.color).toBe("blue");
    expect(getMember("Cynthia Colbert")?.color).toBe("purple");
    expect(getMember("Michael Underwood")?.color).toBe("green");
    expect(getMember("Jordan Ripoll")?.color).toBe("orange");
  });

  it("returns null for unknown name", () => {
    expect(getMember("Unknown Person")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(getMember(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(getMember(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getMember("")).toBeNull();
  });
});

describe("avatarUrl", () => {
  it("returns a path with the slug and size", () => {
    const member = getMember("Charlie Gonzalez")!;
    expect(avatarUrl(member, 32)).toBe("/avatars/charlie-gonzalez-32.webp");
    expect(avatarUrl(member, 64)).toBe("/avatars/charlie-gonzalez-64.webp");
    expect(avatarUrl(member, 128)).toBe("/avatars/charlie-gonzalez-128.webp");
    expect(avatarUrl(member, 256)).toBe("/avatars/charlie-gonzalez-256.webp");
  });

  it("returns the correct slug for each team member", () => {
    const slugs = TEAM.map((m) => m.slug);
    expect(slugs).toContain("charlie-gonzalez");
    expect(slugs).toContain("cynthia-colbert");
    expect(slugs).toContain("michael-underwood");
    expect(slugs).toContain("jordan-ripoll");
  });
});

describe("TEAM", () => {
  it("has exactly 4 members", () => {
    expect(TEAM).toHaveLength(4);
  });

  it("every member has required fields", () => {
    for (const m of TEAM) {
      expect(m.name).toBeTruthy();
      expect(m.initials).toHaveLength(2);
      expect(m.slug).toMatch(/^[a-z-]+$/);
      expect(AVATAR_COLORS[m.color]).toBeTruthy();
    }
  });

  it("TEAM_BY_NAME indexes all members", () => {
    for (const m of TEAM) {
      expect(TEAM_BY_NAME[m.name]).toEqual(m);
    }
  });
});
