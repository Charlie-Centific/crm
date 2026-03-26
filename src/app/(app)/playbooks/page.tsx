import Link from "next/link";
import { PLAYBOOK_META } from "@/lib/playbooks";

const COLOR_CLASSES: Record<string, { card: string; badge: string; link: string }> = {
  purple: {
    card: "border-purple-200 hover:border-purple-300 hover:bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    link: "text-purple-700",
  },
  blue: {
    card: "border-blue-200 hover:border-blue-300 hover:bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    link: "text-blue-700",
  },
  orange: {
    card: "border-orange-200 hover:border-orange-300 hover:bg-orange-50",
    badge: "bg-orange-100 text-orange-700",
    link: "text-orange-700",
  },
};

export default function PlaybooksPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Vertical Playbooks</h1>
        <p className="text-sm text-gray-500 mt-1">
          Discovery questions, demo scenarios, objection handling, and proof points — by vertical.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {PLAYBOOK_META.map((p) => {
          const colors = COLOR_CLASSES[p.color] ?? COLOR_CLASSES.blue;
          return (
            <Link
              key={p.slug}
              href={`/playbooks/${p.slug}`}
              className={`block bg-white border rounded-xl p-6 transition-all ${colors.card}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
                      {p.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{p.description}</p>
                </div>
                <span className={`text-sm font-medium ml-4 flex-shrink-0 ${colors.link}`}>
                  Open →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <p className="text-xs text-gray-500">
          <span className="font-medium">Tip:</span> Playbooks open automatically from account pages based on the account's vertical.
          You can also access them here anytime before a call.
        </p>
      </div>
    </div>
  );
}
