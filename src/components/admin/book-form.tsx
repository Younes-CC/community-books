"use client";

import { useActionState } from "react";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import { createBookAction, updateBookAction, type BookFormState } from "@/lib/actions/admin/books";
import type { AdminBook } from "@/lib/data/admin/books";
import { LEVELS, READING_LENGTHS, TOPICS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const initialState: BookFormState = { status: "idle" };

const inputClass =
  "min-h-11 w-full rounded-md border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-forest focus:outline-none";

export function BookForm({ book }: { book?: AdminBook }) {
  const action = book ? updateBookAction : createBookAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-2xl">
      {book && <input type="hidden" name="bookId" value={book.id} />}

      {state.status === "error" && (
        <p role="alert" className="mb-5 rounded-md bg-brick-tint px-4 py-3 text-sm text-brick">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-6 sm:flex-row">
        <ImageDropzone name="imagePath" initialPath={book?.image_path ?? null} />

        <div className="flex-1 space-y-4">
          <Field label="Titel" name="title" defaultValue={book?.title} errors={errs(state, "title")} required />

          <Field
            label="Anzahl Exemplare"
            name="stockTotal"
            type="number"
            inputMode="numeric"
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
        <textarea id="description" name="description" rows={5} defaultValue={book?.description} className={inputClass} />
      </div>

      <details className="mt-6 rounded-md border border-line px-4 py-3" open={!!book && (book.topics.length > 0 || book.levels.length > 0)}>
        <summary className="min-h-8 cursor-pointer text-sm font-medium text-ink">Buchempfehlung (Fragebogen)</summary>
        <p className="mt-2 text-xs leading-relaxed text-ink-faint">
          Nur ausfüllen, was zur Buchbeschreibung passt — daraus entstehen die Empfehlungen im Fragebogen. Ohne Angaben erscheint
          das Buch nur als „weiteres verfügbares Buch“.
        </p>

        <Group label="Themen">
          {TOPICS.map((t) => (
            <Check key={t.key} name="topics" value={t.key} defaultChecked={book?.topics.includes(t.key)}>
              {t.label}
            </Check>
          ))}
        </Group>
        <Group label="Für welchen Wissensstand geeignet?">
          {LEVELS.map((l) => (
            <Check key={l.key} name="levels" value={l.key} defaultChecked={book?.levels.includes(l.key)}>
              {l.label}
            </Check>
          ))}
        </Group>
        <div className="mt-4 max-w-xs">
          <label className="mb-1.5 block text-sm text-ink-muted" htmlFor="readingLength">
            Umfang
          </label>
          <select id="readingLength" name="readingLength" defaultValue={book?.reading_length ?? ""} className={inputClass}>
            <option value="">Keine Angabe</option>
            {READING_LENGTHS.map((l) => (
              <option key={l.key} value={l.key}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </details>

      <details className="mt-3 rounded-md border border-line px-4 py-3" open={!!book && !!(book.width_mm || book.height_mm || book.thickness_mm)}>
        <summary className="min-h-8 cursor-pointer text-sm font-medium text-ink">Maße für die Hermes-Paketprüfung</summary>
        <p className="mt-2 text-xs leading-relaxed text-ink-faint">
          Außenmaße des Buches. Ohne Maße kann das System die Paketklasse nicht schätzen und markiert Bestellungen zur manuellen
          Prüfung.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Breite (mm)" name="widthMm" type="number" inputMode="numeric" defaultValue={book?.width_mm?.toString() ?? ""} errors={errs(state, "widthMm")} />
          <Field label="Höhe (mm)" name="heightMm" type="number" inputMode="numeric" defaultValue={book?.height_mm?.toString() ?? ""} errors={errs(state, "heightMm")} />
          <Field label="Dicke (mm)" name="thicknessMm" type="number" inputMode="numeric" defaultValue={book?.thickness_mm?.toString() ?? ""} errors={errs(state, "thicknessMm")} />
          <Field label="Gewicht (g, optional)" name="weightG" type="number" inputMode="numeric" defaultValue={book?.weight_g?.toString() ?? ""} errors={errs(state, "weightG")} />
        </div>
      </details>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 min-h-12 w-full rounded-full bg-forest px-6 text-sm font-medium text-paper transition-colors hover:bg-forest-soft disabled:opacity-50 sm:w-auto"
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

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-4">
      <legend className="mb-2 text-sm text-ink-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Check({
  name,
  value,
  defaultChecked,
  children,
}: {
  name: string;
  value: string;
  defaultChecked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="relative">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        className={cn(
          "flex min-h-10 cursor-pointer items-center rounded-full border border-line-strong px-3.5 text-sm text-ink-muted transition-colors",
          "peer-checked:border-forest peer-checked:bg-forest peer-checked:text-paper peer-focus-visible:ring-2 peer-focus-visible:ring-forest peer-focus-visible:ring-offset-2",
        )}
      >
        {children}
      </span>
    </label>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  errors,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  errors?: string[];
  inputMode?: "numeric" | "text";
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
        inputMode={inputMode}
        defaultValue={defaultValue}
        required={required}
        min={type === "number" ? 0 : undefined}
        className={inputClass}
      />
      {errors?.map((err) => (
        <p key={err} className="mt-1 text-xs text-brick">
          {err}
        </p>
      ))}
    </div>
  );
}
