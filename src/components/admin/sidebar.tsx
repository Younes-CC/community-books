"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PackageSearch, Library, Settings, LogOut, Menu, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import { logoutAction } from "@/lib/actions/admin/auth";
import { SITE_NAME } from "@/lib/constants";

const LINKS = [
  { href: "/admin", label: "Bestellungen", icon: PackageSearch, match: (p: string) => p === "/admin" || p.startsWith("/admin/bestellungen") },
  { href: "/admin/buecher", label: "Bücher", icon: Library, match: (p: string) => p.startsWith("/admin/buecher") },
  { href: "/admin/einstellungen", label: "Einstellungen", icon: Settings, match: (p: string) => p.startsWith("/admin/einstellungen") },
];

export function AdminShell({
  name,
  code,
  email,
  children,
}: {
  name: string;
  code: string | null;
  email: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (value: boolean | ((v: boolean) => boolean)) => {
    const next = typeof value === "function" ? value(open) : value;
    setOpenPath(next ? pathname : null);
  };

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Admin-Navigation">
      {LINKS.map((link) => {
        const Icon = link.icon;
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors",
              active ? "bg-forest text-paper" : "text-ink-muted hover:bg-paper-strong hover:text-ink",
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {link.label}
          </Link>
        );
      })}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-ink-muted hover:bg-paper-strong hover:text-ink"
      >
        <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.5} />
        Website ansehen
      </a>
    </nav>
  );

  const account = (
    <div className="space-y-2 border-t border-line pt-4">
      <div className="flex items-center gap-2.5 px-3">
        {code && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-xs font-medium text-paper">
            {code}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm text-ink">{name}</p>
          {email && <p className="truncate text-xs text-ink-faint">{email}</p>}
        </div>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm text-ink-muted hover:bg-paper-strong hover:text-ink"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
          Abmelden
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper lg:flex">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-line bg-paper-alt px-4 py-6 lg:flex">
        <div>
          <div className="mb-8 px-3">
            <p className="font-serif text-sm uppercase tracking-[0.16em] text-ink">{SITE_NAME}</p>
            <p className="mt-0.5 text-xs text-ink-faint">Admin</p>
          </div>
          {nav}
        </div>
        {account}
      </aside>

      {/* mobile top bar */}
      <div className="sticky top-0 z-40 border-b border-line bg-paper-alt pt-[env(safe-area-inset-top)] lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <p className="font-serif text-sm uppercase tracking-[0.16em] text-ink">
            {SITE_NAME} <span className="text-ink-faint">· Admin</span>
          </p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-paper-strong"
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
        {open && (
          <div className="space-y-4 border-t border-line px-4 pb-4 pt-3">
            {nav}
            {account}
          </div>
        )}
      </div>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
