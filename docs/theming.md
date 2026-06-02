# Proposal Viewer Theming

The public animated proposal viewer (`/proposal/[token]`) is themed entirely through CSS
custom properties on the `.theme-animated` wrapper. A theme is a single block of color-token
overrides — no component-level color edits are ever needed, because every section reads from
the tokens and derives tints via `oklch(from var(--accent) l c h / α)`.

## Token contract

Defined in `app/globals.css` on `.theme-animated`. Structural tokens (fonts, type scale,
spacing, radius, z-index, motion) live on the base class and never change per theme. The type scale
and the primitives that consume it are documented separately in [`typography.md`](./typography.md).
Only these **color tokens** are overridden per theme:

| Token | Role |
|---|---|
| `--bg` | page background |
| `--fg` | primary text |
| `--muted` | card / surface fill |
| `--border` / `--border-strong` | hairlines |
| `--accent` | brand accent (drives Hero gradient, buttons, timeline, card tints) |
| `--accent-2` | secondary accent |
| `--accent-warm` | warm accent |
| `--accent-danger` | challenge / error accent |
| `color-scheme` | `light` or `dark` (native form controls / scrollbars) |

All values are authored in **oklch** to match the existing palette convention.

## Bundled themes

Each is a class applied **alongside** `.theme-animated` (e.g. `theme-animated theme-dracula`):

| id | class | mode | source palette |
|---|---|---|---|
| `latte` (default) | `.theme-latte` | light | Catppuccin Latte |
| `rose-pine-dawn` | `.theme-rose-pine-dawn` | light | Rosé Pine Dawn |
| `solarized-light` | `.theme-solarized-light` | light | Solarized Light |
| `nord` | `.theme-nord` | dark | Nord |
| `dracula` | `.theme-dracula` | dark | Dracula |

The registry is the shared module `lib/proposal-themes.ts` (`THEMES`, `ThemeId`,
`DEFAULT_THEME_ID`, `THEME_STORAGE_KEY`, `isThemeId`, `resolveThemeId`, `classNameForTheme`). It is
the single source of truth for the viewer, the switcher, the settings page, the API, and the MCP
tools. `app/proposal/[token]/_components/_lib/themes.ts` re-exports it for the viewer.

## How a theme is chosen

Persistence: two DB sources (added by migration `20260525000000_proposal_theme.sql`):

- **Global default** — `app_settings.proposal_theme` (single-row table). Set from the **Settings
  page** (`/settings`, any logged-in user). Every public proposal link renders this.
- **Per-proposal override** — `animated_proposals.theme` (nullable). When set, it beats the global
  default for that one proposal. Settable via the MCP `create_animated_proposal` /
  `update_animated_proposal` `theme` field.

The viewer (`app/proposal/[token]/page.tsx`) resolves, highest first:

1. `?theme=<id>` query param (explicit, for trying out)
2. per-proposal `proposal.theme`
3. global `app_settings.proposal_theme`
4. `DEFAULT_THEME_ID` (hardcoded fallback; also used if the table read fails pre-migration)

`localStorage` only applies in **switcher mode** (`?preview=1` or `?themes=1`) and never overrides a
DB-resolved theme for normal client views.

### The live switcher

`ThemeSwitcher` (`_components/ThemeSwitcher.tsx`) is a floating pill (bottom-left) shown only when
**`?preview=1`** (logged-in preview) **or `?themes=1`** (any public link, no auth). It flips the
theme live and persists the pick to `localStorage["falcore-proposal-theme"]` for the next visit in
switcher mode. Plain client links never show it.

### Settings page

`/settings` (`app/(admin)/settings/page.tsx`) shows the 5 themes as live preview cards and saves
the chosen global default via `app/api/settings/route.ts` (`GET` / `PATCH`, RLS-guarded). Linked
from the Navbar profile dropdown.

## Adding a theme

1. Add a `.theme-animated.theme-<id>` block in `app/globals.css` overriding the color tokens
   (+ `color-scheme`). Light themes use `oklch(0 0 0 / 0.1)` borders; dark themes use
   `oklch(1 0 0 / 0.1)`.
2. Append an entry to `THEMES` in `lib/proposal-themes.ts`.
3. Add the id to the `is_valid_proposal_theme()` SQL check (new migration) so the DB accepts it.

## Database

Requires migration `supabase/migrations/20260525000000_proposal_theme.sql`:
`animated_proposals.theme` column + `app_settings` singleton (RLS: anon `select`, authenticated
`update`). Apply it before the settings page / per-proposal override work; until then the viewer
falls back to `DEFAULT_THEME_ID`.

## Note

The `WelcomeOverlay` intro keeps its own fixed dark cinematic background by design; it is not
themed and fades out after ~3.4s (or on click/keypress).
