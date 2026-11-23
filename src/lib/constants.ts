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
  new: "Anfrage",
  mail_sent: "Anleitung gesendet",
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

// The five manual processing steps of a TikTok order (cancelled is a separate technical state).
export const DM_STATUSES = ["new", "mail_sent", "qr_received", "packed", "shipped"] as const;
export type DmStatus = (typeof DM_STATUSES)[number];
export const isDmStatus = (s: string): s is DmStatus => (DM_STATUSES as readonly string[]).includes(s);

// Hermes orders use the five steps above; pickup orders have no QR code and need only three.
export const DM_PICKUP_STATUSES = ["new", "ready_for_pickup", "picked_up"] as const;
export const dmStatusesFor = (type: string): readonly OrderStatus[] =>
  type === "pickup" ? DM_PICKUP_STATUSES : DM_STATUSES;
// statuses in which a TikTok order can still be cancelled (finished orders cannot)
export const DM_CANCELLABLE: readonly string[] = ["new", "mail_sent", "qr_received", "packed", "ready_for_pickup"];

export type OrderSource = "website" | "tiktok_dm";
export const SOURCE_LABELS: Record<OrderSource, string> = { website: "Website", tiktok_dm: "TikTok" };

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
