import type { Metadata } from "next";
import Link from "next/link";

import { AIQuestionPractice } from "@/components/questions/ai-question-practice";
import { QuestionPractice } from "@/components/questions/question-practice";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  practiceFiltersSchema,
  practiceQuestionsSchema,
} from "@/lib/questions/schemas";

export const metadata: Metadata = { title: "Questões" };
export const maxDuration = 60;

const areas = [
  ["matematica", "Matemática"],
  ["linguagens", "Linguagens"],
  ["humanas", "Ciências Humanas"],
  ["natureza", "Ciências da Natureza"],
] as const;

const difficulties = [
  ["facil", "Fácil"],
  ["medio", "Médio"],
  ["dificil", "Difícil"],
  ["enem", "Estilo ENEM"],
] as const;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    modo?: string;
    area?: string;
    difficulty?: string;
    subject?: string;
    topic?: string;
    quantidade?: string;
  }>;
}) {
  const params = await searchParams;
  const filters = practiceFiltersSchema.safeParse(params);
  const area = filters.success ? (filters.data.area ?? "matematica") : "matematica";
  const defaultSubjects = {
    matematica: "Matemática",
    linguagens: "Língua Portuguesa",
    humanas: "História",
    natureza: "Biologia",
  } as const;

  if (params.modo !== "banco") {
    return (
      <div className="space-y-6">
        <section className="theme-hero rounded-[28px] border border-border p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary/80">Treino inteligente</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <h1 className="font-display text-3xl font-bold text-white">Questões com IA</h1>
            <Link href="/app/questoes?modo=banco" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
              Ver questões do acervo
            </Link>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            Gere exercícios novos por matéria e tema. Ao responder, receba a correção, a resolução em etapas e o motivo de cada alternativa.
          </p>
        </section>
        <AIQuestionPractice
          initialArea={area}
          initialDifficulty={filters.success ? (filters.data.difficulty ?? "enem") : "enem"}
          initialSubject={filters.success ? (filters.data.subject || defaultSubjects[area]) : defaultSubjects[area]}
          initialTopic={filters.success ? (filters.data.topic || "Revisão geral do ENEM") : "Revisão geral do ENEM"}
        />
        <p className="text-xs text-muted-foreground">
          O acervo cadastrado continua disponível separadamente; o modo IA não consulta esse banco para criar questões.
        </p>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_practice_questions", {
    p_area: filters.success ? (filters.data.area ?? null) : null,
    p_difficulty: filters.success ? (filters.data.difficulty ?? null) : null,
    p_subject: filters.success ? filters.data.subject || null : null,
    p_topic: filters.success ? filters.data.topic || null : null,
    p_limit: filters.success ? filters.data.quantidade : 10,
  });
  const parsedQuestions = practiceQuestionsSchema.safeParse(data ?? []);

  return (
    <div className="space-y-6">
      <section className="theme-hero overflow-hidden rounded-[28px] border border-border p-5 shadow-[0_20px_50px_rgba(8,10,18,0.25)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary/80">
              Treino inteligente
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white">Questões do acervo</h1>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
            {filters.success ? `${filters.data.quantidade ?? 10} por sessão` : "Personalize seu treino"}
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">
          Pratique por área e dificuldade. Cada resposta entra no seu histórico de desempenho.
        </p>
        <Link href="/app/questoes" className="mt-3 inline-block text-sm text-primary hover:underline">
          Ir para questões novas com IA
        </Link>
      </section>

      <form
        method="get"
        className="grid gap-3 rounded-[24px] border border-border bg-card/80 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.18)] sm:grid-cols-2 lg:grid-cols-5"
      >
        <input type="hidden" name="modo" value="banco" />
        <label className="flex flex-col gap-1.5 text-sm text-slate-300">
          Área
          <select
            name="area"
            defaultValue={filters.success ? (filters.data.area ?? "") : ""}
            className="h-10 rounded-xl border border-border bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
          >
            <option value="">Todas as áreas</option>
            {areas.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-slate-300">
          Dificuldade
          <select
            name="difficulty"
            defaultValue={filters.success ? (filters.data.difficulty ?? "") : ""}
            className="h-10 rounded-xl border border-border bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
          >
            <option value="">Todas</option>
            {difficulties.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-slate-300">
          Matéria
          <input
            name="subject"
            defaultValue={filters.success ? (filters.data.subject ?? "") : ""}
            maxLength={100}
            placeholder="Ex.: Matemática"
            className="h-10 rounded-xl border border-border bg-slate-950/60 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/25"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-slate-300">
          Tema
          <input
            name="topic"
            defaultValue={filters.success ? (filters.data.topic ?? "") : ""}
            maxLength={160}
            placeholder="Ex.: Porcentagem"
            className="h-10 rounded-xl border border-border bg-slate-950/60 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/25"
          />
        </label>
        <div className="flex flex-col gap-1.5 text-sm text-slate-300">
          Quantidade
          <div className="flex items-end gap-2">
            <select
              name="quantidade"
              defaultValue={filters.success ? String(filters.data.quantidade) : "10"}
              className="h-10 flex-1 rounded-xl border border-border bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
            >
              {[5, 10, 15, 20].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-10 rounded-xl bg-primary px-3 text-sm font-medium text-white transition hover:bg-primary/90"
            >
              Iniciar
            </button>
          </div>
        </div>
      </form>

      {!filters.success && (
        <p className="text-sm text-red-300" role="alert">
          Os filtros informados não são válidos. Confira a área, a dificuldade e a quantidade.
        </p>
      )}
      {error ? (
        <div
          className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200"
          role="alert"
        >
          Não foi possível carregar as questões. Aplique as migrations do Supabase e tente novamente.
        </div>
      ) : (
        <QuestionPractice
          questions={parsedQuestions.success ? parsedQuestions.data : []}
        />
      )}
    </div>
  );
}
