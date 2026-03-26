// ─── Static ROI + Diagram data for built-in VAI™ workflows ──────────────────
// Keyed by workflow ID (WF-13-WTHR … WF-20-CMPRPT).
// Custom (DB-only) workflows will have no entry here — that's expected.

// ── Types ─────────────────────────────────────────────────────────────────────

export type StepType = "trigger" | "process" | "output" | "broadcast" | "decision" | "awareness";

export interface DiagramStep {
  id: string;
  label: string;
  sublabel?: string;        // agent name or key detail
  type: StepType;
  abortOnFail?: boolean;
  timeout?: string;         // e.g. "30 sec"
  confidence?: string;      // e.g. "70% min"
  waitFor?: string;         // awareness steps: condition required before flow proceeds
}

/** One row in the diagram. Length 1 = full-width; length > 1 = parallel group. */
export type DiagramRow = DiagramStep[];

export interface WorkflowDiagramData {
  workflowId: string;
  confidenceThreshold: number;  // %
  stepCount: number;
  sla: string;                  // e.g. "< 75 sec end-to-end"
  rows: DiagramRow[];
}

export type ROICategory = "speed" | "accuracy" | "labor" | "safety" | "compliance";

export interface ROIMetric {
  label: string;
  before: string;
  after: string;
  improvement: string;      // "85% reduction", "3× faster"
  category: ROICategory;
}

export interface WorkflowROIData {
  workflowId: string;
  headline: string;          // Short impact headline
  annualValue: string;       // "$75K – $150K"
  roiMultiple: string;       // "5 – 8×"
  narrative: string;
  metrics: ROIMetric[];
}

// ── Diagram data ──────────────────────────────────────────────────────────────

export const WORKFLOW_DIAGRAMS: WorkflowDiagramData[] = [
  // ── WF-13: Highway Weather Alert ──────────────────────────────────────────
  {
    workflowId: "WF-13-WTHR",
    confidenceThreshold: 70,
    stepCount: 8,
    sla: "< 75 sec end-to-end",
    rows: [
      [{ id: "t1", label: "RWIS Threshold Crossed", sublabel: "Trigger — adverse weather condition", type: "trigger" }],
      [{ id: "p1", label: "RWIS Reading Interpretation", sublabel: "RWIS Agent", type: "process", abortOnFail: true }],
      [{ id: "a1", label: "Operations Staff Awareness", sublabel: "Notify Agent — maintenance crews and TOC ops placed on weather advisory standby", type: "awareness", waitFor: "TOC supervisor verifies advisory content before DMS deployment" }],
      [{ id: "p2", label: "Advisory Content Generation", sublabel: "Content Agent", type: "process", abortOnFail: true }],
      [{ id: "p3", label: "Geospatial DMS Identification", sublabel: "Geospatial Agent — upstream signs for affected corridor", type: "process" }],
      [{ id: "p4", label: "MUTCD-Compliant DMS Message", sublabel: "Message Agent", type: "process", abortOnFail: true }],
      [{ id: "p5", label: "DMS Device Dispatch", sublabel: "Device Control Agent", type: "process" }],
      [
        { id: "o1", label: "511 Advisory Published", sublabel: "511 Agent", type: "output" },
        { id: "o2", label: "Navigation Platform Push", sublabel: "Broadcast Agent — INRIX · Waze · Google · HERE", type: "broadcast" },
      ],
    ],
  },

  // ── WF-14: Traffic Queue Detection ────────────────────────────────────────
  {
    workflowId: "WF-14-TRAFQ",
    confidenceThreshold: 70,
    stepCount: 7,
    sla: "< 60 sec to active DMS warning",
    rows: [
      [{ id: "t1", label: "VDS Speed / Occupancy Threshold", sublabel: "Trigger — loop detector + probe data corroboration", type: "trigger" }],
      [{ id: "p1", label: "Corridor Queue Analysis", sublabel: "Traffic Analysis Agent — VDS + INRIX/HERE corroboration", type: "process", abortOnFail: true }],
      [{ id: "a1", label: "Highway Patrol & Tow Pre-Alert", sublabel: "Notify Agent — nearest HP units and tow rotation advised of developing queue", type: "awareness", waitFor: "Queue boundary confirmed — geospatial agent identifies upstream DMS sign group" }],
      [{ id: "p2", label: "Queue Boundary Identification", sublabel: "Geospatial Agent", type: "process", abortOnFail: true }],
      [{ id: "p3", label: "Upstream DMS Sign Lookup", sublabel: "Geospatial Agent — signs upstream of queue head", type: "process" }],
      [{ id: "p4", label: "MUTCD Queue Warning Message", sublabel: "Message Agent", type: "process", abortOnFail: true }],
      [
        { id: "o1", label: "DMS Device Dispatch", sublabel: "Device Control Agent", type: "output" },
        { id: "o2", label: "511 Queue Advisory", sublabel: "511 Agent", type: "output" },
      ],
    ],
  },

  // ── WF-15: Planned Closure ────────────────────────────────────────────────
  {
    workflowId: "WF-15-PLNCLS",
    confidenceThreshold: 70,
    stepCount: 6,
    sla: "< 3 min full multi-channel publish",
    rows: [
      [{ id: "t1", label: "Scheduled / Operator Entry", sublabel: "Trigger — construction window, permitted event, or emergency closure", type: "trigger" }],
      [{ id: "p1", label: "Event Validation & MUTCD Message", sublabel: "Message Agent", type: "process" }],
      [{ id: "p2", label: "Geospatial Upstream DMS Identification", sublabel: "Geospatial Agent", type: "process" }],
      [{ id: "p3", label: "DMS Device Dispatch", sublabel: "Device Control Agent", type: "process" }],
      [
        { id: "o1", label: "511 Publication", sublabel: "511 Agent", type: "output" },
        { id: "o2", label: "Navigation Platform Push", sublabel: "Broadcast Agent — INRIX · Waze · Google · HERE", type: "broadcast" },
      ],
    ],
  },

  // ── WF-16: Critical Incident Emergency Broadcast ──────────────────────────
  {
    workflowId: "WF-16-CRITINC",
    confidenceThreshold: 80,
    stepCount: 5,
    sla: "< 60 sec from operator confirmation",
    rows: [
      [{ id: "t1", label: "Operator Confirmation", sublabel: "Trigger — wrong-way · hazmat · bridge closure · mass-casualty", type: "trigger", confidence: "80% min" }],
      [{ id: "a1", label: "Multi-Agency Standby Alert", sublabel: "Notify Agent — all responding agencies pre-positioned; awaiting broadcast authorization", type: "awareness", waitFor: "TOC supervisor authorizes emergency broadcast — FEMA IPAWS CAP generation proceeds" }],
      [{ id: "p1", label: "FEMA IPAWS CAP Generation", sublabel: "Emergency Broadcast Agent", type: "process", abortOnFail: true }],
      [
        { id: "o1", label: "IPAWS Alert Dispatch", sublabel: "Federal Emergency Alert System", type: "broadcast", abortOnFail: true },
        { id: "o2", label: "511 Priority Publication", sublabel: "511 Agent", type: "output" },
        { id: "o3", label: "Social Media Posts", sublabel: "Broadcast Agent — all configured accounts", type: "broadcast" },
        { id: "o4", label: "TMC Video Wall Priority", sublabel: "Stream Management Agent", type: "output" },
      ],
    ],
  },

  // ── WF-17: Camera Stream Management ───────────────────────────────────────
  {
    workflowId: "WF-17-MLTCOM",
    confidenceThreshold: 70,
    stepCount: 4,
    sla: "< 5 sec from incident detection",
    rows: [
      [{ id: "t1", label: "Incident Detected", sublabel: "Trigger — any incident type; automatic, no operator navigation", type: "trigger" }],
      [{ id: "p1", label: "Nearest Camera Identification", sublabel: "Geospatial Agent — radius search from incident coordinates", type: "process" }],
      [
        { id: "p2", label: "TMC Video Wall Reconfiguration", sublabel: "Stream Management Agent — incident feeds to priority positions", type: "process" },
        { id: "p3", label: "Access-Tier Enforcement", sublabel: "Access Control Agent — restrict public streams if required", type: "decision" },
      ],
      [{ id: "o1", label: "Operator Preview Thumbnails", sublabel: "VAI narrates feed continuously for ambiguous events", type: "output" }],
    ],
  },

  // ── WF-18: Ferry & Flood Disruption ───────────────────────────────────────
  {
    workflowId: "WF-18-FRRYFLD",
    confidenceThreshold: 70,
    stepCount: 8,
    sla: "< 3 min coordinated multi-channel response",
    rows: [
      [{ id: "t1", label: "Flood Sensor + Ferry Status Change", sublabel: "Trigger — dual-source event detection", type: "trigger" }],
      [
        { id: "p1", label: "Flood Risk Assessment", sublabel: "Environmental Agent — RWIS + VDS correlation", type: "process" },
        { id: "p2", label: "Ferry Operational Status", sublabel: "Transit Agent — real-time service evaluation", type: "process" },
      ],
      [{ id: "a1", label: "Terminal Staff & Crew Standby", sublabel: "Notify Agent — ferry crew and terminal staff placed on flood response standby; boarding protocols ready", type: "awareness", waitFor: "Flood risk assessment confirms service impact — advisory content generation proceeds" }],
      [{ id: "p3", label: "Geospatial DMS Identification", sublabel: "Geospatial Agent — affected corridor signs", type: "process" }],
      [{ id: "p4", label: "Advisory Content Generation", sublabel: "Content Agent — flood + ferry combined advisory", type: "process" }],
      [{ id: "p5", label: "DMS Dispatch", sublabel: "Device Control Agent — pre-positioned closure plans for flood events", type: "process" }],
      [
        { id: "o1", label: "511 Publication", sublabel: "511 Agent", type: "output" },
        { id: "o2", label: "Navigation Platform Push", sublabel: "Broadcast Agent — INRIX · Waze · Google · HERE", type: "broadcast" },
      ],
    ],
  },

  // ── WF-19: TIM Lifecycle ──────────────────────────────────────────────────
  {
    workflowId: "WF-19-TRAFINC",
    confidenceThreshold: 75,
    stepCount: 12,
    sla: "< 5 min T0 → T4 full pipeline",
    rows: [
      [{ id: "t0", label: "First Notice of Incident (T0)", sublabel: "Trigger — any source: camera, sensor, CAD, 911, probe data", type: "trigger" }],
      [{ id: "t0a", label: "Incident Record Created", sublabel: "Report Agent — structured event object with typed properties", type: "process", abortOnFail: true, timeout: "30 sec" }],
      [
        { id: "t1a", label: "Multi-Source Data Fusion (T1)", sublabel: "Data Fusion Agent — VDS · cameras · CAD · probe", type: "process", abortOnFail: true },
        { id: "t1b", label: "Geospatial: Camera Assets (T1)", sublabel: "Geospatial Agent — nearest cameras identified", type: "process" },
        { id: "t1c", label: "Geospatial: DMS Signs (T1)", sublabel: "Geospatial Agent — upstream signs for affected corridor", type: "process" },
      ],
      [{ id: "a1", label: "HP & Tow Rotation Pre-Alert", sublabel: "Notify Agent — nearest HP units and tow rotation advised; do not deploy until T2 response plan confirmed", type: "awareness", waitFor: "Multi-source fusion result confirms incident — T2 response plan selected before any unit deployment" }],
      [{ id: "t2", label: "Response Plan Selected (T2)", sublabel: "Knowledge Agent — plan from pre-configured library", type: "decision", abortOnFail: true, timeout: "30 sec" }],
      [
        { id: "t3a", label: "Response Plan Executed (T3)", sublabel: "Device Control Agent", type: "process" },
        { id: "t3b", label: "DMS Message Generated (T3)", sublabel: "Report Agent", type: "process" },
        { id: "t3c", label: "Video Wall Configured (T3)", sublabel: "Stream Management Agent", type: "process" },
      ],
      [
        { id: "t4a", label: "FEMA IPAWS Alert (T4)", sublabel: "Broadcast Agent — if severity warrants", type: "broadcast" },
        { id: "t4b", label: "511 Update (T4)", sublabel: "511 Agent", type: "output" },
        { id: "t4c", label: "Social Media Posts (T4)", sublabel: "Broadcast Agent — all configured accounts", type: "broadcast" },
      ],
    ],
  },

  // ── WF-20: DOT Compliance Report ──────────────────────────────────────────
  {
    workflowId: "WF-20-CMPRPT",
    confidenceThreshold: 80,
    stepCount: 3,
    sla: "Weekly automated, 0 operator action required",
    rows: [
      [{ id: "t1", label: "Weekly Schedule Trigger", sublabel: "Trigger — defined cadence, no operator action required", type: "trigger" }],
      [
        { id: "p1", label: "RITIS Benchmark Pull", sublabel: "Data Agent — external benchmark data", type: "process", abortOnFail: true },
        { id: "p2", label: "TIM Metrics Aggregation", sublabel: "Analytics Agent — internal event log", type: "process", abortOnFail: true },
      ],
      [{ id: "p3", label: "Regulatory Narrative Report", sublabel: "Report Agent — FHWA-quality; halts + notifies if < 80% confidence", type: "process", abortOnFail: true, confidence: "80% min" }],
      [
        { id: "o1", label: "LADOTD Portal Submission", sublabel: "Submission Agent", type: "output" },
        { id: "o2", label: "FHWA System Submission", sublabel: "Submission Agent — archived with full source attribution", type: "output" },
      ],
    ],
  },
];

// ── ROI data ──────────────────────────────────────────────────────────────────

