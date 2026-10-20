import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { getPublicSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "FAQ" };

type Faq = { q: string; a: string };

const buildFaqs = (s: { pickupLocation: string; processingTimeText: string; qrDeadlineHours: number }): Faq[] => [
  {
    q: "Sind die Bücher wirklich kostenlos?",
    a: `Ja. Alle Bücher auf ${SITE_NAME} werden kostenlos verschenkt. Sie sind nicht zum Verkauf bestimmt.`,
  },
  {
    q: "Warum muss ich beim Versand etwas bezahlen?",
    a: "Du bezahlst nicht für das Buch, sondern lediglich den Versand: Den Hermes-Paketschein erstellst und bezahlst du selbst direkt bei Hermes. Auf dieser Website findet keine Zahlung statt.",
  },
  {
    q: "Wie funktioniert der Versand genau?",
    a: "Nach deiner Reservierung prüfen wir deine Bestellung und schicken dir per E-Mail eine Anleitung. Damit erstellst du deinen Paketschein bei Hermes und sendest uns den QR-Code bzw. Paketschein per E-Mail zurück. Wir verpacken die Bücher und geben das Paket bei Hermes ab.",
  },
  {
    q: "Kann ich ein Buch kostenlos abholen?",
    a: `Ja. Bei persönlicher Abholung in ${s.pickupLocation} fallen keine Kosten an. Den genauen Abholort und den Termin teilen wir dir nach Bestätigung deiner Reservierung per E-Mail mit.`,
  },
  {
    q: "Sind die Bücher gebraucht?",
    a: "Nein. Die Bücher sind neu und unbenutzt.",
  },
  {
    q: "Kann ich mehrere Bücher nehmen?",
    a: "Ja, bis zu drei verschiedene Titel pro Person, jeweils ein Exemplar. Damit möglichst viele Menschen von dieser Aktion profitieren können, sind maximal drei Bücher pro Person vorgesehen.",
  },
  {
    q: "Wie lange dauert es?",
    a: `Nach Eingang deines gültigen Hermes-Paketscheins beträgt die Bearbeitungszeit voraussichtlich ${s.processingTimeText}.`,
  },
  {
    q: "Was passiert, wenn ich mich nicht zurückmelde?",
    a: `Nachdem wir dir die Anleitung geschickt haben, bitten wir dich, den Paketschein innerhalb von ${s.qrDeadlineHours} Stunden zurückzusenden. Meldest du dich nicht, wird die Reservierung automatisch aufgehoben und die Bücher werden wieder für andere freigegeben.`,
  },
];

export default async function FaqPage() {
  const faqs = buildFaqs(await getPublicSettings());
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
      <h1 className="font-serif text-3xl text-ink">Häufige Fragen</h1>

      <dl className="mt-10 divide-y divide-line border-t border-line">
        {faqs.map((item) => (
          <div key={item.q} className="py-6">
            <dt className="font-serif text-lg leading-snug text-ink">{item.q}</dt>
            <dd className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
