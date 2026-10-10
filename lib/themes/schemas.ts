import { z } from "zod";

import { SITE_THEME_IDS } from "@/lib/themes/catalog";

export const siteThemeSchema = z.object({
  id: z.enum(SITE_THEME_IDS),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(2).max(240),
  price: z.number().int().min(1).max(10000),
});

export const siteThemesSchema = z.array(siteThemeSchema);

export const siteThemeInventorySchema = z.array(
  z.object({
    theme_id: z.enum(SITE_THEME_IDS),
    acquired_at: z.iso.datetime(),
  }),
);

export const activeThemeIdSchema = z.enum(SITE_THEME_IDS).nullable();

export const themePurchaseResultSchema = z.object({
  balance: z.number().int().nonnegative(),
  theme_id: z.enum(SITE_THEME_IDS),
});

export const activeThemeResultSchema = z.object({
  active_theme_id: z.enum(SITE_THEME_IDS).nullable(),
});

export const activeThemeInputSchema = z.union([
  z.enum(SITE_THEME_IDS),
  z.literal("default"),
]);
