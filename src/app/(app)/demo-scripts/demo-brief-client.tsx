"use client";

import { useState, useMemo } from "react";
import { VERTICAL_TAGS, TagIcon, getTagDef } from "@/lib/tag-icons";
import type { Workflow } from "@/lib/workflows";
import { TEAM } from "@/lib/team";
import { Check, ChevronLeft, ChevronRight, FileText, FileJson, Copy, RotateCcw } from "lucide-react";

// ── Account data shape ────────────────────────────────────────────────────────
interface AccountOption {
  id: string;
  name: string;
  ownerName: string | null;
  vertical: string | null;
  city: string | null;
  state: string | null;
  contacts: {
    id: string;
    firstName: string | null;
    lastName: string;
    role: string | null;
    email: string | null;
    isPrimary: boolean;
  }[];
}

/** Best-effort match of a free-text contact role to the nearest ROLES option. */
function matchRole(contactRole: string | null, roles: string[]): string {
  if (!contactRole) return "";
  const r = contactRole.toLowerCase();
  return (
    roles.find((opt) => {
      const parts = opt.toLowerCase().split(/[\s/,]+/);
      return parts.some((p) => p.length > 3 && r.includes(p));
    }) ?? ""
  );
}

// ── Static data ───────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  { id: "manual-reporting",     label: "Manual / Paper Reporting"    },
  { id: "slow-response",        label: "Slow Incident Response"       },
  { id: "post-incident",        label: "Post-Incident Investigation"  },
  { id: "no-awareness",         label: "No Real-Time Awareness"       },
  { id: "false-alarms",         label: "False Alarm Fatigue"          },
  { id: "data-silos",           label: "Disconnected Data Silos"      },
  { id: "compliance",           label: "Compliance / Audit Trail"     },
  { id: "staffing",             label: "Staffing Constraints"         },
  { id: "coverage-gaps",        label: "Coverage Gaps"                },
  { id: "accountability",       label: "Accountability Documentation" },
  { id: "resource-allocation",  label: "Resource Allocation"          },
  { id: "leadership-reporting", label: "Leadership Reporting Burden"  },
];

const ROLES = [
  "Chief of Police / Sheriff",
  "Emergency Services Director",
  "Transit Director / GM",
  "City Manager / City Planner",
  "IT / Technology Director",
  "Operations Manager",
  "Procurement / Budget Officer",
  "Public Safety Director",
  "Facility / Security Manager",
  "Port / Airport Authority Director",
];

const VERTICAL_CONTEXT: Record<string, string> = {
  "law-enforcement": "Emphasize evidence chain of custody, officer dispatch efficiency, and cross-agency coordination.",
  "public-safety":   "Lead with life-safety outcomes, incident response speed, and interoperability.",
  "transit":         "Focus on passenger safety, on-time performance, and platform/fleet monitoring.",
  "smart-city":      "Connect all city data streams — utilities, traffic, public space — into one operating picture.",
  "transportation":  "Prioritize traffic flow, incident detection, and road safety outcomes.",
  "logistics":       "Highlight perimeter security, asset tracking, and facility compliance.",
  "retail":          "Lead with shrinkage prevention, customer safety, and operational compliance.",
  "healthcare":      "Focus on patient safety, access control, and compliance documentation.",
  "enterprise":      "Emphasize access control, workplace safety, and enterprise security posture.",
  "industrial":      "Highlight equipment safety, perimeter security, and worker compliance monitoring.",
  "environment":     "Focus on environmental violation detection and regulatory compliance.",
  "maritime":        "Emphasize port security, vessel tracking, and perimeter control.",
  "events":          "Lead with crowd density management, access control, and incident response speed.",
};

const PLATFORM_HOOKS: Record<string, string> = {
  slim: "Your organization already has cameras, sensors, and data streams. SLiM connects them in hours — not months — and turns raw feeds into real-time intelligence without replacing any existing infrastructure.",
  vai:  "For an operator, the value isn't the technology — it's the confidence that nothing slipped through undetected, that every decision is backed by evidence, and that when something goes wrong, you already know what happened.",
};

// ── Step definitions ──────────────────────────────────────────────────────────

const STEPS = [
  { label: "Platform"    },
  { label: "Vertical"    },
  { label: "Use Cases"   },
  { label: "Pain Points" },
  { label: "Contact"     },
];

// ── Brief data types + generation ─────────────────────────────────────────────

