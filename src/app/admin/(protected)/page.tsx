import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminStats } from "@/lib/data/admin/stats";
import { getAdminOrders, getAdmins } from "@/lib/data/admin/orders";
import { getAdminSettings } from "@/lib/data/settings";
import { KpiGrid } from "@/components/admin/kpi-grid";
import { OrderFilters } from "@/components/admin/order-filters";
import { OrdersView } from "@/components/admin/orders-view";
import { serverNow } from "@/lib/time";

export const metadata: Metadata = { title: "Bestellungen — Admin" };

type SearchParams = {
  scope?: string;
  status?: string;
  type?: string;
  overdue?: string;
  q?: string;
};

export default async function AdminOrdersDashboard({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const me = await requireAdmin();
  const [stats, admins, settings] = await Promise.all([getAdminStats(), getAdmins(), getAdminSettings()]);
  const orders = await getAdminOrders(
    { scope: sp.scope, status: sp.status, type: sp.type, overdue: sp.overdue === "1", q: sp.q },
    me,
    admins,
  );

  const options = admins.map((a) => ({
    userId: a.user_id,
    code: a.code,
    name: a.display_name ?? a.email ?? "Admin",
  }));

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <h1 className="font-serif text-2xl text-ink">Bestellungen</h1>

      <KpiGrid stats={stats} />

      <OrderFilters
        admins={options.filter((o) => o.code).map((o) => ({ code: o.code as string, name: o.name }))}
      />

      <p className="text-xs text-ink-faint">
        {orders.length} {orders.length === 1 ? "Bestellung" : "Bestellungen"}
        {orders.length >= 300 && " (die neuesten 300)"}
      </p>

      <OrdersView
        orders={orders}
        admins={options}
        parcel={{ sMaxCm: settings.hermes_s_max_cm, paddingCm: settings.packaging_padding_cm }}
        now={serverNow()}
      />
    </div>
  );
}
