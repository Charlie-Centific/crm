"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Lock,
  Layers,
  Shield,
  Truck,
  Car,
  Video,
  Radio,
  Factory,
  CheckCircle2,
  ExternalLink,
  Info,
} from "lucide-react";
import { MODULES, OPERATIONAL_MODULES, PLATFORM_MODULE, type VisionAIModule } from "@/lib/modules-data";
import { WORKFLOW_ROI } from "@/lib/workflow-static-data";
import type { Workflow } from "@/lib/workflows";

// ── Module icon map ────────────────────────────────────────────────────────

const MODULE_ICONS: Record<string, React.ElementType> = {
  "MOD-00-ADMIN":      Layers,
  "MOD-01-VIDEO":      Video,
  "MOD-02-DISPATCH":   Radio,
  "MOD-03-TRAFFIC":    Car,
  "MOD-04-SAFETY":     Shield,
  "MOD-05-COMPLIANCE": CheckCircle2,
  "MOD-06-INDUSTRIAL": Factory,
};

const MODULE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "MOD-00-ADMIN":      { bg: "bg-gray-900",    text: "text-white",        border: "border-gray-700",   dot: "bg-white"       },
  "MOD-01-VIDEO":      { bg: "bg-blue-600",    text: "text-white",        border: "border-blue-500",   dot: "bg-blue-200"    },
  "MOD-02-DISPATCH":   { bg: "bg-red-600",     text: "text-white",        border: "border-red-500",    dot: "bg-red-200"     },
  "MOD-03-TRAFFIC":    { bg: "bg-amber-500",   text: "text-white",        border: "border-amber-400",  dot: "bg-amber-200"   },
  "MOD-04-SAFETY":     { bg: "bg-orange-600",  text: "text-white",        border: "border-orange-500", dot: "bg-orange-200"  },
  "MOD-05-COMPLIANCE": { bg: "bg-teal-600",    text: "text-white",        border: "border-teal-500",   dot: "bg-teal-200"    },
  "MOD-06-INDUSTRIAL": { bg: "bg-purple-600",  text: "text-white",        border: "border-purple-500", dot: "bg-purple-200"  },
};

const MODULE_LIGHT: Record<string, { bg: string; text: string; border: string }> = {
  "MOD-00-ADMIN":      { bg: "bg-gray-50",     text: "text-gray-700",     border: "border-gray-200"    },
  "MOD-01-VIDEO":      { bg: "bg-blue-50",     text: "text-blue-700",     border: "border-blue-200"    },
  "MOD-02-DISPATCH":   { bg: "bg-red-50",      text: "text-red-700",      border: "border-red-200"     },
  "MOD-03-TRAFFIC":    { bg: "bg-amber-50",    text: "text-amber-700",    border: "border-amber-200"   },
  "MOD-04-SAFETY":     { bg: "bg-orange-50",   text: "text-orange-700",   border: "border-orange-200"  },
  "MOD-05-COMPLIANCE": { bg: "bg-teal-50",     text: "text-teal-700",     border: "border-teal-200"    },
  "MOD-06-INDUSTRIAL": { bg: "bg-purple-50",   text: "text-purple-700",   border: "border-purple-200"  },
};

// ── Add workflow modal ─────────────────────────────────────────────────────

function AddWorkflowModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed to create workflow");
      }
      const { workflow } = await res.json();
      onCreated(workflow.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">New Custom Workflow</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Parking Lot Overflow Detection"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of what this workflow does..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? "Creating…" : "Create Workflow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Module card (grid view) ────────────────────────────────────────────────

function ModuleCard({
  mod,
  dbWorkflows,
  onClick,
}: {
  mod: VisionAIModule;
  dbWorkflows: Workflow[];
  onClick: () => void;
}) {
  const colors = MODULE_COLORS[mod.id];
  const Icon = MODULE_ICONS[mod.id] ?? Layers;
  const dbIds = new Set(dbWorkflows.map((w) => w.id));
  const inDbCount = mod.workflows.filter((w) => dbIds.has(w.id)).length;
  const roiCount = mod.workflows.filter((w) => WORKFLOW_ROI.find((r) => r.workflowId === w.id)).length;

  if (mod.tier === "platform") {
    return (
      <button
        onClick={onClick}
        className="w-full text-left bg-gray-900 rounded-2xl p-6 hover:bg-gray-800 transition-all group border border-gray-700"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mod.id}</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Mandatory
                </span>
                <span className="text-[10px] text-green-400 font-semibold">Bundled</span>
              </div>
              <h3 className="text-base font-bold text-white">{mod.title}</h3>
            </div>
          </div>
          <ArrowRight size={16} className="text-gray-500 group-hover:text-gray-300 mt-1 flex-shrink-0 transition-colors" />
        </div>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{mod.summary}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{mod.workflowCount} workflows</span>
          <span className="w-px h-3 bg-gray-700" />
          <span className="flex items-center gap-1"><Lock size={10} /> Included in every deployment</span>
        </div>
      </button>
    );
  }

  const light = MODULE_LIGHT[mod.id];
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${light.bg}`}>
            <Icon size={18} className={light.text} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{mod.id}</p>
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors leading-snug">
              {mod.title}
            </h3>
          </div>
        </div>
        <ArrowRight size={14} className="text-gray-300 group-hover:text-brand-400 flex-shrink-0 mt-1 transition-colors" />
      </div>

      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{mod.summary}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs text-gray-400">
          <span>{mod.workflowCount} workflows</span>
          {roiCount > 0 && <span className="text-green-600">{roiCount} ROI models</span>}
          {inDbCount < mod.workflowCount && (
            <span className="text-gray-300">{inDbCount} in library</span>
          )}
        </div>
        {mod.verticals && (
          <div className="flex gap-1">
            {mod.verticals.slice(0, 2).map((v) => (
              <span key={v} className={`text-[10px] px-1.5 py-0.5 rounded ${light.bg} ${light.text}`}>
                {v}
              </span>
            ))}
            {(mod.verticals.length ?? 0) > 2 && (
              <span className="text-[10px] text-gray-400">+{mod.verticals.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

// ── Module detail view ─────────────────────────────────────────────────────

function ModuleDetail({
  mod,
  dbWorkflows,
  onBack,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onAddWorkflow,
}: {
  mod: VisionAIModule;
  dbWorkflows: Workflow[];
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onAddWorkflow: () => void;
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"workflows" | "details">("workflows");
  const Icon = MODULE_ICONS[mod.id] ?? Layers;
  const colors = MODULE_COLORS[mod.id];
  const light = MODULE_LIGHT[mod.id];
  const dbIds = new Set(dbWorkflows.map((w) => w.id));

  const filteredWorkflows = useMemo(() => {
    if (!search.trim()) return mod.workflows;
    const q = search.toLowerCase();
    return mod.workflows.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q)
    );
  }, [mod.workflows, search]);

  const roiIds = new Set(WORKFLOW_ROI.map((r) => r.workflowId));

  return (
    <div>
      {/* Back nav */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={16} />
          All Modules
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Module hero */}
      <div className={`${colors.bg} rounded-2xl p-6 mb-5`}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Icon size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{mod.id}</span>
                {mod.mandatory && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/15 px-2 py-0.5 rounded-full uppercase">
                    Mandatory
                  </span>
                )}
                {mod.pricing === "bundled" ? (
                  <span className="text-[10px] text-green-400 font-semibold bg-green-400/10 px-2 py-0.5 rounded-full">Bundled</span>
                ) : (
                  <span className="text-[10px] text-white/60 font-semibold bg-white/10 px-2 py-0.5 rounded-full">Per Module</span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white">{mod.title}</h2>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-white">{mod.workflowCount}</p>
            <p className="text-xs text-white/50">workflows</p>
          </div>
        </div>

        <p className="text-sm text-white/75 leading-relaxed mb-4">{mod.summary}</p>

        {mod.verticals && (
          <div className="flex gap-2 flex-wrap">
            {mod.verticals.map((v) => (
              <span key={v} className="text-xs text-white/70 bg-white/10 px-2.5 py-1 rounded-full capitalize">
                {v.replace("-", " ")}
              </span>
            ))}
          </div>
        )}

        {mod.pricingNote && (
          <p className="mt-3 text-xs text-white/50 flex items-center gap-1.5">
            <Lock size={10} /> {mod.pricingNote}
          </p>
        )}
      </div>

      {/* Note banner (Industrial module) */}
      {mod.note && (
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-xs text-amber-800">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <p>{mod.note}</p>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5 w-fit">
        {[
          { key: "workflows", label: `Workflows (${mod.workflowCount})` },
          { key: "details",   label: "Module Details" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Workflows tab */}
      {activeTab === "workflows" && (
        <div>
          {/* Search */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${mod.title} workflows…`}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            {search && (
              <span className="text-xs text-gray-400">{filteredWorkflows.length} results</span>
            )}
          </div>

          <div className="space-y-2">
            {filteredWorkflows.map((wf) => {
              const inDb = dbIds.has(wf.id);
              const hasRoi = roiIds.has(wf.id);
              const dbWf = dbWorkflows.find((w) => w.id === wf.id);

              return (
                <div key={wf.id}>
                  {inDb ? (
                    <Link href={`/workflows/${wf.id}`} className="group block">
                      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-start gap-4 hover:border-brand-300 hover:shadow-sm transition-all">
                        <div className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center mt-0.5 ${light.bg}`}>
                          <Icon size={15} className={light.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono text-gray-400">{wf.id}</span>
                            {hasRoi && (
                              <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">ROI</span>
                            )}
                            {wf.note && (
                              <span className="text-[10px] text-gray-400 italic">{wf.note}</span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors leading-snug">
                            {wf.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{wf.description}</p>
                          {wf.consolidatedFrom && wf.consolidatedFrom.length > 1 && (
                            <p className="text-[10px] text-gray-300 mt-1">
                              Consolidates: {wf.consolidatedFrom.join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <ArrowRight size={14} className="text-gray-300 group-hover:text-brand-400 transition-colors" />
                          {dbWf?.useCases && dbWf.useCases.length > 0 && (
                            <span className="text-[10px] text-gray-400">{dbWf.useCases.length} use cases</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl px-5 py-4 flex items-start gap-4 opacity-60">
                      <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center mt-0.5">
                        <Icon size={15} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono text-gray-400">{wf.id}</span>
                          <span className="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">Coming soon</span>
                          {wf.note && (
                            <span className="text-[10px] text-gray-400 italic">{wf.note}</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-500 leading-snug">{wf.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{wf.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredWorkflows.length === 0 && (
            <div className="text-center py-10 text-sm text-gray-400">
              No workflows match "{search}"
            </div>
          )}
        </div>
      )}

      {/* Details tab */}
      {activeTab === "details" && (
        <div className="space-y-4">
          {/* Workflow summary table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-700">Workflow Index</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">ID</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Name</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Consolidated From</th>
                </tr>
              </thead>
              <tbody>
                {mod.workflows.map((wf) => {
                  const inDb = dbIds.has(wf.id);
                  const hasRoi = roiIds.has(wf.id);
                  return (
                    <tr key={wf.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{wf.id}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-800">{wf.name}</span>
                          {hasRoi && (
                            <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">ROI</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {inDb ? (
                          <Link href={`/workflows/${wf.id}`} className="flex items-center gap-1 text-xs text-brand-600 hover:underline">
                            In Library <ExternalLink size={10} />
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">Coming soon</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-400">
                        {wf.consolidatedFrom && wf.consolidatedFrom.length > 1
                          ? wf.consolidatedFrom.join(", ")
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ROI summary if this module has ROI data */}
          {mod.workflows.some((w) => roiIds.has(w.id)) && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">ROI Coverage</h4>
              <div className="space-y-2">
                {mod.workflows
                  .filter((w) => roiIds.has(w.id))
                  .map((w) => {
                    const roi = WORKFLOW_ROI.find((r) => r.workflowId === w.id)!;
                    return (
                      <div key={w.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <span className="text-xs text-gray-500 font-mono mr-2">{w.id}</span>
                          <span className="text-sm text-gray-700">{w.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">{roi.annualValue}</span>
                          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">{roi.roiMultiple}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <Link href="/kpi" className="mt-3 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">
                View full ROI models in KPI <ArrowRight size={11} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Module grid (entry view) ───────────────────────────────────────────────

function ModuleGrid({
  dbWorkflows,
  onSelect,
  onAddWorkflow,
}: {
  dbWorkflows: Workflow[];
  onSelect: (mod: VisionAIModule) => void;
  onAddWorkflow: () => void;
}) {
  return (
    <div>
      {/* Platform module — full width */}
      <div className="mb-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Platform Layer</p>
        <ModuleCard mod={PLATFORM_MODULE} dbWorkflows={dbWorkflows} onClick={() => onSelect(PLATFORM_MODULE)} />
      </div>

      {/* Operational modules — 2×3 grid */}
      <div className="mb-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Operational Modules</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {OPERATIONAL_MODULES.map((mod) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              dbWorkflows={dbWorkflows}
              onClick={() => onSelect(mod)}
            />
          ))}
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-xs text-gray-500">
        <span>
          {MODULES.length} modules · {MODULES.reduce((s, m) => s + m.workflowCount, 0)} total workflows · {WORKFLOW_ROI.length} with ROI models
        </span>
        <button
          onClick={onAddWorkflow}
          className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 font-medium"
        >
          <Plus size={12} /> Add custom workflow
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface Props {
  workflows: Workflow[];
  allVerticals: string[];
  allThreats: string[];
}

export function WorkflowsClient({ workflows }: Props) {
  const router = useRouter();
  const [selectedModule, setSelectedModule] = useState<VisionAIModule | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  const allModules = MODULES;

  const selectedIndex = selectedModule ? allModules.findIndex((m) => m.id === selectedModule.id) : -1;
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < allModules.length - 1 && selectedIndex !== -1;

  const globalResults = useMemo(() => {
    if (!globalSearch.trim()) return [];
    const q = globalSearch.toLowerCase();
    return allModules.flatMap((mod) =>
      mod.workflows
        .filter((w) => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q))
        .map((w) => ({ ...w, module: mod }))
    );
  }, [globalSearch, allModules]);

  function handleCreated(id: string) {
    setShowAdd(false);
    router.push(`/workflows/${id}`);
  }

  return (
    <div>
      {showAdd && <AddWorkflowModal onClose={() => setShowAdd(false)} onCreated={handleCreated} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedModule ? selectedModule.title : "VisionAI™ Modules"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {selectedModule
              ? `Module ${selectedModule.number} of ${allModules.length - 1} · ${selectedModule.workflowCount} workflows`
              : `${allModules.length} modules · ${allModules.reduce((s, m) => s + m.workflowCount, 0)} workflows`}
          </p>
        </div>

        {!selectedModule && (
          <button
            onClick={() => setShowGlobalSearch((v) => !v)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
              showGlobalSearch
                ? "bg-brand-50 text-brand-700 border-brand-300"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Search size={14} />
            Search All
          </button>
        )}
      </div>

      {/* Global search panel */}
      {showGlobalSearch && !selectedModule && (
        <div className="mb-5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              type="search"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search across all modules and workflows…"
              className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          {globalSearch.trim() && (
            <div className="mt-3 space-y-2">
              {globalResults.length === 0 ? (
                <p className="text-sm text-gray-400 px-1">No workflows match "{globalSearch}"</p>
              ) : (
                <>
                  <p className="text-xs text-gray-400 px-1">{globalResults.length} result{globalResults.length !== 1 ? "s" : ""}</p>
                  {globalResults.map((wf) => {
                    const inDb = workflows.some((w) => w.id === wf.id);
                    const light = MODULE_LIGHT[wf.module.id];
                    const Icon = MODULE_ICONS[wf.module.id] ?? Layers;
                    return (
                      <div key={`${wf.module.id}-${wf.id}`} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${light.bg}`}>
                          <Icon size={13} className={light.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono text-gray-400">{wf.id}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${light.bg} ${light.text}`}>
                              {wf.module.title}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800">{wf.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{wf.description}</p>
                        </div>
                        {inDb ? (
                          <Link href={`/workflows/${wf.id}`} className="text-xs text-brand-600 hover:underline flex-shrink-0">
                            View →
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-300 flex-shrink-0">Coming soon</span>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {selectedModule ? (
        <ModuleDetail
          mod={selectedModule}
          dbWorkflows={workflows}
          onBack={() => setSelectedModule(null)}
          onPrev={() => hasPrev && setSelectedModule(allModules[selectedIndex - 1])}
          onNext={() => hasNext && setSelectedModule(allModules[selectedIndex + 1])}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onAddWorkflow={() => setShowAdd(true)}
        />
      ) : (
        <ModuleGrid
          dbWorkflows={workflows}
          onSelect={setSelectedModule}
          onAddWorkflow={() => setShowAdd(true)}
        />
      )}
    </div>
  );
}
