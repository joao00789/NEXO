import { cn } from "cn";

type LogoVariant = "full" | "mark";

export function Logo({
  variant = "full",
  className,
}: {
  variant?: LogoVariant;
  className?: string;
}) {
  const isFull = variant === "full";

  return (
    <svg
      aria-label="NEXO"
      className={cn(
        "text-foreground h-8 w-auto transition-transform duration-200",
        className,
      )}
      fill="none"
      height={64}
      role="img"
      viewBox={isFull ? "0 0 240 64" : "0 0 64 64"}
      width={isFull ? 240 : 64}
      xmlns="http://www.w3.org/2000/svg"
    >
      {!isFull ? <rect width="64" height="64" rx="14" fill="var(--surface)" /> : null}
      <path
        d="M10 44c5.5-3 12.5-3.6 18-.6V55c-5.5-3-12.5-2.4-18 .6V44Z"
        fill="currentColor"
      />
      <path
        d="M54 44c-5.5-3-12.5-3.6-18-.6V55c5.5-3 12.5-2.4 18 .6V44Z"
        fill="currentColor"
        opacity=".6"
      />
      <g className="text-primary" stroke="currentColor">
        <path d="M32 14v20" strokeLinecap="round" strokeWidth="4" />
        <path
          d="M24.5 21.5 32 14l7.5 7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <path d="m12 16 20-7 20 7-20 7-20-7Z" fill="currentColor" />
        <path
          d="M20 19.5v5.5c0 2.5 5.4 4.5 12 4.5s12-2 12-4.5v-5.5"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </g>
      {isFull ? (
        <text
          fill="currentColor"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="34"
          fontWeight="700"
          letterSpacing="4"
          x="76"
          y="45"
        >
          NEXO
        </text>
      ) : null}
    </svg>
  );
}
