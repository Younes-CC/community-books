import "server-only";
import { createClient } from "@/lib/supabase/server";
import { MAX_BOOKS_PER_PERSON } from "@/lib/constants";
import type { SettingsRow } from "@/lib/database.types";

export type PublicSettings = {
  hermesPrice: number;
  maxBooks: number;
  processingTimeText: string;
  pickupLocation: string;
  qrDeadlineHours: number;
};

// The settings table is admin-only (it holds sender/pickup addresses and mail templates);
// the storefront only ever sees this curated subset, served by a database function.
export async function getPublicSettings(): Promise<PublicSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_settings");
  if (error) throw error;
  const row = (data ?? {}) as {
    hermes_price?: number;
    max_books_per_person?: number;
    processing_time_text?: string;
    pickup_public_location?: string;
    qr_deadline_hours?: number;
  };
  return {
    hermesPrice: Number(row.hermes_price ?? 0),
    maxBooks: Number(row.max_books_per_person ?? MAX_BOOKS_PER_PERSON),
    processingTimeText: row.processing_time_text ?? "7–21 Tage",
    pickupLocation: row.pickup_public_location ?? "Neu-Isenburg",
    qrDeadlineHours: Number(row.qr_deadline_hours ?? 72),
  };
}

export async function getAdminSettings(): Promise<SettingsRow> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("settings").select("*").single();
  if (error) throw error;
  return data;
}
