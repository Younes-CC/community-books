import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminSettings } from "@/lib/data/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Einstellungen — Admin" };

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  const settings = await getAdminSettings();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl text-ink">Einstellungen</h1>
      <div className="mt-6">
        <SettingsForm settings={settings} isOwner={admin.isOwner} />
      </div>
    </div>
  );
}
