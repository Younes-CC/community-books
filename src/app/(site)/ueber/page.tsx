import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "Über die Aktion" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-3xl text-ink">Über die Aktion</h1>

      <div className="mt-6 space-y-5 text-[1.02rem] leading-relaxed text-ink-muted">
        <p>
          Ich habe diese Bücher gekauft, um sie kostenlos weiterzugeben. Nicht, weil Bücher
          keinen Wert haben — sondern weil Wissen einen Wert hat.
        </p>
        <p>
          Die Idee ist einfach: Such dir ein Buch aus, lies es und nimm etwas daraus mit. Wenn
          es dir Mehrwert gebracht hat, gib dieses Wissen irgendwann selbst weiter.
        </p>
        <p>
          Die Bücher selbst sind immer kostenlos. Bei Versand übernimmst du lediglich die
          tatsächlichen Kosten für Verpackung und Porto — bei persönlicher Abholung fällt gar
          nichts an.
        </p>
      </div>

      <div className="mt-10">
        <LinkButton href="/buecher">Bücher entdecken</LinkButton>
      </div>
    </div>
  );
}
