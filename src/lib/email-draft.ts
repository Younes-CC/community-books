import { renderTemplate, type MailDraft } from "@/lib/email-template";
import { formatDate } from "@/lib/format";
import { parcelClassLabel } from "@/lib/constants";
import type { OrderRow, SettingsRow } from "@/lib/database.types";

export type DraftResult = {
  draft: MailDraft;
  warnings: string[];
};

const MISSING = "[bitte in den Einstellungen ergänzen]";

export function buildDraft(args: {
  order: OrderRow;
  titles: string[];
  settings: SettingsRow;
  parcelClass: string;
}): DraftResult {
  const { order, titles, settings, parcelClass } = args;
  const isPickup = order.fulfillment_type === "pickup";
  const warnings: string[] = [];

  const need = (value: string | null | undefined, label: string) => {
    if (value && value.trim()) return value.trim();
    warnings.push(`${label} fehlt in den Einstellungen.`);
    return MISSING;
  };

  const vars: Record<string, string> = {
    order_number: order.order_number,
    recipient_name: `${order.first_name} ${order.last_name}`,
    books: titles.map((t) => `• ${t}`).join("\n"),
    parcel_class: parcelClassLabel(parcelClass),
    contact_email: settings.project_email?.trim() || MISSING,
    qr_deadline_hours: String(settings.qr_deadline_hours),
    processing_time: settings.processing_time_text,
  };

  if (!isPickup) {
    vars.sender_name = need(settings.sender_name, "Hermes-Absendername");
    vars.sender_street = need(settings.hermes_sender_street, "Hermes-Absender Straße");
    vars.sender_zip_city = need(settings.hermes_sender_zip_city, "Hermes-Absender PLZ/Ort");
    if (!settings.project_email?.trim()) warnings.push("Projekt-E-Mail fehlt in den Einstellungen.");
    vars.anleitung = renderTemplate(settings.hermes_instructions, vars);
  } else {
    vars.pickup_address = need(settings.pickup_address, "Abholadresse");
    vars.pickup_instructions = settings.pickup_instructions?.trim() || "";
    vars.pickup_appointment = order.pickup_appointment_at
      ? formatDate(order.pickup_appointment_at)
      : "wird dir noch mitgeteilt";
    vars.pickup_deadline = order.pickup_deadline_at ? formatDate(order.pickup_deadline_at) : "—";
  }

  const subject = renderTemplate(isPickup ? settings.pickup_email_subject : settings.hermes_email_subject, vars);
  const body = renderTemplate(isPickup ? settings.pickup_email_body : settings.hermes_email_body, vars);

  if (/\{\{[^}]*\}\}/.test(subject + body)) {
    warnings.push("Die Vorlage enthält unbekannte Platzhalter ({{…}}).");
  }

  return { draft: { to: order.email, subject, body }, warnings };
}
