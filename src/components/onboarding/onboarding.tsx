"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { GeometricMark } from "@/components/ui/geometric-mark";
import { BookCover } from "@/components/books/book-cover";
import { Button } from "@/components/ui/button";
import { SITE_NAME, TOPICS, type LevelKey, type ReadingLengthKey, type TopicKey } from "@/lib/constants";
import { recommend, type Answers, type RecommendBook } from "@/lib/recommend";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { ONBOARDING_OPEN_EVENT, ONBOARDING_STORAGE_KEY } from "@/lib/onboarding";

const STORAGE_KEY = ONBOARDING_STORAGE_KEY;
const OPEN_EVENT = ONBOARDING_OPEN_EVENT;

type Step = "intro" | 0 | 1 | 2 | "result";

const LEVEL_OPTIONS: { key: LevelKey; label: string }[] = [
  { key: "einstieg", label: "Ich beschäftige mich gerade erst mit dem Islam." },
  { key: "grundlagen", label: "Ich kenne bereits die Grundlagen." },
  { key: "vertiefung", label: "Ich möchte mein Wissen vertiefen." },
];

const LENGTH_OPTIONS: { key: ReadingLengthKey | "beides"; label: string }[] = [
  { key: "kurz", label: "Kurze, leicht verständliche Bücher" },
  { key: "ausfuehrlich", label: "Ausführliche Bücher" },
  { key: "beides", label: "Beides" },
];

// "has the visitor already seen the questionnaire?" — kept in localStorage, read via an external store
// so the server render (overlay open) and the first client render agree.
const seenListeners = new Set<() => void>();
let seenFallback = false; // used when storage is blocked: remember for this page session only

function getSeen(): boolean {
  try {
    return !!window.localStorage.getItem(STORAGE_KEY) || seenFallback;
  } catch {
    return seenFallback;
  }
}
function subscribeSeen(listener: () => void) {
  seenListeners.add(listener);
  return () => {
    seenListeners.delete(listener);
  };
}
function markSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    seenFallback = true;
  }
  seenListeners.forEach((l) => l());
}

