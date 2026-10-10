export const SITE_THEME_IDS = [
  "aurora",
  "nebula",
  "sunrise",
  "ocean",
  "sakura",
  "cyber",
  "volcano",
  "crystal",
  "obsidian",
  "forest",
  "amethyst",
  "crimson",
  "black",
  "black-neon",
  "black-emerald",
  "black-rose",
] as const;

export type SiteThemeId = (typeof SITE_THEME_IDS)[number];

export const siteThemeIdSchema = SITE_THEME_IDS;

export const siteThemePreviews: Record<
  SiteThemeId,
  { primary: string; surface: string; glow: string }
> = {
  aurora: { primary: "#39c99a", surface: "#132a22", glow: "#39c99a" },
  nebula: { primary: "#ad8cff", surface: "#211a31", glow: "#ad8cff" },
  sunrise: { primary: "#ffad66", surface: "#302018", glow: "#ffad66" },
  ocean: { primary: "#36c5e8", surface: "#102432", glow: "#1689d4" },
  sakura: { primary: "#ff8eb4", surface: "#2b1726", glow: "#ed5e9c" },
  cyber: { primary: "#f2df55", surface: "#20220f", glow: "#c3ff36" },
  volcano: { primary: "#ff765e", surface: "#2b1715", glow: "#ff421f" },
  crystal: { primary: "#83a8ff", surface: "#171d32", glow: "#9d7cff" },
  obsidian: { primary: "#a8b2c3", surface: "#1a1d24", glow: "#65748b" },
  forest: { primary: "#5fd6a0", surface: "#14251e", glow: "#2fa878" },
  amethyst: { primary: "#bd91ff", surface: "#21182e", glow: "#8b5bd6" },
  crimson: { primary: "#ff7188", surface: "#29151c", glow: "#d64560" },
  black: { primary: "#d4d4d8", surface: "#09090b", glow: "#73737d" },
  "black-neon": { primary: "#42e8f5", surface: "#05090d", glow: "#087caa" },
  "black-emerald": { primary: "#4de6a1", surface: "#050b08", glow: "#087b4b" },
  "black-rose": { primary: "#ff5da2", surface: "#0b0509", glow: "#9b174f" },
};
