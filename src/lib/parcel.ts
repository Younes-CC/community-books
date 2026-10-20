// Estimates the outer size of a packed box for a set of books and compares it with the
// configured Hermes S-Paket limit. Hermes classifies by "longest side + shortest side"
// (S-Paket: max. 50 cm, source: myhermes.de "Päckchen & Pakete"); the limit is configurable
// because Hermes may change its conditions. This is an ESTIMATE, never a guarantee.

export type BookDims = {
  width_mm: number | null;
  height_mm: number | null;
  thickness_mm: number | null;
  weight_g?: number | null;
};

export type ParcelEstimate =
  | { status: "unknown"; missing: number }
  | {
      status: "fits" | "tight" | "exceeds";
      boxCm: [number, number, number];
      sumCm: number;
      limitCm: number;
      suggestedClass: "S" | "M" | "L";
    };

const SAFETY_MARGIN_CM = 3;

export function estimateParcel(
  books: BookDims[],
  opts: { sMaxCm: number; paddingCm: number },
): ParcelEstimate {
  const missing = books.filter((b) => !b.width_mm || !b.height_mm || !b.thickness_mm).length;
  if (books.length === 0 || missing > 0) return { status: "unknown", missing: books.length === 0 ? 1 : missing };

  // books lie flat on top of each other; the box is sized by the biggest cover plus the stack height
  const longest = Math.max(...books.map((b) => Math.max(b.width_mm!, b.height_mm!)));
  const shorter = Math.max(...books.map((b) => Math.min(b.width_mm!, b.height_mm!)));
  const stack = books.reduce((sum, b) => sum + b.thickness_mm!, 0);

  const dims = [longest / 10 + opts.paddingCm, shorter / 10 + opts.paddingCm, stack / 10 + opts.paddingCm].sort(
    (a, b) => b - a,
  );
  const sumCm = Math.round((dims[0] + dims[2]) * 10) / 10; // longest + shortest side
  const round = (n: number) => Math.round(n * 10) / 10;

  const suggestedClass = sumCm <= opts.sMaxCm ? "S" : sumCm <= 80 ? "M" : "L";
  const status = sumCm > opts.sMaxCm ? "exceeds" : sumCm > opts.sMaxCm - SAFETY_MARGIN_CM ? "tight" : "fits";

  return {
    status,
    boxCm: [round(dims[0]), round(dims[1]), round(dims[2])],
    sumCm,
    limitCm: opts.sMaxCm,
    suggestedClass,
  };
}

export function describeEstimate(e: ParcelEstimate): string {
  switch (e.status) {
    case "unknown":
      return "Buchmaße fehlen — Paketklasse bitte manuell prüfen.";
    case "fits":
      return `Passt voraussichtlich in ein S-Paket (geschätzter Karton ${e.boxCm.join(" × ")} cm, längste + kürzeste Seite ${e.sumCm} cm von max. ${e.limitCm} cm).`;
    case "tight":
      return `Grenzwertig für ein S-Paket (längste + kürzeste Seite ${e.sumCm} cm von max. ${e.limitCm} cm) — bitte manuell prüfen.`;
    case "exceeds":
      return `Passt voraussichtlich nicht in ein S-Paket (längste + kürzeste Seite ${e.sumCm} cm, Limit ${e.limitCm} cm) — ${e.suggestedClass}-Paket prüfen.`;
  }
}

// true when an admin should look at the parcel class before sending instructions
export function needsParcelCheck(e: ParcelEstimate, override: string | null): boolean {
  if (override) return false;
  return e.status !== "fits";
}
