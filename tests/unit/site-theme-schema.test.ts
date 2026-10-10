import assert from "node:assert/strict";
import test from "node:test";

import {
  activeThemeInputSchema,
  siteThemeInventorySchema,
  siteThemesSchema,
} from "@/lib/themes/schemas";
import { SITE_THEME_IDS } from "@/lib/themes/catalog";

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
  assert.equal(SITE_THEME_IDS.length, 8);
});

test("rejects unknown themes and permits restoring the default theme", () => {
  assert.equal(activeThemeInputSchema.safeParse("default").success, true);
  assert.equal(activeThemeInputSchema.safeParse("ocean").success, true);
  assert.equal(activeThemeInputSchema.safeParse("unknown").success, false);
});

test("accepts Supabase inventory timestamps with a UTC offset", () => {
  const parsed = siteThemeInventorySchema.safeParse([
    {
      theme_id: "aurora",
      acquired_at: "2026-10-10T17:54:40.499783+00:00",
    },
  ]);

  assert.equal(parsed.success, true);
});
