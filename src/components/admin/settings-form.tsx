"use client";

import { useActionState } from "react";
import { updateSettingsAction, type SettingsFormState } from "@/lib/actions/admin/settings";
import type { SettingsRow } from "@/lib/database.types";
import { PARCEL_CLASSES } from "@/lib/constants";
import { TEMPLATE_VARIABLES } from "@/lib/email-template";
import { cn } from "@/lib/cn";

const initialState: SettingsFormState = { status: "idle" };

const input =
  "min-h-11 w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-forest focus:outline-none";

export function SettingsForm({ settings, isOwner }: { settings: SettingsRow; isOwner: boolean }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, initialState);
  const fe = (name: string) => (state.status === "error" ? state.fieldErrors?.[name]?.[0] : undefined);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {state.status === "error" && (
        <p role="alert" className="rounded-md bg-brick-tint px-4 py-3 text-sm text-brick">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p role="status" className="rounded-md bg-forest-tint px-4 py-3 text-sm text-forest-soft">
          Einstellungen gespeichert.
        </p>
      )}

      <Card title="Kontakt & Hermes-Absender" hint="Die Projekt-E-Mail wird öffentlich als Kontakt angezeigt (Fußzeile, Datenschutz, Impressum). Absendername und Absenderadresse sind nicht öffentlich: Sie stehen nur hier und in der Hermes-Anleitung, die ihr selbst verschickt.">
        <Field label="Projekt-E-Mail (öffentlicher Kontakt & Absender)" name="projectEmail" type="email" defaultValue={settings.project_email ?? ""} error={fe("projectEmail")} placeholder="kontakt@…" />
        <Field label="Absendername (Hermes)" name="senderName" defaultValue={settings.sender_name ?? ""} error={fe("senderName")} />
        <Field label="Hermes-Absenderadresse: Straße und Hausnummer / Postfach" name="hermesSenderStreet" defaultValue={settings.hermes_sender_street ?? ""} error={fe("hermesSenderStreet")} />
        <Field label="Hermes-Absenderadresse: PLZ und Ort" name="hermesSenderZipCity" defaultValue={settings.hermes_sender_zip_city ?? ""} error={fe("hermesSenderZipCity")} />
      </Card>

      <Card title="Versand (Hermes)" hint="Hermes-Preise und Paketbedingungen ändern sich — hier anpassen, nichts ist fest im Code hinterlegt.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Aktueller Versandpreis (€, Richtwert)" name="hermesPrice" type="number" step="0.01" min="0" defaultValue={String(settings.shipping_price)} error={fe("hermesPrice")} />
          <div>
            <label className="mb-1.5 block text-sm text-ink-muted" htmlFor="defaultParcelClass">
              Standard-Paketklasse
            </label>
            <select id="defaultParcelClass" name="defaultParcelClass" defaultValue={settings.default_parcel_class} className={input}>
              {PARCEL_CLASSES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <Field label="S-Paket: max. längste + kürzeste Seite (cm)" name="hermesSMaxCm" type="number" min="10" defaultValue={String(settings.hermes_s_max_cm)} error={fe("hermesSMaxCm")} />
          <Field label="Verpackungszuschlag pro Seite (cm)" name="packagingPaddingCm" type="number" min="0" defaultValue={String(settings.packaging_padding_cm)} error={fe("packagingPaddingCm")} />
          <Field label="Bearbeitungszeit (Text, z. B. 7–21 Tage)" name="processingTimeText" defaultValue={settings.processing_time_text} error={fe("processingTimeText")} className="sm:col-span-2" />
        </div>
        <p className="text-xs leading-relaxed text-ink-faint">
          Die Größenprüfung schätzt den Karton aus den Buchmaßen (Bücher → Bücher-Admin). Hermes ordnet nach „längste + kürzeste Seite“
          (S-Paket aktuell bis 50 cm). Es bleibt eine Schätzung; im Zweifel wird die Bestellung zur manuellen Prüfung markiert.
        </p>
      </Card>

      <Card title="Fristen & automatische Abläufe">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Frist für den QR-Code (Stunden, ab „Mail versendet“)" name="qrDeadlineHours" type="number" min="1" defaultValue={String(settings.qr_deadline_hours)} error={fe("qrDeadlineHours")} />
          <Field label="Interne Bearbeitungsfrist für neue Bestellungen (Stunden)" name="internalProcessingHours" type="number" min="1" defaultValue={String(settings.internal_processing_hours)} error={fe("internalProcessingHours")} />
        </div>
        <div className="rounded-md border border-line bg-paper-alt p-4">
          <label className={cn("flex items-start gap-3", !isOwner && "opacity-60")}>
            <input
              type="checkbox"
              name="autoCancelEnabled"
              defaultChecked={settings.auto_cancel_unprocessed_enabled}
              disabled={!isOwner}
              className="mt-1 h-5 w-5 accent-[var(--forest)]"
            />
            <span className="text-sm text-ink">
              Unbearbeitete Reservierungen nach maximaler Frist automatisch stornieren
              <span className="mt-1 block text-xs text-ink-muted">
                Nur der Hauptadmin darf das aktivieren. Ohne Aktivierung werden unbearbeitete Bestellungen nie automatisch storniert — sie werden nur als überfällig markiert.
                {!isOwner && " Du bist nicht Hauptadmin."}
              </span>
            </span>
          </label>
          <div className="mt-3 max-w-xs">
            <Field label="Maximale Frist (Stunden)" name="autoCancelHours" type="number" min="1" defaultValue={String(settings.auto_cancel_unprocessed_hours)} error={fe("autoCancelHours")} />
          </div>
        </div>
      </Card>

      <Card title="Missbrauchsschutz" hint="Schützt vor automatisierten Massen-Reservierungen. Gespeichert wird nur ein täglich wechselnder, nicht rückrechenbarer Hash der Netzwerkadresse für maximal 24 Stunden. Die Standardwerte sind großzügig gewählt.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Versuche pro Netzwerk und Stunde" name="rateLimitAttemptsPerHour" type="number" min="1" defaultValue={String(settings.rate_limit_attempts_per_hour)} error={fe("rateLimitAttemptsPerHour")} />
          <Field label="Reservierungen pro Netzwerk und Tag" name="rateLimitOrdersPerIpDay" type="number" min="1" defaultValue={String(settings.rate_limit_orders_per_ip_day)} error={fe("rateLimitOrdersPerIpDay")} />
          <Field label="Neue Reservierungen insgesamt pro Stunde" name="rateLimitOrdersGlobalHour" type="number" min="1" defaultValue={String(settings.rate_limit_orders_global_hour)} error={fe("rateLimitOrdersGlobalHour")} />
        </div>
        <p className="text-xs leading-relaxed text-ink-faint">
          Mehrere Personen im selben WLAN (z. B. bei einer Veranstaltung) teilen sich eine Netzwerkadresse — bei Bedarf die Werte erhöhen.
        </p>
      </Card>

      <Card title="Abholung" hint="Die genaue Adresse ist nur hier hinterlegt und wird erst in der Abhol-E-Mail mitgeteilt.">
        <Field label="Öffentlicher Abholort (z. B. Stadt)" name="pickupPublicLocation" defaultValue={settings.pickup_public_location} error={fe("pickupPublicLocation")} />
        <Field label="Abholadresse (privat, nur für Admins)" name="pickupAddress" defaultValue={settings.pickup_address ?? ""} error={fe("pickupAddress")} />
        <Area label="Abholanweisungen" name="pickupInstructions" rows={3} defaultValue={settings.pickup_instructions ?? ""} error={fe("pickupInstructions")} />
        <div className="max-w-xs">
          <Field label="Standard-Abholfrist (Tage)" name="pickupDeadlineDays" type="number" min="1" defaultValue={String(settings.pickup_deadline_days)} error={fe("pickupDeadlineDays")} />
        </div>
      </Card>

      <Card title="E-Mail-Vorlagen" hint="Platzhalter werden beim Vorbereiten der E-Mail automatisch ersetzt.">
        <details className="rounded-md border border-line bg-paper-alt px-4 py-3 text-sm">
          <summary className="min-h-8 cursor-pointer text-ink">Verfügbare Platzhalter anzeigen</summary>
          <ul className="mt-3 space-y-1 text-xs text-ink-muted">
            {TEMPLATE_VARIABLES.map(([key, desc]) => (
              <li key={key}>
                <code className="rounded bg-paper px-1.5 py-0.5 text-ink">{key}</code> — {desc}
              </li>
            ))}
          </ul>
        </details>
        <Area label="Hermes-Anleitung (die Schritte)" name="hermesInstructions" rows={10} defaultValue={settings.hermes_instructions} error={fe("hermesInstructions")} />
        <Field label="Hermes-E-Mail: Betreff" name="hermesEmailSubject" defaultValue={settings.hermes_email_subject} error={fe("hermesEmailSubject")} />
        <Area label="Hermes-E-Mail: Text" name="hermesEmailBody" rows={16} defaultValue={settings.hermes_email_body} error={fe("hermesEmailBody")} />
        <Field label="Abhol-E-Mail: Betreff" name="pickupEmailSubject" defaultValue={settings.pickup_email_subject} error={fe("pickupEmailSubject")} />
        <Area label="Abhol-E-Mail: Text" name="pickupEmailBody" rows={12} defaultValue={settings.pickup_email_body} error={fe("pickupEmailBody")} />
      </Card>

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-paper/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full rounded-full bg-forest px-8 text-sm font-medium text-paper transition-colors hover:bg-forest-soft disabled:opacity-50 sm:w-auto"
        >
          {pending ? "Wird gespeichert…" : "Einstellungen speichern"}
        </button>
      </div>
    </form>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-md border border-line p-4 sm:p-5">
      <div>
        <h2 className="font-serif text-lg text-ink">{title}</h2>
        {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  className,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "type" | "defaultValue" | "className">) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm text-ink-muted" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} className={cn(input, error && "border-brick")} {...rest} />
      {error && <p className="mt-1 text-xs text-brick">{error}</p>}
    </div>
  );
}

function Area({
  label,
  name,
  rows,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  rows: number;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-ink-muted" htmlFor={name}>
        {label}
      </label>
      <textarea id={name} name={name} rows={rows} defaultValue={defaultValue} className={cn(input, "font-sans leading-relaxed", error && "border-brick")} />
      {error && <p className="mt-1 text-xs text-brick">{error}</p>}
    </div>
  );
}
