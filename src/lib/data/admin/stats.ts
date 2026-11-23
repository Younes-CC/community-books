import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdminStats = {
  requests: number; // Anfrage
  instructionsSent: number; // Anleitung gesendet
  qrReceived: number; // QR-Code erhalten
  toPack: number; // Zu verpacken = QR-Code erhalten, noch nicht verpackt
  shipped: number; // Versendet
  pickupReady: number; // Abholbereit
  titles: number;
  availableCopies: number;
  reservedCopies: number;
};

// Everything is counted live from the orders and books tables.
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
  const count = (status: string) => orders.filter((o) => o.order_status === status).length;

  return {
    requests: count("new"),
    instructionsSent: count("mail_sent"),
    qrReceived: count("qr_received"),
    toPack: count("qr_received"),
    shipped: count("shipped"),
    pickupReady: count("ready_for_pickup"),
    titles: books.length,
    availableCopies: books.reduce((sum, b) => sum + b.stock_available, 0),
    reservedCopies: books.reduce((sum, b) => sum + (b.stock_total - b.stock_available), 0),
  };
}
