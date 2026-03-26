"use client";

import { useState } from "react";
import type { Playbook, DiscoveryQuestion, PainPoint, Objection, Scenario } from "@/lib/playbook-data";

type Tab = "discovery" | "pain-points" | "objections" | "scenarios";

// ─── Branch state for a discovery question ────────────────────────────────────
type Branch = "hit" | "miss" | null;

// ─── Top-level shell ──────────────────────────────────────────────────────────
export function PlaybookInteractive({ playbook }: { playbook: Playbook }) {
  const [tab, setTab] = useState<Tab>("discovery");

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "discovery",   label: "Discovery",    count: playbook.discovery.length },
    { id: "pain-points", label: "Pain Points",  count: playbook.painPoints.length },
    { id: "objections",  label: "Objections",   count: playbook.objections.length },
    { id: "scenarios",   label: "Scenarios",    count: playbook.scenarios.length },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-brand-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {t.label}
            <span className={`text-xs rounded-full px-1.5 py-0.5 font-mono ${
              tab === t.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "discovery"   && <DiscoveryTab questions={playbook.discovery} />}
      {tab === "pain-points" && <PainPointsTab points={playbook.painPoints} />}
      {tab === "objections"  && <ObjectionsTab objections={playbook.objections} />}
      {tab === "scenarios"   && <ScenariosTab scenarios={playbook.scenarios} />}
    </div>
  );
}

// ─── Discovery Tab ────────────────────────────────────────────────────────────
function DiscoveryTab({ questions }: { questions: DiscoveryQuestion[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 px-1">
        Ask each question in order. Click the branch that matches what they say.
      </p>
      {questions.map((q, i) => (
        <QuestionCard key={q.id} question={q} index={i} />
      ))}
    </div>
  );
}

function QuestionCard({ question: q, index }: { question: DiscoveryQuestion; index: number }) {
  const [branch, setBranch] = useState<Branch>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all ${
      open ? "border-brand-300 shadow-sm" : "border-gray-200 hover:border-gray-300"
    }`}>
      {/* Question header */}
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => { setOpen(!open); if (!open) setBranch(null); }}
      >
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-widest mb-1">Ask this</p>
          <p className="text-sm font-medium text-gray-900 leading-snug">"{q.question}"</p>
          {!open && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{q.intent}</p>
          )}
        </div>
        <svg
          viewBox="0 0 20 20"
          className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-1 transition-transform ${open ? "rotate-180" : ""}`}
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">
          {/* Why this question */}
          <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-400 text-xs mt-0.5">💡</span>
            <p className="text-xs text-gray-500">{q.intent}</p>
          </div>

          {/* Branch selector */}
          {branch === null && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">What do they say?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBranch("hit")}
                  className="flex items-center gap-2 p-3 rounded-lg border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-left transition-all"
                >
                  <span className="text-emerald-500 text-base flex-shrink-0">✓</span>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">Pain hit</p>
                    <p className="text-xs text-emerald-600 mt-0.5 line-clamp-2">{q.whenHit.signal}</p>
                  </div>
                </button>
                <button
                  onClick={() => setBranch("miss")}
                  className="flex items-center gap-2 p-3 rounded-lg border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 text-left transition-all"
                >
                  <span className="text-amber-500 text-base flex-shrink-0">→</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-700">Pain not there</p>
                    <p className="text-xs text-amber-600 mt-0.5 line-clamp-2">{q.whenMiss.signal}</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Hit branch */}
          {branch === "hit" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span>
                  Pain confirmed — here's what to say
                </span>
                <button onClick={() => setBranch(null)} className="text-xs text-gray-400 hover:text-gray-600">
                  Reset
                </button>
              </div>
              <ResponseBlock
                label="Signal"
                color="emerald"
                content={q.whenHit.signal}
              />
              <ResponseBlock
                label="Your response"
                color="brand"
                content={q.whenHit.response}
                large
              />
              <div className="p-3 rounded-lg bg-brand-50 border border-brand-200">
                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1.5">Bridge to VAI</p>
                <p className="text-sm text-brand-900 leading-relaxed">{q.whenHit.bridge}</p>
                <span className="inline-block mt-2 text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                  {q.whenHit.capability}
                </span>
              </div>
            </div>
          )}

          {/* Miss branch */}
          {branch === "miss" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-white flex items-center justify-center text-[10px]">→</span>
                  Pain not there — here's how to pivot
                </span>
                <button onClick={() => setBranch(null)} className="text-xs text-gray-400 hover:text-gray-600">
                  Reset
                </button>
              </div>
              <ResponseBlock
                label="What they say"
                color="amber"
                content={q.whenMiss.signal}
              />
              <ResponseBlock
                label="How to redirect"
                color="brand"
                content={q.whenMiss.redirect}
                large
              />
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5">Follow-on probe</p>
                <p className="text-sm text-amber-900 font-medium">"{q.whenMiss.probe}"</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Pain Points Tab ──────────────────────────────────────────────────────────
function PainPointsTab({ points }: { points: PainPoint[] }) {
  const [active, setActive] = useState<string | null>(null);

  const activePoint = points.find((p) => p.id === active);

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 px-1">
        When they surface a pain point, tap the chip to get your response.
      </p>
      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        {points.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(active === p.id ? null : p.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
              active === p.id
                ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:border-brand-400 hover:text-brand-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Active pain point card */}
      {activePoint && (
        <div className="bg-white border border-brand-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-4">
            <p className="text-[10px] font-bold text-brand-200 uppercase tracking-widest mb-1">Pain Point</p>
            <p className="text-white font-semibold text-base">{activePoint.label}</p>
          </div>
          <div className="p-5 space-y-4">
            <ResponseBlock label="They say" color="gray" content={`"${activePoint.signal}"`} />
            <ResponseBlock label="Your response" color="brand" content={activePoint.response} large />
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg">
              <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1.5">Bridge to VAI</p>
              <p className="text-sm text-brand-900 leading-relaxed">{activePoint.bridge}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                  {activePoint.capability}
                </span>
                {activePoint.stat && (
                  <span className="text-xs font-medium text-accent-600 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full">
                    {activePoint.stat}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!activePoint && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-sm">Tap a pain point chip to see your response script</p>
        </div>
      )}
    </div>
  );
}

// ─── Objections Tab ───────────────────────────────────────────────────────────
function ObjectionsTab({ objections }: { objections: Objection[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 px-1">
        Tap an objection to see the response. Check depth if they push back harder.
      </p>
      {objections.map((o) => (
        <div
          key={o.id}
          className={`bg-white border rounded-xl overflow-hidden transition-all ${
            open === o.id ? "border-brand-300 shadow-sm" : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <button
            className="w-full text-left p-4 flex items-start gap-3"
            onClick={() => setOpen(open === o.id ? null : o.id)}
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-500 text-xs font-bold flex items-center justify-center mt-0.5">!</span>
            <p className="text-sm font-medium text-gray-800 flex-1">"{o.objection}"</p>
            <svg
              viewBox="0 0 20 20"
              className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${open === o.id ? "rotate-180" : ""}`}
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {open === o.id && (
            <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
              <ResponseBlock label="Respond with" color="brand" content={o.response} large />
              {o.depth && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">If they push back harder</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{o.depth}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Scenarios Tab ────────────────────────────────────────────────────────────
function ScenariosTab({ scenarios }: { scenarios: Scenario[] }) {
  const [open, setOpen] = useState<string | null>(scenarios[0]?.id ?? null);

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 px-1">
        Use these to spark imagination. Pick the one most relevant to their world.
      </p>
      {scenarios.map((s) => (
        <div
          key={s.id}
          className={`bg-white border rounded-xl overflow-hidden transition-all ${
            open === s.id ? "border-brand-300 shadow-sm" : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <button
            className="w-full text-left p-4 flex items-start gap-3"
            onClick={() => setOpen(open === s.id ? null : s.id)}
          >
            <span className="flex-shrink-0 w-5 h-5 mt-0.5 text-brand-500">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </span>
            <p className="text-sm font-semibold text-gray-900 flex-1">{s.title}</p>
            <svg
              viewBox="0 0 20 20"
              className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${open === s.id ? "rotate-180" : ""}`}
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {open === s.id && (
            <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
              <ResponseBlock label="Set the scene" color="gray" content={`"Imagine... ${s.setup}"`} />
              <ResponseBlock label="Walk them through it" color="brand" content={s.walkthrough} large />
              <div className="p-3 bg-gradient-to-r from-brand-600 to-brand-700 rounded-lg">
                <p className="text-[10px] font-bold text-brand-200 uppercase tracking-widest mb-1">The punchline</p>
                <p className="text-sm text-white font-medium italic">{s.punchline}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Shared: ResponseBlock ────────────────────────────────────────────────────
function ResponseBlock({
  label,
  content,
  color,
  large,
}: {
  label: string;
  content: string;
  color: "brand" | "emerald" | "amber" | "gray";
  large?: boolean;
}) {
  const styles = {
    brand:   { bg: "bg-brand-50",   border: "border-brand-200",  label: "text-brand-600",  text: "text-brand-900" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200",label: "text-emerald-600",text: "text-emerald-900" },
    amber:   { bg: "bg-amber-50",   border: "border-amber-200",  label: "text-amber-600",  text: "text-amber-900" },
    gray:    { bg: "bg-gray-50",    border: "border-gray-200",   label: "text-gray-500",   text: "text-gray-700" },
  }[color];

  return (
    <div className={`p-3 rounded-lg border ${styles.bg} ${styles.border}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${styles.label}`}>{label}</p>
      <p className={`leading-relaxed ${styles.text} ${large ? "text-sm" : "text-xs"}`}>{content}</p>
    </div>
  );
}
