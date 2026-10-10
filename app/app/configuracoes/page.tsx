import type { Metadata } from "next";
import { KeyRound, ShieldCheck, UserRound, UserRoundX } from "lucide-react";

import { DeleteAccountForm } from "@/components/auth/delete-account-form";
import { PasswordSettingsForm } from "@/components/auth/password-settings-form";
import { ProfileSettingsForm } from "@/components/auth/profile-settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteAccountAction,
  updatePasswordAction,
  updateProfileNameAction,
} from "@/lib/auth/actions";
import { requireUserSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Configurações" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ "password-reset"?: string }>;
}) {
  const search = await searchParams;
  const user = await requireUserSession();
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie seus dados de perfil e segurança da conta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound aria-hidden="true" className="size-4" /> Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <ProfileSettingsForm
            action={updateProfileNameAction}
            name={profile?.full_name ?? user.user_metadata.full_name ?? "Estudante"}
          />
          <div className="border-border grid gap-4 border-t pt-4 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs">E-mail da conta</p>
              <p className="mt-1 text-sm">{user.email ?? "Não informado"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Conta criada</p>
              <p className="mt-1 text-sm">
                {profile?.created_at
                  ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(profile.created_at))
                  : "Informação indisponível"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck aria-hidden="true" className="size-4" /> Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {search["password-reset"] === "1" ? (
            <p role="status" className="text-sm text-emerald-400">
              Link confirmado. Defina sua nova senha abaixo.
            </p>
          ) : null}
          <div className="flex items-start gap-3">
            <KeyRound aria-hidden="true" className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Redefinição de senha</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Crie uma nova senha para sua conta. Também é possível solicitar
                um link de recuperação pelo e-mail.
              </p>
            </div>
          </div>
          <PasswordSettingsForm action={updatePasswordAction} />
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <UserRoundX aria-hidden="true" className="size-4" /> Excluir conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteAccountForm action={deleteAccountAction} />
        </CardContent>
      </Card>
    </div>
  );
}
