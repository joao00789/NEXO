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
  Settings,
  ShoppingBag,
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
  { href: "/app/loja", label: "Loja", icon: ShoppingBag },
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
                ? "bg-primary/12 text-white shadow-[inset_0_0_0_1px_rgba(96,165,250,0.22)]"
                : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <item.icon
              aria-hidden
              className={cn("size-4 shrink-0", active ? "text-sky-200" : "text-slate-400")}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
