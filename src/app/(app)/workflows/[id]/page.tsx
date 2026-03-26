export const dynamic = "force-dynamic";

import { getWorkflowById } from "@/lib/workflows";
import { notFound } from "next/navigation";
import { WorkflowDetailClient } from "./workflow-detail-client";

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = await getWorkflowById(id);
  if (!workflow) notFound();

  return <WorkflowDetailClient workflow={workflow} />;
}
