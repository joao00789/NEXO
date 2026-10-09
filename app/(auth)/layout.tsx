import Link from "next/link";

import { Logo } from "@/components/brand/logo";

const currentYear = new Date().getFullYear();

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-4 py-12">
      <Link href="/" aria-label="NEXO — início">
        <Logo />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <p className="text-muted-foreground text-center text-xs">
        © {currentYear} NEXO · Estudo gratuito para o ENEM
      </p>
    </div>
  );
}
