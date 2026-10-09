"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserSession } from "@/lib/auth/session";
import { equipResultSchema, purchaseResultSchema } from "@/lib/cosmetics/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ANIMAL_IDS } from "@/lib/animals/catalog";

const itemIdSchema = z.string().trim().regex(/^[a-z0-9-]{2,80}$/, "Item inválido.");

export type CosmeticActionResult = {
  error?: string;
  balance?: number;
  equipped?: boolean;
};

function purchaseError(message: string) {
  if (message.includes("Saldo insuficiente")) return "Você ainda não tem NEXO Coins suficientes.";
  if (message.includes("já possui")) return "Este item já está no seu inventário.";
  if (message.includes("indisponível")) return "Este item não está mais disponível.";
  return "Não foi possível concluir a compra. Tente novamente.";
}

export async function purchaseCosmeticAction(rawItemId: unknown): Promise<CosmeticActionResult> {
  await requireUserSession();
  const parsedId = itemIdSchema.safeParse(rawItemId);
  if (!parsedId.success) return { error: "Item inválido." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("purchase_cosmetic_item", { p_item_id: parsedId.data });
  if (error) return { error: purchaseError(error.message) };

  const result = purchaseResultSchema.safeParse(data);
  if (!result.success) return { error: "A compra foi processada, mas não foi possível atualizar seu saldo." };

  revalidatePath("/app/loja");
  revalidatePath("/app/avatar");
  revalidatePath("/app");
  return { balance: result.data.balance };
}

export async function toggleCosmeticEquipAction(rawItemId: unknown): Promise<CosmeticActionResult> {
  await requireUserSession();
  const parsedId = itemIdSchema.safeParse(rawItemId);
  if (!parsedId.success) return { error: "Item inválido." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("toggle_cosmetic_equip", { p_item_id: parsedId.data });
  if (error) return { error: "Não foi possível alterar o item equipado. Atualize a página e tente novamente." };

  const result = equipResultSchema.safeParse(data);
  if (!result.success) return { error: "Não foi possível confirmar o equipamento do item." };

  revalidatePath("/app/avatar");
  return { equipped: result.data.is_equipped };
}

export async function setAvatarAnimalAction(rawAnimalId: unknown): Promise<{ error?: string; animalId?: string }> {
  await requireUserSession();
  const animalId = z.enum(ANIMAL_IDS).safeParse(rawAnimalId);
  if (!animalId.success) return { error: "Animal inválido." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("set_avatar_animal", { p_animal_id: animalId.data });
  if (error || data !== animalId.data) return { error: "Não foi possível trocar seu animal agora." };
  revalidatePath("/app/avatar");
  revalidatePath("/app/batalhas");
  return { animalId: animalId.data };
}
