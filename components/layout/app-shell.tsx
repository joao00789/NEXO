"use client";

import Link from "next/link";
import { Bell, LogOut, Menu, Search, Sparkles } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { NavList } from "@/components/layout/nav-list";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AppShell({
  children,
  account,
  activeTheme,
}: {
  children: React.ReactNode;
  account: { fullName: string | null; level: number } | null;
  activeTheme: string | null;
}) {
  const accountName = account?.fullName?.trim() || "Estudante";
  const accountInitial = accountName.charAt(0).toLocaleUpperCase("pt-BR");

  return (
    <div className="nexo-shell min-h-screen text-foreground" data-theme={activeTheme ?? "default"}>
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="nexo-sidebar fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border px-4 py-5 lg:flex">
          <div className="mb-5 flex h-14 items-center rounded-2xl border border-white/10 bg-white/5 px-3">
            <Link href="/" aria-label="NEXO — início" className="flex items-center">
              <Logo />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto rounded-2xl border border-white/5 bg-black/10 p-3">
            <NavList />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
          <header className="nexo-header sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="lg:hidden"
                      aria-label="Abrir menu de navegação"
                    />
                  }
                >
                  <Menu />
                </SheetTrigger>
                <SheetContent side="left" className="nexo-sidebar w-72 p-0">
                  <SheetHeader className="border-border border-b p-4">
                    <SheetTitle>
                      <Link href="/" aria-label="NEXO — início">
                        <Logo />
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="overflow-y-auto p-3">
                    <NavList />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex min-w-0 flex-1 items-center gap-3">
                <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-2 text-sm text-muted-foreground shadow-inner shadow-black/30">
                  <Search className="size-4 text-muted-foreground" aria-hidden />
                  <input
                    aria-label="Buscar no NEXO"
                    placeholder="Buscar cursos, materiais, temas..."
                    className="w-full border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Notificações"
                  className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-accent"
                >
                  <Bell className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="IA assistente"
                  className="flex size-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary transition hover:bg-primary/20"
                >
                  <Sparkles className="size-4" aria-hidden />
                </button>
                <div className="flex items-center gap-2 rounded-full border border-border bg-white/5 px-2 py-1.5">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {accountInitial}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="max-w-28 truncate text-xs font-medium text-white">{accountName}</p>
                    <p                     className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {account ? `Nível ${account.level}` : "Nível indisponível"}
                    </p>
                  </div>
                </div>
              </div>

              <form action={signOutAction} className="hidden sm:block">
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut aria-hidden />
                  <span>Sair</span>
                </Button>
              </form>
            </div>
          </header>

          <main className="nexo-themed-content w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
