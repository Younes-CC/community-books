"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { DM_PICKUP_STATUSES, DM_STATUSES, MAX_BOOKS_PER_PERSON } from "@/lib/constants";

// Orders that arrive as TikTok direct messages and are captured by hand in the dashboard.

const ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "Dafür fehlt die Berechtigung.",
  name_required: "Bitte den TikTok-Namen eintragen.",
  name_too_long: "Der TikTok-Name ist zu lang.",
  cart_empty: "Bitte mindestens ein Buch auswählen.",
  too_many_books: "Maximal drei Bücher pro Bestellung.",
  duplicate_book: "Jedes Buch nur einmal pro Bestellung.",
  book_not_found: "Ein Buch wurde nicht gefunden.",
  book_not_available: "Ein Buch ist nicht mehr aktiv.",
  out_of_stock: "Eines der Bücher ist leider nicht mehr verfügbar.",
  invalid_status: "Dieser Status passt nicht zur gewählten Übergabe (Abholung hat keinen QR-Code).",
  invalid_fulfillment_type: "Bitte Hermes-Versand oder Abholung wählen.",
  no_change: "Die Bestellung hat diesen Status bereits.",
  already_final: "Diese Bestellung ist storniert und kann nicht mehr geändert werden.",
  not_cancellable: "Versendete Bestellungen können nicht storniert werden.",
  not_dm_order: "Das ist keine TikTok-Bestellung.",
  order_not_found: "Bestellung nicht gefunden.",
};

function mapError(message: string): string {
  for (const [code, text] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(code)) return text;
  }
  return "Aktion konnte nicht ausgeführt werden. Bitte erneut versuchen.";
}

function refresh(orderId?: string) {
  revalidatePath("/admin");
  if (orderId) revalidatePath(`/admin/bestellungen/${orderId}`);
  revalidatePath("/admin/buecher");
  revalidatePath("/buecher");
  revalidatePath("/");
}

const id = z.uuid();
const statusSchema = z.enum([...DM_STATUSES, ...DM_PICKUP_STATUSES]);
const typeSchema = z.enum(["shipping", "pickup"]);
const nameSchema = z.string().trim().min(1, "Bitte den TikTok-Namen eintragen.").max(80, "Der TikTok-Name ist zu lang.");
const booksSchema = z.array(z.uuid()).min(1, "Bitte mindestens ein Buch auswählen.").max(MAX_BOOKS_PER_PERSON, "Maximal drei Bücher pro Bestellung.");

export type DmResult<T = object> = ({ ok: true } & T) | { ok: false; message: string };

export async function createDmOrderAction(input: {
  tiktokName: string;
  bookIds: string[];
  fulfillmentType: string;
  status: string;
  clientKey: string;
}): Promise<DmResult<{ orderNumber: string; tiktokName: string }>> {
  await requireAdmin();
  const parsed = z
    .object({ tiktokName: nameSchema, bookIds: booksSchema, fulfillmentType: typeSchema, status: statusSchema, clientKey: id })
    .safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_create_tiktok_order", {
    p_tiktok_name: parsed.data.tiktokName,
    p_book_ids: parsed.data.bookIds,
    p_fulfillment_type: parsed.data.fulfillmentType,
    p_status: parsed.data.status,
    p_client_key: parsed.data.clientKey,
  });
  if (error || !data) return { ok: false, message: mapError(error?.message ?? "") };

  refresh();
  return { ok: true, orderNumber: data.order_number, tiktokName: data.tiktok_name ?? parsed.data.tiktokName };
}

export async function setDmStatusAction(orderId: string, status: string): Promise<DmResult> {
  await requireAdmin();
  if (!id.safeParse(orderId).success || !statusSchema.safeParse(status).success) {
    return { ok: false, message: "Ungültige Anfrage." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_dm_status", { p_order_id: orderId, p_to: status });
  if (error) return { ok: false, message: mapError(error.message) };
  refresh(orderId);
  return { ok: true };
}

export async function updateDmOrderAction(input: {
  orderId: string;
  tiktokName: string;
  bookIds: string[];
}): Promise<DmResult> {
  await requireAdmin();
  const parsed = z.object({ orderId: id, tiktokName: nameSchema, bookIds: booksSchema }).safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_dm_order", {
    p_order_id: parsed.data.orderId,
    p_tiktok_name: parsed.data.tiktokName,
    p_book_ids: parsed.data.bookIds,
  });
  if (error) return { ok: false, message: mapError(error.message) };
  refresh(parsed.data.orderId);
  return { ok: true };
}

export async function setDmFulfillmentAction(orderId: string, type: string): Promise<DmResult> {
  await requireAdmin();
  if (!id.safeParse(orderId).success || !typeSchema.safeParse(type).success) {
    return { ok: false, message: "Ungültige Anfrage." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_dm_fulfillment", { p_order_id: orderId, p_type: type });
  if (error) return { ok: false, message: mapError(error.message) };
  refresh(orderId);
  return { ok: true };
}
