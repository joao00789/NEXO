"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CircleOff, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";

import { AvatarPreview } from "@/components/avatar/avatar-preview";
import { CosmeticIcon } from "@/components/avatar/cosmetic-icon";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setAvatarAnimalAction, toggleCosmeticEquipAction } from "@/lib/cosmetics/actions";
import { AnimalAvatar } from "@/components/avatar/animal-avatar";
import { ANIMAL_CATALOG, ANIMAL_IDS } from "@/lib/animals/catalog";
import type { CosmeticItem } from "@/lib/cosmetics/schemas";

export type OwnedCosmeticItem = CosmeticItem & { isEquipped: boolean };

const categoryLabels: Record<CosmeticItem["category"], string> = {
  headwear: "Chapéus",
  outfit: "Roupas",
  accessory: "Acessórios",
  effect: "Efeitos",
  background: "Fundos",
  frame: "Molduras",
};

export function AvatarCustomizer({ initialItems, initialSpecies = "fox" }: { initialItems: OwnedCosmeticItem[]; initialSpecies?: string }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [species, setSpecies] = useState(ANIMAL_IDS.includes(initialSpecies) ? initialSpecies : "fox");
  const [pending, startTransition] = useTransition();
  const equipped = items.filter((item) => item.isEquipped);

  function changeSpecies(animalId: string) {
    setError("");
    setPendingId("animal");
    startTransition(async () => {
      const result = await setAvatarAnimalAction(animalId);
      setPendingId("");
      if (result.error) { setError(result.error); return; }
      setSpecies(animalId);
      setMessage(`Seu avatar agora é ${ANIMAL_CATALOG.find((animal) => animal.id === animalId)?.name ?? "um novo animal"}.`);
      router.refresh();
    });
  }

  function toggle(item: OwnedCosmeticItem) {
    setError("");
    setMessage("");
    setPendingId(item.id);
    startTransition(async () => {
      const result = await toggleCosmeticEquipAction(item.id);
      setPendingId(null);
      if (result.error || typeof result.equipped !== "boolean") {
        setError(result.error ?? "Não foi possível atualizar o avatar.");
        return;
      }
      const isEquipped = result.equipped;
      setItems((current) => current.map((currentItem) => ({
        ...currentItem,
        isEquipped: currentItem.id === item.id
          ? isEquipped
          : currentItem.category === item.category && isEquipped
            ? false
            : currentItem.isEquipped,
      })));
      setMessage(isEquipped ? `${item.name} equipado.` : `${item.name} removido do avatar.`);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[19rem_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Seu avatar</CardTitle>
          <CardDescription>Combine itens cosméticos para montar seu visual.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-5">
          <AvatarPreview items={equipped} species={species} />
          <Link href="/app/loja" className={buttonVariants({ className: "w-full" })}>
            Explorar loja <ArrowRight aria-hidden="true" />
          </Link>
          <p className="text-muted-foreground text-center text-xs">Escolha um animal e personalize-o com itens cosméticos.</p>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4" aria-label="Seu inventário de itens cosméticos">
        <Card>
          <CardHeader><CardTitle className="text-base">Escolha seu animal</CardTitle><CardDescription>Todos os animais iniciais são gratuitos. Nas batalhas, acertos nas questões causam dano.</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ANIMAL_CATALOG.map((animal) => <button key={animal.id} type="button" disabled={pending} aria-pressed={species === animal.id} onClick={() => changeSpecies(animal.id)} className={`border-border hover:bg-muted flex flex-col items-center gap-1 rounded-xl border p-3 text-center focus-visible:ring-2 focus-visible:ring-ring ${species === animal.id ? "border-primary bg-primary/10" : ""}`}>
              <AnimalAvatar species={animal.id} className="size-20" />
              <span className="text-sm font-medium">{animal.name}</span><span className="text-muted-foreground text-xs">{animal.description}</span>
            </button>)}
          </CardContent>
        </Card>
        <div>
          <h2 className="font-display text-xl font-semibold">Inventário</h2>
          <p className="text-muted-foreground mt-1 text-sm">Cada categoria permite um item equipado por vez.</p>
        </div>
        {error ? <p role="alert" className="text-destructive text-sm">{error}</p> : null}
        {message ? <p role="status" className="text-sm text-emerald-400">{message}</p> : null}
        {items.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center">
              <Sparkles aria-hidden="true" className="text-muted-foreground size-7" />
              <div>
                <h3 className="font-medium">Seu inventário está vazio</h3>
                <p className="text-muted-foreground mt-1 text-sm">Responda questões para ganhar moedas e escolha itens na loja.</p>
              </div>
              <Link href="/app/loja" className={buttonVariants({ variant: "outline" })}>Ver itens</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id} className={item.isEquipped ? "border-primary/50" : undefined}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="bg-surface border-border flex size-11 shrink-0 items-center justify-center rounded-xl border">
                    <CosmeticIcon item={item} className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-xs">{categoryLabels[item.category]}</p>
                  </div>
                  <Button type="button" size="sm" variant={item.isEquipped ? "outline" : "secondary"} disabled={pending} onClick={() => toggle(item)}>
                    {item.isEquipped ? <><CircleOff aria-hidden="true" /> Remover</> : pendingId === item.id ? "Salvando..." : <><Check aria-hidden="true" /> Equipar</>}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
