import { LinkButton } from "@/components/ui/button";
import { GeometricMark } from "@/components/ui/geometric-mark";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <GeometricMark className="h-6 w-6 text-ink-faint" />
      <h1 className="mt-6 font-serif text-3xl text-ink">Seite nicht gefunden</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
        Diese Seite existiert nicht oder wurde verschoben. Vielleicht findest du dein Buch im
        Katalog.
      </p>
      <div className="mt-8">
        <LinkButton href="/buecher">Bücher entdecken</LinkButton>
      </div>
    </div>
  );
}
