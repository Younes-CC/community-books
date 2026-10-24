"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { createClient } from "@/lib/supabase/server";
import { getBooksByIds } from "@/lib/data/books";
import { reservationSchema } from "@/lib/validation/reservation";
import { serverToken, visitorKey } from "@/lib/rate-limit";
import type { FulfillmentType } from "@/lib/constants";

export type ReservationState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]>; refreshCart?: boolean }
  | {
      status: "success";
      orderNumber: string;
      fulfillmentType: FulfillmentType;
      titles: string[];
    };

const DB_ERROR_MESSAGES: Record<string, { message: string; refreshCart?: boolean }> = {
  invalid_fulfillment_type: { message: "Bitte wähle Hermes-Versand oder Abholung." },
  cart_empty: { message: "Dein Warenkorb ist leer." },
  too_many_books: {
    message:
      "Pro Person sind maximal drei Bücher vorgesehen. Bitte entferne ein Buch aus deinem Warenkorb.",
  },
  duplicate_book: { message: "Jedes Buch kann nur einmal ausgewählt werden." },
  limit_exceeded: {
    message:
      "Für dich sind bereits Bücher reserviert. Damit möglichst viele Menschen von dieser Aktion profitieren können, sind maximal drei Bücher pro Person vorgesehen.",
  },
  already_has_book: { message: "Eines dieser Bücher ist für dich bereits reserviert." },
  first_name_required: { message: "Bitte gib deinen Vornamen an." },
  last_name_required: { message: "Bitte gib deinen Nachnamen an." },
  invalid_email: { message: "Bitte gib eine gültige E-Mail-Adresse ein." },
  invalid_input: { message: "Bitte prüfe deine Angaben (ein Feld ist zu lang)." },
  address_required: { message: "Bitte fülle alle Adressfelder für den Versand aus." },
  book_not_found: { message: "Ein Buch wurde nicht gefunden. Bitte prüfe deinen Warenkorb.", refreshCart: true },
  book_not_available: {
    message: "Ein Buch ist aktuell nicht verfügbar. Bitte prüfe deinen Warenkorb.",
    refreshCart: true,
  },
  out_of_stock: {
    message: "Mindestens eines der Bücher ist leider nicht mehr verfügbar. Bitte prüfe deinen Warenkorb.",
    refreshCart: true,
  },
};

function mapDbError(message: string): { message: string; refreshCart?: boolean } {
  for (const [code, friendly] of Object.entries(DB_ERROR_MESSAGES)) {
    if (message.includes(code)) return friendly;
  }
  return { message: "Deine Reservierung konnte nicht erstellt werden. Bitte versuche es erneut." };
}

// Fast autofill can fill the form within a second or two; scripts post immediately.
const MIN_FORM_MS = 1500;

const RATE_LIMIT_MESSAGES = {
  ip_limited:
    "Von deinem Netzwerk aus wurden in kurzer Zeit sehr viele Reservierungen versucht. Bitte versuche es später erneut.",
  global_limited:
    "Gerade gehen sehr viele Reservierungen ein. Bitte versuche es in einigen Minuten erneut — deine Auswahl bleibt im Warenkorb gespeichert.",
} as const;

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function createReservationAction(
  _prevState: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  // honeypot: real visitors never see or fill this field
  if (text(formData, "website").trim() !== "") {
    return { status: "error", message: "Deine Reservierung konnte nicht erstellt werden." };
  }
  // time trap: the form reports how long it was open; a human needs more than a moment
  const elapsedMs = Number(text(formData, "elapsed"));
  if (!Number.isFinite(elapsedMs) || elapsedMs < MIN_FORM_MS) {
    return { status: "error", message: "Das ging etwas schnell. Bitte prüfe deine Angaben und sende das Formular erneut ab." };
  }

  const parsed = reservationSchema.safeParse({
    bookIds: formData.getAll("bookId").map(String),
    fulfillmentType: text(formData, "fulfillmentType"),
    firstName: text(formData, "firstName"),
    lastName: text(formData, "lastName"),
    email: text(formData, "email"),
    socialUsername: text(formData, "socialUsername"),
    street: text(formData, "street"),
    houseNumber: text(formData, "houseNumber"),
    postalCode: text(formData, "postalCode"),
    city: text(formData, "city"),
    country: text(formData, "country"),
  });

  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    const first = flat.fieldErrors.bookIds?.[0] ?? flat.formErrors[0];
    return {
      status: "error",
      message: first ?? "Bitte prüfe deine Angaben.",
      fieldErrors: flat.fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  // server-side rate limit (keyed, daily-rotating network hash; see lib/rate-limit.ts)
  const ipHash = await visitorKey();
  const token = serverToken();
  const { data: verdict, error: limitError } = await supabase.rpc("rate_limit_hit", {
    p_token: token,
    p_ip_hash: ipHash,
    p_kind: "attempt",
  });
  if (limitError) {
    return { status: "error", message: "Deine Reservierung konnte nicht erstellt werden. Bitte versuche es erneut." };
  }
  if (verdict !== "ok") {
    return { status: "error", message: RATE_LIMIT_MESSAGES[verdict as keyof typeof RATE_LIMIT_MESSAGES] ?? RATE_LIMIT_MESSAGES.global_limited };
  }

  const { data: rows, error } = await supabase.rpc("create_cart_reservation", {
    p_book_ids: data.bookIds,
    p_fulfillment_type: data.fulfillmentType,
    p_first_name: data.firstName,
    p_last_name: data.lastName,
    p_email: data.email,
    p_social_username: data.socialUsername || "",
    p_street: data.street || "",
    p_house_number: data.houseNumber || "",
    p_postal_code: data.postalCode || "",
    p_city: data.city || "",
    p_country: data.country || "",
    p_server_token: token,
  });

  if (error) {
    return { status: "error", ...mapDbError(error.message) };
  }

  const result = rows?.[0];
  if (!result) {
    return { status: "error", message: "Deine Reservierung konnte nicht erstellt werden." };
  }

  // counts towards the per-network daily limit (a failure here must not undo the reservation)
  await supabase.rpc("rate_limit_hit", { p_token: token, p_ip_hash: ipHash, p_kind: "order" });

  revalidatePath("/buecher");
  revalidatePath("/");

  return {
    status: "success",
    orderNumber: result.out_order_number,
    fulfillmentType: data.fulfillmentType,
    titles: result.out_titles,
  };
}

export type CartBookInfo = {
  id: string;
  slug: string;
  title: string;
  image_path: string | null;
  available: boolean;
};

// Re-checks what is still reservable for the books in a visitor's cart (public data only).
export async function resolveCartBooksAction(ids: string[]): Promise<CartBookInfo[]> {
  const parsed = z.array(z.uuid()).max(10).safeParse(ids);
  if (!parsed.success || parsed.data.length === 0) return [];
  const books = await getBooksByIds(parsed.data);
  return books.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    image_path: b.image_path,
    available: b.is_active && b.stock_available > 0,
  }));
}
