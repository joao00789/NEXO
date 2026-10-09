import type { Metadata } from "next";

import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Painel administrativo" };

export default function Page() {
  return (
    <Placeholder
      title="Painel administrativo"
      description="Gestão de usuários, conteúdo, questões, IA, loja e métricas."
    />
  );
}
