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
  const todayPeriod = today.slice(0, 10);
  const weekPeriod = week.slice(0, 10);
  const [
    missionResult,
    todayAttemptsResult,
    weekAttemptsResult,
    mathAttemptsResult,
    generatedTodayAttemptsResult,
    generatedWeekAttemptsResult,
    generatedMathAttemptsResult,
    missionProgressResult,
    leaderboardResult,
  ] = await Promise.all([
    supabase.from("missions").select("id, title, description, mission_type, target_count, reward_xp, reward_coins, cadence").eq("is_active", true).order("cadence"),
    supabase.from("question_attempts").select("question_id").eq("user_id", user.id).gte("created_at", today),
    supabase.from("question_attempts").select("question_id").eq("user_id", user.id).gte("created_at", week),
    supabase.from("question_attempts").select("question_id, questions!inner(area)").eq("user_id", user.id).gte("created_at", today).eq("questions.area", "matematica"),
    supabase.from("ai_question_attempts").select("id").eq("user_id", user.id).gte("created_at", today),
    supabase.from("ai_question_attempts").select("id").eq("user_id", user.id).gte("created_at", week),
    supabase.from("ai_question_attempts").select("id").eq("user_id", user.id).eq("area", "matematica").gte("created_at", today),
    supabase.from("mission_progress").select("mission_id, period_start, claimed_at").eq("user_id", user.id).in("period_start", [todayPeriod, weekPeriod]),
    supabase.rpc("get_study_leaderboard", { p_limit: 20 }),
  ]);
  const missionRows = missionResult.data;
  const todayAttempts = todayAttemptsResult.data;
  const weekAttempts = weekAttemptsResult.data;
  const mathAttempts = mathAttemptsResult.data;
  const generatedTodayAttempts = generatedTodayAttemptsResult.data;
  const generatedWeekAttempts = generatedWeekAttemptsResult.data;
  const generatedMathAttempts = generatedMathAttemptsResult.data;
  const failedMissionData = [
    missionResult.error,
    todayAttemptsResult.error,
    weekAttemptsResult.error,
    mathAttemptsResult.error,
    missionProgressResult.error,
  ].some(Boolean);
  const generatedAttemptsUnavailable = Boolean(
    generatedTodayAttemptsResult.error ||
      generatedWeekAttemptsResult.error ||
      generatedMathAttemptsResult.error,
  );
  if (failedMissionData) {
    console.error("Mission board data could not be loaded.", {
      missionError: missionResult.error?.code,
      todayAttemptsError: todayAttemptsResult.error?.code,
      weekAttemptsError: weekAttemptsResult.error?.code,
      mathAttemptsError: mathAttemptsResult.error?.code,
      missionProgressError: missionProgressResult.error?.code,
    });
  }
  if (generatedAttemptsUnavailable) {
    console.error("Generated question attempts could not be loaded for missions.", {
      todayError: generatedTodayAttemptsResult.error?.code,
      weekError: generatedWeekAttemptsResult.error?.code,
      mathError: generatedMathAttemptsResult.error?.code,
    });
  }
  const missions: MissionItem[] = (missionRows ?? []).map((mission) => {
    const distinctCount = (rows: { question_id: string }[] | null) => new Set((rows ?? []).map((row) => row.question_id)).size;
    const uniqueCombinedCount = (rows: { question_id: string }[] | null, generated: { id: string }[] | null) =>
      distinctCount(rows) + new Set((generated ?? []).map((row) => row.id)).size;
    const progress = mission.id === "daily-questions-5" ? uniqueCombinedCount(todayAttempts, generatedTodayAttempts)
      : mission.id === "daily-math-3" ? uniqueCombinedCount(mathAttempts, generatedMathAttempts)
        : mission.id === "weekly-questions-25" ? uniqueCombinedCount(weekAttempts, generatedWeekAttempts) : 0;
    const periodStart = mission.cadence === "weekly" ? weekPeriod : todayPeriod;
    const claimed = (missionProgressResult.data ?? []).some(
      (entry) => entry.mission_id === mission.id && entry.period_start === periodStart && entry.claimed_at !== null,
    );
    return { ...mission, mission_type: mission.mission_type as MissionItem["mission_type"], cadence: mission.cadence as MissionItem["cadence"], progress, claimed };
  });
  const leaderboardSchema = z.array(z.object({ rank: z.coerce.number(), user_id: z.uuid(), display_name: z.string(), xp: z.number().int(), level: z.number().int() }));
  if (leaderboardResult.error) {
    console.error("Study leaderboard could not be loaded.", { code: leaderboardResult.error.code });
  }
  const parsedLeaders = leaderboardSchema.safeParse(leaderboardResult.data ?? []);
  const leaders: Leader[] = parsedLeaders.success ? parsedLeaders.data : [];
  return <div className="flex flex-col gap-6">
    <header><p className="text-muted-foreground text-sm">Estude, evolua e acompanhe sua constância</p><h1 className="font-display mt-1 text-2xl font-semibold">Missões</h1></header>
    {generatedAttemptsUnavailable && !failedMissionData ? <p role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-100">O progresso de questões geradas por IA está indisponível. Confira se a migration <code>20261010170000_add_ai_generated_question_attempts.sql</code> foi aplicada no Supabase; se já foi, verifique os logs do servidor.</p> : null}
    {failedMissionData ? <p role="alert" className="text-destructive text-sm">Não foi possível carregar o progresso das missões. Verifique se as migrations mais recentes do Supabase foram aplicadas.</p> : missionRows?.length ? <MissionBoard missions={missions} leaders={leaders} currentUserId={user.id} /> : <p role="alert" className="text-destructive text-sm">Não foi possível carregar as missões. Aplique as migrations do Supabase.</p>}
  </div>;
}
