export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { accounts, contacts, opportunities, activities } from "@/db/schema";
import { desc, gte } from "drizzle-orm";
import { IntelligenceClient } from "./intelligence-client";

export default async function IntelligencePage() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysOut = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const [allAccounts, allContacts, recentActivities, upcomingOpps, recentOpps] = await Promise.all([
    db.select({
      id: accounts.id,
      name: accounts.name,
      vertical: accounts.vertical,
      city: accounts.city,
      state: accounts.state,
      website: accounts.website,
      employeeCount: accounts.employeeCount,
      notes: accounts.notes,
      updatedAt: accounts.updatedAt,
    }).from(accounts).orderBy(accounts.name),

    db.select({
      id: contacts.id,
      accountId: contacts.accountId,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      role: contacts.role,
      email: contacts.email,
      phone: contacts.phone,
      linkedin: contacts.linkedin,
      isPrimary: contacts.isPrimary,
    }).from(contacts).orderBy(contacts.lastName),

    db.select({
      id: activities.id,
      accountId: activities.accountId,
      opportunityId: activities.opportunityId,
      type: activities.type,
      subject: activities.subject,
      body: activities.body,
      authorName: activities.authorName,
      occurredAt: activities.occurredAt,
    }).from(activities)
      .where(gte(activities.occurredAt, sevenDaysAgo))
      .orderBy(desc(activities.occurredAt))
      .limit(50),

    db.select({
      id: opportunities.id,
      accountId: opportunities.accountId,
      name: opportunities.name,
      stage: opportunities.stage,
      value: opportunities.value,
      closeDate: opportunities.closeDate,
      ownerName: opportunities.ownerName,
      nextAction: opportunities.nextAction,
      stageChangedAt: opportunities.stageChangedAt,
    }).from(opportunities)
      .where(gte(opportunities.closeDate, new Date().toISOString()))
      .orderBy(opportunities.closeDate)
      .limit(20),

    db.select({
      id: opportunities.id,
      accountId: opportunities.accountId,
      name: opportunities.name,
      stage: opportunities.stage,
      value: opportunities.value,
      stageChangedAt: opportunities.stageChangedAt,
      ownerName: opportunities.ownerName,
      nextAction: opportunities.nextAction,
    }).from(opportunities)
      .where(gte(opportunities.stageChangedAt, sevenDaysAgo))
      .orderBy(desc(opportunities.stageChangedAt))
      .limit(20),
  ]);

  const accountMap = Object.fromEntries(allAccounts.map((a) => [a.id, a]));

  return (
    <IntelligenceClient
      accounts={allAccounts}
      contacts={allContacts}
      recentActivities={recentActivities}
      upcomingOpps={upcomingOpps}
      recentOpps={recentOpps}
      accountMap={accountMap}
    />
  );
}
