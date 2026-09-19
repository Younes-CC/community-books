import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "Über die Aktion" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-3xl text-ink">Über die Aktion</h1>

      <div className="mt-6 space-y-5 text-[1.02rem] leading-relaxed text-ink-muted">
        <p>
          Über die Jahre ist eine große persönliche Bibliothek zusammengekommen — mehr Bücher,
          als ich selbst je wieder lesen werde. Statt sie ungenutzt im Regal stehen zu lassen,
          gebe ich einen Teil davon kostenlos an meine Community weiter.
        </p>
        <p>
          Die Bücher werden nicht verkauft. Jedes Buch auf dieser Seite ist kostenlos. Bei
          Versand übernimmst du lediglich die tatsächlichen Kosten für Verpackung und Porto —
          nicht mehr.
        </p>
        <p>
          Die Idee dahinter ist einfach: Wissen gewinnt an Wert, wenn es weitergegeben wird.
          Wer ein Buch mitnimmt, ist eingeladen, es später selbst weiterzugeben — an jemanden,
          der es gerade braucht.
        </p>
      </div>

      <div className="mt-10">
        <LinkButton href="/buecher">Bücher entdecken</LinkButton>
      </div>
    </div>
  );
}
