"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/admin/auth";

const initialState: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-ink-muted">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-ink-muted">
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
        />
      </div>

      {state.status === "error" && (
        <p className="rounded-md bg-brick-tint px-3.5 py-2.5 text-sm text-brick">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-forest px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-forest-soft disabled:opacity-50"
      >
        {pending ? "Wird geprüft…" : "Anmelden"}
      </button>
    </form>
  );
}
