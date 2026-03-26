"use client";

import { useState } from "react";
import { ALL_PLAYBOOKS } from "@/lib/playbook-data";
import { PlaybookInteractive } from "./[vertical]/playbook-interactive";

const STYLES: Record<string, {
  gradient: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
  headerBg: string;
}> = {
  "smart-city": {
    gradient: "from-violet-600 to-purple-700",
    activeBg: "bg-violet-600",
    activeText: "text-white",
    activeBorder: "border-violet-600",
    headerBg: "bg-gradient-to-r from-violet-600 to-purple-700",
  },
  transit: {
    gradient: "from-blue-600 to-indigo-700",
    activeBg: "bg-blue-600",
    activeText: "text-white",
    activeBorder: "border-blue-600",
    headerBg: "bg-gradient-to-r from-blue-600 to-indigo-700",
  },
  emergency: {
    gradient: "from-orange-500 to-red-700",
    activeBg: "bg-orange-500",
    activeText: "text-white",
    activeBorder: "border-orange-500",
    headerBg: "bg-gradient-to-r from-orange-500 to-red-700",
  },
};

const ICONS: Record<string, string> = {
  "smart-city": "🏙️",
  transit: "🚌",
  emergency: "🚨",
};

export default function PlaybooksPage() {
  const [selected, setSelected] = useState<string>(ALL_PLAYBOOKS[0]?.slug ?? "");

  const playbook = ALL_PLAYBOOKS.find((p) => p.slug === selected) ?? ALL_PLAYBOOKS[0];
  const style = STYLES[playbook?.slug ?? ""] ?? STYLES["smart-city"];

  return (
    <div className="max-w-4xl">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1">Content Engine</p>
        <h1 className="text-2xl font-bold text-gray-900">Vertical Playbooks</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-xl">
          Interactive discovery guides — what to say when they hit a pain point, when they don&apos;t,
          and how to bridge back to VAI.
        </p>
      </div>

      {/* Vertical selector */}
      <div className="flex gap-2 mb-5">
        {ALL_PLAYBOOKS.map((p) => {
          const s = STYLES[p.slug] ?? STYLES["smart-city"];
          const isActive = p.slug === selected;
          return (
            <button
              key={p.slug}
              onClick={() => setSelected(p.slug)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isActive
                  ? `${s.activeBg} ${s.activeText} ${s.activeBorder} shadow-sm`
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              <span>{ICONS[p.slug]}</span>
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Selected playbook */}
      {playbook && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Gradient header */}
          <div className={`${style.headerBg} px-5 py-4`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">
                  {playbook.vertical.replace("_", " ")} · {playbook.buyer.split(",")[0]?.trim()}
                </p>
                <p className="text-white font-bold text-lg leading-tight">{playbook.tagline}</p>
                <p className="text-white/70 text-xs mt-1.5 max-w-lg leading-relaxed">{playbook.overview}</p>
              </div>
              <div className="flex-shrink-0 hidden sm:flex flex-col items-end gap-1.5 text-right">
                <span className="text-[10px] font-semibold text-white/70 bg-white/15 px-2 py-0.5 rounded-full">
                  {playbook.discovery.length} discovery q's
                </span>
                <span className="text-[10px] font-semibold text-white/70 bg-white/15 px-2 py-0.5 rounded-full">
                  {playbook.painPoints.length} pain points
                </span>
                <span className="text-[10px] font-semibold text-white/70 bg-white/15 px-2 py-0.5 rounded-full">
                  {playbook.objections.length} objections
                </span>
                <span className="text-[10px] font-semibold text-white/70 bg-white/15 px-2 py-0.5 rounded-full">
                  {playbook.scenarios.length} scenarios
                </span>
              </div>
            </div>
          </div>

          {/* Interactive content */}
          <div className="p-5">
            <PlaybookInteractive playbook={playbook} />
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="mt-5 flex items-center gap-3 px-4 py-3 bg-brand-50 border border-brand-100 rounded-xl">
        <div className="w-1.5 h-8 bg-brand-400 rounded-full flex-shrink-0" />
        <p className="text-xs text-brand-700">
          <span className="font-semibold">Tip:</span>{" "}
          Playbooks open automatically from any account page based on the account&apos;s vertical.
          Use the Discovery tab before a call, Pain Points during.
        </p>
      </div>
    </div>
  );
}
