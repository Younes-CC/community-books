import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminOrderDetail, getAdmins } from "@/lib/data/admin/orders";
import { getAdminSettings } from "@/lib/data/settings";
import { BookCover } from "@/components/books/book-cover";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { AssigneeSelect } from "@/components/admin/assignee-select";
import { OrderDetailActions } from "@/components/admin/order-detail-actions";
import { OrderEmailPanel } from "@/components/admin/order-email-panel";
import { OrderDetailsForm } from "@/components/admin/order-details-form";
import { ParcelCard } from "@/components/admin/parcel-card";
import {
  FULFILLMENT_LABELS,
  ORDER_STATUS_LABELS,
  parcelClassLabel,
  type FulfillmentType,
  type OrderStatus,
} from "@/lib/constants";
import { isFinal } from "@/lib/order-workflow";
import { describeEstimate, estimateParcel, needsParcelCheck } from "@/lib/parcel";
import { buildDraft } from "@/lib/email-draft";
import { formatDate } from "@/lib/format";
import { formatRemaining, serverNow } from "@/lib/time";

export const metadata: Metadata = { title: "Bestellung — Admin" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();
  const [detail, admins, settings] = await Promise.all([getAdminOrderDetail(id), getAdmins(), getAdminSettings()]);
  if (!detail) notFound();

  const { order, items, history } = detail;
  const status = order.order_status as OrderStatus;
  const type = order.fulfillment_type as FulfillmentType;
  const isShipping = type === "shipping";
  const final = isFinal(status);
  const now = serverNow();

  const adminOptions = admins.map((a) => ({
    userId: a.user_id,
    code: a.code,
    name: a.display_name ?? a.email ?? "Admin",
  }));
  const adminName = new Map(adminOptions.map((a) => [a.userId, a.name]));

  const estimate = estimateParcel(
    items.map((i) => i.dims),
    { sMaxCm: settings.hermes_s_max_cm, paddingCm: settings.packaging_padding_cm },
  );
  const suggestedClass = estimate.status === "unknown" ? settings.default_parcel_class : estimate.suggestedClass;
  const effectiveClass = order.parcel_class_override ?? suggestedClass;
  const parcelNeedsCheck = isShipping && needsParcelCheck(estimate, order.parcel_class_override);

  const { draft, warnings } = buildDraft({
    order,
    titles: items.map((i) => i.title),
    settings,
    parcelClass: effectiveClass,
  });

  const dueRemaining = status === "new" ? formatRemaining(order.internal_due_at, now) : null;
  const qrRemaining = status === "mail_sent" ? formatRemaining(order.qr_deadline_at, now) : null;
  const pickupRemaining =
    status === "arrange_pickup" || status === "ready_for_pickup" ? formatRemaining(order.pickup_deadline_at, now) : null;

  const timeline: { label: string; value: string | null }[] = [
    { label: "Eingegangen", value: order.created_at },
    { label: "Bearbeiten bis", value: status === "new" ? order.internal_due_at : null },
    { label: "Mail versendet", value: order.mail_sent_at },
    { label: "QR-Frist", value: status === "mail_sent" ? order.qr_deadline_at : null },
    { label: "QR-Code erhalten", value: order.qr_received_at },
    { label: "Abholtermin", value: order.pickup_appointment_at },
    { label: "Abholfrist", value: order.pickup_deadline_at },
    { label: "Versendet", value: order.shipped_at },
    { label: "Abgeschlossen", value: order.completed_at },
    { label: "Storniert", value: order.cancelled_at },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-ink-muted hover:text-ink">
        ← Alle Bestellungen
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-ink">{order.order_number}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {FULFILLMENT_LABELS[type]} · {order.first_name} {order.last_name}
          </p>
        </div>
        <OrderStatusBadge status={status} className="text-sm" />
      </header>

      {dueRemaining?.overdue && (
        <p className="flex items-start gap-2 rounded-md border border-brick/40 bg-brick-tint px-4 py-3 text-sm text-brick">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          Überfällig: Die interne Bearbeitungsfrist ist {dueRemaining.text.replace("seit ", "seit ")}. Der Empfänger hat noch
          keine Anleitung erhalten.
        </p>
      )}
      {qrRemaining?.overdue && (
        <p className="flex items-start gap-2 rounded-md border border-brick/40 bg-brick-tint px-4 py-3 text-sm text-brick">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          Die QR-Frist ist abgelaufen. Die Reservierung wird beim nächsten automatischen Lauf (alle 15 Min.) aufgehoben,
          sofern der QR-Code nicht bestätigt wird.
        </p>
      )}

      <section className="rounded-md border border-line p-4 sm:p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h2 className="text-xs uppercase tracking-wide text-ink-faint">Bearbeiter</h2>
            <AssigneeSelect orderId={order.id} value={order.assigned_to} admins={adminOptions} className="mt-1.5" />
          </div>
          <div className="text-sm">
            <h2 className="text-xs uppercase tracking-wide text-ink-faint">Reservierungszeit</h2>
            <p className="mt-1.5 text-ink">
              {dueRemaining && <span className={dueRemaining.overdue ? "text-brick" : ""}>Bearbeiten bis: {dueRemaining.text}</span>}
              {qrRemaining && <span className={qrRemaining.overdue ? "text-brick" : ""}>QR-Code bis: {qrRemaining.text}</span>}
              {pickupRemaining && <span className={pickupRemaining.overdue ? "text-brick" : ""}>Abholfrist: {pickupRemaining.text}</span>}
              {!dueRemaining && !qrRemaining && !pickupRemaining && <span className="text-ink-faint">Keine laufende Frist</span>}
            </p>
          </div>
        </div>
        <div className="mt-5 border-t border-line pt-5">
          <OrderDetailActions
            orderId={order.id}
            orderNumber={order.order_number}
            status={status}
            type={type}
            qrDeadlineHours={settings.qr_deadline_hours}
          />
        </div>
      </section>

      {!final && (
        <OrderEmailPanel
          orderId={order.id}
          kind={isShipping ? "hermes" : "pickup"}
          status={status}
          draft={draft}
          warnings={warnings}
          blockedReason={
            parcelNeedsCheck
              ? "Bitte zuerst die Paketklasse prüfen und bestätigen (Abschnitt „Paketgröße“ weiter unten) — erst dann kann die Anleitung vorbereitet werden."
              : null
          }
          mailSentAt={order.mail_sent_at}
          senderEmail={settings.project_email}
          qrDeadlineHours={settings.qr_deadline_hours}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-line p-4 sm:p-5">
          <h2 className="font-serif text-lg text-ink">Bücher ({items.length})</h2>
          <ul className="mt-3 divide-y divide-line">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-12 shrink-0">
                  <BookCover imagePath={item.imagePath} title={item.title} sizes="48px" />
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-base leading-snug text-ink">{item.title}</p>
                  <p className="text-xs text-ink-faint">1 Exemplar</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-md border border-line p-4 sm:p-5">
          <h2 className="font-serif text-lg text-ink">Empfänger</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <Row label="Name" value={`${order.first_name} ${order.last_name}`} />
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-faint">E-Mail</dt>
              <dd className="mt-0.5 break-all">
                <a href={`mailto:${order.email}`} className="text-ink underline-offset-2 hover:underline">
                  {order.email}
                </a>
              </dd>
            </div>
            <Row label="Instagram / TikTok" value={order.social_username || "—"} />
            {isShipping ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-faint">Versandadresse</dt>
                <dd className="mt-0.5 whitespace-pre-line text-ink">
                  {`${order.street ?? ""} ${order.house_number ?? ""}\n${order.postal_code ?? ""} ${order.city ?? ""}\n${order.country ?? ""}`}
                </dd>
              </div>
            ) : (
              <Row label="Adresse" value={`Keine — Abholung (${settings.pickup_public_location})`} />
            )}
          </dl>
        </section>
      </div>

      {isShipping && (
        <section className="rounded-md border border-line p-4 sm:p-5">
          <h2 className="font-serif text-lg text-ink">Paketgröße</h2>
          <div className="mt-3">
            <ParcelCard
              orderId={order.id}
              estimateText={describeEstimate(estimate)}
              estimateOk={estimate.status === "fits"}
              suggestedClass={suggestedClass}
              override={order.parcel_class_override}
              locked={final}
            />
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-line p-4 sm:p-5">
          <h2 className="font-serif text-lg text-ink">Details &amp; Notizen</h2>
          <div className="mt-3">
            <OrderDetailsForm
              orderId={order.id}
              notes={order.notes}
              isPickup={!isShipping}
              isShipping={isShipping}
              pickupAppointment={order.pickup_appointment_at}
              pickupDeadline={order.pickup_deadline_at}
              parcelOverride={order.parcel_class_override}
              parcelHint={parcelClassLabel(suggestedClass)}
            />
          </div>
        </section>

        <section className="rounded-md border border-line p-4 sm:p-5">
          <h2 className="font-serif text-lg text-ink">Zeitstempel</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {timeline
              .filter((t) => t.value)
              .map((t) => (
                <div key={t.label} className="flex justify-between gap-4">
                  <dt className="text-ink-muted">{t.label}</dt>
                  <dd className="text-right text-ink">{formatDate(t.value as string)}</dd>
                </div>
              ))}
          </dl>
        </section>
      </div>

      <section className="rounded-md border border-line p-4 sm:p-5">
        <h2 className="font-serif text-lg text-ink">Statusverlauf</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">Noch keine Einträge.</p>
        ) : (
          <ol className="mt-4 space-y-4 border-l border-line pl-5">
            {[...history].reverse().map((h) => {
              const from = h.from_status ? ORDER_STATUS_LABELS[h.from_status as OrderStatus] ?? h.from_status : null;
              const to = h.to_status ? ORDER_STATUS_LABELS[h.to_status as OrderStatus] ?? h.to_status : null;
              const who =
                h.source === "system"
                  ? "Automatisch"
                  : h.source === "customer"
                    ? "Empfänger"
                    : (h.actor_name ?? (h.actor ? adminName.get(h.actor) : null) ?? "Admin");
              return (
                <li key={h.id} className="relative text-sm">
                  <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-forest" />
                  <p className="text-ink">
                    {h.event === "status" || h.event === "mail_sent" ? (
                      <>
                        {h.event === "status" && from ? (
                          <>
                            {from} → <strong className="font-medium">{to}</strong>
                          </>
                        ) : (
                          <strong className="font-medium">{to ?? "Eingegangen"}</strong>
                        )}
                      </>
                    ) : null}
                    {h.note && <span className="text-ink-muted">{h.event === "status" && from ? " · " : ""}{h.note}</span>}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {formatDate(h.created_at)} · {who}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}
