"use server";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
} from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserSession } from "@/lib/auth/session";
import { generateJson } from "@/lib/ai/gateway";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  generatedAnswerInputSchema,
  generatedQuestionDraftSchema,
  generatedQuestionFiltersSchema,
  signedQuestionPayloadSchema,
  type SignedQuestionPayload,
} from "@/lib/questions/generated-schema";

const questionPrompt = `Crie uma única questão autoral de múltipla escolha para estudo do ENEM, em português brasileiro, seguindo a área, matéria, tema e dificuldade informados. Não copie questões de provas, livros ou sites. A questão deve avaliar raciocínio e contexto, ter exatamente cinco alternativas A, B, C, D e E, e somente uma correta. Confira os cálculos e a coerência antes de responder. Escreva uma resolução passo a passo, com pelo menos dois passos. Para cada alternativa, explique por que está correta ou qual equívoco provável ela representa. Não afirme que a questão é oficial nem invente dados reais ou estatísticas. Retorne exclusivamente JSON com este formato: {"statement":"...","options":[{"label":"A","content":"..."},{"label":"B","content":"..."},{"label":"C","content":"..."},{"label":"D","content":"..."},{"label":"E","content":"..."}],"correct_label":"A","solution_steps":["...","..."],"option_explanations":[{"label":"A","explanation":"..."},{"label":"B","explanation":"..."},{"label":"C","explanation":"..."},{"label":"D","explanation":"..."},{"label":"E","explanation":"..."}]}.`;

const recordResultSchema = z.object({
  is_correct: z.boolean(),
  correct_answers: z.number().int().nonnegative(),
  total_answers: z.number().int().positive(),
  xp_earned: z.number().int().nonnegative(),
});

const detailedFeedbackSchema = z.object({
  detailed_feedback: z.string().trim().min(1).max(4000),
});

export type GeneratedQuestionView = {
  id: string;
  area: SignedQuestionPayload["area"];
  subject: string;
  topic: string;
  difficulty: SignedQuestionPayload["difficulty"];
  statement: string;
  options: SignedQuestionPayload["options"];
  token: string;
};

export type GenerateQuestionState = {
  error?: string;
  question?: GeneratedQuestionView;
};

export type GeneratedAnswerState = {
  error?: string;
  result?: {
    question_id: string;
    is_correct: boolean;
    correct_label: string;
    selected_explanation: string;
    solution_steps: string[];
    option_explanations: SignedQuestionPayload["option_explanations"];
    correct_answers: number;
    total_answers: number;
    xp_earned: number;
    detailed_feedback?: string | null;
  };
};

function signingKey() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente para validar questões geradas.");
  }
  return createHash("sha256").update(`nexo-generated-question-v1:${secret}`).digest();
}

function signPayload(payload: SignedQuestionPayload) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", signingKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  return [
    iv.toString("base64url"),
    ciphertext.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
  ].join(".");
}

