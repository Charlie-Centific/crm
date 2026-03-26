"use client";

import { useState, useMemo } from "react";
import { OPERATIONAL_MODULES, PLATFORM_MODULE } from "@/lib/modules-data";
import { CheckSquare, Square, Printer, Info } from "lucide-react";

// ── Indicative price tables ─────────────────────────────────────────────────

const MODULE_ANNUAL_BASE: Record<string, number> = {
  "MOD-01-VIDEO":      60_000,
  "MOD-02-DISPATCH":   55_000,
  "MOD-03-TRAFFIC":    55_000,
  "MOD-04-SAFETY":     65_000,
  "MOD-05-COMPLIANCE": 50_000,
  "MOD-06-INDUSTRIAL": 45_000,
};

const PLATFORM_FEE: Record<string, number> = {
  small:      35_000,
  medium:     60_000,
  large:      95_000,
  enterprise: 150_000,
};

const SCALE_MULTIPLIER: Record<string, number> = {
  small:      1.0,
  medium:     1.6,
  large:      2.4,
  enterprise: 3.5,
};

const TERM_DISCOUNT: Record<number, number> = { 1: 0, 2: 0.08, 3: 0.15 };

const IMPL_FEE: Record<string, number> = {
  pilot:      25_000,
  standard:   65_000,
  enterprise: 120_000,
};

const SCALE_LABEL: Record<string, string> = {
  small:      "Small (1–10 endpoints)",
  medium:     "Medium (11–50 endpoints)",
  large:      "Large (51–200 endpoints)",
  enterprise: "Enterprise (200+ endpoints)",
};

const DEPLOY_LABEL: Record<string, string> = {
  pilot:      "Pilot / Proof of Concept",
  standard:   "Standard Deployment",
  enterprise: "Full Enterprise",
};

type Scale  = "small" | "medium" | "large" | "enterprise";
type Deploy = "pilot" | "standard" | "enterprise";

// ── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// ── Quote HTML generator ────────────────────────────────────────────────────

interface QuoteResult {
  platformFee: number;
  moduleLines: { id: string; title: string; annualBase: number }[];
  annualSubtotal: number;
  discountAmount: number;
  annualAfterDiscount: number;
  implFee: number;
  totalContract: number;
}

