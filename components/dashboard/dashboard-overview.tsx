import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Flame,
  ListChecks,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export type DashboardProfile = {
  full_name: string | null;
  level: number;
  xp: number;
  coins: number;
};

type ActivityDay = {
  key: string;
  label: string;
  day: string;
  count: number;
  isToday: boolean;
};

type StudyProgress = {
  area: "matematica" | "linguagens" | "humanas" | "natureza";
  correct_answers: number;
  total_answers: number;
};

const areas = [
  { key: "matematica", label: "Matemática" },
  { key: "linguagens", label: "Linguagens" },
  { key: "humanas", label: "Ciências Humanas" },
  { key: "natureza", label: "Ciências da Natureza" },
] as const;

export function DashboardOverview({
  profile,
  progress,
  activity,
  streakDays,
  hasProgressError,
  hasActivityError,
}: {
  profile: DashboardProfile;
  progress: StudyProgress[];
  activity: ActivityDay[];
  streakDays: number;
  hasProgressError: boolean;
  hasActivityError: boolean;
}) {
  const byArea = areas.map((area) => {
    const rows = progress.filter((item) => item.area === area.key);
    const correct = rows.reduce((sum, item) => sum + item.correct_answers, 0);
    const total = rows.reduce((sum, item) => sum + item.total_answers, 0);

    return {
      ...area,
      correct,
      total,
      accuracy: total ? Math.round((correct / total) * 100) : 0,
    };
  });

  const totalCorrect = byArea.reduce((sum, area) => sum + area.correct, 0);
  const totalAnswers = byArea.reduce((sum, area) => sum + area.total, 0);
  const accuracy = totalAnswers ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
  const name = profile.full_name?.split(" ")[0] ?? "estudante";

  const quickStats = [
    { label: "Nível", value: `N${profile.level}` },
    { label: "XP", value: `${profile.xp}` },
    { label: "Moedas", value: `${profile.coins}` },
    { label: "Sequência", value: hasActivityError ? "—" : `${streakDays}d` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[28px] border border-border bg-[radial-gradient(circle_at_top_left,_rgba(46,107,255,0.20),_transparent_35%),linear-gradient(135deg,_rgba(18,24,38,0.96),_rgba(10,11,15,0.96))] p-6 shadow-[0_20px_60px_rgba(12,18,33,0.55)]">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-8 right-10 h-28 w-28 rounded-full bg-sky-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-sky-200/80">
                  NEXO IA
                </p>
                <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
                  Olá, {name}!
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-300">
                  Acompanhe seus dados reais de estudo e escolha o próximo treino.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 backdrop-blur-sm">
                <Sparkles className="size-4 text-sky-300" aria-hidden />
                {totalAnswers ? `${accuracy}% de acerto` : "Preparação ENEM"}
              </div>
            </div>

            <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-black/15 p-3 shadow-inner shadow-white/5"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {hasProgressError || hasActivityError ? (
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-100" role="status">
              Alguns dados de desempenho não puderam ser carregados. Os indicadores afetados foram ocultados.
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <section className="rounded-[24px] border border-border bg-card/80 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-300">Progresso geral</p>
                  <h2 className="mt-1 font-display text-3xl font-bold text-white">
                    {hasProgressError || !totalAnswers ? "—" : `${accuracy}%`}
                  </h2>
                </div>
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-2 text-blue-200">
                  <Target className="size-4" aria-hidden />
                </div>
              </div>

              <div className="mt-4">
                <Progress
                  value={accuracy}
                  aria-label={
                    hasProgressError
                      ? "Aproveitamento indisponível"
                      : totalAnswers
                        ? `Aproveitamento geral: ${accuracy}%`
                        : "Sem questões respondidas"
                  }
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {hasProgressError
                    ? "Desempenho indisponível"
                    : totalAnswers
                      ? `${totalAnswers} questões respondidas`
                      : "Sem dados ainda"}
                </span>
                <span>
                  {hasProgressError
                    ? " "
                    : totalAnswers
                    ? `Acertos ${totalCorrect}`
                    : "Responda questões para começar seu histórico."}
                </span>
              </div>

              <Link
                href="/app/questoes"
                className={buttonVariants({
                  className:
                    "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90",
                })}
              >
                {totalAnswers ? "Continuar estudando" : "Começar a estudar"}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </section>

            <section className="rounded-[24px] border border-border bg-card/80 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-violet-500/10 p-2 text-violet-200">
                    <Sparkles className="size-4" aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold text-white">Comece um treino</h3>
                </div>
                <ChevronRight className="size-4 text-slate-400" aria-hidden />
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-slate-950/70 p-4">
                <p className="text-sm text-slate-300">
                  Escolha uma área e receba questões disponíveis no seu próximo treino.
                </p>
                {!hasProgressError && totalAnswers > 0 ? (
                  <p className="mt-3 text-xs text-slate-400">
                    Seu aproveitamento atual é {accuracy}% em {totalAnswers} questões.
                  </p>
                ) : hasProgressError ? (
                  <p className="mt-3 text-xs text-amber-200">
                    Seu aproveitamento está indisponível no momento.
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-slate-400">
                    Seu histórico começa na primeira resposta.
                  </p>
                )}
              </div>

              <Link
                href="/app/questoes"
                className={buttonVariants({
                  variant: "outline",
                  className: "mt-5 w-full justify-center rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10",
                })}
              >
                Responder
              </Link>
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <section className="rounded-[24px] border border-border bg-card/80 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-200">
                    <Clock3 className="size-4" aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold text-white">Continue de onde parou</h3>
                </div>
                <Link href="/app/questoes" className="text-sm text-sky-300 hover:text-sky-200">
                  Ver mais
                </Link>
              </div>

              <div className="mt-5 space-y-4">
                {byArea.slice(0, 2).map((area) => (
                  <div key={area.key} className="rounded-2xl border border-border bg-slate-950/60 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{area.label}</p>
                        <p className="text-xs text-slate-400">
                          {hasProgressError
                            ? "Dados indisponíveis"
                            : area.total
                              ? `${area.total} questões`
                              : "Sem progresso registrado"}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-blue-200">
                        {hasProgressError
                          ? "—"
                          : area.total
                            ? `${area.accuracy}%`
                            : "Sem tentativas"}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Progress
                        value={area.accuracy}
                        aria-label={`${area.label}: ${
                          hasProgressError
                            ? "dados indisponíveis"
                            : area.total
                              ? `${area.accuracy}% de acertos`
                              : "sem tentativas"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-border bg-card/80 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-amber-500/10 p-2 text-amber-200">
                    <Trophy className="size-4" aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold text-white">Missões</h3>
                </div>
                <Flame className="size-4 text-orange-300" aria-hidden />
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-slate-950/60 p-4">
                <p className="text-sm text-slate-300">
                  Acompanhe suas metas diárias e semanais na página de missões.
                </p>
                <Link
                  href="/app/missoes"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-300 hover:text-sky-200"
                >
                  Ver missões
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
            </section>
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[24px] border border-border bg-card/80 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-primary/10 p-2 text-blue-200">
                  <Zap className="size-4" aria-hidden />
                </div>
                <h3 className="text-base font-semibold text-white">Calendário de estudos</h3>
              </div>
              <span className="text-xs text-slate-400">
                {hasActivityError ? "Indisponível" : `${streakDays} dias seguidos`}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2">
              {(hasActivityError ? [] : activity).map((day) => {
                const active = day.count > 0;
                return (
                  <div key={day.key} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                      {day.label}
                    </span>
                    <time
                      dateTime={day.key}
                      aria-current={day.isToday ? "date" : undefined}
                      title={`${day.count} ${day.count === 1 ? "questão respondida" : "questões respondidas"}`}
                      aria-label={`${day.day}${day.isToday ? ", hoje" : ""}: ${day.count} ${day.count === 1 ? "questão respondida" : "questões respondidas"}`}
                      className={`flex size-8 items-center justify-center rounded-full border text-xs font-medium ${
                        active
                          ? day.isToday
                            ? "border-white bg-primary text-white shadow-[0_0_16px_rgba(46,107,255,0.35)] ring-2 ring-primary/40 ring-offset-2 ring-offset-card"
                            : "border-primary bg-primary text-white shadow-[0_0_16px_rgba(46,107,255,0.35)]"
                          : day.isToday
                            ? "border-primary bg-primary/10 font-bold text-sky-100 ring-2 ring-primary/30 ring-offset-2 ring-offset-card"
                            : "border-transparent bg-slate-900 text-slate-500"
                      }`}
                    >
                      {day.day}
                    </time>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-slate-400">
              {hasActivityError
                ? "A atividade recente está indisponível no momento."
                : `${activity.reduce((sum, day) => sum + day.count, 0)} questões respondidas nesta semana.`}
            </p>
          </section>

          <section className="rounded-[24px] border border-border bg-card/80 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-pink-500/10 p-2 text-pink-200">
                  <Trophy className="size-4" aria-hidden />
                </div>
                <h3 className="text-base font-semibold text-white">XP conquistado</h3>
              </div>
              <span className="text-xs text-slate-400">Nível {profile.level}</span>
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-slate-950/60 p-4">
              <p className="font-display text-2xl font-bold text-white">{profile.xp} XP</p>
              <p className="mt-1 text-xs text-slate-400">
                Responda questões para ganhar XP e avançar de nível.
              </p>
              <Link
                href="/app/missoes"
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-300 hover:text-sky-200"
              >
                <ListChecks aria-hidden className="size-4" />
                Acompanhar missões
              </Link>
            </div>
          </section>

        </aside>
      </div>
    </div>
  );
}
