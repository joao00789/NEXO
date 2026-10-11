"use client";

import * as React from "react";
import { cn } from "cn";
import { FlameWrap } from "@/components/canvasui/FlameWrap";
import { useSiteThemeEffects } from "@/components/layout/site-theme-effects";

const flameThemeColors: Record<string, [number, number, number]> = {
  volcano: [1, 0.24, 0.04],
  crimson: [1, 0.12, 0.22],
  "black-rose": [1, 0.12, 0.5],
};

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  const theme = useSiteThemeEffects();
  const flameColor = flameThemeColors[theme ?? ""];
  const card = (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card bg-card text-card-foreground ring-foreground/10 flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl py-(--card-spacing) text-sm ring-1 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className,
      )}
      {...props}
    />
  );

  if (!flameColor) return card;

  return (
    <FlameWrap
      className="nexo-flame-card"
      color={flameColor}
      intensity={0.9}
      height={52}
      spread={7}
      radius={12}
      speed={0.7}
      scale={0.52}
      turbulence={0.62}
      turbulenceScale={0.65}
      turbulenceReach={18}
      sparks={0.85}
      sparkSize={0.4}
      sparkDensity={0.7}
      sparkSpeed={0.75}
      rim={2.1}
      melt={1.5}
      distortion={3}
      smoke={0.25}
      ember={1.2}
      scorch={0}
    >
      {card}
    </FlameWrap>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "bg-muted/50 flex items-center rounded-b-xl border-t p-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
