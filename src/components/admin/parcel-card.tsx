"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check } from "lucide-react";
import { setParcelClassAction } from "@/lib/actions/admin/orders";
import { parcelClassLabel } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function ParcelCard({
  orderId,
  estimateText,
  estimateOk,
  suggestedClass,
  override,
  locked,
}: {
  orderId: string;
  estimateText: string;
  estimateOk: boolean;
  suggestedClass: string;
  override: string | null;
  locked: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function save(cls: string | null) {
    setError(null);
    startTransition(async () => {
      const result = await setParcelClassAction(orderId, cls);
      if (!result.ok) setError(result.message);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-3 text-sm">
      <p className={estimateOk ? "flex gap-2 text-ink-muted" : "flex gap-2 text-sand"}>
        {estimateOk ? (
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" strokeWidth={2} />
        ) : (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
        )}
        <span>{estimateText}</span>
      </p>
      <p className="text-xs text-ink-faint">
        Nur eine Schätzung auf Basis der hinterlegten Buchmaße — maßgeblich sind die Außenmaße des fertig
        gepackten Kartons und die aktuellen Hermes-Bedingungen.
      </p>

      <p className="text-ink">
        Paketklasse für die E-Mail:{" "}
        <strong className="font-medium">
          {parcelClassLabel(override ?? suggestedClass)}
          {override ? " (manuell)" : " (automatisch)"}
        </strong>
      </p>

      {!locked && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {!override && (
            <Button type="button" size="sm" disabled={pending} onClick={() => save(suggestedClass)}>
              {parcelClassLabel(suggestedClass)} bestätigen
            </Button>
          )}
          {override && (
            <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => save(null)}>
              Automatik wiederherstellen
            </Button>
          )}
          {!override &&
            ["M", "L"].filter((c) => c !== suggestedClass).map((c) => (
              <Button key={c} type="button" size="sm" variant="secondary" disabled={pending} onClick={() => save(c)}>
                {parcelClassLabel(c)} wählen
              </Button>
            ))}
        </div>
      )}
      {error && <p className="text-sm text-brick">{error}</p>}
    </div>
  );
}
