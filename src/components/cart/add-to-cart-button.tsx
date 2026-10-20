"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Button, LinkButton } from "@/components/ui/button";

export function AddToCartButton({
  book,
}: {
  book: { id: string; slug: string; title: string; image_path: string | null; stock_available: number };
}) {
  const cart = useCart();
  const [notice, setNotice] = useState<string | null>(null);
  const inCart = cart.has(book.id);

  if (book.stock_available <= 0) {
    return (
      <p className="rounded-md bg-paper-alt px-5 py-4 text-sm text-ink-muted">
        Dieses Buch ist aktuell vergriffen. Schau gerne später wieder vorbei.
      </p>
    );
  }

  return (
    <div>
      {inCart ? (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-medium text-forest">
            <Check className="h-4 w-4" strokeWidth={2} />
            Im Warenkorb — {cart.count} von {cart.max} Büchern ausgewählt
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <LinkButton href="/warenkorb" className="w-full sm:w-auto">
              Zum Warenkorb
            </LinkButton>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                cart.remove(book.id);
                setNotice(null);
              }}
            >
              <Minus className="h-4 w-4" strokeWidth={1.5} />
              Entfernen
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={cart.isFull}
            onClick={() => {
              const result = cart.add({
                id: book.id,
                slug: book.slug,
                title: book.title,
                image_path: book.image_path,
              });
              setNotice(result === "full" ? `Du hast bereits ${cart.max} Bücher ausgewählt.` : null);
            }}
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            In den Warenkorb
          </Button>
          {cart.isFull && (
            <p className="text-sm text-ink-muted">
              Dein Warenkorb ist voll ({cart.count} von {cart.max}).{" "}
              <Link href="/warenkorb" className="underline hover:text-ink">
                Zum Warenkorb
              </Link>
            </p>
          )}
          {notice && !cart.isFull && <p className="text-sm text-brick">{notice}</p>}
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        Das Buch ist kostenlos. Damit möglichst viele Menschen von dieser Aktion profitieren können,
        sind maximal drei Bücher pro Person vorgesehen.
      </p>
    </div>
  );
}
