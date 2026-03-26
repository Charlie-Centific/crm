"use client";

import { useState, useMemo } from "react";
import { RFP_SECTIONS } from "@/lib/rfp-builder-data";
import type { RFPSection, RFPBlock } from "@/lib/rfp-builder-data";

// ─── Types ────────────────────────────────────────────────────────────────────
type Selections = Record<string, string[]>;

const REQUIRED_IDS = RFP_SECTIONS.filter((s) => s.required).map((s) => s.id);

// ─── HTML generation ──────────────────────────────────────────────────────────
function mdToHtml(text: string): string {
  let html = text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // H3
    .replace(/^### (.+)$/gm, '<h3 class="sub-h3">$1</h3>')
    // Bullet lists — collect consecutive - lines into <ul>
    .replace(/((?:^- .+\n?)+)/gm, (block) => {
      const items = block
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((l) => `<li>${l.replace(/^- /, "")}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    })
    // Paragraphs
    .split(/\n\n+/)
    .map((para) => {
      if (para.startsWith("<h3") || para.startsWith("<ul")) return para;
      return `<p>${para.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
  return html;
}

function generateRFPHtml(
  sections: RFPSection[],
  selections: Selections,
  iconDataUrl: string
): string {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const chosen = sections.filter((s) => (selections[s.id] ?? []).length > 0);

  const tocItems = chosen
    .map(
      (s) =>
        `<li><a href="#${s.id}">${s.ref ? `<span class="toc-ref">${s.ref}</span> ` : ""}${s.title}</a></li>`
    )
    .join("");

  const sectionHtml = chosen
    .map((s) => {
      const blocks = s.blocks.filter((b) =>
        (selections[s.id] ?? []).includes(b.id)
      );
      const bodyHtml = blocks.map((b) => mdToHtml(b.content)).join("\n");
      return `
      <section id="${s.id}" class="rfp-section">
        <div class="section-header">
          ${s.ref ? `<span class="section-ref" contenteditable="true">${s.ref}</span>` : ""}
          <h2 class="section-title" contenteditable="true">${s.title}</h2>
        </div>
        <div class="section-body" contenteditable="true">${bodyHtml}</div>
      </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Centific RFP Technical Proposal</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --brand:        #7C3AED;
    --brand-dark:   #5B21B6;
    --brand-light:  #EDE9FE;
    --accent:       #EC4899;
    --gray-900:     #111827;
    --gray-700:     #374151;
    --gray-500:     #6B7280;
    --gray-200:     #E5E7EB;
    --gray-100:     #F3F4F6;
    --white:        #ffffff;
  }

  body {
    font-family: "Inter", system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.7;
    color: var(--gray-900);
    background: var(--white);
  }

  /* ── Cover page ── */
  .cover {
    min-height: 100vh;
    background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 45%, #5B21B6 100%);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    padding: 64px 80px;
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }

  .cover::before {
    content: "";
    position: absolute;
    top: -120px; right: -120px;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: rgba(236, 72, 153, 0.12);
  }
  .cover::after {
    content: "";
    position: absolute;
    bottom: -80px; left: 200px;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
  }

  .cover-logo {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .cover-logo-mark {
    width: 48px; height: 48px;
    background: rgba(255,255,255,0.15);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 900; color: white;
    border: 1px solid rgba(255,255,255,0.2);
    backdrop-filter: blur(8px);
  }
  .cover-logo-name {
    font-size: 20px; font-weight: 800;
    letter-spacing: 0.06em; color: white;
    text-transform: uppercase;
  }

  .cover-body { position: relative; z-index: 1; }

  .cover-badge {
    display: inline-block;
    background: rgba(236, 72, 153, 0.25);
    border: 1px solid rgba(236, 72, 153, 0.5);
    color: #FBB6CE;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 100px;
    margin-bottom: 24px;
  }

  .cover-title {
    font-size: 44px; font-weight: 800;
    color: white; line-height: 1.1;
    margin-bottom: 20px; max-width: 640px;
  }

  .cover-subtitle {
    font-size: 16px; color: rgba(255,255,255,0.7);
    max-width: 520px; line-height: 1.6;
    margin-bottom: 48px;
  }

  .cover-meta {
    display: flex; gap: 32px;
    font-size: 12px; color: rgba(255,255,255,0.6);
  }
  .cover-meta strong { color: rgba(255,255,255,0.9); display: block; margin-bottom: 2px; }

  .cover-footer {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 20px; width: 100%;
    position: relative; z-index: 1;
  }

  /* ── TOC ── */
  .toc {
    max-width: 800px; margin: 0 auto;
    padding: 64px 80px;
    page-break-after: always;
  }

  .toc-heading {
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--brand); margin-bottom: 8px;
  }
  .toc-title {
    font-size: 28px; font-weight: 800;
    color: var(--gray-900); margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--brand-light);
  }

  .toc ol { list-style: none; counter-reset: toc; }
  .toc li {
    counter-increment: toc;
    display: flex; align-items: baseline; gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid var(--gray-200);
    font-size: 13px;
  }
  .toc li::before {
    content: counter(toc, decimal-leading-zero);
    font-size: 11px; font-weight: 700;
    color: var(--brand); min-width: 22px;
  }
  .toc a {
    color: var(--gray-700); text-decoration: none; flex: 1;
    font-weight: 500;
  }
  .toc a:hover { color: var(--brand); }
  .toc-ref {
    font-size: 10px; font-weight: 700;
    color: var(--brand); background: var(--brand-light);
    padding: 1px 6px; border-radius: 4px;
    margin-right: 4px;
  }

  /* ── Sections ── */
  .rfp-section {
    max-width: 800px; margin: 0 auto;
    padding: 64px 80px;
    border-bottom: 1px solid var(--gray-200);
    page-break-inside: avoid;
  }

  .section-header {
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 3px solid var(--brand-light);
    position: relative;
  }
  .section-header::before {
    content: "";
    position: absolute; left: -32px; top: 0; bottom: 0;
    width: 4px; background: linear-gradient(180deg, var(--brand), var(--accent));
    border-radius: 0 2px 2px 0;
  }

  .section-ref {
    display: inline-block;
    font-size: 10px; font-weight: 800;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--brand); background: var(--brand-light);
    padding: 3px 10px; border-radius: 100px;
    margin-bottom: 10px;
  }

  .section-title {
    font-size: 22px; font-weight: 800;
    color: var(--gray-900); line-height: 1.2;
  }

  /* ── Body typography ── */
  .section-body p {
    font-size: 13.5px; color: var(--gray-700);
    line-height: 1.75; margin-bottom: 14px;
  }
  .section-body strong { color: var(--gray-900); font-weight: 700; }

  .section-body .sub-h3 {
    font-size: 13px; font-weight: 700;
    color: var(--brand-dark);
    margin: 22px 0 8px;
    padding-left: 12px;
    border-left: 3px solid var(--brand);
  }

  .section-body ul {
    margin: 8px 0 16px 0; padding-left: 0;
    list-style: none;
  }
  .section-body ul li {
    display: flex; gap: 10px;
    font-size: 13px; color: var(--gray-700);
    padding: 4px 0; line-height: 1.6;
  }
  .section-body ul li::before {
    content: "▸";
    color: var(--brand); flex-shrink: 0; margin-top: 1px;
    font-size: 11px;
  }

  /* ── Document footer ── */
  .doc-footer {
    max-width: 800px; margin: 0 auto;
    padding: 32px 80px;
    display: flex; align-items: center; justify-content: space-between;
    border-top: 2px solid var(--brand-light);
  }
  .doc-footer-logo { font-weight: 800; color: var(--brand); font-size: 13px; }
  .doc-footer-meta { font-size: 11px; color: var(--gray-500); text-align: right; }

  /* ── Editor toolbar ── */
  .editor-bar {
    position: sticky; top: 0; z-index: 9999;
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--gray-200);
    box-shadow: 0 1px 10px rgba(0,0,0,0.07);
  }
  .editor-bar-inner {
    max-width: 960px; margin: 0 auto;
    padding: 10px 80px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .editor-bar-left {
    display: flex; align-items: center; gap: 12px;
  }
  .editor-bar-logo {
    width: 28px; height: 28px; border-radius: 8px;
    background: linear-gradient(135deg, #7C3AED, #5B21B6);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 900; color: white;
    flex-shrink: 0;
  }
  .editor-bar-brand {
    font-size: 12px; font-weight: 800; color: var(--brand);
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .editor-bar-sep { color: var(--gray-200); margin: 0 2px; }
  .editor-bar-label {
    font-size: 12px; color: var(--gray-500); font-weight: 500;
  }
  .editor-bar-hint {
    display: inline-flex; align-items: center; gap: 5px;
    background: #EDE9FE; color: #6D28D9;
    font-size: 10px; font-weight: 600;
    padding: 3px 10px; border-radius: 100px;
    letter-spacing: 0.02em;
  }
  .editor-bar-hint::before {
    content: "✎"; font-size: 11px;
  }
  .publish-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: linear-gradient(135deg, #7C3AED, #5B21B6);
    color: white; font-size: 12px; font-weight: 700;
    padding: 8px 18px; border-radius: 10px; border: none;
    cursor: pointer; letter-spacing: 0.02em;
    box-shadow: 0 2px 8px rgba(124,58,237,0.35);
    transition: opacity 0.15s, box-shadow 0.15s;
  }
  .publish-btn:hover { opacity: 0.92; box-shadow: 0 4px 14px rgba(124,58,237,0.4); }
  .publish-btn svg { width: 14px; height: 14px; flex-shrink: 0; }

  /* ── Editable areas ── */
  [contenteditable]:hover {
    outline: 2px dashed #C4B5FD;
    outline-offset: 4px;
    border-radius: 4px;
    cursor: text;
  }
  [contenteditable]:focus {
    outline: 2px solid var(--brand);
    outline-offset: 4px;
    border-radius: 4px;
  }

  @media print {
    .editor-bar { display: none !important; }
    [contenteditable] { outline: none !important; }
    .cover { page-break-after: always; }
    .toc { page-break-after: always; }
    .rfp-section { page-break-inside: avoid; }
  }
</style>
</head>
<body>

<!-- Editor toolbar -->
<div class="editor-bar">
  <div class="editor-bar-inner">
    <div class="editor-bar-left">
      <div class="editor-bar-logo"><img src="${iconDataUrl}" alt="VAI" style="width:16px;height:16px;display:block;filter:brightness(0) invert(1);" /></div>
      <div>
        <span class="editor-bar-brand">Centific</span>
        <span class="editor-bar-sep">·</span>
        <span class="editor-bar-label">RFP Editor</span>
      </div>
      <span class="editor-bar-hint">Click any text to edit</span>
    </div>
    <button class="publish-btn" onclick="window.print()">
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd"/>
      </svg>
      Publish · Save as PDF
    </button>
  </div>
</div>

<!-- Cover -->
<div class="cover">
  <div class="cover-logo">
    <div class="cover-logo-mark"><img src="${iconDataUrl}" alt="VAI" style="width:28px;height:28px;display:block;filter:brightness(0) invert(1);" /></div>
    <div class="cover-logo-name">Centific</div>
  </div>

  <div class="cover-body">
    <div class="cover-badge" contenteditable="true">Technical Proposal · Confidential</div>
    <h1 class="cover-title" contenteditable="true">RFP Response:<br>VAI™ Platform</h1>
    <p class="cover-subtitle" contenteditable="true">
      Prepared by Centific — AI-powered transportation and public safety intelligence,
      from detection to decision.
    </p>
    <div class="cover-meta">
      <div><strong>Prepared by</strong><span contenteditable="true">Centific Global Services</span></div>
      <div><strong>Date</strong><span contenteditable="true">${date}</span></div>
      <div><strong>Sections</strong>${chosen.length} included</div>
      <div><strong>Classification</strong><span contenteditable="true">Confidential &amp; Proprietary</span></div>
    </div>
  </div>

  <div class="cover-footer">
    This document is confidential and proprietary to Centific Global Services.
    It may not be reproduced or distributed without written authorization.
  </div>
</div>

<!-- Table of Contents -->
<div class="toc">
  <p class="toc-heading">Contents</p>
  <h2 class="toc-title">Table of Contents</h2>
  <ol>${tocItems}</ol>
</div>

<!-- Sections -->
${sectionHtml}

<!-- Footer -->
<div class="doc-footer">
  <div class="doc-footer-logo">CENTIFIC</div>
  <div class="doc-footer-meta">
    Confidential and Proprietary · ${date}<br>
    VAI™ is a trademark of Centific Global Services
  </div>
</div>

</body>
</html>`;
}

// ─── Main component ───────────────────────────────────────────────────────────
export function RFPBuilder() {
  const [activeSection, setActiveSection] = useState<string>(RFP_SECTIONS[0]?.id ?? "");
  const [selections, setSelections] = useState<Selections>({});
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [building, setBuilding] = useState(false);

  const currentSection = RFP_SECTIONS.find((s) => s.id === activeSection) ?? RFP_SECTIONS[0];

  // Validation
  const missingRequired = REQUIRED_IDS.filter(
    (id) => (selections[id] ?? []).length === 0
  );
  const canBuild = missingRequired.length === 0;
  const requiredDone = REQUIRED_IDS.length - missingRequired.length;

  const currentIndex = RFP_SECTIONS.findIndex((s) => s.id === activeSection);
  const prevSection = RFP_SECTIONS[currentIndex - 1] ?? null;
  const nextSection = RFP_SECTIONS[currentIndex + 1] ?? null;

  function toggle(sectionId: string, blockId: string, mode: "single" | "multi") {
    setSelections((prev) => {
      const current = prev[sectionId] ?? [];
      if (mode === "single") {
        return { ...prev, [sectionId]: current.includes(blockId) ? [] : [blockId] };
      }
      return {
        ...prev,
        [sectionId]: current.includes(blockId)
          ? current.filter((id) => id !== blockId)
          : [...current, blockId],
      };
    });
  }

  const assembled = useMemo(() => {
    const parts: string[] = [];
    for (const section of RFP_SECTIONS) {
      const chosen = selections[section.id] ?? [];
      if (chosen.length === 0) continue;
      const blocks = section.blocks.filter((b) => chosen.includes(b.id));
      parts.push(
        `### ${section.ref ? `${section.ref} — ` : ""}${section.title}\n\n${blocks.map((b) => b.content).join("\n\n")}`
      );
    }
    return parts.join("\n\n---\n\n");
  }, [selections]);

  const totalSelected = Object.values(selections).reduce((n, ids) => n + ids.length, 0);

  function copyAll() {
    navigator.clipboard.writeText(assembled).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  async function buildDocument() {
    if (!canBuild) return;
    setBuilding(true);
    try {
      // Fetch the VAI icon and embed as base64 so the blob HTML is self-contained
      const resp = await fetch("/brand/vai-icon-512.webp");
      const buf = await resp.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const iconDataUrl = `data:image/webp;base64,${btoa(binary)}`;

      const html = generateRFPHtml(RFP_SECTIONS, selections, iconDataUrl);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } finally {
      setBuilding(false);
    }
  }

  return (
    <div className="flex gap-5 min-h-[600px]">
      {/* ── Left: section list + build panel ────────────────────────────── */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-3">
        {/* Section list */}
        <div className="flex-1 space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Sections</p>
          {RFP_SECTIONS.map((s) => {
            const selected = selections[s.id] ?? [];
            const isDone = selected.length > 0;
            const isActive = activeSection === s.id;
            const isRequired = s.required ?? false;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-start gap-2.5 ${
                  isActive
                    ? "bg-brand-600 text-white shadow-sm"
                    : isDone
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {/* Status dot */}
                <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  isActive ? "bg-white/20 text-white"
                  : isDone ? "bg-emerald-500 text-white"
                  : isRequired ? "bg-red-100 text-red-500 border border-red-300"
                  : "bg-gray-200 text-gray-400"
                }`}>
                  {isDone ? "✓" : isRequired ? "!" : ""}
                </span>
                <span className="leading-snug">
                  {s.ref && <span className="opacity-60">{s.ref} · </span>}
                  {s.title}
                  {isRequired && !isDone && (
                    <span className="block text-[9px] font-bold text-red-500 mt-0.5">Required</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Build panel */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500"
              style={{ width: `${(requiredDone / REQUIRED_IDS.length) * 100}%` }}
            />
          </div>

          <div className="p-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
              Required sections
            </p>
            <p className="text-sm font-bold text-gray-900 mb-3">
              {requiredDone} / {REQUIRED_IDS.length} complete
            </p>

            {/* Missing list */}
            {missingRequired.length > 0 && (
              <ul className="space-y-1 mb-4">
                {missingRequired.map((id) => {
                  const s = RFP_SECTIONS.find((x) => x.id === id);
                  return (
                    <li key={id}>
                      <button
                        onClick={() => setActiveSection(id)}
                        className="flex items-center gap-1.5 text-[11px] text-red-600 hover:text-red-800 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {s?.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* BUILD button */}
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Building…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  {canBuild ? "Build Document" : `Need ${missingRequired.length} more`}
                </>
              )}
            </button>

            {canBuild && (
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Opens in a new tab — edit, then publish as PDF
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: section detail + preview ────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Toggle: Build / Preview */}
        <div className="flex items-center justify-between">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setShowPreview(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !showPreview ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Build
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                showPreview ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Preview
              {totalSelected > 0 && (
                <span className="bg-brand-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalSelected}
                </span>
              )}
            </button>
          </div>

          {assembled && (
            <button
              onClick={copyAll}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all bg-white border-gray-200 hover:border-brand-400 hover:text-brand-700 text-gray-600"
            >
              {copied ? (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                    <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                  </svg>
                  Copy markdown
                </>
              )}
            </button>
          )}
        </div>

        {/* Build view */}
        {!showPreview && currentSection && (
          <SectionEditor
            section={currentSection}
            selected={selections[currentSection.id] ?? []}
            onToggle={(blockId) => toggle(currentSection.id, blockId, currentSection.mode)}
          />
        )}

        {/* Preview view */}
        {showPreview && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">Markdown Preview</p>
              {!assembled && (
                <p className="text-xs text-gray-400">Select blocks to see the assembled response</p>
              )}
            </div>
            <div className="p-5 max-h-[520px] overflow-y-auto">
              {assembled ? (
                <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {assembled}
                </pre>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No blocks selected yet.</p>
                  <p className="text-xs mt-1">
                    Switch to Build and select response blocks to assemble your document.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Prev / Next navigation ── */}
        {!showPreview && (
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3">
            <button
              onClick={() => prevSection && setActiveSection(prevSection.id)}
              disabled={!prevSection}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                prevSection
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
              {currentIndex + 1} <span className="text-gray-300">of</span> {RFP_SECTIONS.length}
              {currentSection && (
                <span className="text-gray-400 ml-1.5">· {currentSection.title}</span>
              )}
            </span>
            <button
              onClick={() => nextSection && setActiveSection(nextSection.id)}
              disabled={!nextSection}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                nextSection
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
        )}
      </div>
    </div>
  );
}

// ─── Section editor ───────────────────────────────────────────────────────────
function SectionEditor({
  section,
  selected,
  onToggle,
}: {
  section: RFPSection;
  selected: string[];
  onToggle: (blockId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className={`bg-white rounded-2xl px-5 py-4 border ${
        section.required && selected.length === 0
          ? "border-red-200 bg-red-50"
          : "border-gray-200"
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {section.ref && (
                <span className="text-[10px] font-bold text-brand-500 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {section.ref}
                </span>
              )}
              {section.required && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                  selected.length > 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600"
                }`}>
                  {selected.length > 0 ? "✓ Required — done" : "Required"}
                </span>
              )}
            </div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">{section.title}</h2>
            <p className="text-xs text-gray-500 leading-relaxed">{section.prompt}</p>
          </div>
          <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            section.mode === "multi"
              ? "bg-violet-100 text-violet-700"
              : "bg-blue-100 text-blue-700"
          }`}>
            {section.mode === "multi" ? "Pick any" : "Pick one"}
          </span>
        </div>
      </div>

      {/* Blocks */}
      <div className={`grid gap-3 ${section.blocks.length > 2 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        {section.blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            selected={selected.includes(block.id)}
            onToggle={() => onToggle(block.id)}
          />
        ))}
      </div>

      {/* Inline preview of selected content */}
      {selected.length > 0 && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
          <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-2">
            {selected.length} block{selected.length !== 1 ? "s" : ""} selected
          </p>
          {section.blocks
            .filter((b) => selected.includes(b.id))
            .map((b) => (
              <div key={b.id} className="mb-3 last:mb-0">
                <p className="text-[10px] font-semibold text-brand-700 mb-1">{b.label}</p>
                <p className="text-xs text-brand-900 leading-relaxed">
                  {b.content.slice(0, 280)}{b.content.length > 280 ? "…" : ""}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── Block card ───────────────────────────────────────────────────────────────
function BlockCard({
  block,
  selected,
  onToggle,
}: {
  block: RFPBlock;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`text-left rounded-xl border p-4 transition-all ${
        selected
          ? "border-brand-400 bg-brand-50 shadow-sm ring-1 ring-brand-200"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${
          selected ? "bg-brand-600 border-brand-600" : "border-gray-300 bg-white"
        }`}>
          {selected && (
            <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold mb-1 ${selected ? "text-brand-800" : "text-gray-900"}`}>
            {block.label}
          </p>
          <p className={`text-xs leading-relaxed ${selected ? "text-brand-700" : "text-gray-500"}`}>
            {block.preview}
          </p>
        </div>
      </div>
    </button>
  );
}
