---
name: animated-proposal-xma
description: Creates a personalized animated proposal website for XMA or XMA Media prospects via the xma-proposals MCP server. Use this skill whenever a sales rep wants to generate, create, build, or draft a proposal, animated proposal, or client proposal — even if they don't say "animated". Runs a section-by-section interview (identity, problems, solutions, scope, timeline, commercials, guarantee, T&C) before calling any MCP tools, then submits with one tool call and returns a live URL.
---

# Animated Proposal — XMA / XMA Media

Create a highly personalized animated proposal website for an XMA or XMA Media prospect. Proposals live at `https://xma-proposal-generator.vercel.app/proposal/<token>` immediately after creation.

## Prerequisites

Connect via the Claude.ai connector (OAuth) or add manually:

```bash
claude mcp add --transport http xma-proposals https://xma-proposal-generator.vercel.app/api/mcp
```

Get your API key from `/admin/mcp-keys` in the admin dashboard.

## Quick Start

1. Tell Claude you want to create a proposal and whether you have a call transcript.
2. Claude interviews you section-by-section before calling any tools.
3. Review the drafted JSON payload — correct anything off.
4. Claude submits. You get a live URL (admin must approve before sharing).

## Full Workflow

### Step 0: Extract then gap-fill

Read everything available — the transcript, conversation history, any files shared. Extract every field you can confidently determine. Then ask **only** about what's genuinely missing or ambiguous. Never ask about something you can already answer.

Group the gaps into one message, organised by topic. Don't send multiple rounds of questions if you can batch them. If the transcript is rich, you might need zero questions before proceeding.

**Fields to resolve before calling any MCP tool:**

| Field | Why it matters |
|---|---|
| Client first + last name (correct spelling) | Goes on the proposal verbatim |
| Company name | Legal vs trading — confirm if unclear |
| Brand — XMA or XMA Media | Drives theme + T&C template (default: XMA Media) |
| Rep's name (provider name) | Appears as signatory |
| Top 3 pain points — **specific** tool/process/team + any cost figure mentioned | Schema requires exactly 3; must not be generic |
| Top 3 desired outcomes (mirroring pains) | Schema requires exactly 3 |
| Phase 1 deliverables — 8–16 specific items | Scope section |
| Timeline milestones in order — label, what's delivered, **which cumulative business day from kickoff** (Day 1 = kickoff) | Schema enforces Day 1 anchor + strictly increasing |
| Total project length in business days | `total_days` field |
| Total investment — amount + currency (AED or USD) | Required, integer cents |
| Payment split — upfront milestone amount | `milestone_cents` |
| Monthly retainer — amount + services (or none) | Optional |
| Guarantee wording — verbatim if promised, else omit | Don't invent |
| Client obligations for Clause 03 — specific assets/access | Customize T&C; don't leave generic |
| Proposal expiry | `expires_at` |

Fields you can usually derive without asking: project title (from scope), slug (auto-generate), `agency_name` (from brand), `scope_phase_name`/`scope_subtitle` (from deliverables), `intro_paragraph`/`challenge_intro`/`solution_intro` (from transcript).

---

### Step 1: Ground in catalog

After A–G is complete, call MCP tools to load structured context:

```
list_packages({ brand })          → find candidate package by price/features
get_package({ id })               → read features array for scope/solution grounding
list_tos_templates({ brand })     → list available T&C templates
get_tos_template({ id })          → load full clauses → use mapped_clauses as terms[]
list_snippets({ category })       → load problem/solution/guarantee copy bank
```

Pick the closest standard package. If nothing fits → `package_id: null` (custom).
Pick the T&C template matching brand + payment type. Load its `mapped_clauses` directly as the `terms[]` array — then customize Clause 03 (Client Obligations) with the specific assets/access from Group F Q24.

---

### Step 2: Draft the variables

Every piece of content must come from the interview, transcript, snippets, or package features — zero invention.

