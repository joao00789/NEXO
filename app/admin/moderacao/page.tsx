import type { Metadata } from "next";

import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Moderação" };

export default function Page() {
  return (
    <Placeholder
      title="Moderação"
      description="Reports, denúncias e ações de moderação."
    />
  );
}
