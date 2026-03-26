/**
 * Generates a structured pre-call brief from account data.
 * No API key required — pure data assembly from CRM records.
 */

import { VERTICAL_LABELS, STAGE_LABELS, SOURCE_LABELS, formatCurrency, daysInStage } from "@/lib/utils";

// Discovery questions keyed by vertical — drawn from playbook content
const DISCOVERY_QUESTIONS: Record<string, string[]> = {
  smart_city: [
    "How long does it take your team to find out something went wrong on the ground?",
    "What happens when your team gets a false alarm at 2am — how do you decide whether to dispatch?",
    "If something happened last Tuesday, how long would it take to piece together exactly what occurred?",
    "How do you prove to leadership — or legal — exactly what your team did and when?",
    "How many hours a week does your team spend writing reports they could be acting on instead?",
  ],
  transit: [
    "When a vehicle breaks down unexpectedly, how much advance warning does your team typically get?",
    "How do dispatchers know when to reroute before a delay cascades across the network?",
    "What happens when there's a safety incident on a platform — how fast do you get visibility?",
    "How much revenue do you estimate you lose annually to fare evasion?",
    "How long does it take your ops team to understand what caused a major service disruption?",
  ],
  emergency: [
    "How long does it take investigators to find relevant footage after an incident?",
    "When call volumes spike, how do you ensure dispatchers catch every critical alert?",
    "How much of an officer's shift is currently spent on paperwork versus patrol?",
    "How long does it take to process a seized phone or digital evidence today?",
    "When a case goes to court, how confident are you that nothing in the evidence was missed?",
  ],
  utilities: [
    "How does your team currently find out about infrastructure issues — sensors, reports, or field calls?",
    "When a sensor spikes at 3am, how do you distinguish a real problem from a false alarm before you dispatch?",
    "If a failure happened last week, how long would it take to reconstruct exactly what happened and when?",
    "How do you document what your team detected and acted on for regulatory or legal purposes?",
    "How many crew hours per week go to false-alarm dispatches?",
  ],
  other: [
    "How does your team currently get notified when something goes wrong operationally?",
    "What's the biggest gap between when an incident happens and when your team can act on it?",
    "How do you reconstruct events after the fact when leadership or legal asks what happened?",
    "How much staff time goes to manual reporting that could be automated?",
  ],
};

// Stage-specific agenda suggestions
const STAGE_AGENDAS: Record<string, string[]> = {
  lead: [
    "Brief intro — who we are, what VAI does (2 min)",
    "Discovery: understand their current operations and biggest pain points",
    "Art of the possible — share 1-2 scenarios relevant to their vertical",
    "Identify the right next step: full demo or stakeholder intro",
  ],
  discovery: [
    "Recap last conversation and confirm understanding of their priorities",
    "Go deeper on top 1-2 pain points — get specifics (volumes, timelines, costs)",
    "Introduce VAI capabilities mapped to their stated needs",
    "Qualify: timeline, budget ownership, decision process",
    "Propose: demo with their actual use case in scope",
  ],
  demo: [
    "Set the stage: recap their top pain points before opening the platform",
    "Live demo: lead with the scenario most relevant to their vertical",
    "Show investigation mode: ask a plain-language question, show it searching",
    "Show automated reporting / accountability record",
    "Objection handling — be ready for 'we already have cameras'",
    "Next step: priorities workshop or pilot scope discussion",
  ],
  workshop: [
    "Align on workshop goals and expected outputs",
    "Confirm attendees and roles (business owner, technical owner, operations lead)",
    "Walk through use case prioritization framework",
    "Discuss ROI model approach — current state vs. target state metrics",
    "Set expectations for 90-day pilot structure",
  ],
  pilot_start: [
    "Confirm pilot scope and success criteria",
    "Hardware/cloud deployment logistics — NVIDIA DGX Spark setup",
    "Data streams to connect in Phase 1",
    "Stakeholder communication plan during pilot",
    "Milestone check-in schedule (kickoff, midpoint, close)",
  ],
  pilot_close: [
    "Review pilot results against success criteria",
    "Quantify outcomes achieved during the 90-day pilot",
    "Present expansion path: Phase 2 — more streams, more departments",
    "Commercial discussion: pricing, timeline, contract structure",
    "Next steps to close",
  ],
  closed_won: [
    "Transition to customer success — introductions",
    "Review implementation timeline",
    "Confirm expansion opportunities for future quarters",
  ],
  closed_lost: [
    "Discovery: understand what drove the decision",
    "Leave the door open — circumstances change",
  ],
};

type Activity = {
  type: string;
  subject: string | null;
  body: string | null;
  occurredAt: string | null;
  authorName: string | null;
};

type Contact = {
  firstName: string | null;
  lastName: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean | null;
};

type Opportunity = {
  name: string;
  stage: string | null;
  value: number | null;
  closeDate: string | null;
  leadSource: string | null;
  stageChangedAt: string | null;
  nextAction: string | null;
  ownerName: string | null;
};

type Account = {
  name: string;
  vertical: string | null;
  ownerName: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  website: string | null;
  employeeCount: number | null;
  notes: string | null;
};

