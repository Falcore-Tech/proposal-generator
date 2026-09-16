# Project: Falcore Proposal Generator

## Overview
- **Type**: Next.js App Router web app + MCP server
- **Stack**: Next.js 15, React 19, Tailwind v4, Supabase, @react-pdf/renderer, @modelcontextprotocol/sdk
- **Package Manager**: bun
- **Started**: 2026 (see git history)

## Architecture Decisions
- Animated proposals only; the "normal" proposal flow is retired (`components/proposal/PrintableProposalPDF.tsx`, `ProposalCTA.tsx` are legacy).
- Proposals are created and edited through the MCP server at `app/api/mcp/route.ts` (bearer `MCP_API_KEY`). Never re-create a proposal to change content — `update_animated_proposal` accepts every field.
- Themes live in `lib/proposal-themes.ts`; CSS tokens in `app/globals.css`, hex `PDF_PALETTES` for react-pdf. Keep both in sync.
- Bank/payment details come from `lib/payment-details.ts` only. Never hardcode them in a component.

## Preferences & Rules
- Do not run prettier on this repo; it is not configured and reformats whole files.
- Deployment env vars (Supabase keys, `MCP_API_KEY`) are set in the Vercel dashboard; repo is not linked to the CLI.

## Learnings & Corrections
- ❌ Rebrand commit removed `filteredPackages` but left a reference → ✅ `next.config.ts` has `ignoreBuildErrors`/`ignoreDuringBuilds` on, so always run `bunx tsc --noEmit` on touched files; the build will not catch errors.
- ❌ `z.object(shape).partial()` still applies `.default()` values → ✅ strip defaults (`removeDefault()`) when deriving an update schema, or omitted fields get reset.
- ❌ Edited the proposal from the URL the user pasted → ✅ list proposals first; the same client often has several versions and the live one may differ (`status: sent`, non-archived).
- ❌ react-pdf `<Image>` silently drops `.webp` and missing files → ✅ use PNG/JPG in `public/`; `/falcore-company-stamp.png` is referenced but does not exist.
- `types/supabase.ts` is generated; the Supabase CLI can append an update notice to it — strip it or `tsc` fails.

## Component Registry
- `components/animated-proposal/PrintableAnimatedProposalPDF.tsx` — themed PDF; `AnimatedPrintButton.tsx` wraps it.
- `app/proposal/[token]/_components/*` — public viewer sections.
- `components/proposal/AnimatedProposalForm.tsx` — admin edit form.

## Current State
- MCP: create/update/list/get proposals, packages, T&C templates. Live endpoint 500s until `SUPABASE_SERVICE_SECRET_KEY` is set on Vercel.
