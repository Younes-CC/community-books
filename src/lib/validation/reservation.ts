import * as z from "zod";

const requiredText = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} wird benötigt.`)
    .max(120, `${label} ist zu lang.`);

export const reservationSchema = z
  .object({
    bookId: z.uuid("Ungültiges Buch."),
    fulfillmentType: z.enum(["shipping", "pickup"]),
    firstName: requiredText("Vorname"),
    lastName: requiredText("Nachname"),
    email: z.email("Bitte gib eine gültige E-Mail-Adresse ein."),
    socialUsername: z.string().trim().max(60).optional().or(z.literal("")),
    street: z.string().trim().max(120).optional().or(z.literal("")),
    houseNumber: z.string().trim().max(20).optional().or(z.literal("")),
    postalCode: z.string().trim().max(20).optional().or(z.literal("")),
    city: z.string().trim().max(80).optional().or(z.literal("")),
    country: z.string().trim().max(60).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillmentType !== "shipping") return;
    const required: Array<[keyof typeof data, string]> = [
      ["street", "Straße"],
      ["houseNumber", "Hausnummer"],
      ["postalCode", "PLZ"],
      ["city", "Ort"],
      ["country", "Land"],
    ];
    for (const [field, label] of required) {
      if (!data[field] || !String(data[field]).trim()) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: `${label} wird für den Versand benötigt.`,
        });
      }
    }
  });

export type ReservationInput = z.infer<typeof reservationSchema>;