export function generateBriefContent(data: {
  account: Account;
  contacts: Contact[];
  opportunities: Opportunity[];
  activities: Activity[];
}): string {
  const { account, contacts, opportunities, activities } = data;
  const opp = opportunities[0] ?? null;
  const stage = opp?.stage ?? "lead";
  const vertical = account.vertical ?? "other";
  const now = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const lines: string[] = [];

  // Header
  lines.push(`# Pre-Call Brief: ${account.name}`);
  lines.push(`*Generated ${now}*`);
  lines.push("");

  // Account Snapshot
  lines.push("## Account Snapshot");
  lines.push("");
  if (account.vertical) lines.push(`- **Vertical**: ${VERTICAL_LABELS[account.vertical] ?? account.vertical}`);
  const location = [account.city, account.state, account.country].filter(Boolean).join(", ");
  if (location) lines.push(`- **Location**: ${location}`);
  if (account.ownerName) lines.push(`- **Owner**: ${account.ownerName}`);
  if (account.employeeCount) lines.push(`- **Employees**: ${account.employeeCount.toLocaleString()}`);
  if (account.website) lines.push(`- **Website**: ${account.website}`);

  if (opp) {
    lines.push("");
    lines.push(`### Active Opportunity`);
    lines.push(`- **Opportunity**: ${opp.name}`);
    lines.push(`- **Stage**: ${STAGE_LABELS[stage] ?? stage}`);
    if (opp.stageChangedAt) {
      const days = daysInStage(opp.stageChangedAt);
      lines.push(`- **Days in stage**: ${days} day${days !== 1 ? "s" : ""}${days >= 14 ? " ⚠️" : days >= 7 ? " ⚡" : ""}`);
    }
    if (opp.value) lines.push(`- **Deal value**: ${formatCurrency(opp.value)}`);
    if (opp.closeDate) {
      const close = new Date(opp.closeDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      lines.push(`- **Target close**: ${close}`);
    }
    if (opp.leadSource) lines.push(`- **Lead source**: ${SOURCE_LABELS[opp.leadSource] ?? opp.leadSource}`);
    if (opp.nextAction) {
      lines.push("");
      lines.push(`**Next action on file**: ${opp.nextAction}`);
    }
  }

  lines.push("");

  // Contacts
  lines.push("## Key Contacts");
  lines.push("");
  if (contacts.length === 0) {
    lines.push("*No contacts on file — add before the call.*");
  } else {
    const sorted = [...contacts].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    for (const c of sorted) {
      const name = [c.firstName, c.lastName].filter(Boolean).join(" ");
      const badge = c.isPrimary ? " ★" : "";
      lines.push(`**${name}${badge}**`);
      if (c.role) lines.push(`${c.role}`);
      if (c.email) lines.push(`${c.email}`);
      if (c.phone) lines.push(`${c.phone}`);
      lines.push("");
    }
  }

  // Recent Activity
  lines.push("## Recent Activity");
  lines.push("");
  const recentActs = activities.slice(0, 5);
  if (recentActs.length === 0) {
    lines.push("*No activity on file.*");
  } else {
    for (const a of recentActs) {
      const typeIcon = a.type === "email" ? "✉" : a.type === "call" ? "📞" : a.type === "meeting" ? "📅" : "📝";
      const dateStr = a.occurredAt ? new Date(a.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
      const subject = a.subject ?? a.type;
      const author = a.authorName ? ` · ${a.authorName}` : "";
      lines.push(`- ${typeIcon} **${dateStr}** — ${subject}${author}`);
      if (a.body) {
        const snippet = a.body.slice(0, 120).replace(/\n/g, " ");
        lines.push(`  *${snippet}${a.body.length > 120 ? "…" : ""}*`);
      }
    }
  }
  lines.push("");

  // Open Questions
  const questions = DISCOVERY_QUESTIONS[vertical] ?? DISCOVERY_QUESTIONS.other;
  lines.push("## Open Questions for This Call");
  lines.push("");
  for (const q of questions.slice(0, 4)) {
    lines.push(`- "${q}"`);
  }
  lines.push("");

  // Suggested Agenda
  const agenda = STAGE_AGENDAS[stage] ?? STAGE_AGENDAS.lead;
  lines.push("## Suggested Agenda");
  lines.push("");
  for (const item of agenda) {
    lines.push(`- ${item}`);
  }
  lines.push("");

  // Account notes
  if (account.notes) {
    lines.push("## Account Notes");
    lines.push("");
    lines.push(account.notes);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generates a rich prompt that the user can paste into claude.ai
 * to get an AI-expanded version of the brief.
 */
export function generateClaudePrompt(briefContent: string, accountName: string): string {
  return `You are a senior sales strategist preparing a rep for a sales call at ${accountName}.

Below is the structured pre-call brief pulled from our CRM. Please expand this into a polished, well-written pre-call brief that:
1. Fills in any blanks with smart assumptions based on the vertical and stage
2. Adds 2-3 specific things to watch out for or leverage in the conversation
3. Writes the "Suggested Agenda" as a proper time-boxed plan (e.g., 0:00–5:00 Introductions)
4. Keeps it tight — the rep should be able to read the full brief in under 3 minutes

---

${briefContent}

---

Return the expanded brief in clean markdown.`.trim();
}
