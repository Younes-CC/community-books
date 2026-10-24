import type { MailDraft } from "@/lib/email-template";

// Seam for automatic sending. Today mails are sent by hand: an admin opens the prepared draft in
// their own mail program, sends it and then confirms with "Mail als versendet markieren"
// (markMailSentAction -> admin_mark_mail_sent), which is what starts the QR-code deadline.
//
// To automate later without touching the order flow:
//   1. implement MailTransport (e.g. SMTP with credentials only in server-side environment
//      variables, never in the database or the repository),
//   2. return it from getMailTransport(),
//   3. in markMailSentAction call transport.send(draft) first and call admin_mark_mail_sent only
//      when it reports ok — so the 72-hour deadline still starts only after a successful send.
export type MailTransport = {
  send(draft: MailDraft): Promise<{ ok: true } | { ok: false; message: string }>;
};

// null = manual mode (current behaviour): nothing is sent automatically.
export function getMailTransport(): MailTransport | null {
  return null;
}
