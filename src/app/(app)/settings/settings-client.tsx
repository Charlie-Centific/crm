"use client";

import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowLeft, Shield, Workflow, Download } from "lucide-react";
import type { Persona, Role, RoleCategory, AccessLevel } from "@/lib/workflow-static-data";
import { ROLES } from "@/lib/workflow-static-data";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PersonaWithContext = Persona & {
  workflowId: string;
  workflowName: string;
};

// ── Shared helpers ────────────────────────────────────────────────────────────

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

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORY_META: Record<RoleCategory, { label: string; bg: string; text: string; border: string; dot: string }> = {
  "command":           { label: "Command & Leadership",     bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-400"    },
  "dispatch":          { label: "Emergency Dispatch",       bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"   },
  "field-ops":         { label: "Field Operations",         bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-400"    },
  "security-ops":      { label: "Security Operations",      bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  dot: "bg-violet-400"  },
  "traffic-transport": { label: "Traffic & Transport",      bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",    dot: "bg-cyan-500"    },
  "emergency-mgmt":    { label: "Emergency Management",     bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  dot: "bg-orange-400"  },
  "compliance":        { label: "Compliance & Enforcement", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
  "records-intel":     { label: "Records & Intelligence",   bg: "bg-gray-100",   text: "text-gray-700",    border: "border-gray-200",    dot: "bg-gray-400"    },
  "operations":        { label: "Operations Support",       bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  dot: "bg-indigo-400"  },
  "external":          { label: "External & Public",        bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",    dot: "bg-teal-400"    },
};

// ── Access level config ───────────────────────────────────────────────────────

const ACCESS_META: Record<AccessLevel, { label: string; bg: string; text: string; description: string }> = {
  "command":    { label: "Command",    bg: "bg-rose-100",    text: "text-rose-800",    description: "Full system authority + tactical override" },
  "supervisor": { label: "Supervisor", bg: "bg-orange-100",  text: "text-orange-800",  description: "Team lead — elevated ops, no system config"  },
  "operator":   { label: "Operator",   bg: "bg-blue-100",    text: "text-blue-800",    description: "Active platform user — create & update"      },
  "responder":  { label: "Responder",  bg: "bg-emerald-100", text: "text-emerald-800", description: "Field user — receive tasks, limited write"    },
  "analyst":    { label: "Analyst",    bg: "bg-violet-100",  text: "text-violet-800",  description: "Read + annotate — no incident creation"       },
  "viewer":     { label: "Viewer",     bg: "bg-gray-100",    text: "text-gray-700",    description: "Read-only — dashboards and reports"           },
};

// ── Root ──────────────────────────────────────────────────────────────────────

type Tab = "personas" | "roles";

interface Props { allPersonas: PersonaWithContext[] }

export function SettingsClient({ allPersonas }: Props) {
  const [tab, setTab] = useState<Tab>("personas");

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

      <div className="flex border-b border-gray-200 mb-6">
        {([
          { id: "personas" as Tab, label: "Personas", count: allPersonas.length },
          { id: "roles"    as Tab, label: "Roles",    count: ROLES.length       },
        ]).map(({ id, label, count }) => (
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
            }`}>{count}</span>
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
  const [search,         setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState<RoleCategory | null>(null);
  const [selected,       setSelected]       = useState<number | null>(null);

  const filtered = useMemo(() => {
    let roles = ROLES;
    if (activeCategory) roles = roles.filter((r) => r.category === activeCategory);
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
  }, [search, activeCategory]);

  const catCounts = useMemo(() => {
    const map: Partial<Record<RoleCategory, number>> = {};
    for (const r of ROLES) map[r.category] = (map[r.category] ?? 0) + 1;
    return map;
  }, []);

  // ── Detail view ──
  if (selected !== null && filtered[selected]) {
    const role = filtered[selected];
    return (
      <RoleDetail
        role={role}
        idx={selected}
        total={filtered.length}
        onPrev={() => setSelected((i) => Math.max(0, (i ?? 0) - 1))}
        onNext={() => setSelected((i) => Math.min(filtered.length - 1, (i ?? 0) + 1))}
        onBack={() => setSelected(null)}
      />
    );
  }

  // ── List view ──
  return (
    <div>
      {/* Stats */}
      <div className="flex items-center gap-5 mb-5">
        <Stat value={ROLES.length}  label="roles" large />
        <div className="w-px h-7 bg-gray-200" />
        <Stat value={Object.keys(catCounts).length} label="categories" />
        <div className="w-px h-7 bg-gray-200" />
        <Stat value={Object.keys(ACCESS_META).length} label="access levels" />
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
          placeholder="Search roles…"
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(Object.keys(CATEGORY_META) as RoleCategory[]).map((cat) => {
          const m     = CATEGORY_META[cat];
          const count = catCounts[cat] ?? 0;
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => { setActiveCategory((p) => (p === cat ? null : cat)); setSelected(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                active
                  ? `${m.bg} ${m.text} ${m.border} shadow-sm ring-1 ${m.border}`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${active ? m.dot : "bg-gray-300"}`} />
              {m.label}
              <span className="text-[9px] font-mono opacity-60">{count}</span>
            </button>
          );
        })}
        {(activeCategory || search.trim()) && (
          <button
            onClick={() => { setActiveCategory(null); setSearch(""); }}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 font-medium mb-3">
        {(activeCategory || search.trim()) ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : `All ${filtered.length} roles`}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">No roles match.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((role, idx) => {
            const cat    = CATEGORY_META[role.category];
            const access = ACCESS_META[role.accessLevel];
            return (
              <button
                key={role.id}
                onClick={() => setSelected(idx)}
                className="text-left rounded-2xl border border-gray-200 bg-white p-4 hover:border-brand-300 hover:shadow-md transition-all group"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold mb-3 ${cat.bg} ${cat.text}`}>
                  {role.initials}
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-snug mb-0.5 line-clamp-2 group-hover:text-brand-700 transition-colors">{role.title}</p>
                <p className="text-[11px] text-gray-400 mb-3 line-clamp-1">{role.department}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${access.bg} ${access.text}`}>
                    {access.label}
                  </span>
                  <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border}`}>
                    {cat.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Role detail (full-page) ───────────────────────────────────────────────────

function RoleDetail({
  role, idx, total, onPrev, onNext, onBack,
}: {
  role: Role;
  idx: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const cat    = CATEGORY_META[role.category];
  const access = ACCESS_META[role.accessLevel];
  const cjis   = role.cjis === "full"    ? { label: "CJIS Full Access",    bg: "bg-red-100",   text: "text-red-800"   }
               : role.cjis === "limited" ? { label: "CJIS Limited",        bg: "bg-amber-100", text: "text-amber-800" }
               :                           { label: "No CJIS",             bg: "bg-gray-100",  text: "text-gray-600"  };

  return (
    <div>
      {/* Top nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to roles
        </button>
        <div className="flex items-center gap-1">
          <button onClick={onPrev} disabled={idx === 0} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-all">
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs text-gray-400 w-14 text-center tabular-nums">{idx + 1} / {total}</span>
          <button onClick={onNext} disabled={idx >= total - 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-all">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="flex items-center gap-5 mb-6">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 ${cat.bg} ${cat.text}`}>
          {role.initials}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{role.title}</h2>
          <p className="text-sm text-gray-500 mb-3">{role.department}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${access.bg} ${access.text}`}>
              {access.label}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cat.bg} ${cat.text} ${cat.border}`}>
              {cat.label}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cjis.bg} ${cjis.text}`}>
              {cjis.label}
            </span>
          </div>
        </div>
      </div>

      {/* Access level description */}
      <div className={`rounded-xl px-4 py-3 mb-6 ${access.bg} flex items-center gap-2`}>
        <Shield size={13} className={access.text} />
        <p className={`text-xs font-medium ${access.text}`}>{access.description}</p>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed mb-6 max-w-3xl">{role.description}</p>

      {/* Three detail sections */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DetailSection title="Key Responsibilities" bg="bg-gray-50" titleColor="text-gray-500">
          {role.responsibilities.map((r, i) => (
            <BulletItem key={i} dot="text-gray-400">{r}</BulletItem>
          ))}
        </DetailSection>

        <DetailSection title="System Access" bg="bg-blue-50" titleColor="text-blue-600" icon={<Shield size={11} />}>
          {role.systemAccess.map((s, i) => (
            <BulletItem key={i} dot="text-blue-300">{s}</BulletItem>
          ))}
        </DetailSection>

        <DetailSection title="Active in Workflows" bg="bg-brand-50" titleColor="text-brand-600" icon={<Workflow size={11} />}>
          {role.activatedIn.length === 0
            ? <p className="text-xs text-gray-400 italic">Not yet assigned to a workflow</p>
            : (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {role.activatedIn.map((wfId) => (
                  <span key={wfId} className="text-[10px] font-mono bg-white border border-brand-200 text-brand-700 px-2 py-0.5 rounded-full">
                    {wfId}
                  </span>
                ))}
              </div>
            )
          }
        </DetailSection>
      </div>
    </div>
  );
}

// ── Personas tab ──────────────────────────────────────────────────────────────

function PersonasTab({ personas }: { personas: PersonaWithContext[] }) {
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState<number | null>(null);

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

  // ── Detail view ──
  if (selected !== null && filtered[selected]) {
    const persona = filtered[selected];
    return (
      <PersonaDetail
        persona={persona}
        idx={selected}
        total={filtered.length}
        onPrev={() => setSelected((i) => Math.max(0, (i ?? 0) - 1))}
        onNext={() => setSelected((i) => Math.min(filtered.length - 1, (i ?? 0) + 1))}
        onBack={() => setSelected(null)}
      />
    );
  }

  // ── List view ──
  const uniqueRoles   = new Set(personas.map((p) => p.role)).size;
  const workflowCount = new Set(personas.map((p) => p.workflowId)).size;

  return (
    <div>
      <div className="flex items-center gap-5 mb-5">
        <Stat value={personas.length} label="personas" large />
        <div className="w-px h-7 bg-gray-200" />
        <Stat value={uniqueRoles}     label="unique roles" />
        <div className="w-px h-7 bg-gray-200" />
        <Stat value={workflowCount}   label="workflows" />
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
          placeholder="Search personas…"
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <p className="text-xs text-gray-400 font-medium mb-3">
        {search.trim() ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : `All ${filtered.length} personas`}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">No personas match.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p, idx) => {
            const pal = paletteFor(p.role);
            return (
              <button
                key={`${p.workflowId}-${p.initials}-${idx}`}
                onClick={() => setSelected(idx)}
                className="text-left rounded-2xl border border-gray-200 bg-white p-4 hover:border-brand-300 hover:shadow-md transition-all group"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold mb-3 ${pal.bg} ${pal.text}`}>
                  {p.initials}
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-snug mb-0.5 line-clamp-2 group-hover:text-brand-700 transition-colors">{p.role}</p>
                <p className="text-[11px] text-gray-400 mb-3 line-clamp-1">{p.department}</p>
                <span className="text-[9px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {p.workflowId}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Persona detail (full-page) ────────────────────────────────────────────────

function PersonaDetail({
  persona, idx, total, onPrev, onNext, onBack,
}: {
  persona: PersonaWithContext;
  idx: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const pal = paletteFor(persona.role);

  return (
    <div>
      {/* Top nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to personas
        </button>
        <div className="flex items-center gap-1">
          <button onClick={onPrev} disabled={idx === 0} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-all">
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs text-gray-400 w-14 text-center tabular-nums">{idx + 1} / {total}</span>
          <button onClick={onNext} disabled={idx >= total - 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-all">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="flex items-center gap-5 mb-6">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 ${pal.bg} ${pal.text}`}>
          {persona.initials}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{persona.role}</h2>
          <p className="text-sm text-gray-500 mb-3">{persona.department}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full border border-brand-100">
              {persona.workflowId}
            </span>
            <span className="text-sm text-gray-400">{persona.workflowName}</span>
          </div>
        </div>
      </div>

      {/* Three sections */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-5">
        <DetailSection title="Goals" bg="bg-gray-50" titleColor="text-gray-500">
          {persona.goals.map((g, i) => <BulletItem key={i} dot="text-gray-400">{g}</BulletItem>)}
        </DetailSection>
        <DetailSection title="Pain Points — without VAI™" bg="bg-red-50" titleColor="text-red-600">
          {persona.painPoints.map((p, i) => <BulletItem key={i} dot="text-red-400">{p}</BulletItem>)}
        </DetailSection>
        <DetailSection title="Gains — with VAI™" bg="bg-emerald-50" titleColor="text-emerald-600">
          {persona.gains.map((g, i) => <BulletItem key={i} dot="text-emerald-400">{g}</BulletItem>)}
        </DetailSection>
      </div>

      {persona.quote && (
        <blockquote className="pl-4 border-l-2 border-brand-300 text-sm text-gray-500 italic leading-relaxed">
          {persona.quote}
        </blockquote>
      )}
    </div>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function Stat({ value, label, large }: { value: number; label: string; large?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`font-bold text-gray-900 ${large ? "text-3xl" : "text-xl"}`}>{value}</span>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  );
}

function DetailSection({
  title, bg, titleColor, icon, children,
}: {
  title: string;
  bg: string;
  titleColor: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl p-4 ${bg}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 ${titleColor}`}>
        {icon}{title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function BulletItem({ children, dot }: { children: React.ReactNode; dot: string }) {
  return (
    <div className="flex gap-2">
      <span className={`flex-shrink-0 mt-0.5 text-sm ${dot}`}>•</span>
      <span className="text-xs text-gray-700 leading-snug">{children}</span>
    </div>
  );
}
