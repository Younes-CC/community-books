"use client";

import { useSyncExternalStore } from "react";
import { MAX_BOOKS_PER_PERSON } from "@/lib/constants";

// The cart lives only in the visitor's browser (localStorage). Nothing about it is stored on the
// server until the visitor submits the reservation — and the server re-validates everything then.

export type CartItem = { id: string; slug: string; title: string; image_path: string | null };

const KEY = "readdeen4free.cart.v1";
const EMPTY: CartItem[] = [];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let cache: { raw: string | null; items: CartItem[] } = { raw: null, items: EMPTY };
const listeners = new Set<() => void>();

function parse(raw: string | null): CartItem[] {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return EMPTY;
    const seen = new Set<string>();
    const items: CartItem[] = [];
    for (const entry of data) {
      if (!entry || typeof entry !== "object") continue;
      const { id, slug, title, image_path } = entry as Record<string, unknown>;
      if (typeof id !== "string" || !UUID.test(id) || seen.has(id)) continue;
      if (typeof slug !== "string" || typeof title !== "string") continue;
      seen.add(id);
      items.push({ id, slug, title, image_path: typeof image_path === "string" ? image_path : null });
      if (items.length >= MAX_BOOKS_PER_PERSON) break;
    }
    return items.length ? items : EMPTY;
  } catch {
    return EMPTY;
  }
}

function snapshot(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cache.items;
  }
  if (raw !== cache.raw) cache = { raw, items: parse(raw) };
  return cache.items;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(items: CartItem[]) {
  const raw = items.length ? JSON.stringify(items) : null;
  try {
    if (raw) window.localStorage.setItem(KEY, raw);
    else window.localStorage.removeItem(KEY);
  } catch {
    // storage blocked (private mode): keep the in-memory copy so the session still works
  }
  cache = { raw, items: items.length ? items : EMPTY };
  listeners.forEach((l) => l());
}

export type AddResult = "added" | "exists" | "full";

export function useCart() {
  const items = useSyncExternalStore(subscribe, snapshot, () => EMPTY);

  return {
    items,
    count: items.length,
    max: MAX_BOOKS_PER_PERSON,
    isFull: items.length >= MAX_BOOKS_PER_PERSON,
    has: (id: string) => items.some((i) => i.id === id),
    add(item: CartItem): AddResult {
      const current = snapshot();
      if (current.some((i) => i.id === item.id)) return "exists";
      if (current.length >= MAX_BOOKS_PER_PERSON) return "full";
      write([...current, item]);
      return "added";
    },
    remove(id: string) {
      write(snapshot().filter((i) => i.id !== id));
    },
    clear() {
      write([]);
    },
  };
}
