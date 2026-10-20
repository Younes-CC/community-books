import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { RecommendBook } from "@/lib/recommend";

export const PAGE_SIZE = 24;

export type PublicBook = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_path: string | null;
  stock_available: number;
};

const PUBLIC_COLUMNS = "id, slug, title, description, image_path, stock_available";

export async function getPublicBooks(params: {
  q?: string;
  page?: number;
}): Promise<{ books: PublicBook[]; total: number; pageSize: number }> {
  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("books")
    .select(PUBLIC_COLUMNS, { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.q && params.q.trim()) {
    const term = params.q.trim().replace(/[%_\\]/g, "");
    query = query.ilike("title", `%${term}%`);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { books: data ?? [], total: count ?? 0, pageSize: PAGE_SIZE };
}

export async function getPublicBookBySlug(slug: string): Promise<PublicBook | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Slim list for the questionnaire (all active books incl. their recommendation tags).
export async function getRecommendationBooks(): Promise<RecommendBook[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("id, slug, title, image_path, stock_available, topics, levels, reading_length")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Used by the cart to re-check what is still available.
export async function getBooksByIds(ids: string[]) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("id, slug, title, image_path, stock_available, is_active")
    .in("id", ids);
  if (error) throw error;
  return data ?? [];
}
