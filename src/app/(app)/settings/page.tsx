export const dynamic = "force-dynamic";

import { getAllWorkflows } from "@/lib/workflows";
import { WORKFLOW_PERSONAS } from "@/lib/workflow-static-data";
import { SettingsClient } from "./settings-client";
import type { PersonaWithContext } from "./settings-client";

export default async function SettingsPage() {
  const workflows = await getAllWorkflows();
  const workflowMap = Object.fromEntries(workflows.map((w) => [w.id, w.name]));

  const allPersonas: PersonaWithContext[] = WORKFLOW_PERSONAS.flatMap((wpd) =>
    wpd.personas.map((p) => ({
      ...p,
      workflowId: wpd.workflowId,
      workflowName: workflowMap[wpd.workflowId] ?? wpd.workflowId,
    }))
  );

  return <SettingsClient allPersonas={allPersonas} />;
}
