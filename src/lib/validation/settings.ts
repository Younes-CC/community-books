import * as z from "zod";

export const settingsSchema = z.object({
  shippingPrice: z.coerce.number().min(0, "Darf nicht negativ sein.").max(500),
  paymentUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https:\/\//.test(v), "Bitte eine gültige https-URL angeben."),
  reservationDurationHours: z.coerce
    .number()
    .int()
    .min(1, "Muss mindestens 1 Stunde sein.")
    .max(24 * 30),
});
