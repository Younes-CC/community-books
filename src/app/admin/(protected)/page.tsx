import type { Metadata } from "next";
import Link from "next/link";
import { getAdminStats } from "@/lib/data/admin/stats";

export const metadata: Metadata = { title: "Übersicht — Admin" };

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Bücher insgesamt", value: stats.totalBooks },
    { label: "Verfügbare Exemplare", value: stats.availableCopies },
    { label: "Reservierte Exemplare", value: stats.reservedCopies },
    { label: "Offene Zahlungen", value: stats.paymentPending, href: "/admin/bestellungen?filter=offen" },
    { label: "Versand vorzubereiten", value: stats.toPack, href: "/admin/bestellungen?filter=bezahlt" },
    { label: "Versendet", value: stats.shipped, href: "/admin/bestellungen?filter=versendet" },
    { label: "Offene Abholungen", value: stats.pickupOpen, href: "/admin/bestellungen?filter=abholung" },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Übersicht</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => {
          const content = (
            <>
              <p className="text-3xl font-medium text-ink">{card.value}</p>
              <p className="mt-1 text-sm text-ink-muted">{card.label}</p>
            </>
          );
          return card.href ? (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-md border border-line bg-paper-alt p-5 transition-colors hover:border-forest"
            >
              {content}
            </Link>
          ) : (
            <div key={card.label} className="rounded-md border border-line bg-paper-alt p-5">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
