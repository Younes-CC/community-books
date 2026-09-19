import Link from "next/link";
import { cn } from "@/lib/cn";

export function CategoryFilter({
  categories,
  active,
  q,
}: {
  categories: string[];
  active?: string;
  q?: string;
}) {
  const buildHref = (category?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("kategorie", category);
    const qs = params.toString();
    return qs ? `/buecher?${qs}` : "/buecher";
  };

  const pillClass = (isActive: boolean) =>
    cn(
      "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors",
      isActive
        ? "border-forest bg-forest text-paper"
        : "border-line-strong text-ink-muted hover:border-ink hover:text-ink",
    );

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Link href={buildHref(undefined)} className={pillClass(!active)}>
        Alle
      </Link>
      {categories.map((category) => (
        <Link key={category} href={buildHref(category)} className={pillClass(active === category)}>
          {category}
        </Link>
      ))}
    </div>
  );
}