| Variable | Source |
|---|---|
| `client_first_name` | Group A Q1 |
| `client_full_name` | Group A Q1 |
| `company_name` | Group A Q2 |
| `project_title` | Group A Q6 |
| `provider_name` | Group A Q5 |
| `agency_name` | "XMA Media" or "XMA Agency" |
| `intro_paragraph` | 2–3 sentences referencing specific call details |
| `challenge_intro` | 1 sentence, lead with dollar or opportunity impact |
| `problems[3]` | Group B Q7 — 3 pains, {title, desc, icon_key} — draw from snippets |
| `solution_intro` | 1 sentence connecting solution to their specific problem |
| `solutions[3]` | Group C Q10 — 3 solutions mirroring problems, {title, desc, icon_key} — draw from snippets |
| `scope_phase_name` | "Phase 1: Foundation" or similar |
| `scope_subtitle` | One-line phase description |
| `scope_items[]` | Group C Q11 — 8–16 deliverables |
| `timeline_nodes[]` | Group D Q16 — cumulative business days from kickoff, Day 1 = kickoff, strictly increasing |
| `total_days` | Group D Q15 — total project length in business days |
| `retainer_bullets[]` | Group E Q20 — ongoing services if retainer agreed |
| `total_price_cents` | Group E Q18 — investment in cents (AED 15,000 = 1500000) |
| `milestone_cents` | Group E Q19 — upfront milestone in cents |
| `retainer_price_cents` | Group E Q20 — monthly retainer in cents (if applicable) |
| `guarantee_text` | Group F Q22 — verbatim or from snippets |
| `terms[]` | Group F Q23 — `get_tos_template().mapped_clauses`, customize clause 03 with Group F Q24 |
| `stripe_link` | Group E Q21 — payment URL (omit if not provided) |
| `package_id` | UUID from `list_packages`, or null |
| `tos_template_id` | UUID from `list_tos_templates` |
| `expires_at` | Group G Q25 — ISO datetime |
| `slug` | Group G Q26 |

**Timeline contract:**
- `timeline_nodes[0].days` MUST equal `1` (onboarding/kickoff session)
- Each subsequent node's `days` must be strictly greater than the previous
- All days are business days (Monday–Friday)
- Last node's `days` should be ≤ `total_days`

**Icon keys** (pick best match):
`time_loss`, `money_bleed`, `inefficiency`, `manual_ops`, `low_conversion`, `lead_leakage`, `growth`, `automation`, `speed`, `personalization`, `revenue`, `visibility`, `strategy`, `integration`, `analytics`

**Slug format:** `{first-name-lowercase}-{company-slug}-{mon}{year}` → e.g., `sarah-bloomforge-apr2026`

---

### Step 3: Show draft to rep

Present the full payload as JSON. Ask rep to confirm:
- Price, currency, total_days
- Client name spelling
- Timeline milestone sequence (Day 1, Day X, Day Y … — do days look right?)
- Scope items completeness
- Clause 03 obligations are complete

---

### Step 4: Submit

```
create_animated_proposal({ payload })
```

Returns:
- `draft_url` — public URL (inactive until admin approves)
- `admin_url` — for admin approval
- `warnings[]` — soft issues to review

If warnings appear, review with rep. Re-call with `override_warnings: true` if rep confirms to proceed.

---

### Step 5: Notify rep

- Admin must approve before sharing the link
- Admin URL: shown in tool output
- Public link: shown in tool output (share once approved)

---

## Content Fidelity Rule

**Zero invention.** Every dollar figure, pain point, scope item, metric, and guarantee must come from what the prospect said (in call or transcript) or from the approved snippet library. If something wasn't discussed, leave it out or ask the rep.

## Common Mistakes

- Don't invent dollar figures or metrics — use only what was mentioned.
- Don't generalize problems — name the specific process, tool, or team the prospect mentioned.
- `problems` and `solutions` must each be exactly 3 items.
- `timeline_nodes[0].days` must be `1`. Days must strictly increase. These are business days.
- `slug` must match `^[a-z0-9-]+$`.
- `total_price_cents` must be integer (no decimal).
- If using a T&C template, use `mapped_clauses` from `get_tos_template` as-is and customize only Clause 03.
