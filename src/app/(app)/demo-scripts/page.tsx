import Link from "next/link";
import { ALL_DEMO_SCRIPTS } from "@/lib/demo-scripts";

export default function DemoScriptsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Demo Scripts</h1>
        <p className="text-sm text-gray-500 mt-1">
          Step-by-step scripts for live demos — with talking points, timing, and presenter notes.
          Steps track during the session and reset on reload.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ALL_DEMO_SCRIPTS.map((script) => (
          <Link
            key={script.slug}
            href={`/demo-scripts/${script.slug}`}
            className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-brand-300 hover:bg-brand-50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-base font-semibold text-gray-900">{script.name}</h2>
                <p className="text-xs text-brand-600 font-medium mt-0.5">{script.tagline}</p>
                <p className="text-sm text-gray-500 mt-2">{script.description}</p>
                <p className="text-xs text-gray-400 mt-3">
                  {script.steps.length} steps · ~{script.steps.reduce((sum, s) => {
                    const m = s.duration?.match(/(\d+)/);
                    return sum + (m ? parseInt(m[1]) : 0);
                  }, 0)} min
                </p>
              </div>
              <span className="text-sm font-medium text-brand-600 ml-4 flex-shrink-0">
                Start →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
