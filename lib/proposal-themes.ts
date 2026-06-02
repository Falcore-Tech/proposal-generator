export const THEMES = [
  { id: "latte", label: "Catppuccin Latte", className: "theme-latte", scheme: "light" },
  { id: "rose-pine-dawn", label: "Rosé Pine Dawn", className: "theme-rose-pine-dawn", scheme: "light" },
  { id: "solarized-light", label: "Solarized Light", className: "theme-solarized-light", scheme: "light" },
  { id: "nord", label: "Nord", className: "theme-nord", scheme: "dark" },
  { id: "dracula", label: "Dracula", className: "theme-dracula", scheme: "dark" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME_ID: ThemeId = "latte";

export const THEME_STORAGE_KEY = "falcore-proposal-theme";

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && THEMES.some((theme) => theme.id === value);
}

export function resolveThemeId(value: string | null | undefined): ThemeId {
  return isThemeId(value) ? value : DEFAULT_THEME_ID;
}

export function classNameForTheme(id: ThemeId): string {
  return THEMES.find((theme) => theme.id === id)?.className ?? "theme-latte";
}
