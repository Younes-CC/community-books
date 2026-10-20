import Link from "next/link";
import { getPublicBooks, getRecommendationBooks } from "@/lib/data/books";
import { BookGrid } from "@/components/books/book-grid";
import { LinkButton } from "@/components/ui/button";
import { GeometricMark } from "@/components/ui/geometric-mark";
import { Onboarding } from "@/components/onboarding/onboarding";
import { OnboardingTrigger } from "@/components/onboarding/onboarding-trigger";
import { ONBOARDING_BOOT_SCRIPT } from "@/lib/onboarding";
import { SITE_TAGLINE, SITE_EYEBROW } from "@/lib/constants";

const STEPS = [
  {
    step: "01",
    title: "Bücher auswählen",
    text: "Lege bis zu drei verschiedene Bücher in den Warenkorb — alle kostenlos.",
  },
  {
    step: "02",
    title: "Hermes oder Abholung",
    text: "Entscheide dich für den Versand per Hermes oder für die persönliche Abholung.",
  },
  {
    step: "03",
    title: "Bestätigung erhalten",
    text: "Du erhältst eine Bestellnummer. Die weiteren Schritte schicken wir dir per E-Mail.",
  },
];

export default async function HomePage() {
  const [{ books, total }, recommendationBooks] = await Promise.all([
    getPublicBooks({ page: 1 }),
    getRecommendationBooks(),
  ]);
  const featured = books.slice(0, 8);

  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: ONBOARDING_BOOT_SCRIPT }} />
      <Onboarding books={recommendationBooks} />

      <section className="mx-auto max-w-6xl px-5 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-20">
        <div className="max-w-2xl">
          <div className="mb-6 flex items-center gap-2 text-ink-faint">
            <GeometricMark className="h-4 w-4 shrink-0" />
            <span className="text-[0.7rem] uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.2em]">
              {SITE_EYEBROW}
            </span>
          </div>

          <h1 className="font-serif text-[2.4rem] leading-[1.08] text-ink sm:text-5xl">{SITE_TAGLINE}</h1>

          <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-ink-muted">
            Neue islamische Bücher. Kostenlos für dich.
            <br />
            Bei Versand erstellst und bezahlst du deinen Hermes-Paketschein selbst.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:gap-5">
            <LinkButton href="/buecher">Bücher entdecken</LinkButton>
            <OnboardingTrigger className="flex min-h-11 items-center justify-center text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-6 sm:pb-20">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-line pb-4">
          <h2 className="font-serif text-xl text-ink">Zuletzt hinzugefügt</h2>
          {total > featured.length && (
            <Link href="/buecher" className="shrink-0 text-sm text-ink-muted hover:text-ink">
              Alle {total} ansehen →
            </Link>
          )}
        </div>
        <BookGrid books={featured} />
      </section>

      <section className="border-t border-line bg-paper-alt">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-3 sm:gap-10 sm:px-6 sm:py-16">
          {STEPS.map((item) => (
            <div key={item.step}>
              <span className="font-serif text-sm text-ink-faint">{item.step}</span>
              <h3 className="mt-2 font-serif text-lg text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
