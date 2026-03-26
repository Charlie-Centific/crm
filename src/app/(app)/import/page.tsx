"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Database,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronRight,
  CalendarDays,
  Tag,
  Shield,
  ExternalLink,
  X,
} from "lucide-react";

// ── CRM Import ──────────────────────────────────────────────────────────────

type ImportType = "accounts" | "contacts" | "opportunities";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

const ENTITY_CONFIG: Record<ImportType, { label: string; steps: string[]; order: number }> = {
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
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
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
        <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">{errorMsg}</div>
      )}
    </div>
  );
}

// ── RFP Analysis ─────────────────────────────────────────────────────────────

interface RFPRequirement {
  text: string;
  priority: "mandatory" | "preferred" | "optional";
  category: "technical" | "compliance" | "experience" | "general";
}

interface RFPAnalysis {
  title: string;
  agency: string;
  solicitationNumber: string | null;
  dueDate: string | null;
  issueDate: string | null;
  contactEmail: string | null;
  summary: string;
  scope: string;
  requirements: RFPRequirement[];
  glossary: Array<{ term: string; definition: string }>;
  evaluationCriteria: Array<{ criterion: string; weight: string | null; description: string }>;
  timeline: Array<{ date: string; event: string }>;
  complianceFlags: string[];
  verticalTags: string[];
  estimatedValue: string | null;
  setAside: string | null;
  naicsCode: string | null;
}

const PRIORITY_STYLES = {
  mandatory: "bg-red-100 text-red-700 border-red-200",
  preferred: "bg-amber-100 text-amber-700 border-amber-200",
  optional: "bg-gray-100 text-gray-600 border-gray-200",
};

const CATEGORY_STYLES = {
  technical: "bg-blue-50 text-blue-700",
  compliance: "bg-purple-50 text-purple-700",
  experience: "bg-teal-50 text-teal-700",
  general: "bg-gray-50 text-gray-600",
};

