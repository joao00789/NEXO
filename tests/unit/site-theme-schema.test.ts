import assert from "node:assert/strict";
import test from "node:test";

import {
  activeThemeInputSchema,
  siteThemesSchema,
} from "@/lib/themes/schemas";

test("validates the available site theme catalog", () => {
  const parsed = siteThemesSchema.safeParse([
    {
      id: "aurora",
      name: "Aurora",
      description: "Verde profundo e brilho suave.",
      price: 180,
    },
  ]);

  assert.equal(parsed.success, true);
});

test("rejects unknown themes and permits restoring the default theme", () => {
  assert.equal(activeThemeInputSchema.safeParse("default").success, true);
  assert.equal(activeThemeInputSchema.safeParse("nebula").success, true);
  assert.equal(activeThemeInputSchema.safeParse("unknown").success, false);
});
