import { studyContents } from "@/lib/content/catalog";
import { generateMindMapTree } from "@/lib/ai/mindmap-gateway";
import { treeToGraph } from "@/lib/mindmaps/engine";
import { mindMapGraphSchema, mindMapDepthSchema, mindMapDepths } from "@/lib/mindmaps/schemas";
import type { MindMapGraph } from "@/lib/mindmaps/templates";

export type { MindMapGraph, MindMapNodeData } from "@/lib/mindmaps/templates";

export async function regenerateMindMap(mapId: string, depth: string, useAi: boolean) {
  const supabase = await (await import("@/lib/supabase/server")).createSupabaseServerClient();
  const { requireUserSession } = await import("@/lib/auth/session");
  const user = await requireUserSession();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(mapId)) {
    throw new Error("Mapa inválido.");
  }
  const depthResult = mindMapDepthSchema.safeParse(depth);
  if (!depthResult.success) throw new Error("Profundidade inválida.");
  if (!mindMapDepths.includes(depthResult.data)) throw new Error("Profundidade inválida.");

  const { data, error } = await supabase
    .from("mind_maps")
    .select("id, title, subject, topic")
    .eq("id", mapId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) throw new Error("Mapa não encontrado.");

  const content = studyContents.find((item) => item.title === data.title) ?? studyContents.find((item) => item.subject === data.subject && item.title === data.topic);
  const template = content
    ? (await import("@/lib/mindmaps/templates")).getMindMapTemplate(content.slug, depthResult.data)
    : null;
  if (!content || !template) throw new Error("Não foi possível regenerar o mapa: conteúdo base indisponível.");

  let graph: MindMapGraph = template.graph;
  if (useAi) {
    const { data: allowed, error: quotaError } = await supabase.rpc(
      "consume_mindmap_ai_quota",
    );
    if (quotaError) {
      console.error("Mind map quota check failed.", quotaError);
      throw new Error("Não foi possível verificar o limite diário de IA. Tente novamente.");
    }
    if (!allowed) {
      throw new Error("Você atingiu o limite de 20 mapas com IA por dia. Tente novamente amanhã.");
    }

    try {
      const tree = await generateMindMapTree(
        {
          title: content.title,
          subject: content.subject,
          area: content.area,
          summary: content.summary,
          keyPoints: content.keyPoints,
          commonMistakes: content.commonMistakes,
          examplePrompt: content.example.prompt,
          exampleSolution: content.example.solution,
          formula: content.formula,
          depth: depthResult.data,
        },
      );
      graph = treeToGraph(tree, "concept-center");
    } catch (aiError) {
      console.error("Mind map AI regeneration failed.", aiError);
      throw new Error("A IA não conseguiu regenerar o mapa. Seus conceitos atuais foram preservados.");
    }
  } else {
    graph = template.graph;
  }

  const parsed = mindMapGraphSchema.safeParse({ nodes: graph.nodes, edges: graph.edges });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Falha ao validar o mapa regenerado.");

  const { error: updateError } = await supabase
    .from("mind_maps")
    .update({
      nodes: parsed.data.nodes,
      edges: parsed.data.edges,
      updated_at: new Date().toISOString(),
    })
    .eq("id", mapId)
    .eq("user_id", user.id);
  if (updateError) throw new Error("Não foi possível salvar o mapa regenerado.");

  return graph;
}