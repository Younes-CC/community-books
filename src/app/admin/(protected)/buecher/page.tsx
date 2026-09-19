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
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Bücher</h1>
        <LinkButton href="/admin/buecher/neu" size="sm">
          Buch hinzufügen
        </LinkButton>
      </div>

      <div className="mt-6 divide-y divide-line rounded-md border border-line">
        {books.map((book) => (
          <div key={book.id} className="flex items-center gap-4 px-4 py-3">
            <div className="w-12 shrink-0">
              <BookCover imagePath={book.image_path} title={book.title} sizes="48px" />
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/buecher/${book.id}`}
                className="block truncate font-medium text-ink hover:text-forest"
              >
                {book.title}
              </Link>
              <p className="truncate text-sm text-ink-muted">
                {book.author} · {book.category}
              </p>
            </div>

            <div className="hidden shrink-0 text-sm text-ink-muted sm:block">
              {book.stock_available} / {book.stock_total} verfügbar
            </div>

            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                book.is_active ? "bg-forest-tint text-forest-soft" : "bg-paper-strong text-ink-faint",
              )}
            >
              {book.is_active ? "Aktiv" : "Deaktiviert"}
            </span>

            <div className="w-32 shrink-0">
              <BookRowActions bookId={book.id} isActive={book.is_active} />
            </div>
          </div>
        ))}

        {books.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-ink-muted">
            Noch keine Bücher vorhanden.
          </p>
        )}
      </div>
    </div>
  );
}
