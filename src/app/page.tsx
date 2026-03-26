import Link from "next/link";

const SECTIONS = [
  {
    href: "/pipeline",
    label: "Pipeline",
    description: "Kanban board of active deals — stage, value, owner, and days-in-stage alerts.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    accent: "from-violet-500 to-brand-600",
    border: "hover:border-violet-300",
  },
  {
    href: "/accounts",
    label: "Accounts",
    description: "Full account profiles — contacts, opportunities, activity log, and pre-call briefs.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    accent: "from-blue-500 to-indigo-600",
    border: "hover:border-blue-300",
  },
  {
    href: "/playbooks",
    label: "Playbooks",
    description: "Interactive discovery guides — branching responses for pain points, objections, and demo scenarios by vertical.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    accent: "from-violet-600 to-purple-700",
    border: "hover:border-violet-300",
    badge: "New",
  },
  {
    href: "/demo-scripts",
    label: "Demo Scripts",
    description: "Step-by-step live demo guides for SLiM and VAI — talking points, presenter notes, and a progress timer.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    accent: "from-emerald-500 to-teal-600",
    border: "hover:border-emerald-300",
    badge: "New",
  },
  {
    href: "/rfp",
    label: "RFP Responses",
    description: "Pre-written RFP response templates by vertical — technical, integration, security, experience, and support questions ready to copy.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    accent: "from-indigo-500 to-blue-600",
    border: "hover:border-indigo-300",
    badge: "New",
  },
  {
    href: "/workshops",
    label: "Workshops",
    description: "Use case workshop builder and 90-day value reports for post-pilot accounts.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    accent: "from-amber-500 to-orange-600",
    border: "hover:border-amber-300",
  },
  {
    href: "/pilots",
    label: "Pilots",
    description: "Active pilot tracker — 90-day clock, milestone check-in, and success criteria per account.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: "from-sky-500 to-blue-600",
    border: "hover:border-sky-300",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 px-8 py-14">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-black text-base">V</span>
            </div>
            <span className="text-white/80 text-sm font-semibold tracking-wide uppercase">Centific · VAI CRM</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
            Your sales command center
          </h1>
          <p className="text-brand-100 text-base max-w-xl leading-relaxed">
            Accounts, pipeline, pre-call briefs, vertical playbooks, and live demo scripts — everything you need before, during, and after a conversation.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`group relative bg-white rounded-2xl border border-gray-200 ${s.border} hover:shadow-md transition-all p-5 overflow-hidden`}
            >
              {/* Gradient top bar */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center text-white flex-shrink-0`}>
                  {s.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-gray-900 text-sm">{s.label}</h2>
                    {s.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-600 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded-full">
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          VAI CRM · Centific internal · {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
