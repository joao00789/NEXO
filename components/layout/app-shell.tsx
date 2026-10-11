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
    <div
      className="nexo-shell text-foreground min-h-screen"
      data-theme={activeTheme ?? "default"}
    >
        <div className="mx-auto flex min-h-screen max-w-[1800px]">
          <aside className="nexo-sidebar border-border fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r px-4 py-5 lg:flex">
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
            <header className="nexo-header border-border bg-background/85 sticky top-0 z-20 border-b px-4 py-3 backdrop-blur-xl sm:px-6">
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
                  <SheetContent
                    side="left"
                    data-theme={activeTheme ?? "default"}
                    className="nexo-sidebar w-72 p-0"
                  >
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
                  <label className="border-border bg-surface/80 text-muted-foreground flex min-w-0 flex-1 items-center gap-2 rounded-full border px-3 py-2 text-sm shadow-inner shadow-black/30">
                    <Search className="text-muted-foreground size-4" aria-hidden />
                    <input
                      aria-label="Buscar no NEXO"
                      placeholder="Buscar cursos, materiais, temas..."
                      className="text-foreground placeholder:text-muted-foreground w-full border-0 bg-transparent text-sm outline-none"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Notificações"
                    className="border-border bg-card text-muted-foreground hover:bg-accent flex size-9 items-center justify-center rounded-full border transition"
                  >
                    <Bell className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="IA assistente"
                    className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 flex size-9 items-center justify-center rounded-full border transition"
                  >
                    <Sparkles className="size-4" aria-hidden />
                  </button>
                  <div className="border-border flex items-center gap-2 rounded-full border bg-white/5 px-2 py-1.5">
                    <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-sm font-semibold">
                      {accountInitial}
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="max-w-28 truncate text-xs font-medium text-white">
                        {accountName}
                      </p>
                      <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase">
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
