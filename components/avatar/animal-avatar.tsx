import Image from "next/image";

import { ANIMAL_CATALOG, ANIMAL_IDS } from "@/lib/animals/catalog";

export function AnimalAvatar({ species = "fox", className = "size-40" }: { species?: string; className?: string }) {
  const safeSpecies = ANIMAL_IDS.includes(species) ? species : "fox";
  const label = ANIMAL_CATALOG.find((animal) => animal.id === safeSpecies)?.name ?? "Raposa";
  return <Image
    src={`/avatar/Previews/animal-${safeSpecies}.png`}
    alt={`Pet NEXO: ${label}`}
    width={256}
    height={256}
    draggable={false}
    className={`object-contain ${className}`}
  />;
}
