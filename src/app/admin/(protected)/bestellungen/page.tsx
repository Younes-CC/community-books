import type { Metadata } from "next";
import Link from "next/link";
import { getAdminOrders } from "@/lib/data/admin/orders";
import { OrderFilterTabs } from "@/components/admin/order-filter-tabs";
import { OrderRowActions } from "@/components/admin/order-row-actions";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { FULFILLMENT_LABELS, type OrderStatus, type PaymentStatus } from "@/lib/constants";
import { formatDateShort, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Bestellungen — Admin" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const orders = await getAdminOrders({ filter });

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Bestellungen</h1>

      <div className="mt-5">
        <OrderFilterTabs active={filter} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-line bg-paper-alt text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Bestellnummer</th>
              <th className="px-4 py-3 font-medium">Datum</th>
              <th className="px-4 py-3 font-medium">Buch</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Übergabe</th>
              <th className="px-4 py-3 font-medium">Zahlung</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Betrag</th>
              <th className="sticky right-0 bg-paper-alt px-4 py-3 text-right font-medium shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.12)]">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="group border-b border-line last:border-0 hover:bg-paper-alt">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/bestellungen/${order.id}`}
                    className="font-medium text-ink hover:text-forest"
                  >
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-muted">{formatDateShort(order.created_at)}</td>
                <td className="px-4 py-3 text-ink-muted">{order.book_title_snapshot}</td>
                <td className="px-4 py-3 text-ink-muted">
                  {order.first_name} {order.last_name}
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {FULFILLMENT_LABELS[order.fulfillment_type as "shipping" | "pickup"]}
                </td>
                <td className="px-4 py-3">
                  <PaymentStatusBadge status={order.payment_status as PaymentStatus} />
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.order_status as OrderStatus} />
                </td>
                <td className="px-4 py-3 text-right text-ink-muted">{formatPrice(order.total)}</td>
                <td className="sticky right-0 bg-paper px-4 py-3 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.12)] group-hover:bg-paper-alt">
                  <OrderRowActions
                    orderId={order.id}
                    orderNumber={order.order_number}
                    orderStatus={order.order_status as OrderStatus}
                    paymentStatus={order.payment_status}
                    fulfillmentType={order.fulfillment_type}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-ink-muted">
            Keine Bestellungen in dieser Ansicht.
          </p>
        )}
      </div>
    </div>
  );
}
