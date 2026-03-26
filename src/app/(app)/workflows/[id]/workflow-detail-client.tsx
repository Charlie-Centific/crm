"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Workflow } from "@/lib/workflows";
import { VERTICAL_TAGS, THREAT_TAGS, TagIcon, getTagDef } from "@/lib/tag-icons";
import { getDiagramData, getROIData, getSwimlaneWebp, getPersonaData, getDataSourceData, getMatrixData } from "@/lib/workflow-static-data";
import type { DiagramStep, DiagramRow, ROICategory, Persona, DataSource, DataSourceType, RBACLevel, CJISLevel } from "@/lib/workflow-static-data";

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "details" | "diagram" | "roi" | "personas" | "sources" | "matrix";

interface EditState {
  name: string;
  description: string;
  audience: string;
  users: string;
  useCases: string[];
  verticalTags: string[];
  threatTags: string[];
}

function workflowToEdit(w: Workflow): EditState {
  return {
    name: w.name,
    description: w.description ?? "",
    audience: w.audience ?? "",
    users: w.users ?? "",
    useCases: [...w.useCases],
    verticalTags: [...w.verticalTags],
    threatTags: [...w.threatTags],
  };
}

// ── Tag helpers ───────────────────────────────────────────────────────────────

function TagToggleGroup({
  title, allTags, selected, onChange,
}: {
  title: string;
  allTags: { id: string; label: string }[];
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  function toggle(id: string) {
    if (selected.includes(id)) onChange(selected.filter((t) => t !== id));
    else onChange([...selected, id]);
  }
  return (
    <div>
      <div className="text-xs font-medium text-gray-500 mb-2">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {allTags.map(({ id, label }) => {
          const on = selected.includes(id);
          return (
            <button key={id} type="button" onClick={() => toggle(id)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                on ? "bg-brand-600 border-brand-600 text-white font-medium"
                   : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white hover:bg-gray-50"
              }`}
            >
              <TagIcon tag={id} size={11} className={on ? "text-white" : "text-gray-400"} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function UseCasesEditor({ useCases, onChange }: { useCases: string[]; onChange: (uc: string[]) => void }) {
  function update(i: number, val: string) { const next = [...useCases]; next[i] = val; onChange(next); }
  function remove(i: number) { onChange(useCases.filter((_, idx) => idx !== i)); }
  function add() { onChange([...useCases, ""]); }
  return (
    <div className="space-y-2">
      {useCases.map((uc, i) => (
        <div key={i} className="flex gap-2">
          <input value={uc} onChange={(e) => update(i, e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Use case description…"
          />
          <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 px-1 text-sm">✕</button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs text-brand-600 hover:underline">+ Add use case</button>
    </div>
  );
}

function TagPill({ id }: { id: string }) {
  const def = getTagDef(id);
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
      <TagIcon tag={id} size={11} className="text-gray-400" />
      {def?.label ?? id}
    </span>
  );
}

// ── Diagram renderer ──────────────────────────────────────────────────────────

const STEP_STYLES: Record<string, { bg: string; border: string; text: string; badge?: string }> = {
  trigger:   { bg: "bg-amber-50",   border: "border-amber-300",  text: "text-amber-900",  badge: "bg-amber-200 text-amber-800"   },
  process:   { bg: "bg-white",      border: "border-gray-200",   text: "text-gray-800"                                            },
  decision:  { bg: "bg-violet-50",  border: "border-violet-200", text: "text-violet-900", badge: "bg-violet-100 text-violet-700" },
  output:    { bg: "bg-emerald-50", border: "border-emerald-200",text: "text-emerald-900"                                         },
  broadcast: { bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-900"                                            },
  awareness: { bg: "bg-cyan-50",    border: "border-cyan-300",   text: "text-cyan-900",   badge: "bg-cyan-100 text-cyan-700"     },
};

function StepBox({ step }: { step: DiagramStep }) {
  const s = STEP_STYLES[step.type] ?? STEP_STYLES.process;
  const isAwareness = step.type === "awareness";
  return (
    <div className={`flex-1 rounded-xl border px-4 py-3 ${s.bg} ${s.border}`}>
      <div className="flex items-start justify-between gap-2 mb-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {isAwareness && (
            <span className="text-[9px] font-bold bg-cyan-200 text-cyan-800 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              AWARENESS
            </span>
          )}
          <p className={`text-xs font-semibold leading-snug ${s.text}`}>{step.label}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
          {step.abortOnFail && (
            <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              ABORT ON FAIL
            </span>
          )}
          {step.confidence && (
            <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              {step.confidence}
            </span>
          )}
          {step.timeout && (
            <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              {step.timeout}
            </span>
          )}
        </div>
      </div>
      {step.sublabel && (
        <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{step.sublabel}</p>
      )}
      {step.waitFor && (
        <div className="mt-2 flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider whitespace-nowrap flex-shrink-0 mt-px">
            ⏸ Continue when:
          </span>
          <span className="text-[9px] text-amber-800 leading-snug">{step.waitFor}</span>
        </div>
      )}
    </div>
  );
}

function DiagramConnector({ parallel }: { parallel?: boolean }) {
  if (parallel) {
    return (
      <div className="flex flex-col items-center py-0.5">
        <div className="w-0.5 h-3 bg-gray-200" />
        <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase bg-gray-100 px-2 py-0.5 rounded-full">
          parallel
        </div>
        <div className="w-0.5 h-3 bg-gray-200" />
      </div>
    );
  }
  return (
    <div className="flex justify-center py-0.5">
      <div className="flex flex-col items-center gap-0">
        <div className="w-0.5 h-4 bg-gray-200" />
        <svg viewBox="0 0 8 6" className="w-2 h-1.5 text-gray-300 fill-current">
          <path d="M0 0 L4 6 L8 0 Z" />
        </svg>
      </div>
    </div>
  );
}

function WorkflowDiagramView({ workflowId }: { workflowId: string }) {
  const data    = getDiagramData(workflowId);
  const webpSrc = getSwimlaneWebp(workflowId);

  // Swimlane image takes priority when available
  if (webpSrc) {
    return (
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Swimlane Diagram</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={webpSrc}
          alt={`${workflowId} swimlane diagram`}
          className="w-full rounded-xl border border-gray-100"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center text-gray-400">
        <p className="text-sm">No diagram available for this workflow.</p>
        <p className="text-xs mt-1">Diagrams are available for built-in VAI™ workflows (WF-13 – WF-20).</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { label: "Steps",       value: String(data.stepCount) },
          { label: "Confidence",  value: `${data.confidenceThreshold}% min` },
          { label: "SLA",         value: data.sla },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</span>
            <span className="text-xs font-semibold text-gray-700">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-2 flex-wrap mb-6">
        {(["trigger", "awareness", "process", "decision", "output", "broadcast"] as const).map((type) => {
          const s = STEP_STYLES[type];
          const labels: Record<string, string> = {
            trigger: "Trigger", awareness: "Awareness / Standby", process: "Process Step",
            decision: "Decision / Branch", output: "Output", broadcast: "Broadcast",
          };
          return (
            <span key={type} className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.border} ${s.text}`}>
              {labels[type]}
            </span>
          );
        })}
        <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-red-50 border-red-200 text-red-700">
          Abort on Fail
        </span>
      </div>

      {/* Flow */}
      <div className="max-w-2xl">
        {data.rows.map((row: DiagramRow, rowIdx: number) => {
          const isFirst   = rowIdx === 0;
          const prevRow   = rowIdx > 0 ? data.rows[rowIdx - 1] : null;
          const prevParallel = prevRow && prevRow.length > 1;
          const isParallel = row.length > 1;

          return (
            <div key={rowIdx}>
              {!isFirst && <DiagramConnector parallel={prevParallel && isParallel ? false : undefined} />}
              {isParallel ? (
                <div className="flex gap-3">
                  {row.map((step) => <StepBox key={step.id} step={step} />)}
                </div>
              ) : (
                <StepBox step={row[0]} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ROI view ──────────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<ROICategory, { bg: string; text: string; dot: string; label: string }> = {
  speed:      { bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-400",  label: "Speed"      },
  accuracy:   { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400",    label: "Accuracy"   },
  labor:      { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   label: "Labor"      },
  safety:     { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400",     label: "Safety"     },
  compliance: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", label: "Compliance" },
};

function WorkflowROIView({ workflowId }: { workflowId: string }) {
  const data = getROIData(workflowId);

  if (!data) {
    return (
      <div className="py-12 text-center text-gray-400">
        <p className="text-sm">No ROI data available for this workflow.</p>
        <p className="text-xs mt-1">ROI data is available for built-in VAI™ workflows (WF-13 – WF-20).</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-violet-700 p-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Estimated Impact</p>
        <p className="text-lg font-bold mb-1">{data.headline}</p>
        <div className="flex gap-6 mt-3">
          <div>
            <p className="text-[10px] opacity-60 uppercase tracking-wider">Annual Value</p>
            <p className="text-sm font-bold">{data.annualValue}</p>
          </div>
          <div>
            <p className="text-[10px] opacity-60 uppercase tracking-wider">ROI Multiple</p>
            <p className="text-sm font-bold">{data.roiMultiple}</p>
          </div>
        </div>
      </div>

      {/* Narrative */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Analysis</p>
        <p className="text-sm text-gray-700 leading-relaxed">{data.narrative}</p>
      </div>

      {/* Metric cards */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Before / After Metrics</p>
        <div className="space-y-3">
          {data.metrics.map((metric, i) => {
            const cat = CATEGORY_STYLES[metric.category];
            return (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cat.dot}`} />
                  <p className="text-xs font-semibold text-gray-800 flex-1">{metric.label}</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
                    {cat.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                  <div className="px-4 py-3">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Before</p>
                    <p className="text-xs text-gray-600 font-medium">{metric.before}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">With VAI™</p>
                    <p className="text-xs text-emerald-700 font-semibold">{metric.after}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Improvement</p>
                    <p className="text-xs font-bold text-brand-700">{metric.improvement}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Personas view ─────────────────────────────────────────────────────────────

const PERSONA_COLORS = [
  { bg: "bg-brand-600",   ring: "ring-brand-400",   chip: "bg-brand-50 border-brand-300 text-brand-700",   avatar: "bg-brand-600 text-white"   },
  { bg: "bg-violet-600",  ring: "ring-violet-400",  chip: "bg-violet-50 border-violet-300 text-violet-700", avatar: "bg-violet-600 text-white"  },
  { bg: "bg-emerald-600", ring: "ring-emerald-400", chip: "bg-emerald-50 border-emerald-300 text-emerald-700", avatar: "bg-emerald-600 text-white" },
  { bg: "bg-amber-500",   ring: "ring-amber-400",   chip: "bg-amber-50 border-amber-300 text-amber-700",   avatar: "bg-amber-500 text-white"   },
];

function WorkflowPersonasView({ workflowId }: { workflowId: string }) {
  const [selected, setSelected] = useState(0);
  const data = getPersonaData(workflowId);

  if (!data) {
    return (
      <div className="py-12 text-center text-gray-400">
        <p className="text-sm">No personas defined for this workflow.</p>
        <p className="text-xs mt-1">Personas are available for built-in VAI™ workflows.</p>
      </div>
    );
  }

  const persona = data.personas[selected];
  const color   = PERSONA_COLORS[selected % PERSONA_COLORS.length];

  return (
    <div className="space-y-5">
      {/* ── Scope overview: all personas ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          {data.personas.length} Personas in this workflow — select to explore
        </p>
        <div className="flex flex-wrap gap-2">
          {data.personas.map((p, i) => {
            const c = PERSONA_COLORS[i % PERSONA_COLORS.length];
            const isActive = i === selected;
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left ${
                  isActive
                    ? `${c.chip} ring-2 ${c.ring} shadow-sm`
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-white"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isActive ? c.avatar : "bg-gray-200 text-gray-500"
                }`}>
                  {p.initials}
                </div>
                <div>
                  <p className="text-xs font-semibold leading-snug">{p.role}</p>
                  <p className="text-[10px] opacity-60 leading-tight">{p.department}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Detail panel for selected persona ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${color.avatar}`}>
            {persona.initials}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 leading-snug">{persona.role}</p>
            <p className="text-xs text-gray-400 mt-0.5">{persona.department}</p>
          </div>
          {data.personas.length > 1 && (
            <div className="flex gap-1">
              <button
                onClick={() => setSelected((selected - 1 + data.personas.length) % data.personas.length)}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 text-xs"
              >‹</button>
              <button
                onClick={() => setSelected((selected + 1) % data.personas.length)}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 text-xs"
              >›</button>
            </div>
          )}
        </div>

        {/* Body — 3 columns */}
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <div className="px-4 py-4">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Goals</p>
            <ul className="space-y-2">
              {persona.goals.map((g, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-600 leading-snug">
                  <span className="text-gray-300 mt-0.5 flex-shrink-0">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-4 py-4 bg-red-50/30">
            <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest mb-2.5">Without VAI™</p>
            <ul className="space-y-2">
              {persona.painPoints.map((p, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-600 leading-snug">
                  <span className="text-red-300 mt-0.5 flex-shrink-0">✕</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-4 py-4 bg-emerald-50/30">
            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-2.5">With VAI™</p>
            <ul className="space-y-2">
              {persona.gains.map((g, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-600 leading-snug">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quote */}
        {persona.quote && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 italic leading-relaxed">{persona.quote}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Data Sources view ──────────────────────────────────────────────────────────

const SOURCE_TYPE_STYLES: Record<DataSourceType, { bg: string; text: string; border: string; label: string; dark: string }> = {
  sensor:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   label: "Sensor",   dark: "bg-amber-500"   },
  camera:   { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  label: "Camera",   dark: "bg-violet-600"  },
  database: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    label: "Database", dark: "bg-blue-600"    },
  api:      { bg: "bg-brand-50",   text: "text-brand-700",   border: "border-brand-200",   label: "API",      dark: "bg-brand-600"   },
  cad:      { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "CAD",      dark: "bg-emerald-600" },
  feed:     { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     label: "Feed",     dark: "bg-sky-600"     },
};

function FlipCard({ source }: { source: DataSource }) {
  const [flipped, setFlipped] = useState(false);
  const s = SOURCE_TYPE_STYLES[source.type];

  return (
    <div
      className="cursor-pointer select-none"
      style={{ perspective: "1000px", height: "148px" }}
      onClick={() => setFlipped((f) => !f)}
      title={flipped ? "Click to flip back" : "Click to see details"}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        {/* ── Front ── */}
        <div
          className="absolute inset-0 rounded-2xl border border-gray-200 bg-white p-4 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-start justify-between gap-2">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${s.bg} ${s.text} ${s.border}`}>
              {s.label}
            </span>
            <span className="text-[9px] text-gray-300 flex-shrink-0 mt-px">↺ flip</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight mb-2">{source.name}</p>
            <div className="flex flex-wrap gap-1">
              {(source.players ?? []).slice(0, 3).map((p, i) => (
                <span key={i} className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">{p}</span>
              ))}
              {(source.players?.length ?? 0) > 3 && (
                <span className="text-[9px] text-gray-400 px-1 self-center">+{(source.players?.length ?? 0) - 3} more</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Back ── */}
        <div
          className="absolute inset-0 rounded-2xl bg-gray-900 p-4 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex items-start justify-between gap-2">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0 ${s.dark}`}>
              {s.label}
            </span>
            <span className="text-[9px] text-gray-600 flex-shrink-0 mt-px">↺ flip</span>
          </div>
          <div className="flex-1 flex flex-col justify-center py-1">
            {source.fullName && source.fullName !== source.name && (
              <p className="text-[9px] font-semibold text-gray-400 mb-1 leading-snug">{source.fullName}</p>
            )}
            <p className="text-[10px] text-gray-300 leading-relaxed line-clamp-4">{source.description}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {source.standard && (
              <span className="text-[8px] font-bold bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">{source.standard}</span>
            )}
            {source.provider && (
              <span className="text-[8px] text-gray-600 px-1 self-center">{source.provider}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowDataSourcesView({ workflowId }: { workflowId: string }) {
  const data = getDataSourceData(workflowId);

  if (!data) {
    return (
      <div className="py-12 text-center text-gray-400">
        <p className="text-sm">No data sources defined for this workflow.</p>
        <p className="text-xs mt-1">Data source documentation is available for built-in VAI™ workflows.</p>
      </div>
    );
  }

  const typeOrder: DataSourceType[] = ["sensor", "camera", "feed", "cad", "database", "api"];
  const byType: Partial<Record<DataSourceType, DataSource[]>> = {};
  for (const src of data.sources) (byType[src.type] ??= []).push(src);

  return (
    <div className="space-y-5">
      {/* Type summary strip */}
      <div className="flex flex-wrap gap-1.5">
        {typeOrder.filter((t) => byType[t]?.length).map((t) => {
          const s = SOURCE_TYPE_STYLES[t];
          return (
            <span key={t} className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
              {s.label} <span className="opacity-50">×{byType[t]!.length}</span>
            </span>
          );
        })}
        <span className="text-[9px] text-gray-400 self-center ml-1">— tap a card to flip for details</span>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.sources.map((src, i) => (
          <FlipCard key={i} source={src} />
        ))}
      </div>
    </div>
  );
}

// ── Matrix view ───────────────────────────────────────────────────────────────

const RBAC_STYLES: Record<RBACLevel, { bg: string; text: string; label: string }> = {
  admin:     { bg: "bg-gray-900",    text: "text-white",         label: "Admin"     },
  operator:  { bg: "bg-brand-600",   text: "text-white",         label: "Operator"  },
  responder: { bg: "bg-emerald-600", text: "text-white",         label: "Responder" },
  viewer:    { bg: "bg-gray-200",    text: "text-gray-600",      label: "Viewer"    },
};

const CJIS_STYLES: Record<CJISLevel, { bg: string; text: string; label: string }> = {
  full:    { bg: "bg-red-100",    text: "text-red-700",    label: "Full"    },
  limited: { bg: "bg-amber-100", text: "text-amber-700",  label: "Limited" },
  none:    { bg: "bg-gray-100",  text: "text-gray-400",   label: "None"    },
};

function WorkflowMatrixView({ workflowId }: { workflowId: string }) {
  const matrix  = getMatrixData(workflowId);
  const sources = getDataSourceData(workflowId);

  if (!matrix) {
    return (
      <div className="py-12 text-center text-gray-400">
        <p className="text-sm">No matrix defined for this workflow.</p>
      </div>
    );
  }

  const cols = sources?.sources ?? [];

  return (
    <div className="space-y-6">

      {/* Legend */}
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">RBAC Level</p>
          <div className="flex gap-1.5">
            {(["admin","operator","responder","viewer"] as RBACLevel[]).map((lvl) => {
              const s = RBAC_STYLES[lvl];
              return (
                <span key={lvl} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                  {s.label}
                </span>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">CJIS Requirement</p>
          <div className="flex gap-1.5">
            {(["full","limited","none"] as CJISLevel[]).map((lvl) => {
              const s = CJIS_STYLES[lvl];
              return (
                <span key={lvl} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                  {s.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Matrix grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-[10px] border-collapse" style={{ minWidth: `${Math.max(600, 160 + cols.length * 72 + 140)}px` }}>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {/* Role header */}
              <th className="sticky left-0 z-10 bg-gray-50 text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-40">
                Role
              </th>
              {/* Data source columns */}
              {cols.map((src) => (
                <th key={src.name} className="px-2 py-3 text-center font-bold text-gray-400 uppercase tracking-wider border-r border-gray-100 w-[68px]" title={src.fullName ?? src.name}>
                  <span className="block w-full overflow-hidden whitespace-nowrap text-ellipsis leading-tight">
                    {src.name.split(/[\s/]/)[0]}
                  </span>
                </th>
              ))}
              {/* RBAC + CJIS */}
              <th className="px-3 py-3 text-center font-bold text-gray-500 uppercase tracking-wider border-l border-gray-200 w-20">RBAC</th>
              <th className="px-3 py-3 text-center font-bold text-gray-500 uppercase tracking-wider w-20">CJIS</th>
            </tr>
          </thead>
          <tbody>
            {matrix.roles.map((role, ri) => {
              const rbac = RBAC_STYLES[role.rbac];
              const cjis = CJIS_STYLES[role.cjis];
              return (
                <tr key={ri} className={`border-b border-gray-100 ${ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                  {/* Role cell */}
                  <td className="sticky left-0 z-10 px-4 py-3 border-r border-gray-200" style={{ background: ri % 2 === 0 ? "white" : "rgb(249 250 251 / 0.5)" }}>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${rbac.bg} ${rbac.text}`}>
                        {role.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 leading-snug">{role.role}</p>
                        <p className="text-gray-400 leading-snug">{role.department}</p>
                      </div>
                    </div>
                  </td>
                  {/* Source access cells */}
                  {cols.map((src) => {
                    const has = role.accessSources.includes(src.name);
                    return (
                      <td key={src.name} className="text-center py-3 px-1 border-r border-gray-100" title={has ? src.fullName ?? src.name : undefined}>
                        {has ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-600 font-bold text-[10px]">✓</span>
                        ) : (
                          <span className="text-gray-200 font-bold">—</span>
                        )}
                      </td>
                    );
                  })}
                  {/* RBAC badge */}
                  <td className="text-center py-3 px-2 border-l border-gray-200">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${rbac.bg} ${rbac.text}`}>
                      {rbac.label}
                    </span>
                  </td>
                  {/* CJIS badge */}
                  <td className="text-center py-3 px-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cjis.bg} ${cjis.text}`}>
                      {cjis.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Column key — full source names */}
      {cols.length > 0 && (
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Column Key — Data Sources</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {cols.map((src) => (
              <div key={src.name} className="flex items-baseline gap-1 text-[10px]">
                <span className="font-semibold text-gray-700">{src.name.split(/[\s/]/)[0]}</span>
                <span className="text-gray-400">{src.fullName ?? src.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Responsibilities */}
      <div>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Roles & Responsibilities</p>
        <div className="space-y-2">
          {matrix.roles.map((role, ri) => {
            const rbac = RBAC_STYLES[role.rbac];
            return (
              <div key={ri} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex gap-4 items-start">
                <div className="flex items-center gap-2 w-48 flex-shrink-0">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${rbac.bg} ${rbac.text}`}>
                    {role.initials}
                  </div>
                  <p className="text-[10px] font-semibold text-gray-800 leading-snug">{role.role}</p>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 flex-1">
                  {role.responsibilities.map((r, i) => (
                    <span key={i} className="flex items-center gap-1 text-[10px] text-gray-600">
                      <span className="text-gray-300">•</span>{r}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Details view ──────────────────────────────────────────────────────────────

function WorkflowDetailsView({
  workflow, editing, edit, setEdit,
}: {
  workflow: Workflow;
  editing: boolean;
  edit: EditState;
  setEdit: (e: EditState) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
      {/* Description */}
      <Section label="Description">
        {editing ? (
          <textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            placeholder="Describe what this workflow does…"
          />
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed">
            {workflow.description ?? <span className="text-gray-400 italic">No description</span>}
          </p>
        )}
      </Section>

      {/* Use Cases */}
      <Section label="Use Cases">
        {editing ? (
          <UseCasesEditor useCases={edit.useCases} onChange={(uc) => setEdit({ ...edit, useCases: uc })} />
        ) : workflow.useCases.length > 0 ? (
          <ul className="space-y-1.5">
            {workflow.useCases.map((uc, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-gray-300 mt-0.5">•</span>
                <span>{uc}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 italic">No use cases listed</p>
        )}
      </Section>

      {/* Audience + Users */}
      <Section label="Audience">
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Audience</label>
              <input value={edit.audience} onChange={(e) => setEdit({ ...edit, audience: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Who is the intended audience?"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Users</label>
              <input value={edit.users} onChange={(e) => setEdit({ ...edit, users: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Who are the day-to-day users?"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Field label="Audience" value={workflow.audience} />
            <Field label="Users" value={workflow.users} />
          </div>
        )}
      </Section>

      {/* Tags */}
      <Section label="Tags">
        {editing ? (
          <div className="space-y-4">
            <TagToggleGroup title="Industry Verticals" allTags={VERTICAL_TAGS} selected={edit.verticalTags}
              onChange={(t) => setEdit({ ...edit, verticalTags: t })} />
            <TagToggleGroup title="Threat Types" allTags={THREAT_TAGS} selected={edit.threatTags}
              onChange={(t) => setEdit({ ...edit, threatTags: t })} />
          </div>
        ) : (
          <div className="space-y-3">
            {workflow.verticalTags.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5">Verticals</p>
                <div className="flex flex-wrap gap-1.5">
                  {workflow.verticalTags.map((t) => <TagPill key={t} id={t} />)}
                </div>
              </div>
            )}
            {workflow.threatTags.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5">Threat Types</p>
                <div className="flex flex-wrap gap-1.5">
                  {workflow.threatTags.map((t) => <TagPill key={t} id={t} />)}
                </div>
              </div>
            )}
            {workflow.verticalTags.length === 0 && workflow.threatTags.length === 0 && (
              <p className="text-sm text-gray-400 italic">No tags</p>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function WorkflowDetailClient({ workflow }: { workflow: Workflow }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [editing, setEditing]     = useState(false);
  const [edit, setEdit]           = useState<EditState>(workflowToEdit(workflow));
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]   = useState(false);

  const hasDiagram     = getDiagramData(workflow.id) !== null || getSwimlaneWebp(workflow.id) !== null;
  const hasROI         = getROIData(workflow.id) !== null;
  const hasPersonas    = getPersonaData(workflow.id) !== null;
  const hasDataSources = getDataSourceData(workflow.id) !== null;
  const hasMatrix      = getMatrixData(workflow.id) !== null;

  function cancelEdit() {
    setEdit(workflowToEdit(workflow));
    setEditing(false);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/${workflow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: edit.name,
          description: edit.description || undefined,
          audience: edit.audience || undefined,
          users: edit.users || undefined,
          useCases: edit.useCases.filter((u) => u.trim()),
          verticalTags: edit.verticalTags,
          threatTags: edit.threatTags,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Save failed");
      }
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/workflows/${workflow.id}`, { method: "DELETE" });
      router.push("/workflows");
    } finally {
      setDeleting(false);
    }
  }

  const primaryTag = workflow.verticalTags[0] ?? workflow.threatTags[0];

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link href="/workflows" className="hover:text-gray-900">Workflows</Link>
        <span>/</span>
        <span className="font-mono text-gray-400">{workflow.id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
          {primaryTag ? (
            <TagIcon tag={primaryTag} size={22} className="text-gray-500" />
          ) : (
            <span className="text-xs font-mono text-gray-400">WF</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              className="w-full text-2xl font-bold border-b-2 border-brand-400 bg-transparent focus:outline-none pb-1"
            />
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{workflow.name}</h1>
              {workflow.isCustom && (
                <span className="text-xs bg-brand-50 text-brand-600 font-medium px-2 py-0.5 rounded-full">Custom</span>
              )}
            </div>
          )}
          <p className="font-mono text-xs text-gray-400 mt-0.5">{workflow.id}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {editing ? (
            <>
              <button onClick={cancelEdit} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={handleSave} disabled={saving || !edit.name.trim()}
                className="px-4 py-1.5 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <>
              {activeTab === "details" && (
                <button onClick={() => { setEditing(true); setEdit(workflowToEdit(workflow)); }}
                  className="px-4 py-1.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Edit
                </button>
              )}
              {workflow.isCustom && (
                <button onClick={() => setConfirmDelete(true)}
                  className="px-4 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {confirmDelete && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-800 font-medium mb-3">Delete this custom workflow? This cannot be undone.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
              {deleting ? "Deleting…" : "Confirm Delete"}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1 mb-5 w-fit">
        {([
          { id: "details",  label: "Details"       },
          { id: "diagram",  label: "Flow"           },
          { id: "roi",      label: "ROI & Metrics"  },
          { id: "personas", label: "Personas"       },
          { id: "matrix",   label: "Matrix"         },
          { id: "sources",  label: "Data Sources"   },
        ] as { id: Tab; label: string }[]).map((tab) => {
          const available =
            tab.id === "details"  ||
            (tab.id === "diagram"  && hasDiagram)     ||
            (tab.id === "roi"      && hasROI)          ||
            (tab.id === "personas" && hasPersonas)     ||
            (tab.id === "matrix"   && hasMatrix)       ||
            (tab.id === "sources"  && hasDataSources);
          return (
            <button
              key={tab.id}
              onClick={() => { if (available) setActiveTab(tab.id); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : available
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-gray-300 cursor-default"
              }`}
            >
              {tab.label}
              {!available && tab.id !== "details" && (
                <span className="ml-1.5 text-[9px] font-normal text-gray-300">—</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "details" && (
        <WorkflowDetailsView workflow={workflow} editing={editing} edit={edit} setEdit={setEdit} />
      )}
      {activeTab === "diagram" && (
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5">
          <WorkflowDiagramView workflowId={workflow.id} />
        </div>
      )}
      {activeTab === "roi" && (
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5">
          <WorkflowROIView workflowId={workflow.id} />
        </div>
      )}
      {activeTab === "personas" && (
        <WorkflowPersonasView workflowId={workflow.id} />
      )}
      {activeTab === "matrix" && (
        <WorkflowMatrixView workflowId={workflow.id} />
      )}
      {activeTab === "sources" && (
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5">
          <WorkflowDataSourcesView workflowId={workflow.id} />
        </div>
      )}
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-5">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{label}</div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-400 w-20 flex-shrink-0">{label}</span>
      <span className="text-gray-700">{value ?? <span className="text-gray-300 italic">—</span>}</span>
    </div>
  );
}
