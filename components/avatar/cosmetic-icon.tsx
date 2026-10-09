import {
  Award,
  Backpack,
  BookOpen,
  Crown,
  Glasses,
  GraduationCap,
  Headphones,
  Shirt,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type { CosmeticItem } from "@/lib/cosmetics/schemas";

const icons: Record<CosmeticItem["icon"], LucideIcon> = {
  "graduation-cap": GraduationCap,
  shirt: Shirt,
  glasses: Glasses,
  headphones: Headphones,
  sparkles: Sparkles,
  library: BookOpen,
  award: Award,
  crown: Crown,
  backpack: Backpack,
};

const accents: Record<CosmeticItem["accent"], string> = {
  blue: "#2E6BFF",
  cyan: "#22D3EE",
  violet: "#A78BFA",
  teal: "#2DD4BF",
  amber: "#FBBF24",
  rose: "#FB7185",
};

export function CosmeticIcon({ item, className }: { item: Pick<CosmeticItem, "icon" | "accent">; className?: string }) {
  const Icon = icons[item.icon];
  return <Icon aria-hidden="true" className={className} style={{ color: accents[item.accent] }} />;
}

export function getCosmeticAccent(accent: CosmeticItem["accent"]) {
  return accents[accent];
}
