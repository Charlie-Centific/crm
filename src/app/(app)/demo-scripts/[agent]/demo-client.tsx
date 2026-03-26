"use client";

import { useState } from "react";
import type { DemoStep } from "@/lib/demo-scripts";

interface DemoClientProps {
  steps: DemoStep[];
  closingMessage: string;
}

export function DemoClient({ steps, closingMessage }: DemoClientProps) {
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(0);

  function toggle(i: number) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function reset() {
    setCompleted(new Set());
    setExpanded(0);
  }

  const progress = Math.round((completed.size / steps.length) * 100);
  const allDone = completed.size === steps.length;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {completed.size}/{steps.length} steps
        </span>
        <button
          onClick={reset}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Reset
        </button>
      </div>

      {/* Steps */}
      {steps.map((step, i) => {
        const done = completed.has(i);
        const open = expanded === i;

        return (
          <div
            key={i}
            className={`bg-white border rounded-xl transition-all ${
              done ? "border-green-200 bg-green-50" : "border-gray-200"
            }`}
          >
            {/* Step header */}
            <div className="flex items-center gap-3 p-4">
              {/* Checkbox */}
              <button
                onClick={() => toggle(i)}
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                  done
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300 hover:border-brand-400"
                }`}
                aria-label={done ? "Mark incomplete" : "Mark complete"}
              >
                {done && (
                  <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1,5 4,8 11,1" />
                  </svg>
                )}
              </button>

              {/* Step number + title */}
              <button
                onClick={() => setExpanded(open ? null : i)}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">Step {i + 1}</span>
                  {step.duration && (
                    <span className="text-xs text-gray-400">· {step.duration}</span>
                  )}
                </div>
                <p className={`text-sm font-semibold mt-0.5 ${done ? "text-green-700 line-through" : "text-gray-900"}`}>
                  {step.title}
                </p>
              </button>

              {/* Expand toggle */}
              <button
                onClick={() => setExpanded(open ? null : i)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <svg viewBox="0 0 20 20" className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Expanded content */}
            {open && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                <p className="text-sm text-gray-700 leading-relaxed">{step.talking}</p>
                {step.notes && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-700 mb-1">Presenter note</p>
                    <p className="text-xs text-amber-800">{step.notes}</p>
                  </div>
                )}
                <button
                  onClick={() => {
                    toggle(i);
                    const next = i + 1;
                    if (next < steps.length) setExpanded(next);
                  }}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  {done ? "Unmark" : "Mark complete"} {i < steps.length - 1 && !done ? "→ Next step" : ""}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Closing message */}
      {allDone && (
        <div className="mt-4 p-5 bg-brand-50 border border-brand-200 rounded-xl">
          <p className="text-xs font-semibold text-brand-700 mb-2 uppercase tracking-wide">Closing line</p>
          <p className="text-sm text-brand-900 font-medium italic">{closingMessage}</p>
        </div>
      )}
    </div>
  );
}
