import "server-only";

import { generateJson } from "@/lib/ai/gateway";
import { mindMapDepthSchema, mindMapTreeSchema, type MindMapTree } from "@/lib/mindmaps/schemas";

const mindMapPrompt = `Você é um professor especialista em preparação para o ENEM. Transforme o material fornecido em um mapa mental útil para revisão e compreensão.

Regras:
- Retorne somente um objeto JSON válido no formato solicitado, sem markdown nem texto antes ou depois.
- Use o conteúdo-base como fonte: não acrescente datas, fórmulas, causas ou definições que não estejam apoiadas nele ou em conhecimento escolar consolidado.
- Preserve os limites e a terminologia do recorte. Não transforme exemplos em fatos gerais.
- Organize os ramos por relações de aprendizagem (conceito, componentes, aplicação, relações e cuidados), e não por frases repetidas do resumo.
- Dê a cada ramo uma descrição que explique sua ligação com o tema central; cada folha deve conter uma ideia específica, concisa e diferente das demais.
- Evite rótulos vagos como “outros”, “importante” e “conclusão”, redundância, frases completas longas e explicações em parágrafos.
- Não afirme que o mapa ou o conteúdo é oficial do ENEM.
- Máximo absoluto: 6 ramos e 5 folhas por ramo.

Formato: { "title": "...", "summary": "...", "branches": [{"label": "...", "description": "...", "children": [{"label": "...", "description": "..."}]}] }`;

const depthGuidance = {
  essencial: {
    branchRange: "3 a 4",
    leafRange: "2 a 3",
    focus: "priorize apenas definições e relações indispensáveis para uma revisão rápida",
    minBranches: 3,
    maxBranches: 4,
    minLeaves: 2,
    maxLeaves: 3,
  },
  intermediario: {
    branchRange: "4 a 5",
    leafRange: "3 a 4",
    focus: "inclua conceitos, aplicações e erros comuns relevantes",
    minBranches: 4,
    maxBranches: 5,
    minLeaves: 3,
    maxLeaves: 4,
  },
  aprofundado: {
    branchRange: "5 a 6",
    leafRange: "4 a 5",
    focus: "explique relações, condições de aplicação, limitações e conexões entre conceitos",
    minBranches: 5,
    maxBranches: 6,
    minLeaves: 4,
    maxLeaves: 5,
  },
} as const;

export type MindMapGenerationInput = {
  title: string;
  subject: string;
  area: string;
  summary: string;
  keyPoints: string[];
  commonMistakes: string[];
  examplePrompt: string;
  exampleSolution: string;
  formula?: string;
  depth?: string;
};

export async function generateMindMapTree(
  input: MindMapGenerationInput,
): Promise<MindMapTree> {
  const depthResult = mindMapDepthSchema.safeParse(input.depth ?? "essencial");
  if (!depthResult.success) throw new Error("Profundidade de mapa mental inválida.");
  const depthLabel = depthResult.data;
  const guidance = depthGuidance[depthLabel];

  const prompt = `Tema: ${input.title}
Matéria: ${input.subject}
Área: ${input.area}
Objetivo: revisão para o ENEM
Profundidade: ${depthLabel}
Tamanho esperado: ${guidance.branchRange} ramos e ${guidance.leafRange} folhas em cada ramo.
Foco da profundidade: ${guidance.focus}.

Resumo-base:
${input.summary}

Pontos-chave:
${input.keyPoints.map((point, index) => `${index + 1}. ${point}`).join("\n")}

Erros comuns a prevenir:
${input.commonMistakes.length ? input.commonMistakes.map((mistake, index) => `${index + 1}. ${mistake}`).join("\n") : "Não informado."}

Exemplo autoral para contextualização:
Situação: ${input.examplePrompt}
Resolução: ${input.exampleSolution}

Fórmula informada: ${input.formula ?? "Nenhuma fórmula fornecida."}

Gere o mapa dentro dos limites de tamanho esperados. Distribua os pontos-base pelos ramos, sem repetir o resumo.`;

  const raw = await generateJson(
    mindMapPrompt,
    prompt,
    { maxOutputTokens: 3500, temperature: 0.15 },
  );
  const tree = mindMapTreeSchema.parse(raw);
  if (
    tree.branches.length < guidance.minBranches ||
    tree.branches.length > guidance.maxBranches ||
    tree.branches.some(
      (branch) =>
        branch.children.length < guidance.minLeaves ||
        branch.children.length > guidance.maxLeaves,
    )
  ) {
    throw new Error(`O mapa gerado excedeu o limite de nós para a profundidade ${depthLabel}.`);
  }
  return tree;
}