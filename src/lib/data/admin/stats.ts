import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdminStats = {
  totalBooks: number;
  availableCopies: number;
  reservedCopies: number;
  paymentPending: number;
  toPack: number;
  shipped: number;
  pickupOpen: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [booksRes, ordersRes] = await Promise.all([
    supabase.from("books").select("stock_total, stock_available").eq("is_active", true),
    supabase.from("orders").select("order_status"),
  ]);

  if (booksRes.error) throw booksRes.error;
  if (ordersRes.error) throw ordersRes.error;

  const books = booksRes.data ?? [];
  const orders = ordersRes.data ?? [];

  const totalBooks = books.length;
  const availableCopies = books.reduce((sum, b) => sum + b.stock_available, 0);
  const reservedCopies = books.reduce(
    (sum, b) => sum + (b.stock_total - b.stock_available),
    0,
  );

  const count = (status: string) => orders.filter((o) => o.order_status === status).length;

  return {
    totalBooks,
    availableCopies,
    reservedCopies,
    paymentPending: count("awaiting_payment"),
    toPack: count("paid") + count("packing"),
    shipped: count("shipped"),
    pickupOpen: count("reserved") + count("ready_for_pickup"),
  };
}
