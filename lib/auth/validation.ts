import { z } from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(80, "O nome deve ter no máximo 80 caracteres.")
    .refine((value) => !/\s{2,}/.test(value), "O nome não pode ter espaços repetidos."),
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido."),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha."),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .max(72, "A senha deve ter no máximo 72 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export function getSignUpErrorMessage(code: string | null | undefined) {
  switch (code) {
    case "user_already_exists":
      return "Este e-mail já tem uma conta. Entre ou redefina sua senha.";
    case "email_address_invalid":
    case "validation_failed":
      return "Confira o e-mail informado e tente novamente.";
    case "weak_password":
      return "Escolha uma senha mais forte, com pelo menos 8 caracteres.";
    case "over_email_send_rate_limit":
      return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
    case "signup_disabled":
      return "O cadastro está temporariamente indisponível. Tente novamente mais tarde.";
    default:
      return "Não foi possível criar sua conta agora. Tente novamente.";
  }
}

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
