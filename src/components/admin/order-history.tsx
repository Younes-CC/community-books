import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import type { OrderHistoryRow } from "@/lib/database.types";
import { formatDate } from "@/lib/format";

export function OrderHistory({ history }: { history: OrderHistoryRow[] }) {
  return (
    <section className="rounded-md border border-line p-4 sm:p-5">
      <h2 className="font-serif text-lg text-ink">Statusverlauf</h2>
      {history.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">Noch keine Einträge.</p>
      ) : (
        <ol className="mt-4 space-y-4 border-l border-line pl-5">
          {[...history].reverse().map((h) => {
            const from = h.from_status ? (ORDER_STATUS_LABELS[h.from_status as OrderStatus] ?? h.from_status) : null;
            const to = h.to_status ? (ORDER_STATUS_LABELS[h.to_status as OrderStatus] ?? h.to_status) : null;
            const who =
              h.source === "system" ? "Automatisch" : h.source === "customer" ? "Empfänger" : (h.actor_name ?? "Admin");
            return (
              <li key={h.id} className="relative text-sm">
                <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-forest" />
                <p className="text-ink">
                  {h.event === "status" || h.event === "mail_sent" ? (
                    h.event === "status" && from ? (
                      <>
                        {from} → <strong className="font-medium">{to}</strong>
                      </>
                    ) : (
                      <strong className="font-medium">{to ?? "Eingegangen"}</strong>
                    )
                  ) : null}
                  {h.note && (
                    <span className="text-ink-muted">
                      {h.event === "status" && from ? " · " : ""}
                      {h.note}
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink-faint">
                  {formatDate(h.created_at)} · {who}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
