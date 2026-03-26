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
      border:  "border-emerald-500",
      glow:    "hover:shadow-emerald-500/20",
      iconColor: "text-emerald-400",
      arrowColor: "group-hover:text-emerald-400",
    },
    {
      href: "/workshops",
      label: t("actions.workshop.label"),
      tagline: t("actions.workshop.tagline"),
      Icon: Users,
      border:  "border-blue-500",
      glow:    "hover:shadow-blue-500/20",
      iconColor: "text-blue-400",
      arrowColor: "group-hover:text-blue-400",
    },
    {
      href: "/rfp",
      label: t("actions.rfp.label"),
      tagline: t("actions.rfp.tagline"),
      Icon: FileText,
      border:  "border-indigo-500",
      glow:    "hover:shadow-indigo-500/20",
      iconColor: "text-indigo-400",
      arrowColor: "group-hover:text-indigo-400",
    },
    {
      href: "/assets",
      label: t("actions.assets.label"),
      tagline: t("actions.assets.tagline"),
      Icon: LayoutTemplate,
      border:  "border-rose-500",
      glow:    "hover:shadow-rose-500/20",
      iconColor: "text-rose-400",
      arrowColor: "group-hover:text-rose-400",
    },
    {
      href: "/intelligence",
      label: t("actions.intelligence.label"),
      tagline: t("actions.intelligence.tagline"),
      Icon: Newspaper,
      border:  "border-amber-500",
      glow:    "hover:shadow-amber-500/20",
      iconColor: "text-amber-400",
      arrowColor: "group-hover:text-amber-400",
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
    <div
      className="min-h-screen flex flex-col bg-white"
      style={{
        backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <Nav />

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-16">

        {/* Tagline */}
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
            Centific · VisionAI Sales Platform
          </p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            {t("tagline")}
          </h1>
          <p className="text-sm text-gray-400">{t("subtitle")}</p>
        </div>

        {/* Primary action cards */}
        <div className="grid grid-cols-5 gap-4 w-full max-w-5xl mb-12">
          {PRIMARY_ACTIONS.map(({ href, label, tagline, Icon, border, glow, iconColor, arrowColor }) => (
            <Link
              key={href}
              href={href}
              className={`group flex flex-col bg-gray-900 border-2 ${border} rounded-2xl p-6 hover:shadow-xl ${glow} hover:-translate-y-1 transition-all duration-200`}
            >
              <Icon size={30} className={`${iconColor} mb-5 flex-shrink-0`} />

              <p className="text-sm font-bold text-white leading-tight mb-2">
                {label}
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed flex-1">
                {tagline}
              </p>

              <div className="flex justify-end mt-5">
                <ArrowRight
                  size={15}
                  className={`text-gray-700 ${arrowColor} group-hover:translate-x-0.5 transition-all duration-150`}
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Secondary tools */}
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.18em] text-center mb-3">
            {t("moreTools")}
          </p>
          <div className="flex justify-center gap-1.5 flex-wrap">
            {SECONDARY_TOOLS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 bg-white/80 hover:bg-white border border-gray-300 hover:border-gray-400 rounded-lg hover:shadow-sm transition-all"
              >
                <Icon size={12} className="text-gray-400" />
                {label}
              </Link>
            ))}
          </div>
        </div>

      </main>

      <footer className="border-t border-gray-200/60">
        <div className="max-w-5xl mx-auto px-8 py-4 text-right">
          <p className="text-[10px] text-gray-400">
            {t("footer")} · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
