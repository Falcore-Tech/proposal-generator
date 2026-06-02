# Shared Components

Truly shared, app-wide UI lives in `components/` (root). Route-specific UI is co-located
under each route's `_components/` folder.

## Logo (`components/Logo.tsx`)

Single source of truth for the Falcore brand mark. Renders the `/logo-transparent.webp`
icon plus the `FALCORE` wordmark (Oxanium font, `var(--font-oxanium)`). Wrapped in a
`next/link` to `/` by default.

Use it instead of hand-rolling `<img>`/`<Image>` + wordmark anywhere the brand appears.

### Props

| Prop | Default | Purpose |
|---|---|---|
| `href` | `"/"` | Link target. Pass `null` to render a non-clickable `<div>`. |
| `showWordmark` | `true` | Show the `FALCORE` wordmark beside the icon. |
| `size` | `48` | Icon width/height in px (passed to `next/image`). |
| `className` | — | Classes on the wrapper (`flex items-center gap-0`). |
| `imageClassName` | — | Classes on the icon (e.g. `h-8 w-auto`). |
| `wordmarkClassName` | — | Classes on the wordmark (override color/size). |
| `priority` | `false` | Sets `next/image` `priority`. |

### Examples

```tsx
// Nav — icon only, sized to 32px
<Logo href="/proposals" size={32} imageClassName="h-8 w-auto" />

// Centered logo on auth screens
<Logo size={48} className="justify-center mb-6" imageClassName="h-12 w-auto" />

// Icon only (page already has its own title)
<Logo showWordmark={false} size={48} className="justify-center mb-6" imageClassName="h-12 w-auto" />

// Themed viewer header — wordmark inherits the proposal theme fg
<Logo size={32} imageClassName="h-8 w-auto object-contain" wordmarkClassName="text-xl text-[color:var(--fg)]" />
```

### Notes

- The wordmark font is `Oxanium`, registered in `app/layout.tsx` as `--font-oxanium`.
- PDF documents (`PrintableProposalPDF`, `PrintableAnimatedProposalPDF`) use `@react-pdf`'s
  own `Image` primitive and reference `/logo-transparent.webp` directly — they intentionally
  do **not** use this component (different renderer).
