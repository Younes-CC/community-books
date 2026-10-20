import "server-only";
import { createClient } from "@/lib/supabase/server";

export type PublicSettings = {
  shipping_price: number;
  payment_url: string | null;
  reservation_duration_hours: number;
};

// The settings table is admin-only; the storefront reads a curated subset via an RPC.
export async function getPublicSettings(): Promise<PublicSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_settings");
  if (error) throw error;
  const row = data as { hermes_price: number };
  return { shipping_price: Number(row.hermes_price), payment_url: null, reservation_duration_hours: 24 };
}

export async function getAdminSettings(): Promise<PublicSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("shipping_price, payment_url, reservation_duration_hours")
    .single();
  if (error) throw error;
  return data;
}
