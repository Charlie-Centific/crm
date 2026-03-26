// ── VisionAI™ Module Definitions ──────────────────────────────────────────
// 1 mandatory platform layer + 6 operational modules (26 total workflows)
// Source: visionai_modules.json

export type ModuleTier = "platform" | "operational";
export type ModulePricing = "bundled" | "per-module";

export interface ModuleWorkflow {
  id: string;
  name: string;
  description: string;
  note?: string;
  consolidatedFrom?: string[];
}

export interface VisionAIModule {
  id: string;
  number: number;
  title: string;
  slug: string;
  tier: ModuleTier;
  mandatory: boolean;
  pricing: ModulePricing;
  pricingNote?: string;
  summary: string;
  verticals?: string[];
  note?: string;
  workflowCount: number;
  workflows: ModuleWorkflow[];
}

export const MODULES: VisionAIModule[] = [
  {
    id: "MOD-00-ADMIN",
    number: 0,
    title: "Administration & Intelligence",
    slug: "admin",
    tier: "platform",
    mandatory: true,
    pricing: "bundled",
    pricingNote: "Included with every deployment. Never itemized on a quote.",
    summary:
      "The institutional layer that makes every operational module defensible to finance, legal, and IT. Must be live and instrumented from day one of any trial.",
    workflowCount: 12,
    workflows: [
      {
        id: "WF-A01",
        name: "Audit Log & Decision Lineage",
        description:
          "Immutable, timestamped log of every AI decision, human override, and system action. Court-ready and public-records-compliant.",
      },
      {
        id: "WF-A02",
        name: "ROI Tracking & Value Reporting",
        description:
          "Continuous capture of operational metrics used to auto-generate the 90-Day Value Report and ongoing ROI documentation.",
      },
      {
        id: "WF-A03",
        name: "Role-Based Access Control",
        description:
          "User provisioning, permission management, and access governance across all modules and agencies.",
      },
      {
        id: "WF-A04",
        name: "Operational Metrics Dashboard",
        description:
          "Real-time and historical view of platform usage, incident counts, response times, and agent activity across all deployed modules.",
      },
      {
        id: "WF-A05",
        name: "AI Model Confidence Reporting",
        description:
          "Per-agent confidence score tracking, calibration reporting, and accuracy trends over time.",
      },
      {
        id: "WF-A06",
        name: "False Positive & Correction Rates",
        description:
          "Tracks human corrections to AI outputs and feeds labeled data back into the model improvement pipeline.",
      },
      {
        id: "WF-A07",
        name: "90-Day Value Report (Auto-Gen)",
        description:
          "Automatically assembled report covering queries run, incidents detected, reports automated, time saved, and ROI calculation. Formatted for direct submission to a budget director or city manager.",
      },
      {
        id: "WF-A08",
        name: "Budget Justification Builder",
        description:
          "Generates FY budget language, cost-benefit analysis, and recommended license line items based on trial usage data.",
      },
      {
        id: "WF-A09",
        name: "Data Governance & Retention",
        description:
          "Configurable data retention policies, PII handling rules, and compliance with state and federal data governance requirements.",
      },
      {
        id: "WF-A10",
        name: "Multi-Agency User Management",
        description:
          "Manages identity, access, and permissions across multiple departments or agencies within a single deployment.",
      },
      {
        id: "WF-A11",
        name: "System Health & Uptime Monitoring",
        description:
          "Platform-level health checks, sensor feed status, API uptime, and incident alerting for the IT administrator.",
      },
      {
        id: "WF-A12",
        name: "API & Integration Management",
        description:
          "Manages connections to CAD, RMS, SCADA, transit, and other third-party systems. Logs integration health and data flow status.",
      },
    ],
  },

  {
    id: "MOD-01-VIDEO",
    number: 1,
    title: "Video Intelligence",
    slug: "video",
    tier: "operational",
    mandatory: false,
    pricing: "per-module",
    summary:
      "Foundation layer for all camera-based detection. Required by most other operational modules.",
    verticals: ["smart-city", "enterprise", "transit", "logistics"],
    workflowCount: 5,
    workflows: [
      {
        id: "WF-01-VIDEO",
        name: "Live Video Ingestion & Monitoring",
        description:
          "Core live video ingestion and real-time monitoring across multiple camera feeds. Foundation for all CV-based workflows.",
        consolidatedFrom: ["WF-01-VIDEO"],
      },
      {
        id: "WF-02-VIDSRCH",
        name: "AI Video Search (Retrospective)",
        description:
          "AI-powered search across recorded footage using object, event, or attribute-based natural language queries.",
        consolidatedFrom: ["WF-02-VIDSRCH"],
      },
      {
        id: "WF-03-RTTHRT",
        name: "Real-Time Threat Detection",
        description:
          "Identifies and flags potential security threats as they emerge across monitored environments.",
        consolidatedFrom: ["WF-03-RTTHRT"],
      },
      {
        id: "WF-06-STSVL",
        name: "Site Surveillance",
        description:
          "24/7 AI-powered perimeter and site-wide surveillance for large or complex environments.",
        consolidatedFrom: ["WF-06-STSVL"],
      },
      {
        id: "WF-07-TOFWATCH",
        name: "Traffic & Flow Watch",
        description:
          "Monitors traffic flow and patterns, detecting anomalies such as wrong-way driving, congestion, or sudden stops.",
        consolidatedFrom: ["WF-07-TOFWATCH"],
      },
    ],
  },

  {
    id: "MOD-02-DISPATCH",
    number: 2,
    title: "Dispatch & Response",
    slug: "dispatch",
    tier: "operational",
    mandatory: false,
    pricing: "per-module",
    summary:
      "AI-assisted dispatch triage, acoustic detection, and automated shift communications for emergency operations centers.",
    verticals: ["public-safety", "law-enforcement", "transit"],
    workflowCount: 4,
    workflows: [
      {
        id: "WF-09-DSPAGT",
        name: "AI Dispatch Triage & Routing",
        description:
          "Triages incoming alerts, prioritizes incidents, and routes tasks to the appropriate response teams. Reduces dispatcher cognitive load during peak events.",
        consolidatedFrom: ["WF-09-DSPAGT", "WF-10-CALLCOM"],
      },
      {
        id: "WF-04-GUNSHOT",
        name: "Gunshot / Acoustic Detection",
        description:
          "AI-driven acoustic and visual detection of gunshot events, triggering automated alerts and response protocols.",
        consolidatedFrom: ["WF-04-GUNSHOT"],
      },
      {
        id: "WF-10-CALLCOM",
        name: "Call Communication Logging",
        description:
          "Manages and logs inbound and outbound calls related to incidents and operational coordination.",
        consolidatedFrom: ["WF-10-CALLCOM"],
        note: "Sub-capability of Dispatch Triage — not priced separately",
      },
      {
        id: "WF-08-MRNDIG",
        name: "Morning Digest & Shift Handoff",
        description:
          "Automated AI-generated summary of overnight events and incidents for shift handover and situational awareness.",
        consolidatedFrom: ["WF-08-MRNDIG"],
      },
    ],
  },

  {
    id: "MOD-03-TRAFFIC",
    number: 3,
    title: "Traffic & Transportation",
    slug: "traffic",
    tier: "operational",
    mandatory: false,
    pricing: "per-module",
    summary:
      "End-to-end corridor management — from queue detection and incident response to planned closures and weather-triggered advisories.",
    verticals: ["transportation", "smart-city", "transit"],
    workflowCount: 5,
    workflows: [
      {
        id: "WF-14-TRAFQ",
        name: "Traffic Queue Detection",
        description:
          "Detects and measures vehicle queue lengths at intersections, toll plazas, and chokepoints to manage congestion in real time.",
        consolidatedFrom: ["WF-14-TRAFQ"],
      },
      {
        id: "WF-19-TRAFINC",
        name: "Traffic Incident Response",
        description:
          "Real-time detection and coordinated response for traffic accidents, breakdowns, and road hazards using multi-source corroboration.",
        consolidatedFrom: ["WF-19-TRAFINC"],
      },
      {
        id: "WF-15-PLNCLS",
        name: "Planned Closure Management",
        description:
          "Manages road and facility closures — coordinating DMS messaging, 511 updates, and navigation platform notifications as a single workflow.",
        consolidatedFrom: ["WF-15-PLNCLS"],
      },
      {
        id: "WF-13-WTHR",
        name: "Weather-Triggered Alerts",
        description:
          "Correlates real-time weather data with operational thresholds, triggering DMS messages and safety protocols automatically.",
        consolidatedFrom: ["WF-13-WTHR"],
      },
      {
        id: "WF-11-PARKENF",
        name: "Parking & Permit Enforcement",
        description:
          "AI/CV detection of parking violations, permit zone compliance, and unauthorized vehicle overstays.",
        consolidatedFrom: ["WF-11-PARKENF", "WF-12-PRMCMP"],
      },
    ],
  },

  {
    id: "MOD-04-SAFETY",
    number: 4,
    title: "Public Safety & Incidents",
    slug: "safety",
    tier: "operational",
    mandatory: false,
    pricing: "per-module",
    summary:
      "Critical incident management, multi-agency coordination, crowd safety, and LPR-based enforcement for law enforcement and public safety agencies.",
    verticals: ["law-enforcement", "public-safety", "smart-city", "events"],
    workflowCount: 6,
    workflows: [
      {
        id: "WF-16-CRITINC",
        name: "Critical Incident Management",
        description:
          "Consolidates data from multiple detection systems during a major incident, providing a unified operational picture for command teams.",
        consolidatedFrom: ["WF-16-CRITINC"],
      },
      {
        id: "WF-17-MLTCOM",
        name: "Multi-Agency Communications",
        description:
          "Orchestrates communications across multiple channels and agencies during complex or multi-site incidents.",
        consolidatedFrom: ["WF-17-MLTCOM"],
      },
      {
        id: "WF-22-CROWD",
        name: "Crowd Counting & Density",
        description:
          "Real-time and historical crowd density analysis. Automated threshold alerts at 75%, 90%, and 100% capacity.",
        consolidatedFrom: ["WF-22-CROWD"],
      },
      {
        id: "WF-24-STVEH",
        name: "Stolen Vehicle (LPR)",
        description:
          "LPR-based cross-reference against stolen vehicle databases in real time with automated dispatch and containment suggestions.",
        consolidatedFrom: ["WF-24-STVEH"],
      },
      {
        id: "WF-23-UNTLUG",
        name: "Unattended Items & Vehicles",
        description:
          "Detects bags, packages, or vehicles left unattended in public or restricted spaces beyond a defined time threshold.",
        consolidatedFrom: ["WF-23-UNTLUG", "WF-27-UNTVEH"],
      },
      {
        id: "WF-25-PERDN",
        name: "Person Down / Medical Alert",
        description:
          "Detects individuals who have fallen or are motionless, triggering medical emergency or safety incident response.",
        consolidatedFrom: ["WF-25-PERDN"],
      },
    ],
  },

  {
    id: "MOD-05-COMPLIANCE",
    number: 5,
    title: "Compliance & Environment",
    slug: "compliance",
    tier: "operational",
    mandatory: false,
    pricing: "per-module",
    summary:
      "Automated regulatory reporting, environmental enforcement, access control, and maritime operations for compliance-heavy agencies.",
    verticals: ["smart-city", "environment", "enterprise", "maritime"],
    workflowCount: 4,
    workflows: [
      {
        id: "WF-20-CMPRPT",
        name: "Compliance Reporting (Auto-Gen)",
        description:
          "Automated AI-generated compliance reports aggregating detected violations and operational data. Templates pre-formatted per regulatory body.",
        consolidatedFrom: ["WF-20-CMPRPT", "WF-12-PRMCMP"],
      },
      {
        id: "WF-21-ILLDMP",
        name: "Illegal Dumping Detection",
        description:
          "Real-time CV detection of unauthorized dumping with AI waste classification (general, hazmat, construction) and prosecution-grade evidence capture.",
        consolidatedFrom: ["WF-21-ILLDMP"],
      },
      {
        id: "WF-05-ACSCTR",
        name: "Access Control & Breach Detection",
        description:
          "AI-enhanced access management fusing badge, door sensor, and camera feeds. Detects tailgating and unauthorized access with automated credential revocation.",
        consolidatedFrom: ["WF-05-ACSCTR"],
      },
      {
        id: "WF-18-FRRYFLD",
        name: "Ferry / Flood & Maritime Ops",
        description:
          "Monitors ferry terminals and waterways for flooding, vessel congestion, and emergency conditions affecting maritime transit.",
        consolidatedFrom: ["WF-18-FRRYFLD"],
      },
    ],
  },

  {
    id: "MOD-06-INDUSTRIAL",
    number: 6,
    title: "Industrial & Logistics",
    slug: "industrial",
    tier: "operational",
    mandatory: false,
    pricing: "per-module",
    summary:
      "Private-sector safety and operational monitoring for warehouses, manufacturing, and distribution facilities.",
    verticals: ["logistics", "industrial", "retail"],
    note:
      "Distinct buyer persona from Modules 1–5 (private sector, not government). Consider whether this belongs in the VisionAI product line or as a separate SKU.",
    workflowCount: 3,
    workflows: [
      {
        id: "WF-26-FRKLT",
        name: "Forklift & Pedestrian Safety",
        description:
          "Monitors forklift operations to detect unsafe proximity to pedestrians, speed violations, and zone breaches in warehouse environments.",
        consolidatedFrom: ["WF-26-FRKLT"],
      },
      {
        id: "WF-28-BOXROT",
        name: "Box Rotation & Inventory Flow",
        description:
          "Monitors inventory box movement and rotation to ensure FIFO compliance, detect obstructions, and track fulfillment efficiency.",
        consolidatedFrom: ["WF-28-BOXROT"],
      },
      {
        id: "WF-29-FLNPRD",
        name: "Fallen Product Detection",
        description:
          "Detects products fallen from shelves, conveyors, or storage systems, triggering cleanup or safety alerts.",
        consolidatedFrom: ["WF-29-FLNPRD"],
      },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

export const OPERATIONAL_MODULES = MODULES.filter((m) => m.tier === "operational");
export const PLATFORM_MODULE     = MODULES.find((m) => m.tier === "platform")!;

/** Build a lookup: workflow DB id → module */
export function buildWorkflowModuleIndex(): Record<string, VisionAIModule> {
  const index: Record<string, VisionAIModule> = {};
  for (const mod of MODULES) {
    for (const wf of mod.workflows) {
      index[wf.id] = mod;
    }
  }
  return index;
}
