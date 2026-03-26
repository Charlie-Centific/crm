"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, ArrowRight, X } from "lucide-react";
import { VERTICAL_TAGS, THREAT_TAGS, TagIcon } from "@/lib/tag-icons";
import type { Workflow } from "@/lib/workflows";

// ── Add workflow modal ────────────────────────────────────────────────────────

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

// ── Icon tile button ──────────────────────────────────────────────────────────

function TagTile({
  tag,
  active,
  count,
  onClick,
}: {
  tag: { id: string; label: string };
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={`${count} workflow${count !== 1 ? "s" : ""}`}
      className={`group flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all text-center ${
        active
          ? "bg-brand-600 border-brand-600 text-white shadow-sm"
          : count === 0
          ? "bg-white border-gray-100 text-gray-300 cursor-default"
          : "bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50"
      }`}
      disabled={count === 0}
    >
      <TagIcon
        tag={tag.id}
        size={20}
        className={active ? "text-white" : count === 0 ? "text-gray-200" : "text-gray-500 group-hover:text-brand-600"}
      />
      <span className="text-[10px] font-semibold leading-tight whitespace-nowrap">{tag.label}</span>
      {count > 0 && (
        <span className={`text-[9px] font-mono ${active ? "text-white/70" : "text-gray-400"}`}>{count}</span>
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  workflows: Workflow[];
  allVerticals: string[];
  allThreats: string[];
}

export function WorkflowsClient({ workflows }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeVertical, setActiveVertical] = useState<string | null>(null);
  const [activeThreat, setActiveThreat] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Count workflows per tag for the tiles
  const verticalCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const wf of workflows) {
      for (const t of wf.verticalTags) map[t] = (map[t] ?? 0) + 1;
    }
    return map;
  }, [workflows]);

  const threatCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const wf of workflows) {
      for (const t of wf.threatTags) map[t] = (map[t] ?? 0) + 1;
    }
    return map;
  }, [workflows]);

  const hasFilter = activeVertical !== null || activeThreat !== null || search.trim() !== "";

  const filtered = useMemo(() => {
    if (!hasFilter && !showAll) return [];
    let wf = workflows;
    if (activeVertical) wf = wf.filter((w) => w.verticalTags.includes(activeVertical));
    if (activeThreat)   wf = wf.filter((w) => w.threatTags.includes(activeThreat));
    if (search.trim()) {
      const q = search.toLowerCase();
      wf = wf.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          (w.description ?? "").toLowerCase().includes(q) ||
          (w.audience ?? "").toLowerCase().includes(q) ||
          w.useCases.some((uc) => uc.toLowerCase().includes(q))
      );
    }
    return wf;
  }, [workflows, activeVertical, activeThreat, search, hasFilter]);

  function handleCreated(id: string) {
    setShowAdd(false);
    router.push(`/workflows/${id}`);
  }

  function toggleVertical(id: string) {
    setActiveVertical((prev) => (prev === id ? null : id));
  }

  function toggleThreat(id: string) {
    setActiveThreat((prev) => (prev === id ? null : id));
  }

  function clearFilters() {
    setActiveVertical(null);
    setActiveThreat(null);
    setSearch("");
    setShowAll(false);
  }

  const activeLabel = activeVertical
    ? (VERTICAL_TAGS.find((t) => t.id === activeVertical)?.label ?? activeVertical)
    : activeThreat
    ? (THREAT_TAGS.find((t) => t.id === activeThreat)?.label ?? activeThreat)
    : null;

  return (
    <div>
      {showAdd && <AddWorkflowModal onClose={() => setShowAdd(false)} onCreated={handleCreated} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-sm text-gray-400 mt-0.5">{workflows.length} AI/CV workflows — select a category to browse</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowAll((v) => !v); setActiveVertical(null); setActiveThreat(null); setSearch(""); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showAll
                ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {showAll ? "Hide All" : "View All"}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus size={15} />
            Add Workflow
          </button>
        </div>
      </div>

      {/* ── Industry Vertical tiles ──────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Industry Vertical</p>
        <div className="grid grid-cols-7 gap-2 xl:grid-cols-13">
          {VERTICAL_TAGS.map((tag) => (
            <TagTile
              key={tag.id}
              tag={tag}
              active={activeVertical === tag.id}
              count={verticalCounts[tag.id] ?? 0}
              onClick={() => toggleVertical(tag.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Threat Type tiles ────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Threat Type</p>
        <div className="grid grid-cols-6 gap-2 xl:grid-cols-12">
          {THREAT_TAGS.map((tag) => (
            <TagTile
              key={tag.id}
              tag={tag}
              active={activeThreat === tag.id}
              count={threatCounts[tag.id] ?? 0}
              onClick={() => toggleThreat(tag.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Search + active filter pill ──────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {hasFilter && (
          <div className="flex items-center gap-2">
            {activeLabel && (
              <span className="flex items-center gap-1.5 text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-full">
                <TagIcon tag={activeVertical ?? activeThreat ?? ""} size={11} />
                {activeLabel}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={12} />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {!hasFilter && !showAll ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <TagIcon tag="smart-city" size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">Select a vertical or threat type above to browse workflows</p>
          <p className="text-xs text-gray-400 mt-1">Or type in the search box to find by keyword</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-sm text-gray-500">No workflows match these filters.</p>
          <button onClick={clearFilters} className="mt-2 text-sm text-brand-600 hover:underline">Clear filters</button>
        </div>
      ) : (
        <div>
          <p className="text-xs text-gray-400 mb-3 font-medium">
            {showAll && !hasFilter
              ? `All ${filtered.length} workflows`
              : `${filtered.length} workflow${filtered.length !== 1 ? "s" : ""} found`}
          </p>
          <div className="space-y-2">
            {filtered.map((wf) => (
              <WorkflowRow key={wf.id} wf={wf} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Workflow row card ─────────────────────────────────────────────────────────

function WorkflowRow({ wf }: { wf: Workflow }) {
  return (
    <Link href={`/workflows/${wf.id}`} className="group block">
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-start gap-4 hover:border-brand-300 hover:shadow-sm transition-all">

        {/* Icon cluster — primary vertical tag */}
        <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mt-0.5">
          {wf.verticalTags[0] ? (
            <TagIcon tag={wf.verticalTags[0]} size={18} className="text-gray-500" />
          ) : wf.threatTags[0] ? (
            <TagIcon tag={wf.threatTags[0]} size={18} className="text-gray-500" />
          ) : null}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono text-gray-400">{wf.id}</span>
            {wf.isCustom && (
              <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">Custom</span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors leading-snug">
            {wf.name}
          </p>
          {wf.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{wf.description}</p>
          )}
        </div>

        {/* Tag pills — compact, monochrome */}
        <div className="flex flex-wrap gap-1 justify-end max-w-[200px] flex-shrink-0">
          {[...wf.verticalTags, ...wf.threatTags].slice(0, 4).map((t) => (
            <span key={t} className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              <TagIcon tag={t} size={9} className="text-gray-400" />
              {t}
            </span>
          ))}
        </div>

        <ArrowRight size={15} className="text-gray-300 group-hover:text-brand-400 flex-shrink-0 mt-1 transition-colors" />
      </div>
    </Link>
  );
}
