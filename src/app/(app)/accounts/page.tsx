export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { accounts, opportunities } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { VERTICAL_LABELS, formatCurrency } from "@/lib/utils";

async function getAccounts() {
  // Get accounts with their active opp count and total value
  const rows = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      vertical: accounts.vertical,
      city: accounts.city,
      state: accounts.state,
      lastImportedAt: accounts.lastImportedAt,
    })
    .from(accounts)
    .orderBy(accounts.name);

  return rows;
}

export default async function AccountsPage() {
  const rows = await getAccounts();

  const verticalColors: Record<string, string> = {
    transit: "bg-blue-50 text-blue-700",
    utilities: "bg-green-50 text-green-700",
    emergency: "bg-orange-50 text-orange-700",
    smart_city: "bg-purple-50 text-purple-700",
    other: "bg-gray-50 text-gray-600",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">{rows.length} accounts synced from Dynamics 365</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500 mb-2">No accounts yet.</p>
          <p className="text-sm text-gray-400">
            Trigger a sync from Dynamics 365 to populate accounts.
          </p>
          <form action="/api/sync" method="POST" className="mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700"
            >
              Sync Now
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Account</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Vertical</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Last Synced</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{account.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        verticalColors[account.vertical ?? "other"] ?? verticalColors.other
                      }`}
                    >
                      {VERTICAL_LABELS[account.vertical ?? "other"] ?? account.vertical ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {[account.city, account.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {account.lastImportedAt
                      ? new Date(account.lastImportedAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/accounts/${account.id}`}
                      className="text-brand-600 hover:text-brand-700 font-medium text-xs"
                    >
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
