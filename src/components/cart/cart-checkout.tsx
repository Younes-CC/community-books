"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { ArrowLeft, CircleCheck, MapPin, Truck, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import {
  createReservationAction,
  resolveCartBooksAction,
  type CartBookInfo,
  type ReservationState,
} from "@/lib/actions/reservation";
import { BookCover } from "@/components/books/book-cover";
import { LinkButton } from "@/components/ui/button";
import { COUNTRIES, type FulfillmentType } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

const initialState: ReservationState = { status: "idle" };

type Props = { hermesPrice: number; processingTimeText: string; pickupLocation: string };

export function CartCheckout({ hermesPrice, processingTimeText, pickupLocation }: Props) {
  const cart = useCart();
  const [fulfillment, setFulfillment] = useState<FulfillmentType | null>(null);
  const [state, formAction, pending] = useActionState(createReservationAction, initialState);
  const [availability, setAvailability] = useState<Record<string, CartBookInfo>>({});

  const idsKey = cart.items.map((i) => i.id).join(",");
  const refreshKey = state.status === "error" && state.refreshCart ? state.message : "";

  // Re-check which books in the cart can still be reserved (stock may have changed since adding).
  useEffect(() => {
    const ids = idsKey ? idsKey.split(",") : [];
    if (ids.length === 0) return;
    let cancelled = false;
    resolveCartBooksAction(ids)
      .then((books) => {
        if (!cancelled) setAvailability(Object.fromEntries(books.map((b) => [b.id, b])));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [idsKey, refreshKey]);

  const successKey = state.status === "success" ? state.orderNumber : null;
  useEffect(() => {
    if (successKey) cart.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successKey]);

  if (state.status === "success") {
    return <SuccessPanel state={state} processingTimeText={processingTimeText} pickupLocation={pickupLocation} />;
  }

  if (cart.count === 0) {
    return (
      <div className="rounded-md border border-dashed border-line-strong px-6 py-14 text-center">
        <h2 className="font-serif text-xl text-ink">Dein Warenkorb ist leer</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
          Wähle bis zu {cart.max} Bücher aus dem Katalog — alle kostenlos.
        </p>
        <div className="mt-6">
          <LinkButton href="/buecher">Bücher entdecken</LinkButton>
        </div>
      </div>
    );
  }

  const unavailable = cart.items.filter((i) => availability[i.id] && !availability[i.id].available);
  const canSubmit = unavailable.length === 0;

  return (
    <div className="space-y-10">
      <section aria-labelledby="cart-items">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="cart-items" className="font-serif text-xl text-ink">
            {cart.count} von {cart.max} Büchern ausgewählt
          </h2>
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: cart.max }).map((_, i) => (
              <span
                key={i}
                className={cn("h-1.5 w-6 rounded-full", i < cart.count ? "bg-forest" : "bg-line-strong")}
              />
            ))}
          </div>
        </div>

        <ul className="mt-4 divide-y divide-line border-y border-line">
          {cart.items.map((item) => {
            const info = availability[item.id];
            const gone = info && !info.available;
            return (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <div className="w-14 shrink-0 sm:w-16">
                  <BookCover imagePath={item.image_path} title={item.title} sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/buecher/${item.slug}`}
                    className="line-clamp-2 font-serif text-base leading-snug text-ink hover:text-forest"
                  >
                    {item.title}
                  </Link>
                  <p className={cn("mt-1 text-xs", gone ? "text-brick" : "text-ink-faint")}>
                    {gone ? "Leider nicht mehr verfügbar — bitte entfernen." : "1 Exemplar · kostenlos"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => cart.remove(item.id)}
                  aria-label={`${item.title} entfernen`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-paper-alt hover:text-brick"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          Pro Titel ist ein Exemplar möglich. Damit möglichst viele Menschen von dieser Aktion profitieren
          können, sind maximal drei Bücher pro Person vorgesehen.
        </p>
        {!cart.isFull && (
          <Link href="/buecher" className="mt-3 inline-block text-sm text-ink-muted underline hover:text-ink">
            Weitere Bücher ansehen
          </Link>
        )}
      </section>

      <section aria-labelledby="delivery">
        {!fulfillment ? (
          <>
            <h2 id="delivery" className="font-serif text-xl text-ink">
              Wie möchtest du deine Bücher erhalten?
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ChoiceCard
                icon={<Truck className="h-5 w-5 text-forest" strokeWidth={1.5} />}
                title="Hermes-Versand"
                onClick={() => setFulfillment("shipping")}
              >
                Die Bücher sind kostenlos. Den Hermes-Paketschein erstellst und bezahlst du selbst
                {hermesPrice > 0 ? ` (aktuell ca. ${formatPrice(hermesPrice)})` : ""} — wir senden dir dafür
                eine Anleitung.
              </ChoiceCard>
              <ChoiceCard
                icon={<MapPin className="h-5 w-5 text-forest" strokeWidth={1.5} />}
                title="Kostenlose Abholung"
                onClick={() => setFulfillment("pickup")}
              >
                Persönliche Abholung in {pickupLocation}. Keine Versandadresse nötig, keine Kosten.
              </ChoiceCard>
            </div>
          </>
        ) : (
          <form action={formAction}>
            {cart.items.map((i) => (
              <input key={i.id} type="hidden" name="bookId" value={i.id} />
            ))}
            <input type="hidden" name="fulfillmentType" value={fulfillment} />
            {/* honeypot — hidden from people, tempting for bots */}
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label>
                Website
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <button
              type="button"
              onClick={() => setFulfillment(null)}
              className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              Andere Übergabeart wählen
            </button>

            <h2 id="delivery" className="font-serif text-xl text-ink">
              {fulfillment === "shipping" ? "Hermes-Versand" : `Abholung in ${pickupLocation}`}
            </h2>

            {state.status === "error" && (
              <p role="alert" className="mt-3 rounded-md bg-brick-tint px-4 py-3 text-sm leading-relaxed text-brick">
                {state.message}
              </p>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Vorname" name="firstName" autoComplete="given-name" errors={fe(state, "firstName")} required />
              <Field label="Nachname" name="lastName" autoComplete="family-name" errors={fe(state, "lastName")} required />
              <Field
                label="E-Mail"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                errors={fe(state, "email")}
                className="sm:col-span-2"
                required
              />
              <Field
                label="Instagram / TikTok (optional)"
                name="socialUsername"
                autoComplete="off"
                errors={fe(state, "socialUsername")}
                className="sm:col-span-2"
              />

              {fulfillment === "shipping" && (
                <>
                  <Field label="Straße" name="street" autoComplete="address-line1" errors={fe(state, "street")} className="sm:col-span-2" required />
                  <Field label="Hausnummer" name="houseNumber" autoComplete="off" errors={fe(state, "houseNumber")} required />
                  <Field label="PLZ" name="postalCode" autoComplete="postal-code" inputMode="numeric" errors={fe(state, "postalCode")} required />
                  <Field label="Ort" name="city" autoComplete="address-level2" errors={fe(state, "city")} required />
                  <div>
                    <label className="mb-1.5 block text-sm text-ink-muted" htmlFor="country">
                      Land
                    </label>
                    <select
                      id="country"
                      name="country"
                      defaultValue={COUNTRIES[0]}
                      autoComplete="country-name"
                      className="min-h-12 w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
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
                <span>
                  {cart.count} {cart.count === 1 ? "Buch" : "Bücher"}
                </span>
                <span>{formatPrice(0)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-1.5 font-medium text-ink">
                <span>Gesamt</span>
                <span>{formatPrice(0)}</span>
              </div>
              <p className="pt-2 text-xs leading-relaxed text-ink-faint">
                {fulfillment === "shipping"
                  ? "Die Bücher sind kostenlos. Auf dieser Website erfolgt keine Zahlung — den Hermes-Paketschein erstellst und bezahlst du später selbst direkt bei Hermes, nachdem du unsere Anleitung erhalten hast."
                  : "Bei persönlicher Abholung entstehen keine Kosten."}
              </p>
            </div>

            <button
              type="submit"
              disabled={pending || !canSubmit}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-forest px-6 py-3 text-[0.95rem] font-medium text-paper transition-colors hover:bg-forest-soft disabled:opacity-50 sm:w-auto"
            >
              {pending ? "Wird reserviert…" : "Kostenlos reservieren"}
            </button>
            {!canSubmit && (
              <p className="mt-3 text-sm text-brick">Bitte entferne zuerst die nicht mehr verfügbaren Bücher.</p>
            )}
          </form>
        )}
      </section>
    </div>
  );
}

function fe(state: ReservationState, field: string): string[] | undefined {
  return state.status === "error" ? state.fieldErrors?.[field] : undefined;
}

function ChoiceCard({
  icon,
  title,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[7rem] flex-col items-start gap-3 rounded-md border border-line-strong p-5 text-left transition-colors hover:border-forest active:bg-paper-alt"
    >
      {icon}
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{children}</p>
      </div>
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  errors,
  className,
  autoComplete,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  errors?: string[];
  className?: string;
  autoComplete?: string;
  inputMode?: "email" | "numeric" | "text";
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
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={errors?.length ? true : undefined}
        className={cn(
          "min-h-12 w-full rounded-md border bg-paper px-3.5 py-2.5 text-sm text-ink focus:outline-none",
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
  processingTimeText,
  pickupLocation,
}: {
  state: Extract<ReservationState, { status: "success" }>;
  processingTimeText: string;
  pickupLocation: string;
}) {
  return (
    <div className="rounded-md border border-line bg-paper-alt p-6 sm:p-8">
      <CircleCheck className="h-7 w-7 text-forest" strokeWidth={1.5} />
      <h2 className="mt-3 font-serif text-2xl text-ink">Deine Bücher wurden reserviert.</h2>

      <p className="mt-3 text-sm text-ink-muted">
        Deine Bestellnummer: <span className="font-medium text-ink">{state.orderNumber}</span>
      </p>

      <ul className="mt-4 space-y-1 text-sm text-ink">
        {state.titles.map((t) => (
          <li key={t} className="flex gap-2">
            <span aria-hidden="true" className="text-ink-faint">
              •
            </span>
            {t}
          </li>
        ))}
      </ul>

      {state.fulfillmentType === "shipping" ? (
        <div className="mt-5 space-y-3 text-sm leading-relaxed text-ink-muted">
          <p>
            Du erhältst von uns eine E-Mail mit einer Anleitung, wie du deinen Hermes-Paketschein selbst
            erstellst und bezahlst.
          </p>
          <p className="font-medium text-ink">
            Bitte bestelle noch keinen Paketschein, bevor du unsere Anleitung erhalten hast.
          </p>
          <p>
            Die Bearbeitungszeit nach Eingang deines gültigen Paketscheins beträgt voraussichtlich{" "}
            {processingTimeText}.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3 text-sm leading-relaxed text-ink-muted">
          <p>
            Die Details zur Abholung (Abholort in {pickupLocation} und Termin) erhältst du nach Bestätigung
            deiner Reservierung per E-Mail.
          </p>
        </div>
      )}

      <p className="mt-5 text-xs text-ink-faint">
        Bitte schau auch in deinen Spam-Ordner, falls du unsere E-Mail nicht findest.
      </p>

      <div className="mt-6">
        <LinkButton href="/buecher" variant="secondary">
          Zurück zum Katalog
        </LinkButton>
      </div>
    </div>
  );
}
