"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { transitionOrderAction, deleteOrderAction } from "@/lib/actions/admin/orders";
import { ORDER_STATUS_LABELS, type FulfillmentType, type OrderStatus } from "@/lib/constants";
import {
  CONFIRM_STEPS,
  deleteConfirmMessage,
  nextStatus,
  STEP_LABELS,
} from "@/lib/order-workflow";
import { cn } from "@/lib/cn";

export function OrderRowActions({
  orderId,
  orderNumber,
  status,
  type,
  className,
}: {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  type: FulfillmentType;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const next = nextStatus(type, status);
  // Sending the instructions mail is a deliberate, separate flow (draft → send → mark as sent).
  const needsMailFlow = next === "mail_sent";

  function advance() {
    if (!next) return;
    if (CONFIRM_STEPS.includes(next) && !confirm(`${orderNumber}: „${ORDER_STATUS_LABELS[next]}“ setzen?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await transitionOrderAction(orderId, next);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        router.refresh();
      } catch {
        setError("Fehlgeschlagen.");
      }
    });
  }

  function remove() {
    if (!confirm(deleteConfirmMessage(orderNumber, status))) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteOrderAction(orderId);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        router.refresh();
      } catch {
        setError("Fehlgeschlagen.");
      }
    });
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {needsMailFlow ? (
          <Link
            href={`/admin/bestellungen/${orderId}#email`}
            className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full bg-forest px-3.5 text-xs font-medium text-paper hover:bg-forest-soft"
          >
            E-Mail vorbereiten
          </Link>
        ) : next ? (
          <button
            type="button"
            disabled={isPending}
            onClick={advance}
            className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full border border-line-strong px-3.5 text-xs text-ink transition-colors hover:border-forest hover:text-forest disabled:opacity-40"
          >
            {STEP_LABELS[next]}
          </button>
        ) : null}
        <button
          type="button"
          disabled={isPending}
          onClick={remove}
          aria-label={`${orderNumber} löschen`}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-brick-tint hover:text-brick disabled:opacity-40",
          )}
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-brick">{error}</p>}
    </div>
  );
}
