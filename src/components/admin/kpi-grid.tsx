import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { AdminStats } from "@/lib/data/admin/stats";
import { cn } from "@/lib/cn";

export function KpiGrid({ stats, overdue, dueDays }: { stats: AdminStats; overdue: number; dueDays: number }) {
  const cards: { label: string; value: number; href: string }[] = [
    { label: "Anfragen", value: stats.requests, href: "/admin?status=new" },
    { label: "Anleitung gesendet", value: stats.instructionsSent, href: "/admin?status=mail_sent" },
    { label: "QR-Codes erhalten", value: stats.qrReceived, href: "/admin?status=qr_received" },
    { label: "Zu verpacken", value: stats.toPack, href: "/admin?status=qr_received" },
    { label: "Versendet", value: stats.shipped, href: "/admin?status=shipped" },
    { label: "Abholbereit", value: stats.pickupReady, href: "/admin?status=ready_for_pickup" },
  ];

  return (
    <div>
      {overdue > 0 && (
        <Link
          href="/admin?status=faellig"
          className="mb-4 flex items-start gap-3 rounded-md border border-brick/40 bg-brick-tint px-4 py-3 text-sm text-brick"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <span>
            <strong className="font-medium">
              {overdue} {overdue === 1 ? "Bestellung ist" : "Bestellungen sind"} fällig
            </strong>{" "}
            — die Anleitung wurde vor mehr als {dueDays} Tagen gesendet und es kam kein QR-Code. Prüfen und ggf. stornieren, dann werden
            die Bücher wieder frei.
          </span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={cn(
              "rounded-md border border-line bg-paper-alt px-4 py-3.5 transition-colors hover:border-forest",
              c.value === 0 && "opacity-70",
            )}
          >
            <p className="font-serif text-3xl text-ink">{c.value}</p>
            <p className="mt-0.5 text-xs leading-snug text-ink-muted">{c.label}</p>
          </Link>
        ))}
      </div>

      <p className="mt-3 text-sm text-ink-muted">
        <span className="font-medium text-ink">{stats.availableCopies} Exemplare</span> verfügbar
        <span className="text-ink-faint">
          {" "}
          · {stats.reservedCopies} reserviert · {stats.titles} Titel
        </span>
      </p>
    </div>
  );
}
