"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeId } from "@/lib/themes";

const THEME_IDS: ThemeId[] = [
  "light",
  "dark",
  "christmas",
  "valentine",
  "lunar-new-year",
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      themes={THEME_IDS}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
