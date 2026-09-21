"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setOrderStatusAction,
  deleteOrderAction,
  type OrderAction,
} from "@/lib/actions/admin/orders";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/lib/constants";
import {
  ACTION_LABELS,
  availableActions,
  canCancel,
  deleteConfirmMessage,
} from "@/lib/order-workflow";

export function OrderActions({
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

  const actions = availableActions({ orderStatus, paymentStatus, fulfillmentType });

  function run(action: OrderAction) {
    setError(null);
    startTransition(async () => {
      let result;
      try {
        result = await setOrderStatusAction(orderId, action);
      } catch {
        setError("Aktion fehlgeschlagen. Bitte erneut versuchen.");
        return;
      }
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  function remove() {
    if (!confirm(deleteConfirmMessage(orderNumber, orderStatus))) return;
    setError(null);
    startTransition(async () => {
      let result;
      try {
        result = await deleteOrderAction(orderId);
      } catch {
        setError("Löschen fehlgeschlagen. Bitte erneut versuchen.");
        return;
      }
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push("/admin/bestellungen");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action}
            type="button"
            variant={action === "extend_reservation" ? "secondary" : "primary"}
            size="sm"
            disabled={isPending}
            onClick={() => run(action)}
          >
            {ACTION_LABELS[action]}
          </Button>
        ))}
        {canCancel(orderStatus) && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isPending}
            onClick={() => {
              if (confirm("Diese Reservierung wirklich stornieren? Der Bestand wird zurückgegeben.")) {
                run("cancel");
              }
            }}
          >
            {ACTION_LABELS.cancel}
          </Button>
        )}
        <Button type="button" variant="danger" size="sm" disabled={isPending} onClick={remove}>
          Löschen
        </Button>
      </div>
      {error && <p className="mt-3 text-sm text-brick">{error}</p>}
    </div>
  );
}
