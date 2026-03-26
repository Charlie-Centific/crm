export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlaybook, ALL_PLAYBOOKS } from "@/lib/playbook-data";
import { getWorkflowsByIds } from "@/lib/workflows";
import { PlaybookInteractive } from "./playbook-interactive";

const VERTICAL_COLORS: Record<string, { gradient: string; badge: string }> = {
  "smart-city": { gradient: "from-violet-700 via-purple-700 to-purple-900", badge: "bg-violet-500/30 text-violet-100" },
  transit:      { gradient: "from-blue-700 via-indigo-700 to-indigo-900",   badge: "bg-blue-500/30 text-blue-100" },
  emergency:    { gradient: "from-orange-600 via-red-700 to-red-900",       badge: "bg-orange-500/30 text-orange-100" },
};

export function generateStaticParams() {
  return ALL_PLAYBOOKS.map((p) => ({ vertical: p.slug }));
}

export default async function PlaybookDetailPage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  const playbook = getPlaybook(vertical);
  if (!playbook) notFound();

  const [playbookWorkflows, allWorkflows] = await Promise.all([
    getWorkflowsByIds(playbook.workflowIds ?? []),
    import("@/lib/workflows").then((m) => m.getAllWorkflows()),
  ]);

  const colors = VERTICAL_COLORS[vertical] ?? VERTICAL_COLORS["smart-city"];

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <Link href="/playbooks" className="text-sm text-gray-400 hover:text-gray-600 mb-4 block">
        ← Playbooks
      </Link>

      {/* Hero card */}
      <div className={`bg-gradient-to-br ${colors.gradient} rounded-2xl p-6 mb-5 text-white`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Vertical Playbook</p>
            <h1 className="text-2xl font-bold leading-tight">{playbook.label}</h1>
            <p className="text-white/70 text-sm mt-1 font-medium">{playbook.tagline}</p>
          </div>
        </div>
        <p className="text-white/80 text-sm mt-4 leading-relaxed">{playbook.overview}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Buyers:</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
            {playbook.buyer}
          </span>
        </div>
      </div>

      {/* Interactive playbook */}
      <PlaybookInteractive playbook={playbook} workflows={playbookWorkflows} allWorkflows={allWorkflows} />

      {/* Footer CTA */}
      <div className="mt-6 flex items-center justify-between px-1">
        <p className="text-xs text-gray-400">Ready to show the platform?</p>
        <Link
          href="/demo-scripts"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Demo Scripts →
        </Link>
      </div>
    </div>
  );
}
