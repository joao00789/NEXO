import type { CosmeticItem } from "@/lib/cosmetics/schemas";

import { CosmeticIcon, getCosmeticAccent } from "@/components/avatar/cosmetic-icon";
import { AnimalModelPreview } from "@/components/avatar/animal-model-preview";

export function AvatarPreview({ items, species = "fox" }: { items: CosmeticItem[]; species?: string }) {
  const byCategory = new Map(items.map((item) => [item.category, item]));
  const outfit = byCategory.get("outfit");
  const headwear = byCategory.get("headwear");
  const accessory = byCategory.get("accessory");
  const effect = byCategory.get("effect");
  const background = byCategory.get("background");
  const frame = byCategory.get("frame");
  const frameColor = frame ? getCosmeticAccent(frame.accent) : "#282A2E";

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="img"
        aria-label={`Avatar NEXO${items.length ? ` com ${items.map((item) => item.name).join(", ")}` : " padrão"}`}
        className="relative flex size-52 items-center justify-center rounded-full border-4 bg-[#111214] transition-shadow"
        style={{
          borderColor: frameColor,
          backgroundImage: background
            ? `radial-gradient(circle at 35% 25%, ${getCosmeticAccent(background.accent)}66, #111214 72%)`
            : "radial-gradient(circle at 35% 25%, #282A2E, #111214 72%)",
          boxShadow: effect ? `0 0 34px ${getCosmeticAccent(effect.accent)}99` : "0 12px 30px #0008",
        }}
      >
        <AnimalModelPreview species={species} className="size-40" />
        {outfit ? (
          <span className="absolute bottom-3 left-1/2 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-[#17181B] shadow-lg" title={outfit.name}>
            <CosmeticIcon item={outfit} className="size-5" />
          </span>
        ) : null}
        {headwear ? (
          <span className="absolute top-2 left-1/2 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-[#17181B] shadow-lg">
            <CosmeticIcon item={headwear} className="size-6" />
          </span>
        ) : null}
        {accessory ? (
          <span className="absolute right-2 bottom-12 flex size-9 items-center justify-center rounded-full border border-white/20 bg-[#17181B] shadow-lg">
            <CosmeticIcon item={accessory} className="size-5" />
          </span>
        ) : null}
        {effect ? <span className="pointer-events-none absolute inset-1 rounded-full border border-dashed" style={{ borderColor: `${getCosmeticAccent(effect.accent)}99` }} /> : null}
      </div>
      <p className="text-muted-foreground text-xs">Prévia do seu avatar</p>
    </div>
  );
}
