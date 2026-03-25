export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { accounts, opportunities } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { PipelineBoard } from "./pipeline-board";

const STAGES = [
  { key: "lead", label: "Lead" },
  { key: "discovery", label: "Discovery" },
  { key: "demo", label: "Demo" },
  { key: "workshop", label: "Workshop" },
  { key: "pilot_start", label: "Pilot Start" },
  { key: "pilot_close", label: "Pilot Close" },
] as const;

async function getPipelineData(vertical?: string, source?: string) {
  const conditions = [];
  if (vertical) conditions.push(eq(accounts.vertical, vertical as never));
  if (source) conditions.push(eq(opportunities.leadSource, source as never));

  const rows = await db
    .select({
      oppId: opportunities.id,
      oppName: opportunities.name,
      stage: opportunities.stage,
      value: opportunities.value,
      closeDate: opportunities.closeDate,
      leadSource: opportunities.leadSource,
      leadSourceDetail: opportunities.leadSourceDetail,
      ownerName: opportunities.ownerName,
      nextAction: opportunities.nextAction,
      stageChangedAt: opportunities.stageChangedAt,
      lastActivityAt: opportunities.lastActivityAt,
      accountId: accounts.id,
      accountName: accounts.name,
      vertical: accounts.vertical,
      city: accounts.city,
      state: accounts.state,
    })
    .from(opportunities)
    .innerJoin(accounts, eq(opportunities.accountId, accounts.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Exclude closed stages from board view
  const activeStageKeys = STAGES.map((s) => s.key) as string[];
  const active = rows.filter((r) => activeStageKeys.includes(r.stage ?? ""));

  const grouped = Object.fromEntries(
    STAGES.map((s) => [s.key, active.filter((r) => r.stage === s.key)])
  );

  return { grouped, stages: STAGES, total: active.length };
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: { vertical?: string; source?: string };
}) {
  const { grouped, stages, total } = await getPipelineData(
    searchParams.vertical,
    searchParams.source
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">{total} active opportunities</p>
        </div>
        <div className="flex gap-2">
          <FilterLink label="All sources" param="source" value={undefined} current={searchParams.source} />
          <FilterLink label="Conference" param="source" value="conference" current={searchParams.source} />
          <FilterLink label="Partner" param="source" value="partner" current={searchParams.source} />
          <FilterLink label="Direct" param="source" value="direct" current={searchParams.source} />
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <FilterLink label="All verticals" param="vertical" value={undefined} current={searchParams.vertical} />
        <FilterLink label="Transit" param="vertical" value="transit" current={searchParams.vertical} />
        <FilterLink label="Utilities" param="vertical" value="utilities" current={searchParams.vertical} />
        <FilterLink label="Emergency" param="vertical" value="emergency" current={searchParams.vertical} />
        <FilterLink label="Smart City" param="vertical" value="smart_city" current={searchParams.vertical} />
      </div>

      <PipelineBoard grouped={grouped} stages={stages} />
    </div>
  );
}

function FilterLink({
  label,
  param,
  value,
  current,
}: {
  label: string;
  param: string;
  value: string | undefined;
  current: string | undefined;
}) {
  const isActive = current === value;
  const href = value ? `?${param}=${value}` : "/pipeline";
  return (
    <a
      href={href}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        isActive
          ? "bg-brand-600 text-white"
          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {label}
    </a>
  );
}
