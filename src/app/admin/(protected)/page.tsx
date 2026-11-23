import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminStats } from "@/lib/data/admin/stats";
import { getAdminOrders } from "@/lib/data/admin/orders";
import { getAdminBooks } from "@/lib/data/admin/books";
import { KpiGrid } from "@/components/admin/kpi-grid";
import { NewOrderPanel } from "@/components/admin/new-order-panel";
import { OrderFilters } from "@/components/admin/order-filters";
import { OrdersView } from "@/components/admin/orders-view";

export const metadata: Metadata = { title: "Bestellungen — Admin" };

type SearchParams = { status?: string; q?: string; sort?: string };

export default async function AdminOrdersDashboard({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  await requireAdmin();
  const [stats, orders, books] = await Promise.all([
    getAdminStats(),
    getAdminOrders({ status: sp.status, q: sp.q, sort: sp.sort }),
    getAdminBooks(),
  ]);

  const pickerBooks = books
    .filter((b) => b.is_active)
    .map((b) => ({ id: b.id, title: b.title, available: b.stock_available }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-ink">Bestellungen</h1>
      </div>

      <NewOrderPanel books={pickerBooks} />

      <KpiGrid stats={stats} />

      <OrderFilters />

      <p className="text-xs text-ink-faint">
        {orders.length} {orders.length === 1 ? "Bestellung" : "Bestellungen"}
        {orders.length >= 500 && " (die ersten 500)"}
      </p>

      <OrdersView orders={orders} />
    </div>
  );
}
