"use client";

import { useActionState } from "react";
import { ExternalLink, LoaderCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateStudyLesson } from "@/lib/content/ai-actions";

const sources = [
  {
    label: "Provas e gabaritos oficiais do ENEM · INEP",
    url: "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos",
  },
  {
    label: "Base Nacional Comum Curricular · MEC",
    url: "https://basenacionalcomum.mec.gov.br/",
  },
  {
    label: "Khan Academy em português",
    url: "https://pt.khanacademy.org/",
  },
  {
    label: "IBGE Educa",
    url: "https://educa.ibge.gov.br/",
  },
  {
    label: "Toda Matéria · consulta por tema",
    url: "https://www.todamateria.com.br/",
  },
];

export function AIStudyBuilder() {
  const [state, action, pending] = useActionState(generateStudyLesson, {});

  return (
    <section className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles aria-hidden className="size-4 text-primary" />
            Montar aula por tema
          </CardTitle>
          <CardDescription>
            Gere uma explicação original sob demanda e use as fontes confiáveis como leitura complementar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm">
              Área
              <select name="area" defaultValue="matematica" className="h-10 rounded-xl border border-border bg-background px-3">
                <option value="matematica">Matemática</option>
                <option value="linguagens">Linguagens</option>
                <option value="humanas">Ciências Humanas</option>
                <option value="natureza">Ciências da Natureza</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Matéria
              <input name="subject" required minLength={2} maxLength={100} defaultValue="Matemática" placeholder="Ex.: Biologia" className="h-10 rounded-xl border border-border bg-background px-3" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Tema
              <input name="topic" required minLength={2} maxLength={160} placeholder="Ex.: Ecologia e cadeias alimentares" className="h-10 rounded-xl border border-border bg-background px-3" />
            </label>
            <div className="sm:col-span-3">
              <Button type="submit" disabled={pending}>
                {pending ? <><LoaderCircle className="animate-spin" /> Preparando aula…</> : "Criar aula"}
              </Button>
            </div>
          </form>
          {state.error ? <p className="mt-3 text-sm text-destructive" role="alert">{state.error}</p> : null}
        </CardContent>
      </Card>

      {state.lesson ? (
        <article className="space-y-4" aria-live="polite">
          <header>
            <p className="text-sm text-muted-foreground">Aula autoral criada para: {state.topic}</p>
            <h2 className="mt-1 font-display text-2xl font-bold">{state.lesson.title}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{state.lesson.introduction}</p>
          </header>
          {state.lesson.sections.map((section) => (
            <Card key={section.heading}>
              <CardHeader>
                <CardTitle className="text-base">{section.heading}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed">{section.explanation}</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {section.key_points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Exemplo resolvido</CardTitle>
              <CardDescription>{state.lesson.worked_example.prompt}</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                {state.lesson.worked_example.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
              </ol>
              <p className="mt-3 text-sm font-semibold">Resposta: {state.lesson.worked_example.answer}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Erros para evitar</CardTitle></CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
                {state.lesson.common_mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Confira se aprendeu</CardTitle>
              <CardDescription>{state.lesson.self_check.question}</CardDescription>
            </CardHeader>
            <CardContent>
              <details>
                <summary className="cursor-pointer text-sm font-medium">Mostrar resposta</summary>
                <p className="mt-2 text-sm leading-relaxed">{state.lesson.self_check.answer}</p>
              </details>
            </CardContent>
          </Card>
          {state.lesson.sources && state.lesson.sources.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fontes sugeridas pela IA</CardTitle>
                <CardDescription>Trechos curtos e links recomendados para aprofundar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {state.lesson.sources.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-border p-3 text-sm hover:bg-muted">
                    <div className="font-semibold">{s.label}</div>
                    {s.excerpt ? <div className="mt-1 text-xs text-muted-foreground">{s.excerpt}</div> : null}
                    <div className="mt-1 text-xs text-primary">{s.url}</div>
                  </a>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </article>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fontes para aprofundar</CardTitle>
          <CardDescription>
            Links externos de referência; os materiais originais pertencem aos seus autores e instituições.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {sources.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 rounded-lg border border-border p-3 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <ExternalLink aria-hidden className="size-4 shrink-0 text-primary" />
              {source.label}
            </a>
          ))}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Aulas geradas por IA são materiais autorais de apoio, não conteúdo oficial do INEP. Confira conceitos importantes nas fontes indicadas.
      </p>
    </section>
  );
}
