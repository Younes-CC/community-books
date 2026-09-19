import Link from "next/link";
import { cn } from "@/lib/cn";

const TABS = [
  { key: undefined, label: "Alle" },
  { key: "offen", label: "Zahlung offen" },
  { key: "bezahlt", label: "Bezahlt" },
  { key: "verpacken", label: "Zu verpacken" },
  { key: "versendet", label: "Versendet" },
  { key: "abholung", label: "Abholung" },
  { key: "abgeschlossen", label: "Abgeschlossen" },
  { key: "storniert", label: "Storniert" },
  { key: "abgelaufen", label: "Abgelaufen" },
] as const;

export function OrderFilterTabs({ active }: { active?: string }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {TABS.map((tab) => (
        <Link
          key={tab.label}
          href={tab.key ? `/admin/bestellungen?filter=${tab.key}` : "/admin/bestellungen"}
          className={cn(
            "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors",
            active === tab.key
              ? "border-forest bg-forest text-paper"
              : "border-line-strong text-ink-muted hover:border-ink hover:text-ink",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