export const WORKFLOW_ROI: WorkflowROIData[] = [
  // ── WF-13: Highway Weather Alert ──────────────────────────────────────────
  {
    workflowId: "WF-13-WTHR",
    headline: "Weather advisories published in under 75 seconds",
    annualValue: "$75K – $150K",
    roiMultiple: "5 – 8×",
    narrative:
      "Agencies that manually monitor RWIS feeds and publish DMS messages take 4–8 minutes per weather event — and miss 15–20% of advisory windows entirely during peak conditions. WF-13 eliminates operator labor from routine weather response and removes the false advisory rate that erodes traveler trust. The economic value is primarily labor cost avoidance on ~150 annual weather events, plus secondary crash reduction from earlier warning delivery.",
    metrics: [
      { label: "RWIS-to-DMS response time",       before: "4 – 8 min",   after: "< 75 sec",  improvement: "85%+ faster",       category: "speed"      },
      { label: "Operator labor per event",         before: "8 min",       after: "0 min",      improvement: "100% automated",    category: "labor"      },
      { label: "False advisory rate",             before: "15 – 20%/yr", after: "< 5%",       improvement: "75% reduction",     category: "accuracy"   },
      { label: "511 advisory lag vs DMS",         before: "5 – 15 min",  after: "< 15 sec",   improvement: "Parallel dispatch", category: "speed"      },
      { label: "Annual labor hours saved",        before: "20 hrs/yr",   after: "~0 hrs",     improvement: "Full recovery",     category: "labor"      },
      { label: "Nav platform sync (INRIX/Waze)",  before: "Manual batch", after: "Automated",  improvement: "Same-run dispatch", category: "speed"      },
    ],
  },

  // ── WF-14: Traffic Queue Detection ────────────────────────────────────────
  {
    workflowId: "WF-14-TRAFQ",
    headline: "Queue warnings active in under 60 seconds",
    annualValue: "$200K – $500K+",
    roiMultiple: "8 – 15×",
    narrative:
      "Rear-end crashes into traffic queues account for a disproportionate share of freeway fatalities and injuries. FHWA data shows that effective queue warning deployments reduce secondary crashes by 15–20%. WF-14 eliminates the 6–10 minute manual lag that characterizes current deployments — and reduces missed warning rates from 25–35% to under 5% using multi-source corroboration. At an average secondary crash cost of $500K–$1M (NHTSA), avoiding even a fraction annually justifies the full program cost.",
    metrics: [
      { label: "Queue warning deployment time",  before: "6 – 10 min",  after: "< 60 sec",   improvement: "90% faster",        category: "speed"      },
      { label: "Missed queue warnings/yr",       before: "25 – 35%",    after: "< 5%",       improvement: "80%+ improvement",  category: "accuracy"   },
      { label: "Secondary crash reduction",      before: "Baseline",    after: "15 – 20%↓",  improvement: "FHWA benchmark",    category: "safety"     },
      { label: "False queue activation rate",    before: "10 – 15%",    after: "< 3%",       improvement: "Probe corroboration", category: "accuracy"  },
      { label: "Operator labor per event",       before: "6 – 10 min",  after: "0 min",      improvement: "Fully automated",   category: "labor"      },
      { label: "Multi-source corroboration",     before: "Single VDS",  after: "VDS + INRIX + HERE", improvement: "3-source confidence", category: "accuracy" },
    ],
  },

  // ── WF-15: Planned Closure ────────────────────────────────────────────────
  {
    workflowId: "WF-15-PLNCLS",
    headline: "Multi-channel closure published in under 3 minutes",
    annualValue: "$50K – $120K",
    roiMultiple: "4 – 6×",
    narrative:
      "Planned closure management is deceptively labor-intensive: each closure requires publishing to DMS, 511, and third-party navigation platforms in the correct sequence, with no message errors. At 20–30 minutes per manual closure and 200+ closures annually, that's 70–100 labor hours/year plus error recovery costs. WF-15 reduces this to a 15-minute operator review for pre-configured closures and eliminates publication errors through structured, MUTCD-validated message generation.",
    metrics: [
      { label: "Full multi-channel publish time", before: "20 – 30 min",  after: "< 3 min",    improvement: "90% faster",        category: "speed"      },
      { label: "Publication error rate",          before: "10 – 15%",     after: "< 1%",       improvement: "93% reduction",     category: "accuracy"   },
      { label: "DMS-to-511 sync lag",             before: "Sequential, 30–45 min", after: "Parallel, < 3 min", improvement: "93% faster", category: "speed" },
      { label: "Nav platform update lag",         before: "30 – 60 min",  after: "< 3 min",    improvement: "95% faster",        category: "speed"      },
      { label: "Operator labor per closure",      before: "20 – 30 min",  after: "< 5 min review", improvement: "83% reduction", category: "labor"      },
      { label: "Annual staff hours saved",        before: "70 – 100 hrs", after: "< 15 hrs",   improvement: "~85 hrs recovered", category: "labor"      },
    ],
  },

  // ── WF-16: Critical Incident Emergency Broadcast ──────────────────────────
  {
    workflowId: "WF-16-CRITINC",
    headline: "IPAWS alert dispatched in under 60 seconds",
    annualValue: "$1M+ liability exposure per incident",
    roiMultiple: "Immeasurable (life safety)",
    narrative:
      "For wrong-way drivers, hazmat spills, and mass-casualty events, every second of notification delay translates directly to increased fatality risk. NHTSA data shows wrong-way crashes cause 300–400 deaths nationally per year — a significant proportion of which occur because downstream drivers received no warning. WF-16 compresses the manual 8–15 minute notification pipeline to under 60 seconds and guarantees IPAWS compliance on every critical event. The liability exposure from delayed or non-compliant emergency notification can exceed $1M per incident.",
    metrics: [
      { label: "Detection-to-IPAWS dispatch",   before: "8 – 15 min manual", after: "< 60 sec",   improvement: "90%+ faster",     category: "speed"      },
      { label: "Wrong-way notification time",   before: "5 – 8 min",         after: "< 45 sec",   improvement: "91% faster",      category: "speed"      },
      { label: "IPAWS CAP compliance rate",     before: "Variable",          after: "100%",        improvement: "Structured CAP",  category: "compliance" },
      { label: "Multi-channel sync (IPAWS + 511 + social)", before: "Sequential, 20–30 min", after: "Parallel, < 60 sec", improvement: "97% faster", category: "speed" },
      { label: "Liability exposure per incident", before: "High (delayed notification)", after: "Minimized", improvement: "Documented response record", category: "compliance" },
      { label: "Operator authority",            before: "Human confirms first", after: "Human confirms first", improvement: "100% preserved", category: "safety" },
    ],
  },

  // ── WF-17: Camera Stream Management ───────────────────────────────────────
  {
    workflowId: "WF-17-MLTCOM",
    headline: "Incident cameras on-screen in under 5 seconds",
    annualValue: "$100K – $200K",
    roiMultiple: "6 – 10×",
    narrative:
      "During the critical first minutes of an incident, TMC operators spend 2–4 minutes navigating to the right camera feeds — time during which they are not managing the incident. WF-17 eliminates this navigation entirely: within 5 seconds of incident detection, the closest cameras appear in priority positions on the TMC video wall. The value is partly efficiency (faster incident verification) and partly safety (operators stay focused on incident management, not camera navigation).",
    metrics: [
      { label: "Time-to-relevant-camera (operator)",   before: "2 – 4 min manual navigation", after: "< 5 sec automatic", improvement: "97% faster",    category: "speed"  },
      { label: "Operator attention diversion",          before: "Frequent during incidents",   after: "Eliminated",       improvement: "100% removed",  category: "safety" },
      { label: "Video wall configuration time",         before: "3 – 5 min",                  after: "< 5 sec",          improvement: "99% faster",    category: "speed"  },
      { label: "Incident verification time",            before: "3 – 5 min",                  after: "< 30 sec",         improvement: "90% reduction", category: "speed"  },
      { label: "Public stream privacy enforcement",     before: "Manual, inconsistent",        after: "Automatic, every incident", improvement: "100% consistent", category: "compliance" },
      { label: "Incident clearance time impact",        before: "Baseline",                    after: "10 – 15% reduction", improvement: "Faster verification", category: "speed" },
    ],
  },

  // ── WF-18: Ferry & Flood Disruption ───────────────────────────────────────
  {
    workflowId: "WF-18-FRRYFLD",
    headline: "Coordinated flood + ferry response in under 3 minutes",
    annualValue: "$150K – $300K",
    roiMultiple: "6 – 10×",
    narrative:
      "Flood and ferry disruption events are uniquely challenging: they require simultaneous assessment of two independent data streams, rapid advisory generation for multiple affected corridors, and multi-channel publication — all during conditions when operator workload is already at its peak. WF-18 is the only purpose-built workflow for this scenario, running parallel assessments simultaneously and executing a pre-positioned response plan when thresholds are met. The value is in avoided traveler delay, prevented incidents during diverted traffic, and reduced operator error during high-stress conditions.",
    metrics: [
      { label: "Coordinated response time",        before: "20 – 35 min manual",  after: "< 3 min",    improvement: "91% faster",        category: "speed"    },
      { label: "Multi-channel update time",         before: "45 – 90 min seq.",    after: "< 5 min",    improvement: "94% faster",        category: "speed"    },
      { label: "Missed advisories during peaks",   before: "20 – 30%",            after: "< 2%",       improvement: "93% reduction",     category: "accuracy" },
      { label: "Parallel assessment (flood + ferry)", before: "Sequential, 15–20 min", after: "Simultaneous, < 60 sec", improvement: "Parallel execution", category: "speed" },
      { label: "Flood pre-position plan activation", before: "Manual, 10–15 min", after: "Automatic on threshold", improvement: "Instant activation", category: "speed" },
      { label: "Operator error rate at peak load", before: "15 – 25%",            after: "< 2%",       improvement: "Automated during worst conditions", category: "accuracy" },
    ],
  },

  // ── WF-19: TIM Lifecycle ──────────────────────────────────────────────────
  {
    workflowId: "WF-19-TRAFINC",
    headline: "Complete T0 → T4 TIM pipeline in under 5 minutes",
    annualValue: "$500K – $2M",
    roiMultiple: "10 – 20×",
    narrative:
      "The FHWA Traffic Incident Management framework defines a T0–T4 timeline that agencies are measured against for federal funding compliance. Most agencies complete T0–T4 manually in 20–45 minutes with significant variation. WF-19 delivers a structured, auditable 11-step pipeline that completes T0–T4 in under 5 minutes, improves TIM compliance reporting rates from 60–70% to over 95%, and reduces incident clearance times by 15–25% — directly impacting secondary crash rates. At $2,000–$5,000 in avoided costs per major incident (FHWA data), 100 annual major incidents represents $200K–$500K in direct cost avoidance, before accounting for secondary crash reduction.",
    metrics: [
      { label: "T0 → T4 total pipeline time",        before: "20 – 45 min manual", after: "< 5 min",    improvement: "88%+ reduction",    category: "speed"      },
      { label: "TIM compliance rate (FHWA)",          before: "60 – 70%",           after: "> 95%",      improvement: "35%+ improvement",  category: "compliance" },
      { label: "Incident clearance time",             before: "Baseline",           after: "15 – 25%↓",  improvement: "FHWA benchmark",    category: "speed"      },
      { label: "Secondary crash reduction",           before: "Baseline",           after: "20 – 30%↓",  improvement: "Faster clearance",  category: "safety"     },
      { label: "Cost per major incident",             before: "Baseline",           after: "$2K – $5K ↓", improvement: "FHWA cost data",   category: "labor"      },
      { label: "Post-incident report time",           before: "45 – 90 min manual", after: "15 min review", improvement: "Automated from event log", category: "labor" },
      { label: "Multi-source corroboration",          before: "Single sensor stream", after: "VDS + Camera + CAD + Probe", improvement: "4-source fusion", category: "accuracy" },
      { label: "Audit trail completeness",            before: "Variable",           after: "100% structured", improvement: "Every step logged", category: "compliance" },
    ],
  },

  // ── WF-20: DOT Compliance Report ──────────────────────────────────────────
  {
    workflowId: "WF-20-CMPRPT",
    headline: "Weekly FHWA submission with zero operator action",
    annualValue: "$50K – $120K",
    roiMultiple: "4 – 8×",
    narrative:
      "FHWA TIM performance measure submissions require agencies to pull RITIS benchmark data, compile internal TIM metrics, write a regulatory-quality narrative, and submit through the LADOTD portal — every week. Most agencies spend 4–8 hours per submission and achieve 90–95% on-time rates due to staff availability constraints. WF-20 automates the full pipeline: data is aggregated, the report is generated at 80% confidence or better, and it's submitted — with the agency getting a 15-minute review window rather than a 4–8 hour task.",
    metrics: [
      { label: "Manual reporting time/submission", before: "4 – 8 hrs",    after: "15 min review",   improvement: "96% reduction",      category: "labor"      },
      { label: "Annual staff hours saved",         before: "200 – 400 hrs", after: "< 15 hrs",        improvement: "~385 hrs recovered", category: "labor"      },
      { label: "Submission error rate",            before: "5 – 10%",      after: "< 1%",             improvement: "90% reduction",      category: "accuracy"   },
      { label: "On-time submission rate",          before: "90 – 95%",     after: "100%",             improvement: "Never misses a deadline", category: "compliance" },
      { label: "Partial/incomplete submissions",   before: "3 – 5%/yr",    after: "0%",               improvement: "Auto-halt + notify", category: "compliance" },
      { label: "RITIS data freshness",             before: "Manual pull schedule", after: "Every run", improvement: "Always current",    category: "accuracy"   },
    ],
  },
];

// ── Swimlane webp images (for workflows that have a multi-role swimlane) ──────
// Path is relative to /public — served as a static asset.

export const WORKFLOW_SWIMLANE_WEBP: Record<string, string> = {
  "WF-04-GUNSHOT": "/diagrams/WF-04-GUNSHOT.webp",
  "WF-05-ACSCTR":  "/diagrams/WF-05-ACSCTR.webp",
  "WF-09-DSPAGT":  "/diagrams/WF-09-DSPAGT.webp",
  "WF-21-ILLDMP":  "/diagrams/WF-21-ILLDMP.webp",
  "WF-22-CROWD":   "/diagrams/WF-22-CROWD.webp",
  "WF-24-STVEH":   "/diagrams/WF-24-STVEH.webp",
};

// ── ROI data — swimlane workflows (WF-04, WF-05, WF-09, WF-21, WF-22, WF-24) ─

const SWIMLANE_ROI: WorkflowROIData[] = [
  // ── WF-04-GUNSHOT: Shots Fired / Gunshot Response ─────────────────────────
  {
    workflowId: "WF-04-GUNSHOT",
    headline: "Gunshot detected and units dispatched in under 45 seconds",
    annualValue: "$500K – $2M",
    roiMultiple: "10 – 20× (life-safety + liability)",
    narrative:
      "Every second between a gunshot and a law enforcement response carries life-safety consequences. Traditional ShotSpotter and 911-only workflows require human review and manual dispatch — a process that takes 2–5 minutes in best-case conditions. VAI™ fuses acoustic sensor alerts with live camera feeds, automatically cross-validates detections, creates a structured CAD entry, and initiates multi-unit dispatch — compressing the notification pipeline to under 45 seconds. For high-risk venues, schools, and transit hubs, this time compression directly reduces casualty exposure and improves officer positioning before a situation escalates.",
    metrics: [
      { label: "Detection-to-unit-notification",   before: "2 – 5 min manual",       after: "< 45 sec",      improvement: "85%+ faster",            category: "speed"      },
      { label: "Multi-source corroboration",        before: "Acoustic only",           after: "Acoustic + camera fusion", improvement: "Cross-validated alert", category: "accuracy"   },
      { label: "False positive rate",              before: "30 – 40% (acoustic only)", after: "< 8%",          improvement: "75%+ reduction",         category: "accuracy"   },
      { label: "CAD entry time",                   before: "60 – 90 sec manual",      after: "< 10 sec",      improvement: "Automated structured entry", category: "labor"   },
      { label: "Multi-unit coordination",           before: "Sequential radio",        after: "Simultaneous broadcast", improvement: "All units notified at once", category: "speed" },
      { label: "CCTV evidence capture at time of event", before: "Reactive, often missed", after: "Automatic at detection", improvement: "100% capture rate",  category: "compliance" },
      { label: "Officer positioning time",          before: "8 – 12 min",             after: "3 – 5 min",     improvement: "55%+ faster",            category: "speed"      },
    ],
  },

  // ── WF-05-ACSCTR: Access Control / Perimeter Breach ───────────────────────
  {
    workflowId: "WF-05-ACSCTR",
    headline: "Breach detected and credential revoked in under 90 seconds",
    annualValue: "$200K – $500K",
    roiMultiple: "6 – 12×",
    narrative:
      "Access control breaches at government and enterprise facilities — tailgating, forced entry, repeated badge failures — are frequently missed or responded to too slowly when relying on manual patrol and passive alarm systems. VAI™ integrates badge readers, door sensors, and live camera feeds into a single detection pipeline that automatically verifies breach type, dispatches on-site security with full context, and remotely locks down affected zones while revoking suspect credentials — all before an officer arrives on scene. The credential revocation and audit-trail preservation steps are particularly high-value for compliance-sensitive environments.",
    metrics: [
      { label: "Breach detection time",             before: "5 – 15 min (patrol rounds)", after: "< 30 sec",  improvement: "97% faster",             category: "speed"      },
      { label: "False alarm rate",                  before: "20 – 30%",                   after: "< 5%",      improvement: "AI visual verification",  category: "accuracy"   },
      { label: "CCTV verification time",            before: "3 – 5 min manual pull",      after: "< 45 sec",  improvement: "85% faster",             category: "speed"      },
      { label: "Credential revocation time",        before: "15 – 30 min (manual)",       after: "< 5 sec (automated)", improvement: "99% faster",    category: "speed"      },
      { label: "Incident documentation time",       before: "45 – 90 min manual",         after: "10 min review", improvement: "Structured auto-report", category: "labor"  },
      { label: "Audit trail completeness",          before: "Variable — often partial",   after: "100% timestamped", improvement: "Full evidentiary record", category: "compliance" },
      { label: "Unauthorized access incidents/yr",  before: "Baseline",                   after: "40 – 60%↓", improvement: "Deterrence + detection", category: "safety"     },
    ],
  },

  // ── WF-09-DSPAGT: Dispatch Agent / 911 Call Handling ──────────────────────
  {
    workflowId: "WF-09-DSPAGT",
    headline: "Call-to-dispatch in under 45 seconds with AI-assisted triage",
    annualValue: "$300K – $800K",
    roiMultiple: "5 – 10×",
    narrative:
      "911 dispatch operations are measured by call-to-dispatch time, unit utilization rates, and dispatch accuracy. In high-volume environments, human dispatchers face cognitive overload during simultaneous multi-call peaks — leading to prioritization errors, delayed routing, and SLA misses. VAI™'s dispatch workflow ingests CAD data, real-time sensor feeds, and call audio to automatically classify call priority, identify the optimal responding units, and pre-populate dispatch instructions — reducing the dispatcher's cognitive burden from real-time synthesis to supervised confirmation. The result is faster dispatch, fewer missed priority classifications, and better resource utilization across the fleet.",
    metrics: [
      { label: "Call-to-dispatch time",             before: "90 – 180 sec manual",  after: "< 45 sec",      improvement: "67%+ faster",             category: "speed"      },
      { label: "Priority classification accuracy",  before: "85 – 90%",             after: "97%+",          improvement: "Multi-source AI triage",  category: "accuracy"   },
      { label: "Unit utilization improvement",      before: "Baseline",             after: "15 – 20%↑",     improvement: "Proximity + capacity optimization", category: "labor" },
      { label: "Simultaneous call handling",        before: "1–2 per dispatcher",   after: "5+ with AI triage", improvement: "Peak load management",  category: "labor"      },
      { label: "SLA compliance (P1 response)",      before: "88 – 92%",             after: "97%+",          improvement: "AI prioritization prevents P1 misses", category: "compliance" },
      { label: "Repeat-caller incident linkage",    before: "Manual, missed 20–30%", after: "Automated",    improvement: "CAD pattern matching",    category: "accuracy"   },
      { label: "Dispatcher cognitive load (peak)",  before: "High — synthesis + routing", after: "Supervised confirmation only", improvement: "Significant reduction", category: "labor" },
    ],
  },

  // ── WF-21-ILLDMP: Illegal Dumping ─────────────────────────────────────────
  {
    workflowId: "WF-21-ILLDMP",
    headline: "Illegal dumping detected within 5 seconds — evidence captured automatically",
    annualValue: "$100K – $300K",
    roiMultiple: "4 – 8×",
    narrative:
      "Illegal dumping costs municipalities $25–$100K per cleanup event when hazmat is involved, and creates regulatory liability when environmental contamination goes undetected. Traditional patrol-and-report workflows detect dumping 24–72 hours after the fact — long after the perpetrator is gone and evidence has degraded. VAI™ detects dumping events in real time via camera feeds, automatically captures timestamped CCTV evidence for prosecution, triggers a coordinated multi-agency response, and produces a structured case file that improves prosecution success rates from under 10% to over 50% in cities with live camera coverage.",
    metrics: [
      { label: "Detection lag",                     before: "24 – 72 hrs (patrol/complaint)", after: "< 5 sec (AI camera)", improvement: "99.9% faster",      category: "speed"      },
      { label: "Prosecution-grade evidence rate",   before: "30 – 40%",                       after: "95%+",               improvement: "Auto-capture at event", category: "compliance" },
      { label: "Multi-agency coordination time",    before: "2 – 4 hrs manual notifications", after: "< 30 min",           improvement: "85% faster",         category: "speed"      },
      { label: "Perpetrator identification rate",   before: "10 – 15%",                       after: "40 – 60%",           improvement: "3–4× improvement",   category: "accuracy"   },
      { label: "Hazmat detection accuracy",         before: "Visual only — inconsistent",     after: "AI visual + pattern matching", improvement: "Consistent classification", category: "safety" },
      { label: "Cleanup cost recovery (perpetrator)", before: "< 5% of cases",               after: "30 – 50% of cases",  improvement: "10× improvement",    category: "compliance" },
      { label: "Environmental incidents per site/yr", before: "Baseline",                     after: "50 – 70%↓",          improvement: "Deterrence effect",  category: "safety"     },
    ],
  },

  // ── WF-22-CROWD: Crowd Management ─────────────────────────────────────────
  {
    workflowId: "WF-22-CROWD",
    headline: "Capacity alerts at 75% threshold — 60 seconds after crossing",
    annualValue: "$250K – $600K",
    roiMultiple: "6 – 12×",
    narrative:
      "Crowd density incidents — from uncomfortable overcrowding to crush injuries — are the leading cause of mass-casualty events at public venues. Traditional gate-count systems lag 5–15 minutes behind real occupancy and provide no spatial density data. VAI™ delivers real-time crowd density by zone, with threshold alerts at configurable levels (75% / 90% / critical), automated PA messaging triggers, and multi-agency coordination protocols. For a mid-size venue operating 100 events/year, the combination of reduced overtime staffing costs, avoided overcrowding incidents, and insurance premium reduction typically delivers 6–12× ROI in year one.",
    metrics: [
      { label: "Capacity threshold alert lag",      before: "5 – 15 min (gate counts)", after: "< 60 sec",          improvement: "94%+ faster",           category: "speed"      },
      { label: "Spatial density visibility",        before: "Total count only",          after: "Zone-level heatmap", improvement: "Granular crowd intelligence", category: "accuracy" },
      { label: "Overcrowding incident rate",        before: "Baseline",                  after: "60 – 70%↓",         improvement: "Early intervention effect", category: "safety"   },
      { label: "Staffing optimization accuracy",    before: "± 25 – 35% manual estimate", after: "± 8%",             improvement: "AI demand forecasting",  category: "labor"      },
      { label: "Event MCI response time",           before: "8 – 15 min mobilization",  after: "< 3 min",           improvement: "Pre-staged per density model", category: "speed"  },
      { label: "Post-event crowd data reporting",   before: "Manual estimate, 24 hrs",   after: "Automated, real-time", improvement: "Instant analytics",   category: "labor"      },
      { label: "OSHA/fire code compliance rate",    before: "Reactive",                  after: "Proactive, threshold-based", improvement: "Continuous compliance", category: "compliance" },
    ],
  },

  // ── WF-24-STVEH: Stolen Vehicle / LPR Hot Plate ───────────────────────────
  {
    workflowId: "WF-24-STVEH",
    headline: "LPR hit verified and unit assigned in under 10 seconds",
    annualValue: "$500K – $1.5M",
    roiMultiple: "8 – 15×",
    narrative:
      "License Plate Recognition (LPR) systems generate large volumes of hits — but the time-consuming bottleneck is verification: cross-referencing against NCIC, DMV, and active BOLOs, classifying the hit type, and assigning the right unit with the right risk profile. Manual workflows take 2–5 minutes and frequently miss high-risk flags (armed occupant, violent offender). VAI™ automates NCIC cross-reference, classifies hit type and risk level, pre-stages backup units for high-risk stops, and flags officer safety alerts — all before the assigned unit begins approach. The result is higher vehicle recovery rates, fewer dangerous surprises at stops, and a complete chain-of-custody record for prosecution.",
    metrics: [
      { label: "LPR hit-to-unit-notification",     before: "2 – 5 min manual",            after: "< 10 sec",       improvement: "95%+ faster",           category: "speed"      },
      { label: "NCIC verification accuracy",        before: "90 – 95% (human error)",       after: "99.5%+",         improvement: "Automated cross-reference", category: "accuracy" },
      { label: "Vehicle recovery rate",             before: "15 – 20% of LPR hits",         after: "35 – 45%",       improvement: "2–3× improvement",      category: "accuracy"   },
      { label: "Officer safety risk flagging",      before: "Manual query — missed ~15%",   after: "Automated every hit", improvement: "100% flag coverage", category: "safety"    },
      { label: "High-risk stop preparation time",  before: "Unstructured, reactive",        after: "Pre-staged per risk score", improvement: "Proactive positioning", category: "speed" },
      { label: "Chain of custody documentation",   before: "Manual, inconsistent",          after: "Automated timestamped record", improvement: "Prosecution-ready", category: "compliance" },
      { label: "Impound process time",             before: "45 – 90 min coordination",      after: "15 – 20 min",    improvement: "70%+ faster",           category: "labor"      },
    ],
  },
];

