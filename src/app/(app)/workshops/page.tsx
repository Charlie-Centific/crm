export const dynamic = "force-dynamic";

import { WorkshopBuilder } from "./workshop-builder";
import { getAllWorkflows } from "@/lib/workflows";
import { db } from "@/db/client";
import { accounts, contacts } from "@/db/schema";

export default async function WorkshopsPage() {
  const [allWorkflows, rawAccounts, rawContacts] = await Promise.all([
    getAllWorkflows(),
    db.select().from(accounts).orderBy(accounts.name),
    db.select().from(contacts),
  ]);

  // Group contacts by accountId
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
    <div className="max-w-5xl">
      <div className="mb-7">
        <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1">Content Engine</p>
        <h1 className="text-2xl font-bold text-gray-900">Workshop Builder</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-xl">
          Add attendees, define and prioritize use cases, select a deployment model —
          then build a branded workshop prep document ready to edit and publish as PDF.
        </p>
      </div>
      <WorkshopBuilder allWorkflows={allWorkflows} accountsData={accountsData} />
    </div>
  );
}
