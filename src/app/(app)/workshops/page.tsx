import { WorkshopBuilder } from "./workshop-builder";

export default function WorkshopsPage() {
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
      <WorkshopBuilder />
    </div>
  );
}
