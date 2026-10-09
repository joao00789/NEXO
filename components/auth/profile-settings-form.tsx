"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionState } from "@/lib/auth/actions";

export function ProfileSettingsForm({
  action,
  name,
}: {
  action: (state: unknown, formData: FormData) => Promise<AuthActionState>;
  name: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-name">Nome</Label>
        <Input
          id="profile-name"
          name="name"
          defaultValue={name}
          autoComplete="name"
          minLength={2}
          maxLength={80}
          required
        />
        <p className="text-muted-foreground text-xs">De 2 a 80 caracteres.</p>
      </div>
      {state.error ? <p role="alert" className="text-destructive text-sm">{state.error}</p> : null}
      {state.success ? <p role="status" className="text-emerald-400 text-sm">{state.success}</p> : null}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Salvando..." : "Salvar nome"}
      </Button>
    </form>
  );
}
