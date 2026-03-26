"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/pipeline", label: "Pipeline" },
  { href: "/accounts", label: "Accounts" },
  { href: "/playbooks", label: "Playbooks" },
  { href: "/demo-scripts", label: "Demo" },
  { href: "/rfp", label: "RFP" },
  { href: "/workshops", label: "Workshops" },
  { href: "/pilots", label: "Pilots" },
  { href: "/import", label: "Import" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-5 flex-shrink-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <span className="text-white text-[10px] font-black">V</span>
          </div>
          <span className="font-bold text-gray-900 text-sm tracking-tight">VAI CRM</span>
        </Link>

        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              pathname.startsWith(item.href)
                ? "bg-brand-50 text-brand-700"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
