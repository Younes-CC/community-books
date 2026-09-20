import { BookCard } from "@/components/books/book-card";
import type { PublicBook } from "@/lib/data/books";

export function BookGrid({ books }: { books: PublicBook[] }) {
  if (books.length === 0) {
    return (
      <div className="border border-dashed border-line-strong px-6 py-16 text-center">
        <p className="font-serif text-lg text-ink">Keine Bücher gefunden.</p>
        <p className="mt-1 text-sm text-ink-muted">Versuch es mit einer anderen Suche.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
