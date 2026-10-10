import assert from "node:assert/strict";
import test from "node:test";

import {
  generatedQuestionDraftSchema,
  generatedQuestionFiltersSchema,
} from "@/lib/questions/generated-schema";

const validQuestion = {
  statement: "Uma grandeza cresce 20% a partir de um valor inicial de 100. Qual é o novo valor?",
  options: [
    { label: "A", content: "80" },
    { label: "B", content: "100" },
    { label: "C", content: "120" },
    { label: "D", content: "200" },
    { label: "E", content: "20" },
  ],
  correct_label: "C",
  solution_steps: ["Converta 20% para 0,2.", "Calcule o acréscimo e some ao valor inicial."],
  option_explanations: [
    { label: "A", explanation: "Esse resultado representa uma redução, não um aumento." },
    { label: "B", explanation: "O valor não mudou; o acréscimo não foi aplicado." },
    { label: "C", explanation: "O acréscimo é 20, então o total é 120." },
    { label: "D", explanation: "O valor foi duplicado, o que corresponde a um aumento de 100%." },
    { label: "E", explanation: "Esse é apenas o valor do acréscimo, não o total." },
  ],
};

test("generated question requires five unique alternatives with explanations", () => {
  assert.equal(generatedQuestionDraftSchema.safeParse(validQuestion).success, true);
  assert.equal(
    generatedQuestionDraftSchema.safeParse({
      ...validQuestion,
      options: validQuestion.options.map((option, index) => ({
        ...option,
        label: index === 4 ? "D" : option.label,
      })),
    }).success,
    false,
  );
});

test("generated question filters reject unsupported areas and oversized topics", () => {
  assert.equal(
    generatedQuestionFiltersSchema.safeParse({
      area: "matematica",
      difficulty: "enem",
      subject: "Matemática",
      topic: "Porcentagem",
    }).success,
    true,
  );
  assert.equal(
    generatedQuestionFiltersSchema.safeParse({
      area: "astronomia",
      difficulty: "enem",
      subject: "Matemática",
      topic: "Porcentagem",
    }).success,
    false,
  );
  assert.equal(
    generatedQuestionFiltersSchema.safeParse({
      area: "matematica",
      difficulty: "enem",
      subject: "Matemática",
      topic: "x".repeat(161),
    }).success,
    false,
  );
});
