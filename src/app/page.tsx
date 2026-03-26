import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Nav } from "@/components/nav";
import {
  MonitorPlay,
  Users,
  FileText,
  BarChart3,
  Building2,
  BookOpen,
  Network,
  Activity,
  Upload,
  LayoutTemplate,
  Newspaper,
  Calculator,
} from "lucide-react";

export default async function Home() {
  const t = await getTranslations("home");

  const PRIMARY_ACTIONS = [
    {
      href: "/demo-scripts",
      label: t("actions.demo.label"),
      description: t("actions.demo.description"),
      Icon: MonitorPlay,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 border-emerald-200",
      cta: t("actions.demo.cta"),
      ctaColor: "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      href: "/workshops",
      label: t("actions.workshop.label"),
      description: t("actions.workshop.description"),
      Icon: Users,
      iconColor: "text-brand-600",
      iconBg: "bg-brand-50 border-brand-200",
      cta: t("actions.workshop.cta"),
      ctaColor: "bg-brand-600 hover:bg-brand-700",
    },
    {
      href: "/rfp",
      label: t("actions.rfp.label"),
      description: t("actions.rfp.description"),
      Icon: FileText,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50 border-indigo-200",
      cta: t("actions.rfp.cta"),
      ctaColor: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      href: "/assets",
      label: t("actions.assets.label"),
      description: t("actions.assets.description"),
      Icon: LayoutTemplate,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-50 border-rose-200",
      cta: t("actions.assets.cta"),
      ctaColor: "bg-rose-600 hover:bg-rose-700",
    },
    {
      href: "/intelligence",
      label: t("actions.intelligence.label"),
      description: t("actions.intelligence.description"),
      Icon: Newspaper,
      iconColor: "text-gray-700",
      iconBg: "bg-gray-100 border-gray-200",
      cta: t("actions.intelligence.cta"),
      ctaColor: "bg-gray-800 hover:bg-gray-900",
    },
  ];

  const SECONDARY_TOOLS = [
    { href: "/pipeline",  label: t("tools.pipeline"),  Icon: BarChart3   },
    { href: "/accounts",  label: t("tools.accounts"),  Icon: Building2   },
    { href: "/playbooks", label: t("tools.playbooks"), Icon: BookOpen    },
    { href: "/workflows", label: t("tools.workflows"), Icon: Network     },
    { href: "/pilots",    label: t("tools.pilots"),    Icon: Activity    },
    { href: "/pricing",   label: t("tools.pricing"),   Icon: Calculator  },
    { href: "/import",    label: t("tools.import"),    Icon: Upload      },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <Nav />

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl mx-auto px-8 py-16 w-full">

        {/* Prompt */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("tagline")}</h1>
          <p className="text-sm text-gray-400">{t("subtitle")}</p>
        </div>

        {/* Primary action cards — 3 top + 2 centered bottom */}
        <div className="mb-14">
          <div className="grid grid-cols-3 gap-5 mb-5">
            {PRIMARY_ACTIONS.slice(0, 3).map(({ href, label, description, Icon, iconColor, iconBg, cta, ctaColor }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col bg-white border border-gray-200 rounded-2xl p-7 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 flex-shrink-0 ${iconBg}`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h2 className="text-base font-bold text-gray-900 mb-2 group-hover:text-brand-700 transition-colors">
                  {label}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-6">
                  {description}
                </p>
                <div className={`${ctaColor} text-white text-sm font-semibold px-4 py-2.5 rounded-xl text-center transition-colors`}>
                  {cta}
                </div>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-5 max-w-[calc(66.666%+10px)] mx-auto">
            {PRIMARY_ACTIONS.slice(3).map(({ href, label, description, Icon, iconColor, iconBg, cta, ctaColor }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col bg-white border border-gray-200 rounded-2xl p-7 hover:border-gray-300 hover:shadow-md transition-all"
              >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 flex-shrink-0 ${iconBg}`}>
                <Icon size={22} className={iconColor} />
              </div>

              <h2 className="text-base font-bold text-gray-900 mb-2 group-hover:text-brand-700 transition-colors">
                {label}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-6">
                {description}
              </p>

              <div className={`${ctaColor} text-white text-sm font-semibold px-4 py-2.5 rounded-xl text-center transition-colors`}>
                {cta}
              </div>
            </Link>
          ))}
          </div>
        </div>

        {/* Secondary tools */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-4">
            {t("moreTools")}
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {SECONDARY_TOOLS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <Icon size={14} className="text-gray-400" />
                {label}
              </Link>
            ))}
          </div>
        </div>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-5 text-right">
          <p className="text-xs text-gray-400">
            {t("footer")} · {new Date().getFullYear()}
          </p>
        </div>
      </footer>

    </div>
  );
}
