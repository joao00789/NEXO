"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { regenerateMindMap } from "@/lib/mindmaps/regenerate";
import { mindMapDepthSchema } from "@/lib/mindmaps/schemas";

export type RegenerateMindMapState = {
  error?: string;
  success?: string;
};

const inputSchema = z.object({
  mapId: z.uuid(),
  depth: mindMapDepthSchema,
  useAi: z.boolean(),
});

export async function regenerateMindMapAction(
  _previousState: RegenerateMindMapState,
  formData: FormData,
): Promise<RegenerateMindMapState> {
  const parsed = inputSchema.safeParse({
    mapId: formData.get("mapId"),
    depth: formData.get("depth"),
    useAi: formData.get("useAi") === "on",
  });
  if (!parsed.success) return { error: "Confira a profundidade e tente novamente." };

  try {
    await regenerateMindMap(parsed.data.mapId, parsed.data.depth, parsed.data.useAi);
  } catch (error) {
    console.error("Mind map regeneration action failed.", error);
    return {
      error: error instanceof Error
        ? error.message
        : "Não foi possível regenerar o mapa. Seus conceitos atuais foram preservados.",
    };
  }

  revalidatePath("/app/mapas");
  revalidatePath(`/app/mapas/${parsed.data.mapId}`);
  return { success: "Mapa regenerado. Você pode continuar editando e salvar suas alterações." };
}
