import Link from "next/link";
import { ArrowRight, Check, Clock3, Sparkles, Target, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type AreaProgress = {
  area: string;
  correct_answers: number;
  total_answers: number;
  score: number;
};

type RecentAttempt = {
  id: string;
  question_id: string;
  is_correct: boolean;
  elapsed_seconds: number;
  created_at: string;
  question: { subject: string; topic: string } | null;
};

const areaLabels: Record<string, string> = {
  matematica: "Matemática",
  linguagens: "Linguagens",
  humanas: "Ciências Humanas",
  natureza: "Ciências da Natureza",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Fortaleza",
});

export function PerformanceOverview({
  progress,
  attempts,
  hasLoadError,
  hasGeneratedAttemptsError,
}: {
  progress: AreaProgress[];
  attempts: RecentAttempt[];
  hasLoadError: boolean;
  hasGeneratedAttemptsError: boolean;
}) {
  const totalCorrect = progress.reduce((sum, area) => sum + area.correct_answers, 0);
  const totalAnswers = progress.reduce((sum, area) => sum + area.total_answers, 0);
  const accuracy = totalAnswers ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
  const averageSeconds = attempts.length
    ? Math.round(
        attempts.reduce((sum, attempt) => sum + attempt.elapsed_seconds, 0) /
          attempts.length,
      )
    : 0;

  return (
    <div className="space-y-6">
      <header className="theme-hero overflow-hidden rounded-[28px] border border-border p-5 shadow-[0_20px_50px_rgba(8,10,18,0.25)] md:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary/80">
          Evolução de estudos
        </p>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Desempenho</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Acompanhe seu aproveitamento, identifique áreas para revisar e veja suas respostas recentes.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
            <Sparkles aria-hidden className="size-4 text-primary" />
            Progresso pessoal
          </div>
        </div>
      </header>

      {hasLoadError ? (
        <div
          className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200"
          role="alert"
        >
          Não foi possível carregar seu desempenho agora. Tente atualizar a página.
        </div>
      ) : (
        <>
          {hasGeneratedAttemptsError ? (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-100" role="status">
              Parte do histórico de questões geradas por IA não está disponível. Confira se a migration
              {" "}
              <code>20261010170000_add_ai_generated_question_attempts.sql</code>
              {" "}
              foi aplicada no Supabase; se já foi, verifique os logs do servidor.
            </p>
          ) : null}
          <section
            aria-label="Resumo do desempenho"
            className="grid gap-4 sm:grid-cols-3"
          >
            <Card className="border-border bg-card/80 shadow-[0_20px_35px_rgba(0,0,0,0.18)]">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-400">Questões respondidas</CardDescription>
                <CardTitle className="font-display text-3xl text-white">{totalAnswers}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border bg-card/80 shadow-[0_20px_35px_rgba(0,0,0,0.18)]">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-400">Aproveitamento geral</CardDescription>
                <CardTitle className="font-display text-3xl text-white">{accuracy}%</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border bg-card/80 shadow-[0_20px_35px_rgba(0,0,0,0.18)]">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-400">Tempo médio · últimas 20</CardDescription>
                <CardTitle className="font-display flex items-center gap-2 text-3xl text-white">
                  <Clock3 aria-hidden className="size-5 text-primary" />
                  {averageSeconds}s
                </CardTitle>
              </CardHeader>
            </Card>
          </section>

          <section aria-labelledby="area-performance-title">
            <h2 id="area-performance-title" className="mb-3 text-base font-semibold text-white">
              Desempenho por área
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(areaLabels).map(([areaKey, label]) => {
                const item = progress.find((entry) => entry.area === areaKey);
                const percent = item?.total_answers
                  ? Math.round((item.correct_answers / item.total_answers) * 100)
                  : 0;

                return (
                  <Card key={areaKey} className="border-border bg-card/80 shadow-[0_20px_35px_rgba(0,0,0,0.18)]">
                    <CardHeader className="gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-sm font-medium text-white">{label}</CardTitle>
                        <span className="text-xs text-slate-400">
                          {item?.total_answers
                            ? `${percent}% · ${item.correct_answers}/${item.total_answers}`
                            : "Sem tentativas"}
                        </span>
                      </div>
                      <Progress
                        value={percent}
                        aria-label={`${label}: ${item?.total_answers ? `${percent}% de acertos` : "sem tentativas"}`}
                      />
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="recent-attempts-title">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="recent-attempts-title" className="text-base font-semibold text-white">
                Tentativas recentes
              </h2>
              <Link
                href="/app/questoes"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "border-white/10 bg-white/5 text-white hover:bg-white/10",
                })}
              >
                Treinar
                <ArrowRight aria-hidden />
              </Link>
            </div>
            {attempts.length ? (
              <div className="overflow-x-auto rounded-[20px] border border-border bg-card/70 shadow-[0_20px_35px_rgba(0,0,0,0.18)]">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <caption className="sr-only">Até 20 tentativas mais recentes</caption>
                  <thead className="border-b border-border bg-slate-950/70 text-xs text-slate-400">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Questão
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Resultado
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Tempo
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((attempt) => (
                      <tr
                        key={attempt.id}
                        className="border-b border-border/70 text-slate-200 last:border-0"
                      >
                        <td className="px-4 py-3">
                          <span className="block font-medium">
                            {attempt.question?.topic ?? "Questão"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {attempt.question?.subject ?? "Treino"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5">
                            {attempt.is_correct ? (
                              <Check aria-hidden className="size-4 text-emerald-300" />
                            ) : (
                              <X aria-hidden className="size-4 text-red-300" />
                            )}
                            {attempt.is_correct ? "Acerto" : "Erro"}
                          </span>
                        </td>
                        <td className="px-4 py-3">{attempt.elapsed_seconds}s</td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {dateFormatter.format(new Date(attempt.created_at))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card className="border-border bg-card/80">
                <CardContent className="flex flex-col items-start gap-3 p-6">
                  <div className="flex items-center gap-2">
                    <Target aria-hidden className="size-4 text-primary" />
                    <h3 className="font-medium text-white">
                      Seu histórico começa no primeiro treino
                    </h3>
                  </div>
                  <CardDescription className="text-slate-400">
                    Responda uma questão para acompanhar seu progresso por área.
                  </CardDescription>
                  <Link
                    href="/app/questoes"
                    className={buttonVariants({ className: "w-fit" })}
                  >
                    Começar treino
                    <ArrowRight aria-hidden />
                  </Link>
                </CardContent>
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}
