"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { setOrderStatusAction, deleteOrderAction } from "@/lib/actions/admin/orders";
import type { OrderStatus } from "@/lib/constants";
import { ACTION_LABELS, deleteConfirmMessage, nextAction } from "@/lib/order-workflow";

export function OrderRowActions({
  orderId,
  orderNumber,
  orderStatus,
  paymentStatus,
  fulfillmentType,
}: {
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: string;
  fulfillmentType: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const next = nextAction({ orderStatus, paymentStatus, fulfillmentType });

  function advance() {
    if (!next) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await setOrderStatusAction(orderId, next);
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
    if (!confirm(deleteConfirmMessage(orderNumber, orderStatus))) return;
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
    <div>
      <div className="flex items-center justify-end gap-2">
        {next && (
          <button
            type="button"
            disabled={isPending}
            onClick={advance}
            className="whitespace-nowrap rounded-full border border-line-strong px-3 py-1 text-xs text-ink transition-colors hover:border-forest hover:text-forest disabled:opacity-40"
          >
            {ACTION_LABELS[next]}
          </button>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={remove}
          aria-label={`${orderNumber} löschen`}
          className="rounded-full p-1.5 text-ink-faint transition-colors hover:bg-brick-tint hover:text-brick disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
      {error && <p className="mt-1 text-right text-xs text-brick">{error}</p>}
    </div>
  );
}
