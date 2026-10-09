import type { Metadata } from "next";

import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Missões" };

export default function Page() {
  return (
    <Placeholder
      title="Missões"
      description="Criar, ativar e desativar missões."
    />
  );
}
