export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { accounts, preCallBriefs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BriefClient } from "./brief-client";
import { generateClaudePrompt } from "@/lib/brief-template";

export default async function BriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [account] = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
  if (!account) notFound();

  const recentBriefs = await db
    .select()
    .from(preCallBriefs)
    .where(eq(preCallBriefs.accountId, id))
    .orderBy(desc(preCallBriefs.generatedAt))
    .limit(5);

  const latestBrief = recentBriefs[0] ?? null;
  const claudePrompt = latestBrief
    ? generateClaudePrompt(latestBrief.content, account.name)
    : "";

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/accounts/${id}`} className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">
          ← {account.name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Pre-Call Brief</h1>
        <p className="text-sm text-gray-500 mt-1">
          Assembled from CRM data — contacts, opportunities, and activity history.
        </p>
      </div>

      {/* Main brief area */}
      <BriefClient
        accountId={id}
        brief={latestBrief}
        hasBrief={!!latestBrief}
        claudePrompt={claudePrompt}
      />

      {/* Brief history */}
      {recentBriefs.length > 1 && (
        <div className="mt-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Brief History
          </h2>
          <div className="space-y-1">
            {recentBriefs.slice(1).map((b) => (
              <div key={b.id} className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
                <span className="text-gray-500 text-xs">
                  {b.generatedAt ? new Date(b.generatedAt).toLocaleString() : "—"}
                  {b.editedAt ? " · edited" : ""}
                </span>
                <span className="text-xs text-gray-400 truncate max-w-[300px] ml-4">
                  {b.content.slice(0, 60)}…
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
