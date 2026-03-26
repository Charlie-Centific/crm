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
  ArrowRight,
} from "lucide-react";

export default async function Home() {
  const t = await getTranslations("home");

  const PRIMARY_ACTIONS = [
    {
      href: "/demo-scripts",
      label: t("actions.demo.label"),
      tagline: t("actions.demo.tagline"),
      Icon: MonitorPlay,
      accent: "emerald",
      accentBar:   "before:bg-emerald-500",
      iconColor:   "text-emerald-500",
      hoverBg:     "hover:bg-emerald-50",
      hoverBorder: "hover:border-emerald-300",
    },
    {
      href: "/workshops",
      label: t("actions.workshop.label"),
      tagline: t("actions.workshop.tagline"),
      Icon: Users,
      accent: "brand",
      accentBar:   "before:bg-brand-500",
      iconColor:   "text-brand-500",
      hoverBg:     "hover:bg-brand-50",
      hoverBorder: "hover:border-brand-300",
    },
    {
      href: "/rfp",
      label: t("actions.rfp.label"),
      tagline: t("actions.rfp.tagline"),
      Icon: FileText,
      accent: "indigo",
      accentBar:   "before:bg-indigo-500",
      iconColor:   "text-indigo-500",
      hoverBg:     "hover:bg-indigo-50",
      hoverBorder: "hover:border-indigo-300",
    },
    {
      href: "/assets",
      label: t("actions.assets.label"),
      tagline: t("actions.assets.tagline"),
      Icon: LayoutTemplate,
      accent: "rose",
      accentBar:   "before:bg-rose-500",
      iconColor:   "text-rose-500",
      hoverBg:     "hover:bg-rose-50",
      hoverBorder: "hover:border-rose-300",
    },
    {
      href: "/intelligence",
      label: t("actions.intelligence.label"),
      tagline: t("actions.intelligence.tagline"),
      Icon: Newspaper,
      accent: "gray",
      accentBar:   "before:bg-gray-700",
      iconColor:   "text-gray-700",
      hoverBg:     "hover:bg-gray-100",
      hoverBorder: "hover:border-gray-400",
    },
  ];

  const SECONDARY_TOOLS = [
    { href: "/pipeline",  label: t("tools.pipeline"),  Icon: BarChart3  },
    { href: "/accounts",  label: t("tools.accounts"),  Icon: Building2  },
    { href: "/playbooks", label: t("tools.playbooks"), Icon: BookOpen   },
    { href: "/workflows", label: t("tools.workflows"), Icon: Network    },
    { href: "/pilots",    label: t("tools.pilots"),    Icon: Activity   },
    { href: "/pricing",   label: t("tools.pricing"),   Icon: Calculator },
    { href: "/import",    label: t("tools.import"),    Icon: Upload     },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Nav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-gray-950 to-gray-900 pt-14 pb-16 px-8 text-center">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">
          Centific · VisionAI Sales Platform
        </p>
        <h1 className="text-5xl font-black text-white tracking-tight mb-3 leading-none">
          {t("tagline")}
        </h1>
        <p className="text-sm text-gray-400">{t("subtitle")}</p>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 -mt-6">

        {/* Primary — 5 tiles */}
        <div className="grid grid-cols-5 gap-3 mb-10">
          {PRIMARY_ACTIONS.map(({ href, label, tagline, Icon, accentBar, iconColor, hoverBg, hoverBorder }) => (
            <Link
              key={href}
              href={href}
              className={`group relative flex flex-col bg-white border border-gray-200 rounded-2xl p-5 pt-6 overflow-hidden transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 ${hoverBg} ${hoverBorder}
                before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-150 ${accentBar}`}
            >
              {/* Color bar always visible on hover via before: */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${accentBar.replace("before:","")}`} />

              <Icon size={32} className={`${iconColor} mb-4 flex-shrink-0`} />

              <p className="text-sm font-bold text-gray-900 leading-tight mb-1.5">
                {label}
              </p>
              <p className="text-[11px] text-gray-400 leading-snug flex-1">
                {tagline}
              </p>

              <div className="flex items-center justify-end mt-4">
                <ArrowRight
                  size={14}
                  className="text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all duration-150"
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Secondary tools */}
        <div className="pb-12">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.18em] text-center mb-3">
            {t("moreTools")}
          </p>
          <div className="flex justify-center gap-1.5 flex-wrap">
            {SECONDARY_TOOLS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-lg hover:shadow-sm transition-all"
              >
                <Icon size={12} className="text-gray-400" />
                {label}
              </Link>
            ))}
          </div>
        </div>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-8 py-4 text-right">
          <p className="text-[10px] text-gray-300">
            {t("footer")} · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
