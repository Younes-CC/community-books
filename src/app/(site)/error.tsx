"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-xl text-ink">Etwas ist schiefgelaufen</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        Diese Seite konnte nicht geladen werden. Bitte versuche es erneut.
      </p>
      <Button type="button" onClick={reset} className="mt-6">
        Erneut versuchen
      </Button>
    </div>
  );
}
