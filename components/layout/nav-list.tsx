"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Home,
  ListChecks,
  Map,
  PenLine,
  Palette,
  Settings,
  Swords,
  Target,
  Timer,
  User,
} from "lucide-react";

import { cn } from "cn";

export const navItems = [
  { href: "/app", label: "Início", icon: Home },
  { href: "/app/questoes", label: "Questões", icon: ListChecks },
  { href: "/app/conteudos", label: "Conteúdos", icon: BookOpen },
  { href: "/app/redacao", label: "Redação", icon: PenLine },
  { href: "/app/mapas", label: "Mapas mentais", icon: Map },
  { href: "/app/simulados", label: "Simulados", icon: Timer },
  { href: "/app/desempenho", label: "Desempenho", icon: BarChart3 },
  { href: "/app/missoes", label: "Missões", icon: Target },
  { href: "/app/avatar", label: "Avatar", icon: User },
  { href: "/app/batalhas", label: "Batalhas", icon: Swords },
  { href: "/app/loja", label: "Temas", icon: Palette },
  { href: "/app/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação do app" className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active =
          item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-primary/12 text-foreground shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--primary)_28%,transparent)]"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.icon
              aria-hidden
              className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
