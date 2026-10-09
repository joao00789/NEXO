import type { Metadata } from "next";

import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Questões" };

export default function Page() {
  return (
    <Placeholder
      title="Questões"
      description="Revisar, editar, aprovar e arquivar questões."
    />
  );
}
