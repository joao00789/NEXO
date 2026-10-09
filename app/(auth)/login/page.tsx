import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <AuthForm
      action={signInAction}
      title="Entrar"
      description="Acesse sua conta para continuar estudando."
      submitLabel="Entrar"
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
