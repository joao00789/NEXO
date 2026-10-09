"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserSession } from "@/lib/auth/session";
import { essayCorrectionSchema } from "@/lib/essays/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const saveEssaySchema = z.object({
  id: z.uuid().optional(),
  themeId: z.string().max(80).optional(),
  themeTitle: z.string().trim().min(10).max(240),
  body: z.string().max(12000),
});

export async function saveEssayAction(input: unknown) {
  const user = await requireUserSession();
  const parsed = saveEssaySchema.safeParse(input);
  if (!parsed.success) return { error: "Confira o tema e o limite de 12 mil caracteres." };
  const supabase = await createSupabaseServerClient();
  const values = {
    user_id: user.id,
    theme_id: parsed.data.themeId || null,
    theme_title: parsed.data.themeTitle,
    body: parsed.data.body,
    correction: null,
    submitted_at: null,
    updated_at: new Date().toISOString(),
  };
  const query = parsed.data.id
    ? supabase.from("essays").update(values).eq("id", parsed.data.id).eq("user_id", user.id).select("id").maybeSingle()
    : supabase.from("essays").insert(values).select("id").single();
  const { data, error } = await query;
  if (error || !data) return { error: "Não foi possível salvar o rascunho." };
  revalidatePath("/app/redacao");
  return { id: data.id };
}

export async function saveEssayCorrectionAction(essayId: string, correction: unknown) {
  const user = await requireUserSession();
  const parsedId = z.uuid().safeParse(essayId);
  const parsedCorrection = essayCorrectionSchema.safeParse(correction);
  if (!parsedId.success || !parsedCorrection.success) return { error: "A correção recebida é inválida." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("essays").update({ correction: parsedCorrection.data, submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", parsedId.data).eq("user_id", user.id);
  if (error) return { error: "A correção ficou pronta, mas não foi possível salvá-la no histórico." };
  revalidatePath("/app/redacao");
  return { success: true };
}
