import Link from "next/link";

import { Logo } from "@/components/brand/logo";

const currentYear = new Date().getFullYear();

const columns = [
  {
    title: "Plataforma",
    links: [
      { href: "/como-funciona", label: "Como funciona" },
      { href: "/sobre", label: "Sobre" },
    ],
  },
  {
    title: "Começar",
    links: [
      { href: "/cadastro", label: "Criar conta" },
      { href: "/login", label: "Entrar" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-border bg-surface border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-muted-foreground text-sm">
            Seu caminho até o ENEM. Estude. Evolua. Conquiste.
          </p>
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title} className="flex flex-col gap-2">
            <span className="text-sm font-semibold">{column.title}</span>
            {column.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="border-border text-muted-foreground border-t px-4 py-4 text-center text-xs sm:px-6">
        © {currentYear} NEXO. Plataforma gratuita de estudo.
      </div>
    </footer>
  );
}
