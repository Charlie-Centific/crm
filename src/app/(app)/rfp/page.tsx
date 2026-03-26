export const dynamic = "force-dynamic";

import { RFPBuilder } from "./rfp-builder";
import { getAllWorkflows } from "@/lib/workflows";

export default async function RFPPage() {
  const allWorkflows = await getAllWorkflows();

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1">Content Engine</p>
        <h1 className="text-2xl font-bold text-gray-900">RFP Response Builder</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-xl">
          Select the response blocks that fit the RFP — the document assembles itself.
          Switch to Preview to copy the full response.
        </p>
      </div>

      <RFPBuilder allWorkflows={allWorkflows} />
    </div>
  );
}
