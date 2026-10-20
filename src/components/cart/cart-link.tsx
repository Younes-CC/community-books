"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

export function CartLink() {
  const { count, max } = useCart();

  return (
    <Link
      href="/warenkorb"
      aria-label={`Warenkorb, ${count} von ${max} Büchern ausgewählt`}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-alt"
    >
      <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-forest px-1 text-[11px] font-medium leading-none text-paper">
          {count}
        </span>
      )}
    </Link>
  );
}
