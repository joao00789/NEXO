import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Como funciona" };

const steps = [
  {
    title: "Diagnóstico inicial",
    text: "Avaliamos Matemática, Linguagens, Ciências Humanas e Ciências da Natureza para conhecer seu nível em cada área.",
  },
  {
    title: "Plano de estudo",
    text: "Você recebe temas fortes, temas fracos, recomendações e um plano inicial do que estudar primeiro.",
  },
  {
    title: "Conteúdo e prática",
    text: "Resumos, mapas mentais e questões com explicação. Cada erro entra em um ciclo de revisão inteligente.",
  },
  {
    title: "Avaliação contínua",
    text: "Taxa de acerto, evolução, nota estimada, missões, XP e sequência para manter o ritmo.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        Como funciona
      </h1>
      <p className="text-muted-foreground mt-4 leading-relaxed">
        O NEXO sempre responde três perguntas: o que devo estudar, por que
        preciso estudar isso e o que devo fazer agora.
      </p>

      <ol className="mt-10 flex flex-col gap-6">
        {steps.map((step, index) => (
          <li key={step.title} className="border-border flex gap-4 border-b pb-6">
            <span className="text-brand font-display text-sm font-bold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-semibold">{step.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.text}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <Button render={<Link href="/cadastro" />}>
          Começar agora
          <ArrowRight aria-hidden />
        </Button>
      </div>
    </article>
  );
}
