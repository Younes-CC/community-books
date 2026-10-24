"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { settingsSchema } from "@/lib/validation/settings";
import type { SettingsRow } from "@/lib/database.types";

export type SettingsFormState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success" };

const val = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function updateSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const admin = await requireAdmin();

  const keys = Object.keys(settingsSchema.shape);
  const parsed = settingsSchema.safeParse(Object.fromEntries(keys.map((k) => [k, val(formData, k)])));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Bitte prüfe deine Angaben.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }
  const d = parsed.data;

  const update: Partial<SettingsRow> = {
    shipping_price: d.hermesPrice,
    default_parcel_class: d.defaultParcelClass,
    hermes_s_max_cm: d.hermesSMaxCm,
    packaging_padding_cm: d.packagingPaddingCm,
    processing_time_text: d.processingTimeText,
    project_email: d.projectEmail || null,
    sender_name: d.senderName || null,
    hermes_sender_street: d.hermesSenderStreet || null,
    hermes_sender_zip_city: d.hermesSenderZipCity || null,
    qr_deadline_hours: d.qrDeadlineHours,
    internal_processing_hours: d.internalProcessingHours,
    auto_cancel_unprocessed_hours: d.autoCancelHours,
    pickup_public_location: d.pickupPublicLocation,
    pickup_address: d.pickupAddress || null,
    pickup_instructions: d.pickupInstructions || null,
    pickup_deadline_days: d.pickupDeadlineDays,
    hermes_instructions: d.hermesInstructions,
    hermes_email_subject: d.hermesEmailSubject,
    hermes_email_body: d.hermesEmailBody,
    pickup_email_subject: d.pickupEmailSubject,
    pickup_email_body: d.pickupEmailBody,
    rate_limit_attempts_per_hour: d.rateLimitAttemptsPerHour,
    rate_limit_orders_per_ip_day: d.rateLimitOrdersPerIpDay,
    rate_limit_orders_global_hour: d.rateLimitOrdersGlobalHour,
  };

  // Only the main admin may switch automatic cancellation on or off (also enforced by a DB trigger).
  if (admin.isOwner) {
    update.auto_cancel_unprocessed_enabled = formData.get("autoCancelEnabled") === "on";
  }

  const supabase = await createClient();
  const { error } = await supabase.from("settings").update(update).eq("id", true);

  if (error) {
    return {
      status: "error",
      message: error.message.includes("owner_only")
        ? "Nur der Hauptadmin darf die automatische Stornierung ändern."
        : "Einstellungen konnten nicht gespeichert werden.",
    };
  }

  revalidatePath("/admin/einstellungen");
  revalidatePath("/buecher");
  revalidatePath("/warenkorb");
  return { status: "success" };
}
