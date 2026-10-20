export const TEMPLATE_VARIABLES = [
  ["{{order_number}}", "Bestellnummer"],
  ["{{recipient_name}}", "Name des Empfängers"],
  ["{{books}}", "Liste der reservierten Bücher"],
  ["{{parcel_class}}", "Paketklasse der Bestellung"],
  ["{{sender_name}}", "Hermes-Absendername"],
  ["{{sender_street}}", "Hermes-Absender Straße"],
  ["{{sender_zip_city}}", "Hermes-Absender PLZ und Ort"],
  ["{{contact_email}}", "Projekt-E-Mail"],
  ["{{qr_deadline_hours}}", "Frist für den QR-Code in Stunden"],
  ["{{processing_time}}", "Bearbeitungszeit nach Eingang des Paketscheins"],
  ["{{anleitung}}", "Hermes-Anleitung (nur in der E-Mail-Vorlage)"],
  ["{{pickup_address}}", "Abholadresse (nur Abholung)"],
  ["{{pickup_instructions}}", "Abholhinweise (nur Abholung)"],
  ["{{pickup_appointment}}", "Abholtermin (nur Abholung)"],
  ["{{pickup_deadline}}", "Abholfrist (nur Abholung)"],
] as const;

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (match, key: string) =>
    key in vars ? vars[key] : match,
  );
}

export type MailDraft = { to: string; subject: string; body: string };

export function mailtoHref({ to, subject, body }: MailDraft): string {
  const crlf = body.replace(/\r?\n/g, "\r\n");
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(crlf)}`;
}

export function gmailHref({ to, subject, body }: MailDraft): string {
  const q = new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body });
  return `https://mail.google.com/mail/?${q.toString()}`;
}
