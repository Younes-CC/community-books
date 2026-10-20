import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Datenschutz" };

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-sand-tint px-1.5 py-0.5 font-medium text-sand">{children}</span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-lg text-ink">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
      <h1 className="font-serif text-[1.65rem] text-ink [overflow-wrap:anywhere] sm:text-3xl">Datenschutzerklärung</h1>
      <p className="mt-3 text-sm text-ink-faint">
        Stand: <Placeholder>[Datum ergänzen]</Placeholder>
      </p>

      <div className="mt-8 space-y-8 text-[0.95rem] leading-relaxed text-ink-muted">
        <Section title="1. Verantwortliche Stelle">
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Website ist der Betreiber von {SITE_NAME},
            erreichbar unter:
          </p>
          <p>
            <Placeholder>[Kontakt-E-Mail-Adresse ergänzen]</Placeholder>
          </p>
        </Section>

        <Section title="2. Welche Daten wir verarbeiten">
          <p>Wenn du Bücher über {SITE_NAME} reservierst, verarbeiten wir:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Vorname und Nachname</li>
            <li>E-Mail-Adresse</li>
            <li>optional: Instagram- oder TikTok-Nutzername</li>
            <li>bei Hermes-Versand: Straße, Hausnummer, PLZ, Ort und Land</li>
            <li>
              Angaben zur Reservierung (gewählte Bücher, Übergabeart, Status, Zeitpunkte und interne
              Bearbeitungsvermerke)
            </li>
            <li>
              den Schriftverkehr per E-Mail zu deiner Reservierung, insbesondere den von dir übermittelten
              Hermes-Paketschein bzw. QR-Code
            </li>
          </ul>
          <p>
            Die Anzahl der Bücher pro Person ist begrenzt. Um mehrfache Reservierungen derselben Person zu
            erkennen, vergleichen wir bereits angegebene Daten (E-Mail-Adresse sowie bei Versand Name und
            Anschrift) mit bestehenden Reservierungen. Eine Identitätsprüfung findet nicht statt; zusätzliche
            Daten werden dafür nicht erhoben.
          </p>
        </Section>

        <Section title="3. Zweck der Verarbeitung">
          <p>
            Wir verwenden diese Daten ausschließlich, um deine Reservierung zu bearbeiten, dich zum Versand
            oder zur Abholung zu kontaktieren, Hermes-Pakete zu versenden und die Begrenzung der Bücher pro
            Person umzusetzen. Reservierungen werden außerdem automatisch aufgehoben, wenn die genannten
            Fristen nicht eingehalten werden.
          </p>
        </Section>

        <Section title="4. Versand mit Hermes">
          <p>
            Beim Versand erstellst und bezahlst du den Hermes-Paketschein selbst und gibst dabei deine
            Empfängeradresse bei Hermes an. Wir erhalten von dir den Paketschein bzw. QR-Code und geben das
            Paket bei Hermes ab. Auf dieser Website findet keine Zahlungsabwicklung statt, wir erheben dort
            keine Zahlungsdaten.
          </p>
        </Section>

        <Section title="5. Fragebogen und Warenkorb">
          <p>
            Die Antworten des Buchempfehlungs-Fragebogens werden ausschließlich in deinem Browser
            ausgewertet und weder gespeichert noch an uns übermittelt. In deinem Browser speichern wir lokal
            (localStorage), ob du den Fragebogen bereits gesehen hast, sowie den Inhalt deines Warenkorbs.
            Diese Angaben verlassen dein Gerät erst, wenn du eine Reservierung abschickst.
          </p>
        </Section>

        <Section title="6. Technische Infrastruktur">
          <p>
            Diese Website nutzt Supabase (Datenbank, Authentifizierung und Dateispeicher) zur Speicherung der
            oben genannten Daten sowie Vercel zum Hosting. Beide Anbieter verarbeiten Daten in unserem
            Auftrag. Zugriff auf die Reservierungsdaten haben ausschließlich die beiden Administratoren des
            Projekts.
          </p>
        </Section>

        <Section title="7. Speicherdauer und Löschung">
          <p>
            Deine Daten werden gespeichert, solange dies zur Abwicklung deiner Reservierung erforderlich ist,
            und anschließend gelöscht bzw. anonymisiert, sofern keine gesetzlichen Aufbewahrungspflichten
            entgegenstehen. <Placeholder>[Konkrete Aufbewahrungsfrist ergänzen, falls erforderlich]</Placeholder>
          </p>
        </Section>

        <Section title="8. Deine Rechte">
          <p>
            Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung deiner
            personenbezogenen Daten sowie das Recht auf Datenübertragbarkeit. Wende dich dazu an die oben
            genannte E-Mail-Adresse.
          </p>
        </Section>
      </div>
    </div>
  );
}
