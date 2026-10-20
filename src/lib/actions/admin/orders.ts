"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { berlinLocalToIso } from "@/lib/time";

type Result = { ok: true } | { ok: false; message: string };

const ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "Dafür fehlt die Berechtigung.",
  order_not_found: "Bestellung nicht gefunden (evtl. bereits gelöscht).",
  already_final: "Diese Bestellung ist bereits abgeschlossen, storniert oder abgelaufen.",
  invalid_status: "Dieser Status ist für diese Übergabeart nicht vorgesehen.",
  invalid_transition: "Diese Aktion ist im aktuellen Status nicht möglich.",
  no_change: "Die Bestellung hat diesen Status bereits.",
  not_cancellable: "Diese Bestellung kann nicht mehr storniert werden (Bücher bereits versendet/abgeholt).",
  unknown_admin: "Dieser Bearbeiter existiert nicht.",
  invalid_parcel_class: "Ungültige Paketklasse.",
};

function mapError(message: string): string {
  for (const [code, text] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(code)) return text;
  }
  return "Aktion konnte nicht ausgeführt werden.";
}

function refresh(orderId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/bestellungen");
  if (orderId) revalidatePath(`/admin/bestellungen/${orderId}`);
  revalidatePath("/admin/buecher");
  revalidatePath("/buecher");
}

const id = z.uuid();

export async function transitionOrderAction(orderId: string, to: string): Promise<Result> {
  await requireAdmin();
  if (!id.safeParse(orderId).success || !/^[a-z_]{2,30}$/.test(to)) {
    return { ok: false, message: "Ungültige Anfrage." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_transition_order", { p_order_id: orderId, p_to: to });
  if (error) return { ok: false, message: mapError(error.message) };
  refresh(orderId);
  return { ok: true };
}

export async function markMailSentAction(orderId: string): Promise<Result> {
  await requireAdmin();
  if (!id.safeParse(orderId).success) return { ok: false, message: "Ungültige Anfrage." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_mark_mail_sent", { p_order_id: orderId });
  if (error) return { ok: false, message: mapError(error.message) };
  refresh(orderId);
  return { ok: true };
}

export async function cancelOrderAction(orderId: string, note?: string): Promise<Result> {
  await requireAdmin();
  if (!id.safeParse(orderId).success) return { ok: false, message: "Ungültige Anfrage." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_cancel_order", {
    p_order_id: orderId,
    p_note: (note ?? "").slice(0, 500),
  });
  if (error) return { ok: false, message: mapError(error.message) };
  refresh(orderId);
  return { ok: true };
}

export async function extendDeadlineAction(orderId: string): Promise<Result> {
  await requireAdmin();
  if (!id.safeParse(orderId).success) return { ok: false, message: "Ungültige Anfrage." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_extend_deadline", { p_order_id: orderId });
  if (error) return { ok: false, message: mapError(error.message) };
  refresh(orderId);
  return { ok: true };
}

export async function assignOrderAction(orderId: string, adminId: string | null): Promise<Result> {
  await requireAdmin();
  if (!id.safeParse(orderId).success || (adminId !== null && !id.safeParse(adminId).success)) {
    return { ok: false, message: "Ungültige Anfrage." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_assign_order", { p_order_id: orderId, p_admin: adminId });
  if (error) return { ok: false, message: mapError(error.message) };
  refresh(orderId);
  return { ok: true };
}

// Deleting = step 1 (database function: release stock exactly once, write the audit entry, park as
// cancelled) + step 2 (remove the row with the admin's own RLS-authorized session).
export async function deleteOrderAction(orderId: string): Promise<Result> {
  await requireAdmin();
  if (!id.safeParse(orderId).success) return { ok: false, message: "Ungültige Anfrage." };
  const supabase = await createClient();

  const { error: prepareError } = await supabase.rpc("admin_prepare_order_delete", { p_order_id: orderId });
  if (prepareError) return { ok: false, message: mapError(prepareError.message) };

  const { data, error } = await supabase.from("orders").delete().eq("id", orderId).select("id");
  if (error || !data || data.length === 0) {
    return { ok: false, message: "Die Bestellung wurde storniert, konnte aber nicht gelöscht werden." };
  }
  refresh();
  return { ok: true };
}

// Quick confirm/clear of the parcel class without touching notes or pickup fields.
export async function setParcelClassAction(orderId: string, parcelClass: string | null): Promise<Result> {
  await requireAdmin();
  if (!id.safeParse(orderId).success) return { ok: false, message: "Ungültige Anfrage." };
  if (parcelClass !== null && !["Paeckchen", "S", "M", "L"].includes(parcelClass)) {
    return { ok: false, message: "Ungültige Paketklasse." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ parcel_class_override: parcelClass })
    .eq("id", orderId)
    .select("id");
  if (error || !data || data.length === 0) return { ok: false, message: "Paketklasse konnte nicht gespeichert werden." };
  refresh(orderId);
  return { ok: true };
}

const detailsSchema = z.object({
  orderId: z.uuid(),
  notes: z.string().max(4000),
  pickupAppointment: z.string().max(40),
  pickupDeadline: z.string().max(40),
  parcelOverride: z.enum(["", "Paeckchen", "S", "M", "L"]),
});

const toIso = (value: string): string | null => (value ? berlinLocalToIso(value) : null);

export type OrderDetailsState = { status: "idle" } | { status: "error"; message: string } | { status: "saved" };

export async function updateOrderDetailsAction(
  _prev: OrderDetailsState,
  formData: FormData,
): Promise<OrderDetailsState> {
  await requireAdmin();
  const parsed = detailsSchema.safeParse({
    orderId: String(formData.get("orderId") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    pickupAppointment: String(formData.get("pickupAppointment") ?? ""),
    pickupDeadline: String(formData.get("pickupDeadline") ?? ""),
    parcelOverride: String(formData.get("parcelOverride") ?? ""),
  });
  if (!parsed.success) return { status: "error", message: "Bitte prüfe deine Angaben." };

  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_order_details", {
    p_order_id: d.orderId,
    p_notes: d.notes,
    p_pickup_appointment: toIso(d.pickupAppointment),
    p_pickup_deadline: toIso(d.pickupDeadline),
    p_parcel_override: d.parcelOverride || null,
  });
  if (error) return { status: "error", message: mapError(error.message) };

  refresh(d.orderId);
  return { status: "saved" };
}
