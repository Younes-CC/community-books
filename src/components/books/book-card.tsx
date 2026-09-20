import Link from "next/link";
import { BookCover } from "@/components/books/book-cover";
import { AvailabilityBadge } from "@/components/books/availability-badge";
import type { PublicBook } from "@/lib/data/books";

export function BookCard({ book }: { book: PublicBook }) {
  return (
    <Link href={`/buecher/${book.slug}`} className="group block">
      <BookCover imagePath={book.image_path} title={book.title} />
      <div className="mt-3 space-y-1">
        <h3 className="font-serif text-[1.05rem] leading-snug text-ink line-clamp-2">
          {book.title}
        </h3>
        <AvailabilityBadge stockAvailable={book.stock_available} />
      </div>
    </Link>
  );
}
