"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Network,
  Activity,
  Building2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Zap,
  Target,
  Shield,
  Users,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileBarChart,
} from "lucide-react";
import { WORKFLOW_ROI, ROLES, type WorkflowROIData, type ROICategory } from "@/lib/workflow-static-data";

// ── Types ──────────────────────────────────────────────────────────────────

interface StageRow { stage: string; count: number; tcv: number; }
interface VerticalRow { vertical: string; count: number; }
interface StatusRow { status: string; count: number; }

interface Props {
  pipelineByStage:    StageRow[];
  totalActiveTCV:     number;
  totalActiveDeals:   number;
  totalClosedWonTCV:  number;
  totalClosedWon:     number;
  accountsByVertical: VerticalRow[];
  totalAccounts:      number;
  pilotsByStatus:     StatusRow[];
  workshopsByStatus:  StatusRow[];
  totalWorkflows:     number;
  workflowsByVertical:VerticalRow[];
  workflowNames:      Record<string, string>;
}

// ── Constants ──────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  lead:        "Lead",
  discovery:   "Discovery",
  demo:        "Demo",
  workshop:    "Workshop",
  pilot_start: "Pilot Start",
  pilot_close: "Pilot Close",
};

const VERTICAL_LABELS: Record<string, string> = {
  transit:    "Transit",
  utilities:  "Utilities",
  emergency:  "Emergency",
  smart_city: "Smart City",
  traffic:    "Traffic",
  other:      "Other",
};

const VERTICAL_COLORS: Record<string, string> = {
  transit:    "bg-blue-100 text-blue-700",
  utilities:  "bg-amber-100 text-amber-700",
  emergency:  "bg-red-100 text-red-700",
  smart_city: "bg-purple-100 text-purple-700",
  traffic:    "bg-teal-100 text-teal-700",
  other:      "bg-gray-100 text-gray-600",
};

const CATEGORY_META: Record<ROICategory, { label: string; color: string; Icon: React.ElementType }> = {
  speed:      { label: "Speed",      color: "bg-blue-50 text-blue-700",   Icon: Zap      },
  accuracy:   { label: "Accuracy",   color: "bg-teal-50 text-teal-700",   Icon: Target   },
  labor:      { label: "Labor",      color: "bg-purple-50 text-purple-700",Icon: Users    },
  safety:     { label: "Safety",     color: "bg-orange-50 text-orange-700",Icon: Shield   },
  compliance: { label: "Compliance", color: "bg-indigo-50 text-indigo-700",Icon: CheckCircle2 },
};

const PILOT_STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active:    { label: "Active",    color: "text-green-600",  icon: CheckCircle2 },
  at_risk:   { label: "At Risk",   color: "text-amber-600",  icon: AlertCircle  },
  converted: { label: "Converted", color: "text-brand-600",  icon: TrendingUp   },
  lost:      { label: "Lost",      color: "text-gray-400",   icon: Clock        },
};

const WORKSHOP_STATUS_META: Record<string, { label: string; color: string }> = {
  planned:          { label: "Planned",          color: "bg-gray-100 text-gray-600"    },
  in_progress:      { label: "In Progress",      color: "bg-blue-100 text-blue-700"    },
  completed:        { label: "Completed",         color: "bg-green-100 text-green-700"  },
  report_generated: { label: "Report Generated", color: "bg-brand-100 text-brand-700"  },
};

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

// ── Stat tile ──────────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  sub,
  Icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  Icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

// ── ROI card ───────────────────────────────────────────────────────────────

