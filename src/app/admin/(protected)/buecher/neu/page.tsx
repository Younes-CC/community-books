import type { Metadata } from "next";
import { BookForm } from "@/components/admin/book-form";

export const metadata: Metadata = { title: "Buch hinzufügen — Admin" };

export default function NewBookPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Buch hinzufügen</h1>
      <div className="mt-6">
        <BookForm />
      </div>
    </div>
  );
}
