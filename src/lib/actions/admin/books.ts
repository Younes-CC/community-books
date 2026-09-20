"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { bookSchema } from "@/lib/validation/book";
import { slugify } from "@/lib/format";

export type BookFormState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

const initialState: BookFormState = { status: "idle" };
export { initialState as initialBookFormState };

function parseBookForm(formData: FormData) {
  return bookSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    category: formData.get("category"),
    description: formData.get("description"),
    condition: formData.get("condition"),
    stockTotal: formData.get("stockTotal"),
    imagePath: formData.get("imagePath"),
  });
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, title: string) {
  const base = slugify(title) || "buch";
  let candidate = base;
  let suffix = 2;
  while (true) {
    const { data } = await supabase.from("books").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function createBookAction(
  _prevState: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  await requireAdmin();

  const parsed = parseBookForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Bitte prüfe deine Angaben.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const slug = await uniqueSlug(supabase, parsed.data.title);

  const { error } = await supabase.from("books").insert({
    slug,
    title: parsed.data.title,
    author: parsed.data.author,
    category: parsed.data.category,
    description: parsed.data.description || "",
    condition: parsed.data.condition,
    stock_total: parsed.data.stockTotal,
    stock_available: parsed.data.stockTotal,
    image_path: parsed.data.imagePath || null,
  });

  if (error) {
    return { status: "error", message: "Buch konnte nicht gespeichert werden." };
  }

  revalidatePath("/admin/buecher");
  revalidatePath("/buecher");
  redirect("/admin/buecher");
}

export async function updateBookAction(
  _prevState: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  await requireAdmin();

  const bookId = String(formData.get("bookId") ?? "");
  if (!bookId) return { status: "error", message: "Ungültiges Buch." };

  const parsed = parseBookForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Bitte prüfe deine Angaben.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("books")
    .update({
      title: parsed.data.title,
      author: parsed.data.author,
      category: parsed.data.category,
      description: parsed.data.description || "",
      condition: parsed.data.condition,
      stock_total: parsed.data.stockTotal,
      image_path: parsed.data.imagePath || null,
    })
    .eq("id", bookId);

  if (error) {
    return { status: "error", message: "Buch konnte nicht aktualisiert werden." };
  }

  revalidatePath("/admin/buecher");
  revalidatePath(`/admin/buecher/${bookId}`);
  revalidatePath("/buecher");
  redirect("/admin/buecher");
}

export async function setBookActiveAction(
  bookId: string,
  isActive: boolean,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("books").update({ is_active: isActive }).eq("id", bookId);

  if (error) {
    return { ok: false, message: "Status konnte nicht geändert werden." };
  }

  revalidatePath("/admin/buecher");
  revalidatePath("/buecher");
  return { ok: true };
}

export async function deleteBookAction(
  bookId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("books").delete().eq("id", bookId);

  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        message:
          "Dieses Buch kann nicht gelöscht werden, da bereits Bestellungen dazu existieren. Deaktiviere es stattdessen.",
      };
    }
    return { ok: false, message: "Buch konnte nicht gelöscht werden." };
  }

  revalidatePath("/admin/buecher");
  revalidatePath("/buecher");
  return { ok: true };
}
