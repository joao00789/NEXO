import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sobre" };

export default function SobrePage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Sobre o NEXO</h1>
      <div className="text-muted-foreground mt-6 flex flex-col gap-4 leading-relaxed">
        <p>
          O NEXO é uma plataforma de estudo integrada para o ENEM. Não é um
          simples site de questões nem um chatbot: é um produto que identifica o
          que o estudante precisa aprender, ensina, pratica, avalia e decide qual
          deve ser o próximo passo.
        </p>
        <p>
          Conceito: conexão entre estudante, conhecimento e evolução. Tudo
          relacionado ao estudo é gratuito. A única área de monetização é a
          personalização do avatar — skins, roupas, chapéus, acessórios, efeitos,
          molduras, fundos e itens cosméticos.
        </p>
        <p className="text-foreground font-medium">
          Estude. Evolua. Conquiste.
        </p>
      </div>
    </article>
  );
}
