"use client";

import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, X, Shield, Workflow, Download } from "lucide-react";
import type { Persona, Role, RoleCategory, AccessLevel } from "@/lib/workflow-static-data";
import { ROLES } from "@/lib/workflow-static-data";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PersonaWithContext = Persona & {
  workflowId: string;
  workflowName: string;
};

// ── Shared palette ────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "bg-blue-100",    text: "text-blue-700"    },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-violet-100",  text: "text-violet-700"  },
  { bg: "bg-amber-100",   text: "text-amber-700"   },
  { bg: "bg-rose-100",    text: "text-rose-700"    },
  { bg: "bg-cyan-100",    text: "text-cyan-700"    },
  { bg: "bg-orange-100",  text: "text-orange-700"  },
  { bg: "bg-pink-100",    text: "text-pink-700"    },
];

function paletteFor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

// ── Role category config ──────────────────────────────────────────────────────

const CATEGORY_META: Record<RoleCategory, { label: string; bg: string; text: string; border: string }> = {
  "command":           { label: "Command & Leadership",   bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200"    },
  "dispatch":          { label: "Emergency Dispatch",     bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"   },
  "field-ops":         { label: "Field Operations",       bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"    },
  "security-ops":      { label: "Security Operations",    bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200"  },
  "traffic-transport": { label: "Traffic & Transport",    bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200"    },
  "emergency-mgmt":    { label: "Emergency Management",   bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200"  },
  "compliance":        { label: "Compliance & Enforcement", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "records-intel":     { label: "Records & Intelligence", bg: "bg-gray-100",   text: "text-gray-700",    border: "border-gray-200"    },
  "operations":        { label: "Operations Support",     bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200"  },
};

// ── Access level config ───────────────────────────────────────────────────────

const ACCESS_META: Record<AccessLevel, { label: string; bg: string; text: string }> = {
  "command":    { label: "Command",    bg: "bg-rose-100",    text: "text-rose-800"    },
  "supervisor": { label: "Supervisor", bg: "bg-orange-100",  text: "text-orange-800"  },
  "operator":   { label: "Operator",   bg: "bg-blue-100",    text: "text-blue-800"    },
  "responder":  { label: "Responder",  bg: "bg-emerald-100", text: "text-emerald-800" },
  "analyst":    { label: "Analyst",    bg: "bg-violet-100",  text: "text-violet-800"  },
  "viewer":     { label: "Viewer",     bg: "bg-gray-100",    text: "text-gray-700"    },
};

// ── Root component ────────────────────────────────────────────────────────────

type Tab = "personas" | "roles";

interface Props {
  allPersonas: PersonaWithContext[];
}

export function SettingsClient({ allPersonas }: Props) {
  const [tab, setTab] = useState<Tab>("personas");

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "personas", label: "Personas", count: allPersonas.length },
    { id: "roles",    label: "Roles",    count: ROLES.length },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Global configuration and reference data</p>
        </div>
        <a
          href="/api/export"
          download
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          <Download size={14} />
          Export JSON
        </a>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {label}
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
              tab === id ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {tab === "personas" && <PersonasTab personas={allPersonas} />}
      {tab === "roles"    && <RolesTab />}
    </div>
  );
}

// ── Roles tab ─────────────────────────────────────────────────────────────────

function RolesTab() {
  const [search,          setSearch]          = useState("");
  const [activeCategory,  setActiveCategory]  = useState<RoleCategory | null>(null);
  const [activeAccess,    setActiveAccess]     = useState<AccessLevel | null>(null);
  const [selectedIdx,     setSelectedIdx]      = useState<number | null>(null);

  const filtered = useMemo(() => {
    let roles = ROLES;
    if (activeCategory) roles = roles.filter((r) => r.category === activeCategory);
    if (activeAccess)   roles = roles.filter((r) => r.accessLevel === activeAccess);
    if (search.trim()) {
      const q = search.toLowerCase();
      roles = roles.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          CATEGORY_META[r.category].label.toLowerCase().includes(q)
      );
    }
    return roles;
  }, [search, activeCategory, activeAccess]);

  const selected = selectedIdx !== null ? (filtered[selectedIdx] ?? null) : null;

  function select(idx: number) {
    setSelectedIdx((prev) => (prev === idx ? null : idx));
  }

  // Stats
  const categoryCount = new Set(ROLES.map((r) => r.category)).size;
  const accessLevels  = (Object.keys(ACCESS_META) as AccessLevel[]);

  // Category filter counts
  const catCounts = useMemo(() => {
    const map: Partial<Record<RoleCategory, number>> = {};
    for (const r of ROLES) map[r.category] = (map[r.category] ?? 0) + 1;
    return map;
  }, []);

  return (
    <div>
      {/* Stats */}
      <div className="flex items-center gap-6 mb-5">
        <Stat value={ROLES.length}   label="defined roles" large />
        <div className="w-px h-8 bg-gray-200" />
        <Stat value={categoryCount}  label="role categories" />
        <div className="w-px h-8 bg-gray-200" />
        <Stat value={accessLevels.length} label="access levels" />
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(CATEGORY_META) as RoleCategory[]).map((cat) => {
          const m     = CATEGORY_META[cat];
          const count = catCounts[cat] ?? 0;
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => { setActiveCategory((p) => (p === cat ? null : cat)); setSelectedIdx(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                active
                  ? `${m.bg} ${m.text} ${m.border} shadow-sm`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {m.label}
              <span className={`text-[9px] font-mono ${active ? "opacity-70" : "text-gray-400"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Access level filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest self-center mr-1">Access:</span>
        {accessLevels.map((lvl) => {
          const m = ACCESS_META[lvl];
          const active = activeAccess === lvl;
          return (
            <button
              key={lvl}
              onClick={() => { setActiveAccess((p) => (p === lvl ? null : lvl)); setSelectedIdx(null); }}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                active
                  ? `${m.bg} ${m.text} border-transparent shadow-sm`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {m.label}
            </button>
          );
        })}
        {(activeCategory || activeAccess || search.trim()) && (
          <button
            onClick={() => { setActiveCategory(null); setActiveAccess(null); setSearch(""); setSelectedIdx(null); }}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedIdx(null); }}
          placeholder="Search role, department, or category…"
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">No roles match your filters.</div>
      ) : (
        <>
          <p className="text-xs text-gray-400 font-medium mb-3">
            {(activeCategory || activeAccess || search.trim())
              ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
              : `All ${filtered.length} roles`}
          </p>

          {/* Card grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 mb-6">
            {filtered.map((role, idx) => {
              const cat    = CATEGORY_META[role.category];
              const access = ACCESS_META[role.accessLevel];
              const active = selectedIdx === idx;
              return (
                <button
                  key={role.id}
                  onClick={() => select(idx)}
                  className={`text-left rounded-2xl border p-4 transition-all hover:shadow-sm ${
                    active
                      ? "border-brand-400 bg-brand-50 shadow-sm ring-1 ring-brand-300"
                      : "border-gray-200 bg-white hover:border-brand-200 hover:bg-gray-50"
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-3 ${cat.bg} ${cat.text}`}>
                    {role.initials}
                  </div>

                  {/* Title */}
                  <p className="text-sm font-semibold text-gray-900 leading-snug mb-0.5 line-clamp-2">{role.title}</p>

                  {/* Department */}
                  <p className="text-[11px] text-gray-500 mb-2.5 line-clamp-1">{role.department}</p>

                  {/* Badges row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${cat.bg} ${cat.text} ${cat.border}`}>
                      {cat.label}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${access.bg} ${access.text}`}>
                      {access.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Detail panel */}
      {selected && (
        <RoleDetail
          role={selected}
          idx={selectedIdx!}
          total={filtered.length}
          onPrev={() => setSelectedIdx((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setSelectedIdx((i) => Math.min(filtered.length - 1, (i ?? 0) + 1))}
          onClose={() => setSelectedIdx(null)}
        />
      )}
    </div>
  );
}

// ── Role detail panel ─────────────────────────────────────────────────────────

function RoleDetail({
  role, idx, total, onPrev, onNext, onClose,
}: {
  role: Role;
  idx: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const cat    = CATEGORY_META[role.category];
  const access = ACCESS_META[role.accessLevel];

  const cjisColor =
    role.cjis === "full"    ? "bg-red-100 text-red-800"  :
    role.cjis === "limited" ? "bg-amber-100 text-amber-800" :
                              "bg-gray-100 text-gray-600";
  const cjisLabel =
    role.cjis === "full"    ? "CJIS Full" :
    role.cjis === "limited" ? "CJIS Limited" : "No CJIS";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 ${cat.bg} ${cat.text}`}>
            {role.initials}
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">{role.title}</p>
            <p className="text-sm text-gray-500 mb-1.5">{role.department}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border}`}>
                {cat.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${access.bg} ${access.text}`}>
                {access.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cjisColor}`}>
                {cjisLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onPrev} disabled={idx === 0} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-all">
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs text-gray-400 w-14 text-center tabular-nums">{idx + 1} / {total}</span>
          <button onClick={onNext} disabled={idx >= total - 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-all">
            <ChevronRight size={15} />
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all ml-1">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed mb-5 max-w-3xl">{role.description}</p>

      {/* Three columns */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
        <BulletSection
          title="Key Responsibilities"
          items={role.responsibilities}
          bg="bg-gray-50"
          dotColor="text-gray-400"
          titleColor="text-gray-500"
        />
        <BulletSection
          title="System Access"
          items={role.systemAccess}
          bg="bg-blue-50"
          dotColor="text-blue-300"
          titleColor="text-blue-600"
          icon={<Shield size={11} className="text-blue-400 flex-shrink-0 mt-0.5" />}
        />
        <div className="rounded-xl p-4 bg-brand-50">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-brand-600 flex items-center gap-1.5">
            <Workflow size={11} />
            Active in Workflows
          </p>
          {role.activatedIn.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Not yet assigned to a workflow</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {role.activatedIn.map((wfId) => (
                <span key={wfId} className="text-[10px] font-mono bg-white border border-brand-200 text-brand-700 px-2 py-0.5 rounded-full">
                  {wfId}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Personas tab ──────────────────────────────────────────────────────────────

function PersonasTab({ personas }: { personas: PersonaWithContext[] }) {
  const [search,       setSearch]       = useState("");
  const [selectedIdx,  setSelectedIdx]  = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return personas;
    const q = search.toLowerCase();
    return personas.filter(
      (p) =>
        p.role.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.workflowName.toLowerCase().includes(q) ||
        p.workflowId.toLowerCase().includes(q)
    );
  }, [personas, search]);

  const selected = selectedIdx !== null ? (filtered[selectedIdx] ?? null) : null;

  const uniqueRoles   = new Set(personas.map((p) => p.role)).size;
  const workflowCount = new Set(personas.map((p) => p.workflowId)).size;

  return (
    <div>
      {/* Stats */}
      <div className="flex items-center gap-6 mb-5">
        <Stat value={personas.length} label="total personas" large />
        <div className="w-px h-8 bg-gray-200" />
        <Stat value={uniqueRoles}     label="unique roles" />
        <div className="w-px h-8 bg-gray-200" />
        <Stat value={workflowCount}   label="workflows covered" />
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedIdx(null); }}
          placeholder="Search role, department, or workflow…"
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">No personas match your search.</div>
      ) : (
        <>
          <p className="text-xs text-gray-400 font-medium mb-3">
            {search.trim() ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : `All ${filtered.length} personas`}
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 mb-6">
            {filtered.map((p, idx) => {
              const pal    = paletteFor(p.role);
              const active = selectedIdx === idx;
              return (
                <button
                  key={`${p.workflowId}-${p.initials}-${idx}`}
                  onClick={() => setSelectedIdx((prev) => (prev === idx ? null : idx))}
                  className={`text-left rounded-2xl border p-4 transition-all hover:shadow-sm ${
                    active
                      ? "border-brand-400 bg-brand-50 shadow-sm ring-1 ring-brand-300"
                      : "border-gray-200 bg-white hover:border-brand-200 hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-3 ${pal.bg} ${pal.text}`}>
                    {p.initials}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug mb-0.5 line-clamp-2">{p.role}</p>
                  <p className="text-[11px] text-gray-500 mb-2.5 line-clamp-1">{p.department}</p>
                  <span className="inline-block text-[9px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {p.workflowId}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {selected && (
        <PersonaDetail
          persona={selected}
          idx={selectedIdx!}
          total={filtered.length}
          onPrev={() => setSelectedIdx((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setSelectedIdx((i) => Math.min(filtered.length - 1, (i ?? 0) + 1))}
          onClose={() => setSelectedIdx(null)}
        />
      )}
    </div>
  );
}

// ── Persona detail panel ──────────────────────────────────────────────────────

function PersonaDetail({
  persona, idx, total, onPrev, onNext, onClose,
}: {
  persona: PersonaWithContext;
  idx: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const pal = paletteFor(persona.role);
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 ${pal.bg} ${pal.text}`}>
            {persona.initials}
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">{persona.role}</p>
            <p className="text-sm text-gray-500">{persona.department}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-mono bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full border border-brand-100">
                {persona.workflowId}
              </span>
              <span className="text-xs text-gray-400">{persona.workflowName}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onPrev} disabled={idx === 0} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-all">
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs text-gray-400 w-14 text-center tabular-nums">{idx + 1} / {total}</span>
          <button onClick={onNext} disabled={idx >= total - 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-all">
            <ChevronRight size={15} />
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all ml-1">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <BulletSection title="Goals"                     items={persona.goals}       bg="bg-gray-50"    dotColor="text-gray-400"    titleColor="text-gray-500"    />
        <BulletSection title="Pain Points — without VAI™" items={persona.painPoints}  bg="bg-red-50"     dotColor="text-red-400"     titleColor="text-red-600"     />
        <BulletSection title="Gains — with VAI™"         items={persona.gains}       bg="bg-emerald-50" dotColor="text-emerald-400" titleColor="text-emerald-600" />
      </div>

      {persona.quote && (
        <blockquote className="mt-5 pl-4 border-l-2 border-brand-300 text-sm text-gray-500 italic leading-relaxed">
          {persona.quote}
        </blockquote>
      )}
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function Stat({ value, label, large }: { value: number; label: string; large?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`font-bold text-gray-900 ${large ? "text-3xl" : "text-xl"}`}>{value}</span>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  );
}

function BulletSection({
  title, items, bg, dotColor, titleColor, icon,
}: {
  title: string;
  items: string[];
  bg: string;
  dotColor: string;
  titleColor: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl p-4 ${bg}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${titleColor} flex items-center gap-1.5`}>
        {icon}
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className={`flex-shrink-0 mt-0.5 ${dotColor}`}>•</span>
            <span className="text-xs text-gray-700 leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
