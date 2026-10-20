import { TOPICS, type LevelKey, type ReadingLengthKey, type TopicKey } from "@/lib/constants";

export type RecommendBook = {
  id: string;
  slug: string;
  title: string;
  image_path: string | null;
  stock_available: number;
  topics: string[];
  levels: string[];
  reading_length: string | null;
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

// Rule-based scoring on the tags an admin maintains per book. No AI, nothing is stored or sent.
export function recommend(books: RecommendBook[], answers: Answers, limit = 3): Recommendation[] {
  const available = books.filter((b) => b.stock_available > 0);

  const scored = available.map((book) => {
    const reasons: string[] = [];
    let score = 0;

    const hits = answers.topics.filter((t) => book.topics.includes(t));
    if (hits.length) {
      score += hits.length * 3;
      reasons.push(`Passt zu deinem Interesse an ${hits.map(topicLabel).join(" und ")}.`);
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

    if (answers.length && answers.length !== "beides" && book.reading_length === answers.length) {
      score += 2;
      reasons.push(
        answers.length === "kurz"
          ? "Ein eher kurzes, leicht zugängliches Buch."
          : "Ein ausführlicheres Buch zum gründlichen Lesen.",
      );
    }

    return { book, reasons, score };
  });

  const matches = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.book.title.localeCompare(b.book.title, "de"))
    .slice(0, limit)
    .map<Recommendation>((s) => ({ book: s.book, reasons: s.reasons, tier: "match" }));

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
