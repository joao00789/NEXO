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
}: {
  children: React.ReactNode;
  account: { fullName: string | null; level: number } | null;
}) {
  const accountName = account?.fullName?.trim() || "Estudante";
  const accountInitial = accountName.charAt(0).toLocaleUpperCase("pt-BR");

  return (
    <div className="min-h-screen bg-[#090d18] text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border bg-[linear-gradient(180deg,_rgba(17,18,23,0.94),_rgba(11,13,20,0.98))] px-4 py-5 lg:flex">
          <div className="mb-5 flex h-14 items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3">
            <Link href="/" aria-label="NEXO — início" className="flex items-center">
              <Logo />
            </Link>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-sky-200">
              IA
            </span>
          </div>

          <div className="flex-1 overflow-y-auto rounded-2xl border border-white/5 bg-black/10 p-3">
            <NavList />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
          <header className="sticky top-0 z-20 border-b border-border bg-[#090d18]/80 px-4 py-3 backdrop-blur-xl sm:px-6">
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
                <SheetContent side="left" className="w-72 p-0 bg-[#0d1220]">
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
                  <Search className="size-4 text-slate-400" aria-hidden />
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
                  className="flex size-9 items-center justify-center rounded-full border border-border bg-white/5 text-slate-200 transition hover:bg-white/10"
                >
                  <Bell className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="IA assistente"
                  className="flex size-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sky-200 transition hover:bg-primary/20"
                >
                  <Sparkles className="size-4" aria-hidden />
                </button>
                <div className="flex items-center gap-2 rounded-full border border-border bg-white/5 px-2 py-1.5">
                  <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-400 text-sm font-semibold text-white">
                    {accountInitial}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="max-w-28 truncate text-xs font-medium text-white">{accountName}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
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

          <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
