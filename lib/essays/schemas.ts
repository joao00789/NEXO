import { z } from "zod";

const scoreSchema = z.union([
  z.literal(0), z.literal(40), z.literal(80), z.literal(120), z.literal(160), z.literal(200),
]);

export const essayCorrectionSchema = z.object({
  score: z.number().int().min(0).max(1000),
  competencies: z.array(z.object({
    number: z.number().int().min(1).max(5),
    score: scoreSchema,
    feedback: z.string().min(10).max(1200),
  })).length(5).refine(
    (items) => new Set(items.map((item) => item.number)).size === 5,
    "A correção precisa trazer uma vez cada uma das cinco competências.",
  ),
  strengths: z.array(z.string().min(3).max(240)).max(8),
  improvements: z.array(z.string().min(3).max(240)).max(8),
  grammar_notes: z.array(z.string().min(3).max(240)).max(10),
  next_steps: z.array(z.string().min(3).max(240)).max(6),
});

export const essayThemeSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(10).max(240),
  category: z.enum(["social", "ambiental", "tecnologia", "educacao", "cidadania", "cultura", "economia"]),
  motivation: z.string().trim().min(30).max(900),
  source_label: z.string().optional(),
  source_url: z.url().nullable().optional(),
  is_official: z.boolean().optional(),
});

export const essayCorrectionInputSchema = z.object({
  essay: z.string().trim().max(10000),
  theme: z.string().trim().min(10).max(240),
});

export type EssayCorrection = z.infer<typeof essayCorrectionSchema>;
export type EssayTheme = z.infer<typeof essayThemeSchema>;
