"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrderAction } from "@/lib/actions/admin/orders";
import { cn } from "@/lib/cn";

// Cancelling releases the reserved copies exactly once (also protected in the database).
export function CancelOrderButton({
  orderId,
  label,
  className,
}: {
  orderId: string;
  label: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function cancel() {
    if (!confirm(`${label} stornieren? Die reservierten Exemplare werden wieder freigegeben.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await cancelOrderAction(orderId);
        if (!result.ok) setError(result.message);
        router.refresh();
      } catch {
        setError("Fehlgeschlagen.");
      }
    });
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={pending}
        onClick={cancel}
        className={cn(
          "inline-flex min-h-10 items-center whitespace-nowrap rounded-full border border-brick/40 px-4 text-sm text-brick transition-colors hover:bg-brick-tint disabled:opacity-40",
        )}
      >
        {pending ? "…" : "Stornieren"}
      </button>
      {error && <p className="mt-1 text-xs text-brick">{error}</p>}
    </div>
  );
}
