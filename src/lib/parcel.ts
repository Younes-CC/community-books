// Estimates the outer size of a packed box for a set of books and compares it with the
// configured Hermes S-Paket limit. Hermes classifies by "longest side + shortest side"
// (S-Paket: max. 50 cm, source: myhermes.de "Päckchen & Pakete"); the limit is configurable
// because Hermes may change its conditions. This is an ESTIMATE, never a guarantee.

export type BookDims = {
  width_mm: number | null;
  height_mm: number | null;
  thickness_mm: number | null;
  weight_g?: number | null;
  // admin flagged the measurements of this book as uncertain (e.g. a suspiciously thin value)
  dimensions_check?: boolean | null;
};

export type ParcelEstimate =
  | { status: "unknown"; missing: number }
  | {
      status: "fits" | "tight" | "exceeds";
      boxCm: [number, number, number];
      sumCm: number;
      limitCm: number;
      suggestedClass: "S" | "M" | "L";
      weightG: number | null; // sum of the book weights, null if a weight is missing
      uncertainBooks: number; // books with unverified measurements
    };

const SAFETY_MARGIN_CM = 3;
// Hermes S-Paket: max. 25 kg (myhermes.de, Preis- und Serviceübersicht ab 02.03.2026)
const MAX_WEIGHT_G = 25_000;
// extra stack height assumed for books whose thickness is flagged as unverified
const UNCERTAIN_EXTRA_MM = 10;

function boxFor(books: BookDims[], paddingCm: number, extraMmForUncertain: number) {
  // books lie flat on top of each other; the box is sized by the biggest cover plus the stack height
  const longest = Math.max(...books.map((b) => Math.max(b.width_mm!, b.height_mm!)));
  const shorter = Math.max(...books.map((b) => Math.min(b.width_mm!, b.height_mm!)));
  const stack = books.reduce((sum, b) => sum + b.thickness_mm! + (b.dimensions_check ? extraMmForUncertain : 0), 0);
  const dims = [longest / 10 + paddingCm, shorter / 10 + paddingCm, stack / 10 + paddingCm].sort((a, b) => b - a);
  return { dims, sumCm: Math.round((dims[0] + dims[2]) * 10) / 10 }; // longest + shortest side
}

export function estimateParcel(
  books: BookDims[],
  opts: { sMaxCm: number; paddingCm: number },
): ParcelEstimate {
  const missing = books.filter((b) => !b.width_mm || !b.height_mm || !b.thickness_mm).length;
  if (books.length === 0 || missing > 0) return { status: "unknown", missing: books.length === 0 ? 1 : missing };

  const uncertainBooks = books.filter((b) => b.dimensions_check).length;
  const base = boxFor(books, opts.paddingCm, 0);
  // with unverified measurements the worse of "as measured" and "plus extra thickness" counts
  const worst = uncertainBooks > 0 ? boxFor(books, opts.paddingCm, UNCERTAIN_EXTRA_MM) : base;
  const sumCm = Math.max(base.sumCm, worst.sumCm);
  const round = (n: number) => Math.round(n * 10) / 10;

  const weights = books.map((b) => b.weight_g);
  const weightG = weights.every((w) => typeof w === "number" && w > 0) ? (weights as number[]).reduce((a, b) => a + b, 0) : null;

  const suggestedClass = sumCm <= opts.sMaxCm ? "S" : sumCm <= 80 ? "M" : "L";
  const overweight = weightG !== null && weightG > MAX_WEIGHT_G;
  const status =
    sumCm > opts.sMaxCm || overweight ? "exceeds" : sumCm > opts.sMaxCm - SAFETY_MARGIN_CM ? "tight" : "fits";

  return {
    status,
    boxCm: [round(worst.dims[0]), round(worst.dims[1]), round(worst.dims[2])],
    sumCm,
    limitCm: opts.sMaxCm,
    suggestedClass,
    weightG,
    uncertainBooks,
  };
}

export function describeEstimate(e: ParcelEstimate): string {
  switch (e.status) {
    case "unknown":
      return "Buchmaße fehlen — Paketklasse bitte manuell prüfen.";
    case "fits":
      return `Passt voraussichtlich in ein S-Paket (geschätzter Karton ${e.boxCm.join(" × ")} cm, längste + kürzeste Seite ${e.sumCm} cm von max. ${e.limitCm} cm${weightText(e)}).${uncertainText(e)} Schätzung — der tatsächlich gepackte Karton entscheidet.`;
    case "tight":
      return `Grenzwertig für ein S-Paket (längste + kürzeste Seite ${e.sumCm} cm von max. ${e.limitCm} cm${weightText(e)}) — bitte manuell prüfen.${uncertainText(e)}`;
    case "exceeds":
      return `Passt voraussichtlich nicht in ein S-Paket (längste + kürzeste Seite ${e.sumCm} cm, Limit ${e.limitCm} cm${weightText(e)}) — ${e.suggestedClass}-Paket prüfen.${uncertainText(e)}`;
  }
}

type KnownEstimate = Exclude<ParcelEstimate, { status: "unknown" }>;
const weightText = (e: KnownEstimate) => (e.weightG ? `, ca. ${(e.weightG / 1000).toLocaleString("de-DE", { maximumFractionDigits: 2 })} kg` : "");
const uncertainText = (e: KnownEstimate) =>
  e.uncertainBooks > 0 ? ` Bei ${e.uncertainBooks === 1 ? "einem Buch" : `${e.uncertainBooks} Büchern`} sind die Maße noch unbestätigt (mit Aufschlag gerechnet).` : "";

// true when an admin should look at the parcel class before sending instructions
export function needsParcelCheck(e: ParcelEstimate, override: string | null): boolean {
  if (override) return false;
  return e.status !== "fits";
}
