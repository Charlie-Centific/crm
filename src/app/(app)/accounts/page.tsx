export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { accounts, opportunities } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import Link from "next/link";
import { VERTICAL_LABELS, formatCurrency } from "@/lib/utils";
import { OwnerAvatar } from "@/components/owner-avatar";
import { TEAM } from "@/lib/team";

const VERTICAL_COLORS: Record<string, string> = {
  transit:    "bg-blue-50 text-blue-700",
  utilities:  "bg-green-50 text-green-700",
  emergency:  "bg-orange-50 text-orange-700",
  smart_city: "bg-purple-50 text-purple-700",
  other:      "bg-gray-50 text-gray-600",
};

async function getAccounts(owner?: string, vertical?: string) {
  const conditions = [];
  if (owner)    conditions.push(eq(accounts.ownerName, owner));
  if (vertical) conditions.push(eq(accounts.vertical, vertical));

  // Get accounts with active opp count and total TCV
  const rows = await db
    .select({
      id:              accounts.id,
      name:            accounts.name,
      vertical:        accounts.vertical,
      ownerName:       accounts.ownerName,
      city:            accounts.city,
      state:           accounts.state,
      lastImportedAt:  accounts.lastImportedAt,
    })
    .from(accounts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(accounts.name);

  // Fetch opp summaries per account in one query
  const oppSummaries = await db
    .select({
      accountId: opportunities.accountId,
      stage:     opportunities.stage,
      value:     opportunities.value,
    })
    .from(opportunities)
    .where(eq(opportunities.ownerName, owner ?? sql`opportunities.owner_name`));

  const summaryMap = new Map<string, { count: number; totalValue: number; topStage: string }>();
  for (const o of oppSummaries) {
    if (!o.accountId) continue;
    const existing = summaryMap.get(o.accountId) ?? { count: 0, totalValue: 0, topStage: "lead" };
    summaryMap.set(o.accountId, {
      count: existing.count + 1,
      totalValue: existing.totalValue + (o.value ?? 0),
      topStage: o.stage ?? existing.topStage,
    });
  }

  return rows.map((r) => ({ ...r, opp: summaryMap.get(r.id) ?? null }));
}

type SearchParams = { owner?: string; vertical?: string };

export default async function AccountsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const rows = await getAccounts(sp.owner, sp.vertical);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rows.length} accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium mr-1">Owner</span>
          <FilterChip label="All" param="owner" value={undefined} current={sp.owner} />
          {TEAM.map((m) => (
            <FilterChip key={m.name} label={m.initials} title={m.name} param="owner" value={m.name} current={sp.owner} color={m.color} />
          ))}
        </div>

        <div className="w-px bg-gray-200 self-stretch" />

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium mr-1">Vertical</span>
          <FilterChip label="All"        param="vertical" value={undefined}    current={sp.vertical} />
          <FilterChip label="Transit"    param="vertical" value="transit"      current={sp.vertical} />
          <FilterChip label="Utilities"  param="vertical" value="utilities"    current={sp.vertical} />
          <FilterChip label="Emergency"  param="vertical" value="emergency"    current={sp.vertical} />
          <FilterChip label="Smart City" param="vertical" value="smart_city"   current={sp.vertical} />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500 mb-2">No accounts match these filters.</p>
          <Link href="/accounts" className="text-sm text-brand-600 hover:underline">Clear filters</Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Account</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Vertical</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Pipeline</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{account.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${VERTICAL_COLORS[account.vertical ?? "other"] ?? VERTICAL_COLORS.other}`}>
                      {VERTICAL_LABELS[account.vertical ?? "other"] ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {[account.city, account.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <OwnerAvatar name={account.ownerName} showName />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {account.opp ? (
                      <span>
                        {account.opp.count} opp{account.opp.count !== 1 ? "s" : ""}{" "}
                        {account.opp.totalValue > 0 && (
                          <span className="font-medium text-gray-700">
                            · {formatCurrency(account.opp.totalValue)}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/accounts/${account.id}`} className="text-brand-600 hover:text-brand-700 font-medium text-xs">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label, title, param, value, current, color,
}: {
  label: string; title?: string; param: string;
  value: string | undefined; current: string | undefined; color?: string;
}) {
  const isActive = current === value;
  const colorActive: Record<string, string> = {
    blue: "bg-blue-600 text-white", purple: "bg-purple-600 text-white",
    green: "bg-green-600 text-white", orange: "bg-orange-500 text-white",
  };
  const colorInactive: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-700 hover:bg-purple-100",
    green: "bg-green-50 text-green-700 hover:bg-green-100",
    orange: "bg-orange-50 text-orange-700 hover:bg-orange-100",
  };
  const activeClass  = color ? colorActive[color]  : "bg-gray-900 text-white";
  const inactiveClass = color ? colorInactive[color] : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50";
  const href = value ? `?${param}=${encodeURIComponent(value)}` : "/accounts";
  return (
    <a href={href} title={title} className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${isActive ? activeClass : inactiveClass}`}>
      {label}
    </a>
  );
}
