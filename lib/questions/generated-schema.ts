import { z } from "zod";

export const questionAreaSchema = z.enum([
  "matematica",
  "linguagens",
  "humanas",
  "natureza",
]);

export const questionDifficultySchema = z.enum([
  "facil",
  "medio",
  "dificil",
  "enem",
]);

export const generatedQuestionFiltersSchema = z.object({
  area: questionAreaSchema,
  difficulty: questionDifficultySchema,
  subject: z.string().trim().min(2).max(100),
  topic: z.string().trim().min(2).max(160),
});

const alternativeLabelSchema = z.enum(["A", "B", "C", "D", "E"]);

export const generatedQuestionDraftSchema = z.object({
  statement: z.string().trim().min(30).max(10000),
  options: z.array(
    z.object({
      label: alternativeLabelSchema,
      content: z.string().trim().min(1).max(2000),
    }),
  ).length(5),
  correct_label: alternativeLabelSchema,
  solution_steps: z.array(z.string().trim().min(5).max(800)).min(2).max(8),
  option_explanations: z.array(
    z.object({
      label: alternativeLabelSchema,
      explanation: z.string().trim().min(5).max(800),
    }),
  ).length(5),
}).superRefine((question, context) => {
  const optionLabels = question.options.map((option) => option.label);
  const explanationLabels = question.option_explanations.map((option) => option.label);

  if (new Set(optionLabels).size !== 5) {
    context.addIssue({
      code: "custom",
      path: ["options"],
      message: "As alternativas precisam ter identificadores únicos.",
    });
  }
  if (new Set(explanationLabels).size !== 5) {
    context.addIssue({
      code: "custom",
      path: ["option_explanations"],
      message: "Cada alternativa precisa de uma explicação única.",
    });
  }
  for (const label of optionLabels) {
    if (!explanationLabels.includes(label)) {
      context.addIssue({
        code: "custom",
        path: ["option_explanations"],
        message: `Falta explicar a alternativa ${label}.`,
      });
    }
  }
  if (!optionLabels.includes(question.correct_label)) {
    context.addIssue({
      code: "custom",
      path: ["correct_label"],
      message: "A alternativa correta não existe na questão.",
    });
  }
});

export const signedQuestionPayloadSchema = generatedQuestionDraftSchema.extend({
  id: z.uuid(),
  user_id: z.uuid(),
  expires_at: z.number().int().positive(),
  area: questionAreaSchema,
  subject: z.string().min(2).max(100),
  topic: z.string().min(2).max(160),
  difficulty: questionDifficultySchema,
});

export const generatedAnswerInputSchema = z.object({
  token: z.string().min(20).max(24000),
  optionLabel: alternativeLabelSchema,
  elapsedSeconds: z.coerce.number().int().min(0).max(3600),
});

export type GeneratedQuestionDraft = z.infer<typeof generatedQuestionDraftSchema>;
export type SignedQuestionPayload = z.infer<typeof signedQuestionPayloadSchema>;
