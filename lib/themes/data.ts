import { requireUserSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  activeThemeIdSchema,
  siteThemeInventorySchema,
  siteThemesSchema,
} from "@/lib/themes/schemas";

export async function getSiteThemeData() {
  const user = await requireUserSession();
  const supabase = await createSupabaseServerClient();
  const [profileResult, catalogResult, inventoryResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("coins, active_theme_id")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("site_themes")
      .select("id, name, description, price")
      .eq("is_active", true)
      .order("price", { ascending: true }),
    supabase
      .from("user_site_themes")
      .select("theme_id, acquired_at")
      .eq("user_id", user.id),
  ]);

  const parsedCatalog = siteThemesSchema.safeParse(catalogResult.data ?? []);
  const parsedInventory = siteThemeInventorySchema.safeParse(inventoryResult.data ?? []);
  const parsedActiveTheme = activeThemeIdSchema.safeParse(
    profileResult.data?.active_theme_id ?? null,
  );
  const failed = Boolean(
    profileResult.error ||
      catalogResult.error ||
      inventoryResult.error ||
      !profileResult.data ||
      !parsedCatalog.success ||
      !parsedInventory.success ||
      !parsedActiveTheme.success,
  );

  if (failed) {
    console.error("Site theme shop data could not be loaded.", {
      profileError: profileResult.error?.code,
      catalogError: catalogResult.error?.code,
      inventoryError: inventoryResult.error?.code,
      catalogValidationFailed: !parsedCatalog.success,
      inventoryValidationFailed: !parsedInventory.success,
      activeThemeValidationFailed: !parsedActiveTheme.success,
    });
  }

  return {
    coins: profileResult.data?.coins ?? 0,
    catalog: parsedCatalog.success ? parsedCatalog.data : [],
    ownedThemeIds: parsedInventory.success
      ? parsedInventory.data.map((entry) => entry.theme_id)
      : [],
    activeThemeId: parsedActiveTheme.success ? parsedActiveTheme.data : null,
    failed,
  };
}
