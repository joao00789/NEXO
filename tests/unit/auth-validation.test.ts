import assert from "node:assert/strict";
import test from "node:test";

import {
  getSignUpErrorMessage,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/auth/validation";

test("signUpSchema rejeita nome muito curto", () => {
  const result = signUpSchema.safeParse({
    name: "A",
    email: "aluno@exemplo.com",
    password: "senha123",
  });

  assert.equal(result.success, false);
  assert.match(result.error.issues[0].message, /pelo menos 2/i);
});

test("signUpSchema rejeita nome com espaços repetidos", () => {
  const result = signUpSchema.safeParse({
    name: "Ana  Souza",
    email: "aluno@exemplo.com",
    password: "senha123",
  });

  assert.equal(result.success, false);
});

test("signUpSchema aceita nome e credenciais válidas", () => {
  const result = signUpSchema.safeParse({
    name: "Ana Souza",
    email: "aluno@exemplo.com",
    password: "senha123",
  });

  assert.equal(result.success, true);
});

test("signUp error messages never expose generic object responses", () => {
  assert.match(getSignUpErrorMessage("unknown_error"), /Não foi possível criar sua conta/);
  assert.match(getSignUpErrorMessage("user_already_exists"), /já tem uma conta/);
});

test("signInSchema rejeita senha vazia", () => {
  const result = signInSchema.safeParse({
    email: "aluno@exemplo.com",
    password: "",
  });

  assert.equal(result.success, false);
});

test("resetPasswordSchema rejeita e-mail inválido", () => {
  const result = resetPasswordSchema.safeParse({ email: "email-invalido" });

  assert.equal(result.success, false);
});
