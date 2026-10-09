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
            Exemplo resolvido
          </CardTitle>
          <CardDescription>{content.example.prompt}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{content.example.solution}</p>
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

      <div className="flex flex-wrap items-center gap-3">
        {content.area === "Redação" ? (
          <Link href="/app/redacao" className={buttonVariants()}>
            Escrever uma redação
            <ArrowRight aria-hidden />
          </Link>
        ) : (
          <Link
            href={`/app/questoes?area=${practiceArea[content.area] ?? "matematica"}&subject=${encodeURIComponent(content.subject)}&topic=${encodeURIComponent(content.title)}&quantidade=5`}
            className={buttonVariants()}
          >
            Praticar esse tema
            <ArrowRight aria-hidden />
          </Link>
        )}
        <span className="text-muted-foreground text-xs">
          Material autoral de apoio, não oficial do ENEM.
        </span>
      </div>
    </article>
  );
}
