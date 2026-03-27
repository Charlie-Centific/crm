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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Working late";
}

export default async function Home() {
  const t = await getTranslations("home");
  const greeting = getGreeting();

  const PRIMARY_ACTIONS = [
    {
      href: "/demo-scripts",
      label: t("actions.demo.label"),
      tagline: t("actions.demo.tagline"),
      Icon: MonitorPlay,
      border:     "border-emerald-400",
      glow:       "hover:shadow-emerald-400/25",
      iconColor:  "text-emerald-400",
      arrowColor: "group-hover:text-emerald-400",
    },
    {
      href: "/workshops",
      label: t("actions.workshop.label"),
      tagline: t("actions.workshop.tagline"),
      Icon: Users,
      border:     "border-blue-400",
      glow:       "hover:shadow-blue-400/25",
      iconColor:  "text-blue-400",
      arrowColor: "group-hover:text-blue-400",
    },
    {
      href: "/rfp",
      label: t("actions.rfp.label"),
      tagline: t("actions.rfp.tagline"),
      Icon: FileText,
      border:     "border-indigo-400",
      glow:       "hover:shadow-indigo-400/25",
      iconColor:  "text-indigo-400",
      arrowColor: "group-hover:text-indigo-400",
    },
    {
      href: "/assets",
      label: t("actions.assets.label"),
      tagline: t("actions.assets.tagline"),
      Icon: LayoutTemplate,
      border:     "border-rose-400",
      glow:       "hover:shadow-rose-400/25",
      iconColor:  "text-rose-400",
      arrowColor: "group-hover:text-rose-400",
    },
    {
      href: "/intelligence",
      label: t("actions.intelligence.label"),
      tagline: t("actions.intelligence.tagline"),
      Icon: Newspaper,
      border:     "border-amber-400",
      glow:       "hover:shadow-amber-400/25",
      iconColor:  "text-amber-400",
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
        backgroundImage: "radial-gradient(circle, rgba(156,163,175,0.25) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <Nav />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-10 sm:py-16">

        {/* Tagline */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-base sm:text-lg font-semibold text-gray-500 mb-1">
            {greeting} —
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-3">
            {t("tagline")}
          </h1>
          <p className="text-sm sm:text-base text-gray-400">{t("subtitle")}</p>
        </div>

        {/* Primary action cards — grouped panel */}
        <div className="w-full max-w-6xl mb-10 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-3xl p-3 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {PRIMARY_ACTIONS.map(({ href, label, tagline, Icon, border, glow, iconColor, arrowColor }) => (
              <Link
                key={href}
                href={href}
                className={`group flex flex-col bg-slate-700 border-2 ${border} rounded-2xl p-6 hover:shadow-2xl ${glow} hover:-translate-y-0.5 hover:bg-slate-650 transition-all duration-200`}
              >
                <Icon size={34} className={`${iconColor} mb-5 flex-shrink-0`} />

                <p className="text-base font-bold text-white leading-tight mb-2">
                  {label}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed flex-1">
                  {tagline}
                </p>

                <div className="flex justify-end mt-5">
                  <ArrowRight
                    size={15}
                    className={`text-slate-500 ${arrowColor} group-hover:translate-x-1 transition-all duration-150`}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Secondary tools */}
        <div className="w-full max-w-6xl">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.18em] text-center mb-3">
            {t("moreTools")}
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {SECONDARY_TOOLS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white border border-gray-300 hover:border-gray-400 rounded-xl hover:shadow-sm transition-all"
              >
                <Icon size={13} className="text-gray-400" />
                {label}
              </Link>
            ))}
          </div>
        </div>

      </main>

      <footer className="border-t border-gray-200/60">
        <div className="max-w-6xl mx-auto px-8 py-4 text-right">
          <p className="text-xs text-gray-400">
            {t("footer")} · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
