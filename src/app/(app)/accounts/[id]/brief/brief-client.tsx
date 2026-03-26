"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface BriefClientProps {
  accountId: string;
  brief: { id: string; content: string; generatedAt: string | null; editedAt: string | null } | null;
  hasBrief: boolean;
  claudePrompt: string;
}

export function BriefClient({ accountId, brief, hasBrief, claudePrompt }: BriefClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(brief?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    await fetch(`/api/accounts/${accountId}/brief`, { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  async function handleSave() {
    if (!brief) return;
    setSaving(true);
    await fetch(`/api/accounts/${accountId}/brief`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ briefId: brief.id, content: editContent }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(claudePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-3 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Generating…" : hasBrief ? "Regenerate" : "Generate Brief"}
        </button>

        {hasBrief && !editing && (
          <button
            onClick={() => { setEditContent(brief?.content ?? ""); setEditing(true); }}
            className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
          >
            Edit
          </button>
        )}

        {editing && (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </>
        )}

        {hasBrief && (
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 ml-auto"
            title="Copy a rich prompt to paste into Claude.ai for an AI-expanded version"
          >
            {copied ? "Copied!" : "Copy prompt for Claude.ai"}
          </button>
        )}
      </div>

      {/* Brief content */}
      {hasBrief && brief && (
        <div className="bg-white border border-gray-200 rounded-xl">
          {editing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-[60vh] p-6 text-sm font-mono text-gray-800 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          ) : (
            <div className="p-6 prose prose-sm prose-gray max-w-none">
              <ReactMarkdown>{brief.content}</ReactMarkdown>
            </div>
          )}
          <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400 flex gap-4">
            <span>Generated {brief.generatedAt ? new Date(brief.generatedAt).toLocaleString() : "—"}</span>
            {brief.editedAt && <span>Edited {new Date(brief.editedAt).toLocaleString()}</span>}
          </div>
        </div>
      )}

      {!hasBrief && !loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400">
          <p className="text-sm">No brief generated yet.</p>
          <p className="text-xs mt-1">Click &quot;Generate Brief&quot; to create a structured pre-call brief from this account&apos;s CRM data.</p>
        </div>
      )}
    </div>
  );
}