function generateQuoteHTML(params: {
  clientName: string;
  preparedBy: string;
  scale: Scale;
  deploy: Deploy;
  term: number;
  q: QuoteResult;
}) {
  const { clientName, preparedBy, scale, deploy, term, q } = params;
  const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const moduleRows = q.moduleLines.length
    ? q.moduleLines.map((l) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#374151;">${l.title}</td>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;">Operational</td>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#374151;text-align:right;">${fmt(l.annualBase)}</td>
        </tr>`).join("")
    : `<tr><td colspan="3" style="padding:14px 0;text-align:center;color:#9ca3af;font-style:italic;border-bottom:1px solid #e5e7eb;">No operational modules selected — platform only</td></tr>`;

  const discountRow = q.discountAmount > 0 ? `
    <tr>
      <td colspan="2" style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#059669;">
        Multi-year discount (${TERM_DISCOUNT[term] * 100}% · ${term}-year term)
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#059669;text-align:right;font-weight:600;">
        -${fmt(q.discountAmount)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#374151;">Annual (after discount)</td>
      <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#374151;text-align:right;font-weight:600;">${fmt(q.annualAfterDiscount)}</td>
    </tr>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>VisionAI™ Pricing Estimate — ${clientName || "Client"}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f9fafb; color: #111827; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @page { size: A4 portrait; margin: 0; }
  @media print {
    body { background: white; }
    .no-print { display: none !important; }
  }
  .page { max-width: 800px; margin: 0 auto; background: white; min-height: 100vh; }
  .header { background: linear-gradient(135deg, #111827 0%, #374151 100%); padding: 40px 48px; color: white; }
  .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
  .badge { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px; }
  .client-name { font-size: 26px; font-weight: 800; color: white; margin-bottom: 4px; }
  .subline { font-size: 14px; color: #9ca3af; }
  .meta { text-align: right; font-size: 12px; color: #9ca3af; line-height: 1.7; }
  .config-bar { background: #f3f4f6; padding: 12px 48px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; display: flex; gap: 32px; }
  .config-bar strong { color: #374151; }
  .body { padding: 40px 48px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; }
  thead th:first-child { text-align: left; }
  thead th:nth-child(2) { text-align: left; }
  thead th:last-child { text-align: right; }
  .platform-row td { padding: 14px 0; border-bottom: 1px solid #e5e7eb; }
  .platform-name { font-weight: 700; color: #111827; }
  .included-badge { display: inline-block; background: #f3f4f6; color: #6b7280; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 8px; font-weight: 500; }
  .subtotal-row td { padding: 14px 0; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; }
  tfoot tr td { padding: 16px 0; font-weight: 800; font-size: 18px; color: #111827; }
  tfoot tr td:last-child { text-align: right; }
  .totals-row { background: #111827; border-radius: 8px; }
  .totals-row td { color: white !important; padding: 16px 12px; }
  .totals-row td:last-child { text-align: right; }
  .kpi-row { display: flex; gap: 16px; margin-top: 28px; }
  .kpi-box { flex: 1; border-radius: 10px; padding: 18px; text-align: center; border: 1px solid; }
  .kpi-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
  .kpi-value { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
  .kpi-sub { font-size: 11px; }
  .kpi-primary { background: #eff6ff; border-color: #bfdbfe; }
  .kpi-primary .kpi-label { color: #3b82f6; }
  .kpi-primary .kpi-value { color: #1d4ed8; }
  .kpi-primary .kpi-sub { color: #60a5fa; }
  .kpi-secondary { background: #f9fafb; border-color: #e5e7eb; }
  .kpi-secondary .kpi-label { color: #9ca3af; }
  .kpi-secondary .kpi-value { color: #111827; }
  .kpi-secondary .kpi-sub { color: #9ca3af; }
  .disclaimer { margin-top: 28px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; }
  .disclaimer-title { font-size: 10px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
  .disclaimer p { font-size: 11px; color: #78350f; line-height: 1.7; margin-bottom: 4px; }
  .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div>
        <div class="badge">Indicative Pricing Estimate</div>
        <div class="client-name">${clientName || "— Client Name —"}</div>
        <div class="subline">VisionAI™ · ${DEPLOY_LABEL[deploy]}</div>
      </div>
      <div class="meta">
        <div>${dateStr}</div>
        ${preparedBy ? `<div>Prepared by ${preparedBy}</div>` : ""}
        <div>Centific Global Services</div>
      </div>
    </div>
  </div>

  <div class="config-bar">
    <span><strong>Scale:</strong> ${SCALE_LABEL[scale]}</span>
    <span><strong>Term:</strong> ${term} year${term > 1 ? "s" : ""}</span>
    ${TERM_DISCOUNT[term] > 0 ? `<span style="color:#059669;font-weight:600;">Multi-year discount applied (${TERM_DISCOUNT[term] * 100}%)</span>` : ""}
  </div>

  <div class="body">
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Type</th>
          <th style="text-align:right;">Annual</th>
        </tr>
      </thead>
      <tbody>
        <tr class="platform-row">
          <td>
            <span class="platform-name">${PLATFORM_MODULE.title}</span>
            <span class="included-badge">Included</span>
          </td>
          <td style="color:#6b7280;">Platform</td>
          <td style="text-align:right;font-weight:600;color:#111827;">${fmt(q.platformFee)}</td>
        </tr>
        ${moduleRows}
        <tr class="subtotal-row">
          <td colspan="2">Annual Software Subtotal</td>
          <td style="text-align:right;">${fmt(q.annualSubtotal)}</td>
        </tr>
        ${discountRow}
        <tr>
          <td colspan="2" style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#374151;">
            Implementation &amp; Onboarding Services
            <span style="font-size:11px;color:#9ca3af;margin-left:6px;">One-time</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#374151;text-align:right;">${fmt(q.implFee)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="totals-row">
          <td colspan="2">Total ${term}-Year Contract Value</td>
          <td>${fmt(q.totalContract)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="kpi-row">
      <div class="kpi-box kpi-primary">
        <div class="kpi-label">Annual Recurring</div>
        <div class="kpi-value">${fmt(q.annualAfterDiscount)}</div>
        <div class="kpi-sub">per year (software only)</div>
      </div>
      <div class="kpi-box kpi-secondary">
        <div class="kpi-label">Modules Included</div>
        <div class="kpi-value">${q.moduleLines.length + 1}</div>
        <div class="kpi-sub">of 7 total modules</div>
      </div>
      <div class="kpi-box kpi-secondary">
        <div class="kpi-label">Per-Month Equiv.</div>
        <div class="kpi-value">${fmt(q.annualAfterDiscount / 12)}</div>
        <div class="kpi-sub">annualized</div>
      </div>
    </div>

    <div class="disclaimer">
      <div class="disclaimer-title">Assumptions &amp; Disclaimer</div>
      <p>• Pricing is indicative only and does not constitute a binding offer. Final pricing is subject to a signed Statement of Work.</p>
      <p>• Platform fee covers the Administration &amp; Intelligence module and is required for all deployments.</p>
      <p>• Implementation services include setup, integration, and 90-day onboarding. Hardware, third-party data feeds, and hosting are excluded unless noted in the SOW.</p>
      <p>• Multi-year discounts apply to software licenses only and require a signed multi-year agreement.</p>
    </div>

    <div class="footer">
      <span>VisionAI™ by Centific Global Services · Confidential</span>
      <span>${dateStr}</span>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ── Component ────────────────────────────────────────────────────────────────

export function PricingClient() {
  const [clientName, setClientName] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [scale, setScale]   = useState<Scale>("medium");
  const [deploy, setDeploy] = useState<Deploy>("standard");
  const [term, setTerm]     = useState<1 | 2 | 3>(1);
  const [selectedMods, setSelectedMods] = useState<Set<string>>(new Set());

  function toggleMod(id: string) {
    setSelectedMods((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const q = useMemo<QuoteResult>(() => {
    const multiplier    = SCALE_MULTIPLIER[scale];
    const discount      = TERM_DISCOUNT[term];
    const platformFee   = PLATFORM_FEE[scale];
    const implFee       = IMPL_FEE[deploy];
    const moduleLines   = OPERATIONAL_MODULES
      .filter((m) => selectedMods.has(m.id))
      .map((m) => ({ id: m.id, title: m.title, annualBase: MODULE_ANNUAL_BASE[m.id] * multiplier }));
    const annualModules       = moduleLines.reduce((s, l) => s + l.annualBase, 0);
    const annualSubtotal      = platformFee + annualModules;
    const discountAmount      = annualSubtotal * discount;
    const annualAfterDiscount = annualSubtotal - discountAmount;
    const totalContract       = annualAfterDiscount * term + implFee;
    return { platformFee, moduleLines, annualModules, annualSubtotal, discountAmount, annualAfterDiscount, implFee, totalContract };
  }, [scale, deploy, term, selectedMods]);

  function handleExport() {
    const html = generateQuoteHTML({ clientName, preparedBy, scale, deploy, term, q });
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Pricing Calculator</h1>
        <p className="text-sm text-gray-500 mt-0.5">Build an indicative VisionAI™ quote — configure, preview, and export to PDF</p>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-[320px_1fr] gap-8 items-start">

        {/* ── Config panel ──────────────────────────────────────────────── */}
        <div className="space-y-5 sticky top-20">

          {/* Quote details */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quote Details</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client / Agency Name</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. City of Austin"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-300 placeholder:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prepared By</label>
              <input
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="Your name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-300 placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Deployment type */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deployment Type</p>
            {(["pilot", "standard", "enterprise"] as Deploy[]).map((d) => (
              <button
                key={d}
                onClick={() => setDeploy(d)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-all ${
                  deploy === d
                    ? "border-brand-400 bg-brand-50 text-brand-700 font-semibold"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {DEPLOY_LABEL[d]}
                <span className="block text-[10px] font-normal mt-0.5 text-gray-400">
                  {d === "pilot" && `Impl: ${fmt(IMPL_FEE.pilot)}`}
                  {d === "standard" && `Impl: ${fmt(IMPL_FEE.standard)}`}
                  {d === "enterprise" && `Impl: ${fmt(IMPL_FEE.enterprise)}`}
                </span>
              </button>
            ))}
          </div>

          {/* Scale */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deployment Scale</p>
            {(["small", "medium", "large", "enterprise"] as Scale[]).map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-all ${
                  scale === s
                    ? "border-brand-400 bg-brand-50 text-brand-700 font-semibold"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {SCALE_LABEL[s]}
                <span className="block text-[10px] font-normal mt-0.5 text-gray-400">
                  Platform: {fmt(PLATFORM_FEE[s])}/yr · ×{SCALE_MULTIPLIER[s]} on modules
                </span>
              </button>
            ))}
          </div>

          {/* Term */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contract Term</p>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTerm(t)}
                  className={`flex-1 py-3 rounded-lg text-sm border font-semibold transition-all ${
                    term === t
                      ? "border-brand-400 bg-brand-50 text-brand-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {t}yr
                  {TERM_DISCOUNT[t] > 0 && (
                    <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">
                      -{TERM_DISCOUNT[t] * 100}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Modules</p>

            {/* Platform — always included */}
            <div className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg">
              <CheckSquare size={15} className="text-white mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white leading-tight">{PLATFORM_MODULE.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Platform · Always included</p>
              </div>
            </div>

            {/* Operational modules */}
            {OPERATIONAL_MODULES.map((m) => {
              const on = selectedMods.has(m.id);
              const annualPrice = MODULE_ANNUAL_BASE[m.id] * SCALE_MULTIPLIER[scale];
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMod(m.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                    on ? "border-brand-400 bg-brand-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {on
                    ? <CheckSquare size={15} className="text-brand-600 mt-0.5 flex-shrink-0" />
                    : <Square     size={15} className="text-gray-300 mt-0.5 flex-shrink-0" />
                  }
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold leading-tight ${on ? "text-brand-700" : "text-gray-700"}`}>
                      {m.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{fmt(annualPrice)}/yr at current scale</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Quote preview ──────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Quote Preview</h2>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all"
            >
              <Printer size={14} />
              Export PDF
            </button>
          </div>

          {/* Quote document */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

            {/* Document header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-8 py-7 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Indicative Pricing Estimate
                  </p>
                  <h3 className="text-2xl font-bold">
                    {clientName || <span className="text-gray-500">— Client Name —</span>}
                  </h3>
                  <p className="text-sm text-gray-300 mt-1">VisionAI™ · {DEPLOY_LABEL[deploy]}</p>
                </div>
                <div className="text-right text-xs text-gray-400 flex-shrink-0">
                  <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                  {preparedBy && <p className="mt-1">Prepared by {preparedBy}</p>}
                  <p className="mt-1">Centific Global Services</p>
                </div>
              </div>
            </div>

            {/* Config summary bar */}
            <div className="px-8 py-3 bg-gray-50 border-b border-gray-200 flex gap-6 text-xs text-gray-600">
              <span><span className="font-semibold text-gray-700">Scale:</span> {SCALE_LABEL[scale]}</span>
              <span><span className="font-semibold text-gray-700">Term:</span> {term} year{term > 1 ? "s" : ""}</span>
              {TERM_DISCOUNT[term] > 0 && (
                <span className="text-emerald-600 font-semibold">
                  Multi-year discount applied ({TERM_DISCOUNT[term] * 100}%)
                </span>
              )}
            </div>

            {/* Line items */}
            <div className="px-8 py-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Component</th>
                    <th className="text-left pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="text-right pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Platform */}
                  <tr className="border-b border-gray-100">
                    <td className="py-3.5 font-semibold text-gray-800">
                      {PLATFORM_MODULE.title}
                      <span className="ml-2 text-[10px] font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        Included
                      </span>
                    </td>
                    <td className="py-3.5 text-gray-500">Platform</td>
                    <td className="py-3.5 text-right font-semibold text-gray-800">{fmt(q.platformFee)}</td>
                  </tr>

                  {/* Selected modules */}
                  {q.moduleLines.map((line) => (
                    <tr key={line.id} className="border-b border-gray-100">
                      <td className="py-3.5 text-gray-800">{line.title}</td>
                      <td className="py-3.5 text-gray-500">Operational</td>
                      <td className="py-3.5 text-right text-gray-800">{fmt(line.annualBase)}</td>
                    </tr>
                  ))}

                  {q.moduleLines.length === 0 && (
                    <tr className="border-b border-gray-100">
                      <td colSpan={3} className="py-4 text-center text-sm text-gray-400 italic">
                        No operational modules selected — platform only
                      </td>
                    </tr>
                  )}

                  {/* Annual subtotal */}
                  <tr className="border-b-2 border-gray-200">
                    <td colSpan={2} className="py-3.5 font-semibold text-gray-700">Annual Software Subtotal</td>
                    <td className="py-3.5 text-right font-semibold text-gray-700">{fmt(q.annualSubtotal)}</td>
                  </tr>

                  {/* Multi-year discount */}
                  {q.discountAmount > 0 && (
                    <>
                      <tr className="border-b border-gray-100">
                        <td colSpan={2} className="py-3 text-emerald-700">
                          Multi-year discount ({TERM_DISCOUNT[term] * 100}% · {term}-year term)
                        </td>
                        <td className="py-3 text-right text-emerald-700 font-semibold">-{fmt(q.discountAmount)}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td colSpan={2} className="py-3 text-gray-700">Annual (after discount)</td>
                        <td className="py-3 text-right text-gray-700 font-semibold">{fmt(q.annualAfterDiscount)}</td>
                      </tr>
                    </>
                  )}

                  {/* Implementation */}
                  <tr className="border-b border-gray-100">
                    <td colSpan={2} className="py-3.5 text-gray-800">
                      Implementation &amp; Onboarding Services
                      <span className="ml-2 text-[10px] text-gray-400">One-time</span>
                    </td>
                    <td className="py-3.5 text-right text-gray-800">{fmt(q.implFee)}</td>
                  </tr>
                </tbody>

                {/* Total */}
                <tfoot>
                  <tr className="bg-gray-900 rounded-b">
                    <td colSpan={2} className="px-3 py-4 font-bold text-white text-base rounded-bl-lg">
                      Total {term}-Year Contract Value
                    </td>
                    <td className="px-3 py-4 text-right font-bold text-white text-base rounded-br-lg">
                      {fmt(q.totalContract)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* KPI tiles */}
              <div className="mt-5 grid grid-cols-3 gap-4">
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-center">
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Annual Recurring</p>
                  <p className="text-2xl font-bold text-brand-700">{fmt(q.annualAfterDiscount)}</p>
                  <p className="text-xs text-brand-500 mt-0.5">per year · software only</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Modules</p>
                  <p className="text-2xl font-bold text-gray-800">{selectedMods.size + 1} <span className="text-sm font-normal text-gray-400">/ 7</span></p>
                  <p className="text-xs text-gray-500 mt-0.5">total modules included</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Per Month</p>
                  <p className="text-2xl font-bold text-gray-800">{fmt(q.annualAfterDiscount / 12)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">annualized equiv.</p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <Info size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold uppercase tracking-wide text-[10px]">Assumptions &amp; Disclaimer</p>
                  <p>Pricing is indicative only and does not constitute a binding offer. Final pricing is subject to a signed Statement of Work.</p>
                  <p>Platform fee covers the Administration &amp; Intelligence module and is required for all deployments. Implementation services include setup, integration, and 90-day onboarding. Hardware, third-party data feeds, and hosting are excluded unless noted in the SOW.</p>
                  <p>Multi-year discounts apply to software licenses only and require a signed multi-year agreement.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
