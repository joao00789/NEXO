"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionState } from "@/lib/auth/actions";

export function AuthForm({
  action,
  title,
  description,
  submitLabel,
  emailLabel = "E-mail",
  passwordLabel = "Senha",
  nameField = false,
  nameLabel = "Nome",
  footer,
}: {
  action: (state: unknown, formData: FormData) => Promise<AuthActionState>;
  title: string;
  description: string;
  submitLabel: string;
  emailLabel?: string;
  passwordLabel?: string;
  nameField?: boolean;
  nameLabel?: string;
  footer: React.ReactNode;
}) {
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <div className="bg-card border-border rounded-2xl border p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {nameField ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{nameLabel}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Seu nome"
              required
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{emailLabel}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{passwordLabel}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={nameField ? "new-password" : "current-password"}
            placeholder={nameField ? "Mínimo de 8 caracteres" : "••••••••"}
            minLength={nameField ? 8 : undefined}
            required
          />
        </div>

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

        <Button type="submit" className="mt-2 w-full" disabled={isPending}>
          {isPending ? "Aguarde..." : submitLabel}
        </Button>
      </form>

      {footer}
    </div>
  );
}
