import { z } from "zod";

export const cosmeticCategorySchema = z.enum([
  "headwear",
  "outfit",
  "accessory",
  "effect",
  "background",
  "frame",
]);

export const cosmeticIconSchema = z.enum([
  "graduation-cap",
  "shirt",
  "glasses",
  "headphones",
  "sparkles",
  "library",
  "award",
  "crown",
  "backpack",
]);

export const cosmeticItemSchema = z.object({
  id: z.string().min(2).max(80),
  name: z.string().min(2).max(80),
  description: z.string().min(2).max(240),
  category: cosmeticCategorySchema,
  rarity: z.enum(["common", "uncommon", "rare", "epic"]),
  icon: cosmeticIconSchema,
  accent: z.enum(["blue", "cyan", "violet", "teal", "amber", "rose"]),
  price: z.number().int().min(1).max(10000),
});

export const cosmeticItemsSchema = z.array(cosmeticItemSchema);

export const inventoryEntrySchema = z.object({
  item_id: z.string().min(2).max(80),
  is_equipped: z.boolean(),
  acquired_at: z.iso.datetime(),
});

export const inventorySchema = z.array(inventoryEntrySchema);

export const purchaseResultSchema = z.object({
  balance: z.number().int().nonnegative(),
  item_id: z.string(),
});

export const equipResultSchema = z.object({
  item_id: z.string(),
  is_equipped: z.boolean(),
  category: cosmeticCategorySchema,
});

export type CosmeticItem = z.infer<typeof cosmeticItemSchema>;
export type InventoryEntry = z.infer<typeof inventoryEntrySchema>;
