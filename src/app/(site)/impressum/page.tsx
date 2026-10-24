import type { Metadata } from "next";
import { getPublicSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Impressum" };

function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-sand-tint px-1.5 py-0.5 font-medium text-sand">{children}</span>;
}

export default async function ImprintPage() {
  const { contactEmail } = await getPublicSettings();
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
      <h1 className="font-serif text-[1.65rem] text-ink [overflow-wrap:anywhere] sm:text-3xl">Impressum</h1>

      <div className="mt-8 space-y-8 text-[0.95rem] leading-relaxed text-ink-muted">
        <section>
          <h2 className="font-serif text-lg text-ink">Angaben gemäß § 5 DDG</h2>
          <p className="mt-2">
            <Placeholder>[Vor- und Nachname des Betreibers ergänzen]</Placeholder>
            <br />
            <Placeholder>[Ladungsfähige Anschrift (Straße, Hausnummer, PLZ, Ort) ergänzen]</Placeholder>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink">Kontakt</h2>
          <p className="mt-2">
            E-Mail:{" "}
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className="text-forest underline underline-offset-2">
                {contactEmail}
              </a>
            ) : (
              <Placeholder>[Kontakt-E-Mail ergänzen]</Placeholder>
            )}
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink">Verantwortlich für den Inhalt</h2>
          <p className="mt-2">
            <Placeholder>[Name und Anschrift der verantwortlichen Person ergänzen, sofern abweichend]</Placeholder>
          </p>
        </section>
      </div>
    </div>
  );
}