function RFPResults({
  analysis,
  fileName,
  onReset,
}: {
  analysis: RFPAnalysis;
  fileName: string;
  onReset: () => void;
}) {
  const mandatoryCount = analysis.requirements.filter((r) => r.priority === "mandatory").length;
  const complianceCount = analysis.requirements.filter((r) => r.category === "compliance").length;

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <FileText size={12} />
            <span>{fileName}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 leading-snug">{analysis.title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{analysis.agency}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/rfp"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            Open RFP Builder <ExternalLink size={13} />
          </Link>
          <button
            onClick={onReset}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Analyze another document"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2">
        {analysis.solicitationNumber && (
          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
            <Tag size={10} /> {analysis.solicitationNumber}
          </span>
        )}
        {analysis.dueDate && (
          <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
            <CalendarDays size={10} /> Due {analysis.dueDate}
          </span>
        )}
        {analysis.estimatedValue && (
          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
            {analysis.estimatedValue}
          </span>
        )}
        {analysis.setAside && (
          <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
            {analysis.setAside}
          </span>
        )}
        {analysis.naicsCode && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            NAICS {analysis.naicsCode}
          </span>
        )}
        {analysis.verticalTags.map((tag) => (
          <span key={tag} className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full capitalize">
            {tag.replace("-", " ")}
          </span>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-2">Summary</h3>
        <p className="text-sm text-blue-900 leading-relaxed">{analysis.summary}</p>
        {analysis.scope && (
          <p className="text-sm text-blue-700 mt-2 leading-relaxed">{analysis.scope}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{analysis.requirements.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Requirements</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{mandatoryCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Mandatory</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{complianceCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Compliance</p>
        </div>
      </div>

      {/* Compliance flags */}
      {analysis.complianceFlags.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 mb-3">
            <Shield size={14} className="text-purple-500" /> Compliance &amp; Certifications
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.complianceFlags.map((flag, i) => (
              <span key={i} className="text-sm bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-lg">
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      {analysis.requirements.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Requirements</h3>
          <div className="space-y-2">
            {analysis.requirements.map((req, i) => (
              <div key={i} className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0">
                <span
                  className={`text-xs px-2 py-0.5 rounded border font-medium flex-shrink-0 mt-0.5 ${PRIORITY_STYLES[req.priority]}`}
                >
                  {req.priority}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 mt-0.5 ${CATEGORY_STYLES[req.category]}`}
                >
                  {req.category}
                </span>
                <p className="text-sm text-gray-700 leading-snug">{req.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluation Criteria */}
      {analysis.evaluationCriteria.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Evaluation Criteria</h3>
          <div className="space-y-2">
            {analysis.evaluationCriteria.map((c, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {c.criterion}
                    {c.weight && (
                      <span className="ml-2 text-xs text-brand-600 font-semibold">{c.weight}</span>
                    )}
                  </p>
                  {c.description && <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>}
                </div>
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {analysis.timeline.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Timeline</h3>
          <div className="relative pl-4">
            <div className="absolute left-0 top-1 bottom-1 w-px bg-gray-200" />
            {analysis.timeline.map((item, i) => (
              <div key={i} className="relative pl-4 pb-3 last:pb-0">
                <div className="absolute left-[-1px] top-1.5 w-2 h-2 rounded-full bg-brand-500 border-2 border-white ring-1 ring-brand-200" />
                <p className="text-xs text-brand-600 font-medium">{item.date}</p>
                <p className="text-sm text-gray-700">{item.event}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Glossary */}
      {analysis.glossary.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Glossary &amp; Abbreviations</h3>
          <div className="grid grid-cols-1 gap-1.5">
            {analysis.glossary.map((g, i) => (
              <div key={i} className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-xs font-mono font-semibold text-gray-800 w-24 flex-shrink-0 pt-0.5">
                  {g.term}
                </span>
                <span className="text-sm text-gray-600">{g.definition}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact */}
      {analysis.contactEmail && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
          <span className="font-medium text-gray-700">Point of Contact: </span>
          <a href={`mailto:${analysis.contactEmail}`} className="text-brand-600 hover:underline">
            {analysis.contactEmail}
          </a>
        </div>
      )}
    </div>
  );
}

function RFPUploadTab() {
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<"idle" | "analyzing" | "done" | "error">("idle");
  const [analysis, setAnalysis] = useState<RFPAnalysis | null>(null);
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setStatus("analyzing");
    setAnalysis(null);
    setErrorMsg(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/import/rfp", { method: "POST", body: form });
      const data = await res.json();

      if (!data.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Analysis failed");
        return;
      }

      setAnalysis(data.analysis);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Network error");
    }
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (status === "done" && analysis) {
    return (
      <RFPResults
        analysis={analysis}
        fileName={fileName}
        onReset={() => {
          setStatus("idle");
          setAnalysis(null);
          setFileName("");
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">AI-Powered RFP / RFI Analysis</p>
        <p>
          Upload a government solicitation document. Claude will extract the summary, requirements,
          evaluation criteria, timeline, glossary, and compliance flags — ready to feed into the RFP Builder.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => status !== "analyzing" && inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
          ${dragOver ? "border-brand-400 bg-brand-50" : "border-gray-300 hover:border-brand-300 hover:bg-gray-50"}
          ${status === "analyzing" ? "pointer-events-none opacity-70" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {status === "analyzing" ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={36} className="text-brand-500 animate-spin" />
            <p className="text-sm font-medium text-gray-700">Analyzing {fileName}…</p>
            <p className="text-xs text-gray-400">Claude is extracting requirements, glossary, and timeline</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Upload size={24} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Drop RFP / RFI document here</p>
              <p className="text-xs text-gray-400 mt-0.5">or click to browse</p>
            </div>
            <div className="flex gap-2 mt-1">
              {["PDF", "TXT", "DOCX"].map((ext) => (
                <span key={ext} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                  {ext}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {status === "error" && (
        <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Analysis failed</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { icon: FileText, label: "Extracts Requirements", desc: "Mandatory vs preferred, categorized" },
          { icon: CalendarDays, label: "Builds Timeline", desc: "Key dates and milestones" },
          { icon: Shield, label: "Flags Compliance", desc: "CJIS, FedRAMP, certifications" },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <Icon size={18} className="text-brand-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

type Tab = "crm" | "rfp";

export default function ImportPage() {
  const [tab, setTab] = useState<Tab>("crm");

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Import</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Import CRM data from Dynamics 365, or analyze an RFP / RFI with AI.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setTab("crm")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "crm"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Database size={14} />
          CRM Data
        </button>
        <button
          onClick={() => setTab("rfp")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "rfp"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText size={14} />
          RFP / RFI
        </button>
      </div>

      {/* Tab content */}
      {tab === "crm" && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
            <p className="font-medium mb-1">How to export from Dynamics 365</p>
            <p>
              Open any list view (Accounts, Contacts, Opportunities) → click{" "}
              <strong>Export to Excel</strong> in the top toolbar → choose{" "}
              <strong>Static Worksheet</strong> → open in Excel → Save As CSV.
            </p>
          </div>

          <div className="space-y-4">
            {(
              Object.entries(ENTITY_CONFIG) as [
                ImportType,
                (typeof ENTITY_CONFIG)[ImportType],
              ][]
            ).map(([type, config]) => (
              <UploadCard
                key={type}
                type={type}
                label={config.label}
                order={config.order}
                steps={config.steps}
              />
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-500">
            <p className="font-medium text-gray-700 mb-1">Re-importing is safe</p>
            <p>
              Uploading the same file again will update existing records, not create duplicates.
              Re-import any time you export a fresh copy from Dynamics.
            </p>
          </div>
        </div>
      )}

      {tab === "rfp" && <RFPUploadTab />}
    </div>
  );
}
