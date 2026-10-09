"use client";

import { useActionState } from "react";
import { Map, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StudyContent } from "@/lib/content/catalog";
import { createMindMapAction } from "@/lib/mindmaps/actions";

const depths = [
  { value: "essencial", label: "Essencial" },
  { value: "intermediario", label: "Intermediário" },
  { value: "aprofundado", label: "Aprofundado" },
] as const;

export function MindMapCreateForm({ contents }: { contents: StudyContent[] }) {
  const [state, formAction, pending] = useActionState(createMindMapAction, {});

  return (
    <form action={formAction} className="bg-surface border-border flex flex-col gap-3 rounded-xl border p-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
      <label className="flex flex-1 flex-col gap-2 text-sm font-medium" htmlFor="map-content">
        <span className="flex items-center gap-2"><Map aria-hidden="true" className="size-4" /> Criar mapa a partir de um conteúdo</span>
        <select
          id="map-content"
          name="contentSlug"
          required
          defaultValue=""
          className="border-border bg-background focus-visible:ring-ring h-10 rounded-md border px-3 outline-none focus-visible:ring-2"
        >
          <option value="" disabled>Escolha um tema</option>
          {contents.map((content) => (
            <option key={content.slug} value={content.slug}>{content.subject} · {content.title}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="map-depth">
        <span>Profundidade</span>
        <select
          id="map-depth"
          name="depth"
          defaultValue="essencial"
          className="border-border bg-background focus-visible:ring-ring h-10 rounded-md border px-3 outline-none focus-visible:ring-2"
        >
          {depths.map((depth) => (
            <option key={depth.value} value={depth.value}>{depth.label}</option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:self-end">
        <label className="flex items-center gap-2 text-xs text-muted-foreground" htmlFor="use-ai">
          <input id="use-ai" name="useAi" type="checkbox" defaultChecked className="size-3.5 rounded border-border" />
          Usar IA (com fallback determinístico)
        </label>
        <Button type="submit" disabled={pending || contents.length === 0}>
          <Plus aria-hidden="true" /> {pending ? "Criando..." : "Criar mapa"}
        </Button>
      </div>
      {state.error ? <p role="alert" className="text-destructive text-sm sm:col-span-3">{state.error}</p> : null}
    </form>
  );
}
