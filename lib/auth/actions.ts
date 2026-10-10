"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserSession } from "@/lib/auth/session";
import {
  resetPasswordSchema,
  getSignUpErrorMessage,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/auth/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

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

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { full_name: parsed.data.name } },
    });

    if (error) {
      console.error("Supabase signup rejected.", {
        code: error.code ?? "unknown",
        status: error.status ?? null,
      });
      return { error: getSignUpErrorMessage(error.code) };
    }

    if (!data.user) {
      return { error: "Não foi possível criar sua conta. Tente novamente." };
    }
  } catch (error) {
    console.error("Signup action failed.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return { error: "Não foi possível criar sua conta agora. Tente novamente." };
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
    redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/app/configuracoes?password-reset=1")}`,
  });

  if (error) {
    console.error("Password recovery email could not be sent.", {
      code: error.code ?? "unknown",
    });
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
    .update({ full_name: parsed.data })
    .eq("id", user.id);

  if (error) {
    console.error("Profile name update failed.", {
      code: error.code ?? "unknown",
      message: error.message,
    });
    return { error: "Não foi possível atualizar seu nome." };
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: { full_name: parsed.data },
  });

  if (metadataError) {
    console.error("Profile name metadata update failed.", {
      code: metadataError.code ?? "unknown",
    });
  }

  revalidatePath("/app/configuracoes");
  revalidatePath("/app");

  return {
    success: metadataError
      ? "Nome atualizado. Alguns dados da sessão podem levar alguns instantes para sincronizar."
      : "Nome atualizado com sucesso.",
  };
}

export async function updatePasswordAction(
  _: unknown,
  formData: FormData,
): Promise<AuthActionState> {
  await requireUserSession();
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Confira os dados da senha." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    console.error("Password update failed.", {
      code: error.code ?? "unknown",
      status: error.status ?? null,
    });
    return { error: "Não foi possível atualizar sua senha. Solicite um novo link de recuperação e tente novamente." };
  }

  revalidatePath("/app/configuracoes");
  return { success: "Senha atualizada com sucesso." };
}

export async function deleteAccountAction(
  _: unknown,
  formData: FormData,
): Promise<AuthActionState> {
  const user = await requireUserSession();
  if (formData.get("confirmation") !== "EXCLUIR") {
    return { error: "Digite EXCLUIR para confirmar a remoção da conta." };
  }

  let deletionError: { code?: string; message: string } | null = null;
  try {
    const admin = getSupabaseAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    deletionError = error;
  } catch (error) {
    console.error("Account deletion could not be completed.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return { error: "Não foi possível excluir a conta agora. Tente novamente mais tarde." };
  }

  if (deletionError) {
    console.error("Supabase account deletion failed.", {
      code: deletionError.code ?? "unknown",
      message: deletionError.message,
    });
    return { error: "Não foi possível excluir a conta agora. Tente novamente mais tarde." };
  }

  const supabase = await createSupabaseServerClient();
  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    console.error("Deleted account session could not be cleared.", {
      code: signOutError.code ?? "unknown",
    });
  }

  redirect("/login?account-deleted=1");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
