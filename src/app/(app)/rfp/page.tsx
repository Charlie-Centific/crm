"use client";

import { useState } from "react";
import { ALL_PLAYBOOKS } from "@/lib/playbook-data";
import type { RFPItem } from "@/lib/playbook-data";

const VERTICAL_STYLES: Record<string, {
  gradient: string;
  headerBg: string;
  cardBorder: string;
  cardHover: string;
  iconBg: string;
}> = {
  "smart-city": {
    gradient: "from-violet-600 to-purple-700",
    headerBg: "bg-gradient-to-r from-violet-600 to-purple-700",
    cardBorder: "border-violet-200",
    cardHover: "hover:border-violet-400",
    iconBg: "bg-violet-100 text-violet-700",
  },
  transit: {
    gradient: "from-blue-600 to-indigo-700",
    headerBg: "bg-gradient-to-r from-blue-600 to-indigo-700",
    cardBorder: "border-blue-200",
    cardHover: "hover:border-blue-400",
    iconBg: "bg-blue-100 text-blue-700",
  },
  emergency: {
    gradient: "from-orange-500 to-red-700",
    headerBg: "bg-gradient-to-r from-orange-500 to-red-700",
    cardBorder: "border-orange-200",
    cardHover: "hover:border-orange-400",
    iconBg: "bg-orange-100 text-orange-700",
  },
};

const ICONS: Record<string, string> = {
  "smart-city": "🏙️",
  transit: "🚌",
  emergency: "🚨",
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  Technical:   { bg: "bg-blue-100",    text: "text-blue-700" },
  Integration: { bg: "bg-violet-100",  text: "text-violet-700" },
  Security:    { bg: "bg-red-100",     text: "text-red-700" },
  Experience:  { bg: "bg-emerald-100", text: "text-emerald-700" },
  Support:     { bg: "bg-amber-100",   text: "text-amber-700" },
};

const ALL_CATEGORIES = ["Technical", "Integration", "Security", "Experience", "Support"] as const;

export default function RFPPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const playbook = selected ? ALL_PLAYBOOKS.find((p) => p.slug === selected) ?? null : null;
  const style = selected ? (VERTICAL_STYLES[selected] ?? VERTICAL_STYLES["smart-city"]) : null;

  const visibleItems = playbook
    ? (categoryFilter ? playbook.rfp.filter((i) => i.category === categoryFilter) : playbook.rfp)
    : [];

  function copy(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function copyAll() {
    const text = visibleItems
      .map((item) => `## ${item.question}\n\n${item.response}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied("all");
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-7">
        <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1">Content Engine</p>
        <h1 className="text-2xl font-bold text-gray-900">RFP Response Guide</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-xl">
          Pre-written responses for common RFP questions — organized by vertical and category.
          Select, review, customize, and copy into your response document.
        </p>
      </div>

      {/* Vertical selector — always visible */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {ALL_PLAYBOOKS.map((p) => {
          const s = VERTICAL_STYLES[p.slug] ?? VERTICAL_STYLES["smart-city"];
          const isActive = p.slug === selected;
          return (
            <button
              key={p.slug}
              onClick={() => {
                setSelected(isActive ? null : p.slug);
                setCategoryFilter(null);
                setOpen(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isActive
                  ? `bg-gradient-to-r ${s.gradient} text-white border-transparent shadow-sm`
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              <span>{ICONS[p.slug]}</span>
              {p.label}
              <span className={`text-[10px] font-mono rounded px-1 ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {p.rfp.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {!selected && (
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-10 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-indigo-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-800 mb-1">Select a vertical to load the RFP guide</p>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Each vertical has pre-written responses covering technical capability, integration, security, experience, and support questions.
          </p>
        </div>
      )}

      {/* Loaded vertical */}
      {selected && playbook && style && (
        <div className="space-y-4">
          {/* Vertical header */}
          <div className={`${style.headerBg} rounded-2xl px-5 py-4`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">
                  {ICONS[playbook.slug]} {playbook.label} · RFP Response Guide
                </p>
                <p className="text-white font-bold text-base">{playbook.tagline}</p>
              </div>
              <button
                onClick={copyAll}
                className="flex-shrink-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                {copied === "all" ? (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                    Copied all!
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" /><path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" /></svg>
                    Copy all {categoryFilter ? `(${categoryFilter})` : "responses"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-medium">Filter:</span>
            <button
              onClick={() => setCategoryFilter(null)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                !categoryFilter ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              All ({playbook.rfp.length})
            </button>
            {ALL_CATEGORIES.filter((c) => playbook.rfp.some((i) => i.category === c)).map((cat) => {
              const cs = CATEGORY_STYLES[cat];
              const isActive = categoryFilter === cat;
              const count = playbook.rfp.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(isActive ? null : cat)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    isActive ? `${cs.bg} ${cs.text} border-transparent` : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* RFP items */}
          <div className="space-y-2">
            {visibleItems.map((item: RFPItem) => {
              const catStyle = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES["Technical"];
              const isOpen = open === item.id;
              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl overflow-hidden transition-all ${
                    isOpen ? "border-brand-300 shadow-sm" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <button
                    className="w-full text-left p-4 flex items-start gap-3"
                    onClick={() => setOpen(isOpen ? null : item.id)}
                  >
                    <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${catStyle.bg} ${catStyle.text}`}>
                      {item.category}
                    </span>
                    <p className="text-sm font-medium text-gray-800 flex-1 leading-snug">{item.question}</p>
                    <svg
                      viewBox="0 0 20 20"
                      className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
                      <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Suggested Response</p>
                          <button
                            onClick={() => copy(item.id, item.response)}
                            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors"
                          >
                            {copied === item.id ? (
                              <>
                                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                                <span className="text-emerald-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" /><path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" /></svg>
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-brand-900 leading-relaxed">{item.response}</p>
                      </div>

                      {item.tips && (
                        <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <span className="text-amber-500 text-xs mt-0.5 flex-shrink-0">⚡</span>
                          <div>
                            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Before sending</p>
                            <p className="text-xs text-amber-800 leading-relaxed">{item.tips}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {visibleItems.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No responses in this category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
