/**
 * Central theme registry.
 * Add new themes here — no other file needs touching (CSS variables go in globals.css).
 */

export type ThemeId =
  | "light"
  | "dark"
  | "christmas"
  | "valentine"
  | "lunar-new-year";

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  emoji: string;
  /** "base" themes are always shown; "seasonal" themes appear in their own section */
  group: "base" | "seasonal";
}

export const THEMES: ThemeMeta[] = [
  { id: "light",         label: "Light",          emoji: "☀️",  group: "base"     },
  { id: "dark",          label: "Dark",            emoji: "🌙",  group: "base"     },
  { id: "christmas",     label: "Christmas",       emoji: "🎄",  group: "seasonal" },
  { id: "valentine",     label: "Valentine's Day", emoji: "🩷",  group: "seasonal" },
  { id: "lunar-new-year",label: "Lunar New Year",  emoji: "🧧",  group: "seasonal" },
];

export const BASE_THEMES    = THEMES.filter((t) => t.group === "base");
export const SEASONAL_THEMES = THEMES.filter((t) => t.group === "seasonal");
