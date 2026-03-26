"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Newspaper,
  Building2,
  Users,
  Search,
  Mail,
  Phone,
  Linkedin,
  ExternalLink,
  MessageSquare,
  Calendar,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Activity,
  Star,
  Clock,
  ChevronRight,
  StickyNote,
  PhoneCall,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Account {
  id: string;
  name: string;
  vertical: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  employeeCount: number | null;
  notes: string | null;
  updatedAt: string | null;
}

interface Contact {
  id: string;
  accountId: string | null;
  firstName: string | null;
  lastName: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  isPrimary: boolean | null;
}

interface ActivityRow {
  id: string;
  accountId: string | null;
  opportunityId: string | null;
  type: string;
  subject: string | null;
  body: string | null;
  authorName: string | null;
  occurredAt: string | null;
}

interface OppRow {
  id: string;
  accountId: string | null;
  name: string;
  stage: string | null;
  value: number | null;
  closeDate?: string | null;
  stageChangedAt?: string | null;
  ownerName: string | null;
  nextAction: string | null;
}

interface Props {
  accounts: Account[];
  contacts: Contact[];
  recentActivities: ActivityRow[];
  upcomingOpps: OppRow[];
  recentOpps: OppRow[];
  accountMap: Record<string, Account>;
}

// ── Constants ──────────────────────────────────────────────────────────────

const VERTICAL_LABELS: Record<string, string> = {
  transit: "Transit", utilities: "Utilities", emergency: "Emergency",
  smart_city: "Smart City", other: "Other",
};
const VERTICAL_COLORS: Record<string, string> = {
  transit: "bg-blue-50 text-blue-700", utilities: "bg-amber-50 text-amber-700",
  emergency: "bg-red-50 text-red-700", smart_city: "bg-purple-50 text-purple-700",
  other: "bg-gray-100 text-gray-600",
};
const STAGE_LABELS: Record<string, string> = {
  lead: "Lead", discovery: "Discovery", demo: "Demo", workshop: "Workshop",
  pilot_start: "Pilot Start", pilot_close: "Pilot Close",
  closed_won: "Closed Won", closed_lost: "Closed Lost",
};
const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  note: StickyNote, email: Mail, call: PhoneCall, meeting: Calendar,
};

function formatCurrency(n: number | null) {
  if (!n) return null;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}
