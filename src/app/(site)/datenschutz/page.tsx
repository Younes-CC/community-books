import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Datenschutz" };

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-sand-tint px-1.5 py-0.5 font-medium text-sand">
      {children}
    </span>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-3xl text-ink">Datenschutzerklärung</h1>
      <p className="mt-3 text-sm text-ink-faint">
        Stand: <Placeholder>[Datum ergänzen]</Placeholder>
      </p>

      <div className="mt-8 space-y-8 text-[0.95rem] leading-relaxed text-ink-muted">
        <section>
          <h2 className="font-serif text-lg text-ink">1. Verantwortliche Stelle</h2>
          <p className="mt-2">
            Verantwortlich für die Datenverarbeitung auf dieser Website ist der Betreiber von{" "}
            {SITE_NAME}, erreichbar unter:
          </p>
          <p className="mt-2">
            <Placeholder>[Kontakt-E-Mail-Adresse ergänzen]</Placeholder>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink">2. Welche Daten wir verarbeiten</h2>
          <p className="mt-2">
            Wenn du über {SITE_NAME} ein Buch reservierst oder bestellst, verarbeiten wir
            folgende Daten:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Vorname und Nachname</li>
            <li>E-Mail-Adresse</li>
            <li>optional: Instagram- oder TikTok-Nutzername</li>
            <li>bei Versand: Straße, Hausnummer, PLZ, Ort und Land</li>
            <li>Angaben zur Bestellung (gewähltes Buch, Übergabeart, Status)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink">3. Zweck der Verarbeitung</h2>
          <p className="mt-2">
            Diese Daten werden ausschließlich verwendet, um deine Reservierung bzw. Bestellung
            zu bearbeiten, dich zur Übergabe oder zum Versand zu kontaktieren und im Falle des
            Versands eine Zahlung der Versandkosten zuzuordnen.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink">4. Technische Infrastruktur</h2>
          <p className="mt-2">
            Diese Website nutzt Supabase (Datenbank, Authentifizierung und Dateispeicher) als
            technischen Dienstleister zur Speicherung der oben genannten Daten sowie Vercel zum
            Hosting der Website. Beide Anbieter verarbeiten die Daten ausschließlich in unserem
            Auftrag.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink">5. Speicherdauer und Löschung</h2>
          <p className="mt-2">
            Deine Daten werden gespeichert, solange dies zur Abwicklung deiner Bestellung
            erforderlich ist, und anschließend gelöscht bzw. anonymisiert, sofern keine
            gesetzlichen Aufbewahrungspflichten entgegenstehen.{" "}
            <Placeholder>[Konkrete Aufbewahrungsfrist ergänzen, falls erforderlich]</Placeholder>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink">6. Deine Rechte</h2>
          <p className="mt-2">
            Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der
            Verarbeitung deiner personenbezogenen Daten sowie das Recht auf
            Datenübertragbarkeit. Wende dich dazu an die oben genannte E-Mail-Adresse.
          </p>
        </section>
      </div>
    </div>
  );
}
