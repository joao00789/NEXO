"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const missionIdSchema = z.string().regex(/^[a-z0-9-]{2,80}$/);

export async function claimMissionAction(rawId: unknown) {
  await requireUserSession();
  const missionId = missionIdSchema.safeParse(rawId);
  if (!missionId.success) return { error: "Missão inválida." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("claim_question_mission", { p_mission_id: missionId.data });
  if (error) {
    const message = error.message.includes("ainda não concluída") ? "Ainda faltam questões para concluir esta missão." : error.message.includes("já resgatada") ? "Você já resgatou esta recompensa." : "Não foi possível resgatar a missão.";
    return { error: message };
  }
  const result = z.object({ xp: z.number().int(), coins: z.number().int() }).safeParse(data);
  if (!result.success) return { error: "A missão foi processada, mas não foi possível confirmar a recompensa." };
  revalidatePath("/app/missoes");
  revalidatePath("/app");
  return result.data;
}
