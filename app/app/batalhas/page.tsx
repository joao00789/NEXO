import type { Metadata } from "next";

import { BattleArena } from "@/components/battles/battle-arena";
import { requireUserSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Batalhas" };

export default async function Page() {
  const user = await requireUserSession();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("profiles").select("animal_id").eq("id", user.id).maybeSingle();
  return <div className="mx-auto flex max-w-3xl flex-col gap-6">
    <header><p className="text-muted-foreground text-sm">Conhecimento vira estratégia</p><h1 className="font-display mt-1 text-2xl font-semibold">Batalhas de animais</h1><p className="text-muted-foreground mt-2 max-w-2xl text-sm">Enfrente outro estudante em turnos. Cada acerto causa dano; uma resposta errada encerra o turno sem ataque.</p></header>
    <BattleArena userId={user.id} initialAnimal={data?.animal_id ?? "fox"} />
  </div>;
}
