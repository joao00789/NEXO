"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserSession } from "@/lib/auth/session";
import { createMindMapSchema, mindMapGraphSchema } from "@/lib/mindmaps/schemas";
import { getMindMapTemplate } from "@/lib/mindmaps/templates";
import { treeToGraph } from "@/lib/mindmaps/engine";
import { generateMindMapTree } from "@/lib/ai/mindmap-gateway";
import { getStudyContent } from "@/lib/content/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MindMapActionState = { error?: string };

export async function createMindMapAction(
  _previousState: MindMapActionState,
  formData: FormData,
): Promise<MindMapActionState> {
  const user = await requireUserSession();
  const parsed = createMindMapSchema.safeParse({
    contentSlug: formData.get("contentSlug"),
    depth: formData.get("depth"),
    useAi: formData.get("useAi"),
  });
  if (!parsed.success) return { error: "Escolha um conteúdo válido para criar o mapa." };

  const content = getStudyContent(parsed.data.contentSlug);
  const template = getMindMapTemplate(parsed.data.contentSlug, parsed.data.depth);
  if (!content || !template) return { error: "Esse conteúdo ainda não tem um modelo de mapa." };

  const supabase = await createSupabaseServerClient();
  let graph = template.graph;
  let usedFallback = false;

  if (parsed.data.useAi) {
    const { data: allowed, error: quotaError } = await supabase.rpc(
      "consume_mindmap_ai_quota",
    );
    if (quotaError) {
      console.error("Mind map quota check failed.", quotaError);
      return { error: "Não foi possível verificar o limite diário de IA. Tente novamente." };
    }
    if (!allowed) {
      return { error: "Você atingiu o limite de 20 mapas com IA por dia. Tente novamente amanhã." };
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
          depth: parsed.data.depth,
        },
      );
      graph = treeToGraph(tree);
    } catch (aiError) {
      console.warn("Mind map AI generation failed, falling back to deterministic tree.", aiError);
      graph = template.graph;
      usedFallback = true;
    }
  }

  const { data, error } = await supabase
    .from("mind_maps")
    .insert({
      user_id: user.id,
      title: content.title,
      subject: content.subject,
      topic: content.title,
      nodes: graph.nodes,
      edges: graph.edges,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Não foi possível criar o mapa. Tente novamente." };

  revalidatePath("/app/mapas");
  redirect(`/app/mapas/${data.id}${usedFallback ? "?fallback=1" : ""}`);
}

export async function saveMindMapAction(mapId: string, graph: unknown): Promise<MindMapActionState> {
  const user = await requireUserSession();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(mapId)) {
    return { error: "Mapa inválido." };
  }

  const parsed = mindMapGraphSchema.safeParse(graph);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Confira os conceitos e conexões do mapa." };
  }

  const nodeIds = new Set(parsed.data.nodes.map(({ id }) => id));
  if (parsed.data.edges.some(({ source, target }) => source === target || !nodeIds.has(source) || !nodeIds.has(target))) {
    return { error: "Revise as conexões antes de salvar." };
  }
  if (parsed.data.nodes.length > 40) {
    return { error: "O mapa excede o limite de 40 conceitos." };
  }
  if (parsed.data.edges.length > 80) {
    return { error: "O mapa excede o limite de 80 conexões." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("mind_maps")
    .update({
      nodes: parsed.data.nodes,
      edges: parsed.data.edges,
      updated_at: new Date().toISOString(),
    })
    .eq("id", mapId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) return { error: "Não foi possível salvar. Confira se este mapa ainda existe." };

  revalidatePath("/app/mapas");
  revalidatePath(`/app/mapas/${mapId}`);
  return {};
}
