import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BookDims } from "@/lib/parcel";
import type { AdminRow, OrderHistoryRow, OrderRow } from "@/lib/database.types";
import { FINAL_STATUSES } from "@/lib/order-workflow";

export type OrderFilters = {
  scope?: string; // meine | unzugewiesen | <admin code, e.g. M / Y>
  status?: string; // a status key | aktiv
  type?: string; // shipping | pickup
  overdue?: boolean;
  q?: string;
};

export type AdminOrderListRow = {
  id: string;
  orderNumber: string;
  createdAt: string;
  name: string;
  email: string;
  type: "shipping" | "pickup";
  status: string;
  assignedTo: string | null;
  bookTitles: string[];
  bookDims: BookDims[];
  internalDueAt: string | null;
  qrDeadlineAt: string | null;
  pickupDeadlineAt: string | null;
  parcelOverride: string | null;
};

export async function getAdmins(): Promise<AdminRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("admins").select("*").order("code");
  if (error) throw error;
  return data ?? [];
}

// keeps PostgREST's `or()` mini-language safe: no separators, wildcards or quotes from user input
const cleanTerm = (s: string) => s.replace(/[,()%*\\"'`:]/g, " ").trim();

export async function getAdminOrders(
  filters: OrderFilters,
  me: { id: string },
  admins: AdminRow[],
): Promise<AdminOrderListRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, created_at, first_name, last_name, email, fulfillment_type, order_status, assigned_to, internal_due_at, qr_deadline_at, pickup_deadline_at, parcel_class_override, order_items(book_id, title_snapshot, books(width_mm, height_mm, thickness_mm, weight_g, dimensions_check))",
    )
    .order("created_at", { ascending: false })
    .limit(300);

  if (filters.scope === "meine") query = query.eq("assigned_to", me.id);
  else if (filters.scope === "unzugewiesen") query = query.is("assigned_to", null);
  else if (filters.scope) {
    const admin = admins.find((a) => a.code === filters.scope);
    if (admin) query = query.eq("assigned_to", admin.user_id);
  }

  if (filters.status === "aktiv") {
    query = query.not("order_status", "in", `(${FINAL_STATUSES.join(",")})`);
  } else if (filters.status) {
    query = query.eq("order_status", filters.status);
  }

  if (filters.type === "shipping" || filters.type === "pickup") {
    query = query.eq("fulfillment_type", filters.type);
  }

  if (filters.overdue) {
    query = query.eq("order_status", "new").lt("internal_due_at", new Date().toISOString());
  }

  for (const token of cleanTerm(filters.q ?? "").split(/\s+/).filter(Boolean).slice(0, 4)) {
    query = query.or(
      `order_number.ilike.%${token}%,first_name.ilike.%${token}%,last_name.ilike.%${token}%,email.ilike.%${token}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    createdAt: o.created_at,
    name: `${o.first_name} ${o.last_name}`,
    email: o.email,
    type: o.fulfillment_type as "shipping" | "pickup",
    status: o.order_status,
    assignedTo: o.assigned_to,
    bookTitles: o.order_items.map((i) => i.title_snapshot),
    bookDims: o.order_items.map((i) => ({
      width_mm: i.books?.width_mm ?? null,
      height_mm: i.books?.height_mm ?? null,
      thickness_mm: i.books?.thickness_mm ?? null,
      weight_g: i.books?.weight_g ?? null,
      dimensions_check: i.books?.dimensions_check ?? false,
    })),
    internalDueAt: o.internal_due_at,
    qrDeadlineAt: o.qr_deadline_at,
    pickupDeadlineAt: o.pickup_deadline_at,
    parcelOverride: o.parcel_class_override,
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
      "*, order_items(id, book_id, title_snapshot, books(image_path, width_mm, height_mm, thickness_mm, weight_g, dimensions_check))",
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
    items: order_items.map((i) => ({
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
