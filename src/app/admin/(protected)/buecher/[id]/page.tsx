import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminBookById } from "@/lib/data/admin/books";
import { BookForm } from "@/components/admin/book-form";

export const metadata: Metadata = { title: "Buch bearbeiten — Admin" };

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getAdminBookById(id);
  if (!book) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Buch bearbeiten</h1>
      <div className="mt-6">
        <BookForm book={book} />
      </div>
    </div>
  );
}
