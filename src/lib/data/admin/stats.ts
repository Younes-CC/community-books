import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdminStats = {
  newOrders: number;
  mailPending: number;
  qrPending: number;
  qrReceived: number;
  processing: number;
  readyToShip: number;
  shipped: number;
  pickupOpen: number;
  expired: number;
  overdue: number;
  titles: number;
  availableCopies: number;
  reservedCopies: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [booksRes, ordersRes] = await Promise.all([
    supabase.from("books").select("stock_total, stock_available").eq("is_active", true),
    supabase.from("orders").select("order_status, fulfillment_type, internal_due_at"),
  ]);
  if (booksRes.error) throw booksRes.error;
  if (ordersRes.error) throw ordersRes.error;

  const books = booksRes.data ?? [];
  const orders = ordersRes.data ?? [];
  const now = Date.now();
  const count = (fn: (o: (typeof orders)[number]) => boolean) => orders.filter(fn).length;

  return {
    newOrders: count((o) => o.order_status === "new"),
    mailPending: count((o) => o.order_status === "new" && o.fulfillment_type === "shipping"),
    qrPending: count((o) => o.order_status === "mail_sent"),
    qrReceived: count((o) => o.order_status === "qr_received"),
    processing: count((o) => o.order_status === "processing"),
    readyToShip: count((o) => o.order_status === "packed"),
    shipped: count((o) => o.order_status === "shipped"),
    pickupOpen: count(
      (o) =>
        o.fulfillment_type === "pickup" &&
        ["new", "arrange_pickup", "ready_for_pickup"].includes(o.order_status),
    ),
    expired: count((o) => o.order_status === "expired"),
    overdue: count(
      (o) => o.order_status === "new" && !!o.internal_due_at && new Date(o.internal_due_at).getTime() < now,
    ),
    titles: books.length,
    availableCopies: books.reduce((sum, b) => sum + b.stock_available, 0),
    reservedCopies: books.reduce((sum, b) => sum + (b.stock_total - b.stock_available), 0),
  };
}
