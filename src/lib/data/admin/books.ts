import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdminBook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  description: string;
  condition: string;
  image_path: string | null;
  stock_total: number;
  stock_available: number;
  is_active: boolean;
  created_at: string;
};

export async function getAdminBooks(): Promise<AdminBook[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(
      "id, slug, title, author, category, description, condition, image_path, stock_total, stock_available, is_active, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAdminBookById(id: string): Promise<AdminBook | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(
      "id, slug, title, author, category, description, condition, image_path, stock_total, stock_available, is_active, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
