"use client";

import { useActionState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  RegenerateMindMapState,
  regenerateMindMapAction,
} from "@/lib/mindmaps/regenerate-action";

export function MindMapRegenerateForm({ mapId }: { mapId: string }) {
  const [state, formAction, pending] = useActionState<RegenerateMindMapState, FormData>(
    regenerateMindMapAction,
    {},
  );

  return (
    <div className="space-y-2">
      <form action={formAction} className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-2">
        <input type="hidden" name="mapId" value={mapId} />
        <label className="sr-only" htmlFor="map-depth">Profundidade do mapa</label>
        <select
          id="map-depth"
          name="depth"
          defaultValue="essencial"
          className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
        >
          <option value="essencial">Essencial</option>
          <option value="intermediario">Intermediário</option>
          <option value="aprofundado">Aprofundado</option>
        </select>
        <label className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
          <input type="checkbox" name="useAi" defaultChecked className="size-3.5 rounded border-border" />
          Usar IA
        </label>
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? <Sparkles aria-hidden className="animate-pulse" /> : <RefreshCw aria-hidden />}
          {pending ? "Gerando…" : "Regenerar mapa"}
        </Button>
      </form>
      {state.error ? (
        <p role="alert" className="text-sm text-red-300">{state.error}</p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm text-emerald-300">{state.success}</p>
      ) : null}
    </div>
  );
}
