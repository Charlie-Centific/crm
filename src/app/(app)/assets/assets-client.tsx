"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  BookOpen,
  Presentation,
  Download,
  ChevronDown,
  CheckSquare,
  Square,
  Printer,
  Sparkles,
  Eye,
} from "lucide-react";
import { OPERATIONAL_MODULES } from "@/lib/modules-data";
import { WORKFLOW_ROI } from "@/lib/workflow-static-data";

// ── Types ──────────────────────────────────────────────────────────────────

interface Account {
  id: string;
  name: string;
  vertical: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
}

interface Props {
  accounts: Account[];
}

type AssetType = "one-pager" | "two-pager" | "deck";

const VERTICAL_LABELS: Record<string, string> = {
  transit: "Transit", utilities: "Utilities", emergency: "Emergency",
  smart_city: "Smart City", other: "Other",
};

// Default module selections by vertical
const VERTICAL_MODULES: Record<string, string[]> = {
  transit:    ["MOD-01-VIDEO", "MOD-02-DISPATCH", "MOD-04-SAFETY"],
  emergency:  ["MOD-02-DISPATCH", "MOD-04-SAFETY", "MOD-05-COMPLIANCE"],
  smart_city: ["MOD-01-VIDEO", "MOD-03-TRAFFIC", "MOD-04-SAFETY"],
  utilities:  ["MOD-01-VIDEO", "MOD-05-COMPLIANCE", "MOD-06-INDUSTRIAL"],
  other:      ["MOD-01-VIDEO", "MOD-04-SAFETY"],
};

// ── HTML generators ────────────────────────────────────────────────────────

