"use client";

import { Check } from "lucide-react";
import { MAX_BOOKS_PER_PERSON } from "@/lib/constants";
import { cn } from "@/lib/cn";

export type PickerBook = { id: string; title: string; available: number };

// Tap books to select them (max. three, each only once). Books that are out of stock stay
// disabled — except books already on the order being edited.
export function BookPicker({
  books,
  selected,
  onChange,
  keepIds = [],
  max = MAX_BOOKS_PER_PERSON,
}: {
  books: PickerBook[];
  selected: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  keepIds?: string[];
  max?: number;
}) {
  const full = selected.length >= max;

  function toggle(id: string) {
    // functional update: rapid taps can never exceed the limit or lose a pick
    onChange((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : prev.length >= max ? prev : [...prev, id]));
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm text-ink-muted">Bücher</span>
        <span className={cn("text-xs", full ? "font-medium text-forest" : "text-ink-faint")}>
          {selected.length} von {max} gewählt
        </span>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {books.map((b) => {
          const on = selected.includes(b.id);
          const soldOut = b.available < 1 && !keepIds.includes(b.id);
          const disabled = soldOut || (!on && full);
          return (
            <li key={b.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                disabled={disabled}
                onClick={() => toggle(b.id)}
                className={cn(
                  "flex min-h-14 w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors",
                  on ? "border-forest bg-forest-tint" : "border-line-strong bg-paper hover:border-ink",
                  disabled && "cursor-not-allowed opacity-45 hover:border-line-strong",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    on ? "border-forest bg-forest text-paper" : "border-line-strong",
                  )}
                >
                  {on && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm leading-snug text-ink">{b.title}</span>
                  <span className={cn("text-xs", b.available < 1 ? "text-brick" : "text-ink-faint")}>
                    {b.available < 1 ? "vergriffen" : `${b.available} verfügbar`}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
