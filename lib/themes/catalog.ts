export const SITE_THEME_IDS = [
  "aurora",
  "nebula",
  "sunrise",
  "ocean",
  "sakura",
  "cyber",
  "volcano",
  "crystal",
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
};
