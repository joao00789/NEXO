"use server";

import { z } from "zod";

import { requireUserSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ANIMAL_IDS } from "@/lib/animals/catalog";

const animalSchema = z.enum(ANIMAL_IDS);
const battleIdSchema = z.uuid();
const battleStateSchema = z.object({
  id: z.uuid(), status: z.enum(["waiting", "active", "finished", "cancelled"]),
  question_id: z.uuid().nullable(), current_player_id: z.uuid().nullable(), winner_id: z.uuid().nullable(),
  players: z.array(z.object({ user_id: z.uuid(), animal_id: animalSchema, name: z.string(), health: z.number().int() })).max(2),
  question: z.object({ statement: z.string(), options: z.array(z.object({ id: z.uuid(), label: z.enum(["A", "B", "C", "D", "E"]), content: z.string() })) }).nullable(),
});

export type BattleState = z.infer<typeof battleStateSchema>;

export async function findBattleAction(animalId: unknown) {
  await requireUserSession();
  const parsed = animalSchema.safeParse(animalId);
  if (!parsed.success) return { error: "Escolha um animal válido." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("find_or_create_animal_battle", { p_animal_id: parsed.data });
  if (error) return { error: error.message.includes("questões aprovadas") ? "Ainda não há questões aprovadas para abrir uma batalha." : "Não foi possível entrar na fila de batalha." };
  const result = z.object({ battle_id: z.uuid(), status: z.enum(["waiting", "active", "existing"]) }).safeParse(data);
  return result.success ? { battleId: result.data.battle_id, status: result.data.status } : { error: "Resposta inválida da fila de batalha." };
}

export async function getBattleAction(id: unknown) {
  await requireUserSession();
  const parsed = battleIdSchema.safeParse(id);
  if (!parsed.success) return { error: "Batalha inválida." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_animal_battle", { p_battle_id: parsed.data });
  if (error) return { error: "Não foi possível atualizar a batalha." };
  const battle = battleStateSchema.safeParse(data);
  return battle.success ? { battle: battle.data } : { error: "Não foi possível interpretar o estado da batalha." };
}

export async function answerBattleAction(battleId: unknown, optionId: unknown) {
  await requireUserSession();
  const input = z.object({ battleId: z.uuid(), optionId: z.uuid() }).safeParse({ battleId, optionId });
  if (!input.success) return { error: "Resposta inválida." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("answer_animal_battle", { p_battle_id: input.data.battleId, p_option_id: input.data.optionId });
  if (error) return { error: error.message.includes("Aguarde sua vez") ? "Agora é a vez do seu adversário." : "Não foi possível enviar a resposta." };
  const result = z.object({ correct: z.boolean(), damage: z.number(), opponent_health: z.number(), status: z.enum(["active", "finished"]), winner_id: z.uuid().nullable() }).safeParse(data);
  return result.success ? { result: result.data } : { error: "Não foi possível confirmar o resultado." };
}
