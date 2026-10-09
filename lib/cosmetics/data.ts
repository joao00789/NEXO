import { requireUserSession } from "@/lib/auth/session";
import { cosmeticItemsSchema, inventorySchema } from "@/lib/cosmetics/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCosmeticsData() {
  const user = await requireUserSession();
  const supabase = await createSupabaseServerClient();
  const [profileResult, catalogResult, inventoryResult] = await Promise.all([
    supabase.from("profiles").select("coins").eq("id", user.id).maybeSingle(),
    supabase
      .from("cosmetic_items")
      .select("id, name, description, category, rarity, icon, accent, price")
      .eq("is_active", true)
      .order("price", { ascending: true }),
    supabase
      .from("user_inventory")
      .select("item_id, is_equipped, acquired_at")
      .eq("user_id", user.id),
  ]);

  const parsedCatalog = cosmeticItemsSchema.safeParse(catalogResult.data ?? []);
  const parsedInventory = inventorySchema.safeParse(inventoryResult.data ?? []);
  const failed = Boolean(
    profileResult.error || catalogResult.error || inventoryResult.error ||
    !profileResult.data || !parsedCatalog.success || !parsedInventory.success,
  );

  return {
    coins: profileResult.data?.coins ?? 0,
    catalog: parsedCatalog.success ? parsedCatalog.data : [],
    inventory: parsedInventory.success ? parsedInventory.data : [],
    failed,
  };
}
