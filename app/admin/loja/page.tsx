import type { Metadata } from "next";

import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Loja" };

export default function Page() {
  return (
    <Placeholder
      title="Loja"
      description="Preço, disponibilidade e eventos de itens."
    />
  );
}
