import Link from "next/link";
import type { AdminOrderListRow } from "@/lib/data/admin/orders";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { DmStatusSelect } from "@/components/admin/dm-status-select";
import { CancelOrderButton } from "@/components/admin/cancel-order-button";
import { DM_CANCELLABLE, FULFILLMENT_LABELS, SOURCE_LABELS } from "@/lib/constants";
import { formatDateShort } from "@/lib/format";
import { formatRemaining } from "@/lib/time";
import { cn } from "@/lib/cn";

const isDm = (o: AdminOrderListRow) => o.source === "tiktok_dm";
const isOpen = (o: AdminOrderListRow) => !["cancelled", "expired"].includes(o.status);
// shipped orders keep their stock reserved and cannot be cancelled any more
const canCancel = (o: AdminOrderListRow) => isDm(o) && DM_CANCELLABLE.includes(o.status);

function SourceBadge({ source }: { source: AdminOrderListRow["source"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        source === "tiktok_dm" ? "bg-forest-tint text-forest" : "bg-paper-strong text-ink-muted",
      )}
    >
      {SOURCE_LABELS[source]}
    </span>
  );
}

function TypeLabel({ o }: { o: AdminOrderListRow }) {
  return isDm(o) ? <span>{o.type === "pickup" ? "Abholung" : "Hermes"}</span> : <span>{FULFILLMENT_LABELS[o.type]}</span>;
}

// "Anleitung gesendet": countdown to the QR-code deadline, red once it has passed
function deadlineOf(o: AdminOrderListRow, dueHours: number) {
  if (o.status !== "mail_sent" || !o.instructionsSentAt) return null;
  return new Date(new Date(o.instructionsSentAt).getTime() + dueHours * 3_600_000).toISOString();
}

function StatusCell({ o, now, dueHours }: { o: AdminOrderListRow; now: number; dueHours: number }) {
  const remaining = formatRemaining(deadlineOf(o, dueHours), now);
  return (
    <div>
      {isDm(o) && isOpen(o) ? <DmStatusSelect orderId={o.id} status={o.status} type={o.type} /> : <OrderStatusBadge status={o.status} />}
      {remaining && (
        <p className={cn("mt-1.5 text-xs", remaining.overdue ? "font-medium text-brick" : "text-ink-faint")}>
          {remaining.overdue ? `Fällig – ${remaining.text}` : `QR-Code: ${remaining.text}`}
        </p>
      )}
    </div>
  );
}

const isDue = (o: AdminOrderListRow, now: number, dueHours: number) => {
  const d = deadlineOf(o, dueHours);
  return d !== null && new Date(d).getTime() < now;
};

function Actions({ o }: { o: AdminOrderListRow }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/bestellungen/${o.id}`}
        className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full border border-line-strong px-4 text-sm text-ink transition-colors hover:border-forest hover:text-forest"
      >
        {isDm(o) ? "Bearbeiten" : "Details"}
      </Link>
      {canCancel(o) && <CancelOrderButton orderId={o.id} label={o.name} />}
    </div>
  );
}

export function OrdersView({ orders, now, dueHours }: { orders: AdminOrderListRow[]; now: number; dueHours: number }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line-strong px-6 py-12 text-center">
        <p className="font-serif text-lg text-ink">Keine Bestellungen gefunden.</p>
        <p className="mt-1 text-sm text-ink-muted">Passe die Suche oder den Filter an — oder erfasse oben eine neue Bestellung.</p>
      </div>
    );
  }

  return (
    <>
      {/* phone + tablet: cards */}
      <ul className="space-y-3 lg:hidden">
        {orders.map((o) => (
          <li key={o.id} className={cn("rounded-md border bg-paper p-4", isDue(o, now, dueHours) ? "border-brick/50 bg-brick-tint/40" : "border-line")}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words font-medium text-ink">{o.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-faint">
                  <SourceBadge source={o.source} />
                  <TypeLabel o={o} />
                  <span>{formatDateShort(o.createdAt)}</span>
                </p>
              </div>
            </div>

            <ul className="mt-3 space-y-0.5 text-sm text-ink-muted">
              {o.bookTitles.map((t) => (
                <li key={t} className="line-clamp-2">
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-center">
              <StatusCell o={o} now={now} dueHours={dueHours} />
              <Actions o={o} />
            </div>
          </li>
        ))}
      </ul>

      {/* desktop: table */}
      <div className="hidden overflow-x-auto rounded-md border border-line lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-paper-alt text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">TikTok-Name</th>
              <th className="px-3 py-3 font-medium">Bücher</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Erstellt am</th>
              <th className="px-4 py-3 font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className={cn("border-b border-line align-top last:border-0 hover:bg-paper-alt/60", isDue(o, now, dueHours) && "bg-brick-tint/40")}>
                <td className="px-4 py-3">
                  <p className="break-words font-medium text-ink">{o.name}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-faint">
                    <SourceBadge source={o.source} />
                    <TypeLabel o={o} />
                    <span>· {o.orderNumber}</span>
                  </p>
                </td>
                <td className="max-w-[20rem] px-3 py-3 text-ink-muted">
                  <ul className="space-y-0.5">
                    {o.bookTitles.map((t) => (
                      <li key={t} className="line-clamp-1">
                        {t}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="w-52 px-3 py-3">
                  <StatusCell o={o} now={now} dueHours={dueHours} />
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-muted">{formatDateShort(o.createdAt)}</td>
                <td className="px-4 py-3">
                  <Actions o={o} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
