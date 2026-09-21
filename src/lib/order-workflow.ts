import type { OrderAction } from "@/lib/actions/admin/orders";
import type { OrderStatus } from "@/lib/constants";

export const ACTION_LABELS: Record<OrderAction, string> = {
  confirm_payment: "Zahlung bestätigen",
  mark_packing: "Als verpackt markieren",
  mark_shipped: "Als versendet markieren",
  mark_ready_for_pickup: "Abholbereit",
  mark_completed: "Abgeholt / Abgeschlossen",
  extend_reservation: "Reservierung verlängern",
  cancel: "Stornieren",
};

type OrderLike = {
  orderStatus: OrderStatus;
  paymentStatus: string;
  fulfillmentType: string;
};

// Mirrors the transitions enforced in admin_set_order_status(); the database
// stays authoritative, this only decides which buttons to offer.
export function availableActions({ orderStatus, paymentStatus, fulfillmentType }: OrderLike) {
  const actions: OrderAction[] = [];
  if (paymentStatus === "pending") actions.push("confirm_payment");
  if (["paid", "reserved"].includes(orderStatus)) actions.push("mark_packing");
  if (fulfillmentType === "shipping" && ["packing", "paid"].includes(orderStatus)) {
    actions.push("mark_shipped");
  }
  if (fulfillmentType === "pickup" && orderStatus === "reserved") {
    actions.push("mark_ready_for_pickup");
  }
  if (["shipped", "ready_for_pickup", "reserved", "paid"].includes(orderStatus)) {
    actions.push("mark_completed");
  }
  if (orderStatus === "awaiting_payment") actions.push("extend_reservation");
  return actions;
}

export function canCancel(orderStatus: OrderStatus) {
  return !["cancelled", "completed", "expired"].includes(orderStatus);
}

// The single most likely next step, for one-click use in the list view.
export function nextAction({ orderStatus, fulfillmentType }: OrderLike): OrderAction | null {
  switch (orderStatus) {
    case "awaiting_payment":
      return "confirm_payment";
    case "paid":
      return "mark_packing";
    case "packing":
      return "mark_shipped";
    case "shipped":
    case "ready_for_pickup":
      return "mark_completed";
    case "reserved":
      return fulfillmentType === "pickup" ? "mark_ready_for_pickup" : "mark_packing";
    default:
      return null;
  }
}

const HOLDS_STOCK: OrderStatus[] = [
  "reserved",
  "awaiting_payment",
  "paid",
  "packing",
  "ready_for_pickup",
];

export function deleteConfirmMessage(orderNumber: string, orderStatus: OrderStatus) {
  const stock = HOLDS_STOCK.includes(orderStatus)
    ? "Das reservierte Exemplar wird dem Bestand wieder gutgeschrieben."
    : "Der Bestand bleibt unverändert.";
  return `${orderNumber} endgültig löschen? Alle Daten (inkl. Adresse) werden entfernt. ${stock}`;
}
