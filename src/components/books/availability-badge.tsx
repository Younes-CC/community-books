import { cn } from "@/lib/cn";

export function AvailabilityBadge({
  stockAvailable,
  className,
}: {
  stockAvailable: number;
  className?: string;
}) {
  if (stockAvailable <= 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint",
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
        Vergriffen
      </span>
    );
  }

  if (stockAvailable === 1) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium text-sand",
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-sand" />
        Nur noch 1 verfügbar
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium text-forest-soft",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-forest-soft" />
      Verfügbar
    </span>
  );
}
