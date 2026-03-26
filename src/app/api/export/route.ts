import { NextResponse } from "next/server";
import { getAllWorkflows } from "@/lib/workflows";
import { ROLES, WORKFLOW_PERSONAS } from "@/lib/workflow-static-data";

// ── Label maps (keep in sync with settings-client.tsx) ────────────────────────

const ACCESS_LEVEL_DESCRIPTIONS: Record<string, string> = {
  command:    "Full system admin + tactical override authority. Final approver on AI-generated outputs.",
  supervisor: "Elevated operational permissions. Manages team workload; no system configuration rights.",
  operator:   "Active platform user. Can create and update incidents, manage alerts, control field assets.",
  responder:  "Field user. Receives and confirms AI-dispatched tasks; limited write access.",
  analyst:    "Read + annotate. Reviews and validates data outputs; cannot create incidents.",
  viewer:     "Read-only access to dashboards, reports, and situational displays.",
};

const ROLE_CATEGORY_LABELS: Record<string, string> = {
  "command":           "Command & Leadership",
  "dispatch":          "Emergency Dispatch",
  "field-ops":         "Field Operations",
  "security-ops":      "Security Operations",
  "traffic-transport": "Traffic & Transportation",
  "emergency-mgmt":    "Emergency Management",
  "compliance":        "Compliance & Enforcement",
  "records-intel":     "Records & Intelligence",
  "operations":        "Operations Support",
};

const CJIS_DESCRIPTIONS: Record<string, string> = {
  full:    "Full CJIS access — can query NCIC, state criminal records, and all restricted law enforcement databases.",
  limited: "Limited CJIS access — can view incident summaries and non-restricted records; cannot query criminal history.",
  none:    "No CJIS access — civilian or non-law-enforcement role with no access to restricted criminal justice data.",
};

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  const workflows = await getAllWorkflows();

  // ── Build export ────────────────────────────────────────────────────────────

  const accessLevels = Object.entries(ACCESS_LEVEL_DESCRIPTIONS).map(([id, description]) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    description,
  }));

  const roleCategories = Object.entries(ROLE_CATEGORY_LABELS).map(([id, label]) => ({
    id,
    label,
  }));

  const cjisLevels = Object.entries(CJIS_DESCRIPTIONS).map(([id, description]) => ({
    id,
    label: id === "full" ? "Full Access" : id === "limited" ? "Limited Access" : "No CJIS",
    description,
  }));

  const rolesExport = ROLES.map((r) => ({
    id:               r.id,
    title:            r.title,
    initials:         r.initials,
    category:         r.category,
    categoryLabel:    ROLE_CATEGORY_LABELS[r.category] ?? r.category,
    department:       r.department,
    description:      r.description,
    accessLevel:      r.accessLevel,
    accessLevelLabel: (r.accessLevel.charAt(0).toUpperCase() + r.accessLevel.slice(1)),
    cjis:             r.cjis,
    cjisLabel:        r.cjis === "full" ? "Full Access" : r.cjis === "limited" ? "Limited Access" : "No CJIS",
    responsibilities: r.responsibilities,
    systemAccess:     r.systemAccess,
    activatedIn:      r.activatedIn,
  }));

  const workflowMap = Object.fromEntries(workflows.map((w) => [w.id, w.name]));

  const personasExport = WORKFLOW_PERSONAS.flatMap((wpd) =>
    wpd.personas.map((p) => ({
      workflowId:   wpd.workflowId,
      workflowName: workflowMap[wpd.workflowId] ?? wpd.workflowId,
      role:         p.role,
      initials:     p.initials,
      department:   p.department,
      goals:        p.goals,
      painPoints:   p.painPoints,
      gains:        p.gains,
      ...(p.quote ? { quote: p.quote } : {}),
    }))
  );

  const workflowsExport = workflows.map((w) => ({
    id:           w.id,
    name:         w.name,
    description:  w.description,
    audience:     w.audience,
    users:        w.users,
    useCases:     w.useCases,
    verticalTags: w.verticalTags,
    threatTags:   w.threatTags,
    isCustom:     w.isCustom,
  }));

  const payload = {
    meta: {
      generated:   new Date().toISOString(),
      source:      "VAI™ Sales Buddy",
      version:     "1.0",
      description: "Canonical reference for all VAI™ roles, personas, access levels, and workflows.",
      counts: {
        roles:           rolesExport.length,
        personas:        personasExport.length,
        workflows:       workflowsExport.length,
        accessLevels:    accessLevels.length,
        roleCategories:  roleCategories.length,
      },
    },
    accessLevels,
    cjisLevels,
    roleCategories,
    roles:     rolesExport,
    personas:  personasExport,
    workflows: workflowsExport,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="vai-universe-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
