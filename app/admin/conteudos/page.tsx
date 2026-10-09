import type { Metadata } from "next";

import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Conteúdos" };

export default function Page() {
  return (
    <Placeholder
      title="Conteúdos"
      description="Revisar, editar e publicar conteúdos de estudo."
    />
  );
}
