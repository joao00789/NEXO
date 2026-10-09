import type { Metadata } from "next";

export function makeMetadata(title: string): Metadata {
  return { title };
}

export function Placeholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground text-sm">{description}</p>
      <div
        className="border-border bg-surface text-muted-foreground mt-8 flex min-h-40 items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm"
        role="status"
      >
        Em breve. Esta tela será implementada na fase correspondente.
      </div>
    </div>
  );
}

export function createPlaceholderPage(
  title: string,
  description: string,
): React.ComponentType {
  function Page() {
    return <Placeholder title={title} description={description} />;
  }
  Page.displayName = `Placeholder(${title})`;
  return Page;
}
