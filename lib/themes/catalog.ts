export const SITE_THEME_IDS = ["aurora", "nebula", "sunrise"] as const;

export type SiteThemeId = (typeof SITE_THEME_IDS)[number];

export const siteThemeIdSchema = SITE_THEME_IDS;

export const siteThemePreviews: Record<
  SiteThemeId,
  { primary: string; surface: string; glow: string }
> = {
  aurora: { primary: "#39c99a", surface: "#132a22", glow: "#39c99a" },
  nebula: { primary: "#ad8cff", surface: "#211a31", glow: "#ad8cff" },
  sunrise: { primary: "#ffad66", surface: "#302018", glow: "#ffad66" },
};