function generateOnePager(account: Account | null, selectedModules: string[], headline: string): string {
  const accountName = account?.name ?? "Your Agency";
  const location = account ? [account.city, account.state].filter(Boolean).join(", ") : "";
  const modules = OPERATIONAL_MODULES.filter((m) => selectedModules.includes(m.id));

  const moduleBlocks = modules.map((m) => {
    const roi = WORKFLOW_ROI.find((r) => m.workflows.some((w) => w.id === r.workflowId));
    return `
      <div style="flex:1;min-width:180px;padding:16px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;">
        <div style="font-size:11px;font-weight:700;color:#6366f1;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em;">Module ${m.number}</div>
        <div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:6px;">${m.title}</div>
        <div style="font-size:12px;color:#6b7280;line-height:1.5;">${m.summary.split(".")[0]}.</div>
        ${roi ? `<div style="margin-top:10px;font-size:11px;font-weight:600;color:#059669;">${roi.annualValue} / year</div>` : ""}
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>VAI™ One-Pager — ${accountName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#fff; color:#111827; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  @page { size:letter; margin:0.5in; }
  @media print { .no-print { display:none; } }
</style>
</head>
<body style="padding:48px;max-width:800px;margin:0 auto;">

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #6366f1;">
    <div>
      <div style="font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">VisionAI™ by Centific</div>
      <div style="font-size:24px;font-weight:800;color:#111827;line-height:1.2;">${headline || `AI-Powered Operations for ${accountName}`}</div>
      ${location ? `<div style="font-size:13px;color:#9ca3af;margin-top:6px;">${accountName} · ${location}</div>` : `<div style="font-size:13px;color:#9ca3af;margin-top:6px;">${accountName}</div>`}
    </div>
    <div style="background:#6366f1;color:#fff;font-size:11px;font-weight:700;padding:6px 14px;border-radius:6px;white-space:nowrap;">Confidential</div>
  </div>

  <!-- Value prop -->
  <div style="background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);color:#fff;border-radius:12px;padding:24px;margin-bottom:28px;">
    <div style="font-size:13px;font-weight:600;opacity:0.8;margin-bottom:8px;">The Challenge</div>
    <div style="font-size:16px;font-weight:600;line-height:1.5;">
      Modern operations generate more sensor data, video feeds, and alert traffic than any team can process manually.
      VisionAI™ deploys purpose-built AI agents that watch, triage, and act — so your team focuses on decisions, not monitoring.
    </div>
  </div>

  <!-- Modules -->
  ${modules.length > 0 ? `
  <div style="margin-bottom:28px;">
    <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Selected Modules</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      ${moduleBlocks}
    </div>
  </div>` : ""}

  <!-- Platform layer callout -->
  <div style="display:flex;align-items:center;gap:16px;padding:16px 20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:28px;">
    <div style="font-size:20px;">🔒</div>
    <div>
      <div style="font-size:13px;font-weight:700;color:#166534;margin-bottom:2px;">Administration & Intelligence — Included in Every Deployment</div>
      <div style="font-size:12px;color:#16a34a;">Audit logs · ROI reporting · 90-day value report · RBAC · Data governance · API integrations</div>
    </div>
  </div>

  <!-- ROI snapshot -->
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px;">
    <div style="text-align:center;padding:16px;background:#faf5ff;border-radius:10px;border:1px solid #e9d5ff;">
      <div style="font-size:22px;font-weight:800;color:#7c3aed;">4–20×</div>
      <div style="font-size:11px;color:#7c3aed;font-weight:600;margin-top:4px;">Typical ROI Multiple</div>
    </div>
    <div style="text-align:center;padding:16px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;">
      <div style="font-size:22px;font-weight:800;color:#059669;">$75K–$2M+</div>
      <div style="font-size:11px;color:#059669;font-weight:600;margin-top:4px;">Annual Value per Workflow</div>
    </div>
    <div style="text-align:center;padding:16px;background:#eff6ff;border-radius:10px;border:1px solid #bfdbfe;">
      <div style="font-size:22px;font-weight:800;color:#2563eb;">90 Days</div>
      <div style="font-size:11px;color:#2563eb;font-weight:600;margin-top:4px;">To First Value Report</div>
    </div>
  </div>

  <!-- Footer -->
  <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid #e5e7eb;">
    <div style="font-size:11px;color:#9ca3af;">Centific Global Services · visionai.centific.com</div>
    <div style="font-size:11px;color:#9ca3af;">Generated ${new Date().toLocaleDateString("en-US", { year:"numeric",month:"long",day:"numeric" })}</div>
  </div>

</body>
</html>`;
}

function generateTwoPager(account: Account | null, selectedModules: string[], headline: string): string {
  const accountName = account?.name ?? "Your Agency";
  const location = account ? [account.city, account.state].filter(Boolean).join(", ") : "";
  const modules = OPERATIONAL_MODULES.filter((m) => selectedModules.includes(m.id));
  const topROI = WORKFLOW_ROI
    .filter((r) => modules.some((m) => m.workflows.some((w) => w.id === r.workflowId)))
    .slice(0, 3);

  const roiRows = topROI.flatMap((r) =>
    r.metrics.slice(0, 2).map((m) => `
      <tr style="border-bottom:1px solid #f3f4f6;">
        <td style="padding:8px 12px;font-size:12px;color:#374151;">${m.label}</td>
        <td style="padding:8px 12px;font-size:12px;color:#9ca3af;">${m.before}</td>
        <td style="padding:8px 12px;font-size:12px;font-weight:600;color:#111827;">${m.after}</td>
        <td style="padding:8px 12px;font-size:12px;font-weight:600;color:#059669;">${m.improvement}</td>
      </tr>`)
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>VAI™ Two-Pager — ${accountName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#fff; color:#111827; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  @page { size:letter; margin:0.5in; }
</style>
</head>
<body style="padding:40px;max-width:800px;margin:0 auto;">

  <!-- Page 1 header -->
  <div style="background:#111827;color:#fff;border-radius:12px;padding:28px;margin-bottom:24px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div style="font-size:10px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">VisionAI™ · Centific</div>
        <div style="font-size:22px;font-weight:800;line-height:1.2;margin-bottom:6px;">${headline || `AI-Powered Operations for ${accountName}`}</div>
        <div style="font-size:13px;color:#9ca3af;">${accountName}${location ? ` · ${location}` : ""}</div>
      </div>
    </div>
  </div>

  <!-- Platform overview -->
  <div style="margin-bottom:24px;">
    <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Platform Architecture</div>
    <div style="padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:10px;">
      <div style="font-size:13px;font-weight:700;color:#166534;margin-bottom:4px;">MOD-00 · Administration & Intelligence <span style="font-size:11px;background:#dcfce7;padding:2px 8px;border-radius:4px;margin-left:6px;">Mandatory · Bundled</span></div>
      <div style="font-size:12px;color:#16a34a;">The institutional layer powering audit logs, ROI tracking, RBAC, 90-day value reports, and API integrations across all modules.</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      ${modules.map((m) => `
        <div style="padding:14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
          <div style="font-size:10px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">MOD-0${m.number} · ${m.title}</div>
          <div style="font-size:12px;color:#6b7280;line-height:1.4;">${m.summary.split(".")[0]}.</div>
          <div style="margin-top:8px;font-size:11px;color:#374151;">
            ${m.workflows.slice(0, 3).map((w) => `<span style="display:inline-block;background:#e0e7ff;color:#4338ca;padding:2px 8px;border-radius:4px;margin:2px;font-size:10px;">${w.name}</span>`).join("")}
            ${m.workflows.length > 3 ? `<span style="font-size:11px;color:#9ca3af;margin-left:4px;">+${m.workflows.length - 3} more</span>` : ""}
          </div>
        </div>`).join("")}
    </div>
  </div>

  <!-- ROI table (page 2) -->
  ${roiRows ? `
  <div style="margin-bottom:24px;page-break-before:always;">
    <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Quantified ROI — Before vs. After</div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead>
        <tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
          <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#6b7280;">Metric</th>
          <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#6b7280;">Before</th>
          <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#6b7280;">After VAI™</th>
          <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#6b7280;">Improvement</th>
        </tr>
      </thead>
      <tbody>${roiRows}</tbody>
    </table>
  </div>` : ""}

  <!-- CTA -->
  <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;border-radius:12px;padding:24px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <div style="font-size:15px;font-weight:700;margin-bottom:4px;">Ready to see it in action?</div>
      <div style="font-size:12px;opacity:0.8;">90-day pilot · Value report at day 30, 60, and 90 · No infrastructure required</div>
    </div>
    <div style="background:#fff;color:#4f46e5;font-weight:700;font-size:13px;padding:10px 20px;border-radius:8px;white-space:nowrap;">Request a Pilot</div>
  </div>

  <!-- Footer -->
  <div style="display:flex;justify-content:space-between;margin-top:20px;font-size:11px;color:#9ca3af;">
    <span>Centific Global Services · Confidential</span>
    <span>${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</span>
  </div>

</body>
</html>`;
}

function generateDeck(account: Account | null, selectedModules: string[], headline: string): string {
  const accountName = account?.name ?? "Your Agency";
  const location = account ? [account.city, account.state].filter(Boolean).join(", ") : "";
  const modules = OPERATIONAL_MODULES.filter((m) => selectedModules.includes(m.id));

  const slides = [
    // Slide 1: Title
    `<div class="slide" style="background:linear-gradient(135deg,#111827 0%,#1e1b4b 100%);color:#fff;display:flex;flex-direction:column;justify-content:center;padding:60px;">
      <div style="font-size:12px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;">VisionAI™ · Centific</div>
      <h1 style="font-size:38px;font-weight:800;line-height:1.15;margin-bottom:16px;">${headline || `AI-Powered Operations<br/>for ${accountName}`}</h1>
      <p style="font-size:16px;color:#9ca3af;">${accountName}${location ? ` · ${location}` : ""}</p>
      <div style="margin-top:40px;display:flex;gap:24px;">
        <div style="text-align:center;"><div style="font-size:28px;font-weight:800;color:#818cf8;">${modules.length}</div><div style="font-size:12px;color:#6b7280;">Modules Selected</div></div>
        <div style="text-align:center;"><div style="font-size:28px;font-weight:800;color:#34d399;">4–20×</div><div style="font-size:12px;color:#6b7280;">ROI Multiple</div></div>
        <div style="text-align:center;"><div style="font-size:28px;font-weight:800;color:#60a5fa;">90</div><div style="font-size:12px;color:#6b7280;">Days to Value</div></div>
      </div>
    </div>`,

    // Slide 2: Platform layer
    `<div class="slide" style="padding:48px;">
      <div style="font-size:12px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Foundation</div>
      <h2 style="font-size:28px;font-weight:800;color:#111827;margin-bottom:24px;">Every Deployment Starts Here</h2>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:16px;padding:24px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <span style="font-size:24px;">🔒</span>
          <div><div style="font-size:18px;font-weight:700;color:#166534;">MOD-00 · Administration & Intelligence</div>
          <div style="font-size:13px;color:#16a34a;font-weight:600;">Bundled · Mandatory · Never itemized</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:16px;">
          ${["Audit Log & Decision Lineage","ROI Tracking & 90-Day Report","Role-Based Access Control","AI Model Confidence Reporting","Data Governance & Retention","API & Integration Management"].map(f => `<div style="background:#dcfce7;padding:10px 12px;border-radius:8px;font-size:12px;font-weight:600;color:#166534;">${f}</div>`).join("")}
        </div>
      </div>
    </div>`,

    // Slides for each selected module
    ...modules.map((m) => {
      const roi = WORKFLOW_ROI.find((r) => m.workflows.some((w) => w.id === r.workflowId));
      return `<div class="slide" style="padding:48px;">
        <div style="font-size:12px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">${m.id}</div>
        <h2 style="font-size:26px;font-weight:800;color:#111827;margin-bottom:8px;">${m.title}</h2>
        <p style="font-size:15px;color:#6b7280;margin-bottom:24px;line-height:1.6;">${m.summary}</p>
        <div style="display:grid;grid-template-columns:repeat(${Math.min(m.workflows.length,3)},1fr);gap:12px;margin-bottom:20px;">
          ${m.workflows.map((w) => `
            <div style="padding:14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
              <div style="font-size:10px;font-mono;color:#9ca3af;margin-bottom:4px;">${w.id}</div>
              <div style="font-size:13px;font-weight:600;color:#111827;margin-bottom:4px;">${w.name}</div>
              <div style="font-size:11px;color:#6b7280;line-height:1.4;">${w.description.split(".")[0]}.</div>
            </div>`).join("")}
        </div>
        ${roi ? `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:14px;display:flex;gap:20px;">
          <div><div style="font-size:11px;color:#16a34a;font-weight:600;">Annual Value</div><div style="font-size:18px;font-weight:800;color:#166534;">${roi.annualValue}</div></div>
          <div><div style="font-size:11px;color:#16a34a;font-weight:600;">ROI Multiple</div><div style="font-size:18px;font-weight:800;color:#166534;">${roi.roiMultiple}</div></div>
          <div style="flex:1;"><div style="font-size:11px;color:#16a34a;font-weight:600;">Why It Works</div><div style="font-size:12px;color:#166534;">${roi.headline}</div></div>
        </div>` : ""}
      </div>`;
    }),

    // Last slide: Next steps
    `<div class="slide" style="background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;display:flex;flex-direction:column;justify-content:center;padding:60px;">
      <h2 style="font-size:32px;font-weight:800;margin-bottom:16px;">Next Steps</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:32px;">
        ${[["1","30-Minute Technical Deep Dive","Walk through the specific workflows relevant to ${accountName}"],["2","90-Day Pilot Proposal","Scoped deployment with milestone check-ins at day 30, 60, and 90"],["3","Value Report Commitment","Quantified ROI documentation ready for your budget cycle"]].map(([n,t,d]) => `
          <div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:20px;">
            <div style="font-size:28px;font-weight:800;opacity:0.5;margin-bottom:8px;">${n}</div>
            <div style="font-size:15px;font-weight:700;margin-bottom:6px;">${t}</div>
            <div style="font-size:12px;opacity:0.75;">${d.replace("${accountName}",accountName)}</div>
          </div>`).join("")}
      </div>
      <div style="font-size:14px;opacity:0.7;">Centific Global Services · VisionAI™ · Confidential</div>
    </div>`,
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>VAI™ Deck — ${accountName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#e5e7eb; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .slide { width:960px; min-height:540px; background:#fff; margin:24px auto; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.1); overflow:hidden; }
  @page { size:landscape; margin:0.3in; }
  @media print { body { background:#fff; } .slide { box-shadow:none; margin:0; border-radius:0; page-break-after:always; min-height:100vh; } }
</style>
</head>
<body>
  ${slides.join("\n")}
</body>
</html>`;
}

// ── Asset preview panel ────────────────────────────────────────────────────

function AssetPreview({ html, onPrint }: { html: string; onPrint: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl flex-shrink-0">
        <span className="text-xs font-semibold text-gray-600">Preview</span>
        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Printer size={12} /> Print / Save PDF
        </button>
      </div>
      <iframe
        srcDoc={html}
        className="flex-1 w-full rounded-b-xl bg-white"
        style={{ minHeight: 600 }}
        title="Asset Preview"
      />
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

const ASSET_TYPES: { key: AssetType; label: string; Icon: React.ElementType; desc: string }[] = [
  { key: "one-pager", label: "One-Pager",  Icon: FileText,      desc: "Single-page leave-behind for a first meeting" },
  { key: "two-pager", label: "Two-Pager",  Icon: BookOpen,      desc: "Detailed two-page with ROI before/after table" },
  { key: "deck",      label: "Exec Deck",  Icon: Presentation,  desc: "Multi-slide HTML presentation for an exec briefing" },
];

export function AssetsClient({ accounts }: Props) {
  const [assetType, setAssetType] = useState<AssetType>("one-pager");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedModules, setSelectedModules] = useState<string[]>(["MOD-01-VIDEO", "MOD-04-SAFETY"]);
  const [headline, setHeadline] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId]
  );

  // Auto-select modules when account vertical changes
  function handleAccountChange(id: string) {
    setSelectedAccountId(id);
    const acct = accounts.find((a) => a.id === id);
    if (acct?.vertical) {
      const defaults = VERTICAL_MODULES[acct.vertical] ?? VERTICAL_MODULES.other;
      setSelectedModules(defaults);
    }
  }

  function toggleModule(id: string) {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  const generatedHtml = useMemo(() => {
    if (assetType === "one-pager") return generateOnePager(selectedAccount, selectedModules, headline);
    if (assetType === "two-pager") return generateTwoPager(selectedAccount, selectedModules, headline);
    return generateDeck(selectedAccount, selectedModules, headline);
  }, [assetType, selectedAccount, selectedModules, headline]);

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(generatedHtml);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Assets</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Generate customized one-pagers, two-pagers, and exec decks — tailored to each account and module selection.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* ── Left: Controls ── */}
        <div className="col-span-2 space-y-5">

          {/* Asset type */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Asset Type</p>
            <div className="space-y-2">
              {ASSET_TYPES.map(({ key, label, Icon, desc }) => (
                <button
                  key={key}
                  onClick={() => setAssetType(key)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    assetType === key
                      ? "bg-brand-50 border-brand-300 text-brand-700"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon size={16} className={`flex-shrink-0 mt-0.5 ${assetType === key ? "text-brand-600" : "text-gray-400"}`} />
                  <div>
                    <p className="text-sm font-semibold leading-none mb-0.5">{label}</p>
                    <p className="text-xs text-gray-400 leading-snug">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Account selector */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Account</p>
            <div className="relative">
              <select
                value={selectedAccountId}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">— Generic (no account) —</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}{a.vertical ? ` (${VERTICAL_LABELS[a.vertical] ?? a.vertical})` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Headline */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Headline <span className="text-gray-300 font-normal">(optional)</span>
            </p>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder={selectedAccount ? `AI-Powered Operations for ${selectedAccount.name}` : "Enter custom headline…"}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Module selector */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Modules <span className="text-gray-400 font-normal">({selectedModules.length} selected)</span>
            </p>
            <div className="space-y-2">
              {OPERATIONAL_MODULES.map((m) => {
                const active = selectedModules.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleModule(m.id)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                      active
                        ? "bg-brand-50 border-brand-200"
                        : "bg-white border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {active
                      ? <CheckSquare size={15} className="text-brand-600 flex-shrink-0" />
                      : <Square size={15} className="text-gray-300 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${active ? "text-brand-700" : "text-gray-700"}`}>
                        {m.title}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{m.workflowCount} wf</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate button (mobile / collapsed preview) */}
          <button
            onClick={() => setShowPreview(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors lg:hidden"
          >
            <Eye size={15} /> Preview Asset
          </button>
        </div>

        {/* ── Right: Preview ── */}
        <div className="col-span-3">
          <AssetPreview html={generatedHtml} onPrint={handlePrint} />
        </div>
      </div>
    </div>
  );
}
