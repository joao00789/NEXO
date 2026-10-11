"use client";

import { createContext, useContext } from "react";

const SiteThemeContext = createContext<string | null>(null);

export function SiteThemeEffectsProvider({
  theme,
  children,
}: {
  theme: string | null;
  children: React.ReactNode;
}) {
  return (
    <SiteThemeContext.Provider value={theme}>{children}</SiteThemeContext.Provider>
  );
}

export function useSiteThemeEffects() {
  return useContext(SiteThemeContext);
}
