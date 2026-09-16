import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { asc, desc, eq } from "drizzle-orm";
import { db, animatedProposals, packages, profiles, tosTemplates } from "@/lib/db";
import { THEMES } from "@/lib/proposal-themes";
import { withArchivedAt } from "@/lib/db/queries/animated-proposals";

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

async function resolveDefaultOwnerId(): Promise<string | null> {
  const [admin] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.role, "admin")).limit(1);
  if (admin) return admin.id;
  const [anyProfile] = await db.select({ id: profiles.id }).from(profiles).limit(1);
  return anyProfile?.id ?? null;
}

function textResult(payload: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }] };
}

function errorResult(message: string) {
  return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
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

  server.tool(
    "list_animated_proposals",
    "List animated proposals. Optionally filter by status.",
    {
      status: proposalStatusEnum.optional(),
      limit: z.number().int().min(1).max(100).default(50),
    },
    async ({ status, limit }) => {
      const data = await db
        .select({
          id: animatedProposals.id,
          slug: animatedProposals.slug,
          token: animatedProposals.token,
          status: animatedProposals.status,
          client_full_name: animatedProposals.client_full_name,
          company_name: animatedProposals.company_name,
          project_title: animatedProposals.project_title,
          total_price_cents: animatedProposals.total_price_cents,
          currency: animatedProposals.currency,
          created_at: animatedProposals.created_at,
          client_signed_at: animatedProposals.client_signed_at,
          provider_signed_at: animatedProposals.provider_signed_at,
        })
        .from(animatedProposals)
        .where(status ? eq(animatedProposals.status, status) : undefined)
        .orderBy(desc(animatedProposals.created_at))
        .limit(limit);
      return textResult(data);
    }
  );

  server.tool(
    "get_animated_proposal",
    "Get a single animated proposal by ID.",
    { id: z.string() },
    async ({ id }) => {
      const [data] = await db.select().from(animatedProposals).where(eq(animatedProposals.id, id)).limit(1);
      if (!data) return errorResult("Not found");
      return textResult(data);
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

  const proposalContentFields = {
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
    package_id: z.string().optional(),
    tos_template_id: z.string().optional(),
    theme: themeEnum.optional().describe("Per-proposal theme override; omit to use the global default."),
  };

  server.tool(
    "create_animated_proposal",
    "Create a new animated proposal. To revise an existing proposal, use update_animated_proposal instead of creating a duplicate.",
    { ...proposalContentFields, created_by: z.string().min(1).optional() },
    async (input) => {
      const { package_id, tos_template_id, created_by, ...insertData } = input;

      const ownerId = created_by ?? (await resolveDefaultOwnerId());
      if (!ownerId) {
        return errorResult("no owner found. Pass created_by, or create a profile first.");
      }

      try {
        const [data] = await db
          .insert(animatedProposals)
          .values({
            ...insertData,
            created_by: ownerId,
            package_id: package_id ?? null,
            tos_template_id: tos_template_id ?? null,
            status: "sent",
          } as never)
          .returning();
        return textResult(data);
      } catch (error) {
        return errorResult((error as Error).message);
      }
    }
  );

  const proposalUpdateFields = Object.fromEntries(
    Object.entries(proposalContentFields).map(([key, schema]) => [
      key,
      (schema instanceof z.ZodDefault ? schema.removeDefault() : schema).optional(),
    ])
  ) as unknown as { [K in keyof typeof proposalContentFields]: z.ZodOptional<z.ZodTypeAny> };

  server.tool(
    "update_animated_proposal",
    "Update an existing animated proposal in place. Accepts every field from create_animated_proposal as optional; only the fields you pass are changed, everything else is preserved. Call get_animated_proposal first to see current values. Array fields (problems, solutions, scope_items, timeline_nodes, terms, retainer_bullets) are replaced wholesale, so pass the full array.",
    {
      id: z.string(),
      ...proposalUpdateFields,
      status: proposalStatusEnum.optional(),
    },
    async ({ id, ...updates }) => {
      const filtered = Object.fromEntries(
        Object.entries(updates).filter(([, v]) => v !== undefined)
      );
      if (Object.keys(filtered).length === 0) {
        return { content: [{ type: "text", text: "Error: no fields to update" }], isError: true };
      }

      try {
        const [data] = await db.update(animatedProposals).set(withArchivedAt(filtered) as never).where(eq(animatedProposals.id, id)).returning();
        if (!data) return errorResult("Not found");
        return textResult(data);
      } catch (error) {
        return errorResult((error as Error).message);
      }
    }
  );

  server.tool(
    "list_packages",
    "List all available service packages.",
    {},
    async () => {
      const data = await db
        .select({
          id: packages.id,
          name: packages.name,
          price: packages.price,
          currency: packages.currency,
          usd_price: packages.usd_price,
          description: packages.description,
          is_popular: packages.is_popular,
        })
        .from(packages)
        .orderBy(asc(packages.price));
      return textResult(data);
    }
  );

  server.tool(
    "get_package",
    "Get a single package by ID.",
    { id: z.string() },
    async ({ id }) => {
      const [data] = await db.select().from(packages).where(eq(packages.id, id)).limit(1);
      if (!data) return errorResult("Not found");
      return textResult(data);
    }
  );

  server.tool(
    "list_tos_templates",
    "List all active Terms of Service templates.",
    {},
    async () => {
      const data = await db
        .select({
          id: tosTemplates.id,
          name: tosTemplates.name,
          is_active: tosTemplates.is_active,
          variables: tosTemplates.variables,
          created_at: tosTemplates.created_at,
        })
        .from(tosTemplates)
        .where(eq(tosTemplates.is_active, true))
        .orderBy(asc(tosTemplates.name));
      return textResult(data);
    }
  );

  server.tool(
    "get_tos_template",
    "Get a single Terms of Service template by ID including full terms text.",
    { id: z.string() },
    async ({ id }) => {
      const [data] = await db.select().from(tosTemplates).where(eq(tosTemplates.id, id)).limit(1);
      if (!data) return errorResult("Not found");
      return textResult(data);
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
