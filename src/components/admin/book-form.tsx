"use client";

import { useActionState } from "react";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import { createBookAction, updateBookAction, type BookFormState } from "@/lib/actions/admin/books";
import type { AdminBook } from "@/lib/data/admin/books";

const initialState: BookFormState = { status: "idle" };

export function BookForm({ book }: { book?: AdminBook }) {
  const action = book ? updateBookAction : createBookAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-2xl">
      {book && <input type="hidden" name="bookId" value={book.id} />}

      {state.status === "error" && (
        <p className="mb-5 rounded-md bg-brick-tint px-4 py-3 text-sm text-brick">
          {state.message}
        </p>
      )}

      <div className="flex gap-6">
        <ImageDropzone name="imagePath" initialPath={book?.image_path ?? null} />

        <div className="flex-1 space-y-4">
          <Field label="Titel" name="title" defaultValue={book?.title} errors={errs(state, "title")} required />

          <Field
            label="Anzahl Exemplare"
            name="stockTotal"
            type="number"
            defaultValue={String(book?.stock_total ?? 1)}
            errors={errs(state, "stockTotal")}
            required
          />
          {book && (
            <p className="text-xs text-ink-faint">
              Aktuell verfügbar: {book.stock_available} von {book.stock_total}. Eine Änderung der
              Gesamtanzahl passt die Verfügbarkeit automatisch an.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-1.5 block text-sm text-ink-muted" htmlFor="description">
          Beschreibung
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={book?.description}
          className="w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-full bg-forest px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-forest-soft disabled:opacity-50"
      >
        {pending ? "Wird gespeichert…" : book ? "Änderungen speichern" : "Buch hinzufügen"}
      </button>
    </form>
  );
}

function errs(state: BookFormState, field: string): string[] | undefined {
  if (state.status !== "error") return undefined;
  return state.fieldErrors?.[field];
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  errors?: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-ink-muted" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        min={type === "number" ? 0 : undefined}
        className="w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
      />
      {errors?.map((err) => (
        <p key={err} className="mt-1 text-xs text-brick">
          {err}
        </p>
      ))}
    </div>
  );
}
