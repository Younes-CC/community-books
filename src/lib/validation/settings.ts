import * as z from "zod";

const text = (max: number) => z.string().trim().max(max);
const intRange = (min: number, max: number, msg: string) =>
  z.coerce.number().int(msg).min(min, msg).max(max, msg);

export const settingsSchema = z.object({
  hermesPrice: z.coerce.number().min(0, "Darf nicht negativ sein.").max(100, "Unrealistisch hoch."),
  defaultParcelClass: z.enum(["Paeckchen", "S", "M", "L"]),
  hermesSMaxCm: intRange(10, 300, "Bitte einen Wert zwischen 10 und 300 cm angeben."),
  packagingPaddingCm: intRange(0, 20, "Bitte einen Wert zwischen 0 und 20 cm angeben."),
  processingTimeText: text(60).min(1, "Bitte angeben."),
  projectEmail: z.union([z.literal(""), z.email("Bitte eine gültige E-Mail-Adresse angeben.").max(200)]),
  senderName: text(120),
  hermesSenderStreet: text(160),
  hermesSenderZipCity: text(160),
  qrDeadlineHours: intRange(1, 720, "Bitte 1–720 Stunden angeben."),
  internalProcessingHours: intRange(1, 720, "Bitte 1–720 Stunden angeben."),
  autoCancelHours: intRange(1, 2160, "Bitte 1–2160 Stunden angeben."),
  pickupPublicLocation: text(80).min(1, "Bitte angeben."),
  pickupAddress: text(300),
  pickupInstructions: text(2000),
  pickupDeadlineDays: intRange(1, 90, "Bitte 1–90 Tage angeben."),
  hermesInstructions: text(6000),
  hermesEmailSubject: text(200),
  hermesEmailBody: text(8000),
  pickupEmailSubject: text(200),
  pickupEmailBody: text(8000),
  rateLimitAttemptsPerHour: intRange(1, 1000, "Bitte 1–1000 angeben."),
  rateLimitOrdersPerIpDay: intRange(1, 1000, "Bitte 1–1000 angeben."),
  rateLimitOrdersGlobalHour: intRange(1, 10000, "Bitte 1–10000 angeben."),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
