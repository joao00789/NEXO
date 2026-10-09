import type { Metadata } from "next";

import { PerformanceOverview } from "@/components/dashboard/performance-overview";
import { requireUserSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Desempenho" };

export default async function Page() {
  const user = await requireUserSession();
  const supabase = await createSupabaseServerClient();

  const [progressResult, attemptsResult] = await Promise.all([
    supabase
      .from("study_progress")
      .select("area, correct_answers, total_answers, score")
      .eq("user_id", user.id),
    supabase
      .from("question_attempts")
      .select("id, question_id, is_correct, elapsed_seconds, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  let questionById = new Map<string, { subject: string; topic: string }>();
  const questionIds = [
    ...new Set((attemptsResult.data ?? []).map((attempt) => attempt.question_id)),
  ];

  if (questionIds.length) {
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("id, subject, topic")
      .in("id", questionIds);

    if (questionsError) {
      return <PerformanceOverview progress={[]} attempts={[]} hasLoadError />;
    }

    questionById = new Map(
      (questions ?? []).map((question) => [question.id, question]),
    );
  }

  const attempts = (attemptsResult.data ?? []).map((attempt) => ({
    ...attempt,
    question: questionById.get(attempt.question_id) ?? null,
  }));

  return (
    <PerformanceOverview
      progress={progressResult.data ?? []}
      attempts={attempts}
      hasLoadError={Boolean(progressResult.error || attemptsResult.error)}
    />
  );
}
