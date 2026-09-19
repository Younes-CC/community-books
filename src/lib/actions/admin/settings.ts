"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { settingsSchema } from "@/lib/validation/settings";

export type SettingsFormState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success" };

export async function updateSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse({
    shippingPrice: formData.get("shippingPrice"),
    paymentUrl: formData.get("paymentUrl"),
    reservationDurationHours: formData.get("reservationDurationHours"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Bitte prüfe deine Angaben.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({
      shipping_price: parsed.data.shippingPrice,
      payment_url: parsed.data.paymentUrl || null,
      reservation_duration_hours: parsed.data.reservationDurationHours,
    })
    .eq("id", true);

  if (error) {
    return { status: "error", message: "Einstellungen konnten nicht gespeichert werden." };
  }

  revalidatePath("/admin/einstellungen");
  revalidatePath("/buecher");
  return { status: "success" };
}
