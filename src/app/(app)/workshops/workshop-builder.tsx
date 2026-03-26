"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { Workflow } from "@/lib/workflows";
import { TEAM } from "@/lib/team";

// ── Account data shape (passed from server) ───────────────────────────────────
export interface AccountOption {
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

// ── Types ─────────────────────────────────────────────────────────────────────
type SectionId = "details" | "attendees" | "usecases" | "deployment" | "timeline" | "blockers" | "signoff";

interface Details {
  clientName: string;
  clientOrg: string;
  partnerOrg: string;
  workshopDate: string;
  location: string;
  preparedBy: string;
  objective: string;
}

interface Attendee {
  id: string;
  org: string;
  name: string;
  title: string;
  role: string;
  email: string;
}

interface UseCase {
  id: string;
  title: string;
  description: string;
  agent: string;
  owner: string;
  status: string;
  metric: string;
  workflowId?: string;   // Links to canonical workflow dictionary
}

interface Blocker {
  id: string;
  description: string;
  raisedBy: string;
  owner: string;
  dueDate: string;
}

interface WState {
  details: Details;
  attendees: Attendee[];
  useCases: UseCase[];
  priorityOrder: string[];
  deployment: string;
  deploymentNotes: string;
  pilotStart: string;
  notes: string;
  blockers: Blocker[];
  signoff: { client: string; clientTitle: string; centific: string; centificTitle: string; partner: string; partnerTitle: string; };
}

// ── Sections config ───────────────────────────────────────────────────────────
const SECTIONS: { id: SectionId; label: string; required?: boolean }[] = [
  { id: "details",    label: "Workshop Info",     required: true },
  { id: "attendees",  label: "Attendees" },
  { id: "usecases",   label: "Use Cases",          required: true },
  { id: "deployment", label: "Deployment",         required: true },
  { id: "timeline",   label: "Timeline" },
  { id: "blockers",   label: "Blockers & Notes" },
  { id: "signoff",    label: "Sign-off" },
];

const REQUIRED: SectionId[] = ["details", "usecases", "deployment"];

function uid() { return Math.random().toString(36).slice(2, 9); }

const INITIAL: WState = {
  details: { clientName: "", clientOrg: "", partnerOrg: "", workshopDate: "", location: "", preparedBy: "", objective: "" },
  attendees: [
    { id: uid(), org: "Client", name: "", title: "", role: "Executive Sponsor", email: "" },
    { id: uid(), org: "Centific", name: "", title: "", role: "Account Lead", email: "" },
  ],
  useCases: [],
  priorityOrder: [],
  deployment: "",
  deploymentNotes: "",
  pilotStart: "",
  notes: "",
  blockers: [{ id: uid(), description: "", raisedBy: "", owner: "", dueDate: "" }],
  signoff: { client: "", clientTitle: "", centific: "", centificTitle: "", partner: "", partnerTitle: "" },
};

// ── HTML generation ───────────────────────────────────────────────────────────
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function priorityLabel(idx: number, total: number): string {
  if (total === 1) return "Sole Priority";
  if (idx === 0) return "Priority 1 — Highest";
  if (idx === total - 1) return `Priority ${idx + 1} — Lowest`;
  return `Priority ${idx + 1}`;
}

function generateWorkshopHtml(s: WState, iconDataUrl: string): string {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Compute ordered UCs
  const ordered: UseCase[] = [
    ...s.priorityOrder.map(id => s.useCases.find(u => u.id === id)).filter(Boolean) as UseCase[],
    ...s.useCases.filter(u => !s.priorityOrder.includes(u.id)),
  ];

  const attendeesHtml = s.attendees.filter(a => a.name).map(a => `
    <tr>
      <td class="td-org"><span class="org-badge org-${a.org.toLowerCase().replace(/\s+/g, '-')}">${esc(a.org)}</span></td>
      <td class="td-main">${esc(a.name)}</td>
      <td>${esc(a.title)}</td>
      <td>${esc(a.role)}</td>
      <td>${esc(a.email)}</td>
    </tr>`).join("");

  const ucCards = ordered.map((uc, i) => {
    const pLabel = priorityLabel(i, ordered.length);
    const isTop = i === 0;
    return `
    <div class="uc-card ${isTop ? "uc-top" : ""}" contenteditable="true">
      <div class="uc-priority-badge">${esc(pLabel)}</div>
      <div class="uc-title">${esc(uc.title)}</div>
      ${uc.description ? `<div class="uc-desc">${esc(uc.description)}</div>` : ""}
      <div class="uc-meta-row">
        ${uc.workflowId ? `<div class="uc-meta-chip"><span class="chip-lbl">Workflow</span><span class="chip-val">${esc(uc.workflowId)}</span></div>` : ""}
        ${uc.agent ? `<div class="uc-meta-chip"><span class="chip-lbl">Agent</span><span class="chip-val">${esc(uc.agent)}</span></div>` : ""}
        ${uc.owner ? `<div class="uc-meta-chip"><span class="chip-lbl">Owner</span><span class="chip-val">${esc(uc.owner)}</span></div>` : ""}
        ${uc.status ? `<div class="uc-meta-chip"><span class="chip-lbl">Status</span><span class="chip-val">${esc(uc.status)}</span></div>` : ""}
      </div>
      ${uc.metric ? `<div class="uc-metric"><span class="metric-lbl">Success Metric: </span>${esc(uc.metric)}</div>` : ""}
    </div>`;
  }).join("");

  const deployHtml = s.deployment ? `
    <div class="deploy-block" contenteditable="true">
      <div class="deploy-label">Selected Deployment</div>
      <div class="deploy-name">${esc(s.deployment)}</div>
      ${s.deploymentNotes ? `<div class="deploy-notes">${esc(s.deploymentNotes)}</div>` : ""}
    </div>` : "";

  const blockersHtml = s.blockers.filter(b => b.description).map(b => `
    <tr>
      <td contenteditable="true">${esc(b.description)}</td>
      <td contenteditable="true">${esc(b.raisedBy)}</td>
      <td contenteditable="true">${esc(b.owner)}</td>
      <td contenteditable="true">${esc(b.dueDate)}</td>
      <td contenteditable="true"></td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>VAI Workshop — ${esc(s.details.clientName || "Workshop Prep")}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --brand:#7C3AED;--brand-dark:#5B21B6;--brand-light:#EDE9FE;
    --accent:#EC4899;--gray-900:#111827;--gray-700:#374151;
    --gray-500:#6B7280;--gray-200:#E5E7EB;--gray-100:#F3F4F6;--white:#fff;
  }
  body{font-family:"Inter",system-ui,sans-serif;font-size:13px;line-height:1.7;color:var(--gray-900);background:var(--white);}

  /* Editor bar */
  .editor-bar{position:sticky;top:0;z-index:9999;background:rgba(255,255,255,0.96);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--gray-200);box-shadow:0 1px 10px rgba(0,0,0,.07);}
  .editor-bar-inner{max-width:860px;margin:0 auto;padding:10px 60px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
  .editor-bar-left{display:flex;align-items:center;gap:12px;}
  .bar-logo{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#7C3AED,#5B21B6);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .bar-brand{font-size:12px;font-weight:800;color:var(--brand);letter-spacing:.06em;text-transform:uppercase;}
  .bar-sep{color:var(--gray-200);margin:0 2px;}
  .bar-label{font-size:12px;color:var(--gray-500);font-weight:500;}
  .bar-hint{display:inline-flex;align-items:center;gap:5px;background:#EDE9FE;color:#6D28D9;font-size:10px;font-weight:600;padding:3px 10px;border-radius:100px;letter-spacing:.02em;}
  .bar-hint::before{content:"✎";font-size:11px;}
  .publish-btn{display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,#7C3AED,#5B21B6);color:white;font-size:12px;font-weight:700;padding:8px 18px;border-radius:10px;border:none;cursor:pointer;letter-spacing:.02em;box-shadow:0 2px 8px rgba(124,58,237,.35);}
  .publish-btn svg{width:14px;height:14px;}

  /* Cover */
  .cover{min-height:100vh;background:linear-gradient(135deg,#4C1D95 0%,#7C3AED 45%,#5B21B6 100%);display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;padding:64px 80px;page-break-after:always;position:relative;overflow:hidden;}
  .cover::before{content:"";position:absolute;top:-120px;right:-120px;width:500px;height:500px;border-radius:50%;background:rgba(236,72,153,.12);}
  .cover-logo{display:flex;align-items:center;gap:14px;}
  .cover-logo-mark{width:52px;height:52px;background:rgba(255,255,255,.15);border-radius:14px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.2);padding:10px;}
  .cover-logo-name{font-size:20px;font-weight:800;letter-spacing:.06em;color:white;text-transform:uppercase;}
  .cover-badge{display:inline-block;background:rgba(236,72,153,.25);border:1px solid rgba(236,72,153,.5);color:#FBB6CE;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:24px;}
  .cover-title{font-size:42px;font-weight:800;color:white;line-height:1.1;margin-bottom:16px;max-width:680px;}
  .cover-subtitle{font-size:15px;color:rgba(255,255,255,.65);max-width:520px;line-height:1.6;margin-bottom:48px;}
  .cover-meta{display:flex;gap:32px;font-size:12px;color:rgba(255,255,255,.6);}
  .cover-meta strong{color:rgba(255,255,255,.9);display:block;margin-bottom:2px;}
  .cover-footer{font-size:11px;color:rgba(255,255,255,.4);border-top:1px solid rgba(255,255,255,.1);padding-top:20px;width:100%;}

  /* Sections */
  .doc-section{max-width:860px;margin:0 auto;padding:56px 80px;border-bottom:1px solid var(--gray-200);}
  .sec-label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--brand);margin-bottom:6px;}
  .sec-title{font-size:24px;font-weight:800;color:var(--gray-900);margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid var(--brand-light);}

  /* Attendees table */
  .att-table{width:100%;border-collapse:collapse;}
  .att-table thead tr{background:var(--gray-100);}
  .att-table thead th{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--gray-500);padding:10px 12px;text-align:left;border-bottom:2px solid var(--gray-200);}
  .att-table tbody tr{border-bottom:1px solid var(--gray-200);}
  .att-table tbody td{padding:10px 12px;font-size:13px;}
  .td-main{font-weight:600;color:var(--gray-900);}
  .org-badge{display:inline-block;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:.04em;}
  .org-client{background:#DBEAFE;color:#1D4ED8;}
  .org-centific{background:var(--brand-light);color:var(--brand-dark);}
  .org-partner{background:#D1FAE5;color:#065F46;}
  .org-other{background:var(--gray-100);color:var(--gray-500);}

  /* Use case cards */
  .uc-card{border:1px solid var(--gray-200);border-radius:12px;padding:20px 24px;margin-bottom:16px;position:relative;page-break-inside:avoid;}
  .uc-top{border-color:var(--brand);background:linear-gradient(to right,#FAFAFF,white);}
  .uc-top::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,var(--brand),var(--accent));border-radius:12px 0 0 12px;}
  .uc-priority-badge{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--brand);background:var(--brand-light);padding:3px 10px;border-radius:100px;margin-bottom:10px;}
  .uc-top .uc-priority-badge{background:var(--brand);color:white;}
  .uc-title{font-size:17px;font-weight:800;color:var(--gray-900);margin-bottom:6px;}
  .uc-desc{font-size:13px;color:var(--gray-500);margin-bottom:14px;line-height:1.6;}
  .uc-meta-row{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px;}
  .uc-meta-chip{background:var(--gray-100);border-radius:6px;padding:4px 10px;font-size:12px;}
  .chip-lbl{font-weight:700;color:var(--gray-500);margin-right:5px;}
  .chip-val{color:var(--gray-900);}
  .uc-metric{font-size:12px;color:var(--gray-500);padding-top:10px;border-top:1px solid var(--gray-200);}
  .metric-lbl{font-weight:700;color:var(--gray-700);}

  /* Deployment */
  .deploy-block{background:var(--gray-100);border-radius:12px;padding:24px 28px;}
  .deploy-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--brand);margin-bottom:6px;}
  .deploy-name{font-size:20px;font-weight:800;color:var(--gray-900);margin-bottom:10px;}
  .deploy-notes{font-size:13px;color:var(--gray-500);line-height:1.7;}

  /* Blockers */
  .blk-table{width:100%;border-collapse:collapse;}
  .blk-table thead th{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--gray-500);padding:10px 12px;text-align:left;border-bottom:2px solid var(--gray-200);background:var(--gray-100);}
  .blk-table tbody tr{border-bottom:1px solid var(--gray-200);}
  .blk-table tbody td{padding:10px 12px;font-size:13px;color:var(--gray-700);}

  /* Notes */
  .notes-block{background:var(--gray-100);border-radius:12px;padding:24px;font-size:13px;color:var(--gray-700);line-height:1.8;white-space:pre-wrap;}

  /* Sign-off */
  .signoff-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;}
  .signoff-box{}
  .signoff-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--gray-500);margin-bottom:24px;display:block;}
  .signoff-line{border:none;border-bottom:2px solid var(--gray-900);width:100%;margin-bottom:8px;}
  .signoff-name{font-size:13px;font-weight:700;color:var(--gray-900);}
  .signoff-title{font-size:11px;color:var(--gray-500);}

  /* Doc footer */
  .doc-footer{max-width:860px;margin:0 auto;padding:28px 80px;display:flex;align-items:center;justify-content:space-between;border-top:2px solid var(--brand-light);}
  .doc-footer-logo{font-weight:800;color:var(--brand);font-size:13px;}
  .doc-footer-meta{font-size:11px;color:var(--gray-500);text-align:right;}

  /* Editable */
  [contenteditable]:hover{outline:2px dashed #C4B5FD;outline-offset:4px;border-radius:4px;cursor:text;}
  [contenteditable]:focus{outline:2px solid var(--brand);outline-offset:4px;border-radius:4px;}

  @media print{
    .editor-bar{display:none!important;}
    [contenteditable]{outline:none!important;}
    .cover{page-break-after:always;}
    .uc-card,.signoff-grid{page-break-inside:avoid;}
  }
</style>
</head>
<body>

<!-- Editor toolbar -->
<div class="editor-bar">
  <div class="editor-bar-inner">
    <div class="editor-bar-left">
      <div class="bar-logo"><img src="${iconDataUrl}" alt="VAI" style="width:16px;height:16px;display:block;filter:brightness(0) invert(1);"/></div>
      <div>
        <span class="bar-brand">Centific</span>
        <span class="bar-sep">·</span>
        <span class="bar-label">Workshop Editor</span>
      </div>
      <span class="bar-hint">Click any text to edit</span>
    </div>
    <button class="publish-btn" onclick="window.print()">
      <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd"/></svg>
      Publish · Save as PDF
    </button>
  </div>
</div>

<!-- Cover -->
<div class="cover">
  <div class="cover-logo">
    <div class="cover-logo-mark"><img src="${iconDataUrl}" alt="VAI" style="width:32px;height:32px;display:block;filter:brightness(0) invert(1);"/></div>
    <div class="cover-logo-name">Centific</div>
  </div>
  <div style="position:relative;z-index:1;">
    <div class="cover-badge" contenteditable="true">Workshop Preparation Document · Confidential</div>
    <h1 class="cover-title" contenteditable="true">${esc(s.details.clientName || "Client")} × VAI Pilot<br>Workshop</h1>
    <p class="cover-subtitle" contenteditable="true">${esc(s.details.objective || "Use case prioritization, deployment planning, and 90-day pilot alignment.")}</p>
    <div class="cover-meta">
      <div><strong>Date</strong><span contenteditable="true">${esc(s.details.workshopDate)}</span></div>
      <div><strong>Location</strong><span contenteditable="true">${esc(s.details.location || "TBD")}</span></div>
      <div><strong>Client</strong><span contenteditable="true">${esc(s.details.clientOrg || s.details.clientName)}</span></div>
      <div><strong>Prepared by</strong><span contenteditable="true">${esc(s.details.preparedBy || "Centific")}</span></div>
    </div>
  </div>
  <div class="cover-footer">
    This document is confidential and proprietary to Centific Global Services. Not for distribution.
  </div>
</div>

<!-- Attendees -->
${s.attendees.filter(a => a.name).length > 0 ? `
<div class="doc-section">
  <p class="sec-label">Section 1</p>
  <h2 class="sec-title" contenteditable="true">Workshop Attendees</h2>
  <table class="att-table">
    <thead><tr><th>Org</th><th>Name</th><th>Title / Department</th><th>Role</th><th>Email</th></tr></thead>
    <tbody>${attendeesHtml}</tbody>
  </table>
</div>` : ""}

<!-- Use Cases -->
<div class="doc-section">
  <p class="sec-label">Section ${s.attendees.filter(a => a.name).length > 0 ? 2 : 1}</p>
  <h2 class="sec-title" contenteditable="true">Use Cases — Prioritized</h2>
  ${ucCards || '<p style="color:#9CA3AF;font-size:13px;">No use cases added.</p>'}
</div>

<!-- Deployment -->
${s.deployment ? `
<div class="doc-section">
  <p class="sec-label">Section ${s.attendees.filter(a => a.name).length > 0 ? 3 : 2}</p>
  <h2 class="sec-title" contenteditable="true">Deployment Model</h2>
  ${deployHtml}
</div>` : ""}

<!-- Pilot timeline note -->
${s.pilotStart ? `
<div class="doc-section">
  <p class="sec-label">Pilot Timeline</p>
  <h2 class="sec-title" contenteditable="true">Pilot Schedule</h2>
  <div class="deploy-block" contenteditable="true">
    <div class="deploy-label">Pilot Start Date</div>
    <div class="deploy-name">${esc(s.pilotStart)}</div>
    <div class="deploy-notes">The 90-day pilot clock starts on this date. Day 91 is a hard stop — no extensions without a signed LOI or full license agreement.</div>
  </div>
</div>` : ""}

<!-- Blockers -->
${s.blockers.filter(b => b.description).length > 0 ? `
<div class="doc-section">
  <p class="sec-label">Open Items</p>
  <h2 class="sec-title" contenteditable="true">Blockers & Open Questions</h2>
  <table class="blk-table">
    <thead><tr><th>Question / Blocker</th><th>Raised By</th><th>Owner</th><th>Due Date</th><th>Resolution</th></tr></thead>
    <tbody>${blockersHtml}</tbody>
  </table>
</div>` : ""}

<!-- Notes -->
${s.notes ? `
<div class="doc-section">
  <p class="sec-label">Workshop Notes</p>
  <h2 class="sec-title" contenteditable="true">Notes</h2>
  <div class="notes-block" contenteditable="true">${esc(s.notes)}</div>
</div>` : ""}

<!-- Sign-off -->
<div class="doc-section">
  <p class="sec-label">Alignment</p>
  <h2 class="sec-title" contenteditable="true">Workshop Sign-off</h2>
  <p style="font-size:13px;color:var(--gray-500);margin-bottom:32px;" contenteditable="true">
    Signatures confirm: use cases finalized and prioritized, deployment model selected, pilot start date agreed.
    The 90-day clock begins on the confirmed date.
  </p>
  <div class="signoff-grid">
    <div class="signoff-box">
      <span class="signoff-label">${esc(s.details.clientOrg || "Client")} — Executive Sponsor</span>
      <hr class="signoff-line"/>
      <div class="signoff-name" contenteditable="true">${esc(s.signoff.client) || "Print name"}</div>
      <div class="signoff-title" contenteditable="true">${esc(s.signoff.clientTitle) || "Title"}</div>
    </div>
    <div class="signoff-box">
      <span class="signoff-label">Centific — Account / CS Lead</span>
      <hr class="signoff-line"/>
      <div class="signoff-name" contenteditable="true">${esc(s.signoff.centific) || "Print name"}</div>
      <div class="signoff-title" contenteditable="true">${esc(s.signoff.centificTitle) || "Title"}</div>
    </div>
    <div class="signoff-box">
      <span class="signoff-label">${esc(s.details.partnerOrg || "Partner")} — Representative</span>
      <hr class="signoff-line"/>
      <div class="signoff-name" contenteditable="true">${esc(s.signoff.partner) || "Print name"}</div>
      <div class="signoff-title" contenteditable="true">${esc(s.signoff.partnerTitle) || "Title"}</div>
    </div>
  </div>
</div>

<!-- Footer -->
<div class="doc-footer">
  <div class="doc-footer-logo">CENTIFIC</div>
  <div class="doc-footer-meta">
    ${esc(s.details.clientName || "Workshop")} · VAI Pilot Prep · Confidential<br>
    Prepared ${date} · VAI™ is a trademark of Centific Global Services
  </div>
</div>

</body>
</html>`;
}

// ── Field component ───────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, as: Tag = "input" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; as?: "input" | "textarea";
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</label>
      {Tag === "textarea" ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          rows={3}
          className="text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none placeholder-gray-300"
        />
      ) : (
        <input
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder-gray-300"
        />
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
// ── Demo / pre-fill state ─────────────────────────────────────────────────────
const DEMO_STATE: WState = {
  details: {
    clientName:   "City of Louisville",
    clientOrg:    "Louisville Metro Government",
    partnerOrg:   "Guidehouse",
    workshopDate: "2026-04-22",
    location:     "Louisville City Hall — Board Room A",
    preparedBy:   "Carlos Gonzalez, Centific",
    objective:
      "Align on the top 2–3 AI/CV use cases for a 90-day SLiM pilot. Prioritize by operational impact, data availability, and stakeholder urgency. Leave with an agreed pilot scope and a signed MOU.",
  },
  attendees: [
    { id: "d-a1", org: "Client",     name: "Greg Fischer",     title: "Chief of Public Safety",         role: "Executive Sponsor", email: "gfischer@louisvilleky.gov"  },
    { id: "d-a2", org: "Client",     name: "Jennifer Park",    title: "Director of Innovation & Tech",  role: "Technical Lead",    email: "jpark@louisvilleky.gov"     },
    { id: "d-a3", org: "Client",     name: "Marcus Webb",      title: "Operations Manager, LMPD",       role: "End User Rep",      email: "mwebb@lmpd.org"             },
    { id: "d-a4", org: "Centific",   name: "Carlos Gonzalez",  title: "Account Executive",              role: "Account Lead",      email: "cgonzalez@centific.com"     },
    { id: "d-a5", org: "Centific",   name: "Amy Lin",          title: "Solutions Engineer",             role: "Technical Lead",    email: "alin@centific.com"          },
    { id: "d-a6", org: "Guidehouse", name: "Sarah Whitfield",  title: "Senior Consultant",              role: "Engagement Lead",   email: "swhitfield@guidehouse.com"  },
  ],
  useCases: [
    {
      id: "d-uc1",
      title: "Real-Time Crime & Threat Detection",
      description:
        "AI monitoring of 220+ city cameras to detect weapons, fights, and suspicious behavior. Automated alerts routed to the nearest officer with live footage and GPS coordinates.",
      agent: "VAI SLiM",
      owner: "Marcus Webb",
      status: "Priority",
      metric: "Reduce average incident response time from 9 min to under 4 min within 90 days",
    },
    {
      id: "d-uc2",
      title: "Traffic Incident & Congestion Detection",
      description:
        "Automated detection of accidents, stalled vehicles, and congestion on key corridors. Triggers dispatch notification and signal coordination in real time.",
      agent: "VAI SLiM",
      owner: "Jennifer Park",
      status: "Priority",
      metric: "Cut congestion clearance time by 25% and reduce secondary incidents by 15%",
    },
    {
      id: "d-uc3",
      title: "Automated Shift Briefings & Incident Reports",
      description:
        "Auto-generated shift summaries from overnight camera activity delivered to police command by 6am. Eliminates manual write-up for all non-emergency events.",
      agent: "VAI SLiM",
      owner: "Marcus Webb",
      status: "Candidate",
      metric: "Save 2+ hours per shift in report writing across all 3 district command centers",
    },
    {
      id: "d-uc4",
      title: "Crowd Density & Event Safety Monitoring",
      description:
        "Real-time crowd density tracking for Waterfront Park, KFC Yum Center, and Churchill Downs. Alerts ops when thresholds are exceeded; integrates with the event command channel.",
      agent: "VAI SLiM",
      owner: "Greg Fischer",
      status: "Candidate",
      metric: "Zero crowd-related safety incidents at top-10 annual city events during pilot",
    },
  ],
  priorityOrder: ["d-uc1", "d-uc2", "d-uc3", "d-uc4"],
  deployment: "SLiM — DGX Spark (On-Premises)",
  deploymentNotes:
    "Deploy one DGX Spark unit at the Louisville Metro Emergency Communications Center (911 hub). Initial feed set: 10 downtown camera feeds, I-64/I-65 interchange traffic sensors, and LMPD CAD event stream. Phase 2 expands to the full 220-camera network.",
  pilotStart: "2026-05-12",
  notes:
    "Mayor's office confirmed Q2 budget approval. IT team validated all existing cameras are RTSP-compatible — no hardware replacement needed. Guidehouse is leading MOU and procurement. Target go-live: May 12.",
  blockers: [
    {
      id: "d-b1",
      description: "IT Security review required for camera feed network access — cross-department approval pending",
      raisedBy: "Jennifer Park",
      owner: "Jennifer Park",
      dueDate: "2026-04-29",
    },
    {
      id: "d-b2",
      description: "DGX Spark hardware procurement — 3-week lead time after PO is issued",
      raisedBy: "Sarah Whitfield",
      owner: "Sarah Whitfield",
      dueDate: "2026-04-22",
    },
  ],
  signoff: {
    client:        "Greg Fischer",
    clientTitle:   "Chief of Public Safety, Louisville Metro",
    centific:      "Carlos Gonzalez",
    centificTitle: "Account Executive, Centific",
    partner:       "Sarah Whitfield",
    partnerTitle:  "Senior Consultant, Guidehouse",
  },
};

// ── Main component ────────────────────────────────────────────────────────────
export function WorkshopBuilder({
  allWorkflows = [],
  accountsData = [],
}: {
  allWorkflows?: Workflow[];
  accountsData?: AccountOption[];
}) {
  const [activeSection, setActiveSection] = useState<SectionId>("details");
  const [state, setState] = useState<WState>(INITIAL);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");

  // Accounts filtered by selected rep
  const ownerAccounts = selectedOwner
    ? accountsData.filter((a) => a.ownerName === selectedOwner)
    : [];

  function prefillFromAccount(accountId: string) {
    const account = accountsData.find((a) => a.id === accountId);
    if (!account) return;

    const location = [account.city, account.state].filter(Boolean).join(", ");

    // Map contacts → attendee rows (keep all; primary contact gets Decision Maker role)
    const clientAttendees: Attendee[] = account.contacts.map((c) => ({
      id: uid(),
      org: "Client",
      name: `${c.firstName ?? ""} ${c.lastName}`.trim(),
      title: c.role ?? "",
      role: c.isPrimary ? "Decision Maker" : "",
      email: c.email ?? "",
    }));

    // Always add one blank client slot if no contacts exist
    if (clientAttendees.length === 0) {
      clientAttendees.push({ id: uid(), org: "Client", name: "", title: "", role: "Executive Sponsor", email: "" });
    }

    // Centific lead = the selected rep
    const centificAttendee: Attendee = {
      id: uid(),
      org: "Centific",
      name: account.ownerName ?? "",
      title: "Account Executive",
      role: "Account Lead",
      email: "",
    };

    setState({
      ...INITIAL,
      details: {
        clientName:   account.name,
        clientOrg:    account.name,
        partnerOrg:   "",           // leave for user
        workshopDate: "",           // required — leave blank
        location,
        preparedBy:   account.ownerName ? `${account.ownerName}, Centific` : "",
        objective:    "",           // required — leave blank
      },
      attendees: [...clientAttendees, centificAttendee],
    });

    setSelectedAccountId(accountId);
    setActiveSection("details");
  }

  // ── Validation
  const sectionValid: Record<SectionId, boolean> = {
    details: !!(state.details.clientName && state.details.workshopDate),
    attendees: true,
    usecases: state.useCases.length > 0,
    deployment: !!state.deployment,
    timeline: true,
    blockers: true,
    signoff: true,
  };
  const missingRequired = REQUIRED.filter(id => !sectionValid[id]);
  const canBuild = missingRequired.length === 0;

  // ── Helpers
  function upDetails(field: keyof Details, v: string) {
    setState(p => ({ ...p, details: { ...p.details, [field]: v } }));
  }
  function addAttendee() {
    const a: Attendee = { id: uid(), org: "Client", name: "", title: "", role: "", email: "" };
    setState(p => ({ ...p, attendees: [...p.attendees, a] }));
  }
  function upAttendee(id: string, field: keyof Attendee, v: string) {
    setState(p => ({ ...p, attendees: p.attendees.map(a => a.id === id ? { ...a, [field]: v } : a) }));
  }
  function removeAttendee(id: string) {
    setState(p => ({ ...p, attendees: p.attendees.filter(a => a.id !== id) }));
  }
  function addUseCase() {
    const uc: UseCase = { id: uid(), title: "", description: "", agent: "", owner: "", status: "Candidate", metric: "" };
    setState(p => ({ ...p, useCases: [...p.useCases, uc], priorityOrder: [...p.priorityOrder, uc.id] }));
  }
  function upUseCase(id: string, field: keyof UseCase, v: string) {
    setState(p => ({ ...p, useCases: p.useCases.map(u => u.id === id ? { ...u, [field]: v } : u) }));
  }
  function removeUseCase(id: string) {
    setState(p => ({
      ...p,
      useCases: p.useCases.filter(u => u.id !== id),
      priorityOrder: p.priorityOrder.filter(x => x !== id),
    }));
  }
  function addBlocker() {
    setState(p => ({ ...p, blockers: [...p.blockers, { id: uid(), description: "", raisedBy: "", owner: "", dueDate: "" }] }));
  }
  function upBlocker(id: string, field: keyof Blocker, v: string) {
    setState(p => ({ ...p, blockers: p.blockers.map(b => b.id === id ? { ...b, [field]: v } : b) }));
  }
  function drop(targetId: string) {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    setState(p => {
      const order = [...p.priorityOrder];
      const from = order.indexOf(dragId!);
      const to = order.indexOf(targetId);
      if (from < 0 || to < 0) return p;
      order.splice(from, 1);
      order.splice(to, 0, dragId!);
      return { ...p, priorityOrder: order };
    });
    setDragId(null); setDragOverId(null);
  }

  // Ordered use cases (for the drag panel)
  const orderedUCs: UseCase[] = [
    ...state.priorityOrder.map(id => state.useCases.find(u => u.id === id)).filter(Boolean) as UseCase[],
    ...state.useCases.filter(u => !state.priorityOrder.includes(u.id)),
  ];

  // ── BUILD
  async function buildDocument() {
    if (!canBuild) return;
    setBuilding(true);
    try {
      const resp = await fetch("/brand/vai-icon-512.webp");
      const buf = await resp.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const iconDataUrl = `data:image/webp;base64,${btoa(binary)}`;
      const html = generateWorkshopHtml(state, iconDataUrl);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } finally {
      setBuilding(false);
    }
  }

  const requiredDone = REQUIRED.length - missingRequired.length;

  const sectionIds = SECTIONS.map((s) => s.id);
  const currentIndex = sectionIds.indexOf(activeSection);
  const prevSectionId = sectionIds[currentIndex - 1] ?? null;
  const nextSectionId = sectionIds[currentIndex + 1] ?? null;
  const currentSectionLabel = SECTIONS.find((s) => s.id === activeSection)?.label ?? "";

  return (
    <div className="flex gap-5 min-h-[640px]">

      {/* ── Left nav ─────────────────────────────────────────────── */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-3">

        {/* Quick-fill panel */}
        <div className="rounded-xl border border-gray-200 bg-white p-3 space-y-2.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pre-fill</p>

          {/* Demo button */}
          <button
            onClick={() => { setState(DEMO_STATE); setSelectedOwner(""); setSelectedAccountId(""); setActiveSection("details"); }}
            className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg border border-dashed border-brand-300 text-brand-600 hover:bg-brand-50 text-xs font-semibold transition-all"
          >
            <Sparkles size={12} className="flex-shrink-0" />
            Load Demo
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">or from account</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Rep dropdown */}
          <select
            value={selectedOwner}
            onChange={(e) => { setSelectedOwner(e.target.value); setSelectedAccountId(""); }}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-400"
          >
            <option value="">Select rep…</option>
            {TEAM.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name.split(" ")[0]} {m.name.split(" ")[1]?.[0]}.
              </option>
            ))}
          </select>

          {/* Account dropdown — only after rep is selected */}
          {selectedOwner && (
            ownerAccounts.length === 0 ? (
              <p className="text-[10px] text-gray-400 italic px-1">No accounts for this rep.</p>
            ) : (
              <select
                value={selectedAccountId}
                onChange={(e) => { if (e.target.value) prefillFromAccount(e.target.value); }}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-400"
              >
                <option value="">Select account…</option>
                {ownerAccounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )
          )}

          {/* Selected indicator */}
          {selectedAccountId && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-brand-600 font-medium truncate flex-1">
                ✓ {accountsData.find(a => a.id === selectedAccountId)?.name}
              </span>
              <button
                onClick={() => { setSelectedAccountId(""); setState(INITIAL); setActiveSection("details"); }}
                className="text-[10px] text-gray-400 hover:text-gray-600 flex-shrink-0 ml-1"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Sections</p>
          {SECTIONS.map(sec => {
            const done = sectionValid[sec.id];
            const isActive = activeSection === sec.id;
            const isReq = sec.required ?? false;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2.5 ${
                  isActive ? "bg-brand-600 text-white shadow-sm"
                  : done && isReq ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  isActive ? "bg-white/20 text-white"
                  : done && isReq ? "bg-emerald-500 text-white"
                  : isReq ? "bg-red-100 text-red-500 border border-red-300"
                  : "bg-gray-200 text-gray-400"
                }`}>
                  {done && isReq ? "✓" : isReq ? "!" : ""}
                </span>
                <span className="leading-snug">
                  {sec.label}
                  {isReq && !done && <span className="block text-[9px] font-bold text-red-500 mt-0.5">Required</span>}
                </span>
              </button>
            );
          })}
        </div>

        {/* BUILD panel */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="h-1.5 bg-gray-100">
            <div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500"
              style={{ width: `${(requiredDone / REQUIRED.length) * 100}%` }} />
          </div>
          <div className="p-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Required</p>
            <p className="text-sm font-bold text-gray-900 mb-3">{requiredDone} / {REQUIRED.length} complete</p>
            {missingRequired.length > 0 && (
              <ul className="space-y-1 mb-4">
                {missingRequired.map(id => {
                  const sec = SECTIONS.find(s => s.id === id);
                  return (
                    <li key={id}>
                      <button onClick={() => setActiveSection(id)}
                        className="flex items-center gap-1.5 text-[11px] text-red-600 hover:text-red-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {sec?.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <button
              onClick={buildDocument}
              disabled={!canBuild || building}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                canBuild
                  ? "bg-gradient-to-r from-brand-600 to-violet-700 text-white hover:from-brand-700 hover:to-violet-800 shadow-md hover:shadow-lg"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {building ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Building…
                </>
              ) : canBuild ? (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd"/>
                  </svg>
                  Build Workshop Doc
                </>
              ) : `Need ${missingRequired.length} more`}
            </button>
            {canBuild && (
              <p className="text-[10px] text-gray-400 text-center mt-2">Opens in new tab · edit · publish PDF</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Right content ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">
        {activeSection === "details" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-1">Workshop Information</h2>
              <p className="text-xs text-gray-400">Core details that appear on the cover page.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Client Name" value={state.details.clientName} onChange={v => upDetails("clientName", v)} placeholder="e.g. Louisville Metro" />
              <Field label="Client Organization" value={state.details.clientOrg} onChange={v => upDetails("clientOrg", v)} placeholder="e.g. Louisville Metro Government" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Workshop Date" value={state.details.workshopDate} onChange={v => upDetails("workshopDate", v)} placeholder="e.g. April 22, 2026" />
              <Field label="Location / Format" value={state.details.location} onChange={v => upDetails("location", v)} placeholder="e.g. City Hall Room 3B / Zoom" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prepared By" value={state.details.preparedBy} onChange={v => upDetails("preparedBy", v)} placeholder="Name, Centific" />
              <Field label="Partner Organization" value={state.details.partnerOrg} onChange={v => upDetails("partnerOrg", v)} placeholder="e.g. SHI International" />
            </div>
            <Field label="Workshop Objective" value={state.details.objective} onChange={v => upDetails("objective", v)} placeholder="What this workshop will accomplish…" as="textarea" />
            <Field label="Target Pilot Start Date" value={state.pilotStart} onChange={v => setState(p => ({ ...p, pilotStart: v }))} placeholder="e.g. May 1, 2026" />
          </div>
        )}

        {activeSection === "attendees" && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Workshop Attendees</h2>
              <p className="text-xs text-gray-400 mt-0.5">Who will be in the room. Leave blank rows — they&apos;ll be excluded from the document.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="px-3 py-2.5 text-left w-24">Org</th>
                    <th className="px-3 py-2.5 text-left">Name</th>
                    <th className="px-3 py-2.5 text-left">Title / Dept.</th>
                    <th className="px-3 py-2.5 text-left">Role in Workshop</th>
                    <th className="px-3 py-2.5 text-left">Email</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {state.attendees.map(a => (
                    <tr key={a.id} className="border-t border-gray-100">
                      <td className="px-2 py-1.5">
                        <select value={a.org} onChange={e => upAttendee(a.id, "org", e.target.value)}
                          className="text-xs font-semibold rounded-lg px-2 py-1 border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-400 w-full">
                          <option>Client</option><option>Centific</option><option>Partner</option><option>Other</option>
                        </select>
                      </td>
                      {(["name","title","role","email"] as const).map(f => (
                        <td key={f} className="px-2 py-1.5">
                          <input value={a[f]} onChange={e => upAttendee(a.id, f, e.target.value)}
                            placeholder={f === "email" ? "@org.com" : f === "name" ? "Full name" : f === "title" ? "Title, Dept." : "e.g. Executive Sponsor"}
                            className="w-full text-xs text-gray-900 bg-transparent border-b border-gray-200 focus:border-brand-400 focus:outline-none py-1 placeholder-gray-300" />
                        </td>
                      ))}
                      <td className="px-2 py-1.5">
                        <button onClick={() => removeAttendee(a.id)} className="text-gray-300 hover:text-red-400 transition-colors text-xs">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-dashed border-gray-200">
              <button onClick={addAttendee} className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">+</span>
                Add Attendee
              </button>
            </div>
          </div>
        )}

        {activeSection === "usecases" && (
          <div className="space-y-4">
            {/* Add use cases table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Use Cases</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Add each use case, then drag to set priority below.</p>
                </div>
                {state.useCases.length > 0 && (
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-full">
                    {state.useCases.length} added
                  </span>
                )}
              </div>
              {state.useCases.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="px-3 py-2.5 text-left">Use Case Title</th>
                        <th className="px-3 py-2.5 text-left w-40">VAI Workflow</th>
                        <th className="px-3 py-2.5 text-left w-36">Agent Type</th>
                        <th className="px-3 py-2.5 text-left w-32">Owner / Dept.</th>
                        <th className="px-3 py-2.5 text-left w-28">Status</th>
                        <th className="px-3 py-2.5 text-left">Success Metric</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.useCases.map(uc => (
                        <tr key={uc.id} className="border-t border-gray-100">
                          <td className="px-2 py-2">
                            <input value={uc.title} onChange={e => upUseCase(uc.id, "title", e.target.value)} placeholder="Use case title"
                              className="w-full text-xs font-semibold text-gray-900 bg-transparent border-b border-gray-200 focus:border-brand-400 focus:outline-none py-1 placeholder-gray-300 mb-1" />
                            <input value={uc.description} onChange={e => upUseCase(uc.id, "description", e.target.value)} placeholder="Brief description…"
                              className="w-full text-xs text-gray-500 bg-transparent border-b border-gray-100 focus:border-brand-400 focus:outline-none py-0.5 placeholder-gray-200" />
                          </td>
                          <td className="px-2 py-2">
                            <select
                              value={uc.workflowId ?? ""}
                              onChange={e => upUseCase(uc.id, "workflowId", e.target.value)}
                              className="text-xs rounded-lg px-2 py-1 border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-400 w-full"
                            >
                              <option value="">None</option>
                              {allWorkflows.map((wf) => (
                                <option key={wf.id} value={wf.id}>{wf.id} – {wf.name}</option>
                              ))}
                            </select>
                            {uc.workflowId && (
                              <a
                                href={`/workflows/${uc.workflowId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-brand-500 hover:underline mt-0.5 block"
                              >
                                View →
                              </a>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            <select value={uc.agent} onChange={e => upUseCase(uc.id, "agent", e.target.value)}
                              className="text-xs rounded-lg px-2 py-1 border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-400 w-full">
                              <option value="">Select…</option>
                              <option>Infrastructure Agent</option><option>Transit Agent</option>
                              <option>Utility Agent</option><option>Incident Agent</option><option>Multi-Agent</option>
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <input value={uc.owner} onChange={e => upUseCase(uc.id, "owner", e.target.value)} placeholder="Name, Dept."
                              className="w-full text-xs text-gray-900 bg-transparent border-b border-gray-200 focus:border-brand-400 focus:outline-none py-1 placeholder-gray-300" />
                          </td>
                          <td className="px-2 py-2">
                            <select value={uc.status} onChange={e => upUseCase(uc.id, "status", e.target.value)}
                              className="text-xs rounded-lg px-2 py-1 border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-400 w-full">
                              <option>Candidate</option><option>In Pilot</option><option>Backlog</option><option>Descoped</option>
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <input value={uc.metric} onChange={e => upUseCase(uc.id, "metric", e.target.value)} placeholder="How will we measure success?"
                              className="w-full text-xs text-gray-900 bg-transparent border-b border-gray-200 focus:border-brand-400 focus:outline-none py-1 placeholder-gray-300" />
                          </td>
                          <td className="px-2 py-2">
                            <button onClick={() => removeUseCase(uc.id)} className="text-gray-300 hover:text-red-400 transition-colors text-xs">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-5 py-3 border-t border-dashed border-gray-200">
                <button onClick={addUseCase} className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">+</span>
                  Add Use Case
                </button>
              </div>
            </div>

            {/* Drag-drop prioritizer */}
            {orderedUCs.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-brand-50 to-white">
                  <h2 className="text-sm font-bold text-gray-900">Drag to Prioritize</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Top = highest priority. Drag the handle to reorder.</p>
                </div>
                <div className="p-4 space-y-2">
                  {orderedUCs.map((uc, idx) => (
                    <div
                      key={uc.id}
                      draggable
                      onDragStart={() => setDragId(uc.id)}
                      onDragOver={e => { e.preventDefault(); setDragOverId(uc.id); }}
                      onDragLeave={() => setDragOverId(null)}
                      onDrop={() => drop(uc.id)}
                      onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all select-none cursor-grab active:cursor-grabbing ${
                        dragId === uc.id ? "opacity-40 border-brand-300 bg-brand-50"
                        : dragOverId === uc.id ? "border-brand-400 bg-brand-50 shadow-sm ring-1 ring-brand-200"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      {/* Drag handle */}
                      <div className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors" style={{ lineHeight: 1 }}>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                        </svg>
                      </div>
                      {/* Priority number */}
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                        idx === 0 ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {idx + 1}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${idx === 0 ? "text-brand-800" : "text-gray-900"}`}>
                          {uc.title || <span className="text-gray-300 italic">Untitled use case</span>}
                        </p>
                        {uc.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{uc.description}</p>
                        )}
                      </div>
                      {/* Agent badge */}
                      {uc.agent && (
                        <span className="flex-shrink-0 text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                          {uc.agent}
                        </span>
                      )}
                      {/* Priority label */}
                      <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        idx === 0 ? "bg-brand-100 text-brand-700"
                        : idx === orderedUCs.length - 1 && orderedUCs.length > 1 ? "bg-gray-100 text-gray-400"
                        : "bg-amber-50 text-amber-600"
                      }`}>
                        {idx === 0 ? "Highest" : idx === orderedUCs.length - 1 && orderedUCs.length > 1 ? "Lowest" : `#${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === "deployment" && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-1">Deployment Model</h2>
              <p className="text-xs text-gray-400 mb-5">Select the pilot deployment architecture. This decision drives procurement, IT steps, and time to Day 1.</p>
              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  {
                    id: "SLiM — On-Premise Edge Unit",
                    tag: "Hardware",
                    tagColor: "bg-amber-100 text-amber-700",
                    name: "SLiM",
                    sub: "On-Premise Edge Device",
                    desc: "Physical edge unit installed at the camera/sensor site. Inference runs locally. No cloud dependency. Preferred where data sovereignty or low bandwidth is a constraint.",
                    specs: [["Lead Time","2–4 weeks from order"],["Data Residency","100% on-premise"],["IT","Physical install + network"],["Best For","Air-gapped / low-bandwidth"]],
                  },
                  {
                    id: "eSLiM — Cloud Deployment",
                    tag: "Cloud",
                    tagColor: "bg-blue-100 text-blue-700",
                    name: "eSLiM",
                    sub: "Hyperscaler Cloud Infrastructure",
                    desc: "Fully cloud-hosted inference. Feeds ingested via secure API. No hardware shipped. Fastest path to Day 1. Preferred where connectivity is stable and speed matters.",
                    specs: [["Lead Time","48–72 hrs from access"],["Data Residency","Cloud (US region)"],["IT","API creds + firewall"],["Best For","Fastest start / multi-site"]],
                  },
                ].map(opt => {
                  const sel = state.deployment === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setState(p => ({ ...p, deployment: sel ? "" : opt.id }))}
                      className={`text-left rounded-2xl border-2 p-5 transition-all ${
                        sel ? "border-brand-400 bg-brand-50 ring-1 ring-brand-200" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            sel ? "bg-brand-600 border-brand-600" : "border-gray-300"
                          }`}>
                            {sel && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className="text-base font-black text-gray-900">{opt.name}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opt.tagColor}`}>{opt.tag}</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">{opt.sub}</p>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">{opt.desc}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {opt.specs.map(([l, v]) => (
                          <div key={l} className="bg-white rounded-lg p-2 border border-gray-200">
                            <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">{l}</div>
                            <div className="text-xs font-semibold text-gray-700 mt-0.5">{v}</div>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
              {state.deployment && (
                <Field label="Deployment Notes & Open Questions"
                  value={state.deploymentNotes}
                  onChange={v => setState(p => ({ ...p, deploymentNotes: v }))}
                  placeholder="e.g. IT needs to confirm firewall policy… Client has existing Azure Gov contract…"
                  as="textarea" />
              )}
            </div>
          </div>
        )}

        {activeSection === "timeline" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-1">Pilot Timeline</h2>
              <p className="text-xs text-gray-400">Key milestones and dates. Pilot start is set in Workshop Info.</p>
            </div>
            {state.pilotStart && (
              <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                <p className="text-xs font-semibold text-brand-700">Pilot Start: {state.pilotStart} — 90-day clock begins here.</p>
              </div>
            )}
            <div className="space-y-2 text-xs text-gray-500">
              {[
                ["Day 1","First feed live, onboarding call"],
                ["Day 2","Morning digest active"],
                ["Day 30","First report replacement validated"],
                ["Day 60","Mid-pilot review with sponsor"],
                ["Day 76","90-day value report delivered"],
                ["Day 80","Conversion call scheduled"],
                ["Day 91","Hard stop — read-only without LOI or license"],
              ].map(([day, desc]) => (
                <div key={day} className="flex items-baseline gap-3 border-b border-gray-100 pb-2">
                  <span className="font-bold text-gray-700 w-14 flex-shrink-0">{day}</span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "blockers" && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">Blockers & Open Questions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="px-3 py-2.5 text-left">Question / Blocker</th>
                      <th className="px-3 py-2.5 text-left w-28">Raised By</th>
                      <th className="px-3 py-2.5 text-left w-28">Owner</th>
                      <th className="px-3 py-2.5 text-left w-28">Due Date</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.blockers.map(b => (
                      <tr key={b.id} className="border-t border-gray-100">
                        {(["description","raisedBy","owner","dueDate"] as const).map(f => (
                          <td key={f} className="px-2 py-1.5">
                            <input value={b[f]} onChange={e => upBlocker(b.id, f, e.target.value)}
                              placeholder={f === "description" ? "Describe the blocker…" : f === "dueDate" ? "Date" : "Name"}
                              className="w-full text-xs text-gray-900 bg-transparent border-b border-gray-200 focus:border-brand-400 focus:outline-none py-1 placeholder-gray-300" />
                          </td>
                        ))}
                        <td className="px-2">
                          <button onClick={() => setState(p => ({ ...p, blockers: p.blockers.filter(x => x.id !== b.id) }))}
                            className="text-gray-300 hover:text-red-400 transition-colors text-xs">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-dashed border-gray-200">
                <button onClick={addBlocker} className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">+</span>
                  Add Blocker
                </button>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <Field label="Workshop Notes" value={state.notes} onChange={v => setState(p => ({ ...p, notes: v }))}
                placeholder="General notes, key decisions, context not captured above…" as="textarea" />
            </div>
          </div>
        )}

        {activeSection === "signoff" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-1">Sign-off</h2>
              <p className="text-xs text-gray-400">Names appear on the sign-off page. Signature lines are blank for physical signing.</p>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {[
                { prefix: "client",   label: state.details.clientOrg || "Client", sublabel: "Executive Sponsor" },
                { prefix: "centific", label: "Centific",                          sublabel: "Account / CS Lead" },
                { prefix: "partner",  label: state.details.partnerOrg || "Partner", sublabel: "Representative" },
              ].map(({ prefix, label, sublabel }) => (
                <div key={prefix} className="space-y-2">
                  <p className="text-xs font-bold text-gray-700">{label}</p>
                  <p className="text-[10px] text-gray-400">{sublabel}</p>
                  <Field label="Print Name"
                    value={state.signoff[prefix as keyof typeof state.signoff]}
                    onChange={v => setState(p => ({ ...p, signoff: { ...p.signoff, [prefix]: v } }))}
                    placeholder="Full name" />
                  <Field label="Title"
                    value={state.signoff[(prefix + "Title") as keyof typeof state.signoff]}
                    onChange={v => setState(p => ({ ...p, signoff: { ...p.signoff, [prefix + "Title"]: v } }))}
                    placeholder="Title" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Prev / Next navigation ── */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3">
          <button
            onClick={() => prevSectionId && setActiveSection(prevSectionId as SectionId)}
            disabled={!prevSectionId}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              prevSectionId
                ? "text-gray-700 hover:bg-gray-100 border border-gray-200"
                : "text-gray-300 cursor-not-allowed"
            }`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Previous
          </button>
          <span className="text-xs text-gray-400 font-medium">
            {currentIndex + 1} <span className="text-gray-300">of</span> {SECTIONS.length}
            <span className="text-gray-400 ml-1.5">· {currentSectionLabel}</span>
          </span>
          <button
            onClick={() => nextSectionId && setActiveSection(nextSectionId as SectionId)}
            disabled={!nextSectionId}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              nextSectionId
                ? "bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
                : "text-gray-300 cursor-not-allowed"
            }`}
          >
            Next
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
