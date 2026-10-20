import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { AdminOrderListRow } from "@/lib/data/admin/orders";
import { AssigneeBadge, OrderStatusBadge } from "@/components/admin/status-badge";
import { AssigneeSelect, type AdminOption } from "@/components/admin/assignee-select";
import { OrderRowActions } from "@/components/admin/order-row-actions";
import { FULFILLMENT_LABELS, type FulfillmentType, type OrderStatus } from "@/lib/constants";
import { estimateParcel, needsParcelCheck } from "@/lib/parcel";
import { formatDateShort } from "@/lib/format";
import { formatRemaining } from "@/lib/time";
import { cn } from "@/lib/cn";

type Props = {
  orders: AdminOrderListRow[];
  admins: AdminOption[];
  parcel: { sMaxCm: number; paddingCm: number };
  now: number;
};

function remainingFor(o: AdminOrderListRow, now: number) {
  switch (o.status) {
    case "new":
      return { label: "Bearbeiten bis", r: formatRemaining(o.internalDueAt, now) };
    case "mail_sent":
      return { label: "QR-Code bis", r: formatRemaining(o.qrDeadlineAt, now) };
    case "arrange_pickup":
    case "ready_for_pickup":
      return { label: "Abholfrist", r: formatRemaining(o.pickupDeadlineAt, now) };
    default:
      return { label: "", r: null };
  }
}

function ParcelFlag({ o, parcel }: { o: AdminOrderListRow; parcel: Props["parcel"] }) {
  if (o.type !== "shipping" || ["shipped", "completed", "cancelled", "expired"].includes(o.status)) return null;
  const estimate = estimateParcel(o.bookDims, { sMaxCm: parcel.sMaxCm, paddingCm: parcel.paddingCm });
  if (!needsParcelCheck(estimate, o.parcelOverride)) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sand-tint px-2 py-0.5 text-[11px] font-medium text-sand">
      <AlertTriangle className="h-3 w-3" strokeWidth={2} />
      Paket prüfen
    </span>
  );
}

function Remaining({ o, now }: { o: AdminOrderListRow; now: number }) {
  const { label, r } = remainingFor(o, now);
  if (!r) return <span className="text-ink-faint">–</span>;
  return (
    <span className={cn("block", r.overdue ? "font-medium text-brick" : "text-ink-muted")}>
      <span className="block text-[11px] uppercase tracking-wide text-ink-faint">{label}</span>
      {r.text}
    </span>
  );
}

export function OrdersView({ orders, admins, parcel, now }: Props) {
  const adminByUser = new Map(admins.map((a) => [a.userId, a]));

  if (orders.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-line-strong px-4 py-12 text-center text-sm text-ink-muted">
        Keine Bestellungen in dieser Ansicht.
      </p>
    );
  }

  return (
    <>
      {/* phones & tablets: cards */}
      <ul className="space-y-3 xl:hidden">
        {orders.map((o) => {
          const assignee = o.assignedTo ? adminByUser.get(o.assignedTo) : undefined;
          return (
            <li key={o.id} className="rounded-md border border-line bg-paper p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/admin/bestellungen/${o.id}`} className="font-medium text-ink hover:text-forest">
                    {o.orderNumber}
                  </Link>
                  <p className="text-xs text-ink-faint">{formatDateShort(o.createdAt)}</p>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>

              <p className="mt-3 text-sm text-ink">{o.name}</p>
              <p className="truncate text-xs text-ink-faint">{o.email}</p>

              <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
                <span className="text-ink">{o.bookTitles.length} {o.bookTitles.length === 1 ? "Buch" : "Bücher"}</span>
                {" · "}
                {o.bookTitles.join(", ")}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                <span>{FULFILLMENT_LABELS[o.type as FulfillmentType]}</span>
                <ParcelFlag o={o} parcel={parcel} />
                <Remaining o={o} now={now} />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 border-t border-line pt-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex items-center gap-2">
                  <AssigneeSelect orderId={o.id} value={o.assignedTo} admins={admins} className="min-w-0 flex-1" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <OrderRowActions
                    orderId={o.id}
                    orderNumber={o.orderNumber}
                    status={o.status as OrderStatus}
                    type={o.type as FulfillmentType}
                  />
                  <Link href={`/admin/bestellungen/${o.id}`} className="inline-flex min-h-10 items-center text-sm text-ink-muted hover:text-ink">
                    Details →
                  </Link>
                </div>
              </div>
              {assignee && <span className="sr-only">Zugewiesen an {assignee.name}</span>}
            </li>
          );
        })}
      </ul>

      {/* desktop: table */}
      <div className="hidden overflow-x-auto rounded-md border border-line xl:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-paper-alt text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Bestellung</th>
              <th className="px-3 py-3 font-medium">Empfänger</th>
              <th className="px-3 py-3 font-medium">Bücher</th>
              <th className="px-3 py-3 font-medium">Art</th>
              <th className="px-3 py-3 font-medium">Zugewiesen</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Reservierungszeit</th>
              <th className="px-4 py-3 text-right font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const assignee = o.assignedTo ? adminByUser.get(o.assignedTo) : undefined;
              return (
                <tr key={o.id} className="border-b border-line align-top last:border-0 hover:bg-paper-alt/60">
                  <td className="px-4 py-3">
                    <Link href={`/admin/bestellungen/${o.id}`} className="font-medium text-ink hover:text-forest">
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-ink-faint">{formatDateShort(o.createdAt)}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-ink">{o.name}</p>
                    <p className="max-w-[14rem] truncate text-xs text-ink-faint">{o.email}</p>
                  </td>
                  <td className="max-w-[16rem] px-3 py-3 text-ink-muted">
                    <p className="text-ink">{o.bookTitles.length}×</p>
                    <p className="line-clamp-2 text-xs">{o.bookTitles.join(", ")}</p>
                  </td>
                  <td className="px-3 py-3 text-ink-muted">
                    <p>{FULFILLMENT_LABELS[o.type as FulfillmentType]}</p>
                    <ParcelFlag o={o} parcel={parcel} />
                  </td>
                  <td className="w-44 px-3 py-3">
                    <AssigneeSelect orderId={o.id} value={o.assignedTo} admins={admins} />
                    {assignee && <span className="sr-only"><AssigneeBadge code={assignee.code} name={assignee.name} /></span>}
                  </td>
                  <td className="px-3 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <Remaining o={o} now={now} />
                  </td>
                  <td className="px-4 py-3">
                    <OrderRowActions
                      className="flex justify-end"
                      orderId={o.id}
                      orderNumber={o.orderNumber}
                      status={o.status as OrderStatus}
                      type={o.type as FulfillmentType}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
