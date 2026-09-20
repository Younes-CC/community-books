export const SITE_NAME = "Community Books";
export const SITE_TAGLINE = "Bücher, die weitergegeben werden.";

export const COUNTRIES = [
  "Deutschland",
  "Österreich",
  "Schweiz",
] as const;

export type OrderStatus =
  | "reserved"
  | "awaiting_payment"
  | "paid"
  | "packing"
  | "shipped"
  | "ready_for_pickup"
  | "completed"
  | "cancelled"
  | "expired";

export type PaymentStatus = "not_required" | "pending" | "paid";
export type FulfillmentType = "shipping" | "pickup";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  reserved: "Reserviert",
  awaiting_payment: "Zahlung offen",
  paid: "Bezahlt",
  packing: "Wird verpackt",
  shipped: "Versendet",
  ready_for_pickup: "Abholbereit",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
  expired: "Abgelaufen",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  not_required: "Nicht erforderlich",
  pending: "Ausstehend",
  paid: "Bezahlt",
};

export const FULFILLMENT_LABELS: Record<FulfillmentType, string> = {
  shipping: "Versand",
  pickup: "Abholung",
};