interface BriefData {
  date: string;
  platformId: "slim" | "vai" | null;
  platformLabel: string | null;
  platformTagline: string | null;
  verticalId: string | null;
  verticalLabel: string | null;
  accountName: string;
  contactName: string;
  role: string;
  useCases: { id: string; name: string; description: string | null }[];
  painPoints: { id: string; label: string }[];
  prompt: string;
  verticalContext: string | null;
  openingHook: string | null;
}

function buildBriefData(
  platform: "slim" | "vai" | null,
  vertical: string | null,
  workflowIds: string[],
  painPointIds: string[],
  accountName: string,
  contactName: string,
  role: string,
  allWorkflows: Workflow[],
): BriefData {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const verticalLabel  = vertical ? (getTagDef(vertical)?.label ?? vertical) : null;
  const platformLabel  = platform === "slim" ? "SLiM" : platform === "vai" ? "VAI Full Platform" : null;
  const platformTagline = platform === "slim" ? "Start Small, Scale Smart" : platform === "vai" ? "See everything. Prove it all." : null;

  const wfs = allWorkflows.filter((w) => workflowIds.includes(w.id));
  const pps = PAIN_POINTS.filter((p) => painPointIds.includes(p.id));

  // Build the prompt string
  const prompt: string[] = [];
  if (platform || vertical) {
    prompt.push(
      `Customize the ${platformLabel ?? "[platform]"} demo for ${verticalLabel ? `a ${verticalLabel} audience` : "this prospect"}.`
    );
    const audience = [contactName, role, accountName ? `at ${accountName}` : ""].filter(Boolean).join(", ");
    if (audience) prompt.push(`Presenting to: ${audience}.`);

    if (pps.length > 0)
      prompt.push(`Address these pain points: ${pps.map((p) => p.label).join(", ")}.`);
    else
      prompt.push(`Pain points are unknown — lead with the ${verticalLabel ?? "industry"} general value proposition.`);

    if (wfs.length > 0)
      prompt.push(`Prioritize these use cases: ${wfs.map((w) => w.name).join(", ")}.`);

    if (vertical && VERTICAL_CONTEXT[vertical])
      prompt.push(VERTICAL_CONTEXT[vertical]);

    if (platform)
      prompt.push(`Opening hook: "${PLATFORM_HOOKS[platform]}"`);
  }

  return {
    date: today,
    platformId: platform,
    platformLabel,
    platformTagline,
    verticalId: vertical,
    verticalLabel,
    accountName,
    contactName,
    role,
    useCases: wfs.map((w) => ({ id: w.id, name: w.name, description: w.description ?? null })),
    painPoints: pps,
    prompt: prompt.join(" "),
    verticalContext: vertical ? (VERTICAL_CONTEXT[vertical] ?? null) : null,
    openingHook: platform ? PLATFORM_HOOKS[platform] : null,
  };
}

function briefToPlainText(d: BriefData): string {
  const lines: string[] = [];
  lines.push("DEMO BRIEF");
  lines.push([d.accountName || "Prospect", d.verticalLabel, d.platformLabel, d.date].filter(Boolean).join(" · "));
  lines.push("");
  if (d.contactName || d.role || d.accountName) {
    lines.push("AUDIENCE");
    lines.push([d.contactName, d.role, d.accountName].filter(Boolean).join(" · "));
    lines.push("");
  }
  if (d.platformLabel) {
    lines.push(`PLATFORM: ${d.platformLabel} — ${d.platformTagline}`);
    lines.push("");
  }
  if (d.useCases.length > 0) {
    lines.push("USE CASES TO HIGHLIGHT");
    for (const uc of d.useCases) lines.push(`• ${uc.name}`);
    lines.push("");
  }
  if (d.painPoints.length > 0) {
    lines.push("PAIN POINTS TO ADDRESS");
    for (const pp of d.painPoints) lines.push(`• ${pp.label}`);
    lines.push("");
  }
  lines.push("─".repeat(44));
  lines.push("DEMO PLATFORM PROMPT");
  lines.push("─".repeat(44));
  lines.push(d.prompt || "(select platform and vertical to generate)");
  return lines.join("\n");
}

