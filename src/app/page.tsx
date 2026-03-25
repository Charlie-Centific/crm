import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">VAI CRM</h1>
        <p className="text-gray-500 mb-8">Centific sales command center</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/pipeline"
            className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-brand-500 hover:shadow-sm transition-all"
          >
            <h2 className="font-semibold text-gray-900 mb-1">Pipeline</h2>
            <p className="text-sm text-gray-500">
              Conference and partner lead pipeline view
            </p>
          </Link>

          <Link
            href="/accounts"
            className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-brand-500 hover:shadow-sm transition-all"
          >
            <h2 className="font-semibold text-gray-900 mb-1">Accounts</h2>
            <p className="text-sm text-gray-500">
              All accounts synced from Dynamics 365
            </p>
          </Link>

          <Link
            href="/workshops"
            className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-brand-500 hover:shadow-sm transition-all"
          >
            <h2 className="font-semibold text-gray-900 mb-1">Workshops</h2>
            <p className="text-sm text-gray-500">
              Use case workshops and 90-day value reports
            </p>
          </Link>

          <Link
            href="/pilots"
            className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-brand-500 hover:shadow-sm transition-all"
          >
            <h2 className="font-semibold text-gray-900 mb-1">Pilots</h2>
            <p className="text-sm text-gray-500">
              Active pilot tracker and 90-day clock
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
