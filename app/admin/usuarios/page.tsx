import type { Metadata } from "next";

import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Usuários" };

export default function Page() {
  return (
    <Placeholder
      title="Usuários"
      description="Listar, pesquisar, visualizar métricas e suspender usuários."
    />
  );
}
