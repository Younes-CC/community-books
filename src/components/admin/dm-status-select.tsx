"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setDmStatusAction } from "@/lib/actions/admin/dm-orders";
import { dmStatusesFor, ORDER_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const TONE: Record<string, string> = {
  new: "border-sand/50 bg-sand-tint text-sand",
  mail_sent: "border-line-strong bg-paper-strong text-ink-muted",
  qr_received: "border-forest/30 bg-forest-tint text-forest-soft",
  packed: "border-forest/40 bg-forest-tint text-forest",
  ready_for_pickup: "border-forest/40 bg-forest-tint text-forest",
  picked_up: "border-forest-soft bg-forest-soft text-paper",
  shipped: "border-forest-soft bg-forest-soft text-paper",
};

// Changes the status of a TikTok order directly from the list (one tap, no confirmation needed).
export function DmStatusSelect({
  orderId,
  status,
  type,
  className,
}: {
  orderId: string;
  status: string;
  type: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className={className}>
      <select
        aria-label="Status"
        value={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          setError(null);
          startTransition(async () => {
            try {
              const result = await setDmStatusAction(orderId, next);
              if (!result.ok) setError(result.message);
              router.refresh();
            } catch {
              setError("Fehlgeschlagen.");
            }
          });
        }}
        className={cn(
          "min-h-10 w-full rounded-full border px-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest/40 disabled:opacity-50",
          TONE[status] ?? "border-line-strong bg-paper text-ink",
        )}
      >
        {dmStatusesFor(type).map((s) => (
          <option key={s} value={s} className="bg-paper text-ink">
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-brick">{error}</p>}
    </div>
  );
}