// Merge swimlane ROI into the main WORKFLOW_ROI array
WORKFLOW_ROI.push(...SWIMLANE_ROI);

// ── Persona types ──────────────────────────────────────────────────────────────

export interface Persona {
  role: string;
  initials: string;
  department: string;
  goals: string[];
  painPoints: string[];   // without VAI™
  gains: string[];        // with VAI™
  quote?: string;
}

export interface WorkflowPersonaData {
  workflowId: string;
  personas: Persona[];
}

// ── Persona data ───────────────────────────────────────────────────────────────

export const WORKFLOW_PERSONAS: WorkflowPersonaData[] = [

  // ── WF-04-GUNSHOT: Gunshot Detection ──────────────────────────────────────
  {
    workflowId: "WF-04-GUNSHOT",
    personas: [
      {
        role: "911 Call Dispatcher",
        initials: "CD",
        department: "Emergency Communications Center",
        goals: [
          "Dispatch the right units to the right location in under 60 seconds",
          "Coordinate simultaneous incidents without losing situational awareness",
          "Ensure EMS is staged safely before officers clear the scene",
        ],
        painPoints: [
          "Callers often can't pinpoint exact location — address reconciliation wastes critical seconds",
          "Simultaneous calls during an active shooter event create cognitive overload",
          "No automated way to verify shots fired vs. fireworks without camera access",
        ],
        gains: [
          "VAI™ delivers a pre-triaged alert with confirmed coordinates before the first caller connects",
          "AI-drafted dispatch script reduces keystrokes to a single confirmation tap",
          "Camera feed thumbnail attached to the incident record for instant visual confirmation",
        ],
        quote: "\"When I get the alert with the pin already dropped, I'm dispatching units before the call even rings.\"",
      },
      {
        role: "Patrol Officer",
        initials: "PO",
        department: "Field Operations",
        goals: [
          "Arrive on scene with full situational context, not just an address",
          "Coordinate perimeter setup before suspect can flee the area",
          "Maintain personal safety during an active threat response",
        ],
        painPoints: [
          "Dispatch instructions often lack building layout, number of shots, or suspect description",
          "Radio chatter from multiple units creates confusion about perimeter assignment",
          "No real-time camera feed in the patrol vehicle to observe conditions before arrival",
        ],
        gains: [
          "Mobile alert includes shot count, suspected direction of travel, and nearest camera view",
          "AI-assigned perimeter sectors reduce radio coordination overhead by 60%",
          "Live camera feed accessible via MDT reduces approach-route risk",
        ],
      },
      {
        role: "Watch Commander",
        initials: "WC",
        department: "Police Operations",
        goals: [
          "Maintain visibility across all active incidents from the command center",
          "Ensure resource allocation matches threat level without over-committing units",
          "Produce accurate after-action reports for department and community review",
        ],
        painPoints: [
          "CAD entries are often incomplete during fast-moving incidents",
          "After-action timelines must be reconstructed from radio logs and officer recollections",
          "Difficult to evaluate dispatcher and unit performance without structured data",
        ],
        gains: [
          "VAI™ creates a timestamped event log automatically — no reconstruction required",
          "Resource utilization dashboard shows unit assignment and response times in real time",
          "Structured after-action report generated on incident closure for one-click review",
        ],
      },
    ],
  },

  // ── WF-05-ACSCTR: Access Control Breach ──────────────────────────────────
  {
    workflowId: "WF-05-ACSCTR",
    personas: [
      {
        role: "SOC Analyst",
        initials: "SA",
        department: "Security Operations Center",
        goals: [
          "Detect unauthorized access events before a threat actor reaches a critical zone",
          "Reduce alarm fatigue from low-confidence or false triggers",
          "Maintain a complete audit trail for every door event",
        ],
        painPoints: [
          "Badge-only systems generate dozens of nuisance alarms per shift — most are false",
          "Cross-referencing camera footage with badge logs is a manual, time-consuming process",
          "No automated way to escalate a real breach vs. an employee error without human review",
        ],
        gains: [
          "VAI™ fuses badge, door sensor, and camera feeds — only verified breaches trigger escalation",
          "False alarm rate drops from 25% to under 5%, reducing alert fatigue significantly",
          "Full timestamped event record auto-generated — no manual correlation needed",
        ],
        quote: "\"I used to spend half my shift chasing false alarms. Now every alert I see is real.\"",
      },
      {
        role: "On-site Security Officer",
        initials: "SO",
        department: "Physical Security",
        goals: [
          "Intercept unauthorized individuals before they reach sensitive areas",
          "Respond with the right level of force — verified threat vs. tailgater",
          "Document the incident accurately for incident reports and potential prosecution",
        ],
        painPoints: [
          "Dispatched to alarms without knowing if the person is still on-site or which direction they went",
          "Camera footage review requires returning to the security desk — delays real-time response",
          "Incident documentation is handwritten and often incomplete under pressure",
        ],
        gains: [
          "Mobile alert includes live camera view and last-known location before officer arrives",
          "AI-generated incident summary pre-fills the report — officer reviews and signs off",
          "Credential revocation happens automatically, eliminating the need for a manual IT request",
        ],
      },
      {
        role: "IT / Access Control Administrator",
        initials: "IT",
        department: "IT Security",
        goals: [
          "Ensure access privileges are revoked immediately upon a confirmed breach",
          "Maintain compliance with access control audit requirements",
          "Minimize the blast radius of a credential compromise",
        ],
        painPoints: [
          "Credential revocations triggered by security events can take 15–30 minutes to process manually",
          "Access logs are siloed from physical security systems — cross-referencing is ad hoc",
          "Compliance reports require pulling data from multiple systems into a single document",
        ],
        gains: [
          "VAI™ triggers automated credential revocation in under 5 seconds upon breach confirmation",
          "Unified access event log exported directly to SIEM for compliance reporting",
          "Anomaly pattern detection flags repeated failed badge attempts before a breach occurs",
        ],
      },
    ],
  },

  // ── WF-09-DSPAGT: Dispatch Agent ──────────────────────────────────────────
  {
    workflowId: "WF-09-DSPAGT",
    personas: [
      {
        role: "911 Dispatcher",
        initials: "DX",
        department: "Emergency Communications Center",
        goals: [
          "Classify every incoming call accurately and dispatch the right units in under 60 seconds",
          "Handle simultaneous peak-volume calls without missing priority events",
          "Reduce errors in unit assignment due to cognitive overload",
        ],
        painPoints: [
          "Call classification is done manually while simultaneously gathering caller information",
          "Peak periods result in queue buildup and delayed P1 responses",
          "Verbal caller descriptions are often inaccurate — location errors extend response times",
        ],
        gains: [
          "AI pre-classifies the call and suggests dispatch instructions before the call is answered",
          "Simultaneous call handling capacity increases from 2 to 5+ with AI triage assistance",
          "Location auto-verified against CAD and sensor feeds before dispatch confirmation",
        ],
        quote: "\"It's like having a second dispatcher who never gets tired and never misses a detail.\"",
      },
      {
        role: "Shift Supervisor",
        initials: "SS",
        department: "Emergency Communications",
        goals: [
          "Maintain SLA compliance across all P1 and P2 calls during the shift",
          "Identify performance gaps and intervene before they cause a missed response",
          "Produce end-of-shift reports without manually aggregating call logs",
        ],
        painPoints: [
          "Real-time visibility into dispatcher queue depth is limited to spot checks",
          "SLA misses are identified after the fact — no early warning system",
          "Shift handoff reports require 30–45 minutes of manual data compilation",
        ],
        gains: [
          "Live dashboard shows queue depth, dispatcher utilization, and SLA status by call type",
          "AI flags at-risk SLAs 90 seconds before threshold breach — enables proactive rebalancing",
          "End-of-shift report auto-generated with call volume, response times, and exception summary",
        ],
      },
      {
        role: "Field Unit Officer",
        initials: "FU",
        department: "Patrol / Field Operations",
        goals: [
          "Receive accurate, complete dispatch information before arriving on scene",
          "Minimize travel time by taking the best route given current conditions",
          "Understand incident context — prior calls at the address, known subjects",
        ],
        painPoints: [
          "Dispatch instructions sometimes contain errors that only surface on arrival",
          "No integration between dispatch system and real-time traffic — routing is manual",
          "Prior incident history at an address requires a separate MDT query mid-response",
        ],
        gains: [
          "AI-generated dispatch note includes address history, known subjects, and hazard flags",
          "Optimal route calculated with live traffic overlay pushed to MDT at dispatch",
          "Dynamic updates pushed during response if situation evolves before arrival",
        ],
      },
    ],
  },

  // ── WF-13-WTHR: Weather Alert ──────────────────────────────────────────────
  {
    workflowId: "WF-13-WTHR",
    personas: [
      {
        role: "Traffic Operations Analyst",
        initials: "TO",
        department: "Traffic Operations Center",
        goals: [
          "Detect adverse weather conditions before they create queue buildup or collisions",
          "Push MUTCD-compliant DMS messages to affected corridors within 90 seconds",
          "Maintain accurate 511 advisories without manual refresh cycles",
        ],
        painPoints: [
          "RWIS thresholds require manual monitoring — alerts are often noticed late in the shift",
          "DMS message drafting takes 5–10 minutes per sign group, delaying traveler notification",
          "511 advisory updates are a separate manual workflow from DMS deployment",
        ],
        gains: [
          "VAI™ fires automatically on RWIS threshold crossing — zero manual monitoring required",
          "MUTCD-compliant DMS messages drafted and deployed in under 75 seconds",
          "511 and navigation platform updates happen in the same automated pipeline as DMS",
        ],
        quote: "\"Weather alerts used to be a 15-minute scramble. Now I just verify and approve.\"",
      },
      {
        role: "Emergency Management Coordinator",
        initials: "EM",
        department: "Emergency Management",
        goals: [
          "Coordinate multi-agency response when weather degrades to emergency conditions",
          "Ensure public messaging is consistent across all channels during a weather event",
          "Document the event timeline for post-event review and grant reporting",
        ],
        painPoints: [
          "Traffic ops, highway patrol, and DOT operate on separate systems with no shared view",
          "Public messaging is often delayed while agencies coordinate what to say",
          "Post-event reports require assembling data from three or four separate systems",
        ],
        gains: [
          "VAI™ produces a shared event log visible across TOC, highway patrol, and EMC simultaneously",
          "AI-drafted public advisory is consistent with DMS messaging — review and publish in one step",
          "Structured event record auto-generated for FEMA and grant reporting requirements",
        ],
      },
    ],
  },

  // ── WF-14-TRAFQ: Traffic Queue Detection ──────────────────────────────────
  {
    workflowId: "WF-14-TRAFQ",
    personas: [
      {
        role: "Traffic Operations Center Analyst",
        initials: "TC",
        department: "Traffic Operations Center",
        goals: [
          "Detect queue backup before it reaches a high-speed merge or interchange",
          "Deploy DMS end-of-queue warnings in time to prevent rear-end collisions",
          "Monitor multiple corridors simultaneously without missing developing queues",
        ],
        painPoints: [
          "Loop detector data requires manual interpretation — queue length estimates are imprecise",
          "By the time a queue is visible on camera, the hazard zone has already formed",
          "DMS sign selection and message drafting pulls attention away from other monitoring tasks",
        ],
        gains: [
          "AI correlates VDS, probe data, and camera feeds to confirm queue before analyst acts",
          "End-of-queue DMS message deployed in under 60 seconds from detection",
          "Automated monitoring frees the analyst to focus on exception handling, not data collection",
        ],
      },
      {
        role: "Signal Control Engineer",
        initials: "SE",
        department: "Traffic Engineering",
        goals: [
          "Identify recurring queue locations that indicate signal timing inefficiency",
          "Validate that signal retiming interventions are having the intended effect",
          "Support incident-driven timing changes without manual overrides",
        ],
        painPoints: [
          "Queue event data is rarely structured enough to drive signal optimization decisions",
          "Correlation between queue events and signal phases requires manual data analysis",
          "Incident-driven timing changes are reactive and take 10–20 minutes to implement",
        ],
        gains: [
          "Every queue event is logged with corridor, time, length, and contributing factors",
          "Aggregated queue data identifies recurring hotspots for proactive signal retiming",
          "VAI™ can trigger pre-approved signal plan changes automatically during confirmed queue events",
        ],
      },
    ],
  },

  // ── WF-15-PLNCLS: Planned Closure ─────────────────────────────────────────
  {
    workflowId: "WF-15-PLNCLS",
    personas: [
      {
        role: "Traffic Operations Manager",
        initials: "TM",
        department: "Traffic Operations Center",
        goals: [
          "Publish accurate traveler information for planned closures days in advance",
          "Coordinate DMS messaging, 511, and navigation platform updates as a single workflow",
          "Minimize traveler confusion and complaints during planned closure windows",
        ],
        painPoints: [
          "Closure information comes in from construction, utilities, and events in unstructured formats",
          "DMS scheduling, 511 updates, and nav app notifications are three separate manual workflows",
          "Last-minute changes to closure windows require re-doing all notifications from scratch",
        ],
        gains: [
          "VAI™ ingests closure data from any source and auto-populates the notification pipeline",
          "All three channels (DMS, 511, navigation) updated simultaneously from one approval step",
          "Schedule changes trigger automatic re-drafting of all affected notifications for review",
        ],
        quote: "\"What used to take three separate workflows now takes one approval click.\"",
      },
      {
        role: "Construction Project Coordinator",
        initials: "CP",
        department: "Capital Projects",
        goals: [
          "Ensure lane closure permits are reflected accurately in traveler information systems",
          "Receive confirmation that public notifications went out before work crews mobilize",
          "Coordinate with TOC when closure schedules change without causing communication gaps",
        ],
        painPoints: [
          "No feedback loop to confirm that permit data was received and published by TOC",
          "Schedule changes communicated by email often result in outdated DMS messages remaining active",
          "Coordination calls between project team and TOC are time-consuming during active work windows",
        ],
        gains: [
          "Automated confirmation sent to project coordinator when closure notification goes live",
          "Schedule change submitted via portal — VAI™ updates all downstream notifications automatically",
          "Shared event dashboard reduces coordination calls by giving both teams the same view",
        ],
      },
    ],
  },

  // ── WF-16-CRITINC: Critical Incident ──────────────────────────────────────
  {
    workflowId: "WF-16-CRITINC",
    personas: [
      {
        role: "Incident Commander",
        initials: "IC",
        department: "Field Incident Command",
        goals: [
          "Establish a common operating picture for all responding agencies within minutes of arrival",
          "Make resource allocation decisions based on real-time scene intelligence",
          "Document incident timeline accurately for after-action review",
        ],
        painPoints: [
          "Information from different agencies arrives via radio, text, and phone — no single source of truth",
          "Resource requests and assignments tracked on paper or whiteboards at the command post",
          "After-action reports require interviewing multiple personnel to reconstruct the timeline",
        ],
        gains: [
          "VAI™ aggregates feeds from all agencies into a single incident dashboard updated in real time",
          "Resource assignments tracked digitally — commander sees unit status and location on one screen",
          "Full timestamped event log auto-generated — after-action report in hours, not days",
        ],
      },
      {
        role: "EOC Director",
        initials: "ED",
        department: "Emergency Operations Center",
        goals: [
          "Support field operations without creating unnecessary reporting burden for incident command",
          "Ensure elected officials and media affairs have accurate, consistent information",
          "Activate mutual aid agreements at the right threshold based on incident severity",
        ],
        painPoints: [
          "EOC receives fragmented status updates that lag field conditions by 15–30 minutes",
          "Public information requests arrive before EOC has verified information from the field",
          "Mutual aid activation thresholds are judgment calls with no supporting data structure",
        ],
        gains: [
          "Live incident dashboard gives EOC the same operating picture as field command",
          "AI-drafted situation report auto-generated every 30 minutes for executive briefings",
          "Severity scoring triggers mutual aid threshold notifications automatically as conditions escalate",
        ],
        quote: "\"For the first time, I can brief the mayor without calling the field commander first.\"",
      },
    ],
  },

  // ── WF-17-MLTCOM: Multi-Communication Management ──────────────────────────
  {
    workflowId: "WF-17-MLTCOM",
    personas: [
      {
        role: "Communications Director",
        initials: "CD",
        department: "Emergency Communications",
        goals: [
          "Maintain interoperable communications across police, fire, EMS, and mutual aid agencies",
          "Prevent critical radio traffic from being missed during high-volume incidents",
          "Ensure communication logs are complete for NIMS compliance and after-action review",
        ],
        painPoints: [
          "Interoperability patches between P25 and other radio systems are manually configured",
          "High-volume incidents create radio congestion that buries priority traffic",
          "Communication logs across multiple radio channels must be manually compiled post-incident",
        ],
        gains: [
          "VAI™ monitors all channels simultaneously and surfaces priority traffic automatically",
          "AI detects communication gaps and alerts the director when a channel goes silent unexpectedly",
          "Unified log across all channels auto-compiled — NIMS-ready export on incident closure",
        ],
      },
      {
        role: "Field Unit Commander",
        initials: "FC",
        department: "Field Operations",
        goals: [
          "Receive clear, relevant communications without being overwhelmed by multi-channel traffic",
          "Confirm that critical orders were received and acknowledged by all assigned units",
          "Coordinate with other agency commanders without leaving the field",
        ],
        painPoints: [
          "Multi-channel traffic requires constant monitoring of 2–3 radio channels simultaneously",
          "Acknowledgement of orders is informal — no way to confirm all units received a message",
          "Cross-agency coordination requires switching channels manually, which creates delays",
        ],
        gains: [
          "AI filters relevant traffic to the field commander's channel — noise is suppressed",
          "Automated acknowledgement tracking shows which units have confirmed receipt of orders",
          "Cross-agency messages routed intelligently — no manual channel switching required",
        ],
      },
    ],
  },

  // ── WF-18-FRRYFLD: Ferry Flood ────────────────────────────────────────────
  {
    workflowId: "WF-18-FRRYFLD",
    personas: [
      {
        role: "Maritime Operations Controller",
        initials: "MO",
        department: "Ferry / Maritime Operations",
        goals: [
          "Detect flood or surge conditions before they affect vessel safety or terminal operations",
          "Coordinate passenger communication and service suspension without creating panic",
          "Ensure vessel crews have real-time environmental data during transit",
        ],
        painPoints: [
          "Tide gauge and water level data is monitored manually — alert lag is 15–30 minutes",
          "Passenger notification systems require manual drafting and approval under time pressure",
          "Vessel crew and terminal operations communicate via radio — no shared situational picture",
        ],
        gains: [
          "VAI™ monitors environmental sensors continuously and fires alerts before threshold breach",
          "Passenger notifications drafted and pushed to all channels (app, PA, digital boards) automatically",
          "Shared operations dashboard visible to vessel crew, terminal staff, and control center simultaneously",
        ],
        quote: "\"We used to find out about surge conditions from a deckhand calling in. Now we know before they do.\"",
      },
      {
        role: "Emergency Response Coordinator",
        initials: "ER",
        department: "Emergency Management",
        goals: [
          "Initiate multi-agency flood response protocols before conditions become critical",
          "Coordinate passenger evacuation from affected terminals with transit and public safety",
          "Document the event for FEMA reimbursement and post-event review",
        ],
        painPoints: [
          "Activation of flood protocols depends on receiving notification from maritime ops — often delayed",
          "Evacuation coordination across transit, police, and ferry operations has no common platform",
          "FEMA documentation requires assembling sensor logs, communications records, and timelines manually",
        ],
        gains: [
          "VAI™ sends concurrent alerts to emergency management and maritime ops simultaneously",
          "Shared incident dashboard enables cross-agency evacuation coordination from a single view",
          "Structured event log with sensor data, decision timestamps, and communications ready for FEMA",
        ],
      },
    ],
  },

  // ── WF-19-TRAFINC: Traffic Incident ───────────────────────────────────────
  {
    workflowId: "WF-19-TRAFINC",
    personas: [
      {
        role: "Traffic Operations Analyst",
        initials: "TA",
        department: "Traffic Operations Center",
        goals: [
          "Detect traffic incidents faster than the first 911 call to reduce secondary collision risk",
          "Deploy upstream warning DMS and ramp metering within 90 seconds of detection",
          "Coordinate with highway patrol and tow dispatch without leaving the TOC workstation",
        ],
        painPoints: [
          "Video analytics generate false positives — analysts waste time verifying non-incidents",
          "Manual coordination with highway patrol and tow dispatch involves separate phone calls",
          "DMS message selection and routing to the right sign group takes 5–8 minutes under pressure",
        ],
        gains: [
          "AI multi-source corroboration (camera + probe + 911) reduces false positives to under 3%",
          "Coordinated notification to highway patrol and tow dispatch sent automatically on confirmation",
          "DMS messages pre-drafted with correct sign groups — analyst approves in a single click",
        ],
      },
      {
        role: "Highway Patrol Dispatcher",
        initials: "HP",
        department: "Highway Patrol",
        goals: [
          "Receive verified incident details before dispatching units — not unverified 911 calls",
          "Know which units are closest to the incident and available to respond",
          "Maintain safety corridor coordination with TOC during major incident clearance",
        ],
        painPoints: [
          "TOC notifications arrive via phone — information quality depends on who answers",
          "Unit location and availability data requires checking a separate CAD system",
          "Safety corridor setup requires back-and-forth with TOC to coordinate DMS messaging timing",
        ],
        gains: [
          "VAI™ pushes verified incident data directly to HP CAD — no phone call required",
          "Nearest available unit suggested automatically based on real-time location and status",
          "Safety corridor DMS coordination handled in shared platform — eliminates phone coordination",
        ],
      },
    ],
  },

  // ── WF-20-CMPRPT: Compliance Reporting ────────────────────────────────────
  {
    workflowId: "WF-20-CMPRPT",
    personas: [
      {
        role: "Compliance Officer",
        initials: "CO",
        department: "Regulatory Compliance",
        goals: [
          "Produce accurate, audit-ready compliance reports without manual data aggregation",
          "Identify non-compliance events and remediate before a regulatory audit",
          "Ensure all operational data required for reporting is captured at the time of the event",
        ],
        painPoints: [
          "Monthly compliance reports require pulling data from 4–6 separate operational systems",
          "Non-compliance events often go unlogged in real time — discovered during report compilation",
          "Report formatting for different regulatory bodies requires manual reformatting each cycle",
        ],
        gains: [
          "VAI™ captures compliance-relevant events automatically at the source — no retroactive logging",
          "Compliance dashboard shows real-time status against all reporting thresholds",
          "Report templates pre-formatted for each regulatory body — one-click export on deadline",
        ],
        quote: "\"I used to spend a week compiling each quarterly report. Now it takes an afternoon to review.\"",
      },
      {
        role: "Operations Manager",
        initials: "OM",
        department: "Operations",
        goals: [
          "Ensure operational teams understand compliance requirements without creating reporting overhead",
          "Identify recurring compliance gaps and address them at the process level",
          "Minimize the risk of regulatory penalties from missed or inaccurate reporting",
        ],
        painPoints: [
          "Frontline staff don't consistently log events in a way that supports compliance reporting",
          "Compliance gaps are identified months after they occur — remediation options are limited",
          "Cost of compliance-related penalties and audit preparation is difficult to quantify for leadership",
        ],
        gains: [
          "Automated event capture removes the logging burden from frontline staff entirely",
          "Real-time gap detection allows remediation within days, not months",
          "Penalty risk quantification report generated automatically — ready for executive review",
        ],
      },
    ],
  },

  // ── WF-21-ILLDMP: Illegal Dumping ─────────────────────────────────────────
  {
    workflowId: "WF-21-ILLDMP",
    personas: [
      {
        role: "Environmental Enforcement Officer",
        initials: "EE",
        department: "Environmental Services",
        goals: [
          "Catch illegal dumping in the act — not 24 hours later when the vehicle is gone",
          "Build prosecution-grade evidence cases without manual evidence collection at the scene",
          "Prioritize hazmat dumping events over general waste for immediate response",
        ],
        painPoints: [
          "Patrol coverage of monitored sites is limited to a few passes per day — events go undetected",
          "Evidence collected after the fact is often insufficient for prosecution",
          "No automated way to distinguish hazmat dumping from general waste without on-scene assessment",
        ],
        gains: [
          "VAI™ detects dumping events in real time and alerts enforcement within 5 seconds",
          "Timestamped CCTV clips and license plate captures automatically preserved as evidence",
          "AI classifies dump type (general, hazmat, construction) and triggers appropriate response tier",
        ],
        quote: "\"We went from 10% prosecution rate to over 50% because the evidence is already captured when I get there.\"",
      },
      {
        role: "Public Works Coordinator",
        initials: "PW",
        department: "Public Works",
        goals: [
          "Minimize cleanup costs by responding to dumping events before contamination spreads",
          "Recover cleanup costs from perpetrators when prosecution is successful",
          "Track chronic dump sites to inform resource allocation and camera placement",
        ],
        painPoints: [
          "Cleanup crews are dispatched reactively — hazmat events are often not identified until arrival",
          "Cost recovery from perpetrators requires evidence that is rarely available after the fact",
          "Chronic dump sites are identified informally — no data to support infrastructure investment decisions",
        ],
        gains: [
          "Hazmat classification triggers pre-staging of appropriate cleanup resources before crew arrival",
          "Prosecution-grade evidence collected by VAI™ supports cost recovery in 30–50% of cases",
          "Aggregated dump event data identifies chronic sites for targeted camera and signage investment",
        ],
      },
    ],
  },

  // ── WF-22-CROWD: Crowd Management ─────────────────────────────────────────
  {
    workflowId: "WF-22-CROWD",
    personas: [
      {
        role: "Crowd Management Coordinator",
        initials: "CM",
        department: "Event Operations",
        goals: [
          "Monitor crowd density across all venue zones without relying on visual estimation",
          "Initiate crowd control measures at 75% capacity — before conditions become dangerous",
          "Coordinate entry management, flow rerouting, and staged entry without radio chaos",
        ],
        painPoints: [
          "Manual crowd counting at gates and zones is imprecise and lags actual conditions by 10–15 minutes",
          "By the time a crowd management decision is made, the situation has often already escalated",
          "Coordination between gate staff, security, and venue operations relies on radio — easy to miss",
        ],
        gains: [
          "AI crowd counting provides zone-level density in real time — accurate to within 5%",
          "Automated threshold alerts fire at 75%, 90%, and 100% capacity — no manual monitoring required",
          "Coordinated alerts pushed to gate staff, security, and venue operations simultaneously",
        ],
        quote: "\"I can see the crowd building in the west concourse before my staff even notices — that's the difference.\"",
      },
      {
        role: "Venue Security Director",
        initials: "VD",
        department: "Venue Security",
        goals: [
          "Prevent crowd crush events through early identification and intervention",
          "Allocate security personnel to zones based on real-time density data, not guesswork",
          "Ensure compliance with venue permit capacity limits across all areas simultaneously",
        ],
        painPoints: [
          "Security staffing decisions are based on historical patterns — not live conditions",
          "Permit compliance depends on gate staff manually tracking entries — prone to undercount",
          "Critical incident response during high-density events is slowed by communications confusion",
        ],
        gains: [
          "Real-time density heat map enables dynamic security redeployment to emerging hotspots",
          "Automated permit compliance tracking with alerts when zone capacity approaches the permit limit",
          "Pre-defined incident response plans triggered automatically at escalation thresholds",
        ],
      },
    ],
  },

  // ── WF-24-STVEH: Stolen Vehicle / LPR ────────────────────────────────────
  {
    workflowId: "WF-24-STVEH",
    personas: [
      {
        role: "Patrol Dispatcher",
        initials: "PD",
        department: "Police Dispatch",
        goals: [
          "Alert patrol units to LPR hot plate hits within 30 seconds of detection",
          "Provide complete vehicle and plate context before units make contact",
          "Coordinate multi-unit containment strategy without creating radio congestion",
        ],
        painPoints: [
          "LPR alerts require manual cross-check against hot plate databases before dispatch",
          "Multiple simultaneous LPR hits in different precincts create prioritization challenges",
          "Containment strategy coordination relies on voice radio — easy to miss or misinterpret",
        ],
        gains: [
          "VAI™ automatically cross-references LPR hits against NCIC and local stolen vehicle lists",
          "Hit verification and dispatch note generated in under 30 seconds — dispatcher confirms and sends",
          "Containment perimeter suggested based on hit location, road network, and unit positions",
        ],
      },
      {
        role: "Patrol Officer",
        initials: "PA",
        department: "Patrol",
        goals: [
          "Intercept stolen vehicles without high-speed pursuits that endanger the public",
          "Approach vehicle contacts with full intelligence — occupant history, vehicle status, warrants",
          "Document the stop, pursuit, and recovery accurately for the case file",
        ],
        painPoints: [
          "LPR alert details arrive via radio — often partial, with plates read aloud and potentially misheard",
          "No real-time confirmation of vehicle status between initial hit and making contact",
          "Stop documentation requires manual entry after the fact — details are often forgotten",
        ],
        gains: [
          "Full LPR hit detail pushed to MDT — no radio transcription errors",
          "Real-time vehicle status confirmation available on MDT throughout the stop",
          "AI-generated stop report pre-populated from GPS, MDT interaction, and CAD — officer reviews and signs",
        ],
        quote: "\"Having the full plate hit on my MDT before I even make the stop changes the whole approach.\"",
      },
      {
        role: "Records / Intelligence Analyst",
        initials: "RA",
        department: "Records & Intelligence",
        goals: [
          "Identify vehicle theft patterns and hotspot locations to support targeted enforcement",
          "Ensure all LPR hits are logged and linked to the correct vehicle and suspect records",
          "Provide investigators with complete LPR history for prosecution support",
        ],
        painPoints: [
          "LPR hit data is stored in a separate system from investigative case files — linkage is manual",
          "Pattern analysis across hundreds of hits per day requires manual data export and manipulation",
          "Court-ready LPR evidence packages require pulling data from multiple sources and formatting manually",
        ],
        gains: [
          "VAI™ automatically links each LPR hit to the relevant case record in the investigative system",
          "Pattern analysis dashboard identifies theft hotspots and peak periods automatically",
          "Court-ready evidence package — images, timestamps, location data — generated on request in minutes",
        ],
      },
    ],
  },
];

