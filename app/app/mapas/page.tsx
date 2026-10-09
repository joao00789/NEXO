import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Map } from "lucide-react";

import { MindMapCreateForm } from "@/components/mindmap/mind-map-create-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserSession } from "@/lib/auth/session";
import { studyContents } from "@/lib/content/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mapas mentais" };

export default async function Page() {
  const user = await requireUserSession();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("mind_maps")
    .select("id, title, subject, topic, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  const maps = (data ?? []).filter((map) =>
    typeof map.id === "string" && typeof map.title === "string" &&
    typeof map.subject === "string" && typeof map.topic === "string" &&
    typeof map.updated_at === "string",
  );

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Mapas mentais</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Organize conceitos, exemplos e relações entre ideias para revisar os conteúdos.
        </p>
      </header>

      <MindMapCreateForm contents={studyContents} />

      {error ? (
        <div className="border-destructive/40 bg-destructive/5 rounded-lg border p-4 text-sm" role="alert">
          Não foi possível carregar seus mapas. Aplique a migration do Supabase e tente novamente.
        </div>
      ) : maps.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-44 flex-col items-center justify-center gap-3 p-6 text-center">
            <Map aria-hidden="true" className="text-muted-foreground size-8" />
            <div>
              <h2 className="font-semibold">Seus mapas aparecerão aqui</h2>
              <p className="text-muted-foreground mt-1 max-w-md text-sm">
                Escolha um dos conteúdos autorais acima para criar um mapa inicial e editar as conexões.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Seus mapas mentais">
          {maps.map((map) => (
            <Link key={map.id} href={`/app/mapas/${map.id}`} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Card className="h-full transition-colors group-hover:bg-accent/30">
                <CardHeader className="flex-row items-start justify-between">
                  <CardTitle>{map.title}</CardTitle>
                  <Badge variant="secondary">{map.subject}</Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <CalendarDays aria-hidden="true" className="size-3.5" />
                    Atualizado {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(map.updated_at))}
                  </span>
                  <ArrowRight aria-hidden="true" className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}
      <p className="text-muted-foreground text-xs">
        Os mapas iniciais são baseados nos conteúdos autorais do NEXO. Confira e ajuste o material ao seu jeito de estudar.
      </p>
    </div>
  );
}
