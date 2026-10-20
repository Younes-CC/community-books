"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  cancelOrderAction,
  deleteOrderAction,
  extendDeadlineAction,
  transitionOrderAction,
} from "@/lib/actions/admin/orders";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABELS, type FulfillmentType, type OrderStatus } from "@/lib/constants";
import {
  CONFIRM_STEPS,
  canCancel,
  deleteConfirmMessage,
  isFinal,
  nextStatus,
  STEP_LABELS,
  workflowFor,
} from "@/lib/order-workflow";

export function OrderDetailActions({
  orderId,
  orderNumber,
  status,
  type,
  qrDeadlineHours,
}: {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  type: FulfillmentType;
  qrDeadlineHours: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const next = nextStatus(type, status);
  const needsMailFlow = next === "mail_sent";
  const final = isFinal(status);

  function run(fn: () => Promise<{ ok: true } | { ok: false; message: string }>, after?: () => void) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await fn();
        if (!result.ok) {
          setError(result.message);
          return;
        }
        if (after) after();
        else router.refresh();
      } catch {
        setError("Aktion fehlgeschlagen. Bitte erneut versuchen.");
      }
    });
  }

  function goTo(target: OrderStatus) {
    if (
      (CONFIRM_STEPS.includes(target) || target === "new") &&
      !confirm(`${orderNumber}: Status auf „${ORDER_STATUS_LABELS[target]}“ setzen?`)
    ) {
      return;
    }
    run(() => transitionOrderAction(orderId, target));
  }

  const corrections = workflowFor(type).filter((s) => s !== status);

  return (
    <div className="space-y-4">
      {!final && (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {needsMailFlow ? (
            <a
              href="#email"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-6 text-[0.95rem] font-medium text-paper hover:bg-forest-soft"
            >
              Nächster Schritt: Versandanleitung vorbereiten ↓
            </a>
          ) : next ? (
            <Button type="button" disabled={pending} onClick={() => goTo(next)} className="w-full sm:w-auto">
              {STEP_LABELS[next]}
            </Button>
          ) : null}

          {status === "mail_sent" && (
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => {
                if (confirm(`Die ${qrDeadlineHours}-Stunden-Frist für ${orderNumber} neu starten?`)) {
                  run(() => extendDeadlineAction(orderId));
                }
              }}
              className="w-full sm:w-auto"
            >
              QR-Frist neu starten (+{qrDeadlineHours} Std.)
            </Button>
          )}
        </div>
      )}

      {!final && (
        <div>
          <label htmlFor="status-correct" className="mb-1.5 block text-xs uppercase tracking-wide text-ink-faint">
            Status direkt setzen
          </label>
          <select
            id="status-correct"
            value=""
            disabled={pending}
            onChange={(e) => e.target.value && goTo(e.target.value as OrderStatus)}
            className="min-h-11 w-full rounded-md border border-line-strong bg-paper px-3 text-sm text-ink focus:border-forest focus:outline-none sm:w-auto sm:min-w-64"
          >
            <option value="">Status wählen …</option>
            {corrections.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row">
        {canCancel(status) && (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            className="w-full sm:w-auto"
            onClick={() => {
              if (confirm(`${orderNumber} stornieren? Die Bücher werden wieder für andere freigegeben.`)) {
                run(() => cancelOrderAction(orderId));
              }
            }}
          >
            Stornieren
          </Button>
        )}
        <Button
          type="button"
          variant="danger"
          disabled={pending}
          className="w-full sm:w-auto"
          onClick={() => {
            if (confirm(deleteConfirmMessage(orderNumber, status))) {
              run(
                () => deleteOrderAction(orderId),
                () => {
                  router.push("/admin");
                  router.refresh();
                },
              );
            }
          }}
        >
          Endgültig löschen
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-brick">
          {error}
        </p>
      )}
    </div>
  );
}
