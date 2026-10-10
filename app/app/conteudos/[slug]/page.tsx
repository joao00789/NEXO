import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, CircleAlert, ExternalLink, Lightbulb, Play } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStudyContent } from "@/lib/content/catalog";
import { StudyIllustration } from "@/components/content/study-illustration";

const practiceArea: Record<string, string> = {
  Matemática: "matematica",
  Linguagens: "linguagens",
  "Ciências Humanas": "humanas",
  "Ciências da Natureza": "natureza",
  Redação: "linguagens",
};

const nexotips: Record<string, string> = {
  Matemática: "Antes de calcular, anote o que o enunciado pede e confira as unidades no resultado.",
  Linguagens: "Leia o comando da questão e procure no texto a evidência que sustenta sua interpretação.",
  "Ciências Humanas": "Relacione fonte, contexto, período e ponto de vista; evite explicar um processo por uma causa única.",
  "Ciências da Natureza": "Desenhe o processo ou organize os dados e só então escolha a fórmula ou conceito.",
  Redação: "Planeje a tese e os dois eixos antes de escrever; na revisão, confira se cada argumento ajuda a responder ao tema.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = getStudyContent(slug);
  return { title: content?.title ?? "Conteúdo" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = getStudyContent(slug);
  if (!content) notFound();

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link
        href="/app/conteudos"
        className={buttonVariants({ variant: "ghost", className: "-ml-2 w-fit" })}
      >
        <ArrowLeft aria-hidden />
        Voltar aos conteúdos
      </Link>

      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">
          {content.area} · {content.subject}
        </p>
        <h1 className="font-display text-3xl font-bold">{content.title}</h1>
        <p className="text-muted-foreground leading-relaxed">{content.summary}</p>
      </header>

      {content.steps?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roteiro passo a passo</CardTitle>
            <CardDescription>
              Um caminho de estudo possível. Adapte a estrutura ao tema e às suas ideias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-4">
              {content.steps.map((step) => (
                <li key={step.title} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {step.title.match(/^\d+/)?.[0]}
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">{step.title.replace(/^\d+\.\s*/, "")}</h2>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ideias principais</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex list-disc flex-col gap-3 pl-5 text-sm leading-relaxed">
            {content.keyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {content.formula && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fórmula para guardar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="bg-muted rounded-lg p-4 text-center font-mono text-sm leading-relaxed">{content.formula}</p>
          </CardContent>
        </Card>
      )}

      <StudyIllustration visual={content.visual} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb aria-hidden className="text-brand size-4" />
            Exercício do tema
          </CardTitle>
          <CardDescription>
            Tente resolver antes de abrir a resposta. Anote seu raciocínio e só depois confira.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{content.example.prompt}</p>
          <details className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
            <summary className="cursor-pointer text-sm font-medium">
              Conferir uma resolução possível
            </summary>
            <p className="mt-3 text-sm leading-relaxed">{content.example.solution}</p>
          </details>
        </CardContent>
      </Card>

      {content.resources?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Continue estudando</CardTitle>
            <CardDescription>Materiais externos abrem em uma nova aba. Cada fonte mantém seus próprios direitos e autoria.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {content.resources.map((resource) => {
              const Icon = resource.kind === "videoaula" ? Play : resource.kind === "oficial" ? BookOpen : ExternalLink;
              return (
                <a key={`${resource.label}-${resource.url}`} href={resource.url} target="_blank" rel="noreferrer" className="border-border hover:bg-muted focus-visible:ring-ring flex min-h-11 items-center gap-2 rounded-lg border p-3 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none">
                  <Icon aria-hidden className="text-primary size-4 shrink-0" />
                  <span>{resource.label}</span>
                </a>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CircleAlert aria-hidden className="text-muted-foreground size-4" />
            Erros comuns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
            {content.commonMistakes.map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Conselho do NEXO</CardTitle>
          <CardDescription className="leading-relaxed">
            {nexotips[content.area] ?? "Estude em blocos curtos, tente lembrar o conteúdo sem consultar o resumo e volte aos pontos que ainda geram dúvida."}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        {content.area === "Redação" ? (
          <Link href="/app/redacao" className={buttonVariants()}>
            Praticar uma redação
            <ArrowRight aria-hidden />
          </Link>
        ) : null}
        <Link
          href={`/app/questoes?area=${practiceArea[content.area] ?? "matematica"}&subject=${encodeURIComponent(content.subject)}&topic=${encodeURIComponent(content.title)}`}
          className={buttonVariants({ variant: content.area === "Redação" ? "outline" : "default" })}
        >
          Gerar exercício deste tema
          <ArrowRight aria-hidden />
        </Link>
        {content.area !== "Redação" ? (
          <span className="text-muted-foreground text-xs">
            Questões novas são geradas para este tema e corrigidas ao responder.
          </span>
        ) : null}
        <span className="text-muted-foreground text-xs">
          Material autoral de apoio, não oficial do ENEM. Referências da Wikipédia são complementares.
        </span>
      </div>
    </article>
  );
}