function ROICard({ roi, workflowName }: { roi: WorkflowROIData; workflowName: string }) {
  const [expanded, setExpanded] = useState(false);

  const categoryCounts = roi.metrics.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] ?? 0) + 1;
    return acc;
  }, {} as Record<ROICategory, number>);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{roi.workflowId}</p>
            <h3 className="text-sm font-semibold text-gray-900 leading-snug">{workflowName}</h3>
          </div>
          <Link
            href={`/workflows/${roi.workflowId}`}
            className="text-xs text-brand-600 hover:underline flex-shrink-0"
          >
            View →
          </Link>
        </div>

        <p className="text-sm text-gray-600 mb-4 leading-snug">{roi.headline}</p>

        <div className="flex gap-2 flex-wrap mb-4">
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg">
            <DollarSign size={10} /> {roi.annualValue}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-lg">
            <TrendingUp size={10} /> {roi.roiMultiple}
          </span>
        </div>

        {/* Category dots */}
        <div className="flex gap-1.5 flex-wrap">
          {(Object.entries(categoryCounts) as [ROICategory, number][]).map(([cat, n]) => {
            const meta = CATEGORY_META[cat];
            return (
              <span key={cat} className={`text-xs px-2 py-0.5 rounded-full ${meta.color}`}>
                {meta.label} ×{n}
              </span>
            );
          })}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <span>{roi.metrics.length} metrics</span>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {/* Metrics table */}
      {expanded && (
        <div className="border-t border-gray-100">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Metric</th>
                <th className="text-left px-3 py-2 text-gray-500 font-medium">Before</th>
                <th className="text-left px-3 py-2 text-gray-500 font-medium">After</th>
                <th className="text-left px-3 py-2 text-gray-500 font-medium">Improvement</th>
              </tr>
            </thead>
            <tbody>
              {roi.metrics.map((m, i) => {
                const meta = CATEGORY_META[m.category];
                return (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-start gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${meta.color}`}>
                          {meta.label[0]}
                        </span>
                        <span className="text-gray-700 leading-snug">{m.label}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">{m.before}</td>
                    <td className="px-3 py-2.5 text-gray-800 font-medium">{m.after}</td>
                    <td className="px-3 py-2.5 text-green-700 font-medium">{m.improvement}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">{roi.narrative}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ROI tab ────────────────────────────────────────────────────────────────

function ROITab({ workflowNames }: { workflowNames: Record<string, string> }) {
  const allMetrics = WORKFLOW_ROI.flatMap((r) => r.metrics);
  const categoryCounts = allMetrics.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] ?? 0) + 1;
    return acc;
  }, {} as Record<ROICategory, number>);

  const maxCategoryCount = Math.max(...Object.values(categoryCounts));

  return (
    <div className="space-y-6">
      {/* ROI overview strip */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{WORKFLOW_ROI.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Workflows with ROI data</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{allMetrics.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Quantified metrics</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">$75K – $2M+</p>
          <p className="text-xs text-gray-500 mt-0.5">Annual value per workflow</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-brand-700">4 – 20×</p>
          <p className="text-xs text-gray-500 mt-0.5">Typical ROI range</p>
        </div>
      </div>

      {/* Category distribution */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Metric Categories Across All Workflows</h3>
        <div className="space-y-2.5">
          {(Object.entries(CATEGORY_META) as [ROICategory, typeof CATEGORY_META[ROICategory]][]).map(([cat, meta]) => {
            const count = categoryCounts[cat] ?? 0;
            const pct = Math.round((count / maxCategoryCount) * 100);
            return (
              <div key={cat} className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 w-28 flex-shrink-0 text-xs font-medium px-2 py-1 rounded-lg ${meta.color}`}>
                  <meta.Icon size={11} />
                  {meta.label}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gray-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROI cards grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Workflow ROI Models</h3>
        <div className="grid grid-cols-1 gap-4">
          {WORKFLOW_ROI.map((roi) => (
            <ROICard
              key={roi.workflowId}
              roi={roi}
              workflowName={workflowNames[roi.workflowId] ?? roi.workflowId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Operational Metrics tab ────────────────────────────────────────────────

function OpsTab({
  pipelineByStage,
  totalActiveTCV,
  totalActiveDeals,
  totalClosedWonTCV,
  totalClosedWon,
  accountsByVertical,
  totalAccounts,
  pilotsByStatus,
  workshopsByStatus,
  totalWorkflows,
  workflowsByVertical,
}: Omit<Props, "workflowNames">) {
  const maxStageCount = Math.max(...pipelineByStage.map((s) => s.count), 1);
  const maxVerticalCount = Math.max(...accountsByVertical.map((v) => v.count), 1);
  const maxWfVerticalCount = Math.max(...workflowsByVertical.map((v) => v.count), 1);

  return (
    <div className="space-y-6">

      {/* Pipeline section */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-800">Pipeline Funnel</h3>
          <Link href="/pipeline" className="text-xs text-brand-600 hover:underline">Open Pipeline →</Link>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{totalActiveDeals}</p>
            <p className="text-xs text-gray-500">Active Deals</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalActiveTCV)}</p>
            <p className="text-xs text-gray-500">Active TCV</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-700">{formatCurrency(totalClosedWonTCV)}</p>
            <p className="text-xs text-gray-500">Closed Won ({totalClosedWon})</p>
          </div>
        </div>

        <div className="space-y-2">
          {pipelineByStage.map((s) => {
            const pct = Math.round((s.count / maxStageCount) * 100);
            return (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 flex-shrink-0">{STAGE_LABELS[s.stage]}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-brand-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-6 text-right">{s.count}</span>
                {s.tcv > 0 && (
                  <span className="text-xs text-gray-400 w-16 text-right">{formatCurrency(s.tcv)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Accounts + Workflow Library side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Accounts by vertical */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Accounts by Vertical</h3>
            <Link href="/accounts" className="text-xs text-brand-600 hover:underline">View All →</Link>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-3">{totalAccounts}</p>
          <div className="space-y-2">
            {accountsByVertical.map((v) => {
              const pct = Math.round((v.count / maxVerticalCount) * 100);
              return (
                <div key={v.vertical} className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 w-24 text-center ${VERTICAL_COLORS[v.vertical] ?? "bg-gray-100 text-gray-600"}`}>
                    {VERTICAL_LABELS[v.vertical] ?? v.vertical}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-brand-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-5 text-right">{v.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow Library */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Workflow Library</h3>
            <Link href="/workflows" className="text-xs text-brand-600 hover:underline">View All →</Link>
          </div>
          <div className="flex gap-4 mb-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalWorkflows}</p>
              <p className="text-xs text-gray-500">Total workflows</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{WORKFLOW_ROI.length}</p>
              <p className="text-xs text-gray-500">With ROI models</p>
            </div>
          </div>
          <div className="space-y-2">
            {workflowsByVertical.map((v) => {
              const pct = Math.round((v.count / maxWfVerticalCount) * 100);
              return (
                <div key={v.vertical} className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 w-24 text-center ${VERTICAL_COLORS[v.vertical] ?? "bg-gray-100 text-gray-600"}`}>
                    {VERTICAL_LABELS[v.vertical] ?? v.vertical}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-teal-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-5 text-right">{v.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pilots + Workshops + Roles side by side */}
      <div className="grid grid-cols-3 gap-4">
        {/* Pilots */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Pilots</h3>
            <Link href="/pilots" className="text-xs text-brand-600 hover:underline">View →</Link>
          </div>
          {pilotsByStatus.length === 0 ? (
            <p className="text-sm text-gray-400">No pilot data yet</p>
          ) : (
            <div className="space-y-2.5">
              {pilotsByStatus.map((p) => {
                const meta = PILOT_STATUS_META[p.status] ?? { label: p.status, color: "text-gray-500", icon: Clock };
                const Icon = meta.icon;
                return (
                  <div key={p.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={13} className={meta.color} />
                      <span className="text-sm text-gray-700">{meta.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{p.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Workshops */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Workshops</h3>
          {workshopsByStatus.length === 0 ? (
            <p className="text-sm text-gray-400">No workshop data yet</p>
          ) : (
            <div className="space-y-2">
              {workshopsByStatus.map((w) => {
                const meta = WORKSHOP_STATUS_META[w.status] ?? { label: w.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <div key={w.status} className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                    <span className="text-sm font-bold text-gray-900">{w.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Roles & Personas */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Knowledge Base</h3>
            <Link href="/settings" className="text-xs text-brand-600 hover:underline">View →</Link>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Canonical Roles</span>
              <span className="text-sm font-bold text-gray-900">{ROLES.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ROI Models</span>
              <span className="text-sm font-bold text-gray-900">{WORKFLOW_ROI.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Workflows (Library)</span>
              <span className="text-sm font-bold text-gray-900">{totalWorkflows}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Summary Report tab ─────────────────────────────────────────────────────

function SummaryTab({
  totalActiveTCV,
  totalActiveDeals,
  totalClosedWonTCV,
  totalClosedWon,
  totalAccounts,
  totalWorkflows,
  pilotsByStatus,
  workshopsByStatus,
  pipelineByStage,
  accountsByVertical,
}: Omit<Props, "workflowNames" | "workflowsByVertical">) {
  const activePilots = pilotsByStatus.find((p) => p.status === "active")?.count ?? 0;
  const convertedPilots = pilotsByStatus.find((p) => p.status === "converted")?.count ?? 0;
  const completedWorkshops = workshopsByStatus.find((w) => w.status === "completed")?.count ?? 0;
  const topVertical = accountsByVertical[0];
  const deepestStage = [...pipelineByStage].reverse().find((s) => s.count > 0);

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-5">
      {/* Report header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-brand-200 text-xs font-semibold uppercase tracking-widest mb-1">VAI™ Buddy</p>
            <h2 className="text-xl font-bold mb-1">Platform Metrics Summary</h2>
            <p className="text-brand-200 text-sm">Generated {today}</p>
          </div>
          <FileBarChart size={32} className="text-brand-300 flex-shrink-0" />
        </div>
      </div>

      {/* Executive snapshot */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Executive Snapshot</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Active Pipeline TCV",   value: formatCurrency(totalActiveTCV),    color: "text-brand-700" },
            { label: "Total Active Deals",    value: String(totalActiveDeals),           color: "text-gray-900"  },
            { label: "Closed Won Revenue",    value: formatCurrency(totalClosedWonTCV),  color: "text-green-700" },
            { label: "Deals Closed Won",      value: String(totalClosedWon),             color: "text-green-700" },
            { label: "Total Accounts",        value: String(totalAccounts),              color: "text-gray-900"  },
            { label: "Active Pilots",         value: String(activePilots),               color: "text-gray-900"  },
            { label: "Pilots Converted",      value: String(convertedPilots),            color: "text-green-700" },
            { label: "Workshops Completed",   value: String(completedWorkshops),         color: "text-gray-900"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">{label}</span>
              <span className={`text-sm font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline health */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Pipeline Health</h3>
        <div className="space-y-1 text-sm text-gray-600 leading-relaxed">
          <p>
            There are currently <strong className="text-gray-900">{totalActiveDeals} active opportunities</strong> across
            6 pipeline stages, with a total contract value of{" "}
            <strong className="text-brand-700">{formatCurrency(totalActiveTCV)}</strong>.
          </p>
          {deepestStage && deepestStage.count > 0 && (
            <p>
              The deepest active stage is{" "}
              <strong className="text-gray-900">{STAGE_LABELS[deepestStage.stage]}</strong> with{" "}
              {deepestStage.count} deal{deepestStage.count !== 1 ? "s" : ""}{deepestStage.tcv > 0 ? ` (${formatCurrency(deepestStage.tcv)})` : ""}.
            </p>
          )}
          {topVertical && (
            <p>
              Top account vertical is{" "}
              <strong className="text-gray-900">{VERTICAL_LABELS[topVertical.vertical] ?? topVertical.vertical}</strong> with{" "}
              {topVertical.count} account{topVertical.count !== 1 ? "s" : ""}.
            </p>
          )}
        </div>
      </div>

      {/* Workflow portfolio */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Workflow Portfolio</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          The VAI™ workflow library contains{" "}
          <strong className="text-gray-900">{totalWorkflows} AI/CV workflows</strong>, of which{" "}
          <strong className="text-green-700">{WORKFLOW_ROI.length} have full ROI models</strong> with quantified
          before/after metrics. Workflows span 5 verticals: Transit, Emergency, Smart City, Utilities, and Traffic.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          ROI models cover{" "}
          {WORKFLOW_ROI.flatMap((r) => r.metrics).length} quantified metrics across 5 performance categories:
          speed, accuracy, labor, safety, and compliance. Annual value per workflow ranges from{" "}
          <strong className="text-gray-900">$75K to $2M+</strong> with typical ROI multiples of 4–20×.
        </p>
      </div>

      {/* Top ROI opportunities */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Top ROI Highlights</h3>
        <div className="space-y-3">
          {[
            { id: "WF-14-TRAFQ",  name: "Traffic Queue Detection",        value: "$200K – $500K+", mult: "8 – 15×" },
            { id: "WF-04-GUNSHOT",name: "Shots Fired Response",            value: "$500K – $2M",    mult: "10 – 20×" },
            { id: "WF-24-STVEH",  name: "Stolen Vehicle / LPR Hot Plate", value: "$500K – $1.5M",  mult: "8 – 15×" },
            { id: "WF-19-TRAFINC",name: "TIM Lifecycle",                   value: "$500K – $2M",    mult: "10 – 20×" },
          ].map(({ id, name, value, mult }) => (
            <div key={id} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400">{id}</span>
                  <span className="text-sm font-medium text-gray-800">{name}</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">{value}</span>
              <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">{mult}</span>
              <Link href={`/workflows/${id}`} className="text-xs text-gray-400 hover:text-brand-600">→</Link>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended actions */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-amber-900 mb-3">Recommended Focus Areas</h3>
        <ul className="space-y-2 text-sm text-amber-800">
          {totalActiveDeals === 0 && (
            <li>• Import deals from Dynamics 365 to populate the pipeline.</li>
          )}
          {totalClosedWon === 0 && totalActiveDeals > 0 && (
            <li>• Push the {deepestStage?.count ?? 0} deal(s) in {deepestStage ? STAGE_LABELS[deepestStage.stage] : "advanced stages"} toward close.</li>
          )}
          {activePilots > 0 && (
            <li>• {activePilots} active pilot{activePilots !== 1 ? "s" : ""} in progress — track milestones to accelerate conversion.</li>
          )}
          <li>• {WORKFLOW_ROI.length} workflows have ROI models — use them in workshops to drive value conversations.</li>
          <li>• {totalWorkflows - WORKFLOW_ROI.length} workflows still need ROI models — consider adding them for discovery calls.</li>
        </ul>
      </div>
    </div>
  );
}

// ── Main KPIClient ─────────────────────────────────────────────────────────

type Tab = "roi" | "ops" | "summary";

export function KPIClient(props: Props) {
  const [tab, setTab] = useState<Tab>("roi");

  const activePilots = props.pilotsByStatus.find((p) => p.status === "active")?.count ?? 0;

  return (
    <div className="max-w-4xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">KPI & Metrics</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Pipeline health, workflow ROI, and operational performance across the VAI™ platform.
        </p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatTile
          label="Active Pipeline TCV"
          value={formatCurrency(props.totalActiveTCV)}
          sub={`${props.totalActiveDeals} deals`}
          Icon={DollarSign}
          color="bg-brand-50 text-brand-600"
        />
        <StatTile
          label="Workflow Library"
          value={String(props.totalWorkflows)}
          sub={`${WORKFLOW_ROI.length} with ROI models`}
          Icon={Network}
          color="bg-teal-50 text-teal-600"
        />
        <StatTile
          label="Active Pilots"
          value={String(activePilots)}
          sub={`${props.pilotsByStatus.find(p=>p.status==="converted")?.count ?? 0} converted`}
          Icon={Activity}
          color="bg-green-50 text-green-600"
        />
        <StatTile
          label="Total Accounts"
          value={String(props.totalAccounts)}
          sub={`${props.accountsByVertical.length} verticals`}
          Icon={Building2}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
        {([
          { key: "roi",     label: "ROI Models",          Icon: TrendingUp  },
          { key: "ops",     label: "Operational Metrics", Icon: BarChart2   },
          { key: "summary", label: "Summary Report",      Icon: FileBarChart },
        ] as { key: Tab; label: string; Icon: React.ElementType }[]).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "roi" && <ROITab workflowNames={props.workflowNames} />}
      {tab === "ops" && <OpsTab {...props} />}
      {tab === "summary" && <SummaryTab {...props} />}
    </div>
  );
}
