"use client";

import { useState, useTransition } from "react";
import { Heart, RefreshCw, Swords } from "lucide-react";

import { AnimalAvatar } from "@/components/avatar/animal-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { answerBattleAction, findBattleAction, getBattleAction, type BattleState } from "@/lib/battles/actions";
import { ANIMAL_CATALOG, ANIMAL_IDS } from "@/lib/animals/catalog";

export function BattleArena({ userId, initialAnimal }: { userId: string; initialAnimal: string }) {
  const [animal, setAnimal] = useState(ANIMAL_IDS.includes(initialAnimal) ? initialAnimal : "fox");
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, startTransition] = useTransition();

  function findOpponent() {
    setNotice("");
    startTransition(async () => {
      const result = await findBattleAction(animal);
      if (result.error || !result.battleId) { setNotice(result.error ?? "Não foi possível encontrar batalha."); return; }
      const updated = await getBattleAction(result.battleId);
      if (updated.battle) setBattle(updated.battle);
      else setNotice(updated.error ?? "Na fila. Atualize para conferir se encontrou um adversário.");
      if (result.status === "waiting") setNotice("Você está na fila. Quando alguém entrar, atualize a batalha.");
    });
  }

  function refresh() {
    if (!battle) return;
    startTransition(async () => {
      const result = await getBattleAction(battle.id);
      if (result.battle) { setBattle(result.battle); setNotice(""); }
      else setNotice(result.error ?? "Não foi possível atualizar.");
    });
  }

  function answer(optionId: string) {
    if (!battle) return;
    startTransition(async () => {
      const result = await answerBattleAction(battle.id, optionId);
      if (result.error) { setNotice(result.error); return; }
      if (result.result) setNotice(result.result.correct ? `Acertou! Seu animal causou ${result.result.damage} de dano.` : "Resposta incorreta. Seu turno terminou sem causar dano.");
      const updated = await getBattleAction(battle.id);
      if (updated.battle) setBattle(updated.battle);
    });
  }

  const myPlayer = battle?.players.find((player) => player.user_id === userId);
  const rival = battle?.players.find((player) => player.user_id !== userId);
  const myTurn = battle?.status === "active" && battle.current_player_id === userId;

  return <div className="flex flex-col gap-5">
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Swords className="text-primary size-5" /> Arena NEXO</CardTitle><CardDescription>Responda uma questão para atacar. Só acertos causam dano; nenhuma resposta ou dano vem do navegador.</CardDescription></CardHeader><CardContent className="flex flex-col gap-4">
      {!battle || battle.status === "finished" ? <>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{ANIMAL_CATALOG.map((entry) => <button key={entry.id} type="button" aria-pressed={animal === entry.id} onClick={() => setAnimal(entry.id)} className={`border-border flex items-center gap-2 rounded-lg border p-2 focus-visible:ring-2 focus-visible:ring-ring ${animal === entry.id ? "border-primary bg-primary/10" : "hover:bg-muted"}`}><AnimalAvatar species={entry.id} className="size-12" /><span className="text-sm">{entry.name}</span></button>)}</div>
        <Button type="button" disabled={busy} onClick={findOpponent}><Swords /> {busy ? "Procurando…" : "Procurar adversário"}</Button>
      </> : <>
        <div className="grid gap-3 sm:grid-cols-2">
          {[myPlayer, rival].map((player) => player ? <div key={player.user_id} className="bg-muted/50 flex items-center gap-3 rounded-xl p-3"><AnimalAvatar species={player.animal_id} className="size-16" /><div className="min-w-0 flex-1"><p className="truncate font-medium">{player.name}{player.user_id === userId ? " (você)" : ""}</p><p className="text-muted-foreground flex items-center gap-1 text-xs"><Heart className="size-3 text-rose-400" /> {player.health}/100</p><div className="bg-background mt-2 h-1.5 overflow-hidden rounded-full"><div className="h-full bg-rose-400" style={{ width: `${player.health}%` }} /></div></div></div> : null)}
        </div>
        {battle.status === "waiting" ? <div className="flex items-center justify-between gap-2"><p className="text-muted-foreground text-sm">Aguardando outro estudante entrar na fila.</p><Button type="button" variant="outline" disabled={busy} onClick={refresh}><RefreshCw /> Atualizar</Button></div> : battle.status === "cancelled" ? <p className="text-muted-foreground text-sm">Esta batalha foi encerrada.</p> : <>
          <div className="border-border rounded-xl border p-4"><p className="text-muted-foreground mb-2 text-xs">{myTurn ? "Sua vez · acerto causa 20 de dano" : "Vez do adversário"}</p><p className="font-medium">{battle.question?.statement ?? "Carregando questão…"}</p></div>
          <div className="grid gap-2 sm:grid-cols-2">{(battle.question?.options ?? []).map((option) => <Button key={option.id} type="button" variant="outline" disabled={!myTurn || busy} className="h-auto min-h-11 justify-start whitespace-normal text-left" onClick={() => answer(option.id)}><span className="text-primary mr-1 font-semibold">{option.label}.</span>{option.content}</Button>)}</div>
          {!myTurn ? <Button type="button" variant="outline" disabled={busy} onClick={refresh}><RefreshCw /> Atualizar estado</Button> : null}
        </>}
      </>}
      {notice ? <p role="status" className="text-muted-foreground text-sm">{notice}</p> : null}
    </CardContent></Card>
    <p className="text-muted-foreground text-xs">Batalhas são educativas. Questões e recompensas não concedem vantagem acadêmica comprada. A fila é por turnos; atualize a tela para sincronizar com o adversário.</p>
  </div>;
}
