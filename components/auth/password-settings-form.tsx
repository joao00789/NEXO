"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionState } from "@/lib/auth/actions";

export function PasswordSettingsForm({
  action,
}: {
  action: (state: unknown, formData: FormData) => Promise<AuthActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-password">Nova senha</Label>
          <Input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-password">Confirmar nova senha</Label>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
          />
        </div>
      </div>
      <p className="text-muted-foreground text-xs">Use de 8 a 72 caracteres.</p>
      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-emerald-400 text-sm">
          {state.success}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Atualizando..." : "Atualizar senha"}
        </Button>
        <Link
          href="/recuperar-senha"
          className="text-primary text-sm font-medium hover:underline"
        >
          Enviar link de recuperação por e-mail
        </Link>
      </div>
    </form>
  );
}
