import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BookRow } from "@/lib/database.types";

export type AdminBook = Pick<
  BookRow,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "image_path"
  | "stock_total"
  | "stock_available"
  | "is_active"
  | "created_at"
  | "topics"
  | "levels"
  | "reading_length"
  | "width_mm"
  | "height_mm"
  | "thickness_mm"
  | "weight_g"
  | "dimensions_check"
  | "dimensions_note"
  | "arabic_text_only"
>;

const COLUMNS =
  "id, slug, title, description, image_path, stock_total, stock_available, is_active, created_at, topics, levels, reading_length, width_mm, height_mm, thickness_mm, weight_g, dimensions_check, dimensions_note, arabic_text_only";

export async function getAdminBooks(): Promise<AdminBook[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAdminBookById(id: string): Promise<AdminBook | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("books").select(COLUMNS).eq("id", id).maybeSingle();

  if (error) throw error;
  return data;
}
