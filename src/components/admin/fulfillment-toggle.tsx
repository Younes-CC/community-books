"use client";

import { cn } from "@/lib/cn";

export type TiktokFulfillment = "shipping" | "pickup";

// Hermes shipping or pickup: decides which status steps exist (pickup has no QR code).
export function FulfillmentToggle({
  value,
  onChange,
  disabled,
}: {
  value: TiktokFulfillment;
  onChange: (v: TiktokFulfillment) => void;
  disabled?: boolean;
}) {
  const options: { key: TiktokFulfillment; label: string }[] = [
    { key: "shipping", label: "Versand (Hermes)" },
    { key: "pickup", label: "Abholung" },
  ];
  return (
    <div role="radiogroup" aria-label="Übergabe" className="grid grid-cols-2 gap-2">
      {options.map((o) => {
        const on = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onChange(o.key)}
            className={cn(
              "min-h-12 rounded-full border px-4 text-sm transition-colors disabled:opacity-50",
              on ? "border-forest bg-forest font-medium text-paper" : "border-line-strong bg-paper text-ink-muted hover:border-ink hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
