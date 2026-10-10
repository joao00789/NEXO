import type { Metadata } from "next";
import { AlertTriangle, Coins } from "lucide-react";

import { SiteThemeShop } from "@/components/shop/site-theme-shop";
import { getSiteThemeData } from "@/lib/themes/data";

export const metadata: Metadata = { title: "Loja" };

export default async function Page() {
  const { catalog, ownedThemeIds, coins, activeThemeId, failed } =
    await getSiteThemeData();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-primary/15 via-background to-card p-5 shadow-xl shadow-black/15">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
            <Coins aria-hidden="true" className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary/80">
              Personalização visual
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Temas do NEXO</h1>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Mude as cores e as animações do site com temas visuais comprados usando NEXO Coins.
        </p>
      </section>

      {failed ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200" role="alert">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Não foi possível carregar os temas. Verifique se a migration de temas foi aplicada no Supabase e confira os Logs Postgres.
        </div>
      ) : (
        <SiteThemeShop
          themes={catalog}
          ownedThemeIds={ownedThemeIds}
          initialCoins={coins}
          initialActiveThemeId={activeThemeId}
        />
      )}
    </div>
  );
}
