import type { Metadata } from "next";
import { z } from "zod";

import { MissionBoard, type Leader, type MissionItem } from "@/components/missions/mission-board";
import { requireUserSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Missões" };

export default async function Page() {
  const user = await requireUserSession();
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  const week = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - ((now.getUTCDay() + 6) % 7))).toISOString();
  const [{ data: missionRows }, { data: todayAttempts }, { data: weekAttempts }, { data: mathAttempts }, { data: leaderboard }] = await Promise.all([
    supabase.from("missions").select("id, title, description, mission_type, target_count, reward_xp, reward_coins, cadence").eq("is_active", true).order("cadence"),
    supabase.from("question_attempts").select("question_id").eq("user_id", user.id).gte("created_at", today),
    supabase.from("question_attempts").select("question_id").eq("user_id", user.id).gte("created_at", week),
    supabase.from("question_attempts").select("question_id, questions!inner(area)").eq("user_id", user.id).gte("created_at", today).eq("questions.area", "matematica"),
    supabase.rpc("get_study_leaderboard", { p_limit: 20 }),
  ]);
  const missions: MissionItem[] = (missionRows ?? []).map((mission) => {
    const distinctCount = (rows: { question_id: string }[] | null) => new Set((rows ?? []).map((row) => row.question_id)).size;
    const progress = mission.id === "daily-questions-5" ? distinctCount(todayAttempts)
      : mission.id === "daily-math-3" ? distinctCount(mathAttempts)
        : mission.id === "weekly-questions-25" ? distinctCount(weekAttempts) : 0;
    return { ...mission, mission_type: mission.mission_type as MissionItem["mission_type"], cadence: mission.cadence as MissionItem["cadence"], progress };
  });
  const leaderboardSchema = z.array(z.object({ rank: z.coerce.number(), user_id: z.uuid(), display_name: z.string(), xp: z.number().int(), level: z.number().int() }));
  const parsedLeaders = leaderboardSchema.safeParse(leaderboard ?? []);
  const leaders: Leader[] = parsedLeaders.success ? parsedLeaders.data : [];
  return <div className="flex flex-col gap-6">
    <header><p className="text-muted-foreground text-sm">Estude, evolua e acompanhe sua constância</p><h1 className="font-display mt-1 text-2xl font-semibold">Missões</h1></header>
    {missionRows?.length ? <MissionBoard missions={missions} leaders={leaders} currentUserId={user.id} /> : <p role="alert" className="text-destructive text-sm">Não foi possível carregar as missões. Aplique as migrations do Supabase.</p>}
  </div>;
}
