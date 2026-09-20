import * as z from "zod";

export const bookSchema = z.object({
  title: z.string().trim().min(1, "Titel wird benötigt.").max(200),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  stockTotal: z.coerce.number().int().min(0, "Anzahl darf nicht negativ sein.").max(100000),
  imagePath: z.string().trim().max(300).optional().or(z.literal("")),
});

export type BookInput = z.infer<typeof bookSchema>;
