"use client";

import { useState, useRef } from "react";

type ImportType = "accounts" | "contacts" | "opportunities";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

const ENTITY_CONFIG: Record<
  ImportType,
  { label: string; steps: string[]; order: number }
> = {
  accounts: {
    label: "Accounts",
    order: 1,
    steps: [
      "Dynamics 365 → Accounts",
      'Click "Export to Excel" in the toolbar',
      "Choose Static worksheet (not dynamic)",
      "Open in Excel → Save as CSV",
      "Upload here",
    ],
  },
  contacts: {
    label: "Contacts",
    order: 2,
    steps: [
      "Dynamics 365 → Contacts",
      'Click "Export to Excel"',
      "Save as CSV",
      "Upload here — import Accounts first so contacts link correctly",
    ],
  },
  opportunities: {
    label: "Opportunities",
    order: 3,
    steps: [
      "Dynamics 365 → Sales → Opportunities",
      'Click "Export to Excel"',
      "Save as CSV",
      "Upload here — import Accounts first",
    ],
  },
};

function UploadCard({
  type,
  label,
  order,
  steps,
}: {
  type: ImportType;
  label: string;
  order: number;
  steps: string[];
}) {
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    setResult(null);
    setErrorMsg(null);

    const form = new FormData();
    form.append("file", file);
    form.append("type", type);

    try {
      const res = await fetch("/api/import", { method: "POST", body: form });
      const data = await res.json();

      if (!data.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Unknown error");
        return;
      }

      setStatus("success");
      setResult({ imported: data.imported, skipped: data.skipped, errors: data.errors ?? [] });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Network error");
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
          {order}
        </span>
        <h2 className="font-semibold text-gray-900">{label}</h2>
      </div>

      <ol className="text-sm text-gray-500 space-y-1 mb-4 list-decimal list-inside">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all disabled:opacity-50"
      >
        {status === "uploading" ? "Importing..." : "Click to upload CSV"}
      </button>

      {status === "success" && result && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm">
          <p className="font-medium text-green-800">
            {result.imported} {label.toLowerCase()} imported
            {result.skipped > 0 && `, ${result.skipped} skipped`}
          </p>
          {result.errors.length > 0 && (
            <details className="mt-2">
              <summary className="text-yellow-700 cursor-pointer text-xs">
                {result.errors.length} warning(s)
              </summary>
              <ul className="mt-1 space-y-0.5">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-xs text-yellow-700">
                    {e}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {status === "error" && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">
          {errorMsg}
        </div>
      )}
    </div>
  );
}

export default function ImportPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Import from Dynamics 365</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Export data from Dynamics as CSV and upload here. No API access required.
          Import in order: Accounts → Contacts → Opportunities.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <p className="font-medium mb-1">How to export from Dynamics 365</p>
        <p>
          Open any list view (Accounts, Contacts, Opportunities) → click{" "}
          <strong>Export to Excel</strong> in the top toolbar → choose{" "}
          <strong>Static Worksheet</strong> → open in Excel → Save As CSV.
        </p>
      </div>

      <div className="space-y-4">
        {(Object.entries(ENTITY_CONFIG) as [ImportType, typeof ENTITY_CONFIG[ImportType]][]).map(
          ([type, config]) => (
            <UploadCard
              key={type}
              type={type}
              label={config.label}
              order={config.order}
              steps={config.steps}
            />
          )
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-500">
        <p className="font-medium text-gray-700 mb-1">Re-importing is safe</p>
        <p>
          Uploading the same file again will update existing records, not create duplicates.
          Re-import any time you export a fresh copy from Dynamics.
        </p>
      </div>
    </div>
  );
}
