import type { Metadata } from "next";

import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Analytics" };

export default function Page() {
  return (
    <Placeholder
      title="Analytics"
      description="Usuários ativos, sessões, retenção e uso de IA."
    />
  );
}
