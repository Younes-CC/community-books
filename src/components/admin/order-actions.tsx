"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setOrderStatusAction, type OrderAction } from "@/lib/actions/admin/orders";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/lib/constants";

const ACTION_LABELS: Record<OrderAction, string> = {
  confirm_payment: "Zahlung bestätigen",
  mark_packing: "Als verpackt markieren",
  mark_shipped: "Als versendet markieren",
  mark_ready_for_pickup: "Abholbereit",
  mark_completed: "Abgeholt / Abgeschlossen",
  cancel: "Stornieren",
};

export function OrderActions({
  orderId,
  orderStatus,
  paymentStatus,
  fulfillmentType,
}: {
  orderId: string;
  orderStatus: OrderStatus;
  paymentStatus: string;
  fulfillmentType: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const actions: OrderAction[] = [];

  if (paymentStatus === "pending") actions.push("confirm_payment");
  if (["paid", "reserved"].includes(orderStatus)) actions.push("mark_packing");
  if (fulfillmentType === "shipping" && ["packing", "paid"].includes(orderStatus)) {
    actions.push("mark_shipped");
  }
  if (fulfillmentType === "pickup" && orderStatus === "reserved") {
    actions.push("mark_ready_for_pickup");
  }
  if (["shipped", "ready_for_pickup", "reserved", "paid"].includes(orderStatus)) {
    actions.push("mark_completed");
  }
  const canCancel = !["cancelled", "completed", "expired"].includes(orderStatus);

  function run(action: OrderAction) {
    setError(null);
    startTransition(async () => {
      const result = await setOrderStatusAction(orderId, action);
      if (!result.ok) {
        setError(result.message);
        return;
      }
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
            variant="primary"
            size="sm"
            disabled={isPending}
            onClick={() => run(action)}
          >
            {ACTION_LABELS[action]}
          </Button>
        ))}
        {canCancel && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={isPending}
            onClick={() => {
              if (confirm("Diese Bestellung wirklich stornieren? Der Bestand wird zurückgegeben.")) {
                run("cancel");
              }
            }}
          >
            {ACTION_LABELS.cancel}
          </Button>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-brick">{error}</p>}
    </div>
  );
}
