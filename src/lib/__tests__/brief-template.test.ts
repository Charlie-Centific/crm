import { describe, it, expect } from "vitest";
import { generateBriefContent, generateClaudePrompt } from "../brief-template";

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const baseAccount = {
  name: "Metro Transit Authority",
  vertical: "transit",
  ownerName: "Charlie Gonzalez",
  city: "Austin",
  state: "TX",
  country: "US",
  website: "https://metro-transit.example.com",
  employeeCount: 1200,
  notes: null,
};

const baseOpp = {
  name: "MTA - Phase 1 Pilot",
  stage: "demo",
  value: 850000,
  closeDate: "2026-06-30",
  leadSource: "conference",
  stageChangedAt: "2026-03-10T00:00:00Z",
  nextAction: "Send pilot scope doc by Friday",
  ownerName: "Charlie Gonzalez",
};

const baseContacts = [
  {
    firstName: "Maria",
    lastName: "Santos",
    role: "VP Operations",
    email: "m.santos@metro.example.com",
    phone: "512-555-0101",
    isPrimary: true,
  },
  {
    firstName: "James",
    lastName: "Okafor",
    role: "Director of IT",
    email: "j.okafor@metro.example.com",
    phone: null,
    isPrimary: false,
  },
];

const baseActivities = [
  {
    type: "meeting",
    subject: "Intro call with VP Operations",
    body: "Discussed pain points around platform safety and unplanned maintenance.",
    occurredAt: "2026-03-15T14:00:00Z",
    authorName: "Charlie Gonzalez",
  },
  {
    type: "email",
    subject: "Sent SLiM one-pager",
    body: null,
    occurredAt: "2026-03-16T09:30:00Z",
    authorName: "Charlie Gonzalez",
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("generateBriefContent", () => {
  it("includes the account name in the output", () => {
    const result = generateBriefContent({
      account: baseAccount,
      contacts: baseContacts,
      opportunities: [baseOpp],
      activities: baseActivities,
    });
    expect(result).toContain("Metro Transit Authority");
  });

  it("includes all five required sections", () => {
    const result = generateBriefContent({
      account: baseAccount,
      contacts: baseContacts,
      opportunities: [baseOpp],
      activities: baseActivities,
    });
    expect(result).toContain("## Account Snapshot");
    expect(result).toContain("## Key Contacts");
    expect(result).toContain("## Recent Activity");
    expect(result).toContain("## Open Questions");
    expect(result).toContain("## Suggested Agenda");
  });

  it("shows the vertical label, not the raw slug", () => {
    const result = generateBriefContent({
      account: baseAccount,
      contacts: baseContacts,
      opportunities: [baseOpp],
      activities: baseActivities,
    });
    expect(result).toContain("Transit");
    expect(result).not.toContain("**Vertical**: transit");
  });

  it("formats the deal value as currency", () => {
    const result = generateBriefContent({
      account: baseAccount,
      contacts: baseContacts,
      opportunities: [baseOpp],
      activities: baseActivities,
    });
    expect(result).toContain("$850,000");
  });

  it("shows the stage label, not the raw key", () => {
    const result = generateBriefContent({
      account: baseAccount,
      contacts: baseContacts,
      opportunities: [baseOpp],
      activities: baseActivities,
    });
    expect(result).toContain("Demo");
    expect(result).not.toContain("**Stage**: demo");
  });

  it("marks the primary contact with ★", () => {
    const result = generateBriefContent({
      account: baseAccount,
      contacts: baseContacts,
      opportunities: [baseOpp],
      activities: baseActivities,
    });
    expect(result).toContain("★");
    expect(result).toContain("Maria Santos");
  });

  it("shows next action when present", () => {
    const result = generateBriefContent({
      account: baseAccount,
      contacts: baseContacts,
      opportunities: [baseOpp],
      activities: baseActivities,
    });
    expect(result).toContain("Send pilot scope doc by Friday");
  });

  it("shows a days-in-stage count for deals that have been in stage a while", () => {
    // stageChangedAt is 2026-03-10, system date is 2026-03-25 → ≥14 days → ⚠️
    const result = generateBriefContent({
      account: baseAccount,
      contacts: baseContacts,
      opportunities: [baseOpp],
      activities: baseActivities,
    });
    // Template produces "16 days ⚠️" format
    expect(result).toMatch(/\d+ days/);
  });

  it("includes discovery questions appropriate for the transit vertical", () => {
    const result = generateBriefContent({
      account: baseAccount,
      contacts: baseContacts,
      opportunities: [baseOpp],
      activities: baseActivities,
    });
    // Transit-specific question from the template
    expect(result).toMatch(/vehicle|dispatch|maintenance|platform|delay/i);
  });

  it("handles an account with no contacts gracefully", () => {
    const result = generateBriefContent({
      account: baseAccount,
      contacts: [],
      opportunities: [baseOpp],
      activities: baseActivities,
    });
    expect(result).toContain("No contacts on file");
  });

  it("handles an account with no opportunity gracefully", () => {
    const result = generateBriefContent({
      account: baseAccount,
      contacts: baseContacts,
      opportunities: [],
      activities: baseActivities,
    });
    expect(result).toContain("## Account Snapshot");
    expect(result).not.toContain("Active Opportunity");
  });

  it("handles an account with no activity gracefully", () => {
    const result = generateBriefContent({
      account: baseAccount,
      contacts: baseContacts,
      opportunities: [baseOpp],
      activities: [],
    });
    expect(result).toContain("No activity on file");
  });

  it("uses different discovery questions for each vertical", () => {
    const transitBrief = generateBriefContent({
      account: { ...baseAccount, vertical: "transit" },
      contacts: [],
      opportunities: [],
      activities: [],
    });
    const emergencyBrief = generateBriefContent({
      account: { ...baseAccount, vertical: "emergency" },
      contacts: [],
      opportunities: [],
      activities: [],
    });
    const smartCityBrief = generateBriefContent({
      account: { ...baseAccount, vertical: "smart_city" },
      contacts: [],
      opportunities: [],
      activities: [],
    });

    // Each brief should have vertical-specific content
    expect(transitBrief).not.toEqual(emergencyBrief);
    expect(transitBrief).not.toEqual(smartCityBrief);
    expect(emergencyBrief).not.toEqual(smartCityBrief);
  });

  it("includes account notes when present", () => {
    const result = generateBriefContent({
      account: { ...baseAccount, notes: "Champion is VP Operations — very engaged." },
      contacts: [],
      opportunities: [],
      activities: [],
    });
    expect(result).toContain("Champion is VP Operations");
  });

  it("returns a non-empty string for a minimal account (no opp, no contacts, no activity)", () => {
    const result = generateBriefContent({
      account: { name: "Test Co", vertical: null, ownerName: null, city: null, state: null, country: null, website: null, employeeCount: null, notes: null },
      contacts: [],
      opportunities: [],
      activities: [],
    });
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(50);
  });
});

describe("generateClaudePrompt", () => {
  const briefContent = "# Pre-Call Brief: Test Corp\n\n## Account Snapshot\n- Vertical: Transit";

  it("includes the account name in the prompt", () => {
    const prompt = generateClaudePrompt(briefContent, "Test Corp");
    expect(prompt).toContain("Test Corp");
  });

  it("includes the brief content in the prompt", () => {
    const prompt = generateClaudePrompt(briefContent, "Test Corp");
    expect(prompt).toContain("## Account Snapshot");
  });

  it("asks Claude to expand it", () => {
    const prompt = generateClaudePrompt(briefContent, "Test Corp");
    expect(prompt.toLowerCase()).toMatch(/expand|polish|well-written/);
  });

  it("returns a non-empty string", () => {
    const result = generateClaudePrompt(briefContent, "Any Account");
    expect(result.length).toBeGreaterThan(100);
  });
});
