import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "FAQ" };

const FAQS = [
  {
    q: "Sind die Bücher wirklich kostenlos?",
    a: `Ja. Alle Bücher auf ${SITE_NAME} werden kostenlos verschenkt.`,
  },
  {
    q: "Warum muss ich beim Versand bezahlen?",
    a: "Du bezahlst nicht für das Buch, sondern lediglich Versand und Verpackung.",
  },
  {
    q: "Kann ich ein Buch kostenlos abholen?",
    a: "Ja. Bei persönlicher Abholung fallen keine Versandkosten an.",
  },
  {
    q: "Sind die Bücher gebraucht?",
    a: "Nein. Die angebotenen Bücher wurden neu gekauft, um sie über diese Aktion weiterzugeben.",
  },
  {
    q: "Kann ich mehrere Bücher nehmen?",
    a: "Für Version 1 bleibt es bei maximal einem Buch pro Bestellung, damit möglichst viele Menschen in der Community die Chance auf ein Buch haben.",
  },
  {
    q: "Wie erfahre ich, ob meine Zahlung angekommen ist?",
    a: "Zahlungseingänge werden manuell geprüft und bestätigt. Bitte habe dafür etwas Geduld.",
  },
  {
    q: "Was passiert, wenn ich nicht rechtzeitig bezahle?",
    a: "Reservierungen mit offener Zahlung sind zeitlich begrenzt gültig. Läuft die Frist ab, wird das Buch automatisch wieder für andere freigegeben.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-3xl text-ink">Häufige Fragen</h1>

      <dl className="mt-10 divide-y divide-line border-t border-line">
        {FAQS.map((item) => (
          <div key={item.q} className="py-6">
            <dt className="font-serif text-lg text-ink">{item.q}</dt>
            <dd className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
