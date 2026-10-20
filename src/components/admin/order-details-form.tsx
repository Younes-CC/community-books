"use client";

import { useActionState } from "react";
import { updateOrderDetailsAction, type OrderDetailsState } from "@/lib/actions/admin/orders";
import { PARCEL_CLASSES } from "@/lib/constants";
import { isoToBerlinLocal } from "@/lib/time";

const initial: OrderDetailsState = { status: "idle" };

const field =
  "min-h-11 w-full rounded-md border border-line-strong bg-paper px-3 py-2 text-sm text-ink focus:border-forest focus:outline-none";

export function OrderDetailsForm({
  orderId,
  notes,
  isPickup,
  isShipping,
  pickupAppointment,
  pickupDeadline,
  parcelOverride,
  parcelHint,
}: {
  orderId: string;
  notes: string | null;
  isPickup: boolean;
  isShipping: boolean;
  pickupAppointment: string | null;
  pickupDeadline: string | null;
  parcelOverride: string | null;
  parcelHint: string;
}) {
  const [state, action, pending] = useActionState(updateOrderDetailsAction, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

      {isShipping && (
        <div>
          <label htmlFor="parcelOverride" className="mb-1.5 block text-sm text-ink-muted">
            Paketklasse dieser Bestellung
          </label>
          <select id="parcelOverride" name="parcelOverride" defaultValue={parcelOverride ?? ""} className={field}>
            <option value="">Automatisch ({parcelHint})</option>
            {PARCEL_CLASSES.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label} (manuell festgelegt)
              </option>
            ))}
          </select>
        </div>
      )}
      {!isShipping && <input type="hidden" name="parcelOverride" value="" />}

      {isPickup ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pickupAppointment" className="mb-1.5 block text-sm text-ink-muted">
              Abholtermin
            </label>
            <input
              id="pickupAppointment"
              name="pickupAppointment"
              type="datetime-local"
              defaultValue={isoToBerlinLocal(pickupAppointment)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="pickupDeadline" className="mb-1.5 block text-sm text-ink-muted">
              Abholfrist
            </label>
            <input
              id="pickupDeadline"
              name="pickupDeadline"
              type="datetime-local"
              defaultValue={isoToBerlinLocal(pickupDeadline)}
              className={field}
            />
          </div>
        </div>
      ) : (
        <>
          <input type="hidden" name="pickupAppointment" value="" />
          <input type="hidden" name="pickupDeadline" value="" />
        </>
      )}

      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm text-ink-muted">
          Interne Notizen (nur für Admins sichtbar)
        </label>
        <textarea id="notes" name="notes" rows={4} defaultValue={notes ?? ""} maxLength={4000} className={field} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-full bg-forest px-6 text-sm font-medium text-paper hover:bg-forest-soft disabled:opacity-50"
        >
          {pending ? "Wird gespeichert…" : "Speichern"}
        </button>
        {state.status === "saved" && <span className="text-sm text-forest">Gespeichert.</span>}
        {state.status === "error" && <span className="text-sm text-brick">{state.message}</span>}
      </div>
    </form>
  );
}
