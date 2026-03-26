"use client";

import Link from "next/link";
import { daysInStage, formatCurrency, SOURCE_LABELS, VERTICAL_LABELS } from "@/lib/utils";
import { OwnerAvatar } from "@/components/owner-avatar";

type Opp = {
  oppId: string;
  oppName: string;
  stage: string | null;
  value: number | null;
  closeDate: string | null;
  leadSource: string | null;
  leadSourceDetail: string | null;
  ownerName: string | null;
  nextAction: string | null;
  stageChangedAt: string | null;
  lastActivityAt: string | null;
  accountId: string;
  accountName: string;
  vertical: string | null;
  city: string | null;
  state: string | null;
};

type Stage = { key: string; label: string };

function DaysInStageBadge({ changedAt }: { changedAt: string | null }) {
  const days = daysInStage(changedAt);
  const isStale = days >= 14;
  const isWarning = days >= 7 && days < 14;
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded font-medium ${
        isStale ? "bg-red-100 text-red-700" : isWarning ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {days}d
    </span>
  );
}

function VerticalBadge({ vertical }: { vertical: string | null }) {
  const colors: Record<string, string> = {
    transit:    "bg-blue-50 text-blue-700",
    utilities:  "bg-green-50 text-green-700",
    emergency:  "bg-orange-50 text-orange-700",
    smart_city: "bg-purple-50 text-purple-700",
    other:      "bg-gray-50 text-gray-600",
  };
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors[vertical ?? "other"] ?? colors.other}`}>
      {VERTICAL_LABELS[vertical ?? "other"] ?? vertical}
    </span>
  );
}

function OpportunityCard({ opp }: { opp: Opp }) {
  return (
    <Link
      href={`/accounts/${opp.accountId}`}
      className="block bg-white border border-gray-200 rounded-lg p-3 hover:border-brand-400 hover:shadow-sm transition-all"
    >
      {/* Top row: account name + days badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-medium text-gray-900 text-sm leading-snug">{opp.accountName}</span>
        <DaysInStageBadge changedAt={opp.stageChangedAt} />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 mb-2">
        <VerticalBadge vertical={opp.vertical} />
        {opp.leadSource && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
            {SOURCE_LABELS[opp.leadSource] ?? opp.leadSource}
          </span>
        )}
      </div>

      {/* Value */}
      {opp.value != null && (
        <p className="text-sm font-semibold text-gray-700 mb-2">{formatCurrency(opp.value)}</p>
      )}

      {/* Next action */}
      {opp.nextAction && (
        <p className="text-xs text-gray-500 truncate mb-2" title={opp.nextAction}>
          → {opp.nextAction}
        </p>
      )}

      {/* Footer: location + owner */}
      <div className="flex items-center justify-between mt-1">
        {opp.city ? (
          <p className="text-xs text-gray-400">
            {opp.city}{opp.state ? `, ${opp.state}` : ""}
          </p>
        ) : <span />}
        <OwnerAvatar name={opp.ownerName} size="sm" />
      </div>
    </Link>
  );
}

function StageTotal({ opps }: { opps: Opp[] }) {
  const total = opps.reduce((s, o) => s + (o.value ?? 0), 0);
  if (total === 0) return null;
  const label = total >= 1_000_000
    ? `$${(total / 1_000_000).toFixed(1)}M`
    : total >= 1000
    ? `$${(total / 1000).toFixed(0)}K`
    : `$${total}`;
  return <span className="text-xs text-gray-400 font-medium">{label}</span>;
}

export function PipelineBoard({
  grouped,
  stages,
  filters,
}: {
  grouped: Record<string, Opp[]>;
  stages: readonly Stage[];
  filters?: Record<string, string | undefined>;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const opps = grouped[stage.key] ?? [];
        return (
          <div key={stage.key} className="flex-shrink-0 w-64">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {stage.label}
                </span>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                  {opps.length}
                </span>
              </div>
              <StageTotal opps={opps} />
            </div>
            <div className="flex flex-col gap-2">
              {opps.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-xs text-gray-400 text-center">
                  No deals
                </div>
              ) : (
                opps.map((opp) => <OpportunityCard key={opp.oppId} opp={opp} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
