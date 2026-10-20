import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Über die Aktion" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
      <h1 className="font-serif text-3xl text-ink">Über die Aktion</h1>

      <div className="mt-6 space-y-5 text-[1.02rem] leading-relaxed text-ink-muted">
        <p>
          Mit {SITE_NAME} möchte ich islamisches Wissen kostenlos weitergeben.
        </p>
        <p>
          Such dir ein Buch aus, lies es und nimm etwas daraus mit. Wenn du daraus gelernt hast, gib
          dieses Wissen irgendwann selbst weiter.
        </p>
        <p>
          Die Bücher sind neu und unbenutzt — und ausdrücklich nicht zum Verkauf bestimmt. Damit möglichst
          viele Menschen von dieser Aktion profitieren können, sind maximal drei Bücher pro Person
          vorgesehen.
        </p>
        <p>
          Du kannst dir die Bücher per Hermes zuschicken lassen oder sie persönlich abholen. Beim Versand
          erstellst und bezahlst du deinen Hermes-Paketschein selbst — wir melden uns dafür per E-Mail mit
          einer Anleitung. Bei der Abholung entstehen keine Kosten.
        </p>
      </div>

      <div className="mt-10">
        <LinkButton href="/buecher">Bücher entdecken</LinkButton>
      </div>
    </div>
  );
}
