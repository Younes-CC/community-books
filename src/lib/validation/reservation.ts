import * as z from "zod";
import { MAX_BOOKS_PER_PERSON } from "@/lib/constants";

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} wird benötigt.`).max(120, `${label} ist zu lang.`);

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const reservationSchema = z
  .object({
    bookIds: z
      .array(z.uuid("Ungültiges Buch."))
      .min(1, "Dein Warenkorb ist leer.")
      .max(MAX_BOOKS_PER_PERSON, `Maximal ${MAX_BOOKS_PER_PERSON} Bücher pro Person.`)
      .refine((ids) => new Set(ids).size === ids.length, "Jedes Buch kann nur einmal ausgewählt werden."),
    fulfillmentType: z.enum(["shipping", "pickup"]),
    firstName: requiredText("Vorname"),
    lastName: requiredText("Nachname"),
    email: z.email("Bitte gib eine gültige E-Mail-Adresse ein.").max(200),
    socialUsername: optionalText(60),
    street: optionalText(120),
    houseNumber: optionalText(20),
    postalCode: optionalText(20),
    city: optionalText(80),
    country: optionalText(60),
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
