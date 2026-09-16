# Project: Falcore Proposal Generator

## Overview
- **Type**: Next.js App Router web app + MCP server
- **Stack**: Next.js 15, React 19, Tailwind v4, Neon Postgres + Drizzle ORM, Neon Auth (Better Auth), @react-pdf/renderer, @modelcontextprotocol/sdk
- **Package Manager**: bun
- **Started**: 2026 (see git history)

## Architecture Decisions
- **Database**: Neon (Lakebase Postgres) via `drizzle-orm/neon-http`. Schema in `lib/db/schema.ts` (property names are snake_case on purpose so rows match the `AnimatedProposal` API shape 1:1). Shared queries in `lib/db/queries/`. Apply schema changes with `bunx drizzle-kit push` (reads `DATABASE_URL_UNPOOLED` from env).
- **Auth**: Neon Auth (`@neondatabase/auth`). Server instance `lib/auth/server.ts`, client `lib/auth/client.ts`, proxy at `app/api/auth/[...path]`, `middleware.ts` guards admin routes. App role (`admin` / `sales_rep` / `deactivated`) lives in `profiles`, keyed by the Neon Auth user id (text, not uuid). A signed-in user without a `profiles` row is `unprovisioned` → `/unauthorized`.
- **Authorization** is enforced in route handlers/server actions (`requireAuth` / `requireAdmin` / `requireAdminRole`), not RLS. Client components never touch the DB directly.
- Creating sales reps calls `auth.admin.createUser`, which needs the calling user to have the Neon Auth `admin` role (set in Neon Console → Auth → Users, or `neon neon-auth user`).
- Why Neon: Supabase free tier pauses after inactivity and needs a manual restore; Neon scales to zero but auto-resumes.
- Animated proposals only; the "normal" proposal flow is retired (`components/proposal/PrintableProposalPDF.tsx`, `ProposalCTA.tsx` are legacy).
- Proposals are created and edited through the MCP server at `app/api/mcp/route.ts` (bearer `MCP_API_KEY`). Never re-create a proposal to change content — `update_animated_proposal` accepts every field.
- Themes live in `lib/proposal-themes.ts`; CSS tokens in `app/globals.css`, hex `PDF_PALETTES` for react-pdf. Keep both in sync.
- Bank/payment details come from `lib/payment-details.ts` only. Never hardcode them in a component.

## Preferences & Rules
- Do not run prettier on this repo; it is not configured and reformats whole files.
- Repo is linked to Vercel project `proposal-generator` (team `faeziixs-projects`). Neon vars are managed by the Vercel↔Neon integration; `NEON_AUTH_COOKIE_SECRET` and `MCP_API_KEY` are set manually with `vercel env`.

## Learnings & Corrections
- ❌ Rebrand commit removed `filteredPackages` but left a reference → ✅ `next.config.ts` has `ignoreBuildErrors`/`ignoreDuringBuilds` on, so always run `bunx tsc --noEmit` on touched files; the build will not catch errors.
- ❌ `z.object(shape).partial()` still applies `.default()` values → ✅ strip defaults (`removeDefault()`) when deriving an update schema, or omitted fields get reset.
- ❌ Edited the proposal from the URL the user pasted → ✅ list proposals first; the same client often has several versions and the live one may differ (`status: sent`, non-archived).
- ❌ react-pdf `<Image>` silently drops `.webp` and missing files → ✅ use PNG/JPG in `public/`; `/falcore-company-stamp.png` is referenced but does not exist.
- ❌ Zod `z.string().uuid()` on user ids → ✅ Neon Auth ids are not UUIDs; validate as non-empty strings.
- ❌ Supabase `updated_at` triggers are gone → ✅ `$onUpdate` in the Drizzle schema bumps `updated_at`.

## SEO / Social
- Site-wide metadata constants in `lib/site.ts`; root `app/layout.tsx` sets `metadataBase`, OG and Twitter defaults.
- OG images are generated with `next/og` via `lib/og-image.tsx` (`renderOgImage`), used by `app/opengraph-image.tsx` (default) and `app/proposal/[token]/opengraph-image.tsx` (per-proposal). Falcon mark lives at `public/falcore-mark.png`.
- Public proposal pages are `noindex`.

## Component Registry
- `components/animated-proposal/PrintableAnimatedProposalPDF.tsx` — themed PDF; `AnimatedPrintButton.tsx` wraps it.
- `app/proposal/[token]/_components/*` — public viewer sections.
- `components/proposal/AnimatedProposalForm.tsx` — admin edit form.

## Current State
- MCP: create/update/list/get proposals, packages, T&C templates, backed by Drizzle/Neon.
- Migrated off Supabase on 2026-09-16 (data imported with `scripts/import-supabase-export.ts`; Supabase user ids remapped to Neon Auth ids).
