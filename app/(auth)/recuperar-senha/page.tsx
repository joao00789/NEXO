import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { resetPasswordAction } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function RecuperarSenhaPage() {
  return (
    <AuthForm
      action={resetPasswordAction}
      title="Recuperar senha"
      description="Informe seu e-mail e enviaremos um link de recuperação."
      submitLabel="Enviar link"
      emailLabel="E-mail"
      passwordLabel="Senha"
      footer={
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-brand font-medium hover:underline">
            Voltar para o login
          </Link>
        </p>
      }
    />
  );
}
