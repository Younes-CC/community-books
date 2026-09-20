"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
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
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="max-w-sm text-center">
        <h1 className="font-serif text-xl text-ink">Etwas ist schiefgelaufen</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Diese Aktion konnte nicht ausgeführt werden. Bitte versuche es erneut.
        </p>
        <Button type="button" onClick={reset} className="mt-6">
          Erneut versuchen
        </Button>
      </div>
    </div>
  );
}
