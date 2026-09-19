import type { Metadata } from "next";
import { getPublicSettings } from "@/lib/data/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Einstellungen — Admin" };

export default async function AdminSettingsPage() {
  const settings = await getPublicSettings();

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Einstellungen</h1>
      <div className="mt-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