// ── Lookup helpers ─────────────────────────────────────────────────────────────

export function getDiagramData(workflowId: string): WorkflowDiagramData | null {
  return WORKFLOW_DIAGRAMS.find((d) => d.workflowId === workflowId) ?? null;
}

export function getROIData(workflowId: string): WorkflowROIData | null {
  return WORKFLOW_ROI.find((r) => r.workflowId === workflowId) ?? null;
}

export function getSwimlaneWebp(workflowId: string): string | null {
  return WORKFLOW_SWIMLANE_WEBP[workflowId] ?? null;
}

export function getPersonaData(workflowId: string): WorkflowPersonaData | null {
  return WORKFLOW_PERSONAS.find((p) => p.workflowId === workflowId) ?? null;
}

// ── Data Source types ──────────────────────────────────────────────────────────

export type DataSourceType = "sensor" | "camera" | "database" | "api" | "cad" | "feed";

export interface DataSource {
  name: string;
  fullName?: string;
  type: DataSourceType;
  description: string;
  players?: string[];   // specific platforms / vendors shown on card front
  provider?: string;
  standard?: string;
}

export interface WorkflowDataSourceData {
  workflowId: string;
  sources: DataSource[];
}

// ── Data Source data ───────────────────────────────────────────────────────────

export const WORKFLOW_DATA_SOURCES: WorkflowDataSourceData[] = [

  // ── WF-04-GUNSHOT ──────────────────────────────────────────────────────────
  {
    workflowId: "WF-04-GUNSHOT",
    sources: [
      { name: "ShotSpotter",        fullName: "Gunshot Detection Acoustic Sensor Network", type: "sensor",   players: ["ShotSpotter", "Forensic Logic", "Sound Intelligence", "Shotpoint"], description: "Triangulates shot location within 25 m and classifies firearm type from acoustic signature in real time", standard: "NIEM" },
      { name: "Genetec / Milestone", fullName: "Video Management System",                 type: "camera",   players: ["Genetec Security Center", "Milestone XProtect", "Axis", "Hanwha"],    description: "Live VMS feed corroborates acoustic hit — suspect direction of travel, scene context, and crowd presence" },
      { name: "Motorola PremierOne", fullName: "Computer-Aided Dispatch System",          type: "cad",      players: ["Motorola PremierOne", "Tyler New World", "Hexagon Intergraph"],        description: "Incident creation, unit assignment, and real-time status tracking from call receipt to scene clearance", standard: "NIEM / APCO P25" },
      { name: "NCIC / NLETS",       fullName: "National Crime Information Center",        type: "database", players: ["FBI CJIS", "NLETS", "State AFIS"],                                      description: "Warrant, weapon, and subject history lookups before officer approach; results appended to dispatch record", standard: "CJIS" },
      { name: "P25 Radio",          fullName: "Project 25 Digital Radio Network",         type: "feed",     players: ["Motorola APX Series", "Harris XG-100", "EF Johnson", "Kenwood NX"],   description: "Unit-to-dispatch voice traffic and acknowledgement tracking throughout the active response", standard: "TIA-102" },
      { name: "NG911 / ANI-ALI",    fullName: "Next-Gen 911 — Automatic Number & Location Identification", type: "feed", players: ["RapidSOS", "Intrado", "West / Conduent", "Carbyne"], description: "Caller phone number and verified geolocation pre-populated before dispatcher answers the 911 call", standard: "NENA i3" },
    ],
  },

  // ── WF-05-ACSCTR ───────────────────────────────────────────────────────────
  {
    workflowId: "WF-05-ACSCTR",
    sources: [
      { name: "Lenel / C•CURE",   fullName: "Physical Access Control System",        type: "sensor",   players: ["Lenel S2", "Software House C•CURE 9000", "Honeywell Pro-Watch", "Genetec Synergis"], description: "Badge read events, door state (open/closed/forced), credential validation timestamps — primary breach trigger", standard: "OSDP / Wiegand" },
      { name: "HID / Allegion",   fullName: "Smart Card Credential & Door Hardware", type: "sensor",   players: ["HID Global", "Allegion Schlage", "ASSA ABLOY", "Suprema"],                description: "Forced-entry and door-held-open detection independent of badge reader — provides secondary sensor layer" },
      { name: "Genetec / Axis",   fullName: "Video Management System",               type: "camera",   players: ["Genetec Security Center", "Axis", "Hanwha", "Bosch"],                     description: "Visual verification of tailgating, forced entry, and suspect identity at the breach point" },
      { name: "Azure AD / Okta",  fullName: "Enterprise Identity & Directory",       type: "database", players: ["Microsoft Azure AD", "Okta", "Ping Identity", "CyberArk"],               description: "Credential status lookup and automated revocation target — badge deactivated in < 5 sec on breach confirmation", standard: "LDAP / SCIM" },
      { name: "Splunk / QRadar",  fullName: "Security Information & Event Mgmt.",   type: "database", players: ["Splunk Enterprise Security", "IBM QRadar", "Microsoft Sentinel", "Sumo Logic"], description: "Receives structured breach events for correlation with cyber activity and compliance audit logging", standard: "CEF / LEEF" },
      { name: "Motorola PremierOne", fullName: "Security Personnel Dispatch CAD",   type: "cad",      players: ["Motorola PremierOne", "Tyler New World", "Resolver"],                     description: "Security personnel dispatch and incident tracking for physical on-scene response", standard: "NIEM" },
    ],
  },

  // ── WF-09-DSPAGT ───────────────────────────────────────────────────────────
  {
    workflowId: "WF-09-DSPAGT",
    sources: [
      { name: "NG911 / RapidSOS",  fullName: "Next-Gen 911 Enhanced Location Service", type: "feed",     players: ["RapidSOS", "Intrado", "Carbyne", "West Safety"],                       description: "Caller identity, verified device geolocation, and health data pre-populated before dispatcher answers", standard: "NENA i3" },
      { name: "Motorola PremierOne", fullName: "Computer-Aided Dispatch System",        type: "cad",      players: ["Motorola PremierOne", "Tyler New World", "Hexagon Intergraph"],        description: "Incident creation, AI-assisted priority classification, and unit assignment record", standard: "NIEM / APCO" },
      { name: "Motorola AVL",      fullName: "Automatic Vehicle Location",              type: "feed",     players: ["Motorola Solutions", "Verizon Connect", "Samsara", "Axon Fleet"],      description: "Real-time GPS position, speed, and availability status of all patrol and emergency units" },
      { name: "NCIC / NLETS",      fullName: "National Crime Information Center",       type: "database", players: ["FBI CJIS", "NLETS", "State AFIS"],                                     description: "Subject warrant checks and vehicle queries triggered by caller or location context", standard: "CJIS" },
      { name: "Mark43 / Tyler RMS", fullName: "Records Management System",             type: "database", players: ["Mark43", "Tyler Supervision", "Axon Records", "Omnigo"],              description: "Prior incident history at address and known-subject records appended to AI-generated dispatch note" },
      { name: "Nuance / Google STT", fullName: "Real-Time 911 Call Transcription",     type: "feed",     players: ["Nuance Communications", "Google Cloud Speech", "AWS Transcribe", "Deepgram"], description: "AI transcription of caller audio — extracts location keywords, incident type signals, and threat indicators" },
    ],
  },

  // ── WF-13-WTHR ─────────────────────────────────────────────────────────────
  {
    workflowId: "WF-13-WTHR",
    sources: [
      { name: "RWIS / Vaisala",   fullName: "Road Weather Information System",    type: "sensor",   players: ["Vaisala", "Campbell Scientific", "Lufft", "High Sierra Electronics"], description: "Pavement temperature, friction, precipitation, visibility, and wind speed at roadside stations", standard: "NTCIP 1204" },
      { name: "NWS / NOAA API",   fullName: "National Weather Service Data Feed", type: "feed",     players: ["NOAA / NWS", "Weather Decision Technologies", "DTN", "IBM Weather"],   description: "Forecast, storm cell, and road-impact data to contextualize RWIS readings and project corridor deterioration" },
      { name: "Daktronics DMS",   fullName: "Dynamic Message Sign Control",       type: "api",      players: ["Daktronics", "SWARCO", "Skyline Products", "Vaisala IMS"],              description: "NTCIP-compliant ATMS interface to deploy MUTCD-compliant messages to corridor sign groups", standard: "NTCIP 1203" },
      { name: "511 / ATIS",       fullName: "511 Advanced Traveler Info System",  type: "api",      players: ["iCone", "Iteris", "Waze CCP", "511 Regional Operators"],                description: "IVR phone and web advisory publication for affected corridors — automatically refreshed on condition change" },
      { name: "INRIX / HERE",     fullName: "Connected Vehicle Probe Data & Navigation Push", type: "api", players: ["INRIX", "HERE Technologies", "TomTom", "Waze Partner Hub"],  description: "Real-time probe speed inbound; weather advisories pushed to INRIX, Waze, Google, and HERE outbound" },
    ],
  },

  // ── WF-14-TRAFQ ────────────────────────────────────────────────────────────
  {
    workflowId: "WF-14-TRAFQ",
    sources: [
      { name: "Wavetronix / Sensys", fullName: "Vehicle Detection System — Loop & Radar", type: "sensor", players: ["Wavetronix", "Sensys Networks", "Iteris", "Inductive Automation"], description: "30-second speed, occupancy, and volume readings from embedded loops and roadside radar on mainline and ramps", standard: "NTCIP 1209" },
      { name: "INRIX / HERE",     fullName: "Connected Vehicle Probe Data",               type: "feed",   players: ["INRIX", "HERE Technologies", "TomTom", "Waze"],                      description: "GPS-derived speed samples from commercial fleet and navigation apps — corroborates VDS queue confirmation" },
      { name: "Genetec / Axis",   fullName: "Roadway Camera Network",                     type: "camera", players: ["Genetec", "Axis", "Hanwha", "Bosch"],                                description: "Visual confirmation of queue length, shoulder occupancy, and stopped-vehicle positions before DMS deployment" },
      { name: "Daktronics DMS",   fullName: "Dynamic Message Sign Control",               type: "api",    players: ["Daktronics", "SWARCO", "Skyline Products"],                          description: "Deploys end-of-queue and reduced-speed advisories to upstream sign groups via NTCIP", standard: "NTCIP 1203" },
      { name: "Econolite / Iteris", fullName: "Ramp Metering Control System",            type: "api",    players: ["Econolite", "Iteris", "SWARCO", "Aldridge"],                         description: "Automated metering rate adjustments on on-ramps upstream of detected queue", standard: "NTCIP 1210" },
    ],
  },

  // ── WF-15-PLNCLS ───────────────────────────────────────────────────────────
  {
    workflowId: "WF-15-PLNCLS",
    sources: [
      { name: "Accela / Salesforce", fullName: "Lane Closure Permit Management",    type: "database", players: ["Accela", "Salesforce Gov Cloud", "OpenGov", "ServiceNow"],              description: "Approved closure windows, affected lane configurations, and contractor contact information" },
      { name: "Daktronics DMS",    fullName: "Dynamic Message Sign Control",         type: "api",      players: ["Daktronics", "SWARCO", "Skyline Products"],                             description: "Scheduled DMS message activation and deactivation aligned with approved closure window", standard: "NTCIP 1203" },
      { name: "511 / ATIS",        fullName: "511 Advanced Traveler Info System",    type: "api",      players: ["iCone", "Iteris", "511 Regional Operators"],                           description: "Pre-event and real-time advisories for planned closure duration, alternate routing, and ETA impact" },
      { name: "Waze / HERE / Google", fullName: "Navigation Platform Closure APIs", type: "api",      players: ["Waze Partner Hub", "HERE Traffic", "Google Maps Platform", "INRIX"],   description: "Closure data pushed to navigation platforms for route avoidance and real-time re-routing" },
      { name: "ESRI ArcGIS",       fullName: "Geographic Information System",       type: "database", players: ["ESRI ArcGIS", "Hexagon", "Trimble", "Bentley Map"],                    description: "Road network geometry for detour route calculation and affected DMS sign group identification" },
    ],
  },

  // ── WF-16-CRITINC ──────────────────────────────────────────────────────────
  {
    workflowId: "WF-16-CRITINC",
    sources: [
      { name: "Motorola PremierOne", fullName: "Multi-Agency Computer-Aided Dispatch", type: "cad",    players: ["Motorola PremierOne", "Tyler New World", "Hexagon Intergraph"],          description: "Incident record, resource assignments, and real-time status from all responding agencies", standard: "NIEM / APCO" },
      { name: "Motorola AVL",      fullName: "Automatic Vehicle Location",              type: "feed",   players: ["Motorola Solutions", "Verizon Connect", "Samsara"],                      description: "GPS positions of all responding units overlaid on incident map for commander situational awareness" },
      { name: "NWS / NOAA API",    fullName: "National Weather Service Data Feed",     type: "feed",   players: ["NOAA / NWS", "Weather Decision Technologies", "DTN"],                   description: "Weather conditions at the incident scene — affects evacuation routing and aerial asset decisions" },
      { name: "ESRI ArcGIS",       fullName: "Geographic Information System",          type: "database", players: ["ESRI ArcGIS", "Hexagon", "Pitney Bowes"],                             description: "Facility floor plans, hazmat pre-plans, evacuation routes, and mutual aid boundary overlays" },
      { name: "P25 Radio",         fullName: "Project 25 Interoperable Radio Network", type: "feed",   players: ["Motorola APX", "Harris XG-100", "EF Johnson"],                          description: "Multi-agency radio traffic monitoring and automated interoperability patch management", standard: "TIA-102" },
      { name: "Genetec / Milestone", fullName: "Incident Area VMS",                    type: "camera", players: ["Genetec Security Center", "Milestone XProtect", "Axis", "Hanwha"],      description: "Live scene view for EOC, remote command staff, and EOC director briefings" },
    ],
  },

  // ── WF-17-MLTCOM ───────────────────────────────────────────────────────────
  {
    workflowId: "WF-17-MLTCOM",
    sources: [
      { name: "P25 Radio",         fullName: "Project 25 Multi-Agency Radio",          type: "feed",   players: ["Motorola APX Series", "Harris XG-100", "EF Johnson", "Kenwood NX"],    description: "Primary voice communications across law enforcement, fire, and EMS channels", standard: "TIA-102" },
      { name: "FirstNet / LTE",    fullName: "First Responder Network Authority",       type: "feed",   players: ["AT&T FirstNet", "Verizon Push-to-Talk", "ESChat", "TeamConnect"],       description: "Broadband PTT and data communications — used by mutual aid agencies not on P25 network", standard: "3GPP LTE" },
      { name: "Motorola PremierOne", fullName: "Computer-Aided Dispatch",              type: "cad",    players: ["Motorola PremierOne", "Tyler New World"],                                description: "Unit assignment and message acknowledgement tracking correlated with radio traffic", standard: "NIEM" },
      { name: "Motorola AVL",      fullName: "Automatic Vehicle Location",              type: "feed",   players: ["Motorola Solutions", "Verizon Connect"],                               description: "Unit positions overlaid with communications activity for unified situational awareness" },
      { name: "NICE Inform",       fullName: "PSAP Recording & Telephony",             type: "feed",   players: ["NICE Inform", "Eventide", "Motorola Solutions", "Verint"],              description: "911 call queue status, call recording, and caller-to-dispatcher connection state", standard: "NENA i3" },
    ],
  },

  // ── WF-18-FRRYFLD ──────────────────────────────────────────────────────────
  {
    workflowId: "WF-18-FRRYFLD",
    sources: [
      { name: "NOAA CO-OPS",       fullName: "NOAA / NOS Tide & Water Level Network", type: "sensor", players: ["NOAA CO-OPS", "USGS StreamStats", "Aanderaa", "YSI / Xylem"],            description: "Real-time water level, tidal predictions, and surge data at terminal and approach channel stations", standard: "CO-OPS API" },
      { name: "NWS / NOAA Marine", fullName: "NWS Marine Forecast & Storm Surge",     type: "feed",   players: ["NOAA / NWS", "Copernicus Marine", "StormGeo", "DTN"],                   description: "Marine zone forecasts, storm surge predictions, and coastal flood watch / warning feeds" },
      { name: "MarineTraffic / AIS", fullName: "Automatic Identification System",     type: "feed",   players: ["MarineTraffic", "VesselFinder", "exactAIS", "SpireGlobal"],             description: "Vessel position, speed, and heading for all active ferry routes and nearby vessel traffic", standard: "ITU-R M.1371" },
      { name: "Terminal IoT",      fullName: "Ferry Terminal IoT Sensor Network",      type: "sensor", players: ["Siemens", "Schneider Electric", "Yokogawa", "Emerson"],                  description: "Dock water level, gangway angle, gate state, and passenger boarding sensor readings" },
      { name: "Everbridge / Rave", fullName: "Mass Notification & Passenger Alert",   type: "api",    players: ["Everbridge", "Rave Mobile Safety", "OnSolve", "Omnilert"],              description: "Mobile app push, terminal PA, digital boards, and SMS — unified from single VAI™ trigger" },
    ],
  },

  // ── WF-19-TRAFINC ──────────────────────────────────────────────────────────
  {
    workflowId: "WF-19-TRAFINC",
    sources: [
      { name: "Iteris / Miovision", fullName: "AI Video Analytics — Incident Detection", type: "camera", players: ["Iteris", "Miovision", "Genetec Citigraf", "Bosch IVAS"],             description: "Computer vision detection of stopped vehicles, debris, wrong-way travel, and pedestrians on roadway" },
      { name: "INRIX / HERE",      fullName: "Connected Vehicle Probe Data",              type: "feed",   players: ["INRIX", "HERE Technologies", "TomTom", "Waze"],                      description: "Speed anomaly detection on affected corridor — corroborates camera detection before DMS deployment" },
      { name: "NG911 / CAD Feed",  fullName: "911 CAD Incident Data Feed",               type: "cad",    players: ["Motorola PremierOne", "Tyler New World", "RapidSOS"],                 description: "Corroborating 911 calls and confirmed CAD incident records for multi-source verification", standard: "NIEM" },
      { name: "Daktronics DMS",    fullName: "Dynamic Message Sign Control",              type: "api",    players: ["Daktronics", "SWARCO", "Skyline Products"],                          description: "Upstream warning, speed-reduction, and incident-ahead messages deployed on confirmation", standard: "NTCIP 1203" },
      { name: "HP CAD / AVL",      fullName: "Highway Patrol CAD & Vehicle Location",    type: "cad",    players: ["Motorola PremierOne", "Tyler New World", "Verizon Connect"],          description: "Nearest available HP unit selection and dispatch on verified incident confirmation" },
      { name: "Agero / Solera",    fullName: "Tow & Incident Clearance Dispatch",        type: "api",    players: ["Agero", "Solera", "Dispatch.me", "Towbook"],                         description: "Automated tow request routed to nearest rotation tower — reduces clearance time by 30–40%" },
    ],
  },

  // ── WF-20-CMPRPT ───────────────────────────────────────────────────────────
  {
    workflowId: "WF-20-CMPRPT",
    sources: [
      { name: "ATMS / SunGuide",   fullName: "Advanced Traffic Management System",      type: "database", players: ["ATMS", "SunGuide (FDOT)", "TransSuite", "KITS"],                       description: "DMS activation logs, incident records, detection events, and response time data for all TOC shifts" },
      { name: "DMS Audit Logs",    fullName: "Dynamic Message Sign Audit Trail",        type: "database", players: ["Daktronics", "SWARCO", "Skyline Products"],                           description: "Message content, activation timestamp, duration, and field device confirmation for every DMS event", standard: "NTCIP 1203" },
      { name: "511 / ATIS Logs",   fullName: "511 ATIS Advisory Activity Log",          type: "database", players: ["iCone", "Iteris", "511 Regional Operators"],                          description: "Advisory publication timestamps, duration, caller engagement, and content accuracy records" },
      { name: "IMMS / Meridian",   fullName: "Incident Management System",             type: "database", players: ["Meridian", "IMMS", "TransCore", "Stantec ATMS"],                      description: "Incident type, detection-to-clearance times, agency response records, and contributing factor data" },
      { name: "SAP / IBM Maximo",  fullName: "Maintenance Work Order System",          type: "database", players: ["SAP", "IBM Maximo", "Cityworks", "Cartegraph"],                       description: "Planned closure permits and maintenance activity logs that affect operational compliance metrics" },
      { name: "FHWA HPMS Portal",  fullName: "FHWA & State DOT Regulatory Reporting",  type: "api",      players: ["FHWA", "State DOT Portals", "MAP-21 / IIJA Compliance Tools"],        description: "Pre-formatted compliance report export templates for FHWA, MAP-21, and state DOT annual requirements" },
    ],
  },

  // ── WF-21-ILLDMP ───────────────────────────────────────────────────────────
  {
    workflowId: "WF-21-ILLDMP",
    sources: [
      { name: "Axis / Hanwha AI",  fullName: "AI Video Analytics — Dumping Detection", type: "camera",   players: ["Axis", "Hanwha", "Bosch", "Vaidio", "BriefCam"],                      description: "Computer vision detection of dumping behavior — vehicle stop pattern, door open sequence, item unloading" },
      { name: "Vigilant / AutoVu", fullName: "License Plate Recognition",               type: "camera",   players: ["Vigilant Solutions", "Genetec AutoVu", "Motorola ALPR", "Rekor"],    description: "Vehicle plate captured at detection time — primary evidence for perpetrator ID and citation" },
      { name: "AAMVA / State DMV", fullName: "Motor Vehicle Registration Database",     type: "database", players: ["AAMVA", "State DMV Systems", "LexisNexis Risk"],                      description: "Plate-to-owner lookup for enforcement notification, citation issuance, and cost recovery" },
      { name: "EPA ECHO / DEQ",    fullName: "Environmental Agency Hazmat Database",    type: "database", players: ["EPA ECHO", "State DEQ Portals", "RCRA InfoHub", "E-Enterprise"],      description: "Hazmat material classifications to determine response tier and regulatory notification requirements" },
      { name: "Motorola PremierOne", fullName: "Municipal CAD / Dispatch System",       type: "cad",      players: ["Motorola PremierOne", "Tyler New World"],                              description: "Law enforcement and environmental officer dispatch with incident context and hazmat classification attached" },
      { name: "Axon Evidence",     fullName: "Digital Evidence Management",             type: "database", players: ["Axon Evidence", "NICE Investigate", "Motorola PremierOne"], description: "Timestamped CCTV clips and LPR captures preserved as prosecution-grade evidence", standard: "CJIS" },
    ],
  },

  // ── WF-22-CROWD ────────────────────────────────────────────────────────────
  {
    workflowId: "WF-22-CROWD",
    sources: [
      { name: "Axis / Hanwha Crowd AI", fullName: "AI Crowd Density Analytics",     type: "camera",   players: ["Axis", "Hanwha", "Bosch", "Crowd Vision", "BriefCam"],                  description: "Per-zone crowd density estimation accurate to ±5% — updated every 10 seconds via edge analytics" },
      { name: "Gunnebo / Fastlane", fullName: "Turnstile & Venue Entry System",      type: "sensor",   players: ["Gunnebo", "Fastlane Turnstiles", "Alvarado", "Boon Edam"],              description: "Cumulative and real-time entry count per gate — reconciled against camera density for permit compliance" },
      { name: "VenueIQ",           fullName: "Venue Capacity Management Platform",   type: "database", players: ["VenueIQ", "Venuex", "PTC Inc", "Crowd Connected"],                     description: "Zone permit capacities, real-time occupancy counts, and 3-level threshold alert configuration" },
      { name: "Motorola Radio / PA", fullName: "Venue Radio & Public Address System", type: "feed",    players: ["Motorola Solutions", "Bosch PA", "QSC", "Crown"],                      description: "Security radio coordination and public address messaging for crowd direction and emergency announcements" },
      { name: "Motorola PremierOne", fullName: "Fire / EMS / Police Dispatch CAD",  type: "cad",      players: ["Motorola PremierOne", "Tyler New World"],                               description: "Pre-staged emergency unit dispatch triggered automatically at Level 3 escalation threshold", standard: "NIEM" },
    ],
  },

  // ── WF-24-STVEH ────────────────────────────────────────────────────────────
  {
    workflowId: "WF-24-STVEH",
    sources: [
      { name: "Vigilant / AutoVu LPR", fullName: "License Plate Recognition Network", type: "camera",   players: ["Vigilant Solutions", "Genetec AutoVu", "Motorola ALPR", "Rekor"],    description: "Fixed and mobile LPR readers scanning plates against NCIC hot list in real time" },
      { name: "NCIC / NLETS",     fullName: "NCIC Stolen Vehicle File & NLETS",        type: "database", players: ["FBI CJIS", "NLETS", "State Hot Files", "AAMVA"],                       description: "Federal stolen vehicle hot plate database updated in near-real time — primary hit validation source", standard: "CJIS" },
      { name: "AAMVA / State DMV", fullName: "Motor Vehicle Registration Database",    type: "database", players: ["AAMVA", "State DMV Systems"],                                          description: "Registered owner, vehicle description, and lien holder returned on confirmed LPR hit" },
      { name: "Motorola PremierOne", fullName: "Computer-Aided Dispatch System",       type: "cad",      players: ["Motorola PremierOne", "Tyler New World", "Hexagon Intergraph"],        description: "Unit assignment and pursuit coordination from the moment of hot plate confirmation", standard: "NIEM / APCO" },
      { name: "Motorola AVL",      fullName: "Automatic Vehicle Location",             type: "feed",     players: ["Motorola Solutions", "Verizon Connect", "Samsara"],                   description: "Real-time position of all patrol units — used to select nearest available for interception" },
      { name: "Mark43 / Tyler RMS", fullName: "Records Management System",            type: "database", players: ["Mark43", "Tyler Supervision", "Axon Records"],                        description: "Prior stop and arrest history linked to plate and registered owner for officer safety context" },
    ],
  },
];

