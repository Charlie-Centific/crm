// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiscoveryQuestion {
  id: string;
  question: string;         // Ask this verbatim (or close to it)
  intent: string;           // Why this question — what you're trying to surface
  whenHit: {
    signal: string;         // What they say that confirms the pain
    response: string;       // What to say back
    bridge: string;         // The bridge to VAI: "That's exactly what VAI..."
    capability: string;     // VAI capability label
    stat?: string;          // Optional proof point / stat
  };
  whenMiss: {
    signal: string;         // What they say when the pain isn't there
    redirect: string;       // How to pivot
    probe: string;          // Follow-on probe to find the real pain
  };
}

export interface PainPoint {
  id: string;
  label: string;            // Short chip label
  signal: string;           // What they say that surfaces this pain
  response: string;         // What to say back (1-2 sentences)
  bridge: string;           // Bridge to VAI capability
  capability: string;       // Which VAI capability addresses it
  stat?: string;            // Proof point or outcome stat
}

export interface Objection {
  id: string;
  objection: string;        // What they say
  response: string;         // First response
  depth?: string;           // If they push back harder
}

export interface Scenario {
  id: string;
  title: string;
  setup: string;            // How to frame it: "Imagine..."
  walkthrough: string;      // What VAI does step by step
  punchline: string;        // The so-what
}

export interface RFPItem {
  id: string;
  category: "Technical" | "Integration" | "Security" | "Experience" | "Support";
  question: string;         // The RFP question as written
  response: string;         // Ready-to-paste response
  tips?: string;            // Internal tip for customizing before sending
}

export interface Playbook {
  slug: string;
  vertical: string;
  label: string;
  tagline: string;
  buyer: string;            // Who you're typically talking to
  overview: string;
  discovery: DiscoveryQuestion[];
  painPoints: PainPoint[];
  objections: Objection[];
  scenarios: Scenario[];
  rfp: RFPItem[];
}

// ─── Smart City ───────────────────────────────────────────────────────────────

