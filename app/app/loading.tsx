import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto w-full max-w-[1600px] space-y-6"
      role="status"
    >
      <span className="sr-only">Carregando conteúdo...</span>
      <section className="space-y-3">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-full max-w-md" />
      </section>
      <section className="theme-hero border-border grid gap-4 rounded-[28px] border p-5 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-72 rounded-[24px]" />
        <Skeleton className="h-72 rounded-[24px]" />
      </section>
    </div>
  );
}
