export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { accounts, contacts, opportunities, activities, workshops, preCallBriefs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  VERTICAL_LABELS,
  STAGE_LABELS,
  SOURCE_LABELS,
  formatCurrency,
  relativeTime,
  daysInStage,
} from "@/lib/utils";
import { OwnerAvatar } from "@/components/owner-avatar";

async function getAccountDetail(id: string) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, id))
    .limit(1);

  if (!account) return null;

  const [accountContacts, accountOpps, recentActivities, accountWorkshops, recentBriefs] =
    await Promise.all([
      db.select().from(contacts).where(eq(contacts.accountId, id)).orderBy(contacts.isPrimary),
      db.select().from(opportunities).where(eq(opportunities.accountId, id)).orderBy(desc(opportunities.updatedAt)),
      db.select().from(activities).where(eq(activities.accountId, id)).orderBy(desc(activities.occurredAt)).limit(30),
      db.select().from(workshops).where(eq(workshops.accountId, id)).orderBy(desc(workshops.createdAt)),
      db.select().from(preCallBriefs).where(eq(preCallBriefs.accountId, id)).orderBy(desc(preCallBriefs.generatedAt)).limit(5),
    ]);

  return { account, contacts: accountContacts, opportunities: accountOpps, activities: recentActivities, workshops: accountWorkshops, briefs: recentBriefs };
}

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAccountDetail(id);
  if (!data) notFound();

  const { account, contacts: accountContacts, opportunities: accountOpps, activities: recentActivities, workshops: accountWorkshops } = data;

  const activeOpp = accountOpps[0];

  const verticalColors: Record<string, string> = {
    transit: "bg-blue-50 text-blue-700",
    utilities: "bg-green-50 text-green-700",
    emergency: "bg-orange-50 text-orange-700",
    smart_city: "bg-purple-50 text-purple-700",
    other: "bg-gray-50 text-gray-600",
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/accounts" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">
          ← Accounts
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {account.vertical && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${verticalColors[account.vertical] ?? verticalColors.other}`}>
                  {VERTICAL_LABELS[account.vertical] ?? account.vertical}
                </span>
              )}
              {[account.city, account.state, account.country].filter(Boolean).length > 0 && (
                <span className="text-sm text-gray-400">
                  {[account.city, account.state, account.country].filter(Boolean).join(", ")}
                </span>
              )}
              {account.ownerName && (
                <OwnerAvatar name={account.ownerName} size="md" showName />
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/accounts/${account.id}/brief`}
              className="px-3 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700"
            >
              Generate Brief
            </Link>
            <Link
              href={`/workshops/new?accountId=${account.id}`}
              className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
            >
              New Workshop
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left column: contacts + opportunities */}
        <div className="col-span-2 space-y-4">
          {/* Active opportunity */}
          {activeOpp && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Active Opportunity
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{activeOpp.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium">
                      {STAGE_LABELS[activeOpp.stage ?? "lead"] ?? activeOpp.stage}
                    </span>
                    {activeOpp.stageChangedAt && (
                      <span className={`text-xs font-medium ${daysInStage(activeOpp.stageChangedAt) >= 14 ? "text-red-500" : "text-gray-400"}`}>
                        {daysInStage(activeOpp.stageChangedAt)}d in stage
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {activeOpp.value && (
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(activeOpp.value)}</p>
                  )}
                  {activeOpp.closeDate && (
                    <p className="text-xs text-gray-400">
                      Close: {new Date(activeOpp.closeDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {activeOpp.nextAction && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">Next action</p>
                  <p className="text-sm text-gray-700 mt-0.5">{activeOpp.nextAction}</p>
                </div>
              )}
            </div>
          )}

          {/* Contacts */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Contacts ({accountContacts.length})
            </h2>
            {accountContacts.length === 0 ? (
              <p className="text-sm text-gray-400">No contacts synced yet.</p>
            ) : (
              <div className="space-y-3">
                {accountContacts.map((c) => (
                  <div key={c.id} className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {[c.firstName, c.lastName].filter(Boolean).join(" ")}
                        {c.isPrimary && (
                          <span className="ml-2 text-xs text-brand-600 font-medium">Primary</span>
                        )}
                      </p>
                      {c.role && <p className="text-xs text-gray-500">{c.role}</p>}
                    </div>
                    <div className="text-right">
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="text-xs text-brand-600 hover:underline block">
                          {c.email}
                        </a>
                      )}
                      {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Activity
            </h2>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-400">No activity synced yet.</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((a) => (
                  <div key={a.id} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-xs text-gray-400 mt-0.5">
                      {a.type === "email" ? "✉" : a.type === "call" ? "📞" : a.type === "meeting" ? "📅" : "📝"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 font-medium truncate">{a.subject ?? a.type}</p>
                      {a.body && <p className="text-xs text-gray-500 line-clamp-2">{a.body}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {relativeTime(a.occurredAt)}
                        {a.authorName ? ` · ${a.authorName}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: workshops + briefs + links */}
        <div className="space-y-4">
          {/* Workshops */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Workshops
            </h2>
            {accountWorkshops.length === 0 ? (
              <div>
                <p className="text-sm text-gray-400 mb-3">No workshops yet.</p>
                <Link
                  href={`/workshops/new?accountId=${account.id}`}
                  className="text-xs text-brand-600 hover:underline"
                >
                  + Start a workshop
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {accountWorkshops.map((w) => (
                  <Link
                    key={w.id}
                    href={`/workshops/${w.id}`}
                    className="block p-2 rounded-lg border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-all"
                  >
                    <p className="text-xs font-medium text-gray-700 capitalize">
                      {w.status?.replace(/_/g, " ")}
                    </p>
                    {w.scheduledAt && (
                      <p className="text-xs text-gray-400">
                        {new Date(w.scheduledAt).toLocaleDateString()}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Account info */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Details
            </h2>
            <dl className="space-y-2 text-sm">
              {account.website && (
                <div>
                  <dt className="text-gray-400 text-xs">Website</dt>
                  <dd>
                    <a href={account.website} target="_blank" className="text-brand-600 hover:underline text-xs">
                      {account.website}
                    </a>
                  </dd>
                </div>
              )}
              {account.employeeCount && (
                <div>
                  <dt className="text-gray-400 text-xs">Employees</dt>
                  <dd className="text-gray-700">{account.employeeCount.toLocaleString()}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-400 text-xs">Last imported</dt>
                <dd className="text-gray-700 text-xs">
                  {account.lastImportedAt ? relativeTime(account.lastImportedAt) : "Never"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
