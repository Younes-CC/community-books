"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PackageSearch, Library, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { logoutAction } from "@/lib/actions/admin/auth";
import { SITE_NAME } from "@/lib/constants";

const LINKS = [
  { href: "/admin", label: "Übersicht", icon: LayoutDashboard, exact: true },
  { href: "/admin/bestellungen", label: "Bestellungen", icon: PackageSearch },
  { href: "/admin/buecher", label: "Bücher", icon: Library },
  { href: "/admin/einstellungen", label: "Einstellungen", icon: Settings },
];

export function AdminSidebar({ email }: { email: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-line bg-paper-alt px-4 py-6">
      <div className="px-2">
        <p className="font-serif text-sm uppercase tracking-[0.16em] text-ink">{SITE_NAME}</p>
        <p className="mt-0.5 text-xs text-ink-faint">Admin</p>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-0.5">
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors",
                active ? "bg-forest text-paper" : "text-ink-muted hover:bg-paper-strong hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-line pt-4">
        {email && <p className="truncate px-2 text-xs text-ink-faint">{email}</p>}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-ink-muted hover:bg-paper-strong hover:text-ink"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Abmelden
          </button>
        </form>
      </div>
    </aside>
  );
}