function verifyToken(token: string): SignedQuestionPayload | null {
  try {
    const [encodedIv, encodedCiphertext, encodedTag] = token.split(".");
    if (!encodedIv || !encodedCiphertext || !encodedTag) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      signingKey(),
      Buffer.from(encodedIv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(encodedCiphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const payload = JSON.parse(plaintext) as unknown;
    const parsed = signedQuestionPayloadSchema.safeParse(payload);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function generatePracticeQuestion(
  _previousState: GenerateQuestionState,
  formData: FormData,
): Promise<GenerateQuestionState> {
  const user = await requireUserSession();
  const filters = generatedQuestionFiltersSchema.safeParse({
    area: formData.get("area"),
    difficulty: formData.get("difficulty"),
    subject: formData.get("subject"),
    topic: formData.get("topic"),
  });
  if (!filters.success) {
    return { error: "Informe uma área, matéria e tema válidos para gerar a questão." };
  }

  try {
    const raw = await generateJson(
      questionPrompt,
      JSON.stringify({
        area: filters.data.area,
        materia: filters.data.subject,
        tema: filters.data.topic,
        dificuldade: filters.data.difficulty,
      }),
      { maxOutputTokens: 2400, temperature: 0.35, timeoutMs: 8000 },
    );
    const draft = generatedQuestionDraftSchema.parse(raw);
    const payload = signedQuestionPayloadSchema.parse({
      ...draft,
      id: randomUUID(),
      user_id: user.id,
      expires_at: Date.now() + 30 * 60 * 1000,
      ...filters.data,
    });
    const token = signPayload(payload);
    return {
      question: {
        id: payload.id,
        area: payload.area,
        subject: payload.subject,
        topic: payload.topic,
        difficulty: payload.difficulty,
        statement: payload.statement,
        options: payload.options,
        token,
      },
    };
  } catch (error) {
    console.error("AI practice question generation failed.", {
      name: error instanceof Error ? error.name : "UnknownError",
      status:
        typeof error === "object" && error !== null && "status" in error
          ? error.status
          : undefined,
    });
    return {
      error:
        process.env.NODE_ENV === "development"
          ? "A IA não conseguiu gerar uma questão válida. Confira os provedores e tente novamente."
          : "Não foi possível gerar uma questão agora. Tente novamente em instantes.",
    };
  }
}

export async function submitGeneratedQuestionAnswer(
  _previousState: GeneratedAnswerState,
  formData: FormData,
): Promise<GeneratedAnswerState> {
  const user = await requireUserSession();
  const answer = generatedAnswerInputSchema.safeParse({
    token: formData.get("questionToken"),
    optionLabel: formData.get("optionLabel"),
    elapsedSeconds: formData.get("elapsedSeconds"),
  });
  if (!answer.success) {
    return { error: "Selecione uma alternativa válida para responder." };
  }

  let payload: SignedQuestionPayload | null;
  try {
    payload = verifyToken(answer.data.token);
  } catch (error) {
    console.error("AI question signature verification unavailable.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return {
      error:
        "A validação segura da questão está indisponível. Atualize a página e tente novamente.",
    };
  }
  if (!payload) {
    return {
      error:
        "Esta questão expirou ou foi alterada. Gere uma nova questão para continuar.",
    };
  }
  if (payload.user_id !== user.id || payload.expires_at < Date.now()) {
    return { error: "Esta questão expirou. Gere uma nova para continuar." };
  }

  const isCorrect = answer.data.optionLabel === payload.correct_label;
  const selectedExplanation = payload.option_explanations.find(
    (item) => item.label === answer.data.optionLabel,
  )?.explanation;
  if (!selectedExplanation) {
    return { error: "Não foi possível carregar a explicação desta alternativa." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("record_ai_question_attempt", {
    p_attempt_id: payload.id,
    p_area: payload.area,
    p_subject: payload.subject,
    p_topic: payload.topic,
    p_is_correct: isCorrect,
    p_elapsed_seconds: answer.data.elapsedSeconds,
  });
  if (error) {
    console.error("AI practice answer recording failed.", {
      code: error.code,
      message: error.message,
    });
    return {
      error:
        "A resposta foi corrigida, mas não foi possível salvar seu desempenho. Tente novamente.",
    };
  }

  const recorded = recordResultSchema.safeParse(data);
  if (!recorded.success || recorded.data.is_correct !== isCorrect) {
    return {
      error:
        "O resultado salvo não passou na validação. Atualize a página e tente novamente.",
    };
  }

  // Gerar feedback detalhado personalizado usando a IA (passo-a-passo e como corrigir)
  let detailedFeedback = undefined as string | undefined;
  try {
    const feedbackPrompt = `Dado o JSON da questão e a alternativa escolhida, gere um feedback passo-a-passo voltado ao estudante. Inclua: 1) explicação clara por que a alternativa escolhida está certa ou errada; 2) passos concretos para corrigir o raciocínio quando estiver errada; 3) referências e sugestões de leitura (URLs) quando for útil. Retorne exclusivamente um único campo 'detailed_feedback' como string explicativa. Aqui está a questão (JSON):\n${JSON.stringify(payload)}\nAlternativa escolhida: ${answer.data.optionLabel}`;
    const fb = await generateJson(feedbackPrompt, JSON.stringify({}), {
      maxOutputTokens: 800,
      temperature: 0.2,
      timeoutMs: 5000,
    });
    const feedback = detailedFeedbackSchema.safeParse(fb);
    if (feedback.success) {
      detailedFeedback = feedback.data.detailed_feedback;
    } else {
      console.error("AI question detailed feedback did not match the expected shape.", {
        issues: feedback.error.issues.map(({ code, path }) => ({ code, path })),
      });
    }
  } catch (err) {
    console.error("Failed to generate detailed feedback.", {
      name: err instanceof Error ? err.name : "UnknownError",
    });
    // Não falhar a resposta principal se o feedback detalhado falhar
    detailedFeedback = undefined;
  }

  revalidatePath("/app");
  revalidatePath("/app/desempenho");
  revalidatePath("/app/missoes");
  return {
    result: {
      question_id: payload.id,
      is_correct: isCorrect,
      correct_label: payload.correct_label,
      selected_explanation: selectedExplanation,
      solution_steps: payload.solution_steps,
      option_explanations: payload.option_explanations,
      correct_answers: recorded.data.correct_answers,
      total_answers: recorded.data.total_answers,
      xp_earned: recorded.data.xp_earned,
      detailed_feedback: detailedFeedback,
    },
  };
}
