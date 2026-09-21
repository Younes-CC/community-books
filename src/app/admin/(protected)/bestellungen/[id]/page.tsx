import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/lib/data/admin/orders";
import { BookCover } from "@/components/books/book-cover";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { OrderActions } from "@/components/admin/order-actions";
import { FULFILLMENT_LABELS, type OrderStatus, type PaymentStatus } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Bestellung — Admin" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">{order.order_number}</h1>
        <div className="flex gap-2">
          <PaymentStatusBadge status={order.payment_status as PaymentStatus} />
          <OrderStatusBadge status={order.order_status as OrderStatus} />
        </div>
      </div>

      <div className="mt-6 rounded-md border border-line p-5">
        <OrderActions
          orderId={order.id}
          orderNumber={order.order_number}
          orderStatus={order.order_status as OrderStatus}
          paymentStatus={order.payment_status}
          fulfillmentType={order.fulfillment_type}
        />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[120px_1fr]">
        <div className="w-28">
          <BookCover imagePath={order.book_image_path} title={order.book_title_snapshot} />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <Field label="Buch" value={order.book_title_snapshot} full />
          <Field label="Name" value={`${order.first_name} ${order.last_name}`} />
          <Field label="E-Mail" value={order.email} />
          <Field label="Social" value={order.social_username || "—"} />
          <Field
            label="Übergabeart"
            value={FULFILLMENT_LABELS[order.fulfillment_type as "shipping" | "pickup"]}
          />
          <Field label="Datum" value={formatDate(order.created_at)} />
          <Field label="Betrag" value={formatPrice(order.total)} />
          <Field
            label="Versand & Verpackung"
            value={formatPrice(order.shipping_price)}
          />

          {order.fulfillment_type === "shipping" && (
            <Field
              label="Versandadresse"
              full
              value={`${order.street ?? ""} ${order.house_number ?? ""}\n${order.postal_code ?? ""} ${order.city ?? ""}\n${order.country ?? ""}`}
              multiline
            />
          )}

          {order.reservation_expires_at && (
            <Field label="Reservierung gültig bis" value={formatDate(order.reservation_expires_at)} />
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  full,
  multiline,
}: {
  label: string;
  value: string;
  full?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : undefined}>
      <dt className="text-xs uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className={`mt-1 text-ink ${multiline ? "whitespace-pre-line" : ""}`}>{value}</dd>
    </div>
  );
}
