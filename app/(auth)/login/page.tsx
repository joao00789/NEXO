import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "Entrar" };

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const search = await searchParams;

  return (
    <AuthForm
      action={signInAction}
      title="Entrar"
      description="Acesse sua conta para continuar estudando."
      submitLabel="Entrar"
      initialError={search.error === "google" ? "Não foi possível entrar com Google. Verifique a configuração do provedor e tente novamente." : undefined}
      footer={
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-brand font-medium hover:underline">
            Criar conta
          </Link>
        </p>
      }
    />
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div
          aria-label="Carregando formulário de acesso"
          aria-busy="true"
          className="bg-card border-border min-h-[28rem] animate-pulse rounded-2xl border"
        />
      }
    >
      <LoginForm searchParams={searchParams} />
    </Suspense>
  );
}
