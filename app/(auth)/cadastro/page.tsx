import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { signUpAction } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return (
    <AuthForm
      action={signUpAction}
      title="Criar conta"
      description="Comece grátis com um diagnóstico das áreas do ENEM."
      submitLabel="Criar conta"
      nameField
      footer={
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Já tem conta?{" "}
          <Link href="/login" className="text-brand font-medium hover:underline">
            Entrar
          </Link>
        </p>
      }
    />
  );
}
