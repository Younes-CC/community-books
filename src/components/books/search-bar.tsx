import { Search } from "lucide-react";

export function SearchBar({ defaultValue, category }: { defaultValue?: string; category?: string }) {
  return (
    <form action="/buecher" method="GET" className="relative w-full sm:max-w-xs">
      {category && <input type="hidden" name="kategorie" value={category} />}
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
        strokeWidth={1.5}
      />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Titel oder Autor suchen"
        className="w-full rounded-full border border-line-strong bg-paper py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-forest focus:outline-none"
      />
    </form>
  );
}
