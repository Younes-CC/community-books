import * as z from "zod";
import { LEVELS, READING_LENGTHS, TOPICS } from "@/lib/constants";

const topicKeys = TOPICS.map((t) => t.key) as [string, ...string[]];
const levelKeys = LEVELS.map((l) => l.key) as [string, ...string[]];
const lengthKeys = READING_LENGTHS.map((l) => l.key) as [string, ...string[]];

// optional whole number; empty string -> null
const optionalInt = (min: number, max: number, msg: string) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isInteger(v) && v >= min && v <= max), msg);

export const bookSchema = z.object({
  title: z.string().trim().min(1, "Titel wird benötigt.").max(200),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  stockTotal: z.coerce.number().int().min(0, "Anzahl darf nicht negativ sein.").max(100000),
  imagePath: z.string().trim().max(300).optional().or(z.literal("")),
  topics: z.array(z.enum(topicKeys)),
  levels: z.array(z.enum(levelKeys)),
  readingLength: z.union([z.literal(""), z.enum(lengthKeys)]),
  widthMm: optionalInt(10, 1000, "Breite: 10–1000 mm"),
  heightMm: optionalInt(10, 1000, "Höhe: 10–1000 mm"),
  thicknessMm: optionalInt(1, 500, "Dicke: 1–500 mm"),
  weightG: optionalInt(1, 20000, "Gewicht: 1–20000 g"),
});

export type BookInput = z.infer<typeof bookSchema>;
