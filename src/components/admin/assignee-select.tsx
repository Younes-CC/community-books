"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignOrderAction } from "@/lib/actions/admin/orders";
import { cn } from "@/lib/cn";

export type AdminOption = { userId: string; code: string | null; name: string };

export function AssigneeSelect({
  orderId,
  value,
  admins,
  className,
}: {
  orderId: string;
  value: string | null;
  admins: AdminOption[];
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className={className}>
      <select
        aria-label="Bearbeiter"
        value={value ?? ""}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value || null;
          setError(null);
          startTransition(async () => {
            try {
              const result = await assignOrderAction(orderId, next);
              if (!result.ok) setError(result.message);
              router.refresh();
            } catch {
              setError("Fehlgeschlagen.");
            }
          });
        }}
        className={cn(
          "min-h-10 w-full rounded-md border border-line-strong bg-paper px-2.5 py-1.5 text-sm text-ink focus:border-forest focus:outline-none disabled:opacity-50",
          !value && "text-ink-faint",
        )}
      >
        <option value="">Nicht zugewiesen</option>
        {admins.map((a) => (
          <option key={a.userId} value={a.userId}>
            {a.code ? `${a.code} · ` : ""}
            {a.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-brick">{error}</p>}
    </div>
  );
}
