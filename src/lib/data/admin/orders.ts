import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BookDims } from "@/lib/parcel";
import type { OrderHistoryRow, OrderRow } from "@/lib/database.types";
import type { OrderSource } from "@/lib/constants";

export type OrderFilters = {
  status?: string; // a status key | alle | storniert | (empty = everything except cancelled/expired)
  q?: string;
  sort?: string; // alt = oldest first
};

export type AdminOrderListRow = {
  id: string;
  orderNumber: string;
  createdAt: string;
  source: OrderSource;
  name: string; // @tiktok-name for TikTok orders, "Vorname Nachname" for website orders
  status: string;
  bookTitles: string[];
};

// keeps PostgREST's `or()` mini-language safe: no separators, wildcards or quotes from user input
const cleanTerm = (s: string) => s.replace(/[,()%*\\"'`:]/g, " ").trim();

export async function getAdminOrders(filters: OrderFilters): Promise<AdminOrderListRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, created_at, source, tiktok_name, first_name, last_name, order_status, order_items(title_snapshot, released_at)",
    )
    .order("created_at", { ascending: filters.sort === "alt" })
    .limit(500);

  if (filters.status === "alle") {
    // everything
  } else if (filters.status === "storniert") {
    query = query.in("order_status", ["cancelled", "expired"]);
  } else if (filters.status) {
    query = query.eq("order_status", filters.status);
  } else {
    query = query.not("order_status", "in", "(cancelled,expired)");
  }

  for (const token of cleanTerm(filters.q ?? "").split(/\s+/).filter(Boolean).slice(0, 4)) {
    query = query.or(
      `tiktok_name.ilike.%${token}%,order_number.ilike.%${token}%,first_name.ilike.%${token}%,last_name.ilike.%${token}%,email.ilike.%${token}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    createdAt: o.created_at,
    source: o.source as OrderSource,
    name: o.source === "tiktok_dm" ? (o.tiktok_name ?? o.first_name) : `${o.first_name} ${o.last_name}`.trim(),
    status: o.order_status,
    bookTitles: o.order_items.filter((i) => !i.released_at).map((i) => i.title_snapshot),
  }));
}

export type AdminOrderDetail = {
  order: OrderRow;
  items: {
    id: string;
    bookId: string;
    title: string;
    imagePath: string | null;
    dims: BookDims;
  }[];
  history: OrderHistoryRow[];
};

export async function getAdminOrderDetail(id: string): Promise<AdminOrderDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, order_items(id, book_id, title_snapshot, released_at, books(image_path, width_mm, height_mm, thickness_mm, weight_g, dimensions_check))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { order_items, ...order } = data;

  const { data: history, error: historyError } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (historyError) throw historyError;

  return {
    order,
    items: order_items.filter((i) => !i.released_at).map((i) => ({
      id: i.id,
      bookId: i.book_id,
      title: i.title_snapshot,
      imagePath: i.books?.image_path ?? null,
      dims: {
        width_mm: i.books?.width_mm ?? null,
        height_mm: i.books?.height_mm ?? null,
        thickness_mm: i.books?.thickness_mm ?? null,
        weight_g: i.books?.weight_g ?? null,
        dimensions_check: i.books?.dimensions_check ?? false,
      },
    })),
    history: history ?? [],
  };
}
