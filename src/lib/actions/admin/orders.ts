"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export type OrderAction =
  | "confirm_payment"
  | "mark_packing"
  | "mark_shipped"
  | "mark_ready_for_pickup"
  | "mark_completed"
  | "cancel";

export async function setOrderStatusAction(
  orderId: string,
  action: OrderAction,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.rpc("admin_set_order_status", {
    p_order_id: orderId,
    p_action: action,
  });

  if (error) {
    return { ok: false, message: "Aktion konnte nicht ausgeführt werden." };
  }

  revalidatePath("/admin/bestellungen");
  revalidatePath(`/admin/bestellungen/${orderId}`);
  revalidatePath("/admin");
  revalidatePath("/buecher");
  return { ok: true };
}
