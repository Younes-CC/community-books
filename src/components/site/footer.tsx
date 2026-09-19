import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { GeometricMark } from "@/components/ui/geometric-mark";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <GeometricMark className="h-5 w-5 text-ink-faint" />
          <p className="text-sm text-ink-muted">
            {SITE_NAME} — Wissen gewinnt an Wert, wenn es weitergegeben wird.
          </p>
        </div>

        <nav className="flex items-center gap-6 text-sm text-ink-muted">
          <Link href="/faq" className="hover:text-ink">
            FAQ
          </Link>
          <Link href="/datenschutz" className="hover:text-ink">
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  );
}