const smartCity: Playbook = {
  slug: "smart-city",
  vertical: "smart_city",
  label: "Smart City",
  tagline: "Real-time awareness. Instant investigation. Defensible records.",
  buyer: "City Operations Director, CIO, Emergency Management, Public Works",
  overview:
    "Cities are data-rich but insight-poor. VAI connects the cameras, sensors, and systems already in place — giving operators the confidence that nothing slipped through undetected, and investigators the ability to reconstruct any event in minutes.",
  discovery: [
    {
      id: "response-time",
      question: "How long does it take your team to find out something went wrong on the ground?",
      intent: "Surface the gap between incident and awareness. Most teams find out via phone call or a report written hours later.",
      whenHit: {
        signal: "They mention phone calls, manual patrols, delayed reports, or a lag measured in hours or shifts.",
        response:
          "That gap — between when something happens and when someone can actually act — is exactly the problem we see across every city we work with. And the cost isn't just operational. It's accountability, it's safety, and it's the trust people have that someone is paying attention.",
        bridge:
          "VAI closes that gap to seconds. The moment a sensor or camera detects something significant, the right person gets an alert with the footage and context attached — before anyone even picks up the phone.",
        capability: "Real-time monitoring & instant alerting",
      },
      whenMiss: {
        signal: "They say they have alerts, dashboards, or an existing system that surfaces issues quickly.",
        redirect:
          "That's great — so you've got the detection side covered. Let me ask about the other half: when something does surface, how confident is your team that it's a real incident before they dispatch?",
        probe:
          "What happens when your team gets an alert at 2am — what does the process look like to confirm it's real before anyone moves?",
      },
    },
    {
      id: "false-alarms",
      question: "What happens when your team gets a false alarm at 2am — how do you decide whether to dispatch?",
      intent: "Surface the cost of poor signal accuracy. Most teams dispatch on suspicion, wasting resources and eroding trust in their alert systems.",
      whenHit: {
        signal: "They describe dispatching crews to nothing, teams that have learned to ignore alerts, or a high false-positive rate they've accepted as normal.",
        response:
          "That erosion of trust in your alerts is a real problem — because eventually teams start ignoring the system altogether. And the one time the alert is real, nobody moves fast enough.",
        bridge:
          "VAI cross-references sensor readings with live camera feeds before alerting. So by the time someone's phone goes off, the system has already confirmed there's something real to look at — not just a reading to investigate.",
        capability: "Multi-source alert validation",
      },
      whenMiss: {
        signal: "They say false alarms aren't a major issue, or they have good sensor quality.",
        redirect:
          "Good — so the detection quality is solid. Let me shift to what happens after an incident. When something does go wrong, how does your team piece together exactly what happened?",
        probe:
          "If something happened last Tuesday evening, how long would it take to reconstruct a complete picture — video, sensor logs, what was done in response?",
      },
    },
    {
      id: "investigation",
      question: "If something happened last Tuesday, how long would it take to piece together exactly what occurred?",
      intent: "Expose the manual investigation burden. Post-event reconstruction is typically hours or days of footage scrubbing and log cross-referencing.",
      whenHit: {
        signal: "They mention hours of review, multiple systems to check, needing IT access for footage, or investigators who spend days on a single incident.",
        response:
          "That's one of the biggest time sinks we see — and it's also a risk. Every hour you're manually piecing things together is an hour where details could be missed, evidence could be misinterpreted, and leadership is waiting for an answer.",
        bridge:
          "VAI lets investigators ask plain-language questions — 'what happened at Main and 5th between 10pm and midnight?' — and it searches every camera, sensor log, and data source simultaneously. Full picture, timestamped, in minutes.",
        capability: "Cross-source investigation search",
      },
      whenMiss: {
        signal: "They have a video management system or investigation tool they're reasonably happy with.",
        redirect:
          "Interesting — so the investigation side has been solved to some degree. Let me ask about accountability. When leadership or legal asks for a record of what your team did and when, how do you provide that today?",
        probe:
          "How do you prove to a board, a legal team, or the public that your team responded appropriately — and what does that documentation process look like?",
      },
    },
    {
      id: "accountability",
      question:
        "When leadership, the city council, or legal asks what your team did during an incident — how do you prove it?",
      intent: "Open the accountability gap. Most teams rely on memory, manual notes, or pieced-together logs — none of which hold up well under scrutiny.",
      whenHit: {
        signal: "They mention manual logs, incident reports written after the fact, relying on staff memory, or legal exposure they're uncomfortable with.",
        response:
          "That's real risk. If something escalates — a lawsuit, a public inquiry, a union grievance — 'we believe our team responded appropriately' isn't a defense. You need a record that shows exactly what was detected, what was done, and when.",
        bridge:
          "VAI automatically creates a structured, timestamped record of everything detected, every alert sent, and every action taken — without anyone having to maintain it. It's there from day one, for every incident.",
        capability: "Automated accountability record",
      },
      whenMiss: {
        signal: "They have existing incident management or documentation systems.",
        redirect:
          "Good — so the documentation side is in place. Last question: how much time does your team spend generating those reports and briefings?",
        probe:
          "How many hours a week does your team spend writing reports they could be acting on instead of producing?",
      },
    },
    {
      id: "reporting-burden",
      question:
        "How many hours a week does your team spend writing reports, shift briefings, or department summaries?",
      intent: "Surface the reporting burden — a universal pain point that's often underestimated as a cost.",
      whenHit: {
        signal: "They mention hours of report writing, end-of-shift summaries, weekly briefings, or staff time spent producing information instead of using it.",
        response:
          "That's pure overhead — time your team is spending producing information instead of acting on it. And it scales with headcount, which means it never gets easier as you grow.",
        bridge:
          "VAI generates incident summaries, shift briefings, and department reports automatically from the actual data — in the right format, ready before the meeting they're needed for. Your team reviews and approves. The work is already done.",
        capability: "Automated reporting & briefings",
      },
      whenMiss: {
        signal: "Reporting isn't a major pain point for them.",
        redirect:
          "Got it. Let me try a different angle — if you could ask your city a question and get an answer in seconds, what's the one thing you'd most want to know right now?",
        probe: "That question usually opens the art-of-the-possible conversation. Let them define the value.",
      },
    },
  ],
  painPoints: [
    {
      id: "delayed-awareness",
      label: "Finding out too late",
      signal: "\"We usually find out when someone calls us\" or \"we see it in the next shift's report\"",
      response:
        "That gap between when something happens and when someone can act is exactly the problem. It means every response is already behind.",
      bridge:
        "VAI monitors continuously and notifies the right person the moment something significant is detected — with footage, context, and sensor data attached.",
      capability: "Real-time alerting",
      stat: "Cities using VAI close the awareness gap from hours to seconds.",
    },
    {
      id: "false-alarms",
      label: "False alarms",
      signal: "\"Our teams have learned to ignore half the alerts\" or \"we dispatch and find nothing\"",
      response:
        "When alert systems generate too many false positives, teams learn to distrust them — which is when the real incidents get missed.",
      bridge:
        "VAI cross-references sensor readings with live video before alerting. Teams only get notified when the system has confirmed something is actually happening.",
      capability: "Multi-source alert validation",
      stat: "Reduces unnecessary dispatches and restores operator trust in the alert system.",
    },
    {
      id: "investigation-burden",
      label: "Manual footage review",
      signal: "\"Our investigators spend days scrubbing video\" or \"it takes us a week to understand what happened\"",
      response:
        "Manual post-event review is one of the biggest drains on investigator time — and it's where details fall through the cracks.",
      bridge:
        "VAI lets investigators ask plain-language questions and searches every camera, sensor log, and data source simultaneously. Full picture in minutes.",
      capability: "Cross-source investigation",
      stat: "Reconstructs any event timeline across all sources in minutes instead of days.",
    },
    {
      id: "accountability-gap",
      label: "No defensible record",
      signal: "\"We rely on what staff remembers\" or \"we had an incident and couldn't fully reconstruct it\"",
      response:
        "Relying on memory or manual logs is a legal and reputational risk that grows with every incident that isn't fully documented.",
      bridge:
        "VAI automatically creates a structured, timestamped record of every detection, alert, and action — without anyone having to maintain it.",
      capability: "Automated accountability record",
    },
    {
      id: "report-burden",
      label: "Report overhead",
      signal: "\"My team spends half their time writing reports\" or \"we're always behind on briefings\"",
      response:
        "Time spent producing information is time not spent acting on it. And it scales poorly — more incidents means more reports.",
      bridge:
        "VAI generates shift briefings, incident summaries, and department reports automatically from live data. Ready before the meeting.",
      capability: "Automated reporting",
    },
    {
      id: "disconnected-systems",
      label: "Systems don't talk",
      signal: "\"Our cameras are separate from our sensors\" or \"we have to log into 4 different tools\"",
      response:
        "When your data is in silos, patterns that should be obvious go unnoticed — because no one is looking at everything at once.",
      bridge:
        "VAI connects all of it — cameras, sensors, CAD, dispatch logs — into a single intelligence layer. No rip and replace.",
      capability: "Unified data integration",
    },
  ],
  objections: [
    {
      id: "we-have-cameras",
      objection: "We already have cameras and sensors.",
      response:
        "Exactly — that's the foundation. VAI doesn't replace any of it. It's the intelligence layer on top of what you already have. Your cameras get smarter. Your sensors become predictive. The infrastructure investment you've already made starts generating real operational value.",
      depth:
        "Think of it this way: a camera without VAI is a recording device. With VAI, it's an always-on analyst that never misses anything and never gets tired.",
    },
    {
      id: "it-wont-approve",
      objection: "Our IT or security team will block this.",
      response:
        "We hear this often — and it's exactly why we built to their standards. VAI is SOC 2 Type II, CJIS, and GDPR compliant. It works within your existing network architecture and doesn't require data to leave your environment. We're happy to get your security team on a call directly.",
      depth:
        "We've been through this approval process at city and county level many times. Share your security questionnaire with us — we'll fill it out.",
    },
    {
      id: "budget",
      objection: "We don't have budget for something like this.",
      response:
        "The entry point is one NVIDIA DGX Spark and a 3-month pilot — not a 7-figure platform contract. You define the use case, we connect 10 data streams, and you see measurable outcomes within the first few weeks. The pilot is designed to build the internal business case for expansion.",
      depth:
        "Most of our city clients fund the pilot out of operational savings — reduced false alarm dispatches, fewer investigation hours. The ROI is typically visible within the pilot window.",
    },
    {
      id: "tried-ai-before",
      objection: "We've tried AI before and it delivered nothing.",
      response:
        "That's a fair concern — a lot of AI projects in this space were long, expensive, and disconnected from actual operations. SLiM is designed for the opposite: one focused use case, up and running in hours, producing outcomes your team can see in the first few weeks. If it doesn't work for you, you haven't made a massive commitment.",
    },
    {
      id: "procurement-slow",
      objection: "Our procurement process takes forever.",
      response:
        "We know how government procurement works — which is why SLiM is designed to start small and prove value before any large contract is required. Many clients start through an existing vendor relationship or an existing contract vehicle. We can help identify the fastest path.",
    },
  ],
  scenarios: [
    {
      id: "utility-spike",
      title: "Utility sensor spikes at 3am",
      setup:
        "A sensor in your water infrastructure reads an anomalous pressure spike at 3am. Your on-call staff gets the alert.",
      walkthrough:
        "Without VAI: the on-call person drives out to check manually — often finding nothing. With VAI: the moment the sensor spikes, VAI cross-references it against the nearest camera feed. If it sees a visible leak, it confirms. If the camera shows no issue, it flags as likely false alarm. The on-call crew gets a notification that says 'sensor anomaly confirmed visually — leakage visible at valve 14B' — and leaves the house with everything they need before they even arrive.",
      punchline: "The shift: from dispatching on suspicion to dispatching with confidence.",
    },
    {
      id: "hit-and-run",
      title: "Hit-and-run at a busy intersection",
      setup:
        "A hit-and-run happens at a downtown intersection at 7:30pm. Witnesses describe a dark blue SUV. Investigators are assigned the next morning.",
      walkthrough:
        "Traditional investigation: manually scrubbing footage from 3-4 cameras around the intersection. Hours of review. Limited coverage. With VAI: investigators type 'dark blue SUV, intersection of 5th and Main, between 7pm and 8pm.' VAI searches every connected camera across the city for that time window, identifies vehicles matching the description, and returns a timestamped movement trail — where the vehicle came from, where it went — in minutes.",
      punchline:
        "From days of manual review to a complete movement trail in minutes.",
    },
    {
      id: "crowd-buildup",
      title: "Crowd building at a public venue",
      setup:
        "A public event at city hall draws an unexpectedly large crowd. Density is building near a bottleneck entrance.",
      walkthrough:
        "VAI detects the density pattern in real time and compares it against historical baselines for that location. When it crosses the threshold that historically precedes a safety incident, it alerts the supervisor on duty — early enough to reroute foot traffic before the situation develops. The supervisor acts on data, not a gut feeling, and dispatches two officers to the entrance proactively.",
      punchline: "The shift: from reacting to problems to preventing them.",
    },
    {
      id: "leadership-briefing",
      title: "Leadership asks what happened during last week's outage",
      setup:
        "A significant service outage affected downtown for 3 hours last Tuesday. The director needs a complete account for the city council.",
      walkthrough:

        "Without VAI: staff spend two days pulling logs, reviewing footage, interviewing supervisors, and writing a narrative. With VAI: the director types the question. VAI generates a complete incident timeline — every affected camera, every sensor reading, every action taken — automatically. Ready for the briefing, the council meeting, or a legal team.",
      punchline: "From two days of staff time to a complete account in minutes.",
    },
  ],
  rfp: [
    {
      id: "sc-technical",
      category: "Technical",
      question: "Describe your platform's ability to ingest, correlate, and analyze data from multiple heterogeneous city data sources simultaneously.",
      response:
        "The VAI platform is designed as a city-wide intelligence layer that ingests structured and unstructured data from cameras, IoT sensors, 911 systems, traffic management platforms, utility monitoring, and open data feeds simultaneously. Data is normalized, correlated, and surfaced through a unified operational dashboard accessible by authorized personnel across departments. AI models trained on public-sector scenarios detect anomalies, surface trends, and generate automated alerts — reducing the manual effort required to synthesize data across systems that were never designed to talk to each other. All data ingestion is managed through configurable API connectors with no changes required to source systems.",
      tips: "Ask which specific city systems are in scope before responding — confirm connector availability for their stack.",
    },
    {
      id: "sc-integration",
      category: "Integration",
      question: "How does your solution integrate across city departments — public works, transportation, utilities, and public safety — that may have separate technology stacks and different procurement vehicles?",
      response:
        "VAI is architected for multi-department deployment. Each department maintains access to its own operational data through existing tools while gaining a unified intelligence view of cross-department data relevant to their function. Role-based access controls ensure departments see only what they are authorized to access, with full audit logging. Integration is additive and department-by-department — cities can start with one or two departments and expand scope incrementally, reducing procurement complexity and allowing each department to validate value before broader rollout. Centific has designed multi-department deployment playbooks specifically for cities beginning with a public safety and operations pairing.",
      tips: "Multi-department deployments often require separate MOUs or data-sharing agreements between departments — flag this for city IT and legal early in the process.",
    },
    {
      id: "sc-security",
      category: "Security",
      question: "How does your platform handle resident data privacy, comply with applicable state and local data protection regulations, and manage consent for data use?",
      response:
        "Resident data protection is a core design principle of the VAI platform. The system does not link camera or sensor data to individual resident identities unless explicitly configured and legally authorized under the agency's specific use policy. All data processing is governed by configurable retention policies and deletion schedules aligned to the agency's legal requirements. The platform is SOC 2 Type II certified and compliant with applicable federal and state data privacy frameworks, including CCPA where applicable. Privacy impact assessments are conducted as part of every deployment. For cities subject to algorithmic accountability ordinances, VAI provides full transparency reporting on alert volumes and model performance on request.",
      tips: "For California cities, confirm whether they are subject to CCPA or any municipal AI-use restrictions before finalizing the security section.",
    },
    {
      id: "sc-experience",
      category: "Experience",
      question: "Provide references from municipal deployments of comparable scale, including city size, department scope, and integration complexity.",
      response:
        "Centific has deployed VAI solutions in municipal environments ranging from mid-size cities (population 100,000–300,000) to larger metro areas managing multiple districts. Relevant outcomes include: (1) City-wide situational awareness deployment reducing emergency response time by 22% through real-time incident detection across 150+ connected cameras; (2) Cross-department data integration connecting public works, traffic, and public safety into a single intelligence platform — enabling coordinated response to shared infrastructure events; (3) Automated reporting deployment reducing city council and executive report preparation time by 65%. Reference contacts are available for qualified evaluators under NDA.",
      tips: "Match the reference to the prospect's city size and department scope. Check with Sales Ops for which references are cleared.",
    },
    {
      id: "sc-support",
      category: "Support",
      question: "Describe your approach to training and change management for city staff across multiple departments with varying levels of technical sophistication.",
      response:
        "Centific's implementation methodology includes a dedicated change management and training phase for every deployment. Training is role-based: operational staff receive hands-on, scenario-based training in workflows specific to their function; department heads receive executive dashboard and KPI reporting setup; IT staff receive technical administration, integration, and support protocol training. All training materials are provided in digital and printable formats and maintained in an agency-specific knowledge base. A Customer Success Manager is assigned for the first 12 months post-deployment, conducting monthly check-ins and quarterly business reviews. Ongoing training for new staff is included in enterprise agreements.",
      tips: "Cities with high staff turnover value the ongoing new-hire training inclusion — emphasize this when talking to city HR or IT leadership.",
    },
  ],
};

