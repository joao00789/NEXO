"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  activeThemeInputSchema,
  activeThemeResultSchema,
  themePurchaseResultSchema,
} from "@/lib/themes/schemas";
import { SITE_THEME_IDS, type SiteThemeId } from "@/lib/themes/catalog";

export type ThemeActionResult = {
  error?: string;
  balance?: number;
  activeThemeId?: SiteThemeId | null;
};

function actionError(message: string) {
  if (message.includes("Saldo insuficiente")) return "Você ainda não tem NEXO Coins suficientes.";
  if (message.includes("já possui")) return "Você já tem este tema.";
  if (message.includes("indisponível")) return "Este tema não está mais disponível.";
  if (message.includes("precisa possuir")) return "Compre este tema antes de ativá-lo.";
  return "Não foi possível concluir a ação. Tente novamente.";
}

export async function purchaseSiteThemeAction(rawThemeId: unknown): Promise<ThemeActionResult> {
  await requireUserSession();
  const parsedId = z.enum(SITE_THEME_IDS).safeParse(rawThemeId);
  if (!parsedId.success) return { error: "Tema inválido." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("purchase_site_theme", {
    p_theme_id: parsedId.data,
  });
  if (error) {
    console.error("Site theme purchase failed.", { code: error.code, message: error.message });
    return { error: actionError(error.message) };
  }

  const result = themePurchaseResultSchema.safeParse(data);
  if (!result.success) {
    return { error: "A compra foi processada, mas não foi possível atualizar seu saldo." };
  }

  revalidatePath("/app");
  revalidatePath("/app/loja");
  return { balance: result.data.balance };
}

export async function setActiveSiteThemeAction(
  rawThemeId: unknown,
): Promise<ThemeActionResult> {
  await requireUserSession();
  const parsedTheme = activeThemeInputSchema.safeParse(rawThemeId);
  if (!parsedTheme.success) return { error: "Tema inválido." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("set_active_site_theme", {
    p_theme_id: parsedTheme.data === "default" ? null : parsedTheme.data,
  });
  if (error) {
    console.error("Setting active site theme failed.", {
      code: error.code,
      message: error.message,
    });
    return { error: actionError(error.message) };
  }

  const result = activeThemeResultSchema.safeParse(data);
  if (!result.success) {
    return { error: "Não foi possível confirmar o tema ativo. Atualize a página e tente novamente." };
  }

  revalidatePath("/app");
  revalidatePath("/app/loja");
  return { activeThemeId: result.data.active_theme_id };
}
