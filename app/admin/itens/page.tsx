import type { Metadata } from "next";

import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Itens" };

export default function Page() {
  return (
    <Placeholder
      title="Itens"
      description="Criar e gerenciar itens cosméticos."
    />
  );
}