function briefToJson(d: BriefData): object {
  return {
    generatedAt: d.date,
    platform: d.platformId ? { id: d.platformId, label: d.platformLabel, tagline: d.platformTagline } : null,
    vertical: d.verticalId ? { id: d.verticalId, label: d.verticalLabel } : null,
    audience: { accountName: d.accountName || null, contactName: d.contactName || null, role: d.role || null },
    useCases: d.useCases,
    painPoints: d.painPoints,
    demoPrompt: d.prompt,
    openingHook: d.openingHook,
  };
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main component ────────────────────────────────────────────────────────────

export function DemoBriefClient({
  allWorkflows,
  accountsData = [],
}: {
  allWorkflows: Workflow[];
  accountsData?: AccountOption[];
}) {
  const [step, setStep]                     = useState(0);       // 0-4 wizard, 5 = result
  const [platform, setPlatform]             = useState<"slim" | "vai" | null>(null);
  const [vertical, setVertical]             = useState<string | null>(null);
  const [selectedWorkflows, setSelWorkflows] = useState<string[]>([]);
  const [painPoints, setPainPoints]         = useState<string[]>([]);
  const [accountName, setAccountName]       = useState("");
  const [contactName, setContactName]       = useState("");
  const [role, setRole]                     = useState("");
  const [copiedPrompt, setCopiedPrompt]     = useState(false);

  // CRM cascade state
  const [selectedOwner, setSelectedOwner]     = useState("");
  const [selectedAccountId, setAccountId]     = useState("");
  const [selectedContactId, setContactId]     = useState("");

  const ownerAccounts = useMemo(
    () => (selectedOwner ? accountsData.filter((a) => a.ownerName === selectedOwner) : []),
    [accountsData, selectedOwner],
  );

  const accountContacts = useMemo(
    () => accountsData.find((a) => a.id === selectedAccountId)?.contacts ?? [],
    [accountsData, selectedAccountId],
  );

  function pickAccount(accountId: string) {
    const account = accountsData.find((a) => a.id === accountId);
    setAccountId(accountId);
    setContactId("");
    setContactName("");
    setAccountName(account?.name ?? "");
    setRole("");
  }

  function pickContact(contactId: string) {
    const contact = accountContacts.find((c) => c.id === contactId);
    if (!contact) return;
    setContactId(contactId);
    setContactName(`${contact.firstName ?? ""} ${contact.lastName}`.trim());
    setRole(matchRole(contact.role, ROLES));
  }

  const filteredWorkflows = useMemo(
    () => vertical ? allWorkflows.filter((w) => w.verticalTags.includes(vertical)) : [],
    [allWorkflows, vertical],
  );

  const briefData = useMemo(
    () => buildBriefData(platform, vertical, selectedWorkflows, painPoints, accountName, contactName, role, allWorkflows),
    [platform, vertical, selectedWorkflows, painPoints, accountName, contactName, role, allWorkflows],
  );

  function pickVertical(id: string) {
    if (vertical === id) { setVertical(null); setSelWorkflows([]); }
    else { setVertical(id); setSelWorkflows([]); }
  }

  function toggleWf(id: string) {
    setSelWorkflows((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  }

  function togglePP(id: string) {
    setPainPoints((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  }

  function build() { setStep(5); }
  function reset()  {
    setStep(0); setPlatform(null); setVertical(null); setSelWorkflows([]);
    setPainPoints([]); setAccountName(""); setContactName(""); setRole("");
    setSelectedOwner(""); setAccountId(""); setContactId("");
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(briefData.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  }

  const slug = [
    briefData.accountName || "demo",
    briefData.platformId ?? "",
    briefData.verticalId ?? "",
  ].filter(Boolean).join("-").toLowerCase().replace(/\s+/g, "-");

  // ── Result view ─────────────────────────────────────────────────────────────
  if (step === 5) {
    return (
      <div className="max-w-3xl">
        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setStep(4)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
          >
            <ChevronLeft size={15} /> Edit brief
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RotateCcw size={12} /> Start over
            </button>
            <button
              onClick={() => download(briefToPlainText(briefData), `${slug}.txt`, "text/plain")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <FileText size={12} /> Download TXT
            </button>
            <button
              onClick={() => download(JSON.stringify(briefToJson(briefData), null, 2), `${slug}.json`, "application/json")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <FileJson size={12} /> Download JSON
            </button>
          </div>
        </div>

        {/* Artifact card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

          {/* Header */}
          <div className="bg-gray-900 px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Demo Brief · Centific VAI</p>
                <h2 className="text-xl font-bold text-white">
                  {briefData.accountName || "Prospect"}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {[briefData.verticalLabel, briefData.platformLabel].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{briefData.date}</p>
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Platform</p>
              <p className="text-sm font-semibold text-gray-900">{briefData.platformLabel ?? "—"}</p>
              {briefData.platformTagline && (
                <p className="text-xs text-gray-500 mt-0.5">{briefData.platformTagline}</p>
              )}
            </div>
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Vertical</p>
              <div className="flex items-center gap-1.5">
                {briefData.verticalId && <TagIcon tag={briefData.verticalId} size={13} className="text-gray-400" />}
                <p className="text-sm font-semibold text-gray-900">{briefData.verticalLabel ?? "—"}</p>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Audience</p>
              <p className="text-sm font-semibold text-gray-900">
                {briefData.contactName || briefData.role || "—"}
              </p>
              {briefData.contactName && briefData.role && (
                <p className="text-xs text-gray-500 mt-0.5">{briefData.role}</p>
              )}
              {briefData.accountName && (
                <p className="text-xs text-gray-500 mt-0.5">{briefData.accountName}</p>
              )}
            </div>
          </div>

          {/* Use cases + pain points */}
          {(briefData.useCases.length > 0 || briefData.painPoints.length > 0) && (
            <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
              {briefData.useCases.length > 0 && (
                <div className="px-5 py-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Use Cases</p>
                  <ul className="space-y-1.5">
                    {briefData.useCases.map((uc) => (
                      <li key={uc.id} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-gray-300 mt-1 flex-shrink-0">•</span>
                        <span className="leading-snug">{uc.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {briefData.painPoints.length > 0 && (
                <div className="px-5 py-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pain Points</p>
                  <div className="flex flex-wrap gap-1.5">
                    {briefData.painPoints.map((pp) => (
                      <span
                        key={pp.id}
                        className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-700 font-medium"
                      >
                        {pp.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prompt section */}
          <div className="px-5 py-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Demo Platform Prompt
              </p>
              <button
                onClick={copyPrompt}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  copiedPrompt
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-brand-600 text-white hover:bg-brand-700"
                }`}
              >
                {copiedPrompt ? <Check size={12} /> : <Copy size={12} />}
                {copiedPrompt ? "Copied!" : "Copy Prompt"}
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              {briefData.prompt ? (
                <p className="text-sm text-gray-800 leading-relaxed">{briefData.prompt}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No platform or vertical selected — return to edit and make selections.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── Wizard view ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl">

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 transition-all ${
                  i < step
                    ? "bg-brand-600 border-brand-600 text-white"
                    : i === step
                    ? "border-brand-600 text-brand-700 bg-white"
                    : "border-gray-200 text-gray-400 bg-white"
                }`}
              >
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <span
                className={`text-xs font-semibold whitespace-nowrap ${
                  i === step ? "text-brand-700" : i < step ? "text-brand-500" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${i < step ? "bg-brand-300" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[320px]">

        {/* Step 0: Platform */}
        {step === 0 && (
          <div className="space-y-3">
            <StepHeading
              title="Which platform are you demoing?"
              hint="This drives the opening hook and scenario framing."
            />
            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  { id: "slim" as const, name: "SLiM", sub: "Start Small, Scale Smart", desc: "Entry-level — one box, up to 10 streams, running in hours. Best for discovery and early-stage conversations." },
                  { id: "vai"  as const, name: "VAI Full Platform", sub: "See everything. Prove it all.", desc: "Full enterprise layer. Use for prospects in evaluation or senior leadership presentations." },
                ] as const
              ).map(({ id, name, sub, desc }) => (
                <button
                  key={id}
                  onClick={() => setPlatform((p) => (p === id ? null : id))}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    platform === id
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 bg-white hover:border-brand-300"
                  }`}
                >
                  <div className={`text-sm font-bold mb-0.5 ${platform === id ? "text-brand-700" : "text-gray-900"}`}>
                    {name}
                  </div>
                  <div className={`text-xs font-medium mb-2.5 ${platform === id ? "text-brand-500" : "text-gray-500"}`}>
                    {sub}
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Vertical */}
        {step === 1 && (
          <div>
            <StepHeading
              title="What industry is this prospect in?"
              hint="Filters the use case list and tailors the prompt."
            />
            <div className="grid grid-cols-7 gap-2">
              {VERTICAL_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => pickVertical(tag.id)}
                  title={tag.label}
                  className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-all text-center ${
                    vertical === tag.id
                      ? "bg-brand-600 border-brand-600 text-white"
                      : "bg-white border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50"
                  }`}
                >
                  <TagIcon tag={tag.id} size={18} className={vertical === tag.id ? "text-white" : "text-gray-500"} />
                  <span className="text-[10px] font-semibold leading-tight">{tag.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Use Cases */}
        {step === 2 && (
          <div>
            <div className="flex items-start justify-between mb-1">
              <StepHeading
                title="Which use cases do you want to highlight?"
                hint={
                  vertical
                    ? `Showing ${filteredWorkflows.length} workflows tagged for ${getTagDef(vertical)?.label ?? vertical}.`
                    : "No vertical selected — go back to Step 2 to filter by industry."
                }
              />
              {selectedWorkflows.length > 0 && (
                <button onClick={() => setSelWorkflows([])} className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0 mt-1">
                  Clear ({selectedWorkflows.length})
                </button>
              )}
            </div>
            {!vertical ? (
              <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center">
                <p className="text-sm text-gray-400">Go back and select a vertical to browse use cases.</p>
              </div>
            ) : filteredWorkflows.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No workflows tagged for this vertical.</p>
            ) : (
              <div className="grid grid-cols-1 gap-1.5 max-h-80 overflow-y-auto pr-1">
                {filteredWorkflows.map((wf) => {
                  const on = selectedWorkflows.includes(wf.id);
                  const primaryTag = wf.verticalTags[0] ?? wf.threatTags[0];
                  return (
                    <button
                      key={wf.id}
                      onClick={() => toggleWf(wf.id)}
                      className={`flex items-start gap-3 text-left px-3 py-2.5 rounded-lg border transition-all ${
                        on ? "border-brand-300 bg-brand-50" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${on ? "bg-brand-600 border-brand-600" : "border-gray-300"}`}>
                        {on && (
                          <svg viewBox="0 0 12 10" className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth="2.5">
                            <polyline points="1,5 4,8 11,1" />
                          </svg>
                        )}
                      </div>
                      {primaryTag && <TagIcon tag={primaryTag} size={14} className={`flex-shrink-0 mt-0.5 ${on ? "text-brand-500" : "text-gray-400"}`} />}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium leading-snug ${on ? "text-brand-700" : "text-gray-800"}`}>{wf.name}</div>
                        {wf.description && <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{wf.description}</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Pain Points */}
        {step === 3 && (
          <div>
            <StepHeading
              title="What pain points is this prospect dealing with?"
              hint="Select as many as apply — or skip if unknown."
            />
            <div className="flex flex-wrap gap-2">
              {PAIN_POINTS.map((pp) => {
                const on = painPoints.includes(pp.id);
                return (
                  <button
                    key={pp.id}
                    onClick={() => togglePP(pp.id)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                      on
                        ? "bg-brand-600 border-brand-600 text-white"
                        : "border-gray-200 text-gray-600 bg-white hover:border-brand-300 hover:text-brand-700"
                    }`}
                  >
                    {pp.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Contact */}
        {step === 4 && (
          <div>
            <StepHeading
              title="Who are you presenting to?"
              hint="Optional — pick from your accounts or fill in manually. Adds personalization to the brief."
            />

            {/* CRM cascade */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pull from account</p>

              <div className="grid grid-cols-3 gap-3">
                {/* Rep */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Rep</label>
                  <select
                    value={selectedOwner}
                    onChange={(e) => {
                      setSelectedOwner(e.target.value);
                      setAccountId(""); setContactId("");
                      setAccountName(""); setContactName(""); setRole("");
                    }}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-400"
                  >
                    <option value="">Select rep…</option>
                    {TEAM.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name.split(" ")[0]} {m.name.split(" ")[1]?.[0]}.
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Account</label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => pickAccount(e.target.value)}
                    disabled={!selectedOwner}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-400 disabled:opacity-40"
                  >
                    <option value="">
                      {selectedOwner
                        ? ownerAccounts.length === 0 ? "No accounts" : "Select account…"
                        : "Select rep first"}
                    </option>
                    {ownerAccounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Contact</label>
                  <select
                    value={selectedContactId}
                    onChange={(e) => pickContact(e.target.value)}
                    disabled={!selectedAccountId || accountContacts.length === 0}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-400 disabled:opacity-40"
                  >
                    <option value="">
                      {!selectedAccountId ? "Select account first"
                        : accountContacts.length === 0 ? "No contacts" : "Select contact…"}
                    </option>
                    {accountContacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {`${c.firstName ?? ""} ${c.lastName}`.trim()}
                        {c.isPrimary ? " ★" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Editable fields — pre-filled by cascade, always editable */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Account Name</label>
                <input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. City of Louisville"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Contact Name</label>
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Jennifer Park"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="">Select a role…</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={15} /> Previous
        </button>

        <span className="text-xs text-gray-400 font-medium">
          Step {step + 1} of {STEPS.length}
        </span>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button
            onClick={build}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            Build Brief →
          </button>
        )}
      </div>

    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StepHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
    </div>
  );
}
