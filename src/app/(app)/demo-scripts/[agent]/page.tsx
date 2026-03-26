import { notFound } from "next/navigation";
import Link from "next/link";
import { getDemoScript, ALL_DEMO_SCRIPTS } from "@/lib/demo-scripts";
import { DemoClient } from "./demo-client";

export function generateStaticParams() {
  return ALL_DEMO_SCRIPTS.map((s) => ({ agent: s.slug }));
}

export default async function DemoScriptPage({
  params,
}: {
  params: Promise<{ agent: string }>;
}) {
  const { agent } = await params;
  const script = getDemoScript(agent);
  if (!script) notFound();

  const totalMinutes = script.steps.reduce((sum, s) => {
    const m = s.duration?.match(/(\d+)/);
    return sum + (m ? parseInt(m[1]) : 0);
  }, 0);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/demo-scripts" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">
          ← Demo Scripts
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{script.name}</h1>
            <p className="text-sm text-brand-600 font-medium mt-0.5">{script.tagline}</p>
            <p className="text-sm text-gray-500 mt-2 max-w-xl">{script.description}</p>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="text-2xl font-bold text-gray-900">~{totalMinutes}</p>
            <p className="text-xs text-gray-400">min total</p>
          </div>
        </div>
      </div>

      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
        <span className="font-semibold">Live session mode:</span> Check off each step as you go.
        Progress resets when you leave the page.
      </div>

      <DemoClient steps={script.steps} closingMessage={script.closingMessage} />
    </div>
  );
}
