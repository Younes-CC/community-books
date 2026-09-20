"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setBookActiveAction, deleteBookAction } from "@/lib/actions/admin/books";

export function BookRowActions({ bookId, isActive }: { bookId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function runToggle() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await setBookActiveAction(bookId, !isActive);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        router.refresh();
      } catch {
        setError("Aktion fehlgeschlagen. Bitte erneut versuchen.");
      }
    });
  }

  function runDelete() {
    if (!confirm("Dieses Buch wirklich löschen?")) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteBookAction(bookId);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        router.refresh();
      } catch {
        setError("Aktion fehlgeschlagen. Bitte erneut versuchen.");
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-3 text-sm">
        <button
          type="button"
          disabled={isPending}
          onClick={runToggle}
          className="text-ink-muted hover:text-ink"
        >
          {isActive ? "Deaktivieren" : "Aktivieren"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={runDelete}
          className="text-brick hover:opacity-80"
        >
          Löschen
        </button>
      </div>
      {error && <p className="mt-1 text-right text-xs text-brick">{error}</p>}
    </div>
  );
}
