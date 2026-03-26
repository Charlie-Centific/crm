export const dynamic = "force-dynamic";

import { db } from "@/db/client";
import { opportunities, accounts, pilots, workshops } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAllWorkflows } from "@/lib/workflows";
import { KPIClient } from "./kpi-client";

const ACTIVE_STAGES = ["lead", "discovery", "demo", "workshop", "pilot_start", "pilot_close"] as const;

export default async function KPIPage() {
  const [allOpps, allAccounts, allPilots, allWorkshops, allWorkflows] = await Promise.all([
    db.select({
      stage: opportunities.stage,
      value: opportunities.value,
    }).from(opportunities),

    db.select({ vertical: accounts.vertical }).from(accounts),

    db.select({ status: pilots.status }).from(pilots),

    db.select({ status: workshops.status }).from(workshops),

    getAllWorkflows(),
  ]);

  // ── Pipeline aggregation ────────────────────────────────────────────────────

  const activeOpps = allOpps.filter((o) => ACTIVE_STAGES.includes(o.stage as typeof ACTIVE_STAGES[number]));

  const pipelineByStage = ACTIVE_STAGES.map((stage) => {
    const rows = activeOpps.filter((o) => o.stage === stage);
    return {
      stage,
      count: rows.length,
      tcv: rows.reduce((s, r) => s + (r.value ?? 0), 0),
    };
  });

  const totalActiveTCV = activeOpps.reduce((s, r) => s + (r.value ?? 0), 0);
  const totalActiveDeals = activeOpps.length;

  const wonOpps = allOpps.filter((o) => o.stage === "closed_won");
  const totalClosedWonTCV = wonOpps.reduce((s, r) => s + (r.value ?? 0), 0);
  const totalClosedWon = wonOpps.length;

  // ── Accounts aggregation ────────────────────────────────────────────────────

  const verticalCounts: Record<string, number> = {};
  for (const a of allAccounts) {
    const v = a.vertical ?? "other";
    verticalCounts[v] = (verticalCounts[v] ?? 0) + 1;
  }
  const accountsByVertical = Object.entries(verticalCounts)
    .map(([vertical, count]) => ({ vertical, count }))
    .sort((a, b) => b.count - a.count);

  // ── Pilots aggregation ──────────────────────────────────────────────────────

  const pilotStatusCounts: Record<string, number> = {};
  for (const p of allPilots) {
    const s = p.status ?? "active";
    pilotStatusCounts[s] = (pilotStatusCounts[s] ?? 0) + 1;
  }
  const pilotsByStatus = Object.entries(pilotStatusCounts).map(([status, count]) => ({ status, count }));

  // ── Workshops aggregation ───────────────────────────────────────────────────

  const workshopStatusCounts: Record<string, number> = {};
  for (const w of allWorkshops) {
    const s = w.status ?? "planned";
    workshopStatusCounts[s] = (workshopStatusCounts[s] ?? 0) + 1;
  }
  const workshopsByStatus = Object.entries(workshopStatusCounts).map(([status, count]) => ({ status, count }));

  // ── Workflows aggregation ───────────────────────────────────────────────────

  const workflowVerticalCounts: Record<string, number> = {};
  for (const wf of allWorkflows) {
    for (const tag of wf.verticalTags) {
      workflowVerticalCounts[tag] = (workflowVerticalCounts[tag] ?? 0) + 1;
    }
  }
  const workflowsByVertical = Object.entries(workflowVerticalCounts)
    .map(([vertical, count]) => ({ vertical, count }))
    .sort((a, b) => b.count - a.count);

  const workflowNames = Object.fromEntries(allWorkflows.map((w) => [w.id, w.name]));

  return (
    <KPIClient
      pipelineByStage={pipelineByStage}
      totalActiveTCV={totalActiveTCV}
      totalActiveDeals={totalActiveDeals}
      totalClosedWonTCV={totalClosedWonTCV}
      totalClosedWon={totalClosedWon}
      accountsByVertical={accountsByVertical}
      totalAccounts={allAccounts.length}
      pilotsByStatus={pilotsByStatus}
      workshopsByStatus={workshopsByStatus}
      totalWorkflows={allWorkflows.length}
      workflowsByVertical={workflowsByVertical}
      workflowNames={workflowNames}
    />
  );
}
