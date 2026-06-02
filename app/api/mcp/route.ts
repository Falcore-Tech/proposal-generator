import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { createServiceClient } from "@/utils/supabase/service";
import { THEMES } from "@/lib/proposal-themes";

const themeEnum = z.enum(THEMES.map((t) => t.id) as [string, ...string[]]);

function authenticate(req: Request): Response | null {
  const apiKey = process.env.MCP_API_KEY;
  if (!apiKey) return new Response("MCP_API_KEY not configured", { status: 500 });
  const auth = req.headers.get("authorization");
  if (!auth || auth !== `Bearer ${apiKey}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

async function resolveDefaultOwnerId(
  supabase: ReturnType<typeof createServiceClient>
): Promise<string | null> {
  const admin = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();
  if (admin.data?.id) return admin.data.id;

  const anyProfile = await supabase.from("profiles").select("id").limit(1).maybeSingle();
  return anyProfile.data?.id ?? null;
}

const proposalStatusEnum = z.enum([
  "draft",
  "pending_approval",
  "approved",
  "sent",
  "client_signed",
  "counter_signed",
  "paid",
  "archived",
]);

function buildServer(): McpServer {
  const server = new McpServer({ name: "falcore-proposals", version: "1.0.0" });
  const supabase = createServiceClient();

  server.tool(
    "list_animated_proposals",
    "List animated proposals. Optionally filter by status.",
    {
      status: proposalStatusEnum.optional(),
      limit: z.number().int().min(1).max(100).default(50),
    },
    async ({ status, limit }) => {
      let query = supabase
        .from("animated_proposals")
        .select("id, slug, token, status, brand, client_full_name, company_name, project_title, total_price_cents, currency, created_at, client_signed_at, provider_signed_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_animated_proposal",
    "Get a single animated proposal by ID.",
    { id: z.string().uuid() },
    async ({ id }) => {
      const { data, error } = await supabase
        .from("animated_proposals")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      if (!data) return { content: [{ type: "text", text: "Not found" }], isError: true };

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  const proposalCardSchema = z.object({
    title: z.string(),
    desc: z.string(),
    icon_key: z.string().optional(),
    icon_svg: z.string().optional(),
  });

  const timelineNodeSchema = z.object({
    label: z.string(),
    days: z.number().int().min(1),
    desc: z.string(),
  });

  const termsClauseSchema = z.object({
    clause_no: z.string(),
    title: z.string(),
    body: z.string(),
  });

  server.tool(
    "create_animated_proposal",
    "Create a new animated proposal.",
    {
      slug: z.string().regex(/^[a-z0-9-]+$/),
      client_first_name: z.string(),
      client_full_name: z.string(),
      company_name: z.string(),
      project_title: z.string(),
      provider_name: z.string(),
      agency_name: z.string().default("Falcore"),
      proposal_date: z.string().optional(),
      intro_paragraph: z.string(),
      challenge_intro: z.string(),
      problems: z.array(proposalCardSchema).length(3),
      solution_intro: z.string(),
      solutions: z.array(proposalCardSchema).length(3),
      scope_phase_name: z.string().optional(),
      scope_subtitle: z.string().optional(),
      scope_items: z.array(z.object({ title: z.string(), desc: z.string(), icon_key: z.string().optional(), icon_svg: z.string().optional() })).min(1),
      timeline_nodes: z.array(timelineNodeSchema).min(2),
      retainer_bullets: z.array(z.string()).default([]),
      total_price_cents: z.number().int().positive(),
      milestone_cents: z.number().int().positive().optional(),
      retainer_price_cents: z.number().int().positive().optional(),
      currency: z.string().length(3).default("AED"),
      total_days: z.number().int().positive().optional(),
      guarantee_text: z.string().optional(),
      phase_two_teaser: z.string().optional(),
      payment_options_text: z.string().optional(),
      terms: z.array(termsClauseSchema).default([]),
      stripe_link: z.string().url().optional(),
      expires_at: z.string().datetime().optional(),
      package_id: z.string().uuid().optional(),
      tos_template_id: z.string().uuid().optional(),
      created_by: z.string().uuid().optional(),
      theme: themeEnum.optional().describe("Per-proposal theme override; omit to use the global default."),
    },
    async (input) => {
      const { package_id, tos_template_id, created_by, ...insertData } = input;

      const ownerId = created_by ?? (await resolveDefaultOwnerId(supabase));
      if (!ownerId) {
        return {
          content: [{ type: "text", text: "Error: no owner found. Pass created_by, or create a profile first." }],
          isError: true,
        };
      }

      const { data, error } = await supabase
        .from("animated_proposals")
        .insert({
          ...insertData,
          created_by: ownerId,
          package_id: package_id ?? null,
          tos_template_id: tos_template_id ?? null,
          status: "sent",
        } as any)
        .select()
        .single();

      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "update_animated_proposal",
    "Update fields on an existing animated proposal.",
    {
      id: z.string().uuid(),
      status: proposalStatusEnum.optional(),
      project_title: z.string().optional(),
      stripe_link: z.string().url().optional(),
      expires_at: z.string().datetime().optional(),
      total_price_cents: z.number().int().positive().optional(),
      currency: z.string().length(3).optional(),
      theme: themeEnum.optional().describe("Per-proposal theme override; null/omit to use the global default."),
    },
    async ({ id, ...updates }) => {
      const filtered = Object.fromEntries(
        Object.entries(updates).filter(([, v]) => v !== undefined)
      );

      const { data, error } = await supabase
        .from("animated_proposals")
        .update(filtered)
        .eq("id", id)
        .select()
        .single();

      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      if (!data) return { content: [{ type: "text", text: "Not found" }], isError: true };

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "list_packages",
    "List all available service packages.",
    {},
    async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("id, name, price, currency, usd_price, description, is_popular")
        .order("price", { ascending: true });

      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_package",
    "Get a single package by ID.",
    { id: z.string().uuid() },
    async ({ id }) => {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      if (!data) return { content: [{ type: "text", text: "Not found" }], isError: true };

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "list_tos_templates",
    "List all active Terms of Service templates.",
    {},
    async () => {
      const { data, error } = await supabase
        .from("tos_templates")
        .select("id, name, is_active, variables, created_at")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_tos_template",
    "Get a single Terms of Service template by ID including full terms text.",
    { id: z.string().uuid() },
    async ({ id }) => {
      const { data, error } = await supabase
        .from("tos_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      if (!data) return { content: [{ type: "text", text: "Not found" }], isError: true };

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  return server;
}

async function handle(req: Request): Promise<Response> {
  const authError = authenticate(req);
  if (authError) return authError;

  const server = buildServer();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  return transport.handleRequest(req);
}

export const POST = handle;
export const GET = handle;
export const DELETE = handle;
