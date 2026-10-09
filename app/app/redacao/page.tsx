import type { Metadata } from "next";

import { EssayWorkspace, type EssayDraft } from "@/components/essays/essay-workspace";
import { essayCorrectionSchema, essayThemeSchema } from "@/lib/essays/schemas";
import { requireUserSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Redação" };

export default async function Page() {
  await requireUserSession();
  const supabase = await createSupabaseServerClient();
  const [{ data: themeRows }, { data: essayRows }] = await Promise.all([
    supabase.from("essay_themes").select("id, title, category, motivation, source_label, source_url, is_official").order("created_at", { ascending: false }),
    supabase.from("essays").select("id, theme_id, theme_title, body, updated_at, correction").order("updated_at", { ascending: false }).limit(20),
  ]);
  const themes = (themeRows ?? []).flatMap((row) => {
    const parsed = essayThemeSchema.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });
  const drafts: EssayDraft[] = (essayRows ?? []).map((row) => ({
    id: row.id as string,
    theme_id: row.theme_id as string | null,
    theme_title: row.theme_title as string,
    body: row.body as string,
    updated_at: row.updated_at as string,
    correction: essayCorrectionSchema.safeParse(row.correction).success
      ? essayCorrectionSchema.parse(row.correction)
      : null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header><p className="text-muted-foreground text-sm">Pratique, revise e acompanhe sua evolução</p><h1 className="font-display mt-1 text-2xl font-semibold">Redação</h1></header>
      {themes.length ? <EssayWorkspace themes={themes} drafts={drafts} /> : <p role="alert" className="text-destructive text-sm">Não foi possível carregar os temas. Aplique as migrations do Supabase.</p>}
    </div>
  );
}
