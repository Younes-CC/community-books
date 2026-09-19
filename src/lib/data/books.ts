import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

export const PAGE_SIZE = 24;

export type PublicBook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  description: string;
  condition: string;
  image_path: string | null;
  stock_available: number;
};

export async function getPublicBooks(params: {
  q?: string;
  category?: string;
  page?: number;
}): Promise<{ books: PublicBook[]; total: number; pageSize: number }> {
  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("books")
    .select(
      "id, slug, title, author, category, description, condition, image_path, stock_available",
      { count: "exact" },
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.q && params.q.trim()) {
    const term = params.q.trim().replace(/[%_]/g, "");
    query = query.or(`title.ilike.%${term}%,author.ilike.%${term}%`);
  }

  if (params.category && params.category.trim()) {
    query = query.eq("category", params.category.trim());
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { books: data ?? [], total: count ?? 0, pageSize: PAGE_SIZE };
}

export async function getPublicBookBySlug(slug: string): Promise<PublicBook | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(
      "id, slug, title, author, category, description, condition, image_path, stock_available",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getActiveCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("category")
    .eq("is_active", true);

  if (error) throw error;

  const found = new Set((data ?? []).map((row) => row.category));
  const ordered = DEFAULT_CATEGORIES.filter((c) => found.has(c));
  const extra = [...found].filter((c) => !DEFAULT_CATEGORIES.includes(c as never)).sort();
  return [...ordered, ...extra];
}
