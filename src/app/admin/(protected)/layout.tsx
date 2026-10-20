import { requireAdmin } from "@/lib/auth/admin";
import { AdminShell } from "@/components/admin/sidebar";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <AdminShell name={admin.displayName} code={admin.code} email={admin.email}>
      {children}
    </AdminShell>
  );
}
