import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Admin-Login" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <p className="text-center font-serif text-lg uppercase tracking-[0.18em] text-ink">
          {SITE_NAME}
        </p>
        <h1 className="mt-1 text-center text-sm text-ink-muted">Admin-Zugang</h1>

        <div className="mt-8 rounded-md border border-line p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
