import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpServiceClient } from "../_lib/supabase";

export function registerTosTools(server: McpServer) {
  server.tool(
    "list_tos_templates",
    "List available T&C templates. Use brand filter to find XMA or XMA Media templates. Returns id, name, brand, payment_type, and clause count.",
    { brand: z.enum(["xma", "xma_media"]).optional() },
    async ({ brand }) => {
      const supabase = createMcpServiceClient();
      let query = supabase
        .from("tos_templates")
        .select("id, name, description, brand, payment_type, is_active, terms")
        .eq("is_active", true)
        .order("name");
      if (brand) query = query.eq("brand", brand);
      const { data, error } = await query;
      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };

      const summary = (data ?? []).map((t: any) => ({
        id: t.id,
        name: t.name,
        brand: t.brand,
        payment_type: t.payment_type,
        clause_count: Array.isArray(t.terms) ? t.terms.length : 0,
        description: t.description,
      }));
      return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
    }
  );

  server.tool(
    "get_tos_template",
    "Get full T&C template including all clauses. Use this to populate the terms field of a proposal.",
    { id: z.string().uuid() },
    async ({ id }) => {
      const supabase = createMcpServiceClient();
      const { data, error } = await supabase
        .from("tos_templates")
        .select("id, name, brand, payment_type, terms, variables")
        .eq("id", id)
        .single();
      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };

      const clauses = Array.isArray(data.terms)
        ? data.terms.map((t: any, i: number) => ({
            clause_no: String(i + 1).padStart(2, "0"),
            title: t.title,
            body: t.content,
          }))
        : [];

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...data, mapped_clauses: clauses }, null, 2),
        }],
      };
    }
  );
}
