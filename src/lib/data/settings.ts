import "server-only";
import { createClient } from "@/lib/supabase/server";

export type PublicSettings = {
  shipping_price: number;
  payment_url: string | null;
  reservation_duration_hours: number;
};

export async function getPublicSettings(): Promise<PublicSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("shipping_price, payment_url, reservation_duration_hours")
    .single();

  if (error) throw error;
  return data;
}
