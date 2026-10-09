import type { Metadata } from "next";

import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Temas" };

export default function Page() {
  return (
    <Placeholder
      title="Temas"
      description="Gerenciar temas de redação e verificação de fatos."
    />
  );
}
