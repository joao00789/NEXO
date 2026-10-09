import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Clock3, ExternalLink, ListChecks, Sparkles } from "lucide-react";

import { SimulationSession } from "@/components/questions/simulation-session";
import { buttonVariants } from "@/components/ui/button";
import { officialEnemArchiveUrl } from "@/lib/content/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  practiceFiltersSchema,
  practiceQuestionsSchema,
} from "@/lib/questions/schemas";

export const metadata: Metadata = { title: "Simulados" };

const areas = [
  ["", "Todas as áreas"],
  ["matematica", "Matemática"],
  ["linguagens", "Linguagens"],
  ["humanas", "Ciências Humanas"],
  ["natureza", "Ciências da Natureza"],
] as const;

const questionCounts = [5, 10, 20] as const;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; area?: string; quantidade?: string }>;
}) {
  const params = await searchParams;
  const filters = practiceFiltersSchema.safeParse(params);
  const isStarted = params.start === "1" && filters.success;
  let questions: ReturnType<typeof practiceQuestionsSchema.parse> = [];
  let loadError = false;

  if (isStarted) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_practice_questions", {
      p_area: filters.data.area ?? null,
      p_difficulty: null,
      p_subject: null,
      p_topic: null,
      p_limit: filters.data.quantidade,
    });
    const parsed = practiceQuestionsSchema.safeParse(data ?? []);
    questions = parsed.success ? parsed.data : [];
    loadError = Boolean(error) || !parsed.success;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-border bg-[radial-gradient(circle_at_top_left,_rgba(46,107,255,0.24),_transparent_32%),linear-gradient(135deg,_rgba(18,24,38,0.98),_rgba(10,11,16,0.94))] p-5 shadow-[0_20px_50px_rgba(8,10,18,0.5)] md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-sky-200/80">
              Prática focada
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white">Simulados</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Monte uma sessão de questões por área e pratique no seu ritmo. As respostas são
              corrigidas individualmente e entram no seu desempenho.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
            <Sparkles aria-hidden className="size-4 text-sky-300" />
            Treino personalizado
          </div>
        </div>
      </section>

      {isStarted ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-border bg-card/80 p-4">
            <div>
              <h2 className="font-semibold text-white">Sua sessão começou</h2>
              <p className="mt-1 text-sm text-slate-400">
                {questions.length} {questions.length === 1 ? "questão carregada" : "questões carregadas"}.
                Você verá a correção ao finalizar a sessão.
              </p>
            </div>
            <Link
              href="/app/simulados"
              className={buttonVariants({
                variant: "outline",
                className: "border-white/10 bg-white/5 text-white hover:bg-white/10",
              })}
            >
              Nova sessão
            </Link>
          </div>

          {loadError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200" role="alert">
              Não foi possível carregar este simulado. Tente novamente ou revise as questões aprovadas.
            </div>
          ) : (
            <SimulationSession
              questions={questions}
              durationSeconds={questions.length * 180}
            />
          )}
        </div>
      ) : (
        <>
          <section aria-label="Escolha a quantidade de questões" className="grid gap-4 md:grid-cols-3">
            {[
              { count: 5, label: "Aquecimento", detail: "Uma sessão rápida para começar.", icon: Clock3 },
              { count: 10, label: "Ritmo de estudo", detail: "Uma prática equilibrada para sua rotina.", icon: ListChecks },
              { count: 20, label: "Desafio completo", detail: "O máximo de questões por sessão.", icon: BookOpenCheck },
            ].map((preset) => (
              <article key={preset.count} className="rounded-[22px] border border-border bg-card/80 p-4 shadow-[0_20px_35px_rgba(0,0,0,0.18)]">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-sky-200">
                    <preset.icon aria-hidden className="size-4" />
                  </div>
                  <span className="text-xs text-slate-400">{preset.count} questões</span>
                </div>
                <h2 className="mt-4 font-semibold text-white">{preset.label}</h2>
                <p className="mt-1 text-sm text-slate-400">{preset.detail}</p>
              </article>
            ))}
          </section>

          <form
            method="get"
            className="grid gap-4 rounded-[24px] border border-border bg-card/80 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.18)] sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <input type="hidden" name="start" value="1" />
            <label className="flex flex-col gap-1.5 text-sm text-slate-300">
              Área de conhecimento
              <select
                name="area"
                defaultValue={filters.success ? (filters.data.area ?? "") : ""}
                className="h-11 rounded-xl border border-border bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              >
                {areas.map(([value, label]) => (
                  <option key={value || "all"} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-slate-300">
              Número de questões
              <select
                name="quantidade"
                defaultValue={filters.success ? String(filters.data.quantidade) : "10"}
                className="h-11 rounded-xl border border-border bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              >
                {questionCounts.map((count) => (
                  <option key={count} value={count}>{count} questões</option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Começar sessão
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </form>

          <p className="text-xs text-slate-400">
            As sessões usam questões autorais do NEXO, revisadas para prática no estilo ENEM.
            Para fazer provas anteriores oficiais, consulte o acervo do INEP.
          </p>
          <a
            href={officialEnemArchiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "outline",
              className: "w-fit border-white/10 bg-white/5 text-white hover:bg-white/10",
            })}
          >
            Acessar provas e gabaritos do INEP
            <ExternalLink aria-hidden />
          </a>
        </>
      )}
    </div>
  );
}
