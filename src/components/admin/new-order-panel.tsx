"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createDmOrderAction } from "@/lib/actions/admin/dm-orders";
import { BookPicker, type PickerBook } from "@/components/admin/book-picker";
import { FulfillmentToggle, type TiktokFulfillment } from "@/components/admin/fulfillment-toggle";
import { dmStatusesFor, ORDER_STATUS_LABELS } from "@/lib/constants";

const field =
  "min-h-12 w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-base text-ink placeholder:text-ink-faint focus:border-forest focus:outline-none sm:text-sm";

export function NewOrderPanel({ books }: { books: PickerBook[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [type, setType] = useState<TiktokFulfillment>("shipping");
  const [status, setStatus] = useState<string>("new");
  // one key per form fill: a double tap or a retry can never create the order twice
  const [clientKey, setClientKey] = useState(() => crypto.randomUUID());
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const canSave = name.trim().length > 0 && selected.length > 0 && !pending;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setError(null);
    setSaved(null);
    startTransition(async () => {
      try {
        const result = await createDmOrderAction({ tiktokName: name, bookIds: selected, fulfillmentType: type, status, clientKey });
        if (!result.ok) {
          setError(result.message);
          router.refresh(); // stock may have changed
          return;
        }
        setSaved(`${result.tiktokName} gespeichert (${result.orderNumber}).`);
        setName("");
        setSelected([]);
        setStatus("new");
        setType("shipping");
        setClientKey(crypto.randomUUID());
        router.refresh();
        nameRef.current?.focus();
      } catch {
        setError("Speichern fehlgeschlagen. Bitte erneut versuchen.");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setTimeout(() => nameRef.current?.focus(), 50);
        }}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-forest px-6 text-[0.95rem] font-medium text-paper transition-colors hover:bg-forest-soft sm:w-auto"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        Neue Bestellung
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-md border border-forest/40 bg-paper-alt p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-ink">Neue Bestellung</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Schließen"
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:bg-paper-strong"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      {saved && (
        <p role="status" className="mt-3 rounded-md bg-forest-tint px-4 py-3 text-sm text-forest-soft">
          {saved}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-md bg-brick-tint px-4 py-3 text-sm text-brick">
          {error}
        </p>
      )}

      <div className="mt-4 space-y-5">
        <div>
          <label htmlFor="tiktokName" className="mb-1.5 block text-sm text-ink-muted">
            TikTok-Name
          </label>
          <input
            ref={nameRef}
            id="tiktokName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="@username"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={80}
            className={field}
          />
        </div>

        <BookPicker books={books} selected={selected} onChange={setSelected} />

        <div>
          <span className="mb-1.5 block text-sm text-ink-muted">Übergabe</span>
          <FulfillmentToggle
            value={type}
            onChange={(v) => {
              setType(v);
              setStatus("new"); // pickup has its own status steps
            }}
          />
        </div>

        <div>
          <label htmlFor="dmStatus" className="mb-1.5 block text-sm text-ink-muted">
            Status
          </label>
          <select id="dmStatus" value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
            {dmStatusesFor(type).map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSave}
        className="mt-5 min-h-12 w-full rounded-full bg-forest px-8 text-[0.95rem] font-medium text-paper transition-colors hover:bg-forest-soft disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Wird gespeichert…" : "Bestellung speichern"}
      </button>
    </form>
  );
}
