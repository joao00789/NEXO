import { cn } from "cn";

type LogoVariant = "full" | "mark";

const src: Record<LogoVariant, { src: string; width: number }> = {
  full: { src: "/brand/logo-horizontal.svg", width: 120 },
  mark: { src: "/brand/logo-symbol.svg", width: 32 },
};

export function Logo({
  variant = "full",
  className,
}: {
  variant?: LogoVariant;
  className?: string;
}) {
  const asset = src[variant];

  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG estático de marca; otimização não se aplica
    <img
      src={asset.src}
      alt="NEXO"
      width={asset.width}
      height={32}
      className={cn("h-8 w-auto", className)}
      draggable={false}
    />
  );
}