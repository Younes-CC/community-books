import type { FulfillmentType, OrderStatus } from "@/lib/constants";

export const HERMES_WORKFLOW: OrderStatus[] = [
  "new",
  "mail_sent",
  "qr_received",
  "processing",
  "packed",
  "shipped",
  "completed",
];

export const PICKUP_WORKFLOW: OrderStatus[] = [
  "new",
  "arrange_pickup",
  "ready_for_pickup",
  "picked_up",
  "completed",
];

export function workflowFor(type: FulfillmentType): OrderStatus[] {
  return type === "shipping" ? HERMES_WORKFLOW : PICKUP_WORKFLOW;
}

export const FINAL_STATUSES: OrderStatus[] = ["completed", "cancelled", "expired"];

// statuses in which the reserved copies are still held back from stock
const HOLDS_STOCK: OrderStatus[] = [
  "new",
  "mail_sent",
  "qr_received",
  "processing",
  "packed",
  "arrange_pickup",
  "ready_for_pickup",
];

export const isFinal = (s: OrderStatus) => FINAL_STATUSES.includes(s);
export const holdsStock = (s: OrderStatus) => HOLDS_STOCK.includes(s);
export const canCancel = (s: OrderStatus) => holdsStock(s);

// Button label for moving an order INTO the given status.
export const STEP_LABELS: Partial<Record<OrderStatus, string>> = {
  mail_sent: "Mail als versendet markieren",
  qr_received: "QR-Code als erhalten markieren",
  processing: "In Bearbeitung setzen",
  packed: "Als verpackt markieren",
  shipped: "Als versendet markieren",
  completed: "Abschließen",
  arrange_pickup: "Abholung vereinbaren",
  ready_for_pickup: "Abholbereit",
  picked_up: "Als abgeholt markieren",
};

// Steps that cannot sensibly be undone / that customers will notice → ask for confirmation first.
export const CONFIRM_STEPS: OrderStatus[] = ["shipped", "completed", "picked_up"];

export function nextStatus(type: FulfillmentType, status: OrderStatus): OrderStatus | null {
  if (isFinal(status)) return null;
  const wf = workflowFor(type);
  const i = wf.indexOf(status);
  return i >= 0 && i < wf.length - 1 ? wf[i + 1] : null;
}

export function deleteConfirmMessage(orderNumber: string, status: OrderStatus) {
  const stock = holdsStock(status)
    ? "Die reservierten Exemplare werden dem Bestand wieder gutgeschrieben."
    : "Der Bestand bleibt unverändert.";
  return `${orderNumber} endgültig löschen? Alle Daten (inkl. Adresse) werden entfernt. ${stock}`;
}
