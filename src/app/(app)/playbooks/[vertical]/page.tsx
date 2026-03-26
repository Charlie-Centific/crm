import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getPlaybookContent, getPlaybookByVertical, PLAYBOOK_META } from "@/lib/playbooks";

export function generateStaticParams() {
  return PLAYBOOK_META.map((p) => ({ vertical: p.slug }));
}

export default async function PlaybookDetailPage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  const meta = PLAYBOOK_META.find((p) => p.slug === vertical);
  if (!meta) notFound();

  const content = getPlaybookContent(vertical);
  if (!content) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/playbooks" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">
          ← Playbooks
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{meta.label} Playbook</h1>
        <p className="text-sm text-gray-500 mt-1">{meta.description}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="prose prose-sm prose-gray max-w-none
          prose-headings:font-semibold
          prose-h1:text-xl prose-h1:mb-4
          prose-h2:text-base prose-h2:mt-6 prose-h2:mb-3
          prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-2
          prose-p:text-gray-600 prose-p:leading-relaxed
          prose-li:text-gray-600
          prose-strong:text-gray-800
          prose-table:text-sm
          prose-th:bg-gray-50 prose-th:text-gray-700 prose-th:font-semibold
          prose-td:text-gray-600
          prose-blockquote:border-brand-300 prose-blockquote:text-gray-600
        ">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>

      {/* Quick link to matching demo script */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Ready for the demo? Pull up the step-by-step demo script.
        </p>
        <Link
          href="/demo-scripts"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 ml-4 flex-shrink-0"
        >
          Demo Scripts →
        </Link>
      </div>
    </div>
  );
}
