import { RFPBuilder } from "./rfp-builder";

export default function RFPPage() {
  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-7">
        <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1">Content Engine</p>
        <h1 className="text-2xl font-bold text-gray-900">RFP Response Builder</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-xl">
          Select the response blocks that fit the RFP — the document assembles itself.
          Switch to Preview to copy the full response.
        </p>
      </div>

      <RFPBuilder />
    </div>
  );
}
