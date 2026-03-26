import Link from "next/link";

const MODULES = [
  {
    href: "/pipeline",
    label: "Pipeline",
    description: "Kanban board of active deals — stage, value, owner, and days-in-stage alerts.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    grad: "from-violet-500 to-brand-600",
    bar: "from-violet-400 to-brand-500",
  },
  {
    href: "/accounts",
    label: "Accounts",
    description: "Full account profiles — contacts, opportunities, activity log, and AI-generated pre-call briefs.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    grad: "from-blue-500 to-indigo-600",
    bar: "from-blue-400 to-indigo-500",
  },
  {
    href: "/playbooks",
    label: "Playbooks",
    description: "Discovery guides with branching responses for pain points, objections, and demo scenarios by vertical.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    grad: "from-violet-600 to-purple-700",
    bar: "from-violet-500 to-purple-600",
    badge: "New",
  },
  {
    href: "/demo-scripts",
    label: "Demo Scripts",
    description: "Step-by-step live demo guides — talking points, presenter notes, and a progress timer.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    grad: "from-emerald-500 to-teal-600",
    bar: "from-emerald-400 to-teal-500",
    badge: "New",
  },
  {
    href: "/rfp",
    label: "RFP Builder",
    description: "Select response blocks and build a Centific-branded RFP response in minutes — edit and publish as PDF.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    grad: "from-indigo-500 to-blue-600",
    bar: "from-indigo-400 to-blue-500",
    badge: "New",
  },
  {
    href: "/workshops",
    label: "Workshops",
    description: "Workshop prep builder — attendees, use case prioritization, deployment decisions, and a branded PDF.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    grad: "from-amber-500 to-orange-600",
    bar: "from-amber-400 to-orange-500",
    badge: "New",
  },
  {
    href: "/pilots",
    label: "Pilots",
    description: "Active pilot tracker — 90-day clock, milestone check-ins, and success criteria per account.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    grad: "from-sky-500 to-blue-600",
    bar: "from-sky-400 to-blue-500",
  },
];

const STATS = [
  { num: "3", label: "City Verticals" },
  { num: "90", label: "Day Pilot Playbook" },
  { num: "5 min", label: "RFP Response" },
  { num: "7+", label: "Sales Tools" },
];

const PIPELINE = [
  { label: "Smart City", value: "$4.2M", pct: 78, color: "from-violet-400 to-brand-500" },
  { label: "Transit", value: "$2.8M", pct: 52, color: "from-blue-400 to-indigo-500" },
  { label: "Emergency", value: "$1.6M", pct: 30, color: "from-rose-400 to-accent-500" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0D0620]">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-brand-700/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent-600/20 rounded-full blur-[100px] pointer-events-none" />
        {/* Grid lines overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative max-w-7xl mx-auto px-8 pt-10 pb-20">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/vai-icon-64.webp" alt="VAI" className="w-full h-full object-contain" style={{ filter: "brightness(0) invert(1)" }} />
              </div>
              <span className="text-white/50 text-sm font-semibold tracking-wide">Centific · VAI Sales Buddy</span>
            </div>
            <Link href="/pipeline"
              className="flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white bg-white/8 hover:bg-white/12 border border-white/15 hover:border-white/25 px-4 py-2 rounded-xl transition-all">
              Open App
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
            </Link>
          </div>

          {/* Main hero content */}
          <div className="grid grid-cols-2 gap-16 items-center">

            {/* Left: headline + stats + CTA */}
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                AI-Powered Sales Platform
              </div>

              <h1 className="text-5xl font-black text-white leading-[1.08] tracking-tight mb-5">
                Win more.<br />
                <span className="bg-gradient-to-r from-brand-300 via-violet-300 to-accent-300 bg-clip-text text-transparent">
                  Close faster.
                </span>
              </h1>

              <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-md">
                Every tool your team needs before, during, and after a VAI conversation — in one place.
              </p>

              {/* CTA buttons */}
              <div className="flex gap-3 mb-14">
                <Link href="/pipeline"
                  className="bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-400 hover:to-violet-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand-900/40 hover:shadow-brand-900/60">
                  View Pipeline
                </Link>
                <Link href="/playbooks"
                  className="bg-white/8 hover:bg-white/12 border border-white/15 hover:border-white/25 text-white/80 hover:text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all">
                  Open Playbooks
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-5">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-black text-white">{s.num}</div>
                    <div className="text-white/35 text-xs mt-0.5 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: dashboard visual */}
            <div className="relative">
              {/* Main pipeline card */}
              <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Pipeline Snapshot</span>
                  <span className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  {PIPELINE.map((p) => (
                    <div key={p.label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-white/60 text-xs">{p.label}</span>
                        <span className="text-white text-xs font-bold">{p.value}</span>
                      </div>
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${p.color} rounded-full`} style={{ width: `${p.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/8 pt-4 grid grid-cols-3 gap-2 text-center">
                  {[["3", "Active Pilots"], ["$8.6M", "Pipeline"], ["47", "Avg Pilot Day"]].map(([n, l]) => (
                    <div key={l}>
                      <div className="text-white text-xl font-black">{n}</div>
                      <div className="text-white/30 text-[10px] mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge — top right */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-brand-500 to-violet-600 rounded-2xl px-4 py-3 shadow-xl border border-brand-400/30">
                <div className="text-brand-200 text-[9px] font-bold uppercase tracking-widest mb-0.5">Next Close</div>
                <div className="text-white text-sm font-bold">Louisville · Day 47</div>
              </div>

              {/* Floating badge — bottom left */}
              <div className="absolute -bottom-4 -left-4 bg-white/8 backdrop-blur border border-white/15 rounded-2xl px-4 py-3 shadow-xl">
                <div className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-0.5">RFP Response</div>
                <div className="text-emerald-400 text-sm font-bold">Built in 4 min</div>
              </div>

              {/* Floating badge — mid left */}
              <div className="absolute top-1/2 -left-8 -translate-y-1/2 bg-white/8 backdrop-blur border border-white/15 rounded-xl px-3 py-2.5 shadow-lg">
                <div className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-0.5">Workshop Doc</div>
                <div className="text-accent-300 text-xs font-bold">Ready to publish</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Modules ───────────────────────────────────────────────────── */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="mb-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 mb-2">Your Sales Toolkit</p>
            <h2 className="text-2xl font-bold text-gray-900">Everything in one place</h2>
            <p className="text-gray-500 text-sm mt-1">Seven tools built for the VAI sales motion — from first call to signed pilot.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {MODULES.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="group relative bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Top gradient bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${m.bar}`} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.grad} flex items-center justify-center text-white shadow-sm`}>
                      {m.icon}
                    </div>
                    {m.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                        {m.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm mb-1.5 group-hover:text-brand-700 transition-colors">
                    {m.label}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{m.description}</p>

                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-brand-600 transition-colors">
                    Open
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform">
                      <path fillRule="evenodd" d="M2 8a.75.75 0 01.75-.75h8.69L8.22 4.03a.75.75 0 011.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06-1.06l3.22-3.22H2.75A.75.75 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center p-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/vai-icon-64.webp" alt="VAI" className="w-full h-full object-contain" style={{ filter: "brightness(0) invert(1)" }} />
            </div>
            <span className="text-sm font-bold text-gray-700">VAI Sales Buddy</span>
          </div>
          <p className="text-xs text-gray-400">
            Centific Global Services · Internal Tool · {new Date().getFullYear()}
          </p>
        </div>
      </div>

    </div>
  );
}
