"use client";

import { useState, useMemo } from "react";
import { RFP_SECTIONS } from "@/lib/rfp-builder-data";
import type { RFPSection, RFPBlock } from "@/lib/rfp-builder-data";

// ─── Types ────────────────────────────────────────────────────────────────────
// selections: sectionId → blockId[] (always an array — single-select just has max 1)
type Selections = Record<string, string[]>;

// ─── Main component ───────────────────────────────────────────────────────────
export function RFPBuilder() {
  const [activeSection, setActiveSection] = useState<string>(RFP_SECTIONS[0]?.id ?? "");
  const [selections, setSelections] = useState<Selections>({});
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentSection = RFP_SECTIONS.find((s) => s.id === activeSection) ?? RFP_SECTIONS[0];

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
      parts.push(`### ${section.ref ? `${section.ref} — ` : ""}${section.title}\n\n${blocks.map((b) => b.content).join("\n\n")}`);
    }
    return parts.join("\n\n---\n\n");
  }, [selections]);

  const totalSelected = Object.values(selections).reduce((n, ids) => n + ids.length, 0);
  const sectionsWithSelection = Object.values(selections).filter((ids) => ids.length > 0).length;

  function copyAll() {
    navigator.clipboard.writeText(assembled).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="flex gap-4 min-h-[600px]">
      {/* ── Left: section list ─────────────────────────────────────────────── */}
      <div className="w-52 flex-shrink-0 space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Sections</p>
        {RFP_SECTIONS.map((s) => {
          const selected = selections[s.id] ?? [];
          const isDone = selected.length > 0;
          const isActive = activeSection === s.id;
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
              <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                isActive ? "bg-white/20 text-white" : isDone ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {isDone ? "✓" : " "}
              </span>
              <span className="leading-snug">
                {s.ref && <span className="opacity-60">{s.ref} · </span>}
                {s.title}
              </span>
            </button>
          );
        })}

        {/* Summary */}
        <div className="mt-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-[10px] text-gray-500 font-medium">{sectionsWithSelection} of {RFP_SECTIONS.length} sections filled</p>
          <p className="text-[10px] text-gray-400">{totalSelected} block{totalSelected !== 1 ? "s" : ""} selected</p>
        </div>
      </div>

      {/* ── Right: section detail + preview ────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Toggle: Build / Preview */}
        <div className="flex items-center justify-between">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setShowPreview(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${!showPreview ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              Build
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${showPreview ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
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
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" /><path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" /></svg>
                  Copy full response
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
              <p className="text-xs font-semibold text-gray-700">Assembled Response</p>
              {!assembled && <p className="text-xs text-gray-400">Select blocks to see the assembled response</p>}
            </div>
            <div className="p-5 max-h-[500px] overflow-y-auto">
              {assembled ? (
                <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{assembled}</pre>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No blocks selected yet.</p>
                  <p className="text-xs mt-1">Switch to Build and select response blocks to assemble your document.</p>
                </div>
              )}
            </div>
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
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            {section.ref && (
              <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1">{section.ref}</p>
            )}
            <h2 className="text-sm font-bold text-gray-900 mb-1">{section.title}</h2>
            <p className="text-xs text-gray-500 leading-relaxed">{section.prompt}</p>
          </div>
          <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            section.mode === "multi" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
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

      {/* Selected preview */}
      {selected.length > 0 && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
          <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-2">
            {selected.length} block{selected.length !== 1 ? "s" : ""} selected — preview
          </p>
          {section.blocks
            .filter((b) => selected.includes(b.id))
            .map((b) => (
              <div key={b.id} className="mb-3 last:mb-0">
                <p className="text-[10px] font-semibold text-brand-700 mb-1">{b.label}</p>
                <p className="text-xs text-brand-900 leading-relaxed whitespace-pre-line">{b.content.slice(0, 300)}{b.content.length > 300 ? "…" : ""}</p>
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
        {/* Checkbox */}
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
          {block.tags && block.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {block.tags.map((t) => (
                <span key={t} className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
