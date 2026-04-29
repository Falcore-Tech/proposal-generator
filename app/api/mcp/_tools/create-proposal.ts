import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createAnimatedProposalSchema } from "@/lib/animated-proposal-schema";
import { createMcpServiceClient } from "../_lib/supabase";
import type { McpAuthContext } from "../_lib/auth";

const payloadSchema = createAnimatedProposalSchema.omit({ created_by: true });

const KNOWN_ICON_KEYS = new Set([
  "time_loss", "money_bleed", "inefficiency", "manual_ops", "low_conversion",
  "lead_leakage", "growth", "automation", "speed", "personalization",
  "revenue", "visibility", "strategy", "integration", "analytics",
]);

const PRICE_TOLERANCE = 0.15;

function runWarnings(payload: z.infer<typeof payloadSchema>, pkg: any, tos: any): string[] {
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

export function registerCreateProposalTool(server: McpServer, ctx: McpAuthContext) {
  server.tool(
    "create_animated_proposal",
    "Validate and create an animated proposal. Returns the proposal URL and any soft warnings. Call this after grounding with list_packages, list_tos_templates, and list_snippets.",
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
      const supabase = createMcpServiceClient();

      let pkg: any = null;
      let tos: any = null;

      if (data.package_id) {
        const { data: pkgData } = await supabase
          .from("packages")
          .select("price, currency, usd_price, brand")
          .eq("id", data.package_id)
          .single();
        pkg = pkgData;
      }

      if (data.tos_template_id) {
        const { data: tosData } = await supabase
          .from("tos_templates")
          .select("terms, brand")
          .eq("id", data.tos_template_id)
          .single();
        tos = tosData;
      }

      const warnings = runWarnings(data, pkg, tos);

      const { override_warnings, ...insertFields } = data;

      const { data: row, error } = await supabase
        .from("animated_proposals")
        .insert({
          ...insertFields,
          created_by: ctx.userId,
          status: "sent",
        })
        .select("id, token, slug")
        .single();

      if (error) {
        if (error.code === "23505") {
          return { content: [{ type: "text", text: `Error: slug "${data.slug}" is already in use. Choose a different slug.` }] };
        }
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
      const public_url = `${baseUrl}/proposal/${row.token}`;
      const admin_url = `${baseUrl}/proposals/animated/${row.id}`;

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            id: row.id,
            slug: row.slug,
            token: row.token,
            public_url,
            admin_url,
            status: "sent",
            warnings,
            note: warnings.length > 0
              ? "Review warnings above. Proposal is live — share public_url with the client."
              : "Proposal is live. Share public_url with the client.",
          }, null, 2),
        }],
      };
    }
  );
}
