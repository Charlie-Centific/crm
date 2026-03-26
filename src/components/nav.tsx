"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/pipeline", label: "Pipeline" },
  { href: "/accounts", label: "Accounts" },
  { href: "/playbooks", label: "Playbooks" },
  { href: "/demo-scripts", label: "Demo" },
  { href: "/workshops", label: "Workshops" },
  { href: "/pilots", label: "Pilots" },
  { href: "/import", label: "Import" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 h-14">
        <Link href="/" className="font-bold text-gray-900 mr-4">
          VAI CRM
        </Link>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors",
              pathname.startsWith(item.href)
                ? "text-brand-600 border-b-2 border-brand-600 pb-[1px]"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
