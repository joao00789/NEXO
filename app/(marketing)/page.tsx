import Link from "next/link";
import {
  ArrowRight,
  Brain,
  GraduationCap,
  LineChart,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Target,
    title: "Diagnóstico personalizado",
    description:
      "Descubra seu nível em cada área do ENEM e receba um plano de estudo inicial.",
  },
  {
    icon: Brain,
    title: "Revisão inteligente",
    description:
      "O NEXO identifica seus erros e agenda revisões na frequência certa.",
  },
  {
    icon: Zap,
    title: "Gamificação",
    description:
      "Ganhe XP, mantenha sequências, complete missões e evolua de nível estudando.",
  },
  {
    icon: LineChart,
    title: "Desempenho real",
    description:
      "Acompanhe taxa de acerto, evolução por matéria e nota estimada ao longo do tempo.",
  },
  {
    icon: GraduationCap,
    title: "Conteúdo e redação",
    description:
      "Resumos, mapas mentais e correção de redação pelas 5 competências do ENEM.",
  },
  {
    icon: Trophy,
    title: "Avatar e loja",
    description:
      "Personalize seu avatar com itens cosméticos conquistados ou comprados com NEXO Coins.",
  },
];

const steps = [
  { number: "01", title: "Faça o diagnóstico", text: "Uma avaliação rápida por área do ENEM." },
  { number: "02", title: "Receba seu plano", text: "O NEXO define o que estudar primeiro." },
  { number: "03", title: "Pratique e revise", text: "Questões, conteúdos e revisão espaçada." },
  { number: "04", title: "Evolua e conquiste", text: "XP, missões, sequências e avatar." },
];

export default function HomePage() {
  return (
    <>
      <section className="border-border border-b">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28">
          <Logo variant="mark" className="h-16 w-auto" />
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
            Seu caminho até o ENEM
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
            O NEXO identifica o que você precisa aprender, ensina, pratica,
            avalia e decide qual deve ser o seu próximo passo. Estudo
            personalizado, gamificado e gratuito.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/cadastro" />}>
              Começar grátis
              <ArrowRight aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={<Link href="/como-funciona" />}
            >
              Como funciona
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex flex-col gap-2">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Tudo que você precisa para evoluir
          </h2>
          <p className="text-muted-foreground">
            Estude. Evolua. Conquiste. Sem pagar nada por conteúdo.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon aria-hidden className="text-brand size-5" />
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-border bg-surface border-y">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 flex flex-col gap-2">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Como funciona
            </h2>
            <p className="text-muted-foreground">
              Quatro passos para transformar seu estudo.
            </p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.number} className="flex flex-col gap-2">
                <span className="text-brand font-display text-sm font-bold">
                  {step.number}
                </span>
                <span className="font-semibold">{step.title}</span>
                <span className="text-muted-foreground text-sm">{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <Card className="bg-card">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Conecte-se ao seu próximo nível
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Crie sua conta gratuita e comece com um diagnóstico das áreas do
              ENEM.
            </p>
            <Button size="lg" render={<Link href="/cadastro" />}>
              Criar conta grátis
              <ArrowRight aria-hidden />
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
