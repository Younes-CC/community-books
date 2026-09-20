import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="font-serif text-sm uppercase tracking-[0.18em] text-ink">{SITE_NAME}</p>
      <h1 className="mt-4 font-serif text-2xl text-ink">Seite nicht gefunden</h1>
      <Link href="/" className="mt-6 text-sm text-ink-muted underline hover:text-ink">
        Zur Startseite
      </Link>
    </div>
  );
}
