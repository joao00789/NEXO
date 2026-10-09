import { z } from "zod";

const optionalEmpty = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? undefined : value), schema.optional());

export const practiceFiltersSchema = z.object({
  area: optionalEmpty(z.enum(["matematica", "linguagens", "humanas", "natureza"])),
  difficulty: optionalEmpty(z.enum(["facil", "medio", "dificil", "enem"])),
  subject: optionalEmpty(z.string().trim().max(100)),
  topic: optionalEmpty(z.string().trim().max(160)),
  quantidade: z.coerce.number().int().min(1).max(20).default(10),
});

export const practiceQuestionsSchema = z.array(
  z.object({
    question_id: z.uuid(),
    area: z.enum(["matematica", "linguagens", "humanas", "natureza"]),
    subject: z.string().min(2).max(100),
    topic: z.string().min(2).max(160),
    difficulty: z.enum(["facil", "medio", "dificil", "enem"]),
    statement: z.string().min(10).max(10000),
    options: z
      .array(
        z.object({
          id: z.uuid(),
          label: z.enum(["A", "B", "C", "D", "E"]),
          content: z.string().min(1).max(2000),
        }),
      )
      .min(2)
      .max(5),
  }),
);
