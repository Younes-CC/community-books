import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  email: string | null;
  displayName: string;
  code: string | null;
  isOwner: boolean;
};

export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id, display_name, code, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: adminRow.display_name ?? user.email ?? "Admin",
    code: adminRow.code,
    isOwner: adminRow.role === "owner",
  };
});

export async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}
