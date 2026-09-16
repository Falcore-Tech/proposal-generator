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

export interface PdfPalette {
  bg: string;
  cardBg: string;
  elevBg: string;
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  accent: string;
  accentFg: string;
  border: string;
}

const PDF_PALETTES: Record<ThemeId, PdfPalette> = {
  "latte": { bg: "#eff2f6", cardBg: "#e5e8ed", elevBg: "#dcdfe5", fg: "#4c4e63", fgMuted: "#6d6f80", fgSubtle: "#9598a5", accent: "#882ae1", accentFg: "#eff2f6", border: "#d2d4dc" },
  "rose-pine-dawn": { bg: "#f7f1e9", cardBg: "#fdf9f4", elevBg: "#f3efec", fg: "#5d5574", fgMuted: "#7c748b", fgSubtle: "#a29ba9", accent: "#a85d6f", accentFg: "#f7f1e9", border: "#dbd5d4" },
  "solarized-light": { bg: "#faf5e6", cardBg: "#ede8d9", elevBg: "#e5e1d3", fg: "#657578", fgMuted: "#838f8e", fgSubtle: "#a8afaa", accent: "#2d86c8", accentFg: "#faf5e6", border: "#dfded2" },
  "nord": { bg: "#2b303b", cardBg: "#3b404b", elevBg: "#454a55", fg: "#e8ebef", fgMuted: "#c2c6cb", fgSubtle: "#93979e", accent: "#82c3d3", accentFg: "#2b303b", border: "#4d525b" },
  "dracula": { bg: "#2a2a37", cardBg: "#41414f", elevBg: "#4c4c59", fg: "#f5f5f1", fgMuted: "#cccccc", fgSubtle: "#9a9a9d", accent: "#b58bf9", accentFg: "#2a2a37", border: "#4f4f58" },
};

export function pdfPaletteForTheme(id: ThemeId): PdfPalette {
  return PDF_PALETTES[id];
}
