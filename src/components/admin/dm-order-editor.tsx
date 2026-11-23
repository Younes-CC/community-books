"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setDmFulfillmentAction, updateDmOrderAction } from "@/lib/actions/admin/dm-orders";
import { FulfillmentToggle, type TiktokFulfillment } from "@/components/admin/fulfillment-toggle";
import { DM_CANCELLABLE } from "@/lib/constants";
import { BookPicker, type PickerBook } from "@/components/admin/book-picker";
import { DmStatusSelect } from "@/components/admin/dm-status-select";
import { CancelOrderButton } from "@/components/admin/cancel-order-button";

const field =
  "min-h-12 w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-base text-ink focus:border-forest focus:outline-none sm:text-sm";

// Edit a TikTok order: name, book selection (stock is adjusted automatically), status, cancel.
export function DmOrderEditor({
  orderId,
  tiktokName,
  bookIds,
  books,
  status,
  type,
  locked,
}: {
  orderId: string;
  tiktokName: string;
  bookIds: string[];
  books: PickerBook[];
  status: string;
  type: TiktokFulfillment;
  locked: boolean; // cancelled: nothing can be changed any more
}) {
  const [name, setName] = useState(tiktokName);
  const [selected, setSelected] = useState(bookIds);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const canCancel = !locked && DM_CANCELLABLE.includes(status);

  function changeType(next: TiktokFulfillment) {
    if (next === type) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await setDmFulfillmentAction(orderId, next);
        if (!result.ok) setError(result.message);
        router.refresh();
      } catch {
        setError("Fehlgeschlagen.");
      }
    });
  }

  const dirty = name.trim() !== tiktokName || [...selected].sort().join() !== [...bookIds].sort().join();

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        const result = await updateDmOrderAction({ orderId, tiktokName: name, bookIds: selected });
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setSaved(true);
        router.refresh();
      } catch {
        setError("Speichern fehlgeschlagen.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-line p-4 sm:p-5">
        {!locked && (
          <div className="mb-4">
            <h2 className="mb-2 text-xs uppercase tracking-wide text-ink-faint">Übergabe</h2>
            <FulfillmentToggle value={type} onChange={changeType} disabled={pending} />
          </div>
        )}
        <h2 className="text-xs uppercase tracking-wide text-ink-faint">Status</h2>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {locked ? (
            <p className="text-sm text-brick">Storniert — Bücher wurden wieder freigegeben.</p>
          ) : (
            <DmStatusSelect orderId={orderId} status={status} type={type} className="w-full sm:w-64" />
          )}
          {canCancel && <CancelOrderButton orderId={orderId} label={tiktokName} />}
        </div>
      </section>

      <form onSubmit={save} className="space-y-5 rounded-md border border-line p-4 sm:p-5">
        <fieldset disabled={locked} className="space-y-5 disabled:opacity-60">
          <div>
            <label htmlFor="tiktokName" className="mb-1.5 block text-sm text-ink-muted">
              TikTok-Name
            </label>
            <input
              id="tiktokName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={80}
              className={field}
            />
          </div>
          <BookPicker books={books} selected={selected} onChange={setSelected} keepIds={bookIds} />
        </fieldset>

        {error && (
          <p role="alert" className="rounded-md bg-brick-tint px-4 py-3 text-sm text-brick">
            {error}
          </p>
        )}
        {saved && !dirty && (
          <p role="status" className="rounded-md bg-forest-tint px-4 py-3 text-sm text-forest-soft">
            Gespeichert. Der Bestand wurde angepasst.
          </p>
        )}

        {!locked && (
          <button
            type="submit"
            disabled={pending || !dirty || name.trim() === "" || selected.length === 0}
            className="min-h-12 w-full rounded-full bg-forest px-8 text-[0.95rem] font-medium text-paper transition-colors hover:bg-forest-soft disabled:opacity-50 sm:w-auto"
          >
            {pending ? "Wird gespeichert…" : "Änderungen speichern"}
          </button>
        )}
      </form>
    </div>
  );
}
