import * as z from "zod";

export const bookSchema = z.object({
  title: z.string().trim().min(1, "Titel wird benötigt.").max(200),
  author: z.string().trim().min(1, "Autor wird benötigt.").max(200),
  category: z.string().trim().min(1, "Kategorie wird benötigt.").max(60),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  condition: z.string().trim().min(1, "Zustand wird benötigt.").max(60),
  stockTotal: z.coerce.number().int().min(0, "Anzahl darf nicht negativ sein.").max(100000),
  imagePath: z.string().trim().max(300).optional().or(z.literal("")),
});

export type BookInput = z.infer<typeof bookSchema>;
