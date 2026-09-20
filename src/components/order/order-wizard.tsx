"use client";

import { useActionState, useState } from "react";
import { Truck, MapPin, ArrowLeft, ExternalLink, CircleCheck } from "lucide-react";
import { createReservationAction, type ReservationState } from "@/lib/actions/reservation";
import { formatPrice, formatDate } from "@/lib/format";
import { COUNTRIES, type FulfillmentType } from "@/lib/constants";
import { cn } from "@/lib/cn";

const initialState: ReservationState = { status: "idle" };

export function OrderWizard({
  bookId,
  bookTitle,
  stockAvailable,
  shippingPrice,
  paymentUrl,
  reservationHours,
}: {
  bookId: string;
  bookTitle: string;
  stockAvailable: number;
  shippingPrice: number;
  paymentUrl: string | null;
  reservationHours: number;
}) {
  const [fulfillment, setFulfillment] = useState<FulfillmentType | null>(null);
  const [state, formAction, pending] = useActionState(createReservationAction, initialState);

  // Server Actions re-render the whole route, so `stockAvailable` may already
  // reflect this very reservation. The success panel must win regardless.
  if (state.status === "success") {
    return <SuccessPanel state={state} paymentUrl={paymentUrl} reservationHours={reservationHours} />;
  }

  if (stockAvailable <= 0) {
    return (
      <p className="rounded-md bg-paper-alt px-5 py-4 text-sm text-ink-muted">
        Dieses Buch ist aktuell vergriffen. Schau gerne später wieder vorbei.
      </p>
    );
  }

  if (!fulfillment) {
    return (
      <div>
        <h2 className="font-serif text-lg text-ink">Dieses Buch auswählen</h2>
        <p className="mt-1 text-sm text-ink-muted">Wie möchtest du dein Buch erhalten?</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setFulfillment("shipping")}
            className="group flex flex-col items-start gap-3 rounded-md border border-line-strong p-5 text-left transition-colors hover:border-forest"
          >
            <Truck className="h-5 w-5 text-forest" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-ink">Versand</p>
              <p className="mt-1 text-sm text-ink-muted">
                Buch kostenlos, du übernimmst nur Versand &amp; Verpackung
                {shippingPrice > 0 ? ` (${formatPrice(shippingPrice)})` : ""}.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFulfillment("pickup")}
            className="group flex flex-col items-start gap-3 rounded-md border border-line-strong p-5 text-left transition-colors hover:border-forest"
          >
            <MapPin className="h-5 w-5 text-forest" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-ink">Abholung</p>
              <p className="mt-1 text-sm text-ink-muted">
                Persönliche Übergabe, vollständig kostenlos. Details folgen separat.
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="fulfillmentType" value={fulfillment} />

      <button
        type="button"
        onClick={() => setFulfillment(null)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Andere Übergabeart wählen
      </button>

      <h2 className="font-serif text-lg text-ink">
        {fulfillment === "shipping" ? "Versand" : "Abholung"} — {bookTitle}
      </h2>

      {state.status === "error" && (
        <p className="mt-3 rounded-md bg-brick-tint px-4 py-3 text-sm text-brick">
          {state.message}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Vorname" name="firstName" errors={fieldErrors(state, "firstName")} required />
        <Field label="Nachname" name="lastName" errors={fieldErrors(state, "lastName")} required />
        <Field
          label="E-Mail"
          name="email"
          type="email"
          errors={fieldErrors(state, "email")}
          className="sm:col-span-2"
          required
        />
        <Field
          label="Instagram / TikTok (optional)"
          name="socialUsername"
          errors={fieldErrors(state, "socialUsername")}
          className="sm:col-span-2"
        />

        {fulfillment === "shipping" && (
          <>
            <Field
              label="Straße"
              name="street"
              errors={fieldErrors(state, "street")}
              className="sm:col-span-2"
              required
            />
            <Field label="Hausnummer" name="houseNumber" errors={fieldErrors(state, "houseNumber")} required />
            <Field label="PLZ" name="postalCode" errors={fieldErrors(state, "postalCode")} required />
            <Field label="Ort" name="city" errors={fieldErrors(state, "city")} required />
            <div>
              <label className="mb-1.5 block text-sm text-ink-muted" htmlFor="country">
                Land
              </label>
              <select
                id="country"
                name="country"
                defaultValue={COUNTRIES[0]}
                className="w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 space-y-1.5 border-t border-line pt-5 text-sm">
        <div className="flex justify-between text-ink-muted">
          <span>Buch</span>
          <span>{formatPrice(0)}</span>
        </div>
        {fulfillment === "shipping" && (
          <div className="flex justify-between text-ink-muted">
            <span>Versand &amp; Verpackung</span>
            <span>{formatPrice(shippingPrice)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-line pt-1.5 font-medium text-ink">
          <span>Gesamt</span>
          <span>{formatPrice(fulfillment === "shipping" ? shippingPrice : 0)}</span>
        </div>
        <p className="pt-2 text-xs text-ink-faint">
          {fulfillment === "shipping"
            ? "Das Buch ist kostenlos. Du übernimmst lediglich Versand und Verpackung."
            : "Das Buch ist bei persönlicher Abholung vollständig kostenlos."}
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 text-[0.95rem] font-medium text-paper transition-colors hover:bg-forest-soft disabled:opacity-50"
      >
        {pending
          ? "Wird verarbeitet…"
          : fulfillment === "shipping"
            ? "Reservierung abschließen"
            : "Kostenlos reservieren"}
      </button>
    </form>
  );
}

function fieldErrors(state: ReservationState, field: string): string[] | undefined {
  if (state.status !== "error") return undefined;
  return state.fieldErrors?.[field];
}

function Field({
  label,
  name,
  type = "text",
  required,
  errors,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  errors?: string[];
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm text-ink-muted" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className={cn(
          "w-full rounded-md border bg-paper px-3.5 py-2.5 text-sm text-ink focus:outline-none",
          errors?.length ? "border-brick" : "border-line-strong focus:border-forest",
        )}
      />
      {errors?.map((err) => (
        <p key={err} className="mt-1 text-xs text-brick">
          {err}
        </p>
      ))}
    </div>
  );
}

function SuccessPanel({
  state,
  paymentUrl,
  reservationHours,
}: {
  state: Extract<ReservationState, { status: "success" }>;
  paymentUrl: string | null;
  reservationHours: number;
}) {
  return (
    <div className="rounded-md border border-line bg-paper-alt p-6">
      <CircleCheck className="h-6 w-6 text-forest" strokeWidth={1.5} />
      <h2 className="mt-3 font-serif text-xl text-ink">
        {state.fulfillmentType === "shipping" ? "Reservierung erhalten" : "Buch reserviert"}
      </h2>

      <p className="mt-2 text-sm text-ink-muted">
        Deine Bestellnummer:{" "}
        <span className="font-medium text-ink">{state.orderNumber}</span>
      </p>

      <div className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between text-ink-muted">
          <span>Buch</span>
          <span>{formatPrice(0)}</span>
        </div>
        {state.fulfillmentType === "shipping" && (
          <div className="flex justify-between text-ink-muted">
            <span>Versand &amp; Verpackung</span>
            <span>{formatPrice(state.shippingPrice)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-line pt-1.5 font-medium text-ink">
          <span>Gesamt</span>
          <span>{formatPrice(state.total)}</span>
        </div>
      </div>

      {state.fulfillmentType === "pickup" ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          Dein Buch ist reserviert. Die Details zur Übergabe erhältst du separat per E-Mail.
        </p>
      ) : (
        <>
          {state.reservationExpiresAt && (
            <p className="mt-4 text-xs text-ink-faint">
              Deine Reservierung ist gültig bis {formatDate(state.reservationExpiresAt)} (
              {reservationHours} Std.). Bitte begleiche die Versandkosten rechtzeitig.
            </p>
          )}

          {paymentUrl && (
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-paper hover:bg-forest-soft"
            >
              Versand &amp; Verpackung bezahlen
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
            </a>
          )}

          <p className="mt-4 text-xs text-ink-faint">
            Wir bestätigen deinen Zahlungseingang manuell — der Status ändert sich erst nach
            Prüfung durch uns.
          </p>
        </>
      )}
    </div>
  );
}
