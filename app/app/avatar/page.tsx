import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";

import { AvatarCustomizer } from "@/components/avatar/avatar-customizer";
import { getCosmeticsData } from "@/lib/cosmetics/data";
import { requireUserSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Avatar" };

export default async function Page() {
  const user = await requireUserSession();
  const supabase = await createSupabaseServerClient();
  const [{ catalog, inventory, failed }, profile] = await Promise.all([
    getCosmeticsData(),
    supabase.from("profiles").select("animal_id").eq("id", user.id).maybeSingle(),
  ]);
  const ownedItems = inventory.flatMap((entry) => {
    const item = catalog.find((candidate) => candidate.id === entry.item_id);
    return item ? [{ ...item, isEquipped: entry.is_equipped }] : [];
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Avatar</h1>
        <p className="text-muted-foreground mt-1 text-sm">Personalize seu visual com itens cosméticos do NEXO.</p>
      </header>
      {failed ? (
        <div className="border-destructive/40 bg-destructive/5 flex items-start gap-2 rounded-lg border p-4 text-sm" role="alert">
          <AlertTriangle aria-hidden="true" className="text-destructive mt-0.5 size-4 shrink-0" />
          Não foi possível carregar o inventário. Aplique a migration da loja no Supabase e recarregue a página.
        </div>
      ) : null}
      <AvatarCustomizer initialItems={ownedItems} initialSpecies={profile.data?.animal_id ?? "fox"} />
    </div>
  );
}
