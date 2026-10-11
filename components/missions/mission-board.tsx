"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BookOpenCheck, CheckCircle2, CirclePlay, Coins, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { claimMissionAction } from "@/lib/gamification/actions";

export type MissionItem = { id: string; title: string; description: string; mission_type: "questions" | "video"; target_count: number; reward_xp: number; reward_coins: number; cadence: "daily" | "weekly"; progress: number; claimed: boolean };
export type Leader = { rank: number; user_id: string; display_name: string; xp: number; level: number };

export function MissionBoard({ missions, leaders, currentUserId }: { missions: MissionItem[]; leaders: Leader[]; currentUserId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [claimedMissionIds, setClaimedMissionIds] = useState(
    () => new Set(missions.filter((mission) => mission.claimed).map((mission) => mission.id)),
  );
  const [pendingId, setPendingId] = useState("");
  const [pending, startTransition] = useTransition();
  function claim(id: string) {
    setMessage("");
    setPendingId(id);
    startTransition(async () => {
      const result = await claimMissionAction(id);
      setPendingId("");
      if ("error" in result) {
        setMessageIsError(true);
        setMessage(result.error);
        router.refresh();
        return;
      }
      setClaimedMissionIds((current) => new Set(current).add(id));
      setMessageIsError(false);
      setMessage(`Missão concluída: +${result.xp} XP e +${result.coins} NEXO Coins.`);
      router.refresh();
    });
  }

  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
    <section className="flex flex-col gap-4">
      {message ? <p role={messageIsError ? "alert" : "status"} className={messageIsError ? "text-destructive text-sm" : "text-primary text-sm"}>{message}</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {missions.map((mission) => {
          const done = mission.progress >= mission.target_count;
          const claimed = mission.claimed || claimedMissionIds.has(mission.id);
          const percent = Math.min(100, Math.round(mission.progress / mission.target_count * 100));
          return <Card key={mission.id}>
            <CardHeader className="flex-row items-start gap-3"><div className="bg-primary/10 text-primary rounded-lg p-2">{mission.mission_type === "video" ? <CirclePlay className="size-5" /> : <BookOpenCheck className="size-5" />}</div><div className="min-w-0"><CardTitle className="text-base">{mission.title}</CardTitle><CardDescription className="mt-1">{mission.description}</CardDescription></div></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">{mission.cadence === "daily" ? "Diária" : "Semanal"}</span><span>{mission.progress}/{mission.target_count}</span></div>
              <div className="bg-muted h-2 overflow-hidden rounded-full" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso ${mission.title}`}><div className="bg-primary h-full rounded-full transition-[width]" style={{ width: `${percent}%` }} /></div>
              <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground flex items-center gap-1 text-xs"><Trophy className="size-3.5" /> {mission.reward_xp} XP{mission.reward_coins ? ` · ${mission.reward_coins} Coins` : ""}</span>
                {mission.mission_type === "video" ? <span className="text-muted-foreground text-xs">Aulas serão ativadas após configurar a fonte segura de vídeo.</span> : claimed ? <span role="status" className="text-muted-foreground flex items-center gap-1 text-xs"><CheckCircle2 className="size-4 text-primary" /> Recompensa resgatada</span> : done ? <Button size="sm" disabled={pending} onClick={() => claim(mission.id)}>{pending && pendingId === mission.id ? "Resgatando…" : <><CheckCircle2 /> Resgatar</>}</Button> : <span className="text-muted-foreground text-xs">Continue praticando</span>}
              </div>
            </CardContent>
          </Card>;
        })}
      </div>
      <Card><CardHeader><CardTitle className="text-base">Missões de vídeo</CardTitle><CardDescription>As aulas do NEXO não interrompem questões nem redações. Recompensas só serão liberadas quando a conclusão puder ser confirmada no servidor.</CardDescription></CardHeader><CardContent className="text-muted-foreground text-sm">Nenhum vídeo está conectado ainda. Assim que adicionarmos aulas próprias, elas aparecerão aqui com progresso e confirmação confiável.</CardContent></Card>
    </section>
    <aside><Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Trophy className="size-4 text-primary" /> Ranking de estudo</CardTitle><CardDescription>XP conquistado estudando. Atualiza conforme o progresso.</CardDescription></CardHeader><CardContent className="flex flex-col gap-2">
      {leaders.map((leader) => <div key={leader.user_id} className={`flex items-center gap-3 rounded-lg p-2 ${leader.user_id === currentUserId ? "bg-primary/10" : "bg-muted/50"}`}><span className="text-muted-foreground w-7 text-center text-xs">{leader.rank}</span><span className="min-w-0 flex-1 truncate text-sm">{leader.display_name}{leader.user_id === currentUserId ? " (você)" : ""}</span><span className="text-xs">Nv. {leader.level}</span><span className="text-muted-foreground text-xs">{leader.xp} XP</span></div>)}
      {!leaders.length ? <p className="text-muted-foreground text-sm">O ranking aparecerá quando houver progresso.</p> : null}
      <p className="text-muted-foreground mt-2 flex items-center gap-1 text-xs"><Coins className="size-3.5" /> Nenhuma vantagem acadêmica é vendida.</p>
    </CardContent></Card></aside>
  </div>;
}