function relativeDate(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function daysUntil(iso: string | null | undefined) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days}d`;
}

// ── Daily Brief tab ────────────────────────────────────────────────────────

function DailyBrief({ recentActivities, upcomingOpps, recentOpps, accountMap, totalAccounts, totalContacts }: {
  recentActivities: ActivityRow[];
  upcomingOpps: OppRow[];
  recentOpps: OppRow[];
  accountMap: Record<string, Account>;
  totalAccounts: number;
  totalContacts: number;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const followUps = [...recentOpps, ...upcomingOpps]
    .filter((o) => o.nextAction)
    .reduce((acc, o) => {
      if (!acc.find((x) => x.id === o.id)) acc.push(o);
      return acc;
    }, [] as OppRow[])
    .slice(0, 6);

  const hasData = recentActivities.length > 0 || recentOpps.length > 0 || upcomingOpps.length > 0;

  return (
    <div className="space-y-5">
      {/* Date header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">Daily Brief</p>
        <h2 className="text-xl font-bold mb-1">{today}</h2>
        <div className="flex gap-5 mt-3 text-sm text-gray-400">
          <span>{totalAccounts} accounts tracked</span>
          <span>{totalContacts} contacts</span>
          <span>{recentActivities.length} activities this week</span>
          <span>{upcomingOpps.length} deals closing soon</span>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Activity size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No activity data yet</p>
          <p className="text-xs text-gray-400 mt-1">Import from Dynamics 365 to populate your brief.</p>
          <Link href="/import" className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
            Go to Import <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <>
          {/* Pipeline pulse */}
          {recentOpps.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-brand-500" /> Pipeline Movements (7 days)
              </h3>
              <div className="space-y-2">
                {recentOpps.slice(0, 8).map((opp) => {
                  const acct = accountMap[opp.accountId ?? ""];
                  return (
                    <div key={opp.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{opp.name}</p>
                        {acct && <p className="text-xs text-gray-400 truncate">{acct.name}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                          {STAGE_LABELS[opp.stage ?? ""] ?? opp.stage}
                        </span>
                        {opp.value && (
                          <span className="text-xs text-gray-500">{formatCurrency(opp.value)}</span>
                        )}
                        <span className="text-xs text-gray-400">{relativeDate(opp.stageChangedAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming closes */}
          {upcomingOpps.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <Calendar size={14} className="text-orange-500" /> Closing in 30 Days
              </h3>
              <div className="space-y-2">
                {upcomingOpps.slice(0, 6).map((opp) => {
                  const acct = accountMap[opp.accountId ?? ""];
                  const days = daysUntil(opp.closeDate);
                  const urgent = days && (days === "Today" || days === "Tomorrow" || (parseInt(days) <= 7));
                  return (
                    <div key={opp.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${urgent ? "bg-red-500" : "bg-amber-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{opp.name}</p>
                        {acct && <p className="text-xs text-gray-400">{acct.name} · {STAGE_LABELS[opp.stage ?? ""] ?? opp.stage}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {opp.value && <span className="text-xs text-gray-500">{formatCurrency(opp.value)}</span>}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${urgent ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
                          {days}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Follow-up queue */}
          {followUps.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <AlertCircle size={14} className="text-rose-500" /> Follow-Up Queue
              </h3>
              <div className="space-y-2">
                {followUps.map((opp) => {
                  const acct = accountMap[opp.accountId ?? ""];
                  return (
                    <div key={opp.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                      <ChevronRight size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        {acct && <p className="text-xs font-semibold text-gray-500 mb-0.5">{acct.name}</p>}
                        <p className="text-sm text-gray-700">{opp.nextAction}</p>
                      </div>
                      <Link href={`/accounts/${opp.accountId}`} className="text-xs text-brand-600 hover:underline flex-shrink-0">
                        View →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent activity feed */}
          {recentActivities.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <Activity size={14} className="text-teal-500" /> Activity Feed (Last 7 Days)
              </h3>
              <div className="relative pl-5">
                <div className="absolute left-1.5 top-1 bottom-1 w-px bg-gray-100" />
                {recentActivities.slice(0, 12).map((act) => {
                  const acct = accountMap[act.accountId ?? ""];
                  const Icon = ACTIVITY_ICONS[act.type] ?? StickyNote;
                  return (
                    <div key={act.id} className="relative pb-4 last:pb-0">
                      <div className="absolute -left-3.5 top-0.5 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                        <Icon size={10} className="text-gray-400" />
                      </div>
                      <div className="ml-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          {acct && (
                            <Link href={`/accounts/${acct.id}`} className="text-xs font-semibold text-gray-700 hover:text-brand-600">
                              {acct.name}
                            </Link>
                          )}
                          <span className="text-[10px] text-gray-400 capitalize">{act.type}</span>
                          <span className="text-[10px] text-gray-300">{relativeDate(act.occurredAt)}</span>
                        </div>
                        {act.subject && <p className="text-sm text-gray-700">{act.subject}</p>}
                        {act.body && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{act.body}</p>
                        )}
                        {act.authorName && (
                          <p className="text-[10px] text-gray-400 mt-0.5">— {act.authorName}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Account Intel tab ──────────────────────────────────────────────────────

function AccountIntel({ accounts, contacts, recentActivities, upcomingOpps }: {
  accounts: Account[];
  contacts: Contact[];
  recentActivities: ActivityRow[];
  upcomingOpps: OppRow[];
}) {
  const [search, setSearch] = useState("");
  const [selectedVertical, setSelectedVertical] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = accounts;
    if (selectedVertical) list = list.filter((a) => a.vertical === selectedVertical);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || (a.city ?? "").toLowerCase().includes(q));
    }
    return list;
  }, [accounts, search, selectedVertical]);

  const verticals = useMemo(() => {
    const seen = new Set<string>();
    for (const a of accounts) if (a.vertical) seen.add(a.vertical);
    return Array.from(seen).sort();
  }, [accounts]);

  const contactsByAccount = useMemo(() => {
    const map: Record<string, Contact[]> = {};
    for (const c of contacts) {
      if (!c.accountId) continue;
      if (!map[c.accountId]) map[c.accountId] = [];
      map[c.accountId].push(c);
    }
    return map;
  }, [contacts]);

  const activityByAccount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of recentActivities) {
      if (a.accountId) map[a.accountId] = (map[a.accountId] ?? 0) + 1;
    }
    return map;
  }, [recentActivities]);

  const oppByAccount = useMemo(() => {
    const map: Record<string, OppRow> = {};
    for (const o of upcomingOpps) {
      if (o.accountId) map[o.accountId] = o;
    }
    return map;
  }, [upcomingOpps]);

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-1">
          {verticals.map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVertical(selectedVertical === v ? null : v)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                selectedVertical === v
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {VERTICAL_LABELS[v] ?? v}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">{filtered.length} accounts</span>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Building2 size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No accounts yet. Import from Dynamics 365.</p>
          <Link href="/import" className="mt-3 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">Import <ArrowRight size={13} /></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((acct) => {
            const acctContacts = contactsByAccount[acct.id] ?? [];
            const primary = acctContacts.find((c) => c.isPrimary) ?? acctContacts[0];
            const activityCount = activityByAccount[acct.id] ?? 0;
            const opp = oppByAccount[acct.id];

            return (
              <div key={acct.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">{acct.name}</h3>
                      {acct.vertical && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${VERTICAL_COLORS[acct.vertical] ?? "bg-gray-100 text-gray-600"}`}>
                          {VERTICAL_LABELS[acct.vertical] ?? acct.vertical}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {[acct.city, acct.state].filter(Boolean).join(", ")}
                      {acct.employeeCount ? ` · ${acct.employeeCount.toLocaleString()} employees` : ""}
                    </p>
                  </div>
                  <Link href={`/accounts/${acct.id}`} className="text-xs text-brand-600 hover:underline flex-shrink-0">
                    Open account →
                  </Link>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  {/* Primary contact */}
                  {primary && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-gray-500">
                          {(primary.firstName?.[0] ?? "") + primary.lastName[0]}
                        </span>
                      </div>
                      <span>
                        {[primary.firstName, primary.lastName].filter(Boolean).join(" ")}
                        {primary.role ? ` · ${primary.role}` : ""}
                      </span>
                      {primary.linkedin && (
                        <a href={primary.linkedin} target="_blank" rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700" title="LinkedIn">
                          <Linkedin size={12} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-3 text-xs text-gray-400 ml-auto">
                    {acctContacts.length > 0 && (
                      <span className="flex items-center gap-1"><Users size={11} /> {acctContacts.length}</span>
                    )}
                    {activityCount > 0 && (
                      <span className="flex items-center gap-1 text-teal-600"><Activity size={11} /> {activityCount} this week</span>
                    )}
                    {opp && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Clock size={11} /> Closes {daysUntil(opp.closeDate)}
                      </span>
                    )}
                    {acct.website && (
                      <a href={acct.website.startsWith("http") ? acct.website : `https://${acct.website}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                        <ExternalLink size={11} /> Website
                      </a>
                    )}
                    {/* LinkedIn company search */}
                    <a href={`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(acct.name)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors">
                      <Linkedin size={11} /> LinkedIn
                    </a>
                  </div>
                </div>

                {acct.notes && (
                  <p className="mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500 line-clamp-2">{acct.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Contact Intel tab ──────────────────────────────────────────────────────

function ContactIntel({ contacts, accountMap, recentActivities }: {
  contacts: Contact[];
  accountMap: Record<string, Account>;
  recentActivities: ActivityRow[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter((c) =>
      `${c.firstName ?? ""} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.role ?? "").toLowerCase().includes(q) ||
      (accountMap[c.accountId ?? ""]?.name ?? "").toLowerCase().includes(q)
    );
  }, [contacts, search, accountMap]);

  const activityByContact = useMemo(() => {
    const map: Record<string, ActivityRow[]> = {};
    // Activities link to accountId; we'll show account-level activities near contacts
    return map;
  }, [recentActivities]);

  if (contacts.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
        <Users size={28} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No contacts yet. Import from Dynamics 365.</p>
        <Link href="/import" className="mt-3 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">Import <ArrowRight size={13} /></Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, or account…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <span className="text-xs text-gray-400">{filtered.length} contacts</span>
      </div>

      <div className="space-y-2">
        {filtered.map((c) => {
          const acct = accountMap[c.accountId ?? ""];
          const initials = (c.firstName?.[0] ?? "") + c.lastName[0];
          const fullName = [c.firstName, c.lastName].filter(Boolean).join(" ");

          return (
            <div key={c.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-brand-700">{initials}</span>
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                  {c.isPrimary && (
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-600">
                      <Star size={9} fill="currentColor" /> Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {c.role ?? "—"}
                  {acct ? ` · ${acct.name}` : ""}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 transition-colors" title={c.email}>
                    <Mail size={13} />
                    <span className="hidden sm:inline truncate max-w-[160px]">{c.email}</span>
                  </a>
                )}
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="text-gray-400 hover:text-gray-700 transition-colors" title={c.phone}>
                    <Phone size={13} />
                  </a>
                )}
                {c.linkedin ? (
                  <a href={c.linkedin} target="_blank" rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 transition-colors" title="LinkedIn Profile">
                    <Linkedin size={13} />
                  </a>
                ) : (
                  <a href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(fullName)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-gray-300 hover:text-blue-500 transition-colors" title="Search on LinkedIn">
                    <Linkedin size={13} />
                  </a>
                )}
                {acct && (
                  <Link href={`/accounts/${acct.id}`} className="text-xs text-gray-400 hover:text-brand-600 transition-colors">
                    <ExternalLink size={13} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

type Tab = "brief" | "accounts" | "contacts";

export function IntelligenceClient({
  accounts, contacts, recentActivities, upcomingOpps, recentOpps, accountMap,
}: Props) {
  const [tab, setTab] = useState<Tab>("brief");

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Intelligence</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Daily brief, account intel, and contact insights — everything before the call.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
        {([
          { key: "brief",    label: "Daily Brief",   Icon: Newspaper  },
          { key: "accounts", label: "Account Intel", Icon: Building2  },
          { key: "contacts", label: "Contact Intel", Icon: Users      },
        ] as { key: Tab; label: string; Icon: React.ElementType }[]).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "brief" && (
        <DailyBrief
          recentActivities={recentActivities}
          upcomingOpps={upcomingOpps}
          recentOpps={recentOpps}
          accountMap={accountMap}
          totalAccounts={accounts.length}
          totalContacts={contacts.length}
        />
      )}
      {tab === "accounts" && (
        <AccountIntel
          accounts={accounts}
          contacts={contacts}
          recentActivities={recentActivities}
          upcomingOpps={upcomingOpps}
        />
      )}
      {tab === "contacts" && (
        <ContactIntel
          contacts={contacts}
          accountMap={accountMap}
          recentActivities={recentActivities}
        />
      )}
    </div>
  );
}
