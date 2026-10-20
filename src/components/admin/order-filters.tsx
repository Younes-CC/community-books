"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { cn } from "@/lib/cn";

type AdminChip = { code: string; name: string };

export function OrderFilters({ admins }: { admins: AdminChip[] }) {
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

  const hasFilters = ["scope", "status", "type", "overdue", "q"].some((k) => params.get(k));

  const scopes = [
    { key: "", label: "Alle" },
    { key: "meine", label: "Meine" },
    ...admins.map((a) => ({ key: a.code, label: a.name })),
    { key: "unzugewiesen", label: "Nicht zugewiesen" },
  ];
  const types = [
    { key: "", label: "Versand + Abholung" },
    { key: "shipping", label: "Versand" },
    { key: "pickup", label: "Abholung" },
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" strokeWidth={1.5} />
        <input
          type="search"
          defaultValue={get("q")}
          key={get("q")}
          placeholder="Suche: Bestellnummer, Name oder E-Mail"
          aria-label="Bestellungen durchsuchen"
          onChange={(e) => {
            const value = e.target.value;
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => set({ q: value.trim() || null }), 350);
          }}
          className="min-h-12 w-full rounded-full border border-line-strong bg-paper py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-forest focus:outline-none"
        />
      </div>

      <ChipRow label="Bearbeiter">
        {scopes.map((s) => (
          <Chip key={s.key || "alle"} active={get("scope") === s.key} onClick={() => set({ scope: s.key || null })}>
            {s.label}
          </Chip>
        ))}
      </ChipRow>

      <ChipRow label="Art">
        {types.map((t) => (
          <Chip key={t.key || "alle"} active={get("type") === t.key} onClick={() => set({ type: t.key || null })}>
            {t.label}
          </Chip>
        ))}
        <Chip active={get("overdue") === "1"} tone="warn" onClick={() => set({ overdue: get("overdue") === "1" ? null : "1" })}>
          Überfällig
        </Chip>
      </ChipRow>

      <div className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="status-filter">
          Status
        </label>
        <select
          id="status-filter"
          value={get("status")}
          onChange={(e) => set({ status: e.target.value || null })}
          className="min-h-11 rounded-full border border-line-strong bg-paper px-4 text-sm text-ink focus:border-forest focus:outline-none"
        >
          <option value="">Alle Status</option>
          <option value="aktiv">Nur aktive</option>
          {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
            Filter zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="hidden w-20 shrink-0 text-xs uppercase tracking-wide text-ink-faint sm:block">{label}</span>
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label={label}>
        {children}
      </div>
    </div>
  );
}

function Chip({
  active,
  tone,
  onClick,
  children,
}: {
  active: boolean;
  tone?: "warn";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-10 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm transition-colors",
        active
          ? tone === "warn"
            ? "border-brick bg-brick text-paper"
            : "border-forest bg-forest text-paper"
          : tone === "warn"
            ? "border-brick/40 text-brick hover:border-brick"
            : "border-line-strong text-ink-muted hover:border-ink hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
