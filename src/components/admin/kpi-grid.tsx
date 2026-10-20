import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { AdminStats } from "@/lib/data/admin/stats";
import { cn } from "@/lib/cn";

export function KpiGrid({ stats }: { stats: AdminStats }) {
  const cards: { label: string; value: number; href: string; hint?: string }[] = [
    { label: "Neue Bestellungen", value: stats.newOrders, href: "/admin?status=new" },
    { label: "Mail ausstehend", value: stats.mailPending, href: "/admin?status=new&type=shipping", hint: "Hermes" },
    { label: "QR-Code ausstehend", value: stats.qrPending, href: "/admin?status=mail_sent" },
    { label: "QR-Code erhalten", value: stats.qrReceived, href: "/admin?status=qr_received" },
    { label: "In Bearbeitung", value: stats.processing, href: "/admin?status=processing" },
    { label: "Versandbereit", value: stats.readyToShip, href: "/admin?status=packed" },
    { label: "Versendet", value: stats.shipped, href: "/admin?status=shipped" },
    { label: "Abholung", value: stats.pickupOpen, href: "/admin?type=pickup&status=aktiv", hint: "offen" },
    { label: "Abgelaufen", value: stats.expired, href: "/admin?status=expired" },
  ];

  return (
    <div>
      {stats.overdue > 0 && (
        <Link
          href="/admin?overdue=1"
          className="mb-4 flex items-start gap-3 rounded-md border border-brick/40 bg-brick-tint px-4 py-3 text-sm text-brick"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <span>
            <strong className="font-medium">
              {stats.overdue} {stats.overdue === 1 ? "Bestellung ist" : "Bestellungen sind"} überfällig
            </strong>{" "}
            — die interne Bearbeitungsfrist ist abgelaufen und die Empfänger haben noch keine Anleitung.
          </span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-9">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={cn(
              "rounded-md border border-line bg-paper-alt px-4 py-3.5 transition-colors hover:border-forest",
              c.value === 0 && "opacity-70",
            )}
          >
            <p className="font-serif text-2xl text-ink">{c.value}</p>
            <p className="mt-0.5 text-xs leading-snug text-ink-muted">{c.label}</p>
            {c.hint && <p className="text-[11px] text-ink-faint">{c.hint}</p>}
          </Link>
        ))}
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        Bestand: {stats.titles} Titel · {stats.availableCopies} Exemplare verfügbar · {stats.reservedCopies} reserviert
      </p>
    </div>
  );
}
