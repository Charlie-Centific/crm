// ─── Types ────────────────────────────────────────────────────────────────────

export type SelectionMode = "single" | "multi";

export interface RFPBlock {
  id: string;
  label: string;           // Card label: "Standard" | "Detailed" | concept name
  preview: string;         // 1-2 sentences shown on the selection card
  content: string;         // Full paragraph(s) for the assembled response
  tags?: string[];         // e.g. ["transit", "emergency"]
}

export interface RFPSection {
  id: string;
  ref?: string;            // Subpart ref, e.g. "D.I", "E.V"
  title: string;
  prompt: string;          // The RFP ask this section answers
  mode: SelectionMode;
  required?: boolean;      // Must have ≥1 selection before BUILD is allowed
  blocks: RFPBlock[];
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export const RFP_SECTIONS: RFPSection[] = [
  // ── 1. Project Understanding ─────────────────────────────────────────────────
  {
    id: "scope-understanding",
    ref: "D.I",
    title: "Understanding of Scope & Objectives",
    prompt: "Demonstrate that your team understands the agency's goals, current operational gaps, and what a successful outcome looks like.",
    mode: "single",
    required: true,
    blocks: [
      {
        id: "scope-standard",
        label: "Standard",
        preview: "Frames the project as an operational transformation, not a technology replacement — emphasizing the gap between data generation and actionable intelligence.",
        content:
          "We understand this not as a technology replacement project but as an operational transformation. The existing platforms each perform their defined functions — but they do not generate the real-time, cross-source operational intelligence that changes how operators manage incidents, how supervisors understand statewide conditions, or how leadership measures system performance. The new system must do all three.\n\nMeeting current functionality is the baseline. The goal is to deliver a system that is measurably more effective from Day 1 — where every existing capability is preserved and every new capability is grounded in operational impact, not feature count.",
      },
      {
        id: "scope-detailed",
        label: "Comprehensive",
        preview: "Covers current-state fragmentation, Day 1 capability continuity, emerging technology readiness, and the TMC operator efficiency gap — all in one cohesive framing.",
        content:
          "The agency's goal for this procurement is precisely stated in the SOW: a fully integrated solution that eliminates fragmentation between platforms that currently operate in parallel — reducing redundant data entry, unifying the operational picture available to operators, and delivering a system that is future-ready for AI-assisted operations and continued infrastructure growth.\n\nWe understand this not as a technology replacement project but as an operational transformation. Existing platforms perform their defined functions — but they do not speak to each other in real time in a way that changes how an operator manages an incident, how a field supervisor understands conditions, or how leadership measures system performance.\n\n**Meeting current functionality — and exceeding it from Day 1:** The proposed solution maintains every functional capability currently provided by existing platforms. Operators retain full device control, incident management workflows, and content management — with no capability regression at cutover. What changes is how those capabilities are connected: incidents detected in one system automatically propagate to others; video feeds are pulled up in context of active incidents rather than navigated separately; and operator actions generate a unified event record rather than parallel logs.\n\n**Enhancing operator efficiency:** The most significant efficiency gap in current operations is not technology capability — it is information fragmentation. Operators today manage incidents by correlating data from unconnected systems, mentally synthesizing alert streams from cameras, detectors, and third-party feeds, and documenting events manually after the fact. The VerityAI™ decision support layer addresses this directly: multi-source inputs are correlated automatically into structured incident objects, suggested response actions are presented at the moment of detection, and reports are generated from the structured event log rather than written from memory.",
      },
    ],
  },

  // ── 2. Solution Architecture ──────────────────────────────────────────────────
  {
    id: "architecture",
    ref: "E.I",
    title: "Solution Architecture",
    prompt: "Describe the technical architecture of the proposed solution, how components interact, and how it scales.",
    mode: "single",
    required: true,
    blocks: [
      {
        id: "arch-overview",
        label: "Three-Layer Overview",
        preview: "Introduces the three-layer model (infrastructure control, data integration, operational intelligence) in two paragraphs — clear and approachable.",
        content:
          "The integrated solution is built on a three-layer architecture that separates physical infrastructure control, data exchange, and operational intelligence into distinct, interoperable layers. The VerityAI™ operational intelligence layer sits above all subsystems, providing multi-source corroboration, decision support, and automated report generation without creating dependency on any single subsystem's availability.\n\n**Layer 1 — Physical Infrastructure Control:** All field devices connect through standards-compliant interfaces. Full device control is maintained: camera PTZ, DMS message publishing, sensor configuration, and connected system management. Regional operators manage their corridor-specific configurations without dependency on statewide system availability.\n\n**Layer 2 — Unified Data Integration:** Subsystems are integrated through TMDD-compliant and NTCIP-standard interfaces that allow data to flow freely across the network while maintaining regional data ownership. Incidents confirmed in one location are available to others. ATIS content is updated from the operational platform automatically — public-facing traveler information reflects the operational picture at the TMC, not a separate editorial process.\n\n**Layer 3 — VerityAI™ Operational Intelligence:** The intelligence layer operates across the entire network, correlating multi-source inputs into structured event objects and returning decision support recommendations, suggested response plans, and automated reports to operators. VerityAI™ does not replace any subsystem — it augments operator decision-making with a consistent capability at every location.",
      },
      {
        id: "arch-statewide",
        label: "Regional Autonomy + Statewide Coordination",
        preview: "Addresses the tension between regional operational independence and statewide situational awareness — the most common architectural concern in multi-site deployments.",
        content:
          "The central design challenge in multi-site deployments is one that large agencies navigate daily: the network is simultaneously a statewide system and a set of regionally distinct operational environments. Different locations manage different corridor types, traffic patterns, incident profiles, and partner agency relationships. A system that imposes a single operational model fails regional operators. A system that allows each location to operate independently fails statewide coordination.\n\nThe proposed solution resolves this tension through a three-layer architecture that separates physical infrastructure control — where regional specificity is essential — from operational intelligence and statewide coordination — where unified data creates the most value.\n\n**Regional autonomy is preserved at the control layer:** Each location retains full, independent control of its field devices through the ATMS platform — camera PTZ, DMS publishing, sensor configuration, and local integration partners — without dependency on statewide system availability.\n\n**Statewide coordination is enabled at the intelligence layer:** The VerityAI™ layer operates across all locations, providing a consistent decision support capability at every site while learning from the operational patterns of each. Events confirmed at any location are available for statewide situational awareness and cross-agency coordination.\n\n**The statewide coordination payoff:** When a major incident or evacuation activates the full network, this architecture delivers what a fragmented system cannot: a single, structured, real-time operational picture across every corridor and every location — updated continuously as conditions evolve, with every operator action logged in a unified audit trail.",
      },
    ],
  },

  // ── 3. AI & Decision Support ──────────────────────────────────────────────────
  {
    id: "ai-decision-support",
    ref: "E.X",
    title: "AI & Decision Support Capabilities",
    prompt: "Describe your AI capabilities, how they reduce operator burden, and how explainability and human oversight are maintained.",
    mode: "single",
    required: true,
    blocks: [
      {
        id: "ai-overview",
        label: "VerityAI™ Overview",
        preview: "Describes the Urban Event Graph, structured incident objects, and the before/after operator efficiency comparison — tight and compelling.",
        content:
          "The VerityAI™ platform delivers a layered decision support architecture built around the Urban Event Graph: when the platform detects an incident, it creates a structured event object with typed properties — severity classification, affected lanes, congestion radius, linked camera assets, corroboration confidence score, and recommended actions. That structured object — not a raw alert stream — is the unit of work for the operator.\n\nThree direct consequences for operator efficiency: information from multiple infrastructure sources arrives as one corroborated event rather than fragmented alerts; suggested actions — DMS messaging, partner notifications, resource deployment — are present at the moment of notification; and the complete event lifecycle generates reports and after-action documentation automatically, without manual post-incident work.\n\n**Human-in-the-loop governance:** VerityAI™ is a decision support platform. No signal adjustment, agency notification, or operational action executes without explicit operator confirmation. Every AI recommendation carries a confidence score and source attribution. Every operator override is logged and re-enters the fine-tuning pipeline — turning operator judgment into model improvement over time. The agency retains full operational authority at every decision point.",
      },
      {
        id: "ai-full",
        label: "Full Capability Stack",
        preview: "Covers all four capability pillars: pre-deployment fine-tuning, Urban Event Graph, operator efficiency gains, and human-in-the-loop governance.",
        content:
          "The VerityAI™ platform delivers a decision support architecture distinguished by four capabilities: a pre-deployment fine-tuning advantage grounded in operationally relevant scenarios; the Urban Event Graph as a structured intelligence layer converting raw detections into workflow-integrated event objects; measurable operator efficiency gains at every stage of the incident timeline; and a human-in-the-loop design that reduces cognitive burden without removing operator authority.\n\n**1. Pre-Deployment Fine-Tuning:** Detection models are fine-tuned against operationally relevant conditions before go-live using a transportation-specific reinforcement learning simulation environment. Models are exercised through realistic scenarios — multi-vehicle incidents, sensor degradation, wrong-way vehicle events, debris detection in variable lighting — and validated against verifiable performance outcomes in simulation. The result: a platform that is operationally calibrated at go-live, not months into the contract term.\n\n**2. Urban Event Graph — From Detection to Decision:** When VerityAI™ detects an incident, it creates a structured event object with cross-source confidence score. Three consequences: information from multiple sources arrives as one corroborated event; suggested actions are present at the moment of notification; and the full event lifecycle generates reports automatically.\n\n**3. TMC Operator Efficiency:** Detection-to-notification: single structured object with confidence score, not parallel alert streams. Suggested actions: recommended responses presented with the incident object — operators confirm, not construct. VAI voice and chat interface: operators query live feeds in natural language without interrupting primary task focus. Automated reporting: draft incident report from structured event log — operator reviews and approves.\n\n**4. Human-in-the-Loop Governance:** No action executes without operator confirmation. Every recommendation carries a confidence score and source attribution. Every override is logged and re-enters fine-tuning. The agency retains full operational authority at every decision point.",
      },
    ],
  },

  // ── 4. Innovative Differentiators (multi-select) ──────────────────────────────
  {
    id: "innovative-concepts",
    ref: "E.V",
    title: "Innovative Differentiators",
    prompt: "Describe innovative capabilities or approaches that distinguish your solution from conventional alternatives.",
    mode: "multi",
    blocks: [
      {
        id: "innov-rl-sim",
        label: "RL Simulation Environment",
        preview: "Transportation-specific reinforcement learning simulation for pre-deployment model fine-tuning — eliminates the cold-start accuracy problem.",
        content:
          "**Concept: Transportation-Specific RL Simulation for Pre-Deployment Fine-Tuning**\n\nCentific is actively developing a transportation-specific reinforcement learning simulation environment — a configurable digital replica of roadway operations configured to mirror operationally relevant incident types, weather patterns, roadway geometries, and traffic behaviors. Before a single sensor goes live, detection models are fine-tuned through realistic scenarios: multi-vehicle incidents on high-volume corridors, sensor degradation under heavy rain and fog, wrong-way vehicle events, and debris detection in variable lighting. Models are fine-tuned against verifiable performance outcomes in simulation, producing a measurable accuracy baseline available to evaluators prior to production go-live.\n\nThis eliminates the performance ramp-up period that typically characterizes AI-based deployments. No competing platform in this procurement is offering a purpose-built simulation environment as part of their model development methodology.",
      },
      {
        id: "innov-ueg",
        label: "Urban Event Graph",
        preview: "Structured operational ontology that converts raw sensor alerts into typed, TMDD-compatible incident objects — the intelligence layer's unit of work.",
        content:
          "**Concept: The Urban Event Graph — Structured Operational Ontology**\n\nWhen VerityAI™ detects an incident, it creates a structured Traffic Incident object with typed properties: severity classification, affected lanes, congestion radius, linked camera assets, signal controller associations, corroboration confidence score, and recommended actions. That structured object — not a raw alert stream — is the unit of work for the operator.\n\nThe Urban Event Graph supports Traffic Incidents, Infrastructure Failures, Environmental Hazards, and Wrong-Way Vehicle events, all TMDD-compatible and exportable through standard interfaces without data transformation. This is not a proprietary data silo — it is a structured intelligence layer that operates on top of existing systems and exports to any TMDD-compliant consumer.",
      },
      {
        id: "innov-flywheel",
        label: "Centific Data Flywheel",
        preview: "Every operator confirmation and override becomes labeled training data — a structural improvement advantage that compounds over the life of the contract.",
        content:
          "**Concept: The Centific Data Flywheel — A Continuously Improving System**\n\nEvery operator confirmation, correction, and override at deployed locations enters Centific's AI Data Foundry annotation pipeline as gold-standard labeled training data — location-specific, corridor-specific, and operationally validated. This data re-enters the fine-tuning process on a defined cadence.\n\nBy Year 3 of the contract, the agency will operate a detection and decision system that is demonstrably more accurate than any competing platform — because it will have been continuously fine-tuned on the agency's own operational data for three years. This is not a feature. It is a structural advantage that compounds over the life of the contract and cannot be replicated by a competitor who does not have access to that operational data.",
      },
      {
        id: "innov-vai-companion",
        label: "VAI Operator Companion",
        preview: "Conversational AI for TMC operators — voice and chat interface for live feed queries and automated end-of-shift report generation.",
        content:
          "**Concept: VAI — Conversational AI Companion for Operators**\n\nVAI monitors active incident feeds continuously and delivers real-time situational updates through voice notification and live chat — allowing operators to receive critical information without redirecting visual attention from primary monitoring tasks. Operators query VAI in natural language: \"What is the current queue length on the eastbound corridor?\" and receive responses from the live sensor feed without navigating dashboards or interrupting task focus.\n\nAt incident close, VAI generates a structured draft incident report from the event log, which the operator reviews and approves. Manual post-incident documentation is eliminated as a labor cost. The conversational interface is available throughout the operator's shift — for situational updates, status checks, and report generation — reducing cognitive load precisely when it is highest.",
      },
    ],
  },

  // ── 5. Workflow Suite (multi-select) ──────────────────────────────────────────
  {
    id: "workflow-suite",
    ref: "F",
    title: "Pre-Built Transportation Workflow Suite",
    prompt: "Describe the automated workflows included in the platform and how they address specific operational scenarios.",
    mode: "multi",
    blocks: [
      {
        id: "wf-weather",
        label: "WF-13 Highway Weather Alert",
        preview: "RWIS sensor threshold → DMS message → 511 advisory → third-party navigation feeds. 7 steps, 70% confidence, end-to-end in under 75 seconds.",
        content:
          "**WF-13 — Highway Weather Alert** (7 steps · 70% confidence threshold)\n\nTriggered by RWIS sensor threshold crossings indicating adverse weather. Pipeline: RWIS reading interpretation → advisory content generation → geospatial DMS sign identification → MUTCD-compliant DMS message generation → roadside DMS dispatch → 511 advisory publication → third-party navigation platform push. Steps 1, 2, and 4 are abort-on-fail critical, ensuring no malformed or incomplete weather message reaches the roadway network. End-to-end pipeline executes in under 75 seconds from sensor trigger to traveler notification.",
      },
      {
        id: "wf-queue",
        label: "WF-14 Traffic Queue Detection",
        preview: "Loop-detector threshold → corridor analysis → queue-warning DMS → 511 update. 6 abort-on-fail steps, 70% confidence.",
        content:
          "**WF-14 — Traffic Queue Detection** (6 steps · 70% confidence threshold)\n\nExecuted when VDS speed and occupancy readings confirm queue formation. Pipeline: corridor analysis → queue boundary identification → geospatial DMS lookup for upstream signs → MUTCD-compliant queue warning message generation → device dispatch → 511 publish. All six steps include abort-on-fail logic — an incomplete or malformed queue warning is never dispatched to the roadway. Probe data from third-party sources (INRIX, HERE) is incorporated as a corroboration input, reducing false queue-warning activations.",
      },
      {
        id: "wf-closure",
        label: "WF-15 Planned Closure",
        preview: "Construction / special-event closure → DMS dispatch → 511 → third-party navigation apps. 6 steps, 70% confidence.",
        content:
          "**WF-15 — Planned Closure** (6 steps · 70% confidence threshold)\n\nHandles construction windows, permitted events, and scheduled closures. Pipeline: event entry / scheduled trigger → MUTCD-compliant DMS message generation → geospatial upstream DMS identification → device dispatch → 511 publication → third-party navigation platform push (INRIX, Waze, Google Maps, HERE). Designed to execute on schedule with no operator action required for pre-configured planned closures. Operator review is required for same-day or emergency closures.",
      },
      {
        id: "wf-critical",
        label: "WF-16 Critical Incident Emergency Broadcast",
        preview: "Wrong-way / hazmat / bridge closure → FEMA IPAWS CAP → 511 → social media within 60 seconds of confirmation. 4 steps, 80% confidence.",
        content:
          "**WF-16 — Critical Incident Emergency Broadcast** (4 steps · 80% confidence threshold)\n\nHandles the highest-severity events: wrong-way drivers, hazmat spills, bridge closures, and multi-vehicle fatality incidents. Upon operator confirmation, a 4-step pipeline executes at 80% confidence with abort-on-fail on both content generation and IPAWS dispatch: FEMA IPAWS CAP alert generation → 511 priority publication → social media posts across configured accounts → TMC video wall priority update. Full pipeline completes within 60 seconds of operator confirmation. No critical incident broadcast executes without operator authorization — the operator confirms before IPAWS dispatch initiates.",
      },
      {
        id: "wf-camera",
        label: "WF-17 Camera Stream Management",
        preview: "Incident trigger → nearest cameras → TMC video wall reconfiguration → access-tier enforcement. 4 steps, automatic.",
        content:
          "**WF-17 — Camera Stream Management** (4 steps · 70% confidence threshold)\n\nUpon incident detection, executes automatically without operator navigation: geospatial identification of the nearest cameras to the incident → TMC video wall reconfiguration placing those feeds in priority positions → access-tier enforcement restricting public-facing streams if incident type requires → operator preview thumbnail generation. The right cameras appear in the right positions within seconds of incident detection. Operators do not navigate manually during the critical verification window. For ambiguous incidents, VAI monitors the feed continuously and narrates developing conditions.",
      },
      {
        id: "wf-flood",
        label: "WF-18 Ferry & Flood Disruption",
        preview: "Flood-sensor threshold + ferry status → traveler advisories → DMS → 511 → third-party navigation. Purpose-built for coastal and river corridor environments.",
        content:
          "**WF-18 — Ferry and Flood Disruption** (7 steps · 70% confidence threshold)\n\nThe only TMC workflow purpose-built for flood and ferry suspension scenarios. Runs parallel assessments simultaneously: flood-risk sensor assessment (correlated with RWIS precipitation data and VDS traffic impact) and ferry operational status evaluation → geospatial DMS identification for affected corridors → traveler advisory content generation → DMS dispatch → 511 publication → third-party navigation platform push. Flood sensor thresholds trigger pre-positioned road closure response plans, allowing the workflow to execute with reduced operator action during flood events when operator workload is highest.",
      },
      {
        id: "wf-tim",
        label: "WF-19 TIM Lifecycle (Full FHWA T0–T4)",
        preview: "Complete 11-step TIM workflow from first detection through incident close — structured incident object created and locked at every phase.",
        content:
          "**WF-19 — TIM Lifecycle** (11 steps · 75% confidence threshold)\n\nThe most comprehensive workflow in the suite — an 11-step pipeline that maps directly to the full FHWA T0–T4 TIM timeline:\n\n- **T0:** Report Agent creates the structured incident record (abort-on-fail)\n- **T1:** Data Fusion Agent synthesizes all sensor signals across VDS, cameras, CAD, and probe data (abort-on-fail); Geospatial Agents simultaneously identify nearest cameras and upstream DMS signs\n- **T2:** Knowledge Agent recommends the response plan from the pre-configured plan library (abort-on-fail)\n- **T3:** Device Control Agent executes the response plan; Report Agent generates the DMS message; Stream Management Agent configures the TMC video wall\n- **T4:** Broadcast Agents dispatch FEMA IPAWS alert, publish 511 update, and post social media notifications\n\nWF-19 runs at a 75% confidence threshold with 30-second step timeouts, delivering the incident record to all configured output targets simultaneously. Every step is logged with timestamp, confidence score, and source attribution.",
      },
      {
        id: "wf-compliance",
        label: "WF-20 DOT Compliance Report",
        preview: "Weekly scheduled: RITIS benchmark pull → TIM metrics aggregation → FHWA-ready narrative report → portal submission. 3 steps, 80% confidence, abort-on-fail.",
        content:
          "**WF-20 — DOT Compliance Report** (3 steps · 80% confidence threshold)\n\nAutomates weekly FHWA TIM performance measure submissions on a defined schedule. Pipeline: RITIS benchmark pull and internal TIM metrics aggregation → regulatory-quality narrative report generation (abort-on-fail at 80% confidence; report generation stops and supervisor is notified rather than submitting an incomplete report) → LADOTD portal and FHWA system submission. Eliminates manual data compilation for recurring regulatory reporting. All generated reports are archived with full source attribution for audit review.",
      },
    ],
  },

  // ── 6. Security & Compliance ──────────────────────────────────────────────────
  {
    id: "security",
    ref: "E.IV",
    title: "Security & Compliance Posture",
    prompt: "Describe your platform's security certifications, architecture, and approach to protecting sensitive agency data.",
    mode: "single",
    required: true,
    blocks: [
      {
        id: "security-standard",
        label: "Core Posture",
        preview: "SOC 2 Type II, AES-256/TLS 1.2+, Active Directory integration, immutable audit trail, and 1-hour incident notification — the essentials.",
        content:
          "The VerityAI™ platform is SOC 2 Type II certified. The cybersecurity framework is built around four pillars: control, availability, integrity, and confidentiality. The solution is secure-by-design and secure-by-default.\n\n**Data protection:** All data exchange encrypted in transit using TLS 1.2 or higher; data at rest using AES-256. No agency operational data is processed outside the contracted scope or used for external purposes without explicit written authorization.\n\n**Access control:** Active Directory integration — no separate credential store. Role-based access controls enforced at the intelligence layer, aligned with operational user roles. Every AI recommendation and operator action logged in an immutable audit trail accessible to agency administrators.\n\n**Incident response:** Security incidents reported to the agency PM within one hour of detection. Full incident report delivered within 24 hours of resolution. Annual cybersecurity training for all Centific personnel with agency system access.",
      },
      {
        id: "security-full",
        label: "Full Framework",
        preview: "Adds FHWA Cybersecurity Handbook, NIST CSF, CJIS compliance posture, data sanitization at contract end, and the complete incident severity structure.",
        content:
          "The cybersecurity framework is built around four pillars: control, availability, integrity, and confidentiality. The solution is secure-by-design and secure-by-default. All controls comply with the FHWA Cybersecurity Program Handbook, applicable information security policy, and state information security contract requirements.\n\n**Certifications and compliance:** SOC 2 Type II certified. NIST CSF compliance across asset management, governance, risk assessment, and supply chain security. CJIS Security Policy compliant for law enforcement deployments (access control, audit logging, data encryption, incident response). FedRAMP-eligible deployment configurations available for federally funded engagements.\n\n**Data protection:** All data encrypted in transit (TLS 1.2+) and at rest (AES-256). No separate credential store — Active Directory integration governs all authentication. RBAC aligned with operational user roles across all platform layers. Immutable audit logs record every evidence and data access event with source attribution.\n\n**Incident response:** Security incidents reported to agency PM and InfoSec within one hour of detection. Full post-incident report within 24 hours of resolution. Annual security training for all Centific personnel with system access. Data sanitization at contract end per NIST SP 800-88 Rev 1.\n\n**Ongoing posture:** Quarterly security review. Major releases communicated 90 days in advance. All CVE records disclosed with CVSS scores and remediation timelines.",
      },
    ],
  },

  // ── 7. Implementation Methodology ─────────────────────────────────────────────
  {
    id: "implementation",
    ref: "E.II",
    title: "Implementation Methodology",
    prompt: "Describe your phased implementation approach, coordination cadence, and how you manage risk during deployment.",
    mode: "single",
    required: true,
    blocks: [
      {
        id: "impl-overview",
        label: "Four-Phase Summary",
        preview: "Discovery → Configuration & Integration → Pilot Validation → Full Go-Live. Timeline, coordination cadence, and PM model in two paragraphs.",
        content:
          "Implementation follows a four-phase methodology delivered within the contract NTP window under a single Contractor Project Manager serving as the agency's primary point of contact throughout the contract term.\n\n**Phase 1 — Discovery & Site Survey (2 weeks):** Infrastructure assessment, integration mapping, use case prioritization, and baseline configuration documentation.\n\n**Phase 2 — Configuration & Integration (4–6 weeks):** Platform deployment, API and interface connections, alert threshold configuration, and initial testing against defined acceptance criteria.\n\n**Phase 3 — Pilot Validation (4 weeks):** Controlled deployment with agency stakeholders, alert tuning and threshold refinement, staff training, and formal UAT. No Phase 4 proceed without agency sign-off.\n\n**Phase 4 — Full Go-Live & Handoff:** Monitored rollout with dedicated customer success support. All runbooks, configuration documentation, and training materials delivered at handoff. Dedicated support channel active from go-live day.",
      },
      {
        id: "impl-detailed",
        label: "Full PMP with Coordination Cadence",
        preview: "Adds bi-weekly coordination meetings, monthly status reports, key personnel change protocol, and QA/risk management approach.",
        content:
          "Implementation follows a four-phase methodology under a single Contractor Project Manager who serves as the agency's primary point of contact throughout the contract term. A dedicated Project Management Plan (PMP) is delivered at NTP.\n\n**Phase 1 — Discovery & Site Survey (2 weeks):** Infrastructure assessment, integration mapping with all required third-party systems, use case prioritization, and baseline configuration documentation. Agency IT and operations stakeholders engaged in kickoff during this phase.\n\n**Phase 2 — Configuration & Integration (4–6 weeks):** Platform deployment, API connections, alert threshold configuration, and integration testing against all required system interfaces. Integration diagnostic panel available to agency ITS staff throughout.\n\n**Phase 3 — Pilot Validation (4 weeks):** Controlled deployment at initial site(s) with agency stakeholders, alert tuning and threshold refinement, staff training, and formal UAT with RTVM. Phase 4 does not proceed without agency sign-off on UAT outcomes.\n\n**Phase 4 — Full Go-Live & Handoff:** Monitored rollout with dedicated customer success support. All runbooks, configuration documentation, and training materials delivered at handoff.\n\n**Coordination Cadence:**\n- Bi-weekly coordination meetings — implementation progress, integration status, issue log, schedule adherence\n- Monthly status reports — schedule update, milestone status, open issues, risk register update\n- Monthly status meetings — overall progress review and issue resolution\n- 30-day advance notice of any Key Personnel change; agency approval required before change takes effect",
      },
    ],
  },

  // ── 8. Training Program ───────────────────────────────────────────────────────
  {
    id: "training",
    ref: "E.VIII",
    title: "Training Program",
    prompt: "Describe your training methodology, delivery format, and how you ensure adoption across user roles with different technical backgrounds.",
    mode: "single",
    blocks: [
      {
        id: "train-summary",
        label: "Role-Based Summary",
        preview: "Three role tracks (operators, administrators, extended users), multi-modal delivery, and ongoing e-learning library — clear and concise.",
        content:
          "All training is developed and delivered under the supervision of a qualified Training Lead (minimum 5 years ITS training experience with relevant certification). Training is organized into three role-based tracks — Operational, Administration, and Extended Users — each delivered through instructor-led sessions at site locations, virtual instructor-led sessions, and a self-paced e-learning library accessible throughout the contract term.\n\n**Operational Track (TMC Operators, 8–12 hours):** Platform overview, incident detection and management workflows, AI decision support interface, confirm/modify/override workflow, and VAI voice and chat interface. Emphasis on the human-in-the-loop architecture and operator authority at every decision point.\n\n**Administration Track (Administrators and ITS Staff, 10–16 hours):** User provisioning, device configuration, system health monitoring, integration management, and report configuration.\n\n**Extended User Track (Field Staff, Partners, 2–4 hours each):** Platform overview and role-specific interface training, delivered via virtual sessions and e-learning to minimize operational disruption.\n\nOngoing: Recorded sessions and self-paced library available throughout the contract term. New staff training included in enterprise agreements.",
      },
      {
        id: "train-full",
        label: "Full Curriculum with Timeline",
        preview: "Adds pre-go-live administrator training, go-live window shift scheduling, extended user virtual sessions, and specific hour ranges per module.",
        content:
          "All training is developed and delivered under a qualified Training Lead (CPTM, CPLP, or CompTIA CTT+, minimum 5 years ITS training experience). Three platform tracks with role-differentiated curriculum:\n\n**Platform Track 1 — ATMS (16–24 hours per user):**\n- Foundation Module (all roles, 3 hrs): Software overview, virtual desktop access, map GUI navigation, user account management\n- Operational Module (TMC Operators, 6 hrs): Device monitoring, incident detection and management, response plan generation, DMS publishing, integration controls, TIM reporting\n- AI Decision Support Module (TMC Operators, 3 hrs): VerityAI™ decision support interface, structured incident objects and confidence scoring, confirm/modify/override workflow, VAI interface, human-in-the-loop architecture\n- Administration Module (Administrators and ITS Staff, 8 hrs): User provisioning, device configuration, system health monitoring, Active Directory, report configuration, backup verification\n\n**Platform Track 2 — ATIS (4–8 hours):** Software overview, traveler information update workflows, construction and scheduled events, field-oriented interface.\n\n**Platform Track 3 — VDMS / Video (2–4 hours):** Platform overview, camera navigation and PTZ, video wall configuration, video export and archival, external access portal for first responders and media partners.\n\n**Delivery Timeline:**\n- Phase 1 — Pre-Go-Live (4 weeks prior): Administrator and ITS Staff training at primary site using sandbox instance\n- Phase 2 — Go-Live Window (weeks 1–4): TMC Operator training at each location with shift-based scheduling ensuring no coverage gaps\n- Phase 3 — Extended Users (weeks 4–8): Field staff, first responder, and partner training via virtual sessions and e-learning\n- Ongoing: Recorded sessions and self-paced library throughout contract term; refresher training for new staff included",
      },
    ],
  },

  // ── 9. Support & SLA ──────────────────────────────────────────────────────────
  {
    id: "support-sla",
    ref: "E.IX",
    title: "Support & Maintenance / SLA",
    prompt: "Describe your support model, uptime commitments, and how you sustain and improve the platform over the contract term.",
    mode: "single",
    blocks: [
      {
        id: "sla-standard",
        label: "Core SLA Commitments",
        preview: "99.99% uptime, 4-tier severity response (15 min P1 / 1hr P2 / 4hr P3 / 1 day P4), named CSM, and quarterly business reviews.",
        content:
          "**System Uptime:** 99.99% availability measured monthly — approximately 52 minutes maximum unplanned downtime per year. Continuous automated monitoring accessible to both the Contractor and agency PM in real time.\n\n**Severity Response SLAs:**\n- Severity 1 — Critical: Initial response within 15 minutes, 24/7/365. Core functionality restored within 4 hours. Senior technical personnel engaged within 30 minutes.\n- Severity 2 — High: Initial response within 1 hour, 24/7/365. Full restoration or confirmed workaround within 8 hours.\n- Severity 3 — Medium: Initial response within 4 business hours. Resolution within 3 business days.\n- Severity 4 — Low: Initial response within 1 business day. Addressed in next scheduled maintenance release.\n\nAll cybersecurity incidents reported to agency PM within one hour of detection. Full incident report delivered within 24 hours of resolution.\n\n**Ongoing support:** Named Customer Success Manager. Quarterly business reviews. 24/7 support line for P1/P2 incidents. Major releases communicated 90 days in advance.",
      },
      {
        id: "sla-full",
        label: "Full Maintenance Model + Continuous Improvement",
        preview: "Adds backup/DR specs (4hr RTO, 24hr RPO), quarterly model performance reports, data flywheel improvement cadence, and business continuity.",
        content:
          "**System Uptime:** 99.99% availability measured monthly. Continuous automated monitoring accessible to both parties in real time.\n\n**Severity Response SLAs:**\n- Severity 1 — Critical: 15-minute initial response, 24/7/365; 4-hour restoration; senior technical personnel within 30 minutes\n- Severity 2 — High: 1-hour initial response, 24/7/365; 8-hour restoration or workaround\n- Severity 3 — Medium: 4-business-hour initial response; 3-business-day resolution\n- Severity 4 — Low: 1-business-day response; next scheduled maintenance release\n\n**Business Continuity:** Full database backup weekly; incremental daily; automated integrity verification with agency confirmation. RTO: core functionality restored within 4 hours. RPO: maximum 24-hour data loss. High-availability failover with automatic switchover and no operator intervention required. Active-active configuration for mission-critical deployments.\n\n**Continuous Model Improvement:** Every operator confirmation, correction, and override enters Centific's AI Data Foundry pipeline. Agency-specific operational data is incorporated into model refinement on a defined cadence. Quarterly model performance reports track detection accuracy, false positive rates, and operator override frequency trends throughout the contract term. New RL simulation scenarios, improved models, and expanded sensor type support are delivered at no additional cost as Centific's simulation environment matures.\n\n**Ongoing support:** Named Customer Success Manager for the contract term. Monthly check-ins and quarterly business reviews. Major releases communicated 90 days in advance with agency participation in UAT available.",
      },
    ],
  },

  // ── 10. References & Proof Points (multi-select) ─────────────────────────────
  {
    id: "proof-points",
    ref: "E.X § 5",
    title: "References & Proof of Deployment",
    prompt: "Provide evidence of production deployments and real-world validation of the proposed capabilities.",
    mode: "multi",
    blocks: [
      {
        id: "proof-brownsville",
        label: "Brownsville Active Certification",
        preview: "Live multi-infrastructure deployment in Brownsville, TX — up to 800 cameras, roadway sensors, drones, and bus cameras in active certification for Q2 2026 go-live.",
        content:
          "**Active Deployment: Brownsville, Texas**\n\nThe VerityAI™ platform is currently in active certification for a multi-infrastructure deployment in Brownsville, Texas, with go-live expected Q2 2026. The deployment covers up to 800 cameras alongside roadway sensors, drone assets, and bus cameras — with the complete operational workflow in certification: automated detection, suggested action generation, human-in-the-loop operator confirmation, and automated report generation. Agency evaluators are welcome to observe a live demonstration of the certification environment.",
      },
      {
        id: "proof-flywheel",
        label: "Data Flywheel Advantage",
        preview: "Structural improvement advantage: operator corrections become training data — detection accuracy compounds over the contract term rather than plateauing.",
        content:
          "**Structural Advantage: The Centific Data Flywheel**\n\nEvery operator confirmation, correction, and override at deployed locations enters Centific's AI Data Foundry annotation pipeline as gold-standard labeled training data — location-specific, corridor-specific, and operationally validated. This data re-enters the fine-tuning process on a defined cadence.\n\nBy Year 3 of the contract, the agency will operate a detection and decision system that is demonstrably more accurate than any competing platform — because it will have been continuously fine-tuned on the agency's own operational data for three years. Quarterly model performance reports track detection accuracy, false positive rates, and operator override frequency — providing the agency with measurable evidence of continuous improvement throughout the contract term.",
      },
      {
        id: "proof-sim",
        label: "RL Simulation Pre-Validation",
        preview: "Detection models are fine-tuned against operationally relevant scenarios in simulation before go-live — producing a measurable accuracy baseline prior to production.",
        content:
          "**Pre-Deployment Validation: Transportation-Specific RL Simulation**\n\nCentific's transportation-specific reinforcement learning simulation environment enables pre-deployment fine-tuning of detection models against operationally relevant scenarios before a single sensor goes live. Models are exercised through realistic conditions — multi-vehicle incidents, sensor degradation under adverse weather, wrong-way vehicle events, and debris detection in variable lighting — and fine-tuned against verifiable performance outcomes in simulation.\n\nThis produces a measurable accuracy baseline available to agency evaluators prior to production go-live — eliminating the performance ramp-up period that typically characterizes AI-based deployments. No competing platform is offering a purpose-built simulation environment as part of their model development methodology.",
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getRFPSection(id: string): RFPSection | null {
  return RFP_SECTIONS.find((s) => s.id === id) ?? null;
}
