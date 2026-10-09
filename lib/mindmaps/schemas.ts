import { z } from "zod";

export const mindMapColors = ["blue", "cyan", "violet", "teal", "amber", "rose"] as const;
export const mindMapColorSchema = z.enum(mindMapColors);

export const mindMapNodeKinds = ["root", "branch", "leaf"] as const;
export const mindMapNodeKindSchema = z.enum(mindMapNodeKinds);

export const mindMapDepths = ["essencial", "intermediario", "aprofundado"] as const;
export const mindMapDepthSchema = z.enum(mindMapDepths);

export const mindMapDepthLabels: Record<(typeof mindMapDepths)[number], string> = {
  essencial: "Essencial",
  intermediario: "Intermediário",
  aprofundado: "Aprofundado",
};

export const mindMapNodeSchema = z.object({
  id: z.string().min(1).max(80),
  type: z.enum(["concept", "default", "input", "output", "group"]).optional(),
  position: z.object({ x: z.number().finite().min(-10000).max(10000), y: z.number().finite().min(-10000).max(10000) }),
  data: z.object({
    label: z.string().trim().min(1).max(180),
    description: z.string().trim().max(500).optional(),
    color: mindMapColorSchema.optional(),
    kind: mindMapNodeKindSchema.optional(),
  }),
});

export const mindMapEdgeSchema = z.object({
  id: z.string().min(1).max(160),
  source: z.string().min(1).max(80),
  target: z.string().min(1).max(80),
});

export const mindMapGraphSchema = z.object({
  nodes: z.array(mindMapNodeSchema).min(1).max(40),
  edges: z.array(mindMapEdgeSchema).max(80),
}).superRefine(({ nodes, edges }, ctx) => {
  const nodeIds = new Set(nodes.map(({ id }) => id));
  if (nodeIds.size !== nodes.length) {
    ctx.addIssue({ code: "custom", message: "O mapa contém nós repetidos." });
  }
  for (const [index, edge] of edges.entries()) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      ctx.addIssue({ code: "custom", path: ["edges", index], message: "A conexão aponta para um conceito inexistente." });
    }
  }
});

export const createMindMapSchema = z.object({
  contentSlug: z.string().trim().min(1).max(100),
  depth: mindMapDepthSchema,
  useAi: z.preprocess((value) => value === "on" || value === "true", z.boolean()),
});

/**
 * Estrutura em árvore usada tanto pelo motor determinístico quanto pela IA.
 * A IA LAYOUT dos nós é calculado depois, sempre no servidor, para evitar
 * nós sobrepostos e posições inválidas.
 */
export const mindMapTreeSchema = z.object({
  title: z.string().trim().min(2).max(120),
  summary: z.string().trim().max(500).optional(),
  branches: z.array(z.object({
    label: z.string().trim().min(2).max(80),
    description: z.string().trim().max(300).optional(),
    children: z.array(z.object({
      label: z.string().trim().min(2).max(140),
      description: z.string().trim().max(300).optional(),
    })).min(1).max(5),
  })).min(2).max(6),
});

export type MindMapTree = z.infer<typeof mindMapTreeSchema>;
export type MindMapNodeData = z.infer<typeof mindMapNodeSchema>["data"];