import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { requireUserSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Início",
};

export default async function DashboardPage() {
  const user = await requireUserSession();
  const supabase = await createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, level, xp, coins")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-200" role="alert">
        Não foi possível carregar seu perfil agora. Atualize a página para tentar novamente.
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="border-border rounded-xl border border-dashed p-8 text-center">
        <h1 className="font-display text-xl font-bold">Perfil em preparação</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Estamos configurando seu perfil. Tente novamente em instantes.
        </p>
      </div>
    );
  }

  const { data: progress, error: progressError } = await supabase
    .from("study_progress")
    .select("area, correct_answers, total_answers")
    .eq("user_id", user.id);
  // eslint-disable-next-line react-hooks/purity
  const activitySince = new Date(Date.now() - 370 * 24 * 60 * 60 * 1000).toISOString();
  const [attemptsResult, generatedAttemptsResult] = await Promise.all([
    supabase
      .from("question_attempts")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", activitySince)
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("ai_question_attempts")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", activitySince)
      .order("created_at", { ascending: false })
      .limit(5000),
  ]);
  const attempts = [
    ...(attemptsResult.data ?? []),
    ...(generatedAttemptsResult.data ?? []),
  ];
  const attemptsError = attemptsResult.error ?? generatedAttemptsResult.error;

  const dateKey = (date: Date) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Fortaleza",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((value) => value.type === type)?.value ?? "";
    return `${part("year")}-${part("month")}-${part("day")}`;
  };
  const shiftDay = (key: string, amount: number) => {
    const date = new Date(`${key}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + amount);
    return date.toISOString().slice(0, 10);
  };
  const countsByDay = new Map<string, number>();
  for (const attempt of attempts ?? []) {
    const key = dateKey(new Date(attempt.created_at));
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  const today = dateKey(new Date());
  const todayDate = new Date(`${today}T12:00:00Z`);
  const mondayOffset = (todayDate.getUTCDay() + 6) % 7;
  const weekStart = shiftDay(today, -mondayOffset);
  const days = Array.from({ length: 7 }, (_, index) => {
    const key = shiftDay(weekStart, index);
    const date = new Date(`${key}T12:00:00Z`);
    return {
      key,
      label: new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Fortaleza",
        weekday: "short",
      }).format(date).replace(".", ""),
      day: key.slice(-2),
      count: countsByDay.get(key) ?? 0,
      isToday: key === today,
    };
  });

  let streakDays = 0;
  let streakDate = countsByDay.has(today) ? today : shiftDay(today, -1);
  while (countsByDay.has(streakDate) && streakDays < 370) {
    streakDays += 1;
    streakDate = shiftDay(streakDate, -1);
  }

  return (
    <DashboardOverview
      profile={profile}
      progress={progress ?? []}
      activity={attemptsError ? [] : days}
      streakDays={streakDays}
      hasProgressError={Boolean(progressError)}
      hasActivityError={Boolean(attemptsError)}
    />
  );
}
