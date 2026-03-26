export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { accounts, opportunities } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { PipelineBoard } from "./pipeline-board";
import { TEAM } from "@/lib/team";
import Link from "next/link";

const STAGES = [
  { key: "lead",        label: "Lead" },
  { key: "discovery",  label: "Discovery" },
  { key: "demo",       label: "Demo" },
  { key: "workshop",   label: "Workshop" },
  { key: "pilot_start",label: "Pilot Start" },
  { key: "pilot_close",label: "Pilot Close" },
] as const;

async function getPipelineData(owner?: string, vertical?: string, source?: string) {
  const conditions = [];
  if (vertical) conditions.push(eq(accounts.vertical, vertical));
  if (source)   conditions.push(eq(opportunities.leadSource, source));
  if (owner)    conditions.push(eq(opportunities.ownerName, owner));

  const rows = await db
    .select({
      oppId:           opportunities.id,
      oppName:         opportunities.name,
      stage:           opportunities.stage,
      value:           opportunities.value,
      closeDate:       opportunities.closeDate,
      leadSource:      opportunities.leadSource,
      leadSourceDetail:opportunities.leadSourceDetail,
      ownerName:       opportunities.ownerName,
      nextAction:      opportunities.nextAction,
      stageChangedAt:  opportunities.stageChangedAt,
      lastActivityAt:  opportunities.lastActivityAt,
      accountId:       accounts.id,
      accountName:     accounts.name,
      vertical:        accounts.vertical,
      city:            accounts.city,
      state:           accounts.state,
    })
    .from(opportunities)
    .innerJoin(accounts, eq(opportunities.accountId, accounts.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const activeStageKeys = STAGES.map((s) => s.key) as string[];
  const active = rows.filter((r) => activeStageKeys.includes(r.stage ?? ""));

  const grouped = Object.fromEntries(
    STAGES.map((s) => [s.key, active.filter((r) => r.stage === s.key)])
  );

  const totalValue = active.reduce((sum, r) => sum + (r.value ?? 0), 0);

  return { grouped, stages: STAGES, total: active.length, totalValue };
}

type SearchParams = { owner?: string; vertical?: string; source?: string };

export default async function PipelinePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const { grouped, stages, total, totalValue } = await getPipelineData(sp.owner, sp.vertical, sp.source);

  const formatM = (v: number) =>
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} active · <span className="font-medium text-gray-700">{formatM(totalValue)} TCV</span>
          </p>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Owner filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium mr-1">Owner</span>
          <FilterChip label="All" param="owner" value={undefined} current={sp.owner} />
          {TEAM.map((m) => (
            <FilterChip key={m.name} label={m.initials} title={m.name} param="owner" value={m.name} current={sp.owner} color={m.color} />
          ))}
        </div>

        <div className="w-px bg-gray-200 self-stretch" />

        {/* Source filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium mr-1">Source</span>
          <FilterChip label="All"        param="source" value={undefined}      current={sp.source} />
          <FilterChip label="Conference" param="source" value="conference"     current={sp.source} />
          <FilterChip label="Partner"    param="source" value="partner"        current={sp.source} />
          <FilterChip label="Direct"     param="source" value="direct"         current={sp.source} />
          <FilterChip label="Inbound"    param="source" value="inbound"        current={sp.source} />
        </div>

        <div className="w-px bg-gray-200 self-stretch" />

        {/* Vertical filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium mr-1">Vertical</span>
          <FilterChip label="All"        param="vertical" value={undefined}    current={sp.vertical} />
          <FilterChip label="Transit"    param="vertical" value="transit"      current={sp.vertical} />
          <FilterChip label="Utilities"  param="vertical" value="utilities"    current={sp.vertical} />
          <FilterChip label="Emergency"  param="vertical" value="emergency"    current={sp.vertical} />
          <FilterChip label="Smart City" param="vertical" value="smart_city"   current={sp.vertical} />
        </div>
      </div>

      <PipelineBoard grouped={grouped} stages={stages} filters={sp} />
    </div>
  );
}

function FilterChip({
  label,
  title,
  param,
  value,
  current,
  color,
}: {
  label: string;
  title?: string;
  param: string;
  value: string | undefined;
  current: string | undefined;
  color?: string;
}) {
  // Need access to full searchParams to preserve other filters when clicking one.
  // We pass current for just this param, but we need the full URL for multi-filter.
  // Since this is a server component, we build the href from just this param.
  const isActive = current === value;

  const colorActive: Record<string, string> = {
    blue:   "bg-blue-600 text-white",
    purple: "bg-purple-600 text-white",
    green:  "bg-green-600 text-white",
    orange: "bg-orange-500 text-white",
  };
  const colorInactive: Record<string, string> = {
    blue:   "bg-blue-50 text-blue-700 hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-700 hover:bg-purple-100",
    green:  "bg-green-50 text-green-700 hover:bg-green-100",
    orange: "bg-orange-50 text-orange-700 hover:bg-orange-100",
  };

  const activeClass = color ? colorActive[color] : "bg-gray-900 text-white";
  const inactiveClass = color
    ? colorInactive[color]
    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50";

  const href = value ? `?${param}=${encodeURIComponent(value)}` : "/pipeline";

  return (
    <Link
      href={href}
      title={title}
      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${isActive ? activeClass : inactiveClass}`}
    >
      {label}
    </Link>
  );
}
