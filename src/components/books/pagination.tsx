import Link from "next/link";
import { cn } from "@/lib/cn";

export function Pagination({
  page,
  pageSize,
  total,
  q,
}: {
  page: number;
  pageSize: number;
  total: number;
  q?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (targetPage > 1) params.set("seite", String(targetPage));
    const qs = params.toString();
    return qs ? `/buecher?${qs}` : "/buecher";
  };

  return (
    <nav className="mt-12 flex items-center justify-center gap-2">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(
          "rounded-full border border-line-strong px-4 py-2 text-sm text-ink-muted hover:border-ink hover:text-ink",
          page <= 1 && "pointer-events-none opacity-30",
        )}
      >
        Zurück
      </Link>
      <span className="px-3 text-sm text-ink-muted">
        Seite {page} von {totalPages}
      </span>
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={cn(
          "rounded-full border border-line-strong px-4 py-2 text-sm text-ink-muted hover:border-ink hover:text-ink",
          page >= totalPages && "pointer-events-none opacity-30",
        )}
      >
        Weiter
      </Link>
    </nav>
  );
}
