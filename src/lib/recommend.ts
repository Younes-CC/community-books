import { LEVELS, TOPICS, type LevelKey, type ReadingLengthKey, type TopicKey } from "@/lib/constants";

export type RecommendBook = {
  id: string;
  slug: string;
  title: string;
  image_path: string | null;
  stock_available: number;
  topics: string[];
  levels: string[];
  reading_length: string | null;
  thickness_mm: number | null;
  dimensions_check: boolean;
  arabic_text_only: boolean;
};

export type Answers = {
  level: LevelKey | null;
  topics: TopicKey[];
  length: ReadingLengthKey | "beides" | null;
};

export type Recommendation = {
  book: RecommendBook;
  reasons: string[];
  tier: "match" | "alternative";
};

const topicLabel = (key: string) => TOPICS.find((t) => t.key === key)?.label ?? key;

// Physical size is only a weak hint for "Umfang": it says nothing about reading time or difficulty,
// so it is used (with half the weight of an explicit tag) only when no tag was set, and the
// wording talks about the object, not about how long reading takes.
const levelIndex = (key: string) => LEVELS.findIndex((l) => l.key === key);

const THIN_MM = 8;
const THICK_MM = 25;

// Rule-based scoring on the tags an admin maintains per book. No AI, nothing is stored or sent.
export function recommend(books: RecommendBook[], answers: Answers, limit = 3): Recommendation[] {
  // Arabic-only editions (e.g. a Hifz-Mushaf) help only people who read Arabic: suggest them
  // just to readers who chose the Qur'an at the deepening level, never as a filler.
  const wantsArabic = answers.level === "vertiefung" && answers.topics.includes("quran");
  const available = books.filter(
    (b) => b.stock_available > 0 && (!b.arabic_text_only || wantsArabic),
  );

  const scored = available.map((book) => {
    const reasons: string[] = [];
    let score = 0;
    let levelGap = 0;

    const hits = answers.topics.filter((t) => book.topics.includes(t));
    if (hits.length) {
      score += hits.length * 3;
      reasons.push(`Passt zu deinem Interesse an ${hits.map(topicLabel).join(" und ")}.`);
    }

    if (answers.level && book.levels.length > 0 && !book.levels.includes(answers.level)) {
      // a book for a very different knowledge level ranks below a closer one at equal score
      levelGap = Math.min(...book.levels.map((l) => Math.abs(levelIndex(l) - levelIndex(answers.level!))));
    }
    if (answers.level && book.levels.includes(answers.level)) {
      score += 2;
      reasons.push(
        answers.level === "einstieg"
          ? "Geeignet, wenn du dich gerade erst mit dem Islam beschäftigst."
          : answers.level === "grundlagen"
            ? "Geeignet, wenn du die Grundlagen bereits kennst."
            : "Geeignet, um dein Wissen zu vertiefen.",
      );
    }

    if (answers.length && answers.length !== "beides") {
      if (book.reading_length === answers.length) {
        score += 2;
        reasons.push(
          answers.length === "kurz"
            ? "Ein eher kurzes, leicht zugängliches Buch."
            : "Ein ausführlicheres Buch zum gründlichen Lesen.",
        );
      } else if (!book.reading_length && book.thickness_mm && !book.dimensions_check) {
        if (answers.length === "kurz" && book.thickness_mm <= THIN_MM) {
          score += 1;
          reasons.push("Ein schmales, handliches Buch.");
        } else if (answers.length === "ausfuehrlich" && book.thickness_mm >= THICK_MM) {
          score += 1;
          reasons.push("Ein umfangreicherer Band.");
        }
      }
    }

    if (book.arabic_text_only) {
      reasons.push("Enthält nur den arabischen Text, ohne Übersetzung — sinnvoll, wenn du Arabisch lesen kannst.");
    }

    return { book, reasons, score: score - levelGap * 0.5, topicHits: hits.length };
  });

  // The chosen interest decides first: a book that fits a chosen topic always ranks above one that
  // only fits level or length. Remaining ties go to the closer knowledge level, then to the title.
  const askedTopics = answers.topics.length > 0;
  const matches = scored
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        (askedTopics ? Number(b.topicHits > 0) - Number(a.topicHits > 0) : 0) ||
        b.score - a.score ||
        a.book.title.localeCompare(b.book.title, "de"),
    )
    .slice(0, limit)
    .map<Recommendation>((s) => ({
      book: s.book,
      reasons: askedTopics && s.topicHits === 0 ? ["Anderes Thema, passt aber zu deinen übrigen Antworten.", ...s.reasons] : s.reasons,
      tier: askedTopics && s.topicHits === 0 ? "alternative" : "match",
    }));

  if (matches.length >= limit) return matches;

  // fill up with other available books so the result is never empty
  const used = new Set(matches.map((m) => m.book.id));
  const alternatives = scored
    .filter((s) => !used.has(s.book.id))
    .sort((a, b) => a.book.title.localeCompare(b.book.title, "de"))
    .slice(0, limit - matches.length)
    .map<Recommendation>((s) => ({
      book: s.book,
      reasons: ["Ein weiteres verfügbares Buch aus unserem Katalog."],
      tier: "alternative",
    }));

  return [...matches, ...alternatives];
}
