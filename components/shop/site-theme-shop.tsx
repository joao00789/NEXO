"use client";

import { useRouter } from "next/navigation";
import { Check, Coins, LoaderCircle, Palette, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  purchaseSiteThemeAction,
  setActiveSiteThemeAction,
} from "@/lib/themes/actions";
import { siteThemePreviews, type SiteThemeId } from "@/lib/themes/catalog";

type ShopTheme = {
  id: SiteThemeId;
  name: string;
  description: string;
  price: number;
};

export function SiteThemeShop({
  themes,
  ownedThemeIds: initialOwnedThemeIds,
  initialCoins,
  initialActiveThemeId,
}: {
  themes: ShopTheme[];
  ownedThemeIds: SiteThemeId[];
  initialCoins: number;
  initialActiveThemeId: SiteThemeId | null;
}) {
  const router = useRouter();
  const [coins, setCoins] = useState(initialCoins);
  const [ownedThemeIds, setOwnedThemeIds] = useState(() => new Set(initialOwnedThemeIds));
  const [activeThemeId, setActiveThemeId] = useState(initialActiveThemeId);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();

  function buy(theme: ShopTheme) {
    setError("");
    setSuccess("");
    setPendingId(theme.id);
    startTransition(async () => {
      const result = await purchaseSiteThemeAction(theme.id);
      setPendingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOwnedThemeIds((current) => new Set(current).add(theme.id));
      if (typeof result.balance === "number") setCoins(result.balance);
      setSuccess(`${theme.name} foi adicionado à sua coleção.`);
      router.refresh();
    });
  }

  function activate(themeId: SiteThemeId | "default") {
    setError("");
    setSuccess("");
    setPendingId(themeId);
    startTransition(async () => {
      const result = await setActiveSiteThemeAction(themeId);
      setPendingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      setActiveThemeId(result.activeThemeId ?? null);
      setSuccess(themeId === "default" ? "Tema original ativado." : "Tema aplicado ao site.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Seu saldo</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
            <Coins aria-hidden="true" className="size-5 text-amber-300" />
            {coins} NEXO Coins
          </p>
        </div>
        <div className="max-w-lg text-sm text-muted-foreground">
          <p>Temas cosméticos mudam as cores e as animações visuais do site, sem alterar seus estudos.</p>
          <p className="mt-1">Itens de avatar que você já comprou continuam no seu inventário.</p>
        </div>
      </section>

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      {success ? <p role="status" className="text-sm text-emerald-400">{success}</p> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Temas visuais disponíveis">
        {themes.map((theme) => {
          const owned = ownedThemeIds.has(theme.id);
          const active = activeThemeId === theme.id;
          const preview = siteThemePreviews[theme.id];
          const previewContent = (
            <div
              aria-hidden="true"
              className="relative z-10 w-full rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: preview.primary }} />
                <span className="h-2 w-16 rounded-full bg-white/45" />
                <span className="ml-auto h-2 w-8 rounded-full" style={{ backgroundColor: `${preview.primary}99` }} />
              </div>
              <div className="mt-3 grid grid-cols-[1fr_2fr] gap-2">
                <span className="h-7 rounded-md border border-white/10 bg-white/5" />
                <span className="h-7 rounded-md" style={{ backgroundColor: `${preview.primary}30` }} />
              </div>
            </div>
          );

          return (
            <Card key={theme.id} className="overflow-hidden border-border bg-card">
              <div
                className="relative flex h-36 items-end overflow-hidden rounded-t-xl p-4"
                data-theme-preview={theme.id}
                style={{
                  background: `radial-gradient(circle at 85% 10%, ${preview.glow}55, transparent 45%), ${preview.surface}`,
                }}
              >
                {previewContent}
                <div className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/20 p-2 text-white">
                  <Palette aria-hidden="true" className="size-4" />
                </div>
              </div>
              <CardHeader className="gap-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{theme.name}</CardTitle>
                  {active ? <Badge className="gap-1"><Check aria-hidden="true" className="size-3" /> Em uso</Badge> : null}
                </div>
                <CardDescription>{theme.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  {owned ? <Sparkles aria-hidden="true" className="size-4 text-primary" /> : <Coins aria-hidden="true" className="size-4 text-amber-300" />}
                  {owned ? "Na coleção" : theme.price}
                </span>
                {owned ? (
                  <Button
                    type="button"
                    size="sm"
                    variant={active ? "secondary" : "default"}
                    disabled={active || pending}
                    onClick={() => activate(theme.id)}
                    className="w-full sm:w-auto"
                  >
                    {pendingId === theme.id ? <LoaderCircle className="animate-spin" /> : active ? "Em uso" : "Ativar tema"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    disabled={pending || coins < theme.price}
                    onClick={() => buy(theme)}
                    title={coins < theme.price ? "Responda questões para ganhar NEXO Coins." : undefined}
                    className="w-full sm:w-auto"
                  >
                    {pendingId === theme.id ? <><LoaderCircle className="animate-spin" /> Comprando…</> : coins < theme.price ? "Saldo insuficiente" : "Comprar"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Tema original NEXO</h2>
          <p className="mt-1 text-sm text-muted-foreground">Volte para o visual padrão azul e escuro da plataforma.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={activeThemeId === null || pending}
          onClick={() => activate("default")}
        >
          {pendingId === "default" ? <><LoaderCircle className="animate-spin" /> Aplicando…</> : activeThemeId === null ? "Em uso" : "Restaurar tema"}
        </Button>
      </Card>
    </div>
  );
}
