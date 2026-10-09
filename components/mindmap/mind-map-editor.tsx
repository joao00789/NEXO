"use client";

import dynamic from "next/dynamic";

import type { MindMapGraph } from "@/lib/mindmaps/templates";

const MindMapCanvas = dynamic(() => import("@/components/mindmap/mind-map-canvas"), {
  ssr: false,
  loading: () => (
    <div className="bg-surface border-border flex min-h-130 items-center justify-center rounded-xl border text-sm text-muted-foreground">
      Carregando editor do mapa...
    </div>
  ),
});

export function MindMapEditor({
  id,
  title,
  initialGraph,
}: {
  id: string;
  title: string;
  initialGraph: MindMapGraph;
}) {
  return <MindMapCanvas id={id} title={title} initialGraph={initialGraph} />;
}
