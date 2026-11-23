import { cn } from "@/lib/cn";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

const ORDER_STYLES: Record<OrderStatus, string> = {
  new: "bg-sand-tint text-sand",
  mail_sent: "bg-paper-strong text-ink-muted",
  qr_received: "bg-forest-tint text-forest-soft",
  processing: "bg-forest-tint text-forest-soft",
  packed: "bg-forest-tint text-forest",
  shipped: "bg-forest-soft text-paper",
  arrange_pickup: "bg-sand-tint text-sand",
  ready_for_pickup: "bg-forest-tint text-forest",
  picked_up: "bg-forest-soft text-paper",
  completed: "bg-forest text-paper",
  cancelled: "bg-brick-tint text-brick",
  expired: "bg-paper-strong text-ink-faint",
};

export function OrderStatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status as OrderStatus;
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        ORDER_STYLES[key] ?? "bg-paper-strong text-ink-muted",
        className,
      )}
    >
      {ORDER_STATUS_LABELS[key] ?? status}
    </span>
  );
}
