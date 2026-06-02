# Proposal Viewer Typography

The public animated proposal viewer (`/proposal/[token]`) renders every piece of text through a
small set of primitives in `app/proposal/[token]/_components/_ui/`. Sections never set
`fontSize` / `fontFamily` / `tracking` inline; they pick a role and the primitive reads the token.

## Decision

**Headings are serif display italic, everywhere.** There is one heading voice (Fraunces, italic) at
every size, from the hero title down to card and clause titles. Body copy, eyebrows, labels, and
captions are the sans body font (Geist). The personal greeting is the script font (Caveat).

## Tokens

Defined on `.theme-animated` in `app/globals.css` (structural, never overridden per theme):

`--font-display` (serif) · `--font-body` (sans) · `--font-script` · `--fs-eyebrow` · `--fs-caption`
· `--fs-body` · `--fs-lead` · `--fs-h3` · `--fs-h2` · `--fs-h1` · `--fs-script(-sm)` · `--fs-numeral`
· `--fs-display` · `--tracking-eyebrow` (0.25em) · `--tracking-tight` (-0.03em).

## Roles

| Role | Primitive | Font | Size token | Weight |
|---|---|---|---|---|
| display | `Heading size="display"` | display italic | `--fs-display` | 300 |
| numeral | `Heading size="numeral"` | display italic | `--fs-numeral` | 300 |
| numeral-sm | `Heading size="numeral-sm"` | display italic | `--fs-h3` | 300 |
| h1 | `Heading size="h1"` | display italic | `--fs-h1` | 400 |
| h2 (section statement) | `Heading size="h2"` | display italic | `--fs-h2` | 400 |
| h3 (card / item title) | `Heading size="h3"` | display italic | `--fs-h3` | 400 |
| script | `Heading font="script" size="script(-sm)"` | script | `--fs-script(-sm)` | 400 |
| eyebrow / label | `Eyebrow` | body | `--fs-eyebrow` | 500 |
| lead | `Text variant="lead"` | body | `--fs-lead` | 400 |
| body | `Text variant="body"` | body | `--fs-body` | 400 |
| caption | `Text variant="caption"` | body | `--fs-caption` | 400 |

**Weight rule: bigger = lighter.** Oversized display / numeral figures (including the investment
prices) use weight 300; heading sizes h1–h3 use 400; eyebrows use 500 (`font-medium`). The price
figures pass `weight={300}` explicitly because they are numeral-voice figures rendered at h1/h2 size.

## Section header

Every content section opens with the same block via **`SectionHeader`** (`_ui/SectionHeader.tsx`):
an **accent** `Eyebrow` (kicker) + a serif-italic `Heading size="h2"` title + an optional muted
`Text variant="lead"` description. This keeps the eyebrow / title / description identical across
Challenge, Solution, Scope, Timeline, Investment, Terms, and the Signature sign state. Titles and
descriptions are fixed copy in the component except where the data carries them (Solution uses
`solution_intro`, Scope uses `scope_phase_name` / `scope_subtitle`).

Exceptions by design: `PersonalProblem` (handwritten script note) and `GuaranteeSection` (full-bleed
accent statement, where an accent eyebrow would be invisible on the accent background).

## Primitives

- **`Heading`** — `as`, `font` (default `display`), `size`, `italic` (defaults true for the display
  font), `weight` (defaults from the size). Applies `--tracking-tight` to all heading sizes.
- **`Eyebrow`** — the single source for every kicker, field label, and small uppercase tag. Forwards a
  ref and merges `style` so callers can recolor (e.g. on the accent-washed Guarantee section). Override
  spacing / opacity with `className` (e.g. `mb-0`, `opacity-40`).
- **`Text`** — `variant` (`lead` / `body` / `caption`), `as`, `muted` (applies `opacity-55`). Bold
  emphasis inside body copy is a `font-semibold` / `font-medium` className modifier, which is allowed.
- **`Button`** — size text utilities map to `--fs-caption` / `--fs-body` / `--fs-lead`.

## Out of scope

`ThemeSwitcher` (preview-only control) and `StatusPill` (admin badge) are chrome, not proposal
content, and keep their own small Tailwind sizes. `PersonalProblem` already used `Heading` and is
unchanged. `WelcomeOverlay` keeps its fixed dark cinematic background by design.

See `docs/theming.md` for the per-theme color-token contract; type tokens are structural and shared
across all themes.
