import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { MobileNav } from "@/components/site/mobile-nav";
import { CartLink } from "@/components/cart/cart-link";

const LINKS = [
  { href: "/buecher", label: "Bücher" },
  { href: "/ueber", label: "Über die Aktion" },
  { href: "/faq", label: "FAQ" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-6">
        <Link
          href="/"
          className="font-serif text-[0.95rem] font-medium uppercase tracking-[0.16em] text-ink sm:text-[1.05rem] sm:tracking-[0.18em]"
        >
          {SITE_NAME}
        </Link>

        <div className="flex items-center gap-1 sm:gap-6">
          <nav className="hidden items-center gap-7 sm:flex" aria-label="Hauptnavigation">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <CartLink />
          <MobileNav links={LINKS} />
        </div>
      </div>
    </header>
  );
}
