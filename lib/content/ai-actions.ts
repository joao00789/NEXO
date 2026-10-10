"use server";

import { requireUserSession } from "@/lib/auth/session";
import { generateJson } from "@/lib/ai/gateway";
import {
  generatedLessonInputSchema,
  generatedLessonSchema,
  type GeneratedLesson,
} from "@/lib/content/ai-schema";

const lessonPrompt = `Crie uma aula de estudo autoral, clara e progressiva, para preparação do ENEM. Use apenas conhecimento consolidado; não invente estatísticas, leis ou citações. Explique com palavras próprias, resumindo e integrando informações públicas. Não copie longos trechos de sites, livros ou materiais protegidos — em vez disso, gere resumos originais. Relacione o conteúdo com habilidades de leitura, interpretação e resolução de problemas valorizadas no ENEM. Inclua duas ou mais seções conceituais, pontos-chave, um exemplo resolvido em passos, erros comuns e uma pergunta curta de autoavaliação com resposta. Opcionalmente, inclua um array "sources" contendo objetos {label, url, excerpt} com links de referência e pequenos trechos (máx 200 caracteres) — apenas quando for útil e legal citar. Retorne exclusivamente JSON válido no formato solicitado.`;

export type GenerateLessonState = {
  error?: string;
  lesson?: GeneratedLesson;
  topic?: string;
};

export async function generateStudyLesson(
  _previousState: GenerateLessonState,
  formData: FormData,
): Promise<GenerateLessonState> {
  await requireUserSession();
  const parsed = generatedLessonInputSchema.safeParse({
    area: formData.get("area"),
    subject: formData.get("subject"),
    topic: formData.get("topic"),
  });
  if (!parsed.success) {
    return { error: "Informe uma área, matéria e tema válidos." };
  }

  try {
    const lesson = generatedLessonSchema.parse(
      await generateJson(
        lessonPrompt,
        JSON.stringify({
          area: parsed.data.area,
          materia: parsed.data.subject,
          tema: parsed.data.topic,
        }),
        { maxOutputTokens: 4000, temperature: 0.35, timeoutMs: 8000 },
      ),
    );
    return { lesson, topic: parsed.data.topic };
  } catch (error) {
    console.error("AI study lesson generation failed.", {
      name: error instanceof Error ? error.name : "UnknownError",
      status: typeof error === "object" && error !== null && "status" in error
        ? error.status
        : undefined,
    });
    return {
      error: process.env.NODE_ENV === "development"
        ? "A IA não conseguiu montar uma aula válida. Confira os provedores e tente novamente."
        : "Não foi possível criar esta aula agora. Tente novamente em instantes.",
    };
  }
}
