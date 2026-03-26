"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, Plug } from "lucide-react";

const TABS = [
  { href: "/rfp",         label: "Build Response", Icon: FileText, exact: true },
  { href: "/rfp/sources", label: "Sources",         Icon: Plug,    exact: false },
];

export default function RfpLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-6xl">
      {/* Sub-nav */}
      <div className="flex gap-0 border-b border-gray-200 mb-7 -mt-1">
        {TABS.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px",
                active
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Icon size={14} />
              {label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
