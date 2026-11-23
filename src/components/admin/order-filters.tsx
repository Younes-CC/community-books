"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { DM_PICKUP_STATUSES, DM_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";

const select =
  "min-h-11 rounded-full border border-line-strong bg-paper px-4 text-sm text-ink focus:border-forest focus:outline-none";

export function OrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const get = (k: string) => params.get(k) ?? "";

  function set(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const hasFilters = ["status", "sort", "q"].some((k) => params.get(k));

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" strokeWidth={1.5} />
        <input
          type="search"
          defaultValue={get("q")}
          key={get("q")}
          placeholder="TikTok-Name suchen"
          aria-label="Bestellungen durchsuchen"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          onChange={(e) => {
            const value = e.target.value;
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => set({ q: value.trim() || null }), 300);
          }}
          className="min-h-12 w-full rounded-full border border-line-strong bg-paper py-2.5 pl-10 pr-4 text-base text-ink placeholder:text-ink-faint focus:border-forest focus:outline-none sm:text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="status-filter">
          Status
        </label>
        <select id="status-filter" value={get("status")} onChange={(e) => set({ status: e.target.value || null })} className={select}>
          <option value="">Offene Bestellungen</option>
          <option value="alle">Alle (inkl. storniert)</option>
          {DM_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
          {DM_PICKUP_STATUSES.filter((s) => s !== "new").map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]} (Abholung)
            </option>
          ))}
          <option value="storniert">Storniert</option>
        </select>

        <label className="sr-only" htmlFor="sort-filter">
          Sortierung
        </label>
        <select id="sort-filter" value={get("sort")} onChange={(e) => set({ sort: e.target.value || null })} className={select}>
          <option value="">Neueste zuerst</option>
          <option value="alt">Älteste zuerst</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
            Zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}
