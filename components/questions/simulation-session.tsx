"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  Clock3,
  Send,
  X,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { PracticeQuestion } from "@/components/questions/question-practice";
import {
  submitSimulationAnswers,
  type SimulationSubmissionState,
} from "@/lib/questions/actions";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function SimulationSession({
  questions,
  durationSeconds,
}: {
  questions: PracticeQuestion[];
  durationSeconds: number;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [submission, setSubmission] = useState<SimulationSubmissionState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const deadline = useRef(0);
  const openedAt = useRef<number | null>(null);
  const elapsedByQuestion = useRef<Record<string, number>>({});
  const submitLock = useRef(false);
  const timeoutTriggered = useRef(false);
  const submissionRef = useRef<() => Promise<void>>(async () => {});
  const question = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const finished = submission?.result !== undefined;

  const finishSession = useCallback(async () => {
    if (submitLock.current || !question) return;
    if (openedAt.current === null) {
      openedAt.current = Date.now();
    }
    submitLock.current = true;
    setSubmitting(true);

    const elapsed = { ...elapsedByQuestion.current };
    const currentElapsed = Math.floor((Date.now() - openedAt.current) / 1000);
    elapsed[question.question_id] = Math.min(
      3600,
      (elapsed[question.question_id] ?? 0) + Math.max(0, currentElapsed),
    );
    elapsedByQuestion.current = elapsed;

    const payload = questions.flatMap((item) => {
      const optionId = answers[item.question_id];
      return optionId
        ? [{
            question_id: item.question_id,
            option_id: optionId,
            elapsed_seconds: elapsed[item.question_id] ?? 0,
          }]
        : [];
    });

    if (payload.length === 0) {
      submitLock.current = false;
      setSubmission({
        error: "Selecione pelo menos uma alternativa antes de finalizar o simulado.",
      });
      setSubmitting(false);
      return;
    }

    const result = await submitSimulationAnswers(payload);
    setSubmission(result);
    setSubmitting(false);
    submitLock.current = Boolean(result.result);
  }, [answers, question, questions]);

  useEffect(() => {
    submissionRef.current = finishSession;
  }, [finishSession]);

  useEffect(() => {
    if (!questions.length) return;
    openedAt.current = Date.now();
    deadline.current = Date.now() + durationSeconds * 1000;
    const updateTimer = () => {
      const next = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemainingSeconds(next);
      if (next === 0 && !timeoutTriggered.current) {
        timeoutTriggered.current = true;
        void submissionRef.current();
      }
    };
    const interval = window.setInterval(updateTimer, 500);
    return () => window.clearInterval(interval);
  }, [durationSeconds, questions.length]);

  const moveTo = (nextIndex: number) => {
    if (!questions[nextIndex] || finished || submitting) return;
    const now = Date.now();
    if (openedAt.current === null) {
      openedAt.current = now;
    }
    const currentQuestion = questions[currentIndex];
    if (currentQuestion) {
      elapsedByQuestion.current[currentQuestion.question_id] = Math.min(
        3600,
        (elapsedByQuestion.current[currentQuestion.question_id] ?? 0) +
          Math.max(0, Math.floor((now - openedAt.current) / 1000)),
      );
    }
    openedAt.current = now;
    setCurrentIndex(nextIndex);
  };

  if (!questions.length) {
    return (
      <section className="rounded-[22px] border border-border bg-card/80 p-6">
        <h2 className="font-semibold text-white">Nenhuma questão disponível</h2>
        <p className="mt-2 text-sm text-slate-400">
          Não há questões aprovadas para esta combinação. Tente outra área ou volte mais tarde.
        </p>
        <Link href="/app/questoes" className={buttonVariants({ className: "mt-4 w-fit" })}>
          Treinar questões
        </Link>
      </section>
    );
  }

  if (finished && submission?.result) {
    const resultByQuestion = new Map(
      submission.result.results.map((result) => [result.question_id, result]),
    );
    const score = Math.round((submission.result.correct_count / questions.length) * 100);

    return (
      <div className="space-y-5">
        <section className="rounded-[24px] border border-border bg-[radial-gradient(circle_at_top_left,_rgba(46,107,255,0.20),_transparent_38%),linear-gradient(135deg,_rgba(18,24,38,0.96),_rgba(10,11,15,0.96))] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">Sessão concluída</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white">
            {submission.result.correct_count} de {questions.length} acertos
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Aproveitamento nesta sessão: {score}%. Questões não respondidas contam como não pontuadas.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/app/simulados" className={buttonVariants({ className: "gap-2" })}>
              Novo simulado
              <ArrowRight aria-hidden />
            </Link>
            <Link href="/app/desempenho" className={buttonVariants({ variant: "outline", className: "border-white/10 bg-white/5 text-white hover:bg-white/10" })}>
              Ver desempenho
            </Link>
          </div>
        </section>

        <section aria-label="Correção do simulado" className="space-y-3">
          {questions.map((item, index) => {
            const result = resultByQuestion.get(item.question_id);
            const correctOption = item.options.find((option) => option.id === result?.correct_option_id);
            return (
              <article key={item.question_id} className="rounded-[20px] border border-border bg-card/80 p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1.5 ${result?.is_correct ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>
                    {result?.is_correct ? <Check aria-hidden className="size-4" /> : <X aria-hidden className="size-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400">
                      Questão {index + 1} · {item.subject} · {item.topic}
                    </p>
                    <h3 className="mt-2 text-sm font-medium leading-relaxed text-white">{item.statement}</h3>
                    {result ? (
                      <div className="mt-3 space-y-2 text-sm">
                        <p className={result.is_correct ? "text-emerald-300" : "text-red-300"}>
                          {result.is_correct ? "Resposta correta" : "Resposta incorreta"}
                        </p>
                        {!result.is_correct && correctOption ? (
                          <p className="text-slate-300">
                            Alternativa correta: {correctOption.label}) {correctOption.content}
                          </p>
                        ) : null}
                        <p className="leading-relaxed text-slate-400">{result.explanation}</p>
                      </div>
                    ) : (
                      <p className="mt-3 flex items-center gap-2 text-sm text-amber-200">
                        <CircleAlert aria-hidden className="size-4" />
                        Não respondida
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-border bg-card/80 p-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl border p-2 ${remainingSeconds < 60 ? "border-red-400/30 bg-red-400/10 text-red-200" : "border-primary/20 bg-primary/10 text-sky-200"}`}>
            <Clock3 aria-hidden className="size-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Tempo restante</p>
            <p className="font-mono text-xl font-semibold text-white" aria-live="polite">
              {formatTime(remainingSeconds)}
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-300">
          {answeredCount} de {questions.length} respondidas
        </div>
      </section>

      {submission?.error ? (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-200">
          {submission.error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <section className="rounded-[22px] border border-border bg-card/80 p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Questão {currentIndex + 1} de {questions.length}
            </p>
            <span className="text-xs text-slate-400">{question.subject} · {question.difficulty}</span>
          </div>
          <Progress
            className="mt-3"
            value={Math.round(((currentIndex + 1) / questions.length) * 100)}
            aria-label={`Questão ${currentIndex + 1} de ${questions.length}`}
          />
          <h2 className="mt-5 text-base font-semibold leading-relaxed text-white">
            {question.statement}
          </h2>
          <fieldset className="mt-5 space-y-2" disabled={submitting}>
            <legend className="sr-only">Alternativas</legend>
            {question.options.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                  answers[question.question_id] === option.id
                    ? "border-primary/50 bg-primary/10 text-white"
                    : "border-border bg-slate-950/50 text-slate-200 hover:bg-white/5"
                }`}
              >
                <input
                  type="radio"
                  name={`answer-${question.question_id}`}
                  value={option.id}
                  checked={answers[question.question_id] === option.id}
                  onChange={() => setAnswers((current) => ({
                    ...current,
                    [question.question_id]: option.id,
                  }))}
                  className="mt-0.5 size-4 shrink-0 accent-primary"
                />
                <span><strong className="mr-2">{option.label})</strong>{option.content}</span>
              </label>
            ))}
          </fieldset>
          <div className="mt-5 flex flex-wrap justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => moveTo(currentIndex - 1)}
              disabled={currentIndex === 0 || submitting}
            >
              <ArrowLeft aria-hidden />
              Anterior
            </Button>
            {currentIndex < questions.length - 1 ? (
              <Button type="button" onClick={() => moveTo(currentIndex + 1)} disabled={submitting}>
                Próxima
                <ArrowRight aria-hidden />
              </Button>
            ) : (
              <Button type="button" onClick={() => void finishSession()} disabled={submitting}>
                <Send aria-hidden />
                {submitting ? "Enviando…" : "Finalizar simulado"}
              </Button>
            )}
          </div>
        </section>

        <aside className="rounded-[22px] border border-border bg-card/80 p-4">
          <h2 className="text-sm font-semibold text-white">Questões</h2>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {questions.map((item, index) => (
              <button
                key={item.question_id}
                type="button"
                onClick={() => moveTo(index)}
                disabled={submitting}
                aria-current={index === currentIndex ? "step" : undefined}
                aria-label={`Ir para questão ${index + 1}${answers[item.question_id] ? ", respondida" : ", não respondida"}`}
                className={`flex size-9 items-center justify-center rounded-lg border text-xs font-medium transition ${
                  index === currentIndex
                    ? "border-primary bg-primary text-white"
                    : answers[item.question_id]
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                      : "border-border bg-slate-950/50 text-slate-300 hover:bg-white/5"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            Suas respostas e a correção serão registradas ao finalizar ou quando o tempo acabar.
          </p>
          {currentIndex < questions.length - 1 ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={() => void finishSession()}
              disabled={submitting}
            >
              Finalizar agora
            </Button>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