// ─── Transit ──────────────────────────────────────────────────────────────────

const transit: Playbook = {
  slug: "transit",
  vertical: "transit",
  label: "Transit",
  tagline: "Predict failures. Protect riders. Keep the network moving.",
  buyer: "VP Operations, Chief of Transit Police, Maintenance Director, GM",
  overview:
    "Transit agencies generate millions of data points daily — but still run reactively. VAI turns that data into predictive intelligence: fewer unplanned outages, safer platforms, recovered fare revenue, and dispatching that responds to actual demand.",
  discovery: [
    {
      id: "maintenance-failures",
      question:
        "When a vehicle or piece of infrastructure fails unexpectedly, how much warning does your team typically get?",
      intent:
        "Surface the reactive maintenance problem. Most agencies find out about failures when they happen — not before.",
      whenHit: {
        signal:
          "They describe failures that came out of nowhere, cascading delays from a single breakdown, or a maintenance backlog they can't get ahead of.",
        response:
          "Reactive maintenance is the most expensive kind — because you're not just paying for the repair, you're paying for the service disruption, the knock-on delays across the network, and the rider trust that takes months to rebuild.",
        bridge:
          "VAI correlates sensor data, telematics, and vehicle video to forecast failures before they cause service disruptions. Your maintenance team gets early warnings — not post-mortems.",
        capability: "Predictive maintenance intelligence",
      },
      whenMiss: {
        signal: "They have a predictive maintenance program or say failures are rare.",
        redirect:
          "Good — so the maintenance side is relatively under control. Let me ask about what happens when riders are on the platform. What's your visibility into safety conditions in real time?",
        probe:
          "How quickly do your supervisors know when there's a safety concern on a platform — a fight, someone at the edge, an unattended bag?",
      },
    },
    {
      id: "platform-safety",
      question:
        "When there's a safety incident on a platform — a disturbance, someone near the edge, an unattended bag — how quickly do you know?",
      intent:
        "Surface the platform safety visibility gap. Most agencies rely on riders reporting or staff spotting issues manually.",
      whenHit: {
        signal:
          "They mention incidents that escalated before anyone noticed, dispatchers who can't monitor all feeds simultaneously, or relying on rider calls to find out something happened.",
        response:
          "Platform safety is one of those areas where a few seconds of earlier awareness can completely change the outcome. By the time a rider calls it in, the window to intervene has often passed.",
        bridge:
          "VAI monitors platform cameras in real time and detects edge risk, altercations, crowd density anomalies, and unattended items — alerting the right person immediately, with the footage attached.",
        capability: "Platform safety monitoring",
      },
      whenMiss: {
        signal: "They have good platform monitoring or transit police coverage.",
        redirect:
          "Good visibility there. Let me ask about the revenue side — how much do you estimate you lose to fare evasion annually?",
        probe:
          "Is fare evasion something you're actively measuring and trying to address, or is it more of a known cost you've accepted?",
      },
    },
    {
      id: "fare-evasion",
      question: "How much revenue do you estimate you lose to fare evasion, and how are you addressing it today?",
      intent: "Open the fare recovery conversation. Most agencies have a rough sense of the problem but limited tools to address it systematically.",
      whenHit: {
        signal: "They have an estimate (even rough), mention it's a political issue, or describe manual enforcement that doesn't scale.",
        response:
          "Fare evasion is often treated as an accepted cost — but at scale it's a real budget impact that compounds every year. And enforcement that requires deploying officers is expensive and creates friction with riders.",
        bridge:
          "VAI identifies fare evasion patterns across subway, bus, and light rail using AI video analytics — without requiring manual enforcement at every gate. It gives your team data to optimize where and when enforcement has the highest impact.",
        capability: "Revenue protection analytics",
      },
      whenMiss: {
        signal: "Fare evasion is low or not a priority.",
        redirect:
          "Got it — sounds like that's not your biggest lever right now. Let me shift to the dispatching side. How does your team decide when to add capacity on a route — is it schedule-based, or do you have demand signals you're working with?",
        probe:
          "If a route is running hot at 6pm on a Tuesday, how long does it take your dispatchers to know and respond?",
      },
    },
    {
      id: "dispatch-optimization",
      question:
        "When a route is overcrowded or running behind schedule, how does your dispatch team find out and respond?",
      intent: "Surface demand-blind dispatching. Most agencies respond to disruptions rather than anticipating them.",
      whenHit: {
        signal:
          "They describe reactive dispatching, schedule-based decisions that don't reflect real demand, or supervisors relying on driver reports.",
        response:
          "Dispatching without real-time demand signals means you're always a step behind — adding capacity after riders have already had a bad experience.",
        bridge:
          "VAI fuses real-time ridership data, camera feeds, and historical patterns to generate demand forecasts that drive dispatch decisions before bottlenecks form.",
        capability: "AI-driven demand forecasting",
      },
      whenMiss: {
        signal: "They have AVL or real-time tracking tools already.",
        redirect:
          "Good — tracking is solved. What about the investigation side: when there's a major service failure, how long does it take to understand what caused it and produce the report?",
        probe:
          "If a major delay happened yesterday, how long would it take your team to produce a complete account of what happened and why?",
      },
    },
  ],
  painPoints: [
    {
      id: "unplanned-outages",
      label: "Unplanned outages",
      signal: "\"We don't know something's wrong until the vehicle stops\" or \"cascading delays from a single failure\"",
      response:
        "Reactive maintenance is your most expensive mode of operation — repair cost plus service disruption plus rider trust erosion.",
      bridge:
        "VAI correlates sensor, telematics, and video data to forecast failures before service is impacted.",
      capability: "Predictive maintenance",
      stat: "30% reduction in unplanned maintenance disruptions for agencies using VAI.",
    },
    {
      id: "platform-incidents",
      label: "Platform safety gaps",
      signal: "\"We rely on riders to call it in\" or \"by the time we know, it's already escalated\"",
      response:
        "A few seconds of earlier awareness on a platform can completely change the outcome of a safety incident.",
      bridge:
        "VAI monitors platform cameras in real time and alerts immediately for edge risk, altercations, crowd density spikes, and unattended items.",
      capability: "Platform safety monitoring",
    },
    {
      id: "fare-leakage",
      label: "Fare evasion",
      signal: "\"We know it's a problem but enforcement doesn't scale\" or \"we've accepted it as a cost\"",
      response:
        "At scale, fare evasion is a material budget impact that compounds year over year without systematic intervention.",
      bridge:
        "VAI identifies evasion patterns across bus, subway, and light rail — giving your team data to deploy enforcement where it has the highest impact.",
      capability: "Revenue protection analytics",
      stat: "AI-powered fare analytics recover lost revenue and enable targeted, lower-friction enforcement.",
    },
    {
      id: "reactive-dispatch",
      label: "Reactive dispatching",
      signal: "\"We add capacity after the route is already overcrowded\" or \"our dispatching is schedule-based\"",
      response:
        "Dispatching based on schedules instead of demand means riders experience the problem before your team can fix it.",
      bridge:
        "VAI fuses ridership data, camera feeds, and historical patterns to drive proactive dispatching decisions before bottlenecks form.",
      capability: "AI demand forecasting",
      stat: "25% improvement in on-time performance through predictive optimization.",
    },
    {
      id: "late-investigation",
      label: "Slow post-incident review",
      signal: "\"It takes us days to understand what caused a major delay\" or \"the board report takes two days to put together\"",
      response:
        "Manual incident reconstruction is a drain on your operations team and creates a gap between what happened and when leadership understands it.",
      bridge:
        "VAI reconstructs any service incident across all connected data sources — sensor logs, video, dispatch records — automatically.",
      capability: "Automated incident timeline",
    },
  ],
  objections: [
    {
      id: "different-vendors",
      objection: "Our cameras and sensors are from different vendors — they don't work together.",
      response:
        "That's the norm, not the exception. VAI is designed to connect heterogeneous infrastructure — CCTV from one vendor, IoT sensors from another, ticketing from a third. We've built the integrations. No rip and replace.",
    },
    {
      id: "live-operations",
      objection: "We can't disrupt live operations for a deployment.",
      response:
        "SLiM deploys alongside your existing operations — it doesn't replace or interrupt anything. We connect to your live feeds passively. Your team sees new intelligence layered on top of what they're already doing, from day one.",
    },
    {
      id: "procurement-time",
      objection: "AI procurement at our agency takes 18 months.",
      response:
        "That's why SLiM exists. It's designed to run as a 90-day pilot on a limited scope so you can see results before a major procurement is required. Many transit agencies start through existing contract vehicles or infrastructure vendors.",
    },
    {
      id: "union-concerns",
      objection: "Our operators and mechanics will push back on AI monitoring.",
      response:
        "The most compelling benefit for frontline staff is that VAI reduces their paperwork burden significantly — automated reports from body cameras and dispatch logs, predictive alerts that reduce emergency situations. This helps staff, it doesn't replace them.",
    },
  ],
  scenarios: [
    {
      id: "vehicle-failure-forecast",
      title: "Predicting a vehicle failure before it strands riders",
      setup:
        "A bus on a busy route is running 3 weeks from its scheduled maintenance check. Vibration sensors are showing a gradual anomaly over the past 4 days.",
      walkthrough:
        "VAI correlates the sensor trend against historical patterns from vehicles that went on to fail. At day 4, it flags the vehicle for early inspection — before any service disruption. Maintenance pulls the bus for a targeted check that afternoon. The issue is found and fixed. No stranded riders, no cascading delays.",
      punchline:
        "The shift: from finding out when the bus stops to preventing it from stopping.",
    },
    {
      id: "platform-edge",
      title: "Platform edge incident — early intervention",
      setup:
        "A passenger at a busy subway platform is exhibiting distress behaviors near the edge during rush hour.",
      walkthrough:
        "VAI detects the behavior pattern from the platform camera and immediately alerts the nearest transit police officer with the footage attached. The officer redirects — on their way to the platform before the situation escalates. The incident is resolved in under 90 seconds from detection.",
      punchline:
        "Prevented an incident before it became a headline.",
    },
    {
      id: "demand-surge",
      title: "Event surge — proactive dispatching",
      setup:
        "An unexpected event downtown causes a 3x spike in ridership on two routes starting at 5:45pm.",
      walkthrough:
        "VAI detects the crowd density building at the downtown stations 20 minutes before the rush hits. It surfaces an alert to the dispatch supervisor with a demand forecast: Route 12 and 14 are projected to be over capacity at 6:05pm. The supervisor adds capacity on both routes. Riders experience a busier-than-normal commute — but no crush loads and no delays.",
      punchline:
        "Proactive capacity management before riders feel the impact.",
    },
  ],
  rfp: [
    {
      id: "tr-technical",
      category: "Technical",
      question: "Describe your platform's capabilities for real-time video analysis and object detection across transit infrastructure.",
      response:
        "The VAI VAI platform processes live video from transit cameras in real time using computer vision models trained on transit-specific scenarios — platform crowding, fare evasion, unattended objects, and edge risk events. The platform ingests feeds from existing camera infrastructure without requiring hardware replacement, typically integrating within 2–4 weeks. Detection events are surfaced with AI confidence scores and video clips attached, enabling operators to verify and act within seconds of an incident. Processing latency is under 2 seconds per detection event.",
      tips: "Lead with no-hardware-replacement — transit agencies are capital-constrained and can't afford infrastructure overhaul.",
    },
    {
      id: "tr-integration",
      category: "Integration",
      question: "How does your solution integrate with existing transit management and CAD systems, including AVL, ticketing, and scheduling platforms?",
      response:
        "VAI integrates via REST APIs and pre-built connectors with leading transit management systems including Trapeze, Clever Devices, Tyler Technologies, and Orbital. Events and alerts generated by the platform can be surfaced directly in existing dispatch consoles, injected into CAD workflows, or pushed to third-party incident management tools via webhook or API. The integration layer is fully configurable — no proprietary hardware or infrastructure replacement is required. Centific has completed transit integrations across heterogeneous environments including agencies with mixed CCTV vendors, multiple CAD generations, and legacy ticketing infrastructure.",
      tips: "Ask which specific systems they use before submitting — confirm connector availability for the exact stack.",
    },
    {
      id: "tr-security",
      category: "Security",
      question: "What security certifications does your platform hold, and how is transit video data — including footage of passengers — handled, stored, and protected?",
      response:
        "The VAI platform is SOC 2 Type II certified and supports both SaaS and on-premises deployment for agencies with strict data residency requirements. Video data is encrypted at rest (AES-256) and in transit (TLS 1.2+). Role-based access controls limit who can view, export, or share footage, with full audit logging of all access events. Retention policies are fully configurable per the agency's legal and operational requirements. No passenger biometric data is stored or linked to individual identities unless explicitly configured and authorized by the agency.",
      tips: "If they flag biometric concerns related to state AI regulations, clarify the default no-biometric-linking posture upfront.",
    },
    {
      id: "tr-experience",
      category: "Experience",
      question: "Provide references from transit agencies of comparable scale and describe case studies relevant to this scope.",
      response:
        "Centific has deployed the VAI platform with transit authorities ranging from mid-size metro systems to regional multi-modal networks serving populations of 100,000 to over 2 million daily riders. Case studies available upon request include: (1) Platform crowding detection reducing dwell time by 18% at three high-volume stations; (2) Automated fare evasion analytics recovering $1.2M annually in lost revenue and reducing enforcement deployment cost by 35%; (3) Predictive maintenance integration reducing unplanned vehicle outages by 30% in the first six months. Reference contacts are available for qualified evaluators under NDA.",
      tips: "Request NDA before sharing reference contacts. Check with Sales Ops which references are cleared and available for this prospect.",
    },
    {
      id: "tr-support",
      category: "Support",
      question: "Describe your implementation methodology, go-live timeline, and ongoing support and maintenance model.",
      response:
        "Implementation follows a four-phase methodology: (1) Discovery & Site Survey (2 weeks) — infrastructure assessment, integration mapping, use case prioritization; (2) Configuration & Integration (4–6 weeks) — platform deployment, API connections, alert threshold configuration; (3) Pilot Validation (4 weeks) — controlled deployment with agency stakeholders, alert tuning, and staff training; (4) Full Go-Live & Handoff — monitored rollout with dedicated customer success support. Ongoing support includes a named Customer Success Manager, 24/7 platform monitoring with 99.9% uptime SLA, quarterly business reviews, and a dedicated support channel with a 4-hour SLA for critical issues.",
      tips: "Timeline can compress to 8 weeks total for smaller-scope pilots — useful for phased procurement strategies.",
    },
  ],
};

