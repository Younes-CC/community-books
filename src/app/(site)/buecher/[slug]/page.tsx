import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicBookBySlug } from "@/lib/data/books";
import { BookCover } from "@/components/books/book-cover";
import { AvailabilityBadge } from "@/components/books/availability-badge";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getPublicBookBySlug(slug);
  if (!book) return {};
  return { title: book.title };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getPublicBookBySlug(slug);
  if (!book) notFound();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-12">
      <Link href="/buecher" className="mb-6 inline-flex min-h-11 items-center text-sm text-ink-muted hover:text-ink">
        ← Alle Bücher
      </Link>

      <div className="grid gap-8 sm:grid-cols-2 sm:gap-14">
        <div className="mx-auto w-full max-w-sm sm:sticky sm:top-24 sm:max-w-none sm:self-start">
          <BookCover
            imagePath={book.image_path}
            title={book.title}
            priority
            sizes="(min-width: 640px) 40vw, 90vw"
          />
        </div>

        <div>
          <h1 className="font-serif text-3xl leading-tight text-ink">{book.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
            <AvailabilityBadge stockAvailable={book.stock_available} />
            <span className="text-sm text-ink-faint">Zustand: Neu</span>
          </div>

          {book.description && (
            <p className="mt-6 whitespace-pre-line text-[0.95rem] leading-relaxed text-ink-muted">
              {book.description}
            </p>
          )}

          <div className="mt-8 border-t border-line pt-8">
            <AddToCartButton
              book={{
                id: book.id,
                slug: book.slug,
                title: book.title,
                image_path: book.image_path,
                stock_available: book.stock_available,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
