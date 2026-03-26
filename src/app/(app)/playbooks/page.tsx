"use client";

import { useState } from "react";
import { ALL_PLAYBOOKS } from "@/lib/playbook-data";
import { PlaybookInteractive } from "./[vertical]/playbook-interactive";

const STYLES: Record<string, {
  gradient: string;
  headerBg: string;
  badge: string;
  border: string;
  activeBorder: string;
  chevron: string;
}> = {
  "smart-city": {
    gradient: "from-violet-600 to-purple-700",
    headerBg: "bg-gradient-to-r from-violet-600 to-purple-700",
    badge: "bg-violet-100 text-violet-700",
    border: "border-gray-200",
    activeBorder: "border-violet-300",
    chevron: "text-violet-400",
  },
  transit: {
    gradient: "from-blue-600 to-indigo-700",
    headerBg: "bg-gradient-to-r from-blue-600 to-indigo-700",
    badge: "bg-blue-100 text-blue-700",
    border: "border-gray-200",
    activeBorder: "border-blue-300",
    chevron: "text-blue-400",
  },
  emergency: {
    gradient: "from-orange-500 to-red-700",
    headerBg: "bg-gradient-to-r from-orange-500 to-red-700",
    badge: "bg-orange-100 text-orange-700",
    border: "border-gray-200",
    activeBorder: "border-orange-300",
    chevron: "text-orange-400",
  },
};

const ICONS: Record<string, string> = {
  "smart-city": "🏙️",
  transit: "🚌",
  emergency: "🚨",
};

export default function PlaybooksPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="max-w-4xl">
      {/* Page header */}
      <div className="mb-7">
        <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1">Content Engine</p>
        <h1 className="text-2xl font-bold text-gray-900">Vertical Playbooks</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-xl">
          Interactive discovery guides — what to say when they hit a pain point, when they don&apos;t,
          and how to bridge back to VAI. Open a vertical to get started.
        </p>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {ALL_PLAYBOOKS.map((p) => {
          const style = STYLES[p.slug] ?? STYLES["smart-city"];
          const isOpen = open === p.slug;

          return (
            <div
              key={p.slug}
              className={`bg-white rounded-2xl border overflow-hidden transition-all shadow-sm ${
                isOpen ? style.activeBorder : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Accordion header — always visible */}
              <button
                className="w-full text-left"
                onClick={() => setOpen(isOpen ? null : p.slug)}
              >
                {/* Color bar at top when closed, becomes full header when open */}
                {isOpen ? (
                  <div className={`${style.headerBg} px-5 py-4`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{ICONS[p.slug]}</span>
                        <div>
                          <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-0.5">
                            {p.vertical.replace("_", " ")} · {p.buyer.split(",")[0]?.trim()}
                          </p>
                          <p className="text-white font-bold text-base leading-tight">{p.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Quick stat pills */}
                        <div className="hidden sm:flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-white/70 bg-white/15 px-2 py-0.5 rounded-full">
                            {p.discovery.length} discovery
                          </span>
                          <span className="text-[10px] font-semibold text-white/70 bg-white/15 px-2 py-0.5 rounded-full">
                            {p.painPoints.length} pain points
                          </span>
                          <span className="text-[10px] font-semibold text-white/70 bg-white/15 px-2 py-0.5 rounded-full">
                            {p.objections.length} objections
                          </span>
                        </div>
                        <svg
                          viewBox="0 0 20 20"
                          className="w-5 h-5 text-white/70 rotate-180 transition-transform"
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-4 flex items-center gap-4">
                    {/* Color dot */}
                    <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${style.gradient} flex-shrink-0`} />
                    <span className="text-lg">{ICONS[p.slug]}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                          {p.label}
                        </span>
                        <span className="text-xs text-gray-400 hidden sm:inline">{p.buyer.split(",")[0]?.trim()}</span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium leading-snug">{p.tagline}</p>
                    </div>

                    {/* Stats (collapsed) */}
                    <div className="hidden sm:flex items-center gap-3 flex-shrink-0 text-right">
                      <div>
                        <span className="text-base font-bold text-gray-900">{p.discovery.length}</span>
                        <span className="text-[10px] text-gray-400 ml-0.5">q's</span>
                      </div>
                      <div>
                        <span className="text-base font-bold text-gray-900">{p.painPoints.length}</span>
                        <span className="text-[10px] text-gray-400 ml-0.5">pains</span>
                      </div>
                      <div>
                        <span className="text-base font-bold text-gray-900">{p.objections.length}</span>
                        <span className="text-[10px] text-gray-400 ml-0.5">obj.</span>
                      </div>
                    </div>

                    <svg
                      viewBox="0 0 20 20"
                      className={`w-4 h-4 flex-shrink-0 transition-transform ${style.chevron}`}
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Expanded: full interactive playbook */}
              {isOpen && (
                <div className="px-5 pb-5 pt-4 border-t border-gray-100">
                  <PlaybookInteractive playbook={p} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tip */}
      <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-brand-50 border border-brand-100 rounded-xl">
        <div className="w-1.5 h-8 bg-brand-400 rounded-full flex-shrink-0" />
        <p className="text-xs text-brand-700">
          <span className="font-semibold">Tip:</span>{" "}
          Playbooks also open automatically from any account page based on the account&apos;s vertical.
          Use the Discovery tab before a call, Pain Points during.
        </p>
      </div>
    </div>
  );
}
