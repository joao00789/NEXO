"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check, LoaderCircle, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  generatePracticeQuestion,
  submitGeneratedQuestionAnswer,
  type GenerateQuestionState,
} from "@/lib/questions/generated-actions";
import type { SignedQuestionPayload } from "@/lib/questions/generated-schema";

const areaLabels: Record<SignedQuestionPayload["area"], string> = {
  matematica: "Matemática",
  linguagens: "Linguagens",
  humanas: "Ciências Humanas",
  natureza: "Ciências da Natureza",
};

const difficultyLabels: Record<SignedQuestionPayload["difficulty"], string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
  enem: "Estilo ENEM",
};

export function AIQuestionPractice({
  initialArea,
  initialDifficulty,
  initialSubject,
  initialTopic,
}: {
  initialArea: SignedQuestionPayload["area"];
  initialDifficulty: SignedQuestionPayload["difficulty"];
  initialSubject: string;
  initialTopic: string;
}) {
  const [generation, generateAction, generating] = useActionState<
    GenerateQuestionState,
    FormData
  >(generatePracticeQuestion, {});
  const [answer, answerAction, answering] = useActionState(
    submitGeneratedQuestionAnswer,
    {},
  );
  const [selection, setSelection] = useState<{
    questionId: string;
    label: string;
  } | null>(null);
  const startedAt = useRef<number | null>(null);
  const elapsedInput = useRef<HTMLInputElement>(null);
  const question = generation.question;
  const result =
    question?.id === answer.result?.question_id ? answer.result : undefined;
  const selected =
    selection && question && selection.questionId === question.id
      ? selection.label
      : "";

  useEffect(() => {
    startedAt.current = performance.now();
  }, [question?.id]);

  function handleAnswerSubmit() {
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
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles aria-hidden className="text-primary size-4" />
            Criar questão na hora
          </CardTitle>
          <CardDescription>
            A IA cria uma questão autoral para o tema escolhido. Ela não precisa estar
            cadastrada no banco.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={generateAction}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          >
            <label className="flex flex-col gap-1.5 text-sm">
              Área
              <select
                name="area"
                defaultValue={initialArea}
                className="border-border bg-background h-10 rounded-xl border px-3"
              >
                {Object.entries(areaLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Dificuldade
              <select
                name="difficulty"
                defaultValue={initialDifficulty}
                className="border-border bg-background h-10 rounded-xl border px-3"
              >
                {Object.entries(difficultyLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Matéria
              <input
                name="subject"
                defaultValue={initialSubject}
                minLength={2}
                maxLength={100}
                required
                placeholder="Ex.: Física"
                className="border-border bg-background h-10 rounded-xl border px-3"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Tema
              <input
                name="topic"
                defaultValue={initialTopic}
                minLength={2}
                maxLength={160}
                required
                placeholder="Ex.: Leis de Newton"
                className="border-border bg-background h-10 rounded-xl border px-3"
              />
            </label>
            <div className="flex items-end">
              <Button type="submit" disabled={generating} className="w-full">
                {generating ? (
                  <>
                    <LoaderCircle className="animate-spin" /> Criando…
                  </>
                ) : (
                  "Gerar questão"
                )}
              </Button>
            </div>
          </form>
          {generation.error ? (
            <p className="text-destructive mt-3 text-sm" role="alert">
              {generation.error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {question ? (
        <Card>
          <CardHeader>
            <CardDescription>
              {areaLabels[question.area]} · {question.subject} · {question.topic} ·{" "}
              {difficultyLabels[question.difficulty]}
            </CardDescription>
            <CardTitle className="text-base leading-relaxed">
              {question.statement}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4" role="status" aria-live="polite">
                <p
                  className={`flex items-center gap-2 text-sm font-semibold ${result.is_correct ? "text-emerald-400" : "text-destructive"}`}
                >
                  {result.is_correct ? <Check aria-hidden /> : <X aria-hidden />}
                  {result.is_correct
                    ? "Resposta correta"
                    : `Resposta incorreta · alternativa correta: ${result.correct_label}`}
                </p>
                <div className="border-border bg-muted/40 rounded-xl border p-4">
                  <h3 className="font-semibold">
                    Por que sua resposta está {result.is_correct ? "certa" : "errada"}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed">
                    {result.selected_explanation}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Resolução passo a passo</h3>
                  <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                    {result.solution_steps.map((step, index) => (
                      <li key={`${index}-${step}`}>{step}</li>
                    ))}
                  </ol>
                </div>
                {result.detailed_feedback ? (
                  <div className="border-border bg-muted/30 rounded-xl border p-4">
                    <h3 className="font-semibold">
                      Feedback detalhado e passos para melhorar
                    </h3>
                    <div className="mt-2 text-sm leading-relaxed whitespace-pre-line">
                      {result.detailed_feedback}
                    </div>
                  </div>
                ) : null}
                <details className="border-border rounded-xl border p-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Ver explicação de todas as alternativas
                  </summary>
                  <ul className="mt-3 space-y-3 text-sm leading-relaxed">
                    {result.option_explanations.map((item) => (
                      <li key={item.label}>
                        <strong>{item.label}.</strong> {item.explanation}
                      </li>
                    ))}
                  </ul>
                </details>
                <p className="text-muted-foreground text-xs">
                  +{result.xp_earned} XP · {result.correct_answers} acertos em{" "}
                  {result.total_answers} nesta área.
                </p>
              </div>
            ) : (
              <form
                action={answerAction}
                onSubmit={handleAnswerSubmit}
                className="space-y-3"
              >
                <input type="hidden" name="questionToken" value={question.token} />
                <input
                  ref={elapsedInput}
                  type="hidden"
                  name="elapsedSeconds"
                  value="0"
                  readOnly
                />
                <fieldset className="space-y-2" disabled={answering}>
                  <legend className="sr-only">Escolha uma alternativa</legend>
                  {question.options.map((option) => (
                    <label
                      key={option.label}
                      className={`border-border hover:bg-accent flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${selected === option.label ? "border-primary bg-accent" : ""}`}
                    >
                      <input
                        type="radio"
                        name="optionLabel"
                        value={option.label}
                        checked={selected === option.label}
                        onChange={() =>
                          setSelection({ questionId: question.id, label: option.label })
                        }
                        required
                        className="accent-primary mt-0.5 size-4"
                      />
                      <span>
                        <strong className="mr-2">{option.label})</strong>
                        {option.content}
                      </span>
                    </label>
                  ))}
                </fieldset>
                {answer.error ? (
                  <p className="text-destructive text-sm" role="alert">
                    {answer.error}
                  </p>
                ) : null}
                <Button type="submit" disabled={answering || !selected}>
                  {answering ? "Corrigindo…" : "Responder e ver explicação"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-muted-foreground p-6 text-sm">
            Escolha a matéria e o tema para montar seu próximo exercício personalizado.
          </CardContent>
        </Card>
      )}
      <p className="text-muted-foreground text-xs">
        Questões autorais geradas por IA para estudo. Não são questões oficiais nem
        representam nota oficial do ENEM.
      </p>
    </div>
  );
}