export function getDataSourceData(workflowId: string): WorkflowDataSourceData | null {
  return WORKFLOW_DATA_SOURCES.find((d) => d.workflowId === workflowId) ?? null;
}

// ── Matrix types ───────────────────────────────────────────────────────────────

export type RBACLevel = "admin" | "operator" | "responder" | "viewer";
export type CJISLevel = "full" | "limited" | "none";

export interface MatrixRole {
  role: string;
  initials: string;
  department: string;
  rbac: RBACLevel;
  cjis: CJISLevel;
  responsibilities: string[];
  /** Must match DataSource.name values for this workflow */
  accessSources: string[];
}

export interface WorkflowMatrixData {
  workflowId: string;
  roles: MatrixRole[];
}

// ── Matrix data ────────────────────────────────────────────────────────────────

export const WORKFLOW_MATRICES: WorkflowMatrixData[] = [

  // ── WF-04-GUNSHOT ──────────────────────────────────────────────────────────
  {
    workflowId: "WF-04-GUNSHOT",
    roles: [
      {
        role: "911 Dispatcher", initials: "CD", department: "Emergency Comm. Center",
        rbac: "operator", cjis: "full",
        responsibilities: ["Verify shot location & type", "Dispatch units with scene context", "Coordinate EMS staging"],
        accessSources: ["ShotSpotter", "Genetec / Milestone", "Motorola PremierOne", "NCIC / NLETS", "P25 Radio", "NG911 / ANI-ALI"],
      },
      {
        role: "Patrol Officer", initials: "PO", department: "Field Operations",
        rbac: "responder", cjis: "full",
        responsibilities: ["Respond & establish perimeter", "Conduct directed searches", "Report scene status"],
        accessSources: ["Motorola PremierOne", "P25 Radio", "NCIC / NLETS"],
      },
      {
        role: "Watch Commander", initials: "WC", department: "Police Operations",
        rbac: "admin", cjis: "full",
        responsibilities: ["Authorize resource escalation", "Monitor incident timeline", "Approve after-action report"],
        accessSources: ["Motorola PremierOne", "Genetec / Milestone", "NCIC / NLETS"],
      },
    ],
  },

  // ── WF-05-ACSCTR ───────────────────────────────────────────────────────────
  {
    workflowId: "WF-05-ACSCTR",
    roles: [
      {
        role: "SOC Analyst", initials: "SA", department: "Security Operations Center",
        rbac: "operator", cjis: "none",
        responsibilities: ["Monitor access events", "Verify breach type via camera", "Escalate confirmed breaches"],
        accessSources: ["Lenel / C•CURE", "HID / Allegion", "Genetec / Axis", "Splunk / QRadar"],
      },
      {
        role: "Security Officer", initials: "SO", department: "Physical Security",
        rbac: "responder", cjis: "none",
        responsibilities: ["Respond to breach on-scene", "Apprehend unauthorized individual", "Document incident"],
        accessSources: ["Motorola PremierOne", "Genetec / Axis"],
      },
      {
        role: "IT / Access Admin", initials: "IT", department: "IT Security",
        rbac: "admin", cjis: "none",
        responsibilities: ["Revoke compromised credentials", "Audit access logs", "Update access policies"],
        accessSources: ["Azure AD / Okta", "Splunk / QRadar", "Lenel / C•CURE"],
      },
    ],
  },

  // ── WF-09-DSPAGT ───────────────────────────────────────────────────────────
  {
    workflowId: "WF-09-DSPAGT",
    roles: [
      {
        role: "911 Dispatcher", initials: "DX", department: "Emergency Comm. Center",
        rbac: "operator", cjis: "full",
        responsibilities: ["Classify & triage incoming calls", "Select & dispatch units", "Monitor active incidents"],
        accessSources: ["NG911 / RapidSOS", "Motorola PremierOne", "Motorola AVL", "NCIC / NLETS", "Mark43 / Tyler RMS", "Nuance / Google STT"],
      },
      {
        role: "Shift Supervisor", initials: "SS", department: "Emergency Communications",
        rbac: "admin", cjis: "full",
        responsibilities: ["Monitor SLA compliance", "Rebalance dispatcher workload", "Approve mutual aid"],
        accessSources: ["Motorola PremierOne", "Motorola AVL"],
      },
      {
        role: "Field Unit Officer", initials: "FU", department: "Patrol / Field Ops",
        rbac: "responder", cjis: "full",
        responsibilities: ["Acknowledge dispatch", "Report arrival & status", "Update incident record"],
        accessSources: ["Motorola PremierOne", "Motorola AVL"],
      },
    ],
  },

  // ── WF-13-WTHR ─────────────────────────────────────────────────────────────
  {
    workflowId: "WF-13-WTHR",
    roles: [
      {
        role: "Traffic Ops Analyst", initials: "TO", department: "Traffic Operations Center",
        rbac: "operator", cjis: "none",
        responsibilities: ["Monitor RWIS thresholds", "Approve DMS messages", "Publish 511 advisories"],
        accessSources: ["RWIS / Vaisala", "NWS / NOAA API", "Daktronics DMS", "511 / ATIS", "INRIX / HERE"],
      },
      {
        role: "Emergency Mgmt Coord.", initials: "EM", department: "Emergency Management",
        rbac: "viewer", cjis: "none",
        responsibilities: ["Coordinate multi-agency response", "Authorize emergency protocols", "Review public messaging"],
        accessSources: ["NWS / NOAA API", "511 / ATIS"],
      },
    ],
  },

  // ── WF-14-TRAFQ ────────────────────────────────────────────────────────────
  {
    workflowId: "WF-14-TRAFQ",
    roles: [
      {
        role: "Traffic Ops Analyst", initials: "TC", department: "Traffic Operations Center",
        rbac: "operator", cjis: "none",
        responsibilities: ["Confirm queue detection", "Deploy DMS end-of-queue warning", "Activate ramp metering"],
        accessSources: ["Wavetronix / Sensys", "INRIX / HERE", "Genetec / Axis", "Daktronics DMS", "Econolite / Iteris"],
      },
      {
        role: "Signal Control Engineer", initials: "SE", department: "Traffic Engineering",
        rbac: "admin", cjis: "none",
        responsibilities: ["Validate detection accuracy", "Configure timing plans", "Approve automated interventions"],
        accessSources: ["Wavetronix / Sensys", "Daktronics DMS", "Econolite / Iteris"],
      },
    ],
  },

  // ── WF-15-PLNCLS ───────────────────────────────────────────────────────────
  {
    workflowId: "WF-15-PLNCLS",
    roles: [
      {
        role: "Traffic Ops Manager", initials: "TM", department: "Traffic Operations Center",
        rbac: "admin", cjis: "none",
        responsibilities: ["Approve closure notifications", "Coordinate agency notifications", "Handle schedule changes"],
        accessSources: ["Accela / Salesforce", "Daktronics DMS", "511 / ATIS", "Waze / HERE / Google", "ESRI ArcGIS"],
      },
      {
        role: "Project Coordinator", initials: "CP", department: "Capital Projects",
        rbac: "viewer", cjis: "none",
        responsibilities: ["Submit closure permits", "Report schedule changes", "Confirm notification receipt"],
        accessSources: ["Accela / Salesforce"],
      },
    ],
  },

  // ── WF-16-CRITINC ──────────────────────────────────────────────────────────
  {
    workflowId: "WF-16-CRITINC",
    roles: [
      {
        role: "Incident Commander", initials: "IC", department: "Field Incident Command",
        rbac: "admin", cjis: "limited",
        responsibilities: ["Establish command structure", "Allocate responding resources", "Approve evacuation orders"],
        accessSources: ["Motorola PremierOne", "Motorola AVL", "ESRI ArcGIS", "P25 Radio", "Genetec / Milestone"],
      },
      {
        role: "EOC Director", initials: "ED", department: "Emergency Operations Center",
        rbac: "admin", cjis: "limited",
        responsibilities: ["Activate emergency operations", "Brief elected officials", "Authorize mutual aid"],
        accessSources: ["Motorola PremierOne", "Motorola AVL", "NWS / NOAA API", "ESRI ArcGIS", "Genetec / Milestone"],
      },
    ],
  },

  // ── WF-17-MLTCOM ───────────────────────────────────────────────────────────
  {
    workflowId: "WF-17-MLTCOM",
    roles: [
      {
        role: "Communications Director", initials: "CD", department: "Emergency Communications",
        rbac: "admin", cjis: "limited",
        responsibilities: ["Monitor all radio channels", "Configure interop patches", "Resolve comm failures"],
        accessSources: ["P25 Radio", "FirstNet / LTE", "Motorola PremierOne", "Motorola AVL", "NICE Inform"],
      },
      {
        role: "Field Unit Commander", initials: "FC", department: "Field Operations",
        rbac: "operator", cjis: "limited",
        responsibilities: ["Relay orders to field units", "Confirm acknowledgements", "Report tactical situation"],
        accessSources: ["P25 Radio", "FirstNet / LTE", "Motorola AVL"],
      },
    ],
  },

  // ── WF-18-FRRYFLD ──────────────────────────────────────────────────────────
  {
    workflowId: "WF-18-FRRYFLD",
    roles: [
      {
        role: "Maritime Ops Controller", initials: "MO", department: "Ferry / Maritime Ops",
        rbac: "operator", cjis: "none",
        responsibilities: ["Monitor water level thresholds", "Initiate service suspension", "Coordinate vessel positioning"],
        accessSources: ["NOAA CO-OPS", "NWS / NOAA Marine", "MarineTraffic / AIS", "Terminal IoT", "Everbridge / Rave"],
      },
      {
        role: "Emergency Response Coord.", initials: "ER", department: "Emergency Management",
        rbac: "admin", cjis: "none",
        responsibilities: ["Activate flood response protocols", "Coordinate terminal evacuation", "Interface with coast guard"],
        accessSources: ["NWS / NOAA Marine", "Everbridge / Rave"],
      },
    ],
  },

  // ── WF-19-TRAFINC ──────────────────────────────────────────────────────────
  {
    workflowId: "WF-19-TRAFINC",
    roles: [
      {
        role: "Traffic Ops Analyst", initials: "TA", department: "Traffic Operations Center",
        rbac: "operator", cjis: "none",
        responsibilities: ["Confirm incident detection", "Deploy upstream DMS warnings", "Notify highway patrol"],
        accessSources: ["Iteris / Miovision", "INRIX / HERE", "NG911 / CAD Feed", "Daktronics DMS"],
      },
      {
        role: "Highway Patrol Dispatcher", initials: "HP", department: "Highway Patrol",
        rbac: "operator", cjis: "full",
        responsibilities: ["Dispatch responding units", "Activate safety corridor", "Coordinate tow rotation"],
        accessSources: ["HP CAD / AVL", "NG911 / CAD Feed", "Daktronics DMS", "Agero / Solera"],
      },
    ],
  },

  // ── WF-20-CMPRPT ───────────────────────────────────────────────────────────
  {
    workflowId: "WF-20-CMPRPT",
    roles: [
      {
        role: "Compliance Officer", initials: "CO", department: "Regulatory Compliance",
        rbac: "viewer", cjis: "none",
        responsibilities: ["Review compliance metrics", "Identify regulatory gaps", "Publish compliance reports"],
        accessSources: ["ATMS / SunGuide", "DMS Audit Logs", "511 / ATIS Logs", "IMMS / Meridian", "SAP / IBM Maximo", "FHWA HPMS Portal"],
      },
      {
        role: "Operations Manager", initials: "OM", department: "Operations",
        rbac: "admin", cjis: "none",
        responsibilities: ["Address operational gaps", "Approve remediation actions", "Brief leadership on risk"],
        accessSources: ["ATMS / SunGuide", "IMMS / Meridian", "SAP / IBM Maximo"],
      },
    ],
  },

  // ── WF-21-ILLDMP ───────────────────────────────────────────────────────────
  {
    workflowId: "WF-21-ILLDMP",
    roles: [
      {
        role: "Env. Enforcement Officer", initials: "EE", department: "Environmental Services",
        rbac: "operator", cjis: "limited",
        responsibilities: ["Respond to dumping alerts", "Classify hazmat type on-scene", "Initiate enforcement action"],
        accessSources: ["Axis / Hanwha AI", "Vigilant / AutoVu", "AAMVA / State DMV", "EPA ECHO / DEQ", "Motorola PremierOne"],
      },
      {
        role: "Public Works Coordinator", initials: "PW", department: "Public Works",
        rbac: "viewer", cjis: "none",
        responsibilities: ["Deploy cleanup crews", "Coordinate hazmat response", "Track site recurrence"],
        accessSources: ["Motorola PremierOne", "EPA ECHO / DEQ"],
      },
      {
        role: "Law Enforcement Officer", initials: "LE", department: "Law Enforcement",
        rbac: "responder", cjis: "full",
        responsibilities: ["Respond to enforcement request", "Detain subject if on-scene", "Preserve evidence chain"],
        accessSources: ["Motorola PremierOne", "Vigilant / AutoVu", "Axon Evidence"],
      },
    ],
  },

  // ── WF-22-CROWD ────────────────────────────────────────────────────────────
  {
    workflowId: "WF-22-CROWD",
    roles: [
      {
        role: "Crowd Mgmt Coordinator", initials: "CM", department: "Event Operations",
        rbac: "operator", cjis: "none",
        responsibilities: ["Monitor zone density levels", "Initiate crowd control measures", "Coordinate entry management"],
        accessSources: ["Axis / Hanwha Crowd AI", "Gunnebo / Fastlane", "VenueIQ", "Motorola Radio / PA"],
      },
      {
        role: "Venue Security Director", initials: "VD", department: "Venue Security",
        rbac: "admin", cjis: "none",
        responsibilities: ["Authorize escalation response", "Approve emergency dispatch", "Ensure permit compliance"],
        accessSources: ["Axis / Hanwha Crowd AI", "VenueIQ", "Motorola PremierOne"],
      },
      {
        role: "EOC / Dispatch Operator", initials: "EO", department: "Emergency Communications",
        rbac: "operator", cjis: "none",
        responsibilities: ["Receive Level 3 escalation alert", "Dispatch fire / EMS / police", "Log incident in CAD"],
        accessSources: ["Motorola PremierOne", "Motorola Radio / PA"],
      },
    ],
  },

  // ── WF-24-STVEH ────────────────────────────────────────────────────────────
  {
    workflowId: "WF-24-STVEH",
    roles: [
      {
        role: "Patrol Dispatcher", initials: "PD", department: "Police Dispatch",
        rbac: "operator", cjis: "full",
        responsibilities: ["Verify LPR hits against NCIC", "Dispatch nearest available unit", "Coordinate containment"],
        accessSources: ["Vigilant / AutoVu LPR", "NCIC / NLETS", "Motorola PremierOne", "Motorola AVL"],
      },
      {
        role: "Patrol Officer", initials: "PA", department: "Patrol",
        rbac: "responder", cjis: "full",
        responsibilities: ["Conduct vehicle stop", "Apprehend suspect", "Secure vehicle & evidence"],
        accessSources: ["Motorola PremierOne", "NCIC / NLETS", "Motorola AVL"],
      },
      {
        role: "Records / Intel Analyst", initials: "RA", department: "Records & Intelligence",
        rbac: "viewer", cjis: "full",
        responsibilities: ["Link LPR hits to case records", "Identify theft patterns", "Prepare prosecution package"],
        accessSources: ["Vigilant / AutoVu LPR", "NCIC / NLETS", "AAMVA / State DMV", "Mark43 / Tyler RMS"],
      },
    ],
  },
];

