import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/constants";

export type AdminOrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  book_title_snapshot: string;
  first_name: string;
  last_name: string;
  fulfillment_type: string;
  payment_status: string;
  order_status: string;
  total: number;
};

export type AdminOrderDetail = AdminOrderRow & {
  email: string;
  social_username: string | null;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  shipping_price: number;
  reservation_expires_at: string | null;
  notes: string | null;
  book_id: string;
  paid_at: string | null;
  shipped_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  book_image_path: string | null;
};

const FILTER_STATUS: Record<string, OrderStatus[] | undefined> = {
  offen: ["awaiting_payment"],
  bezahlt: ["paid"],
  verpacken: ["packing"],
  versendet: ["shipped"],
  abholung: ["reserved", "ready_for_pickup"],
  abgeschlossen: ["completed"],
  storniert: ["cancelled"],
  abgelaufen: ["expired"],
};

export async function getAdminOrders(params: { filter?: string }): Promise<AdminOrderRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, created_at, book_title_snapshot, first_name, last_name, fulfillment_type, payment_status, order_status, total",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const statuses = params.filter ? FILTER_STATUS[params.filter] : undefined;
  if (statuses) {
    query = query.in("order_status", statuses);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getAdminOrderById(id: string): Promise<AdminOrderDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, created_at, book_title_snapshot, first_name, last_name, email, social_username, fulfillment_type, street, house_number, postal_code, city, country, shipping_price, total, payment_status, order_status, reservation_expires_at, notes, book_id, paid_at, shipped_at, completed_at, cancelled_at, books(image_path)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { books, ...rest } = data as typeof data & { books: { image_path: string | null } | null };
  return { ...rest, book_image_path: books?.image_path ?? null };
}