// ─── Emergency Services ───────────────────────────────────────────────────────

const emergency: Playbook = {
  slug: "emergency",
  vertical: "emergency",
  label: "Emergency Services",
  tagline: "Protect faster. Prove clearly. Investigate thoroughly.",
  buyer: "Police Chief, Sheriff, DA, Undersheriff, Records Commander, City Attorney",
  overview:
    "Public safety agencies are stretched thin: officers buried in paperwork, dispatchers overwhelmed, investigators waiting weeks for digital evidence. VAI gives agencies the intelligence to respond faster, the tools to reduce admin burden, and the audit trails to defend every decision.",
  discovery: [
    {
      id: "response-time",
      question:
        "When a dispatcher gets flooded with calls during a high-volume period, what's your process for making sure nothing critical gets missed?",
      intent:
        "Surface dispatcher attention fatigue. Research shows dispatchers miss critical cues after 20 minutes of nonstop monitoring — a well-documented and politically sensitive pain.",
      whenHit: {
        signal:
          "They acknowledge the problem, mention close calls, describe supervisors trying to monitor dispatchers, or admit they've had incidents traced back to a missed call.",
        response:
          "This is one of the most documented failure modes in dispatch — and it's not a training problem, it's a human attention problem. No person can maintain peak alertness through a 4-hour high-volume period. That's not a criticism of your team; it's just how cognition works.",
        bridge:
          "VAI monitors every feed continuously without fatigue. When something critical appears, it surfaces it immediately to the right dispatcher — prioritized, with context attached — so your team focuses their attention where it matters most.",
        capability: "AI-augmented dispatch monitoring",
      },
      whenMiss: {
        signal: "They have good protocols, supervision, or redundancy that covers this.",
        redirect:
          "Good — sounds like the dispatch side is managed well. Let me shift to the officer side. How much of an officer's shift is currently going to paperwork versus patrol?",
        probe:
          "If you could give each officer back an hour a day, what would you want them spending that time on?",
      },
    },
    {
      id: "officer-admin",
      question:
        "What percentage of an officer's shift is going to report writing, documentation, and administrative work versus patrol?",
      intent:
        "Surface the admin burden. Most agencies see 30–50% of officer time going to paperwork — a number that's well known but rarely solved.",
      whenHit: {
        signal:
          "They give a high percentage (often 40–50%), express frustration about officers 'sitting at a desk' instead of in the community, or mention staffing pressure that admin burden worsens.",
        response:
          "That's one of the most expensive inefficiencies in law enforcement — and it's also a morale issue. Officers joined to serve the community, not to write reports. And with recruitment challenges across the industry, losing officers because of admin burden is a real risk.",
        bridge:
          "VAI automatically drafts reports from body-worn camera footage and dispatch logs. Officers review and submit — they don't start from a blank page. That's up to 40% of admin time back.",
        capability: "Automated report drafting",
        stat: "VAI reduces officer admin work by up to 40%.",
      },
      whenMiss: {
        signal: "They have existing report automation or the admin burden is manageable.",
        redirect:
          "Interesting. Let me ask about the digital evidence side. When investigators need to review seized phones or digital evidence, what does that timeline look like today?",
        probe:
          "If a phone is seized in connection with a case, how long before investigators have usable intelligence from it?",
      },
    },
    {
      id: "digital-forensics",
      question:
        "When investigators get a seized phone or need to review body cam footage, how long does it typically take to get actionable intelligence?",
      intent: "Surface the digital forensics backlog — a major pain point in investigations that directly affects case timelines.",
      whenHit: {
        signal:
          "They mention weeks-long backlogs, waiting for the digital forensics unit, or hours of footage review per case.",
        response:
          "Digital evidence backlogs directly affect case outcomes — charging decisions get delayed, witnesses' memories fade, and defense attorneys use the delay as a lever. Every week a phone sits in queue is a week the investigation is stalled.",
        bridge:
          "VAI analyzes seized phones — texts, images, videos, calls — in minutes. Investigators can search across all content instantly and surface relevant evidence without manually reviewing everything.",
        capability: "Digital forensics at scale",
        stat: "Replace weeks of manual digital review with targeted intelligence in minutes.",
      },
      whenMiss: {
        signal: "They have a digital forensics unit with reasonable turnaround.",
        redirect:
          "Good to hear. Let me ask about something that comes up in almost every conversation we have with law enforcement leadership: accountability. When an officer's decision is questioned — by the community, a supervisor, or a court — how do you provide the record?",
        probe:
          "How confident are you that for any given incident, you could reconstruct exactly what happened, what was detected, and what action was taken?",
      },
    },
    {
      id: "accountability-trail",
      question:
        "When an officer's decision is questioned in court, a community meeting, or an internal review — what's the documentation you rely on?",
      intent:
        "Surface the accountability gap. Agencies that can't provide clear, defensible records face legal exposure and community trust erosion.",
      whenHit: {
        signal:
          "They mention relying on officer memory, body cam footage that's hard to find, incident reports written after the fact, or legal cases that were complicated by documentation gaps.",
        response:
          "Documentation gaps are where legal and reputational risk accumulates. A single incident that can't be fully reconstructed — where you have to say 'we believe the officer acted appropriately' instead of 'here is the exact record' — is a liability.",
        bridge:
          "VAI maintains a continuous, structured audit trail for every alert, every detection, and every action — with AI confidence scores and reasoning attached. It's the kind of documentation that holds up in court and in community trust conversations.",
        capability: "Explainable AI with full audit trail",
      },
      whenMiss: {
        signal: "They have solid body cam programs and documentation protocols.",
        redirect:
          "Sounds like you've invested in that side. Let me ask one more: the DA relationship. When you're building cases, what's the handoff from your department to the DA's office look like in terms of evidence completeness?",
        probe:
          "Have you ever had a case where the DA couldn't move forward because evidence was incomplete or took too long to surface?",
      },
    },
  ],
  painPoints: [
    {
      id: "dispatcher-fatigue",
      label: "Dispatcher attention limits",
      signal: "\"We can't monitor everything during a surge\" or \"things slip through on busy nights\"",
      response:
        "No human maintains peak attention through hours of high-volume monitoring. It's cognitive science, not a failure of training.",
      bridge:
        "VAI monitors every feed continuously, prioritizes critical alerts, and surfaces them immediately — your dispatchers focus on what matters, not on watching screens.",
      capability: "AI-augmented dispatch monitoring",
    },
    {
      id: "admin-burden",
      label: "Officer paperwork burden",
      signal: "\"Officers spend half their shift on reports\" or \"we're losing people because of the admin load\"",
      response:
        "A 40–50% admin burden is also a morale and retention problem — officers joined to serve, not to write reports.",
      bridge:
        "VAI auto-drafts reports from body-cam footage and dispatch logs. Officers review and submit. Up to 40% of admin time returned to patrol.",
      capability: "Automated report drafting",
      stat: "Up to 40% reduction in officer admin work.",
    },
    {
      id: "digital-forensics-backlog",
      label: "Digital evidence backlog",
      signal: "\"Phones sit in queue for weeks\" or \"investigators are watching hours of footage per case\"",
      response:
        "Forensics backlogs directly affect case outcomes — charging decisions delay, witnesses' memories fade, momentum is lost.",
      bridge:
        "VAI analyzes seized phones and digital evidence in minutes. Search across all content — texts, images, calls, video — instantly.",
      capability: "Digital forensics at scale",
    },
    {
      id: "accountability",
      label: "Accountability gaps",
      signal: "\"We can't fully reconstruct what happened\" or \"an incident was challenged and we had limited documentation\"",
      response:
        "Incomplete records create legal exposure and community trust erosion — especially when incidents are high-profile.",
      bridge:
        "VAI maintains a continuous audit trail with AI confidence scores and reasoning for every detection and action — court-defensible from day one.",
      capability: "Explainable AI audit trail",
    },
    {
      id: "da-evidence",
      label: "Evidence handoff to DA",
      signal: "\"The DA can't move forward because evidence is buried\" or \"we send them files and they can't find what they need\"",
      response:
        "Fragmented evidence handoffs create charging delays — and every delay costs case momentum and staff time on both sides.",
      bridge:
        "VAI for DA offices creates a unified evidence workspace: police reports, video, audio, body cam, 911 — all correlated and searchable.",
      capability: "Unified evidence workspace",
      stat: "Reduce case prep time by up to 60%.",
    },
  ],
  objections: [
    {
      id: "ai-bias",
      objection: "We're concerned about AI bias and community trust.",
      response:
        "That's the right concern to raise — and it's why every VAI alert includes a confidence score and explainable AI reasoning. There's no black box. Every recommendation your team acts on can be defended with documented AI logic. That's actually a stronger accountability position than relying on human judgment alone.",
      depth:
        "We support community oversight programs and can provide full audit trail exports for any time period. Transparency is a feature, not a risk.",
    },
    {
      id: "cjis-compliance",
      objection: "We have strict CJIS compliance requirements.",
      response:
        "VAI is built for this environment. SOC 2 Type II and CJIS compliant from the ground up — data handling, access controls, audit logging, all of it. We've been through CJIS compliance review at multiple agencies. Happy to get your compliance officer into a technical deep-dive.",
    },
    {
      id: "existing-systems",
      objection: "We already have a records management system and video management platform.",
      response:
        "VAI connects to both — it doesn't replace them. Your RMS stays your system of record. Your VMS keeps managing storage. VAI adds the intelligence layer: search, correlation, and automated summaries on top of what you already have.",
    },
    {
      id: "union-opposition",
      objection: "The union will push back on AI monitoring officers.",
      response:
        "The most compelling pitch to officers is that VAI reduces paperwork by up to 40% — hours per shift given back for actual policing. It's not a surveillance tool for officers, it's an assistance tool. The audit trail also protects officers: when a decision is challenged, there's a clear, AI-documented record of what was detected and why action was taken.",
    },
    {
      id: "budget-cycle",
      objection: "We're mid-budget-cycle — nothing new until next fiscal year.",
      response:
        "The 3-month pilot is designed to generate the evidence you need to make the case for next fiscal year's budget. Many agencies use existing operational funds for the pilot and use the results to justify a full appropriation.",
    },
  ],
  scenarios: [
    {
      id: "threat-detection",
      title: "Detecting a threat before it escalates",
      setup:
        "Surveillance cameras in a high-traffic area during a public event. A person exhibiting escalating behavior near a restricted zone.",
      walkthrough:
        "VAI detects the behavior pattern — positioning, movement, escalation — and alerts the nearest supervisor immediately with the footage and confidence score. The supervisor redirects an officer in the area. The situation is addressed in under 2 minutes from detection. There's no incident. The entire detection-to-action chain is logged automatically.",
      punchline:
        "Prevented before it became an incident. Documented before anyone asked.",
    },
    {
      id: "digital-evidence",
      title: "Turning a seized phone into a case-breaking lead in minutes",
      setup:
        "Investigators seize a phone in connection with a gang-related assault. Traditional forensic review: 3–4 weeks. The case can't move forward until they know what's on it.",
      walkthrough:
        "VAI ingests the phone data and within minutes surfaces: a communication thread connecting the suspect to two associates, photos from the location on the night of the incident, and a timeline of movement. Investigators have the key leads the same day. They identify the associates and can move to charges within the week.",
      punchline: "From a 4-week forensic queue to actionable leads in minutes.",
    },
    {
      id: "auto-report",
      title: "An officer's shift report — written before they get back to the station",
      setup:
        "An officer responds to three incidents during a shift: a traffic stop, a disturbance, and a welfare check. At the end of shift, they'd normally spend 45–60 minutes writing reports.",
      walkthrough:
        "VAI generates draft reports from the body-cam footage for all three incidents automatically — event description, timestamps, persons involved, officer actions. The officer reviews each draft, makes minor edits, and submits. Total time: 12 minutes.",
      punchline: "45 minutes of report writing becomes 12 minutes of review.",
    },
  ],
  rfp: [
    {
      id: "em-technical",
      category: "Technical",
      question: "Describe your AI capabilities for real-time threat detection and behavioral analysis across multiple simultaneous camera feeds.",
      response:
        "VAI's VAI platform monitors multiple simultaneous video feeds using computer vision models trained specifically on public safety scenarios — behavioral escalation, perimeter intrusion, crowd density thresholds, and prohibited item detection. The platform processes feeds continuously without operator attention gaps and surfaces prioritized alerts with AI confidence scores, video clips, and contextual reasoning within 2 seconds of detection. Alerting is configurable by location, time of day, and detection type, enabling agencies to tune the system to their specific risk profile. All alerts and associated AI reasoning are automatically logged for audit and legal discovery purposes.",
      tips: "Emphasize explainability of every alert — this is critical for DA admissibility and community oversight conversations.",
    },
    {
      id: "em-security",
      category: "Security",
      question: "How does your platform ensure CJIS compliance and maintain chain of custody for digital evidence used in prosecution?",
      response:
        "The VAI platform is built for law enforcement data environments and is SOC 2 Type II certified and compliant with CJIS Security Policy requirements — including access control, audit logging, data encryption, and incident response. Evidence chain of custody is maintained through immutable audit logs that record every evidence access event: who accessed it, when, what action was taken, and from which system. Digital evidence files include cryptographic hash verification to certify integrity from collection through court submission. The platform supports on-premises and private-cloud deployment with no data leaving the agency's environment unless explicitly exported.",
      tips: "For a detailed CJIS compliance walkthrough, refer the prospect's compliance officer to Centific's technical team — don't try to field specific control questions in the RFP narrative.",
    },
    {
      id: "em-integration",
      category: "Integration",
      question: "How does your platform integrate with existing Records Management Systems (RMS), Computer-Aided Dispatch (CAD), and body-worn camera systems?",
      response:
        "VAI connects to existing RMS, CAD, and body-worn camera systems via API integrations and pre-built connectors. Supported systems include Axon Evidence, Motorola PremierOne, Tyler New World, Hexagon CAD, and CentralSquare. The platform does not replace existing systems — it adds an intelligence layer: AI-generated report drafts from body camera footage, correlated evidence linking across video, CAD records, and RMS case files, and unified search across all connected data sources. Integration is completed without disruption to existing workflows. Officers continue using the same RMS; VAI reduces the work required to populate it.",
      tips: "Ask which specific RMS/CAD they use and confirm connector availability before the RFP response goes in.",
    },
    {
      id: "em-experience",
      category: "Experience",
      question: "Provide references from law enforcement agencies using your platform for investigations and describe relevant deployment outcomes.",
      response:
        "Centific has deployed VAI solutions with law enforcement agencies including police departments, sheriff's offices, and DA offices. Relevant outcomes include: (1) AI-assisted report drafting reducing officer admin time by an average of 40% — returning 2–3 hours per shift to patrol; (2) Digital forensics analysis reducing case evidence review from a 3–4 week lab backlog to same-day turnaround for priority cases; (3) Cross-agency evidence workspace enabling DA offices to reduce case prep time by up to 60%. Reference contacts are available for qualified evaluators under NDA. Centific partners with Guidehouse for public safety implementations requiring federal compliance frameworks.",
      tips: "Mention the Guidehouse partnership when responding to agencies with federal funding or DOJ oversight requirements.",
    },
    {
      id: "em-support",
      category: "Support",
      question: "What is your platform uptime SLA, and describe your business continuity and disaster recovery approach for mission-critical deployments?",
      response:
        "Centific provides a 99.9% uptime SLA for mission-critical law enforcement deployments, with a 4-hour response SLA for P1 incidents. The platform supports active-active high-availability configurations with automatic failover, ensuring no single point of failure. Data replication is continuous with an RPO of 15 minutes and RTO of 30 minutes for cloud-hosted deployments. On-premises deployments include local redundancy configurations designed to maintain alerting capability during WAN outages. All incident response actions are logged and provided in post-incident reports. A named Customer Success Manager and 24/7 support line are included in enterprise agreements.",
      tips: "For agencies requiring sub-15-minute RTO, escalate to Centific engineering for a custom infrastructure design before committing to this in writing.",
    },
  ],
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const PLAYBOOKS: Record<string, Playbook> = {
  "smart-city": smartCity,
  transit,
  emergency,
};

export function getPlaybook(slug: string): Playbook | null {
  return PLAYBOOKS[slug] ?? null;
}

export const ALL_PLAYBOOKS = Object.values(PLAYBOOKS);