export function getMatrixData(workflowId: string): WorkflowMatrixData | null {
  return WORKFLOW_MATRICES.find((m) => m.workflowId === workflowId) ?? null;
}

// ── Canonical Role Library ──────────────────────────────────────────────────
//
// This is the source-of-truth for every role that appears in VAI™ workflows.
// AccessLevel is more granular than the legacy RBACLevel used in matrix rows.

export type RoleCategory =
  | "command"
  | "dispatch"
  | "field-ops"
  | "security-ops"
  | "traffic-transport"
  | "emergency-mgmt"
  | "compliance"
  | "records-intel"
  | "operations";

/** Granular access level — replaces the 4-value RBACLevel for canonical roles. */
export type AccessLevel =
  | "command"     // Full system admin + tactical override authority
  | "supervisor"  // Elevated ops permissions; no system configuration
  | "operator"    // Active platform user — create/update incidents
  | "responder"   // Field user — receive & confirm tasks, limited write
  | "analyst"     // Read + annotate; no incident creation
  | "viewer";     // Read-only dashboards and reports

export interface Role {
  id: string;
  title: string;
  initials: string;
  category: RoleCategory;
  department: string;
  description: string;
  accessLevel: AccessLevel;
  cjis: CJISLevel;
  responsibilities: string[];
  /** VAI™ platform modules / systems this role can access */
  systemAccess: string[];
  /** Workflow IDs where this role is active */
  activatedIn: string[];
}