export function Onboarding({ books }: { books: RecommendBook[] }) {
  const seen = useSyncExternalStore(subscribeSeen, getSeen, () => false);
  const [forced, setForced] = useState(false);
  const open = !seen || forced;
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Answers>({ level: null, topics: [], length: null });
  const rootRef = useRef<HTMLDivElement>(null);
  const cart = useCart();

  const close = useCallback(() => {
    markSeen();
    document.documentElement.setAttribute("data-onboarding", "seen");
    setForced(false);
  }, []);

  // "Welches Buch passt zu dir?" link on the homepage reopens the questionnaire
  useEffect(() => {
    const reopen = () => {
      document.documentElement.removeAttribute("data-onboarding");
      setAnswers({ level: null, topics: [], length: null });
      setStep("intro");
      setForced(true);
    };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  // lock page scroll behind the overlay, close on Escape, move focus into the dialog
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    rootRef.current?.focus();
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) rootRef.current?.scrollTo({ top: 0 });
  }, [step, open]);

  if (!open) return null;

  const results = step === "result" ? recommend(books, answers) : [];
  const questionIndex = typeof step === "number" ? step : null;

  const toggleTopic = (key: TopicKey) =>
    setAnswers((a) => ({
      ...a,
      topics: a.topics.includes(key) ? a.topics.filter((t) => t !== key) : [...a.topics, key],
    }));

  return (
    <div
      ref={rootRef}
      data-onboarding-overlay
      role="dialog"
      aria-modal="true"
      aria-label="Welches Buch passt zu dir?"
      tabIndex={-1}
      className="fixed inset-0 z-[60] overflow-y-auto bg-paper outline-none"
    >
      <div className="mx-auto flex min-h-full max-w-xl flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <span className="font-serif text-[0.95rem] font-medium uppercase tracking-[0.16em] text-ink">
            {SITE_NAME}
          </span>
          <button
            type="button"
            onClick={close}
            className="-mr-3 flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Überspringen
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {questionIndex !== null && (
          <div className="mt-4" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={questionIndex + 1} aria-label="Fortschritt">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className={cn("h-1 flex-1 rounded-full", i <= questionIndex ? "bg-forest" : "bg-line-strong")} />
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-faint">Frage {questionIndex + 1} von 3</p>
          </div>
        )}

        <div className="flex flex-1 flex-col justify-center py-8">
          {step === "intro" && (
            <div>
              <GeometricMark className="h-7 w-7 text-ink-faint" />
              <h1 className="mt-6 font-serif text-[2.1rem] leading-[1.1] text-ink sm:text-5xl">
                Welches Buch passt zu dir?
              </h1>
              <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-ink-muted">
                Beantworte drei kurze Fragen und entdecke islamische Bücher, die zu deinen Interessen passen.
              </p>
              <div className="mt-8 flex flex-col items-start gap-3">
                <Button type="button" className="w-full sm:w-auto" onClick={() => setStep(0)}>
                  Jetzt starten
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Button>
                <Link
                  href="/buecher"
                  onClick={close}
                  className="flex min-h-11 items-center text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  Alle Bücher ansehen →
                </Link>
              </div>
            </div>
          )}

          {step === 0 && (
            <Question title="Wie würdest du deinen Wissensstand einschätzen?">
              {LEVEL_OPTIONS.map((o, i) => (
                <Option
                  key={o.key}
                  letter={"ABC"[i]}
                  selected={answers.level === o.key}
                  onClick={() => setAnswers((a) => ({ ...a, level: o.key }))}
                  role="radio"
                >
                  {o.label}
                </Option>
              ))}
            </Question>
          )}

          {step === 1 && (
            <Question title="Welche Themen interessieren dich besonders?" hint="Mehrfachauswahl möglich">
              {TOPICS.map((t) => (
                <Option
                  key={t.key}
                  selected={answers.topics.includes(t.key)}
                  onClick={() => toggleTopic(t.key)}
                  role="checkbox"
                  check
                >
                  {t.label}
                </Option>
              ))}
            </Question>
          )}

          {step === 2 && (
            <Question title="Welche Art von Büchern bevorzugst du?">
              {LENGTH_OPTIONS.map((o, i) => (
                <Option
                  key={o.key}
                  letter={"ABC"[i]}
                  selected={answers.length === o.key}
                  onClick={() => setAnswers((a) => ({ ...a, length: o.key }))}
                  role="radio"
                >
                  {o.label}
                </Option>
              ))}
            </Question>
          )}

          {step === "result" && (
            <div>
              <h1 className="font-serif text-[1.9rem] leading-[1.15] text-ink sm:text-4xl">
                {results.length > 0 ? "Diese Bücher könnten zu dir passen." : "Aktuell sind keine Bücher verfügbar."}
              </h1>
              {results.length > 0 && results.every((r) => r.tier === "alternative") && (
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  Zu deinen Antworten haben wir noch kein passend gekennzeichnetes Buch — hier sind andere
                  verfügbare Bücher.
                </p>
              )}

              <ul className="mt-6 space-y-5">
                {results.map(({ book, reasons }) => {
                  const inCart = cart.has(book.id);
                  return (
                    <li key={book.id} className="flex gap-4 border-b border-line pb-5 last:border-b-0">
                      <div className="w-20 shrink-0 sm:w-24">
                        <BookCover imagePath={book.image_path} title={book.title} sizes="96px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-serif text-lg leading-snug text-ink">{book.title}</h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{reasons.join(" ")}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link
                            href={`/buecher/${book.slug}`}
                            onClick={close}
                            className="inline-flex min-h-10 items-center rounded-full border border-line-strong px-4 text-sm text-ink transition-colors hover:border-ink"
                          >
                            Ansehen
                          </Link>
                          <button
                            type="button"
                            disabled={!inCart && cart.isFull}
                            onClick={() =>
                              inCart
                                ? cart.remove(book.id)
                                : cart.add({ id: book.id, slug: book.slug, title: book.title, image_path: book.image_path })
                            }
                            className={cn(
                              "inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm transition-colors disabled:opacity-40",
                              inCart ? "bg-forest-tint text-forest" : "bg-forest text-paper hover:bg-forest-soft",
                            )}
                          >
                            {inCart && <Check className="h-4 w-4" strokeWidth={2} />}
                            {inCart ? "Im Warenkorb" : "In den Warenkorb"}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex flex-col items-start gap-1">
                {cart.count > 0 && (
                  <Link
                    href="/warenkorb"
                    onClick={close}
                    className="flex min-h-11 items-center text-sm font-medium text-forest hover:underline"
                  >
                    Zum Warenkorb ({cart.count} von {cart.max}) →
                  </Link>
                )}
                <Link href="/buecher" onClick={close} className="flex min-h-11 items-center text-sm text-ink-muted hover:text-ink">
                  Alle Bücher ansehen →
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setAnswers({ level: null, topics: [], length: null });
                    setStep(0);
                  }}
                  className="flex min-h-11 items-center text-sm text-ink-muted hover:text-ink"
                >
                  Fragen noch einmal beantworten
                </button>
                <button type="button" onClick={close} className="flex min-h-11 items-center text-sm text-ink-muted hover:text-ink">
                  Schließen und weiter stöbern
                </button>
              </div>
            </div>
          )}
        </div>

        {questionIndex !== null && (
          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setStep(questionIndex === 0 ? "intro" : ((questionIndex - 1) as Step))}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              Zurück
            </button>
            <Button
              type="button"
              disabled={(questionIndex === 0 && !answers.level) || (questionIndex === 2 && !answers.length)}
              onClick={() => setStep(questionIndex === 2 ? "result" : ((questionIndex + 1) as Step))}
            >
              {questionIndex === 2 ? "Empfehlungen zeigen" : "Weiter"}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Question({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-serif text-[1.7rem] leading-[1.2] text-ink sm:text-4xl">{title}</h1>
      {hint && <p className="mt-2 text-sm text-ink-faint">{hint}</p>}
      <div className="mt-6 space-y-2.5" role="group" aria-label={title}>
        {children}
      </div>
    </div>
  );
}

function Option({
  children,
  selected,
  onClick,
  letter,
  check,
  role,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  letter?: string;
  check?: boolean;
  role: "radio" | "checkbox";
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-14 w-full items-center gap-3.5 rounded-md border px-4 py-3 text-left text-[0.97rem] leading-snug transition-colors",
        selected ? "border-forest bg-forest-tint text-ink" : "border-line-strong text-ink-muted hover:border-ink hover:text-ink",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center border text-xs font-medium transition-colors",
          check ? "rounded-md" : "rounded-full",
          selected ? "border-forest bg-forest text-paper" : "border-line-strong text-ink-faint",
        )}
      >
        {selected && check ? <Check className="h-4 w-4" strokeWidth={2} /> : letter}
        {selected && !check && !letter ? <Check className="h-4 w-4" strokeWidth={2} /> : null}
      </span>
      <span>{children}</span>
    </button>
  );
}
