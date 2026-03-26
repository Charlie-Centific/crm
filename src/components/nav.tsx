"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
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
  Menu,
  X,
  Sun,
  Moon,
  Plug,
  Settings,
} from "lucide-react";

// ─── Nav structure ────────────────────────────────────────────────────────────

const SECONDARY_GROUPS = [
  {
    label: "Intelligence",
    items: [
      { href: "/pipeline",     label: "Pipeline",    Icon: BarChart3  },
      { href: "/rfp/sources",  label: "RFP Sources", Icon: Plug       },
    ],
  },
  {
    label: "Relationships",
    items: [
      { href: "/accounts", label: "Accounts", Icon: Building2 },
      { href: "/pilots",   label: "Pilots",   Icon: Activity  },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/playbooks", label: "Playbooks", Icon: BookOpen },
      { href: "/workflows", label: "Workflows", Icon: Network  },
    ],
  },
  {
    label: "Data",
    items: [
      { href: "/import",    label: "Import",   Icon: Upload   },
    ],
  },
  {
    label: "Config",
    items: [
      { href: "/settings", label: "Settings", Icon: Settings },
    ],
  },
];

const LOCALES = [
  { value: "en", label: "English",  flag: "🇺🇸" },
  { value: "es", label: "Español",  flag: "🇲🇽" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "zh", label: "中文",     flag: "🇨🇳" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function Nav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { theme, setTheme } = useTheme();
  const t      = useTranslations("nav");
  const locale = useLocale();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const PRIMARY_NAV = [
    { href: "/demo-scripts", label: t("runDemo"),       Icon: MonitorPlay, activeColor: "bg-emerald-50 text-emerald-700", hoverColor: "hover:bg-emerald-50 hover:text-emerald-700" },
    { href: "/workshops",    label: t("buildWorkshop"), Icon: Users,       activeColor: "bg-brand-50 text-brand-700",     hoverColor: "hover:bg-brand-50 hover:text-brand-700"     },
    { href: "/rfp",          label: t("draftRfp"),      Icon: FileText,    activeColor: "bg-indigo-50 text-indigo-700",   hoverColor: "hover:bg-indigo-50 hover:text-indigo-700"   },
  ];

  function switchLocale(value: string) {
    document.cookie = `NEXT_LOCALE=${value}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  const isDark = theme === "dark";

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-1">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-4 flex-shrink-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/vai-icon-64.webp" alt="VAI" className="w-full h-full object-contain" style={{ filter: "brightness(0) invert(1)" }} />
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-tight">VAI Sales Buddy</span>
          </Link>

          {/* Primary actions */}
          {PRIMARY_NAV.map(({ href, label, Icon, activeColor, hoverColor }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  active ? activeColor : `text-gray-500 ${hoverColor}`
                )}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}

          <div className="flex-1" />

          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
            aria-label={t("moreTools")}
          >
            <Menu size={18} />
          </button>
        </div>
      </nav>

      {/* ── Backdrop ────────────────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setDrawerOpen(false)} />
      )}

      {/* ── Drawer ──────────────────────────────────────────────────────── */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col overflow-y-auto transition-transform duration-200",
        drawerOpen ? "translate-x-0" : "translate-x-full"
      )}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-700">Tools</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Grouped secondary nav */}
        <div className="px-3 py-3 space-y-4 border-b border-gray-100">
          {SECONDARY_GROUPS.map(({ label, items }) => (
            <div key={label}>
              <p className="px-3 text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-1">
                {label}
              </p>
              <div className="space-y-0.5">
                {items.map(({ href, label: itemLabel, Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        active
                          ? "bg-brand-50 text-brand-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <Icon size={15} className={active ? "text-brand-500" : "text-gray-400"} />
                      {itemLabel}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Appearance */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            {t("appearance")}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-all",
                !isDark
                  ? "bg-brand-50 border-brand-300 text-brand-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              <Sun size={13} />
              {t("light")}
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-all",
                isDark
                  ? "bg-brand-50 border-brand-300 text-brand-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              <Moon size={13} />
              {t("dark")}
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            {t("language")}
          </p>
          <div className="relative">
            <select
              value={locale}
              onChange={(e) => switchLocale(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-medium pr-8 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all"
            >
              {LOCALES.map(({ value, label, flag }) => (
                <option key={value} value={value}>{flag}  {label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 mt-auto">
          <Link
            href="/"
            onClick={() => setDrawerOpen(false)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </>
  );
}
