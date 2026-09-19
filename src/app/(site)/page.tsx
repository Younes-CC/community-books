import Link from "next/link";
import { getPublicBooks } from "@/lib/data/books";
import { BookGrid } from "@/components/books/book-grid";
import { LinkButton } from "@/components/ui/button";
import { GeometricMark } from "@/components/ui/geometric-mark";
import { SITE_TAGLINE } from "@/lib/constants";

export default async function HomePage() {
  const { books, total } = await getPublicBooks({ page: 1 });
  const featured = books.slice(0, 8);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pt-14 pb-10 sm:pt-20 sm:pb-14">
        <div className="max-w-2xl">
          <div className="mb-6 flex items-center gap-2 text-ink-faint">
            <GeometricMark className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.2em]">Kostenlos weitergegeben</span>
          </div>

          <h1 className="font-serif text-4xl leading-[1.1] text-ink sm:text-5xl">
            {SITE_TAGLINE}
          </h1>

          <p className="mt-5 max-w-lg text-[1.05rem] leading-relaxed text-ink-muted">
            Ich gebe einen Teil meiner Bibliothek kostenlos an meine Community weiter. Such
            dir ein Buch aus, das dir Wissen bringt — und gib dieses Wissen irgendwann selbst
            weiter. Das Buch ist kostenlos, bei Versand übernimmst du lediglich Verpackung
            und Porto.
          </p>

          <div className="mt-8">
            <LinkButton href="/buecher">Bücher entdecken</LinkButton>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between border-b border-line pb-4">
          <h2 className="font-serif text-xl text-ink">Zuletzt hinzugefügt</h2>
          {total > featured.length && (
            <Link href="/buecher" className="text-sm text-ink-muted hover:text-ink">
              Alle {total} Bücher ansehen →
            </Link>
          )}
        </div>
        <BookGrid books={featured} />
      </section>

      <section className="border-t border-line bg-paper-alt">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-3">
          {[
            { step: "01", title: "Buch auswählen", text: "Durchstöbere den Katalog und wähle ein Buch, das dir wirklich weiterhilft." },
            { step: "02", title: "Versand oder Abholung", text: "Entscheide dich für persönliche Abholung oder Versand zu dir nach Hause." },
            { step: "03", title: "Bestätigung erhalten", text: "Du erhältst eine Bestellnummer und alle weiteren Schritte per E-Mail-Kontakt." },
          ].map((item) => (
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
