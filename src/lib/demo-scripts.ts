export interface DemoStep {
  title: string;
  duration?: string;
  talking: string;
  notes?: string;
}

export interface DemoScript {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  steps: DemoStep[];
  closingMessage: string;
}

export const DEMO_SCRIPTS: Record<string, DemoScript> = {
  slim: {
    slug: "slim",
    name: "VAI SLiM",
    tagline: "Start Small, Scale Smart",
    description:
      "The fastest path to AI-powered city intelligence. One box, 10 data streams, up and running in hours. Use this script for any prospect who hasn't seen SLiM live — leads, discovery, and early demo stages.",
    steps: [
      {
        title: "Frame the gap",
        duration: "2 min",
        talking:
          "Your city generates petabytes of data every day — cameras, sensors, 911 calls, maintenance logs. The problem isn't the data. The problem is that no human team can process it fast enough to act on it. Incidents surface through phone calls. Maintenance failures build through signals nobody connected. Reports get written hours after the fact. SLiM closes that gap — real-time intelligence, from what you already have, in hours not months.",
        notes: "Pause after 'hours not months.' Let that land. Then move to the hardware.",
      },
      {
        title: "Show the hardware",
        duration: "1 min",
        talking:
          "This is the NVIDIA DGX Spark. It's about the size of a shoebox. You drop it in — no infrastructure overhaul, no rip and replace. It connects up to 10 data streams: cameras, sensors, audio feeds, ticketing systems, whatever you have. Uses NVIDIA DeepStream and Triton Inference Server under the hood — the same technology running real-time AI at enterprises worldwide.",
        notes: "Physical presence of the hardware resonates. If presenting remotely, show a photo. If in-person, have it on the table.",
      },
      {
        title: "Connect the streams",
        duration: "2 min",
        talking:
          "Here's the platform live. We've connected [N] data streams for this demo — [customize: camera feeds from downtown, vehicle sensors from the transit fleet, etc.]. You can see each feed in the left panel. SLiM is already running — analyzing, detecting, comparing against historical baselines. Nothing slipped through while we were setting this up.",
        notes: "Customize to the prospect's vertical. Use their city name and real data types wherever possible.",
      },
      {
        title: "Trigger a live scenario",
        duration: "4 min",
        talking:
          "Let me show you what SLiM looks like when something happens. [Trigger a demonstration event — e.g., platform edge risk, crowd density spike, unauthorized zone access.] See that alert? It fired in real time. Now watch what happens when we open it — you get the footage, the sensor reading that triggered it, the confidence score, and the exact timestamp. The right person gets this notification immediately, with everything they need to act. No screen-watching required.",
        notes:
          "Pick one scenario relevant to their vertical. Transit: platform edge risk or fare evasion. Emergency: threat detection. Smart City: crowd density. Lead with what's most painful for them.",
      },
      {
        title: "Investigation mode",
        duration: "3 min",
        talking:
          "Now let's flip to after-the-fact investigation. Say something happened yesterday and your leadership asks: what exactly occurred, and when? In SLiM, I type a plain-language question. [Type the question.] Watch it search — every camera, every sensor log, every data source at once. No manual footage scrubbing. No cross-referencing spreadsheets. Full picture, assembled automatically, timestamped.",
        notes: "Use a question relevant to their vertical. Transit: 'Show me all platform incidents on Line 3 yesterday.' Emergency: 'Find all events at this intersection in the last 48 hours.'",
      },
      {
        title: "The automated report",
        duration: "2 min",
        talking:
          "One more thing. Every shift, someone on your team is writing a report. SLiM generates that for you — incident summaries, shift briefings, department reports — automatically from the actual data, in the right format, delivered before the meeting they're needed for. Your team reviews and approves. The work is already done.",
        notes: "This resonates especially with operations leads and supervisors who are drowning in admin.",
      },
      {
        title: "The path forward",
        duration: "3 min",
        talking:
          "Here's how this works. Phase 1 is a 3-month pilot. We deploy one DGX Spark, connect up to 10 of your data streams, choose one focus area — and you're seeing results in the first few weeks. Phase 2: you've seen the outcomes, you expand — more streams, more departments, same platform. Your clients already have cameras. They already have sensors. The gap is intelligence. SLiM closes that gap.",
        notes: "Close with a question: 'What would be the single most valuable use case for you in Phase 1?' This defines the pilot scope.",
      },
    ],
    closingMessage:
      "\"Your clients already have cameras. They already have sensors. They already collect data. The gap is intelligence — knowing what it means, in real time, and being able to prove it after. SLiM closes that gap.\"",
  },

  vai: {
    slug: "vai",
    name: "VAI™",
    tagline: "See everything. Investigate anything. Prove it all.",
    description:
      "The full enterprise platform for city and campus intelligence. Use this script for prospects in demo or workshop stage who have already seen SLiM and are evaluating the full platform, or for senior leadership presentations.",
    steps: [
      {
        title: "The confidence statement",
        duration: "2 min",
        talking:
          "For an operator, the value isn't the technology — it's the confidence. Confidence that nothing slipped through undetected. That every decision is backed by evidence. That when something goes wrong, you already know what happened — and can prove it. That's what VAI is for.",
        notes: "Deliver this slowly. It's the thesis. Every section of the demo connects back to it.",
      },
      {
        title: "Real-time monitoring — always watching",
        duration: "3 min",
        talking:
          "VAI monitors every connected feed around the clock. When something significant happens — anywhere across your infrastructure, transit network, or public safety system — the right person is notified immediately with the footage, sensor data, and context attached. No screen-watching required. Let me show you what that looks like live. [Show real-time feed with active alert.]",
        notes: "Emphasize 'the right person' — routing intelligence matters as much as detection.",
      },
      {
        title: "Investigation — ask anything, search everything",
        duration: "5 min",
        talking:
          "This is where VAI is genuinely different. After an event, investigators ask plain-language questions. VAI searches every camera, sensor log, and data source at once. Watch: [Type question relevant to their vertical — 'What happened at [location] between 10pm and midnight last Tuesday?']. No manual footage scrubbing. No cross-referencing spreadsheets. The full picture, assembled automatically, timestamped to the second.",
        notes: "Use a real scenario from their vertical or one of the Guidehouse scenarios: hit-and-run, crowd buildup, road closure cascade, utility spike.",
      },
      {
        title: "Accountability — a record that speaks for itself",
        duration: "2 min",
        talking:
          "When leadership, the public, or a legal team asks what happened, operators need more than memory. VAI automatically documents what was detected, what action was taken, and by whom — a structured record that proves your team did the right thing. That audit trail is there from day one, without anyone having to maintain it.",
        notes: "Hit this hard with emergency services and DA prospects. Also lands well with transit agencies under public scrutiny.",
      },
      {
        title: "Automated reporting — stop writing, start reading",
        duration: "2 min",
        talking:
          "Incident summaries, shift briefings, weekly department reports — generated automatically from the actual data, in the right format, delivered before the meeting they're needed for. Your team reviews and approves. The work is already done. The shift is from producing information to acting on it.",
        notes: "Ask them: 'How many hours a week does your team spend on reports right now?' Let their answer do the selling.",
      },
      {
        title: "Art of the possible",
        duration: "3 min",
        talking:
          "Let me show you a few scenarios that our clients have asked us to walk through. [Pick 2 from the list most relevant to their vertical.] 1. A utility sensor spikes at 3am — VAI confirms it visually, distinguishes real from false, notifies on-call with everything they need before they leave the house. 2. A hit-and-run at a busy intersection — investigators type a description, VAI searches every camera in the network for the last 6 hours, returns a movement trail in minutes. Which of these looks like your world?",
        notes: "Let them choose the next scenario. It reveals priorities. Use: Guidehouse brief scenario list.",
      },
      {
        title: "The path forward",
        duration: "3 min",
        talking:
          "Here's how we engage. First, a live demo tailored to your environment — that's what you're seeing today. Next, a priorities workshop: a half-day with your operational leaders to align on the highest-value use cases and define what a pilot looks like for your specific data sources. Then a 90-day pilot: connect VAI to one department's live feeds, run your actual operations on it, see real outcomes. Guidehouse leads the engagement. We power the platform.",
        notes: "Close by offering to schedule the priorities workshop, not another demo. Advance the motion.",
      },
    ],
    closingMessage:
      "\"Confidence that nothing slipped through undetected. That every decision is backed by evidence. That when something goes wrong, you already know what happened — and can prove it.\"",
  },
};

export function getDemoScript(slug: string): DemoScript | null {
  return DEMO_SCRIPTS[slug] ?? null;
}

export const ALL_DEMO_SCRIPTS = Object.values(DEMO_SCRIPTS);
