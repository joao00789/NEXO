"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserSession } from "@/lib/auth/session";
import {
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/auth/validation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const profileNameSchema = z
  .string()
  .trim()
  .min(2, "Use ao menos 2 caracteres no nome.")
  .max(80, "O nome pode ter no máximo 80 caracteres.");

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function signUpAction(_: unknown, formData: FormData): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.name } },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Não foi possível criar sua conta." };
  }

  const admin = getSupabaseAdminClient();
  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        id: data.user.id,
        full_name: parsed.data.name,
        display_name: parsed.data.name,
        avatar_url: null,
      },
      { onConflict: "id" },
    )
    .select("id")
    .single();

  if (profileError) {
    return { error: "Sua conta foi criada, mas não foi possível salvar seu perfil." };
  }

  redirect("/login?registered=1");
}

export async function signInAction(_: unknown, formData: FormData): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  redirect("/app");
}

export async function resetPasswordAction(_: unknown, formData: FormData): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/app/configuracoes?password-reset=1`,
  });

  if (error) {
    return { error: "Não foi possível enviar o link de recuperação." };
  }

  return { success: "Confira seu e-mail para continuar a recuperação de senha." };
}

export async function updateProfileNameAction(
  _: unknown,
  formData: FormData,
): Promise<AuthActionState> {
  const user = await requireUserSession();
  const parsed = profileNameSchema.safeParse(formData.get("name"));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nome inválido." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data, display_name: parsed.data })
    .eq("id", user.id);

  if (error) {
    return { error: "Não foi possível atualizar seu nome." };
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: { full_name: parsed.data },
  });

  if (metadataError) {
    return { error: "O nome foi atualizado no sistema, mas não em todos os lugares. Tente novamente em instantes." };
  }

  revalidatePath("/app/configuracoes");
  revalidatePath("/app");

  return { success: "Nome atualizado com sucesso." };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
