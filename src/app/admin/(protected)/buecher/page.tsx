import type { Metadata } from "next";
import Link from "next/link";
import { getAdminBooks } from "@/lib/data/admin/books";
import { BookCover } from "@/components/books/book-cover";
import { BookRowActions } from "@/components/admin/book-row-actions";
import { LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Bücher — Admin" };

export default async function AdminBooksPage() {
  const books = await getAdminBooks();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-ink">Bücher</h1>
        <LinkButton href="/admin/buecher/neu" size="sm">
          Buch hinzufügen
        </LinkButton>
      </div>

      <ul className="mt-6 divide-y divide-line rounded-md border border-line">
        {books.map((book) => (
          <li key={book.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
            <div className="w-12 shrink-0">
              <BookCover imagePath={book.image_path} title={book.title} sizes="48px" />
            </div>

            <div className="min-w-0 flex-1 basis-40">
              <Link href={`/admin/buecher/${book.id}`} className="line-clamp-2 font-medium text-ink hover:text-forest">
                {book.title}
              </Link>
              <p className="mt-0.5 text-sm text-ink-muted">
                {book.stock_available} / {book.stock_total} verfügbar
                {!(book.width_mm && book.height_mm && book.thickness_mm) && (
                  <span className="ml-2 text-xs text-ink-faint">· Maße fehlen</span>
                )}
                {book.dimensions_check && (
                  <span className="ml-2 text-xs font-medium text-sand">· Maße prüfen</span>
                )}
              </p>
            </div>

            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                book.is_active ? "bg-forest-tint text-forest-soft" : "bg-paper-strong text-ink-faint",
              )}
            >
              {book.is_active ? "Aktiv" : "Deaktiviert"}
            </span>

            <div className="ml-auto shrink-0">
              <BookRowActions bookId={book.id} isActive={book.is_active} />
            </div>
          </li>
        ))}

        {books.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-ink-muted">Noch keine Bücher vorhanden.</li>
        )}
      </ul>
    </div>
  );
}
