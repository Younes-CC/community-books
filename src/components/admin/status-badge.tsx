import { cn } from "@/lib/cn";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/constants";

const ORDER_STYLES: Record<OrderStatus, string> = {
  reserved: "bg-paper-strong text-ink-muted",
  awaiting_payment: "bg-sand-tint text-sand",
  paid: "bg-forest-tint text-forest-soft",
  packing: "bg-forest-tint text-forest-soft",
  shipped: "bg-forest-tint text-forest",
  ready_for_pickup: "bg-sand-tint text-sand",
  completed: "bg-forest text-paper",
  cancelled: "bg-brick-tint text-brick",
  expired: "bg-paper-strong text-ink-faint",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  not_required: "bg-paper-strong text-ink-faint",
  pending: "bg-sand-tint text-sand",
  paid: "bg-forest-tint text-forest-soft",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        ORDER_STYLES[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        PAYMENT_STYLES[status],
      )}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
