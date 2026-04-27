import { z } from "zod";
import { supabase, BASE_URL, DEFAULT_AUTHOR_ID } from "../supabase.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const KNOWN_ICON_KEYS = new Set([
  "time_loss", "money_bleed", "inefficiency", "manual_ops", "low_conversion",
  "lead_leakage", "growth", "automation", "speed", "personalization",
  "revenue", "visibility", "strategy", "integration", "analytics",
]);

const PRICE_TOLERANCE = 0.15;

const proposalCardSchema = z.object({
  title: z.string().min(1),
  desc: z.string().min(1),
  icon_key: z.string().optional(),
});

const scopeItemSchema = z.object({
  title: z.string().min(1),
  desc: z.string().min(1),
  icon_key: z.string().optional(),
});

const timelineNodeSchema = z.object({
  label: z.string().min(1),
  days: z.number().int().positive(),
  desc: z.string().min(1),
});

const termsClauseSchema = z.object({
  clause_no: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
});

const payloadSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  brand: z.enum(["xma", "xma_media"]).default("xma_media"),
  client_first_name: z.string().min(1),
  client_full_name: z.string().min(1),
  company_name: z.string().min(1),
  project_title: z.string().min(1),
  provider_name: z.string().min(1),
  agency_name: z.string().default("XMA Media"),
  proposal_date: z.string().optional(),
  intro_paragraph: z.string().min(1),
  challenge_intro: z.string().min(1),
  problems: z.array(proposalCardSchema).length(3),
  solution_intro: z.string().min(1),
  solutions: z.array(proposalCardSchema).length(3),
  scope_phase_name: z.string().optional().nullable(),
  scope_subtitle: z.string().optional().nullable(),
  scope_items: z.array(scopeItemSchema).min(1),
  timeline_nodes: z.array(timelineNodeSchema).min(1),
  retainer_bullets: z.array(z.string()).default([]),
  total_price_cents: z.number().int().positive(),
  milestone_cents: z.number().int().positive().optional().nullable(),
  retainer_price_cents: z.number().int().positive().optional().nullable(),
  currency: z.string().length(3).default("AED"),
  total_days: z.number().int().positive().optional().nullable(),
  guarantee_text: z.string().optional().nullable(),
  phase_two_teaser: z.string().optional().nullable(),
  terms: z.array(termsClauseSchema).default([]),
  stripe_link: z.string().url().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
  package_id: z.string().uuid().optional().nullable(),
  tos_template_id: z.string().uuid().optional().nullable(),
  override_warnings: z.boolean().default(false),
  created_by: z.string().uuid().optional(),
});

function runWarnings(
  payload: z.infer<typeof payloadSchema>,
  pkg: any,
  tos: any
): string[] {
  const warnings: string[] = [];

  if (pkg && payload.package_id) {
    const floorCents = payload.currency === "USD" && pkg.usd_price
      ? pkg.usd_price * 100
      : pkg.price * 100;
    const deviation = Math.abs(payload.total_price_cents - floorCents) / floorCents;
    if (deviation > PRICE_TOLERANCE) {
      warnings.push(`Price deviation ${Math.round(deviation * 100)}% from package floor (${pkg.currency} ${pkg.price}). Verify with client.`);
    }
    if (payload.currency !== pkg.currency && !(payload.currency === "USD" && pkg.usd_price)) {
      warnings.push(`Currency mismatch: proposal uses ${payload.currency} but package is priced in ${pkg.currency}.`);
    }
    if (pkg.brand && pkg.brand !== payload.brand) {
      warnings.push(`Brand mismatch: package is "${pkg.brand}" but proposal brand is "${payload.brand}".`);
    }
  }

  if (tos && payload.tos_template_id) {
    const templateCount = Array.isArray(tos.terms) ? tos.terms.length : 0;
    const payloadCount = payload.terms?.length ?? 0;
    if (templateCount > 0 && payloadCount !== templateCount) {
      warnings.push(`Terms count (${payloadCount}) differs from template (${templateCount}). Ensure all required clauses are included.`);
    }
    if (tos.brand && tos.brand !== payload.brand) {
      warnings.push(`T&C brand mismatch: template is "${tos.brand}" but proposal brand is "${payload.brand}".`);
    }
  }

  const allCards = [...(payload.solutions ?? []), ...(payload.problems ?? [])];
  for (const card of allCards) {
    if (card.icon_key && !KNOWN_ICON_KEYS.has(card.icon_key)) {
      warnings.push(`Unknown icon_key "${card.icon_key}". Will fall back to default icon.`);
    }
  }

  if (!payload.total_days && (payload.timeline_nodes?.length ?? 0) > 0) {
    warnings.push(`total_days unset — timeline will display "at a glance" instead of specific duration.`);
  }

  if (payload.retainer_price_cents && !payload.phase_two_teaser) {
    warnings.push(`Retainer set but phase_two_teaser is empty. Consider adding ongoing engagement context.`);
  }

  return warnings;
}

export function registerCreateProposalTool(server: McpServer) {
  server.tool(
    "create_animated_proposal",
    "Validate and create an animated proposal in draft status. Returns the draft URL and any soft warnings. Call this after grounding with list_packages, list_tos_templates, and list_snippets.",
    { payload: payloadSchema },
    async ({ payload }) => {
      const parsed = payloadSchema.safeParse(payload);
      if (!parsed.success) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ errors: parsed.error.flatten() }, null, 2),
          }],
        };
      }

      const data = parsed.data;
      const authorId = data.created_by ?? DEFAULT_AUTHOR_ID;

      if (!authorId) {
        return {
          content: [{
            type: "text",
            text: "MCP_DEFAULT_AUTHOR_ID is not set in .env.local. Add it and restart.",
          }],
        };
      }

      let pkg: any = null;
      let tos: any = null;

      if (data.package_id) {
        const { data: pkgData } = await (supabase as any)
          .from("packages")
          .select("price, currency, usd_price, brand")
          .eq("id", data.package_id)
          .single();
        pkg = pkgData;
      }

      if (data.tos_template_id) {
        const { data: tosData } = await (supabase as any)
          .from("tos_templates")
          .select("terms, brand")
          .eq("id", data.tos_template_id)
          .single();
        tos = tosData;
      }

      const warnings = runWarnings(data, pkg, tos);

      const { override_warnings, created_by: _cb, ...insertFields } = data;

      const { data: row, error } = await (supabase as any)
        .from("animated_proposals")
        .insert({
          ...insertFields,
          created_by: authorId,
          status: "draft",
        })
        .select("id, token, slug")
        .single();

      if (error) {
        if (error.code === "23505") {
          return { content: [{ type: "text", text: `Error: slug "${data.slug}" is already in use. Choose a different slug.` }] };
        }
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };
      }

      const draft_url = `${BASE_URL}/proposal/${row.token}`;
      const admin_url = `${BASE_URL}/animated-proposals/${row.id}`;

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            id: row.id,
            slug: row.slug,
            token: row.token,
            draft_url,
            admin_url,
            status: "draft",
            warnings,
            note: warnings.length > 0
              ? "Review warnings above. Admin must approve before the link goes live."
              : "Draft created. Admin must approve before the link goes live.",
          }, null, 2),
        }],
      };
    }
  );
}
