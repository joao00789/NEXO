"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const answerSchema = z.object({
  questionId: z.uuid(),
  optionId: z.uuid(),
  elapsedSeconds: z.coerce.number().int().min(0).max(3600),
});

const answerResultSchema = z.object({
  is_correct: z.boolean(),
  correct_option_id: z.uuid(),
  explanation: z.string(),
  correct_answers: z.number().int(),
  total_answers: z.number().int(),
});

const simulationAnswersSchema = z.array(
  z.object({
    question_id: z.uuid(),
    option_id: z.uuid(),
    elapsed_seconds: z.number().int().min(0).max(3600),
  }),
).min(1).max(20);

const simulationResultSchema = z.object({
  results: z.array(
    answerResultSchema.extend({ question_id: z.uuid() }),
  ).min(1).max(20),
  correct_count: z.number().int().min(0).max(20),
  total_count: z.number().int().min(1).max(20),
});

export type AnswerActionState = {
  error?: string;
  result?: z.infer<typeof answerResultSchema>;
};

export async function submitQuestionAnswer(
  _previousState: AnswerActionState,
  formData: FormData,
): Promise<AnswerActionState> {
  await requireUserSession();

  const parsed = answerSchema.safeParse({
    questionId: formData.get("questionId"),
    optionId: formData.get("optionId"),
    elapsedSeconds: formData.get("elapsedSeconds"),
  });

  if (!parsed.success) {
    return { error: "Selecione uma alternativa válida para responder." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("submit_practice_answer", {
    p_question_id: parsed.data.questionId,
    p_option_id: parsed.data.optionId,
    p_elapsed_seconds: parsed.data.elapsedSeconds,
  });

  if (error) {
    console.error("Practice answer RPC failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    const debugMessage = process.env.NODE_ENV === "development"
      ? ` (${error.code}: ${error.message})`
      : "";
    return { error: `Não foi possível registrar sua resposta. Tente novamente.${debugMessage}` };
  }

  const result = answerResultSchema.safeParse(data);
  if (!result.success) {
    return { error: "Não foi possível carregar a correção da resposta." };
  }

  revalidatePath("/app");
  return { result: result.data };
}

export type SimulationSubmissionState = {
  error?: string;
  result?: z.infer<typeof simulationResultSchema>;
};

export async function submitSimulationAnswers(
  answers: unknown,
): Promise<SimulationSubmissionState> {
  await requireUserSession();
  const parsedAnswers = simulationAnswersSchema.safeParse(answers);
  if (!parsedAnswers.success) {
    return { error: "As respostas do simulado são inválidas. Revise suas escolhas e tente novamente." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("submit_simulation_answers", {
    p_answers: parsedAnswers.data,
  });
  if (error) {
    console.error("Simulation submission RPC failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    const debugMessage = process.env.NODE_ENV === "development"
      ? ` (${error.code}: ${error.message})`
      : "";
    return { error: `Não foi possível registrar o simulado. Suas respostas não foram salvas.${debugMessage}` };
  }

  const result = simulationResultSchema.safeParse(data);
  if (!result.success || result.data.total_count !== parsedAnswers.data.length) {
    return { error: "O resultado do simulado retornado pelo servidor é inválido." };
  }

  revalidatePath("/app");
  revalidatePath("/app/desempenho");
  revalidatePath("/app/missoes");
  return { result: result.data };
}
