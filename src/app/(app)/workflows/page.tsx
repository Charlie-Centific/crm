export const dynamic = "force-dynamic";

import { getAllWorkflows } from "@/lib/workflows";
import { WorkflowsClient } from "./workflows-client";

export default async function WorkflowsPage() {
  const workflows = await getAllWorkflows();

  // Collect all unique tags for filter UI
  const allVerticals = Array.from(
    new Set(workflows.flatMap((w) => w.verticalTags))
  ).sort();
  const allThreats = Array.from(
    new Set(workflows.flatMap((w) => w.threatTags))
  ).sort();

  return (
    <WorkflowsClient
      workflows={workflows}
      allVerticals={allVerticals}
      allThreats={allThreats}
    />
  );
}
