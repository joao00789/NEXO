import Link from "next/link";
import { ArrowRight, BookOpen, ExternalLink, Feather } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  officialEnemArchiveUrl,
  type StudyContent,
} from "@/lib/content/catalog";

export function ContentLibrary({
  contents,
  query,
}: {
  contents: StudyContent[];
  query: string;
}) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-border bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.20),_transparent_35%),linear-gradient(135deg,_rgba(18,24,38,0.98),_rgba(10,11,16,0.94))] p-5 shadow-[0_20px_45px_rgba(10,17,30,0.45)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-200/80">
              Biblioteca de estudo
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white">Conteúdos</h1>
          </div>
          <Link href="/app/redacao" className={buttonVariants({ variant: "outline", className: "w-fit border-white/10 bg-white/5 text-white hover:bg-white/10" })}>
            <Feather aria-hidden />
            Abrir espaço de redação
            <ArrowRight aria-hidden />
          </Link>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">
          {contents.length} materiais autorais com resumos, exemplos, fórmulas, diagramas e fontes para aprofundar.
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-[22px] border border-sky-400/20 bg-sky-400/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-white">Provas anteriores e gabaritos oficiais</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">
            Consulte no INEP os enunciados originais e gabaritos de edições passadas. Os exercícios desta biblioteca são autorais do NEXO.
          </p>
        </div>
        <a
          href={officialEnemArchiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({
            variant: "outline",
            className: "w-fit shrink-0 border-sky-300/20 bg-sky-300/5 text-sky-100 hover:bg-sky-300/10",
          })}
        >
          Abrir acervo do INEP
          <ExternalLink aria-hidden />
        </a>
      </section>

      <form method="get" role="search" className="max-w-xl rounded-[22px] border border-border bg-card/80 p-3 shadow-[0_20px_35px_rgba(0,0,0,0.18)]">
        <div className="flex gap-2">
          <label htmlFor="content-search" className="sr-only">
            Buscar conteúdo
          </label>
          <input
            id="content-search"
            name="q"
            type="search"
            maxLength={80}
            defaultValue={query}
            placeholder="Buscar por tema ou matéria"
            className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/25"
          />
          <button
            type="submit"
            className="h-11 rounded-xl bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            Buscar
          </button>
        </div>
      </form>

      {contents.length ? (
        <section aria-label="Materiais de estudo" className="grid gap-4 sm:grid-cols-2">
          {contents.map((content) => (
            <Card key={content.slug} className="overflow-hidden border-border bg-[linear-gradient(180deg,_rgba(18,24,38,0.9),_rgba(9,10,16,0.92))] shadow-[0_20px_35px_rgba(0,0,0,0.18)]">
              <CardHeader className="gap-2 pb-3">
                <CardDescription className="text-sky-200/90">
                  {content.area} · {content.subject}
                </CardDescription>
                <CardTitle className="text-xl font-semibold text-white">{content.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm leading-relaxed text-slate-300">
                  {content.summary}
                </p>
                <div className="flex flex-wrap gap-2" aria-label="Recursos desta aula">
                  {content.formula ? <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] text-sky-100">Fórmula</span> : null}
                  {content.visual ? <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-200">Diagrama visual</span> : null}
                  {content.resources?.some((resource) => resource.kind === "videoaula") ? <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] text-violet-100">Videoaula externa</span> : null}
                  {content.resources?.some((resource) => resource.kind === "oficial") ? <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-100">Fonte oficial</span> : null}
                </div>
                <Link
                  href={`/app/conteudos/${content.slug}`}
                  className={buttonVariants({ variant: "outline", className: "w-fit border-white/10 bg-white/5 text-white hover:bg-white/10" })}
                >
                  <BookOpen aria-hidden />
                  Abrir conteúdo
                  <ArrowRight aria-hidden />
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : (
        <Card className="border-border bg-card/80">
          <CardContent className="p-6">
            <p className="font-medium text-white">Nenhum conteúdo encontrado</p>
            <p className="mt-1 text-sm text-slate-400">
              Tente outro termo de busca.
            </p>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-slate-400">
        Materiais autorais de apoio ao estudo; não são conteúdo oficial do ENEM.
      </p>
    </div>
  );
}
