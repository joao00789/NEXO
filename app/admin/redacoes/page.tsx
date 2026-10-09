import type { Metadata } from "next";

import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Redações" };

export default function Page() {
  return (
    <Placeholder
      title="Redações"
      description="Estatísticas de redação e revisão de problemas."
    />
  );
}
