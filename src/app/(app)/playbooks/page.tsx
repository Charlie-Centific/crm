"use client";

import { useState } from "react";
import { ALL_PLAYBOOKS } from "@/lib/playbook-data";
import { PlaybookInteractive } from "./[vertical]/playbook-interactive";

const STYLES: Record<string, {
  gradient: string;
  cardBorder: string;
  cardHover: string;
  headerBg: string;
  iconBg: string;
  badge: string;
  chipBg: string;
}> = {
  "smart-city": {
    gradient: "from-violet-600 to-purple-700",
    cardBorder: "border-violet-200",
    cardHover: "hover:border-violet-400 hover:shadow-violet-100",
    headerBg: "bg-gradient-to-r from-violet-600 to-purple-700",
    iconBg: "bg-violet-100 text-violet-700",
    badge: "bg-violet-100 text-violet-700",
    chipBg: "bg-white/15",
  },
  transit: {
    gradient: "from-blue-600 to-indigo-700",
    cardBorder: "border-blue-200",
    cardHover: "hover:border-blue-400 hover:shadow-blue-100",
    headerBg: "bg-gradient-to-r from-blue-600 to-indigo-700",
    iconBg: "bg-blue-100 text-blue-700",
    badge: "bg-blue-100 text-blue-700",
    chipBg: "bg-white/15",
  },
  emergency: {
    gradient: "from-orange-500 to-red-700",
    cardBorder: "border-orange-200",
    cardHover: "hover:border-orange-400 hover:shadow-orange-100",
    headerBg: "bg-gradient-to-r from-orange-500 to-red-700",
    iconBg: "bg-orange-100 text-orange-700",
    badge: "bg-orange-100 text-orange-700",
    chipBg: "bg-white/15",
  },
};

const ICONS: Record<string, string> = {
  "smart-city": "🏙️",
  transit: "🚌",
  emergency: "🚨",
};

const USE_CASES: Record<string, string[]> = {
  "smart-city": ["City-wide data integration", "Real-time situational awareness", "Cross-agency coordination"],
  transit: ["Fleet & vehicle monitoring", "Platform safety", "Predictive maintenance"],
  emergency: ["Threat detection & response", "Digital forensics", "Automated incident reporting"],
};

export default function PlaybooksPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const playbook = selected ? ALL_PLAYBOOKS.find((p) => p.slug === selected) ?? null : null;
  const style = selected ? (STYLES[selected] ?? STYLES["smart-city"]) : null;

  return (
    <div className="max-w-4xl">
      {/* Page header */}
      <div className="mb-7">
        <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1">Content Engine</p>
        <h1 className="text-2xl font-bold text-gray-900">Vertical Playbooks</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-xl">
          Interactive discovery guides — branching responses for pain points, objections, and demo scenarios.
        </p>
      </div>

      {/* No selection — prompt */}
      {!selected && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Before you start</p>
            <p className="text-lg font-bold text-gray-900">What kind of organization are you meeting with?</p>
            <p className="text-sm text-gray-500 mt-1">
              Select the vertical that best matches your account. The playbook will guide you through
              discovery, pain point responses, objection handling, and demo scenarios — all tailored to that world.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {ALL_PLAYBOOKS.map((p) => {
              const s = STYLES[p.slug] ?? STYLES["smart-city"];
              const cases = USE_CASES[p.slug] ?? [];
              return (
                <button
                  key={p.slug}
                  onClick={() => setSelected(p.slug)}
                  className={`group text-left bg-white border rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md ${s.cardBorder} ${s.cardHover}`}
                >
                  {/* Color bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${s.gradient}`} />

                  <div className="p-4">
                    {/* Icon + label */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl ${s.iconBg}`}>
                        {ICONS[p.slug]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{p.label}</p>
                        <p className="text-[10px] text-gray-400">{p.buyer.split(",")[0]?.trim()}</p>
                      </div>
                    </div>

                    {/* Tagline */}
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{p.tagline}</p>

                    {/* Use cases */}
                    <ul className="space-y-1">
                      {cases.map((c) => (
                        <li key={c} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                          <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className={`mt-4 pt-3 border-t border-gray-100 flex items-center justify-between`}>
                      <div className="flex gap-1.5">
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {p.discovery.length}q
                        </span>
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {p.painPoints.length} pains
                        </span>
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {p.objections.length} obj
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-brand-600 group-hover:underline">
                        Open →
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected playbook */}
      {selected && playbook && style && (
        <div>
          {/* Back + change vertical */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Change vertical
            </button>
            <span className="text-gray-200">|</span>
            <div className="flex gap-1.5">
              {ALL_PLAYBOOKS.filter((p) => p.slug !== selected).map((p) => {
                return (
                  <button
                    key={p.slug}
                    onClick={() => setSelected(p.slug)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all bg-white text-gray-500 border-gray-200 hover:text-gray-900 hover:border-gray-300`}
                  >
                    {ICONS[p.slug]} {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Gradient header */}
            <div className={`${style.headerBg} px-5 py-4`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">
                    {ICONS[playbook.slug]} {playbook.vertical.replace("_", " ")} · {playbook.buyer.split(",")[0]?.trim()}
                  </p>
                  <p className="text-white font-bold text-lg leading-tight">{playbook.tagline}</p>
                  <p className="text-white/70 text-xs mt-1.5 max-w-lg leading-relaxed">{playbook.overview}</p>
                </div>
                <div className="flex-shrink-0 hidden sm:flex flex-col items-end gap-1.5">
                  <span className="text-[10px] font-semibold text-white/70 bg-white/15 px-2 py-0.5 rounded-full">
                    {playbook.discovery.length} discovery q&apos;s
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
      )}
    </div>
  );
}
