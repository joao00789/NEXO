import type { Metadata } from "next";
import { connection } from "next/server";

import { AppShell } from "@/components/layout/app-shell";
import { requireUserSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { default: "NEXO", template: "%s · NEXO" },
};

export const instant = false;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const user = await requireUserSession();
  const supabase = await createSupabaseServerClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, level")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("App account profile query failed", {
      code: error.code,
      message: error.message,
    });
  }

  return (
    <AppShell
      account={profile && !error ? { fullName: profile.full_name, level: profile.level } : null}
    >
      {children}
    </AppShell>
  );
}
