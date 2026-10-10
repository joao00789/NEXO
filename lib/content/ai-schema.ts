import { z } from "zod";

export const generatedLessonInputSchema = z.object({
  area: z.enum(["matematica", "linguagens", "humanas", "natureza"]),
  subject: z.string().trim().min(2).max(100),
  topic: z.string().trim().min(2).max(160),
});

export const generatedLessonSchema = z.object({
  title: z.string().trim().min(3).max(140),
  introduction: z.string().trim().min(40).max(1600),
  sections: z.array(
    z.object({
      heading: z.string().trim().min(3).max(100),
      explanation: z.string().trim().min(40).max(1800),
      key_points: z.array(z.string().trim().min(5).max(400)).min(2).max(5),
    }),
  ).min(2).max(5),
  worked_example: z.object({
    prompt: z.string().trim().min(15).max(700),
    steps: z.array(z.string().trim().min(5).max(500)).min(2).max(6),
    answer: z.string().trim().min(2).max(400),
  }),
  common_mistakes: z.array(z.string().trim().min(5).max(400)).min(2).max(6),
  self_check: z.object({
    question: z.string().trim().min(10).max(500),
    answer: z.string().trim().min(5).max(700),
  }),
  // Opcional: fontes recomendadas pela IA com trechos curtos e link
  sources: z.array(
    z.object({
      label: z.string().trim().min(5).max(200),
      url: z.string().url(),
      excerpt: z.string().trim().min(10).max(400).optional(),
    }),
  ).optional(),
});

export type GeneratedLesson = z.infer<typeof generatedLessonSchema>;
