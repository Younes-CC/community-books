"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  // the menu is "open for" one pathname, so navigating anywhere closes it without an effect
  const [openPath, setOpenPath] = useState<string | null>(null);
  const pathname = usePathname();
  const open = openPath === pathname;
  const toggle = () => setOpenPath(open ? null : pathname);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenPath(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        className="relative flex h-11 w-11 flex-col items-center justify-center gap-[6px] rounded-full hover:bg-paper-alt"
      >
        <span
          className={cn(
            "h-px w-5 bg-ink transition-transform duration-200",
            open && "translate-y-[3.5px] rotate-45",
          )}
        />
        <span
          className={cn(
            "h-px w-5 bg-ink transition-transform duration-200",
            open && "-translate-y-[3.5px] -rotate-45",
          )}
        />
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full border-b border-line bg-paper px-5 pb-5 pt-1"
        >
          <nav className="flex flex-col" aria-label="Mobile Navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-12 items-center border-b border-line/60 text-base text-ink last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
