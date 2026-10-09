import type { Metadata } from "next";
import { AlertTriangle, Coins } from "lucide-react";

import { CosmeticsShop } from "@/components/shop/cosmetics-shop";
import { getCosmeticsData } from "@/lib/cosmetics/data";

export const metadata: Metadata = { title: "Loja" };

export default async function Page() {
  const { catalog, inventory, coins, failed } = await getCosmeticsData();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-border bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.22),_transparent_35%),linear-gradient(135deg,_rgba(18,24,38,0.98),_rgba(10,11,16,0.94))] p-5 shadow-[0_20px_45px_rgba(10,17,30,0.45)]">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/10 text-violet-200">
            <Coins aria-hidden="true" className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-violet-200/80">
              Loja cosmética
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white">Loja NEXO</h1>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">
          Itens cosméticos para deixar seu avatar com a sua cara e evoluir sem perder o foco no estudo.
        </p>
      </section>

      {failed ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200" role="alert">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Não foi possível carregar a loja. Aplique a migration da loja no Supabase e recarregue a página.
        </div>
      ) : (
        <CosmeticsShop items={catalog} ownedIds={inventory.map((entry) => entry.item_id)} initialCoins={coins} />
      )}
    </div>
  );
}
