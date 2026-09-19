import type { Metadata } from "next";
import { getPublicBooks, getActiveCategories } from "@/lib/data/books";
import { BookGrid } from "@/components/books/book-grid";
import { SearchBar } from "@/components/books/search-bar";
import { CategoryFilter } from "@/components/books/category-filter";
import { Pagination } from "@/components/books/pagination";

export const metadata: Metadata = { title: "Bücher" };

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategorie?: string; seite?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.seite ?? "1") || 1);

  const [{ books, total, pageSize }, categories] = await Promise.all([
    getPublicBooks({ q: params.q, category: params.kategorie, page }),
    getActiveCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">Bücher</h1>
          <p className="mt-1 text-sm text-ink-muted">{total} Bücher verfügbar</p>
        </div>
        <SearchBar defaultValue={params.q} category={params.kategorie} />
      </div>

      <div className="mb-8">
        <CategoryFilter categories={categories} active={params.kategorie} q={params.q} />
      </div>

      <BookGrid books={books} />

      <Pagination page={page} pageSize={pageSize} total={total} q={params.q} category={params.kategorie} />
    </div>
  );
}
