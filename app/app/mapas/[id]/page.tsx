import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

import { MindMapEditor } from "@/components/mindmap/mind-map-editor";
import { MindMapRegenerateForm } from "@/components/mindmap/mind-map-regenerate-form";
import { buttonVariants } from "@/components/ui/button";
import { requireUserSession } from "@/lib/auth/session";
import { mindMapGraphSchema } from "@/lib/mindmaps/schemas";
import type { MindMapGraph, MindMapNodeData } from "@/lib/mindmaps/templates";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Editor de mapa mental" };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fallback?: string }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  if (!z.uuid().safeParse(id).success) notFound();

  const user = await requireUserSession();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("mind_maps")
    .select("id, title, subject, topic, nodes, edges")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="border-destructive/40 bg-destructive/5 rounded-lg border p-4 text-sm" role="alert">
        Não foi possível carregar este mapa. Volte à lista e tente novamente.
      </div>
    );
  }
  if (!data) notFound();

  const sourceGraph = {
    nodes: (data?.nodes ?? []) as MindMapGraph["nodes"],
    edges: (data?.edges ?? []) as MindMapGraph["edges"],
  };
  const graphResult = mindMapGraphSchema.safeParse({ nodes: sourceGraph.nodes, edges: sourceGraph.edges });
  const graph: MindMapGraph | null = graphResult.success
    ? {
        nodes: graphResult.data.nodes.map((node) => ({
          id: node.id,
          type: node.type ?? "default",
          position: node.position,
          data: node.data as MindMapNodeData,
        })),
        edges: graphResult.data.edges,
      }
    : null;

  return (
    <div className="flex flex-col gap-5">
      <Link href="/app/mapas" className={buttonVariants({ variant: "ghost", className: "-ml-2 w-fit" })}>
        <ArrowLeft aria-hidden="true" /> Voltar aos mapas
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm">
            {data?.subject} · {data?.topic}
          </p>
          <h1 className="font-display text-2xl font-bold">{data?.title ?? "Mapa mental"}</h1>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <MindMapRegenerateForm mapId={id} />
          <Link href={`/app/conteudos?highlight=${encodeURIComponent(data.title)}`} className={buttonVariants({ size: "sm", variant: "ghost" })}>
            Ver conteúdo
          </Link>
        </div>
      </header>

      {search.fallback === "1" ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-100" role="status">
          A IA não respondeu. Criamos um mapa-base com o conteúdo do NEXO; revise os conceitos antes de usar.
        </div>
      ) : null}
      {!graph ? (
        <div className="border-destructive/40 bg-destructive/5 rounded-lg border p-4 text-sm" role="alert">
          Não foi possível abrir este mapa. Recarregue a página ou volte à sua lista de mapas.
        </div>
      ) : (
        <MindMapEditor id={id} title={data.title} initialGraph={graph} />
      )}
    </div>
  );
}