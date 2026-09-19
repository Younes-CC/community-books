"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/buecher", label: "Bücher" },
  { href: "/ueber", label: "Über die Aktion" },
  { href: "/faq", label: "FAQ" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Menü öffnen"
        className="relative flex h-9 w-9 flex-col items-center justify-center gap-1.5"
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
        <div className="absolute inset-x-0 top-full border-b border-line bg-paper px-6 pb-6 pt-2 shadow-sm">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base text-ink hover:bg-paper-alt"
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
