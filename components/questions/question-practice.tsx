"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check, CircleHelp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { submitQuestionAnswer } from "@/lib/questions/actions";

export type PracticeQuestion = {
  question_id: string;
  area: string;
  subject: string;
  topic: string;
  difficulty: "facil" | "medio" | "dificil" | "enem";
  statement: string;
  options: { id: string; label: string; content: string }[];
};

const difficultyLabels: Record<PracticeQuestion["difficulty"], string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
  enem: "Estilo ENEM",
};

function QuestionCard({ question }: { question: PracticeQuestion }) {
  const [state, action, pending] = useActionState(submitQuestionAnswer, {});
  const [selected, setSelected] = useState("");
  const startedAt = useRef<number | null>(null);
  const elapsedInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startedAt.current = performance.now();
  }, []);

  function handleSubmit() {
    if (elapsedInput.current) {
      elapsedInput.current.value = String(
        Math.min(
          3600,
          Math.floor(
            startedAt.current === null
              ? 0
              : (performance.now() - startedAt.current) / 1000,
          ),
        ),
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          {question.subject} · {question.topic} ·{" "}
          {difficultyLabels[question.difficulty]}
        </CardDescription>
        <CardTitle className="text-base leading-relaxed">
          {question.statement}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {state.result ? (
          <div className="flex flex-col gap-3" role="status" aria-live="polite">
            <div
              className={
                state.result.is_correct
                  ? "flex items-center gap-2 text-sm font-semibold text-emerald-400"
                  : "text-destructive flex items-center gap-2 text-sm font-semibold"
              }
            >
              {state.result.is_correct ? <Check aria-hidden /> : <X aria-hidden />}
              {state.result.is_correct ? "Resposta correta" : "Resposta incorreta"}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {state.result.explanation}
            </p>
            <p className="text-muted-foreground text-xs">
              Seu aproveitamento nesta área: {state.result.correct_answers} acertos em{" "}
              {state.result.total_answers} questões.
            </p>
          </div>
        ) : (
          <form action={action} onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input type="hidden" name="questionId" value={question.question_id} />
            <input
              ref={elapsedInput}
              type="hidden"
              name="elapsedSeconds"
              value="0"
              readOnly
            />
            <fieldset className="flex flex-col gap-2" disabled={pending}>
              <legend className="sr-only">Alternativas da questão</legend>
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={`border-border hover:bg-accent flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${selected === option.id ? "border-primary bg-accent" : ""}`}
                >
                  <input
                    type="radio"
                    name="optionId"
                    value={option.id}
                    checked={selected === option.id}
                    onChange={() => setSelected(option.id)}
                    required
                    className="accent-primary mt-0.5 size-4 shrink-0"
                  />
                  <span>
                    <span className="mr-2 font-semibold">{option.label})</span>
                    {option.content}
                  </span>
                </label>
              ))}
            </fieldset>
            {state.error && (
              <p className="text-destructive text-sm" role="alert">
                {state.error}
              </p>
            )}
            <Button type="submit" disabled={pending || !selected} className="w-fit">
              {pending ? "Corrigindo…" : "Responder questão"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export function QuestionPractice({ questions }: { questions: PracticeQuestion[] }) {
  if (!questions.length) {
    return (
      <Card>
        <CardContent className="flex items-start gap-3 p-6">
          <CircleHelp
            aria-hidden
            className="text-muted-foreground mt-0.5 size-5 shrink-0"
          />
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">Nenhuma questão disponível</h2>
            <p className="text-muted-foreground text-sm">
              Ainda não há questões aprovadas para este treino. Volte em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {questions.map((question) => (
        <QuestionCard key={question.question_id} question={question} />
      ))}
      <p className="text-muted-foreground text-xs">
        {questions.length}{" "}
        {questions.length === 1 ? "questão carregada" : "questões carregadas"}. A
        correção é educacional e não representa nota oficial do ENEM.
      </p>
    </div>
  );
}
