"use client";

import { useActionState } from "react";
import { updateSettingsAction, type SettingsFormState } from "@/lib/actions/admin/settings";
import type { PublicSettings } from "@/lib/data/settings";

const initialState: SettingsFormState = { status: "idle" };

export function SettingsForm({ settings }: { settings: PublicSettings }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-5">
      {state.status === "error" && (
        <p className="rounded-md bg-brick-tint px-4 py-3 text-sm text-brick">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="rounded-md bg-forest-tint px-4 py-3 text-sm text-forest-soft">
          Einstellungen gespeichert.
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-sm text-ink-muted" htmlFor="shippingPrice">
          Versand &amp; Verpackung (€)
        </label>
        <input
          id="shippingPrice"
          name="shippingPrice"
          type="number"
          step="0.01"
          min="0"
          defaultValue={settings.shipping_price}
          required
          className="w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
        />
        {state.status === "error" && state.fieldErrors?.shippingPrice && (
          <p className="mt-1 text-xs text-brick">{state.fieldErrors.shippingPrice[0]}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-ink-muted" htmlFor="paymentUrl">
          Revolut-Zahlungslink
        </label>
        <input
          id="paymentUrl"
          name="paymentUrl"
          type="url"
          placeholder="https://revolut.me/..."
          defaultValue={settings.payment_url ?? ""}
          className="w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
        />
        {state.status === "error" && state.fieldErrors?.paymentUrl && (
          <p className="mt-1 text-xs text-brick">{state.fieldErrors.paymentUrl[0]}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-ink-muted" htmlFor="reservationDurationHours">
          Reservierungsdauer bei offener Zahlung (Stunden)
        </label>
        <input
          id="reservationDurationHours"
          name="reservationDurationHours"
          type="number"
          min="1"
          defaultValue={settings.reservation_duration_hours}
          required
          className="w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-forest px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-forest-soft disabled:opacity-50"
      >
        {pending ? "Wird gespeichert…" : "Speichern"}
      </button>
    </form>
  );
}
