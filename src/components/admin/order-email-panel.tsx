"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Copy, Mail } from "lucide-react";
import { markMailSentAction } from "@/lib/actions/admin/orders";
import { gmailHref, mailtoHref, type MailDraft } from "@/lib/email-template";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export function OrderEmailPanel({
  orderId,
  kind,
  status,
  draft,
  warnings,
  blockedReason,
  mailSentAt,
  senderEmail,
  qrDeadlineHours,
}: {
  orderId: string;
  kind: "hermes" | "pickup";
  status: string;
  draft: MailDraft;
  warnings: string[];
  blockedReason: string | null;
  mailSentAt: string | null;
  senderEmail: string | null;
  qrDeadlineHours: number;
}) {
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const final = ["completed", "cancelled", "expired"].includes(status);
  const canMarkSent = kind === "hermes" ? status === "new" : !mailSentAt && !final;
  const blocked = blockedReason !== null;

  async function copy(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  function markSent() {
    const message =
      kind === "hermes"
        ? `Hast du die Anleitung an ${draft.to} wirklich abgeschickt?\n\nErst jetzt beginnt die ${qrDeadlineHours}-Stunden-Frist für den QR-Code.`
        : `Hast du die Abhol-E-Mail an ${draft.to} wirklich abgeschickt?`;
    if (!confirm(message)) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await markMailSentAction(orderId);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        router.refresh();
      } catch {
        setError("Aktion fehlgeschlagen. Bitte erneut versuchen.");
      }
    });
  }

  return (
    <div id="email" className="scroll-mt-24 rounded-md border border-line p-4 sm:p-5">
      <h2 className="font-serif text-lg text-ink">
        {kind === "hermes" ? "Versandanleitung vorbereiten" : "Abhol-E-Mail vorbereiten"}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        {senderEmail
          ? `Bitte aus dem Postfach ${senderEmail} senden.`
          : "Tipp: Hinterlege in den Einstellungen die Projekt-E-Mail-Adresse."}{" "}
        Das Öffnen des Entwurfs gilt <strong className="font-medium">nicht</strong> als gesendet.
      </p>

      {mailSentAt && (
        <p className="mt-3 flex items-center gap-2 rounded-md bg-forest-tint px-3 py-2 text-sm text-forest">
          <Check className="h-4 w-4 shrink-0" strokeWidth={2} />
          Als versendet markiert am {formatDate(mailSentAt)}.
        </p>
      )}

      {blocked && (
        <p className="mt-3 flex items-start gap-2 rounded-md bg-sand-tint px-3 py-2 text-sm text-sand">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          {blockedReason}
        </p>
      )}
      {warnings.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-md bg-sand-tint px-3 py-2 text-sm text-sand">
          {warnings.map((w) => (
            <li key={w} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              {w}
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-faint">An</dt>
          <dd className="break-all text-ink">{draft.to}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-faint">Betreff</dt>
          <dd className="text-ink">{draft.subject}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-faint">Nachricht</dt>
          <dd>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md border border-line bg-paper-alt p-3 font-sans text-[0.85rem] leading-relaxed text-ink-muted">
              {draft.body}
            </pre>
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {blocked ? (
          <Button type="button" disabled className="w-full sm:w-auto">
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            E-Mail-Programm öffnen
          </Button>
        ) : (
          <a
            href={mailtoHref(draft)}
            onClick={() => setOpened(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest px-6 text-[0.95rem] font-medium text-paper hover:bg-forest-soft"
          >
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            E-Mail-Programm öffnen
          </a>
        )}
        {!blocked && (
          <a
            href={gmailHref(draft, senderEmail)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpened(true)}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line-strong px-6 text-[0.95rem] text-ink hover:border-ink"
          >
            In Gmail öffnen
          </a>
        )}
        <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => copy("subject", draft.subject)}>
          <Copy className="h-4 w-4" strokeWidth={1.5} />
          {copied === "subject" ? "Kopiert" : "Betreff kopieren"}
        </Button>
        <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => copy("body", draft.body)}>
          <Copy className="h-4 w-4" strokeWidth={1.5} />
          {copied === "body" ? "Kopiert" : "Text kopieren"}
        </Button>
      </div>

      {canMarkSent && (
        <div className="mt-5 rounded-md border border-line bg-paper-alt p-4">
          <p className="text-sm text-ink-muted">
            {opened
              ? "Entwurf geöffnet. Hast du die E-Mail abgeschickt? Dann bestätige das hier — erst dadurch wird der Status gesetzt"
              : "Nach dem Abschicken bitte bestätigen — erst dadurch wird der Status gesetzt"}
            {kind === "hermes" ? ` und die ${qrDeadlineHours}-Stunden-Frist gestartet.` : "."}
          </p>
          <Button type="button" className="mt-3 w-full sm:w-auto" disabled={pending} onClick={markSent}>
            {kind === "hermes" ? "Mail als versendet markieren" : "Abhol-Mail als versendet markieren"}
          </Button>
          {error && (
            <p role="alert" className="mt-2 text-sm text-brick">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
