export const SITE_NAME = "readdeen4free";
export const SITE_TAGLINE = "Bücher, die weitergegeben werden.";
export const SITE_EYEBROW = "Lesen · Lernen · Weitergeben";
export const SITE_DESCRIPTION =
  "Neue islamische Bücher, kostenlos für dich. Maximal drei Bücher pro Person — Versand per Hermes oder persönliche Abholung.";

// UI limit. The authoritative limit lives in the database (settings.max_books_per_person, default 3).
export const MAX_BOOKS_PER_PERSON = 3;

export const COUNTRIES = ["Deutschland", "Österreich", "Schweiz"] as const;

export type OrderStatus =
  | "new"
  | "mail_sent"
  | "qr_received"
  | "processing"
  | "packed"
  | "shipped"
  | "arrange_pickup"
  | "ready_for_pickup"
  | "picked_up"
  | "completed"
  | "cancelled"
  | "expired";

export type FulfillmentType = "shipping" | "pickup";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Neu eingegangen",
  mail_sent: "Mail versendet",
  qr_received: "QR-Code erhalten",
  processing: "In Bearbeitung",
  packed: "Verpackt",
  shipped: "Versendet",
  arrange_pickup: "Abholung vereinbaren",
  ready_for_pickup: "Abholbereit",
  picked_up: "Abgeholt",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
  expired: "Abgelaufen",
};

export const FULFILLMENT_LABELS: Record<FulfillmentType, string> = {
  shipping: "Hermes-Versand",
  pickup: "Abholung",
};

export const TOPICS = [
  { key: "grundlagen", label: "Grundlagen des Islam" },
  { key: "quran", label: "Qur'an" },
  { key: "prophet", label: "Leben des Propheten ﷺ" },
  { key: "gebet", label: "Gebet und Gottesdienst" },
  { key: "charakter", label: "Islamischer Charakter und Alltag" },
  { key: "religionen", label: "Islam und andere Religionen" },
] as const;
export type TopicKey = (typeof TOPICS)[number]["key"];

export const LEVELS = [
  { key: "einstieg", label: "Einstieg" },
  { key: "grundlagen", label: "Grundlagen" },
  { key: "vertiefung", label: "Vertiefung" },
] as const;
export type LevelKey = (typeof LEVELS)[number]["key"];

export const READING_LENGTHS = [
  { key: "kurz", label: "Kurz und leicht verständlich" },
  { key: "ausfuehrlich", label: "Ausführlich" },
] as const;
export type ReadingLengthKey = (typeof READING_LENGTHS)[number]["key"];

export const PARCEL_CLASSES = [
  { key: "Paeckchen", label: "Päckchen" },
  { key: "S", label: "S-Paket" },
  { key: "M", label: "M-Paket" },
  { key: "L", label: "L-Paket" },
] as const;
export type ParcelClassKey = (typeof PARCEL_CLASSES)[number]["key"];

export function parcelClassLabel(key: string | null | undefined): string {
  return PARCEL_CLASSES.find((p) => p.key === key)?.label ?? (key ? `${key}-Paket` : "S-Paket");
}
