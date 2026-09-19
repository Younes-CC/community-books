import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { MobileNav } from "@/components/site/mobile-nav";

export function SiteNav() {
  return (
    <header className="relative z-20 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-serif text-[1.05rem] font-medium uppercase tracking-[0.18em] text-ink"
        >
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          <Link href="/buecher" className="text-sm text-ink-muted transition-colors hover:text-ink">
            Bücher
          </Link>
          <Link href="/ueber" className="text-sm text-ink-muted transition-colors hover:text-ink">
            Über die Aktion
          </Link>
          <Link href="/faq" className="text-sm text-ink-muted transition-colors hover:text-ink">
            FAQ
          </Link>
        </nav>

        <MobileNav />
      </div>
    </header>
  );
}
