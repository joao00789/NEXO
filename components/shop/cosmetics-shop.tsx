"use client";

import { useRouter } from "next/navigation";
import { Coins, ShoppingBag } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { CosmeticIcon, getCosmeticAccent } from "@/components/avatar/cosmetic-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { purchaseCosmeticAction } from "@/lib/cosmetics/actions";
import type { CosmeticItem } from "@/lib/cosmetics/schemas";

const categoryLabels: Record<CosmeticItem["category"], string> = {
  headwear: "Chapéus",
  outfit: "Roupas",
  accessory: "Acessórios",
  effect: "Efeitos",
  background: "Fundos",
  frame: "Molduras",
};

const rarityLabels: Record<CosmeticItem["rarity"], string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  epic: "Épico",
};

const categories = ["all", "headwear", "outfit", "accessory", "effect", "background", "frame"] as const;

export function CosmeticsShop({
  items,
  ownedIds: initialOwnedIds,
  initialCoins,
}: {
  items: CosmeticItem[];
  ownedIds: string[];
  initialCoins: number;
}) {
  const router = useRouter();
  const [coins, setCoins] = useState(initialCoins);
  const [ownedIds, setOwnedIds] = useState(() => new Set(initialOwnedIds));
  const [category, setCategory] = useState<(typeof categories)[number]>("all");
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();
  const visibleItems = useMemo(
    () => category === "all" ? items : items.filter((item) => item.category === category),
    [category, items],
  );

  function buy(item: CosmeticItem) {
    setError("");
    setSuccess("");
    setPendingItem(item.id);
    startTransition(async () => {
      const result = await purchaseCosmeticAction(item.id);
      setPendingItem(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOwnedIds((current) => new Set(current).add(item.id));
      if (typeof result.balance === "number") setCoins(result.balance);
      setSuccess(`${item.name} foi adicionado ao seu inventário.`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-border bg-card/80 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Seu saldo</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Coins aria-hidden="true" className="size-5 text-amber-300" /> {coins} NEXO Coins
          </p>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          Use suas moedas em itens cosméticos. A loja não vende conteúdo nem vantagem nos estudos.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Filtrar itens por categoria">
        {categories.map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={category === value ? "secondary" : "outline"}
            aria-pressed={category === value}
            onClick={() => setCategory(value)}
            className={category === value ? "border-primary/30 bg-primary/10 text-foreground" : "border-border bg-card/60 text-foreground hover:bg-accent"}
          >
            {value === "all" ? "Todos" : categoryLabels[value]}
          </Button>
        ))}
      </div>

      {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
      {success ? <p role="status" className="text-sm text-emerald-300">{success}</p> : null}

      {visibleItems.length === 0 ? (
        <Card className="border-border bg-card/80">
          <CardContent className="p-6 text-sm text-slate-400">Não há itens nesta categoria por enquanto.</CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Itens cosméticos disponíveis">
          {visibleItems.map((item) => {
            const owned = ownedIds.has(item.id);
            const canAfford = coins >= item.price;
            return (
              <Card key={item.id} className="overflow-hidden border-border bg-card shadow-[0_20px_35px_rgba(0,0,0,0.18)]">
                <div className="flex h-32 items-center justify-center bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--primary)_18%,transparent),_transparent_45%)]">
                  <div
                    className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-[#111214] shadow-lg"
                    style={{ boxShadow: `0 0 30px ${getCosmeticAccent(item.accent)}44` }}
                  >
                    <CosmeticIcon item={item} className="size-8" />
                  </div>
                </div>
                <CardHeader className="gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base text-white">{item.name}</CardTitle>
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-200">
                      {rarityLabels[item.rarity]}
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-300">{item.description}</CardDescription>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{categoryLabels[item.category]}</p>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 font-medium text-white">
                    <Coins aria-hidden="true" className="size-4 text-amber-300" /> {item.price}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant={owned ? "secondary" : "default"}
                    disabled={owned || !canAfford || pending}
                    onClick={() => buy(item)}
                    title={!owned && !canAfford ? "Responda questões para ganhar NEXO Coins." : undefined}
                    className={owned ? "border-white/10 bg-white/5 text-slate-200" : "bg-primary text-white hover:bg-primary/90"}
                  >
                    {owned ? <><ShoppingBag aria-hidden="true" /> No inventário</> : pendingItem === item.id ? "Comprando..." : !canAfford ? "Saldo insuficiente" : "Comprar"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
      <p className="text-xs text-slate-400">Itens cosméticos. Nenhuma compra altera questões, conteúdos ou desempenho acadêmico.</p>
    </div>
  );
}
