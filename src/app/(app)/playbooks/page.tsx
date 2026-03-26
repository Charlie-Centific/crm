import Link from "next/link";
import { ALL_PLAYBOOKS } from "@/lib/playbook-data";

const CARD_STYLES: Record<string, { gradient: string; border: string; hover: string; badge: string }> = {
  "smart-city": {
    gradient: "from-violet-600 to-purple-800",
    border: "border-violet-200",
    hover: "hover:border-violet-400",
    badge: "bg-violet-100 text-violet-700",
  },
  transit: {
    gradient: "from-blue-600 to-indigo-800",
    border: "border-blue-200",
    hover: "hover:border-blue-400",
    badge: "bg-blue-100 text-blue-700",
  },
  emergency: {
    gradient: "from-orange-500 to-red-700",
    border: "border-orange-200",
    hover: "hover:border-orange-400",
    badge: "bg-orange-100 text-orange-700",
  },
};

const STAT_LABELS: Record<string, string[]> = {
  "smart-city": ["Real-time alerting", "Post-event investigation", "Automated reporting"],
  transit:      ["Predictive maintenance", "Platform safety", "Revenue protection"],
  emergency:    ["Threat detection", "Digital forensics", "Automated reporting"],
};

export default function PlaybooksPage() {
  return (
    <div className="max-w-4xl">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1">Content Engine</p>
        <h1 className="text-2xl font-bold text-gray-900">Vertical Playbooks</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-lg">
          Interactive discovery guides with branching responses — what to say when they hit a pain point,
          when they don't, and how to bridge to VAI.
        </p>
      </div>

      {/* Playbook cards */}
      <div className="grid grid-cols-1 gap-4">
        {ALL_PLAYBOOKS.map((p) => {
          const style = CARD_STYLES[p.slug] ?? CARD_STYLES["smart-city"];
          const stats = STAT_LABELS[p.slug] ?? [];

          return (
            <Link
              key={p.slug}
              href={`/playbooks/${p.slug}`}
              className={`group block bg-white border rounded-2xl overflow-hidden transition-all ${style.border} ${style.hover} hover:shadow-md`}
            >
              <div className="flex">
                {/* Color stripe */}
                <div className={`w-1.5 flex-shrink-0 bg-gradient-to-b ${style.gradient}`} />

                {/* Content */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                          {p.label}
                        </span>
                        <span className="text-xs text-gray-400">{p.buyer.split(",")[0]?.trim()}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 leading-snug">{p.tagline}</p>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{p.overview}</p>

                      {/* Capability chips */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {stats.map((s) => (
                          <span key={s} className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Section counts */}
                    <div className="flex-shrink-0 text-right hidden sm:block">
                      <div className="space-y-1">
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">{p.discovery.length}</span>
                          <span className="text-xs text-gray-400 ml-1">discovery q's</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">{p.painPoints.length}</span>
                          <span className="text-xs text-gray-400 ml-1">pain points</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">{p.objections.length}</span>
                          <span className="text-xs text-gray-400 ml-1">objections</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center pr-4 text-gray-300 group-hover:text-brand-400 transition-colors">
                  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom tip */}
      <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-brand-50 border border-brand-100 rounded-xl">
        <div className="w-1.5 h-8 bg-brand-400 rounded-full flex-shrink-0" />
        <p className="text-xs text-brand-700">
          <span className="font-semibold">Tip:</span>{" "}
          Playbooks open automatically from any account page based on the account's vertical.
          Use the Discovery tab before a call, Pain Points during.
        </p>
      </div>
    </div>
  );
}
