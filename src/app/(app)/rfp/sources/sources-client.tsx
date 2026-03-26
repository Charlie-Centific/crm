"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Landmark,
  FlaskConical,
  TrendingUp,
  Mail,
  Upload,
  Zap,
  Rss,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Pause,
  Play,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  List,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SourceType = "sam_gov" | "sbir" | "govwin" | "email" | "upload" | "webhook" | "rss";
type Schedule   = "realtime" | "hourly" | "daily" | "weekly";
type Status     = "active" | "paused" | "error";

interface SourceFilters {
  keywords:   string[];
  naicsCodes: string[];
  agencies:   string[];
  setAsides:  string[];
  valueMin:   number | null;
  valueMax:   number | null;
}

interface RfpSource {
  id: string;
  type: string;
  label: string;
  enabled: boolean;
  credentials: string | null;
  filters: string;
  schedule: string;
  lastSyncAt: string | null;
  lastSyncCount: number | null;
  status: string;
  statusMessage: string | null;
  isMock: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RfpListing {
  id: string;
  sourceId: string;
  externalId: string;
  title: string;
  description: string | null;
  agency: string | null;
  naicsCode: string | null;
  setAside: string | null;
  postedDate: string | null;
  dueDate: string | null;
  valueMin: number | null;
  valueMax: number | null;
  url: string | null;
  sourceType: string;
  fetchedAt: string;
}

// ─── Source type metadata ─────────────────────────────────────────────────────

const SOURCE_TYPES: Record<SourceType, {
  label: string;
  Icon: React.ElementType;
  color: string;       // Tailwind border/bg token fragment
  badge: string;       // Tailwind text color
  description: string;
  credentialFields: { key: string; label: string; type: string; hint?: string }[];
  hasFilters: boolean;
}> = {
  sam_gov: {
    label: "SAM.gov",
    Icon: Landmark,
    color: "blue",
    badge: "text-blue-700 bg-blue-50 border-blue-200",
    description: "US Federal procurement — free REST API",
    credentialFields: [{ key: "apiKey", label: "API Key", type: "password", hint: "Free from api.sam.gov" }],
    hasFilters: true,
  },
  sbir: {
    label: "SBIR.gov",
    Icon: FlaskConical,
    color: "purple",
    badge: "text-purple-700 bg-purple-50 border-purple-200",
    description: "Small Business Innovation Research R&D grants",
    credentialFields: [],
    hasFilters: true,
  },
  govwin: {
    label: "GovWin IQ",
    Icon: TrendingUp,
    color: "orange",
    badge: "text-orange-700 bg-orange-50 border-orange-200",
    description: "State, local & federal aggregator (paid)",
    credentialFields: [
      { key: "apiKey",     label: "API Key",    type: "password" },
      { key: "accountId", label: "Account ID", type: "text" },
    ],
    hasFilters: true,
  },
  email: {
    label: "Email Ingest",
    Icon: Mail,
    color: "green",
    badge: "text-green-700 bg-green-50 border-green-200",
    description: "Forward RFP emails to a monitored inbox",
    credentialFields: [{ key: "emailAddress", label: "Forwarding Address", type: "email", hint: "e.g. rfp@centific.com" }],
    hasFilters: false,
  },
  upload: {
    label: "File Upload",
    Icon: Upload,
    color: "gray",
    badge: "text-gray-600 bg-gray-50 border-gray-200",
    description: "Manually upload PDF or Word RFP documents",
    credentialFields: [],
    hasFilters: false,
  },
  webhook: {
    label: "Webhook",
    Icon: Zap,
    color: "indigo",
    badge: "text-indigo-700 bg-indigo-50 border-indigo-200",
    description: "Receive RFPs via API push from partners",
    credentialFields: [{ key: "secret", label: "Webhook Secret", type: "password", hint: "Shared secret for HMAC verification" }],
    hasFilters: false,
  },
  rss: {
    label: "RSS / Atom Feed",
    Icon: Rss,
    color: "amber",
    badge: "text-amber-700 bg-amber-50 border-amber-200",
    description: "Subscribe to procurement portal RSS feeds",
    credentialFields: [{ key: "feedUrl", label: "Feed URL", type: "url", hint: "e.g. https://www.calopps.org/feeds/rss.xml" }],
    hasFilters: true,
  },
};

const SET_ASIDES = ["8(a)", "WOSB", "HUBZone", "SDVOSB", "VOSB", "SBA"];

const DEFAULT_FILTERS: SourceFilters = {
  keywords:   [],
  naicsCodes: [],
  agencies:   [],
  setAsides:  [],
  valueMin:   null,
  valueMax:   null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseJSON<T>(s: string | null | undefined, fallback: T): T {
  try { return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TagInput({
  tags, onChange, placeholder,
}: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");

  function add() {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-lg min-h-[40px] focus-within:ring-2 focus-within:ring-brand-300 focus-within:border-brand-400 transition-all">
      {tags.map((t) => (
        <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 text-xs rounded-md font-medium">
          {t}
          <button onClick={() => onChange(tags.filter((x) => x !== t))} className="text-brand-400 hover:text-brand-700">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] text-xs outline-none bg-transparent placeholder-gray-400"
      />
    </div>
  );
}

// ─── Listings drawer ─────────────────────────────────────────────────────────

function ListingsDrawer({
  source, onClose,
}: { source: RfpSource; onClose: () => void }) {
  const [listings, setListings]   = useState<RfpListing[] | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/rfp-sources/${source.id}/listings?limit=100`)
      .then((r) => r.json())
      .then((data) => { setListings(data); setLoading(false); })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, [source.id]);

  const typeCfg = SOURCE_TYPES[source.type as SourceType] ?? SOURCE_TYPES.upload;

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatValue(min: number | null, max: number | null) {
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;
    if (max) return fmt(max);
    if (min) return `≥ ${fmt(min)}`;
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[560px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{source.label}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {listings ? `${listings.length} listing${listings.length !== 1 ? "s" : ""}` : "Loading…"}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-40 gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading listings…</span>
            </div>
          )}
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          {listings && listings.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
              <List size={24} className="text-gray-300" />
              <p className="text-sm">No results yet — try syncing this source.</p>
            </div>
          )}
          {listings && listings.length > 0 && (
            <div className="divide-y divide-gray-100">
              {listings.map((l) => {
                const value = formatValue(l.valueMin, l.valueMax);
                return (
                  <div key={l.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 leading-snug mb-1 line-clamp-2">
                          {l.title}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                          {l.agency && <span className="font-medium text-gray-500">{l.agency}</span>}
                          {l.agency && <span>·</span>}
                          {l.dueDate && (
                            <span className={cn(
                              new Date(l.dueDate) < new Date() ? "text-red-500" : "text-gray-400"
                            )}>
                              Due {formatDate(l.dueDate)}
                            </span>
                          )}
                          {l.naicsCode && <span>· NAICS {l.naicsCode}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {l.setAside && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {l.setAside}
                            </span>
                          )}
                          {value && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                              {value}
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${typeCfg.badge}`}>
                            {typeCfg.label}
                          </span>
                        </div>
                        {l.description && (
                          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                            {l.description}
                          </p>
                        )}
                      </div>
                      {l.url && (
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg border border-brand-200 transition-all"
                        >
                          <ExternalLink size={11} />
                          View
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Source card ──────────────────────────────────────────────────────────────

function SourceCard({
  source, onEdit, onDelete, onToggle, onSync, onBrowse,
}: {
  source: RfpSource;
  onEdit: (s: RfpSource) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onSync: (id: string) => void;
  onBrowse: (s: RfpSource) => void;
}) {
  const [syncing, setSyncing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const typeCfg = SOURCE_TYPES[source.type as SourceType] ?? SOURCE_TYPES.upload;
  const { Icon } = typeCfg;
  const filters = parseJSON<SourceFilters>(source.filters, DEFAULT_FILTERS);
  const status = source.status as Status;

  const statusIcon = {
    active: <CheckCircle2 size={13} className="text-green-500" />,
    paused: <Clock        size={13} className="text-amber-500" />,
    error:  <AlertCircle  size={13} className="text-red-500"   />,
  }[status];

  const statusLabel = {
    active: "Active",
    paused: "Paused",
    error:  "Error",
  }[status];

  const scheduleLabel: Record<string, string> = {
    realtime: "Real-time",
    hourly:   "Hourly",
    daily:    "Daily",
    weekly:   "Weekly",
  };

  async function handleSync() {
    setSyncing(true);
    try {
      await onSync(source.id);
    } finally {
      setSyncing(false);
    }
  }

  const hasFiltersToShow =
    (filters.keywords?.length ?? 0)  > 0 ||
    (filters.naicsCodes?.length ?? 0) > 0 ||
    (filters.agencies?.length ?? 0)   > 0 ||
    (filters.setAsides?.length ?? 0)  > 0 ||
    filters.valueMin != null ||
    filters.valueMax != null;

  return (
    <div className={cn(
      "bg-white border rounded-xl overflow-hidden transition-all",
      source.enabled ? "border-gray-200 hover:border-gray-300 hover:shadow-sm" : "border-gray-200 opacity-60"
    )}>
      {/* Color bar */}
      <div className={`h-1 bg-${typeCfg.color}-400`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg bg-${typeCfg.color}-50 border border-${typeCfg.color}-200 flex items-center justify-center flex-shrink-0`}>
              <Icon size={16} className={`text-${typeCfg.color}-600`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900">{source.label}</span>
                {/* Mock / Live badge */}
                {source.isMock ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
                    <WifiOff size={9} /> Mock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide">
                    <Wifi size={9} /> Live
                  </span>
                )}
              </div>
              <span className={`inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border ${typeCfg.badge}`}>
                {typeCfg.label}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
            {statusIcon}
            <span>{statusLabel}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400 mb-0.5">Schedule</p>
            <p className="text-xs font-semibold text-gray-700">{scheduleLabel[source.schedule] ?? source.schedule}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400 mb-0.5">Last Sync</p>
            <p className="text-xs font-semibold text-gray-700">{relativeTime(source.lastSyncAt)}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400 mb-0.5">Results</p>
            <p className="text-xs font-semibold text-gray-700">
              {source.lastSyncCount != null ? source.lastSyncCount : "—"}
            </p>
          </div>
        </div>

        {/* Filters toggle */}
        {hasFiltersToShow && (
          <div className="mb-4">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              Filters
            </button>

            {showFilters && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {filters.keywords?.map((k) => (
                  <span key={k} className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-medium rounded-full border border-brand-100">
                    {k}
                  </span>
                ))}
                {filters.naicsCodes?.map((n) => (
                  <span key={n} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-mono rounded-full">
                    NAICS {n}
                  </span>
                ))}
                {filters.agencies?.map((a) => (
                  <span key={a} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-medium rounded-full border border-indigo-100">
                    {a}
                  </span>
                ))}
                {filters.setAsides?.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded-full border border-emerald-100">
                    {s}
                  </span>
                ))}
                {(filters.valueMin != null || filters.valueMax != null) && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">
                    ${filters.valueMin != null ? (filters.valueMin / 1000).toFixed(0) + "K" : "0"} –{" "}
                    {filters.valueMax != null ? "$" + (filters.valueMax / 1000).toFixed(0) + "K" : "no max"}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(source)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              onClick={() => onToggle(source.id, !source.enabled)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              {source.enabled ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Resume</>}
            </button>
            <button
              onClick={() => onDelete(source.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {source.lastSyncCount != null && source.lastSyncCount > 0 && (
              <button
                onClick={() => onBrowse(source)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-brand-300 text-brand-700 rounded-lg hover:bg-brand-50 transition-all"
              >
                <List size={12} />
                {source.lastSyncCount} Results
              </button>
            )}
            {source.type !== "upload" && (
              <button
                onClick={handleSync}
                disabled={syncing || !source.enabled}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
                {syncing ? "Syncing…" : "Sync Now"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Source form (used in slide-over) ────────────────────────────────────────

interface FormState {
  label:       string;
  type:        SourceType;
  schedule:    Schedule;
  credentials: Record<string, string>;
  filters:     SourceFilters;
}

function sourceToForm(s: RfpSource): FormState {
  return {
    label:       s.label,
    type:        s.type as SourceType,
    schedule:    s.schedule as Schedule,
    credentials: parseJSON<Record<string, string>>(s.credentials, {}),
    filters:     parseJSON<SourceFilters>(s.filters, DEFAULT_FILTERS),
  };
}

const BLANK_FORM: FormState = {
  label:       "",
  type:        "sam_gov",
  schedule:    "daily",
  credentials: {},
  filters:     { ...DEFAULT_FILTERS },
};

function SourceForm({
  initial, onSave, onCancel, saving,
}: {
  initial: FormState;
  onSave: (f: FormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const typeCfg = SOURCE_TYPES[form.type];

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function setCred(key: string, val: string) {
    setForm((p) => ({ ...p, credentials: { ...p.credentials, [key]: val } }));
  }

  function setFilter<K extends keyof SourceFilters>(k: K, v: SourceFilters[K]) {
    setForm((p) => ({ ...p, filters: { ...p.filters, [k]: v } }));
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        {/* Basic */}
        <section>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Basic Info</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setField("label", e.target.value)}
                placeholder="e.g. SAM.gov — Federal Opportunities"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Source Type</label>
              <div className="relative">
                <select
                  value={form.type}
                  onChange={(e) => {
                    setField("type", e.target.value as SourceType);
                    setField("credentials", {});
                  }}
                  className="w-full appearance-none px-3 py-2 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                >
                  {(Object.entries(SOURCE_TYPES) as [SourceType, typeof SOURCE_TYPES[SourceType]][]).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{typeCfg.description}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sync Schedule</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["realtime", "hourly", "daily", "weekly"] as Schedule[]).map((s) => {
                  const labels = { realtime: "Real-time", hourly: "Hourly", daily: "Daily", weekly: "Weekly" };
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setField("schedule", s)}
                      className={cn(
                        "py-1.5 rounded-lg text-xs font-medium border transition-all",
                        form.schedule === s
                          ? "bg-brand-50 border-brand-300 text-brand-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      )}
                    >
                      {labels[s]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Credentials */}
        {typeCfg.credentialFields.length > 0 && (
          <section>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Credentials</h3>
            <div className="space-y-3">
              {typeCfg.credentialFields.map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={form.credentials[f.key] ?? ""}
                    onChange={(e) => setCred(f.key, e.target.value)}
                    placeholder={f.hint}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 font-mono"
                  />
                  {f.hint && <p className="text-xs text-gray-400 mt-1">{f.hint}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        {typeCfg.hasFilters && (
          <section>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Filters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Keywords</label>
                <TagInput
                  tags={form.filters.keywords}
                  onChange={(v) => setFilter("keywords", v)}
                  placeholder="Add keyword, press Enter…"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">NAICS Codes</label>
                <TagInput
                  tags={form.filters.naicsCodes}
                  onChange={(v) => setFilter("naicsCodes", v)}
                  placeholder="541511, 541715…"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Agencies</label>
                <TagInput
                  tags={form.filters.agencies}
                  onChange={(v) => setFilter("agencies", v)}
                  placeholder="DoD, DHS, NSF…"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Set-Asides</label>
                <div className="flex flex-wrap gap-2">
                  {SET_ASIDES.map((sa) => {
                    const active = form.filters.setAsides.includes(sa);
                    return (
                      <button
                        key={sa}
                        type="button"
                        onClick={() => setFilter("setAsides", active ? form.filters.setAsides.filter((x) => x !== sa) : [...form.filters.setAsides, sa])}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                          active
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        )}
                      >
                        {sa}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Min Value ($)</label>
                  <input
                    type="number"
                    value={form.filters.valueMin ?? ""}
                    onChange={(e) => setFilter("valueMin", e.target.value ? Number(e.target.value) : null)}
                    placeholder="e.g. 100000"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Max Value ($)</label>
                  <input
                    type="number"
                    value={form.filters.valueMax ?? ""}
                    onChange={(e) => setFilter("valueMax", e.target.value ? Number(e.target.value) : null)}
                    placeholder="No limit"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={!form.label || saving}
          className="px-5 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {saving ? "Saving…" : "Save Source"}
        </button>
      </div>
    </div>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────

export function SourcesClient({ initialSources }: { initialSources: RfpSource[] }) {
  const [sources, setSources]         = useState<RfpSource[]>(initialSources);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [editing, setEditing]         = useState<RfpSource | null>(null);
  const [saving, setSaving]           = useState(false);
  const [listingsSource, setListingsSource] = useState<RfpSource | null>(null);

  const activeSources = sources.filter((s) => s.enabled && s.status === "active");
  const mockCount     = sources.filter((s) => s.isMock).length;
  const liveCount     = sources.filter((s) => !s.isMock).length;

  function openAdd()               { setEditing(null); setDrawerOpen(true); }
  function openEdit(s: RfpSource)  { setEditing(s);    setDrawerOpen(true); }
  function closeDrawer()           { setDrawerOpen(false); setEditing(null); }

  const handleSave = useCallback(async (form: FormState) => {
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/rfp-sources/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label:       form.label,
            schedule:    form.schedule,
            credentials: form.credentials,
            filters:     form.filters,
          }),
        });
        const updated = await res.json();
        setSources((prev) => prev.map((s) => s.id === editing.id ? updated : s));
      } else {
        const res = await fetch("/api/rfp-sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form }),
        });
        const created = await res.json();
        setSources((prev) => [created, ...prev]);
      }
      closeDrawer();
    } finally {
      setSaving(false);
    }
  }, [editing]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this source?")) return;
    await fetch(`/api/rfp-sources/${id}`, { method: "DELETE" });
    setSources((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleToggle = useCallback(async (id: string, enabled: boolean) => {
    const res = await fetch(`/api/rfp-sources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled, status: enabled ? "active" : "paused" }),
    });
    const updated = await res.json();
    setSources((prev) => prev.map((s) => s.id === id ? updated : s));
  }, []);

  const handleSync = useCallback(async (id: string) => {
    const res = await fetch(`/api/rfp-sources/${id}/sync`, { method: "POST" });
    const data = await res.json();
    if (data.source) {
      setSources((prev) => prev.map((s) => s.id === id ? data.source : s));
    }
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1">Intelligence</p>
          <h1 className="text-2xl font-bold text-gray-900">RFP Sources</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Configure where RFPs are pulled from. Each source can be filtered by keywords, NAICS codes, and agencies.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-all flex-shrink-0"
        >
          <Plus size={15} /> Add Source
        </button>
      </div>

      {/* Mock data notice */}
      {mockCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 mb-6 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <WifiOff size={16} className="text-amber-500 flex-shrink-0" />
          <span className="text-amber-800">
            <strong>{mockCount} source{mockCount > 1 ? "s" : ""}</strong> use simulated mock data.
            Connect live credentials to start pulling real RFPs.
            {liveCount > 0 && <span className="ml-1 text-amber-600">({liveCount} live source{liveCount > 1 ? "s" : ""} active.)</span>}
          </span>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Sources", value: sources.length },
          { label: "Active",        value: activeSources.length },
          { label: "Mock",          value: mockCount,  sub: "simulated" },
          { label: "Live",          value: liveCount,  sub: "connected" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            {sub && <p className="text-[10px] text-gray-300 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Sources grid */}
      {sources.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No sources configured yet.</p>
          <button onClick={openAdd} className="mt-3 text-sm text-brand-600 hover:underline">Add your first source →</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {sources.map((s) => (
            <SourceCard
              key={s.id}
              source={s}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onSync={handleSync}
              onBrowse={setListingsSource}
            />
          ))}
        </div>
      )}

      {/* ── Listings drawer ───────────────────────────────────────────────── */}
      {listingsSource && (
        <ListingsDrawer
          source={listingsSource}
          onClose={() => setListingsSource(null)}
        />
      )}

      {/* ── Add/Edit slide-over ────────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/30 z-50" onClick={closeDrawer} />
      )}
      <div className={cn(
        "fixed top-0 right-0 h-full w-[480px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col transition-transform duration-200",
        drawerOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            {editing ? "Edit Source" : "Add Source"}
          </h2>
          <button onClick={closeDrawer} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <X size={15} />
          </button>
        </div>
        <SourceForm
          initial={editing ? sourceToForm(editing) : BLANK_FORM}
          onSave={handleSave}
          onCancel={closeDrawer}
          saving={saving}
        />
      </div>
    </>
  );
}
