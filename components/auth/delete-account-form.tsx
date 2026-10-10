"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionState } from "@/lib/auth/actions";

export function DeleteAccountForm({
  action,
}: {
  action: (state: unknown, formData: FormData) => Promise<AuthActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Essa ação é permanente e remove seu perfil e seus dados associados.
        Para confirmar, digite <strong className="text-foreground">EXCLUIR</strong>.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="delete-account-confirmation">Confirmação</Label>
        <Input
          id="delete-account-confirmation"
          name="confirmation"
          autoComplete="off"
          pattern="EXCLUIR"
          required
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="destructive"
        disabled={pending}
        className="w-fit"
      >
        <Trash2 aria-hidden="true" />
        {pending ? "Excluindo conta..." : "Excluir minha conta"}
      </Button>
    </form>
  );
}