export const ROLES: Role[] = [

  // ── Command & Leadership ───────────────────────────────────────────────────

  {
    id: "watch-commander",
    title: "Watch Commander",
    initials: "WC",
    category: "command",
    department: "Police Operations",
    description: "Senior commanding officer overseeing all patrol operations and incident response for an assigned shift. Holds tactical authority over all field units and is the final approver on AI-generated incident summaries.",
    accessLevel: "command",
    cjis: "full",
    responsibilities: [
      "Authorize escalated tactical responses for active-threat incidents",
      "Review and approve AI-generated incident summaries before public release",
      "Allocate and re-deploy units across concurrent incidents",
      "Override AI dispatch recommendations when situational context warrants",
      "Sign off on after-action reports and submit to department records",
    ],
    systemAccess: ["VAI Command Dashboard", "Live Camera Feeds", "Incident Management", "Unit Tracking", "Audit Logs", "Analytics & Reports"],
    activatedIn: ["WF-04-GUNSHOT"],
  },

  {
    id: "eoc-director",
    title: "EOC Director",
    initials: "ED",
    category: "command",
    department: "Emergency Operations Center",
    description: "Executive director of the EOC responsible for multi-agency coordination during declared emergencies. Holds authority to activate FEMA IPAWS public alerts and mobilize mutual-aid resources across jurisdictions.",
    accessLevel: "command",
    cjis: "limited",
    responsibilities: [
      "Declare EOC operational levels and trigger emergency activations",
      "Authorize public alert broadcasts via IPAWS/CAP",
      "Coordinate mutual-aid requests across county and state jurisdictions",
      "Manage EOC resource tracking and interagency logistics",
      "Brief elected officials and media liaisons on evolving situations",
    ],
    systemAccess: ["VAI Command Dashboard", "IPAWS Alert Console", "Multi-Agency Feed", "Analytics & Reports", "Audit Logs"],
    activatedIn: ["WF-16-CRITINC"],
  },

  {
    id: "incident-commander",
    title: "Incident Commander",
    initials: "IC",
    category: "command",
    department: "Field Incident Command",
    description: "ICS/NIMS-certified field commander who assumes unified command at the scene of major incidents. Directs all tactical operations under Incident Command System protocols, serving as the single point of authority on scene.",
    accessLevel: "command",
    cjis: "limited",
    responsibilities: [
      "Establish and staff an Incident Command Post (ICP) upon arrival",
      "Assign Sections, Branches, and Divisions under ICS structure",
      "Authorize resource requests to EOC and mutual-aid channels",
      "Manage scene safety, personnel accountability, and tactical objectives",
      "Provide structured situation reports to EOC every 30 minutes",
    ],
    systemAccess: ["VAI Command Dashboard", "Incident Management", "Unit Tracking", "Live Camera Feeds"],
    activatedIn: ["WF-16-CRITINC"],
  },

  {
    id: "communications-director",
    title: "Communications Director",
    initials: "CD",
    category: "command",
    department: "Emergency Communications",
    description: "Chief of emergency communications responsible for multi-channel coordination across law enforcement, fire/EMS, and public-notification systems during large-scale incidents. Manages the full alert lifecycle from detection to all-clear.",
    accessLevel: "command",
    cjis: "limited",
    responsibilities: [
      "Activate emergency notification channels including IPAWS Wireless Emergency Alerts",
      "Coordinate radio interoperability between P25, CAD, and public alert systems",
      "Manage PIO messaging and synchronize with social media monitoring",
      "Oversee dispatch center staffing and rotation during surge events",
      "Authorize all-clear broadcasts and post-incident communications",
    ],
    systemAccess: ["VAI Command Dashboard", "Alert Management", "IPAWS Alert Console", "Dispatch Console", "Audit Logs"],
    activatedIn: ["WF-17-MLTCOM"],
  },

  {
    id: "venue-security-director",
    title: "Venue Security Director",
    initials: "VD",
    category: "command",
    department: "Venue Security",
    description: "Director of security operations for large venues and public events. Owns the crowd-control strategy, sets density alert thresholds, and coordinates with local law enforcement for mutual-aid deployment.",
    accessLevel: "supervisor",
    cjis: "none",
    responsibilities: [
      "Define crowd density thresholds and severity-level escalation triggers",
      "Coordinate with local police for pre-event mutual-aid staging",
      "Manage security staffing assignments across all venue zones",
      "Authorize venue lockdown, gate closures, or full evacuation procedures",
      "Conduct post-event debrief and update response protocols",
    ],
    systemAccess: ["VAI Dashboard", "Live Camera Feeds", "Incident Management", "Analytics & Reports"],
    activatedIn: ["WF-22-CROWD"],
  },

  // ── Emergency Dispatch ─────────────────────────────────────────────────────

  {
    id: "shift-supervisor",
    title: "Shift Supervisor",
    initials: "SS",
    category: "dispatch",
    department: "Emergency Communications",
    description: "Working supervisor on a PSAP dispatch floor who handles call-queue escalations, quality monitoring, and acts as interim incident commander until a Watch Commander takes over complex incidents.",
    accessLevel: "supervisor",
    cjis: "full",
    responsibilities: [
      "Review AI-triaged call queues and re-prioritize under surge conditions",
      "Escalate incidents to Watch Commander based on defined priority thresholds",
      "Monitor dispatcher performance and intervene on high-complexity calls",
      "Authorize mutual-aid dispatch requests within defined jurisdiction",
      "Generate end-of-shift incident summary report for command staff",
    ],
    systemAccess: ["Dispatch Console", "CAD System", "Incident Management", "Alert Management", "Audit Logs"],
    activatedIn: ["WF-09-DSPAGT"],
  },

  {
    id: "911-dispatcher",
    title: "911 Call Dispatcher",
    initials: "DX",
    category: "dispatch",
    department: "Emergency Communications Center",
    description: "PSAP-certified dispatcher handling inbound 911 calls, creating CAD incidents, and triaging units for law enforcement, fire, and EMS response. First human touchpoint in the AI-assisted dispatch pipeline.",
    accessLevel: "operator",
    cjis: "full",
    responsibilities: [
      "Answer inbound 911 calls and create CAD incidents within 60 seconds",
      "Triage call type and assign the appropriate tier-1, tier-2, or tier-3 response",
      "Relay AI pre-triaged alerts to on-duty units before caller connection completes",
      "Maintain radio contact with field units throughout active incidents",
      "Log all call disposition, unit status changes, and time stamps",
    ],
    systemAccess: ["Dispatch Console", "CAD System", "Live Camera Feeds", "Alert Management", "Unit Tracking"],
    activatedIn: ["WF-04-GUNSHOT", "WF-09-DSPAGT"],
  },

  {
    id: "patrol-dispatcher",
    title: "Patrol Dispatcher",
    initials: "PD",
    category: "dispatch",
    department: "Police Dispatch",
    description: "Dispatcher dedicated to patrol unit coordination, handling LPR hotlist hit notifications, non-emergency CAD entries, and real-time unit status management across an assigned sector.",
    accessLevel: "operator",
    cjis: "full",
    responsibilities: [
      "Receive and validate LPR hotlist hit alerts before broadcasting to field units",
      "Assign patrol units based on proximity, availability, and call priority",
      "Maintain unit status log and radio discipline during active pursuits",
      "Coordinate with Records for warrant confirmation on LPR-triggered stops",
      "Document vehicle pursuit events and outcomes in CAD",
    ],
    systemAccess: ["Dispatch Console", "CAD System", "LPR Dashboard", "Unit Tracking", "Alert Management"],
    activatedIn: ["WF-24-STVEH"],
  },

  {
    id: "highway-patrol-dispatcher",
    title: "Highway Patrol Dispatcher",
    initials: "HP",
    category: "dispatch",
    department: "Highway Patrol",
    description: "Dispatcher for state highway patrol units managing freeway incident notifications, traffic enforcement coordination, and multi-agency communication for major highway corridors.",
    accessLevel: "operator",
    cjis: "full",
    responsibilities: [
      "Receive automated traffic incident alerts from ATMS and TMC feeds",
      "Dispatch HP units to freeway incidents with lane-closure and diversion authority",
      "Coordinate tow-rotation dispatch and DMS content updates with TOC",
      "Maintain incident log for Caltrans/DOT compliance reporting",
      "Relay real-time scene updates to TOC analysts for public advisory messaging",
    ],
    systemAccess: ["Dispatch Console", "CAD System", "DMS Control Panel", "Unit Tracking", "Analytics & Reports"],
    activatedIn: ["WF-19-TRAFINC"],
  },

  {
    id: "eoc-dispatch-operator",
    title: "EOC / Dispatch Operator",
    initials: "EO",
    category: "dispatch",
    department: "Emergency Communications",
    description: "Dual-function operator bridging the EOC and crowd-event dispatch operations. Monitors multi-agency radio channels and relays live situational updates to venue security and response teams.",
    accessLevel: "operator",
    cjis: "none",
    responsibilities: [
      "Monitor and log multi-agency radio traffic throughout event duration",
      "Relay crowd density and safety threshold alerts to venue security teams",
      "Track unit deployment status on the EOC resource board in real time",
      "Coordinate Fire/EMS staging positions and access routes during crowd events",
    ],
    systemAccess: ["Dispatch Console", "Alert Management", "Unit Tracking", "VAI Dashboard"],
    activatedIn: ["WF-22-CROWD"],
  },

  // ── Field Operations ───────────────────────────────────────────────────────

  {
    id: "patrol-officer",
    title: "Patrol Officer",
    initials: "PO",
    category: "field-ops",
    department: "Field Operations / Patrol",
    description: "Sworn law enforcement officer responding to dispatched incidents in the field. Primary responder for active threats, LPR-confirmed vehicle stops, and routine patrol-level enforcement events.",
    accessLevel: "responder",
    cjis: "full",
    responsibilities: [
      "Respond to dispatched calls with situational context delivered via VAI™ mobile alert",
      "Conduct initial scene assessment and establish perimeter without radio coordination delay",
      "Execute LPR-confirmed vehicle stops using AI-provided tactical approach guidance",
      "Provide real-time scene status updates via MDT throughout the incident",
      "Complete digital incident report within 2 hours of scene clearance",
    ],
    systemAccess: ["VAI Mobile App", "Unit Tracking", "CAD (read)", "LPR Dashboard (read)"],
    activatedIn: ["WF-04-GUNSHOT", "WF-24-STVEH"],
  },

  {
    id: "field-unit-officer",
    title: "Field Unit Officer",
    initials: "FU",
    category: "field-ops",
    department: "Patrol / Field Operations",
    description: "General-assignment field officer handling multi-agency dispatch assignments across law enforcement, fire, and EMS response types. Operates under both patrol and emergency communications command structures.",
    accessLevel: "responder",
    cjis: "full",
    responsibilities: [
      "Acknowledge AI-generated dispatch assignments via MDT within 30 seconds",
      "Provide arrival confirmation and live scene status updates via radio or MDT",
      "Coordinate with additional units on perimeter, containment, and scene coverage",
      "Support EMS and fire units with scene access and security",
    ],
    systemAccess: ["VAI Mobile App", "Unit Tracking", "CAD (read)"],
    activatedIn: ["WF-09-DSPAGT"],
  },

  {
    id: "field-unit-commander",
    title: "Field Unit Commander",
    initials: "FC",
    category: "field-ops",
    department: "Field Operations",
    description: "Senior field officer who assumes on-scene command for multi-unit operations. Bridges communications between field personnel and the EOC/dispatch center during complex, extended incidents.",
    accessLevel: "operator",
    cjis: "limited",
    responsibilities: [
      "Assume on-scene command when 3 or more units are deployed",
      "Provide structured SITREP to EOC every 15 minutes during active incidents",
      "Authorize tactical movement and repositioning of assigned units",
      "Coordinate with Fire/EMS on scene access corridors and staging areas",
      "Initiate resource escalation request to EOC when operational needs exceed available units",
    ],
    systemAccess: ["VAI Mobile App", "Incident Management", "Unit Tracking", "Live Camera Feeds"],
    activatedIn: ["WF-17-MLTCOM"],
  },

  {
    id: "law-enforcement-officer",
    title: "Law Enforcement Officer",
    initials: "LE",
    category: "field-ops",
    department: "Law Enforcement",
    description: "Municipal or county LEO providing enforcement authority on environmental violations and public-safety incidents. Partners with environmental agencies on joint enforcement operations involving illegal dumping and hazardous materials.",
    accessLevel: "responder",
    cjis: "full",
    responsibilities: [
      "Execute enforcement actions on AI-confirmed dumping or environmental violations",
      "Collect evidence and initiate chain-of-custody documentation",
      "Issue citations and referrals to the District Attorney as warranted",
      "Coordinate Hazmat evaluation when unknown materials are identified on scene",
    ],
    systemAccess: ["VAI Mobile App", "Incident Management (write)", "Unit Tracking"],
    activatedIn: ["WF-21-ILLDMP"],
  },

  // ── Security Operations ────────────────────────────────────────────────────

  {
    id: "soc-analyst",
    title: "SOC Analyst",
    initials: "SA",
    category: "security-ops",
    department: "Security Operations Center",
    description: "Security analyst monitoring physical access control events, CCTV alerts, and intrusion detections from the SOC. First digital responder before dispatching physical security personnel to the scene.",
    accessLevel: "operator",
    cjis: "none",
    responsibilities: [
      "Monitor AI-generated access control alerts and cross-reference against badge records",
      "Review CCTV clips for breach confirmation before dispatching physical security",
      "Escalate confirmed threats to Watch Commander or on-site security supervisor",
      "Maintain access control audit log and track false-positive rates for tuning",
      "Generate end-of-shift security incident summary",
    ],
    systemAccess: ["VAI Dashboard", "Live Camera Feeds", "Access Control Console", "Alert Management", "Audit Logs"],
    activatedIn: ["WF-05-ACSCTR"],
  },

  {
    id: "security-officer",
    title: "On-site Security Officer",
    initials: "SO",
    category: "security-ops",
    department: "Physical Security",
    description: "Uniformed security officer performing physical patrol, entry-point access verification, and first-response at secured facilities. Receives AI-generated alerts via mobile device and acts as the physical enforcement layer.",
    accessLevel: "responder",
    cjis: "none",
    responsibilities: [
      "Respond to SOC-confirmed access breach alerts at designated entry points",
      "Physically verify identity and make authorize/deny access decisions",
      "Escort unauthorized individuals from the facility per protocol",
      "Document all security incidents in the daily activity report",
    ],
    systemAccess: ["VAI Mobile App", "Incident Management (write)", "Unit Tracking"],
    activatedIn: ["WF-05-ACSCTR"],
  },

  {
    id: "it-access-admin",
    title: "IT / Access Control Admin",
    initials: "IT",
    category: "security-ops",
    department: "IT Security",
    description: "System administrator managing identity and access management (IAM), badge credential provisioning, and integration between physical access control systems and the VAI™ alert pipeline.",
    accessLevel: "operator",
    cjis: "none",
    responsibilities: [
      "Provision and revoke access credentials in the IAM / badge management system",
      "Configure physical access control integration with the VAI™ alert pipeline",
      "Investigate and remediate credential misuse, anomalies, and tailgating events",
      "Generate SOC2/ISO 27001 compliance reports from access audit logs",
    ],
    systemAccess: ["Access Control Console", "System Configuration", "Audit Logs", "Analytics & Reports"],
    activatedIn: ["WF-05-ACSCTR"],
  },

  // ── Traffic & Transportation ───────────────────────────────────────────────

  {
    id: "traffic-ops-manager",
    title: "Traffic Operations Manager",
    initials: "TM",
    category: "traffic-transport",
    department: "Traffic Operations Center",
    description: "TOC supervisor who approves major closures, DMS messaging strategy, and cross-agency coordination with highway patrol and transit agencies. Accountable for corridor performance and public communication accuracy.",
    accessLevel: "supervisor",
    cjis: "none",
    responsibilities: [
      "Approve planned closure notifications and alternate-route DMS messaging",
      "Coordinate lane-closure permit timelines with construction project teams",
      "Oversee TOC analyst workload and coverage during peak-incident periods",
      "Brief transportation agency leadership on corridor performance metrics",
    ],
    systemAccess: ["VAI Dashboard", "DMS Control Panel", "Analytics & Reports", "Incident Management"],
    activatedIn: ["WF-15-PLNCLS"],
  },

  {
    id: "traffic-ops-analyst",
    title: "Traffic Operations Analyst",
    initials: "TA",
    category: "traffic-transport",
    department: "Traffic Operations Center",
    description: "TOC analyst monitoring real-time traffic conditions from sensors, cameras, and CV data pipelines. Generates and publishes DMS messages, signal timing recommendations, and incident reports.",
    accessLevel: "operator",
    cjis: "none",
    responsibilities: [
      "Monitor multi-source traffic feeds: ATMS, CCTV, loop detectors, and CV agents",
      "Generate and publish DMS advisory messages within TOC authority limits",
      "Coordinate lane-status updates with contractor teams during active closures",
      "Log all DMS activations and estimated delay impacts for monthly reporting",
    ],
    systemAccess: ["VAI Dashboard", "DMS Control Panel", "ATMS Feed", "Analytics & Reports", "Incident Management"],
    activatedIn: ["WF-13-WTHR", "WF-14-TRAFQ", "WF-19-TRAFINC"],
  },

  {
    id: "signal-control-engineer",
    title: "Signal Control Engineer",
    initials: "SE",
    category: "traffic-transport",
    department: "Traffic Engineering",
    description: "Traffic signal engineer responsible for adaptive signal control configurations, retiming plans, and emergency vehicle preemption across the signal network. Responds to AI-generated queue alerts with system-level interventions.",
    accessLevel: "operator",
    cjis: "none",
    responsibilities: [
      "Activate emergency signal retiming plans in response to AI-generated queue alerts",
      "Configure SCOOT/SCATS adaptive signal parameters for incident conditions",
      "Coordinate emergency vehicle preemption with dispatch on active incidents",
      "Review and approve automated signal timing change logs before archiving",
    ],
    systemAccess: ["Signal Control System", "ATMS Feed", "VAI Dashboard", "Analytics & Reports"],
    activatedIn: ["WF-14-TRAFQ"],
  },

  {
    id: "maritime-ops-controller",
    title: "Maritime Operations Controller",
    initials: "MO",
    category: "traffic-transport",
    department: "Ferry / Maritime Operations",
    description: "Controller managing ferry terminal operations, vessel scheduling, and passenger-safety communications during weather events or flooding that affect marine transit routes.",
    accessLevel: "operator",
    cjis: "none",
    responsibilities: [
      "Monitor NOAA and river-gauge flood alerts to assess ferry service impact",
      "Authorize service modifications, reduced frequency, or full suspension",
      "Coordinate with vessel crews on operational safety conditions and turn-back protocols",
      "Issue passenger-facing service advisories via terminal displays and transit apps",
    ],
    systemAccess: ["VAI Dashboard", "Alert Management", "Analytics & Reports", "Incident Management"],
    activatedIn: ["WF-18-FRRYFLD"],
  },

  {
    id: "construction-project-coordinator",
    title: "Construction Project Coordinator",
    initials: "CP",
    category: "traffic-transport",
    department: "Capital Projects",
    description: "Project coordinator managing construction-related lane closures and right-of-way activities. Submits advance closure plans to the TOC and tracks DMS messaging status for active work zones.",
    accessLevel: "viewer",
    cjis: "none",
    responsibilities: [
      "Submit planned lane-closure requests to TOC at least 72 hours in advance",
      "Confirm closure windows align with permitted working hours and conditions",
      "Receive real-time alternate-route DMS messaging status from TOC",
      "Coordinate construction crew staging with TOC lane-status board",
    ],
    systemAccess: ["VAI Dashboard (read)", "Incident Management (read)", "Analytics & Reports"],
    activatedIn: ["WF-15-PLNCLS"],
  },

  // ── Emergency Management ───────────────────────────────────────────────────

  {
    id: "emergency-mgmt-coordinator",
    title: "Emergency Management Coordinator",
    initials: "EM",
    category: "emergency-mgmt",
    department: "Emergency Management Agency",
    description: "Coordinator in the local or state emergency management agency who monitors multi-hazard threats, manages resource pre-staging, and coordinates with FEMA and state emergency agencies during activations.",
    accessLevel: "operator",
    cjis: "none",
    responsibilities: [
      "Monitor weather, seismic, flood, and environmental threat feeds across multiple systems",
      "Pre-stage emergency resources and activate mutual-aid agreements proactively",
      "Coordinate public advisory messaging content with the Communications Director",
      "Maintain situational awareness dashboard and resource board throughout activations",
    ],
    systemAccess: ["VAI Dashboard", "Alert Management", "Analytics & Reports", "Multi-Agency Feed"],
    activatedIn: ["WF-13-WTHR"],
  },

  {
    id: "emergency-response-coordinator",
    title: "Emergency Response Coordinator",
    initials: "ER",
    category: "emergency-mgmt",
    department: "Emergency Management",
    description: "Field-side emergency coordinator who activates tiered response plans, coordinates resource mobilization, and serves as the liaison between the EOC and field incident command teams.",
    accessLevel: "supervisor",
    cjis: "none",
    responsibilities: [
      "Activate the appropriate tiered emergency response plan based on AI threat assessment",
      "Deploy and track emergency resource inventory across field assignments",
      "Serve as EOC liaison to field incident command, bridging tactical and strategic layers",
      "Coordinate multi-agency logistics including Hazmat, environmental, and transit agencies",
    ],
    systemAccess: ["VAI Dashboard", "Incident Management", "Unit Tracking", "Alert Management"],
    activatedIn: ["WF-18-FRRYFLD"],
  },

  // ── Compliance & Enforcement ───────────────────────────────────────────────

  {
    id: "compliance-officer",
    title: "Compliance Officer",
    initials: "CO",
    category: "compliance",
    department: "Regulatory Compliance",
    description: "Regulatory compliance officer monitoring environmental and operational compliance reporting. Reviews and validates AI-generated compliance reports before submission to EPA, OSHA, or other regulatory agencies.",
    accessLevel: "analyst",
    cjis: "none",
    responsibilities: [
      "Review and validate AI-generated compliance reports before regulatory submission",
      "Track open violations and monitor remediation timelines against regulatory deadlines",
      "Coordinate with operations on corrective-action implementation and documentation",
      "Maintain audit-ready compliance records for EPA/OSHA inspections",
    ],
    systemAccess: ["VAI Dashboard (read)", "Compliance Reports", "Analytics & Reports", "Audit Logs"],
    activatedIn: ["WF-20-CMPRPT"],
  },

  {
    id: "env-enforcement-officer",
    title: "Environmental Enforcement Officer",
    initials: "EE",
    category: "compliance",
    department: "Environmental Services",
    description: "Municipal or county officer with enforcement authority over illegal dumping, hazardous waste disposal, and environmental code violations. Coordinates with law enforcement for arrest authority on joint operations.",
    accessLevel: "operator",
    cjis: "limited",
    responsibilities: [
      "Investigate AI-confirmed illegal dumping detections and classify waste type",
      "Collect and preserve environmental evidence maintaining chain of custody",
      "Issue administrative citations and referrals to the District Attorney",
      "Coordinate Hazmat unit evaluation when unknown or hazardous materials are present",
    ],
    systemAccess: ["VAI Dashboard", "Live Camera Feeds", "Incident Management", "Alert Management"],
    activatedIn: ["WF-21-ILLDMP"],
  },

  {
    id: "crowd-mgmt-coordinator",
    title: "Crowd Management Coordinator",
    initials: "CM",
    category: "compliance",
    department: "Event Operations",
    description: "Event operations coordinator responsible for real-time crowd flow management, density threshold monitoring, and safety messaging during large public gatherings. Translates AI density data into operational interventions.",
    accessLevel: "operator",
    cjis: "none",
    responsibilities: [
      "Monitor real-time crowd density counts from the CV pipeline against defined thresholds",
      "Activate Level 2 crowd-flow management interventions before saturation occurs",
      "Coordinate with venue security on gate management, ingress pacing, and egress control",
      "Issue crowd-safety broadcasts via venue PA, digital signage, and social media",
    ],
    systemAccess: ["VAI Dashboard", "Live Camera Feeds", "Alert Management", "Analytics & Reports"],
    activatedIn: ["WF-22-CROWD"],
  },

  // ── Records & Intelligence ─────────────────────────────────────────────────

  {
    id: "records-intel-analyst",
    title: "Records / Intelligence Analyst",
    initials: "RA",
    category: "records-intel",
    department: "Records & Intelligence Unit",
    description: "Law enforcement records analyst responsible for warrant checks, vehicle history lookups, and intelligence fusion supporting active investigations triggered by LPR hits, access breach events, or CV detections.",
    accessLevel: "analyst",
    cjis: "full",
    responsibilities: [
      "Confirm warrant status on LPR hotlist hits via NCIC and state records systems",
      "Cross-reference vehicle history, registration, and registered-owner data",
      "Prepare intelligence packages for investigating detectives within 4 hours of incident",
      "Maintain chain-of-custody documentation for all case records",
    ],
    systemAccess: ["LPR Dashboard", "CJIS Records System", "Incident Management (read)", "Analytics & Reports"],
    activatedIn: ["WF-24-STVEH"],
  },

  // ── Operations Support ─────────────────────────────────────────────────────

  {
    id: "operations-manager",
    title: "Operations Manager",
    initials: "OM",
    category: "operations",
    department: "Operations",
    description: "Facility or site operations manager responsible for safety compliance, environmental reporting accuracy, and coordination with enforcement agencies for on-site incidents requiring regulatory action.",
    accessLevel: "supervisor",
    cjis: "none",
    responsibilities: [
      "Approve incident reports before submission to regulatory agencies",
      "Coordinate hazmat response with environmental and public health agencies",
      "Manage remediation contracts and schedule vendor dispatch for site cleanup",
      "Ensure all OSHA and EPA documentation is accurate and audit-ready",
    ],
    systemAccess: ["VAI Dashboard", "Incident Management", "Analytics & Reports", "Compliance Reports"],
    activatedIn: ["WF-20-CMPRPT"],
  },

  {
    id: "public-works-coordinator",
    title: "Public Works Coordinator",
    initials: "PW",
    category: "operations",
    department: "Public Works",
    description: "Coordinator managing public-space remediation and waste removal logistics. Receives VAI™-generated work orders from environmental enforcement and tracks cleanup completion for regulatory closure.",
    accessLevel: "viewer",
    cjis: "none",
    responsibilities: [
      "Receive remediation work orders from the enforcement officer via VAI™",
      "Dispatch the correct cleanup crew with appropriate equipment for the waste classification",
      "Document before and after site conditions with photo evidence for regulatory records",
      "Coordinate with environmental agency on hazardous-waste disposal and manifesting",
    ],
    systemAccess: ["VAI Dashboard (read)", "Incident Management (read/write)", "Analytics & Reports"],
    activatedIn: ["WF-21-ILLDMP"],
  },

];

export function getRoleById(id: string): Role | null {
  return ROLES.find((r) => r.id === id) ?? null;
}
