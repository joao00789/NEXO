import type { Edge, Node } from "@xyflow/react";

import { studyContents, type StudyContent } from "@/lib/content/catalog";
import type { MindMapNodeData } from "@/lib/mindmaps/schemas";
import { treeToGraph, type MindMapTree } from "@/lib/mindmaps/engine";

export type { MindMapNodeData } from "@/lib/mindmaps/schemas";

export type MindMapGraph = { nodes: Node<MindMapNodeData>[]; edges: Edge[] };

export function getMindMapTemplate(
  slug: string,
  depth: "essencial" | "intermediario" | "aprofundado" = "essencial",
): { content: StudyContent; graph: MindMapGraph } | null {
  const content = studyContents.find((item) => item.slug === slug);
  if (!content) return null;

  const branches: MindMapTree["branches"] = [
    {
      label: "Definição",
      description: content.summary,
      children: [content.summary].slice(0, 1).map((item) => ({ label: item.length > 70 ? `${item.slice(0, 67)}...` : item })),
    },
    {
      label: "Conceitos-chave",
      description: "Ideias essenciais para revisar e recordar.",
      children: content.keyPoints.slice(0, 5).map((item) => ({ label: item.length > 70 ? `${item.slice(0, 67)}...` : item })),
    },
    {
      label: "Aplicação",
      description: "Quando e como usar o tema na prova.",
      children: [
        "Identifique o contexto do problema.",
        "Escolha a estratégia correta.",
        "Verifique a unidade e o resultado.",
      ].map((item) => ({ label: item })),
    },
    {
      label: "Exemplo",
      description: content.example.prompt,
      children: [
        { label: content.example.prompt.length > 70 ? `${content.example.prompt.slice(0, 67)}...` : content.example.prompt, description: "Situação-problema" },
        { label: content.example.solution.length > 70 ? `${content.example.solution.slice(0, 67)}...` : content.example.solution, description: "Resolução passo a passo" },
      ],
    },
    ...(content.formula
      ? [{
          label: "Fórmula",
          description: "Relação matemática central do conteúdo.",
          children: [{ label: content.formula }],
        }]
      : []),
    {
      label: "Erros comuns",
      description: "Pontos de atenção para evitar armadilhas típicas do ENEM.",
      children: content.commonMistakes.slice(0, 4).map((item) => ({ label: item.length > 70 ? `${item.slice(0, 67)}...` : item })),
    },
  ];

  const tree: MindMapTree = {
    title: content.title,
    summary: content.summary,
    branches: branches
      .filter((branch) => branch.children.length > 0)
      .slice(0, depth === "essencial" ? 4 : depth === "intermediario" ? 5 : 6)
      .map((branch) => ({
        ...branch,
        children: branch.children.slice(
          0,
          depth === "essencial" ? 3 : depth === "intermediario" ? 4 : 5,
        ),
      })),
  };

  return {
    content,
    graph: treeToGraph(tree),
  };
}
