import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicBookBySlug } from "@/lib/data/books";
import { getPublicSettings } from "@/lib/data/settings";
import { BookCover } from "@/components/books/book-cover";
import { AvailabilityBadge } from "@/components/books/availability-badge";
import { OrderWizard } from "@/components/order/order-wizard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getPublicBookBySlug(slug);
  if (!book) return {};
  return { title: `${book.title} — ${book.author}` };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getPublicBookBySlug(slug);
  if (!book) notFound();

  const settings = await getPublicSettings();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid gap-10 sm:grid-cols-2 sm:gap-14">
        <div className="sm:sticky sm:top-8 sm:self-start">
          <BookCover imagePath={book.image_path} title={book.title} priority sizes="(min-width: 640px) 40vw, 90vw" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-wide text-ink-faint">{book.category}</span>
          <h1 className="mt-2 font-serif text-3xl leading-tight text-ink">{book.title}</h1>
          <p className="mt-1.5 text-ink-muted">{book.author}</p>

          <div className="mt-4 flex items-center gap-4">
            <AvailabilityBadge stockAvailable={book.stock_available} />
            <span className="text-sm text-ink-faint">Zustand: {book.condition}</span>
          </div>

          {book.description && (
            <p className="mt-6 whitespace-pre-line text-[0.95rem] leading-relaxed text-ink-muted">
              {book.description}
            </p>
          )}

          <div className="mt-8 border-t border-line pt-8">
            <OrderWizard
              bookId={book.id}
              bookTitle={book.title}
              stockAvailable={book.stock_available}
              shippingPrice={settings.shipping_price}
              paymentUrl={settings.payment_url}
              reservationHours={settings.reservation_duration_hours}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
