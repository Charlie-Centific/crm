export const dynamic = "force-dynamic";

import { getAllWorkflows } from "@/lib/workflows";
import { DemoBriefClient } from "./demo-brief-client";
import { db } from "@/db/client";
import { accounts, contacts } from "@/db/schema";

export default async function DemoScriptsPage() {
  const [allWorkflows, rawAccounts, rawContacts] = await Promise.all([
    getAllWorkflows(),
    db.select().from(accounts).orderBy(accounts.name),
    db.select().from(contacts),
  ]);

  const contactsByAccount = rawContacts.reduce<Record<string, typeof rawContacts>>(
    (acc, c) => {
      if (!c.accountId) return acc;
      acc[c.accountId] = acc[c.accountId] ?? [];
      acc[c.accountId].push(c);
      return acc;
    },
    {}
  );

  const accountsData = rawAccounts.map((a) => ({
    id: a.id,
    name: a.name,
    ownerName: a.ownerName ?? null,
    vertical: a.vertical ?? null,
    city: a.city ?? null,
    state: a.state ?? null,
    contacts: (contactsByAccount[a.id] ?? []).map((c) => ({
      id: c.id,
      firstName: c.firstName ?? null,
      lastName: c.lastName,
      role: c.role ?? null,
      email: c.email ?? null,
      isPrimary: c.isPrimary ?? false,
    })),
  }));

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Demo Brief Builder</h1>
        <p className="text-sm text-gray-500 mt-1">
          Click your way to a customized demo prompt — select the platform, vertical, and use cases, then copy the brief into the demo platform.
        </p>
      </div>

      <DemoBriefClient allWorkflows={allWorkflows} accountsData={accountsData} />
    </div>
  );
}
