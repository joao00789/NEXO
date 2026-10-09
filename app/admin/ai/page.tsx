import type { Metadata } from "next";

import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "IA" };

export default function Page() {
  return (
    <Placeholder
      title="IA"
      description="Uso, erros, latência, provedor e modelo."
    />
  );
}
