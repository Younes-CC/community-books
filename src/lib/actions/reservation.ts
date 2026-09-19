"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reservationSchema } from "@/lib/validation/reservation";
import type { FulfillmentType } from "@/lib/constants";

export type ReservationState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | {
      status: "success";
      orderNumber: string;
      orderStatus: string;
      paymentStatus: string;
      shippingPrice: number;
      total: number;
      reservationExpiresAt: string | null;
      fulfillmentType: FulfillmentType;
    };

const DB_ERROR_MESSAGES: Record<string, string> = {
  invalid_fulfillment_type: "Bitte wähle Versand oder Abholung.",
  first_name_required: "Bitte gib deinen Vornamen an.",
  last_name_required: "Bitte gib deinen Nachnamen an.",
  invalid_email: "Bitte gib eine gültige E-Mail-Adresse ein.",
  address_required: "Bitte fülle alle Adressfelder für den Versand aus.",
  book_not_found: "Dieses Buch wurde nicht gefunden.",
  book_not_available: "Dieses Buch ist aktuell nicht verfügbar.",
  out_of_stock: "Dieses Buch ist leider vergriffen.",
};

function mapDbError(message: string): string {
  for (const [code, friendly] of Object.entries(DB_ERROR_MESSAGES)) {
    if (message.includes(code)) return friendly;
  }
  return "Deine Reservierung konnte nicht erstellt werden. Bitte versuche es erneut.";
}

export async function createReservationAction(
  _prevState: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  const raw = {
    bookId: String(formData.get("bookId") ?? ""),
    fulfillmentType: String(formData.get("fulfillmentType") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    socialUsername: String(formData.get("socialUsername") ?? ""),
    street: String(formData.get("street") ?? ""),
    houseNumber: String(formData.get("houseNumber") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    city: String(formData.get("city") ?? ""),
    country: String(formData.get("country") ?? ""),
  };

  const parsed = reservationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Bitte prüfe deine Angaben.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const { data: rows, error } = await supabase.rpc("create_reservation", {
    p_book_id: data.bookId,
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
  });

  if (error) {
    return { status: "error", message: mapDbError(error.message) };
  }

  const result = rows?.[0];
  if (!result) {
    return { status: "error", message: "Deine Reservierung konnte nicht erstellt werden." };
  }

  revalidatePath("/buecher");

  return {
    status: "success",
    orderNumber: result.order_number,
    orderStatus: result.order_status,
    paymentStatus: result.payment_status,
    shippingPrice: result.shipping_price,
    total: result.total,
    reservationExpiresAt: result.reservation_expires_at,
    fulfillmentType: data.fulfillmentType as FulfillmentType,
  };
}
