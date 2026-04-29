import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpServiceClient } from "../_lib/supabase";

export function registerPackageTools(server: McpServer) {
  server.tool(
    "list_packages",
    "List available packages from the catalog. Use brand filter to narrow to XMA or XMA Media.",
    { brand: z.enum(["xma", "xma_media"]).optional() },
    async ({ brand }) => {
      const supabase = createMcpServiceClient();
      const { data, error } = await supabase.from("packages").select("*").order("name");
      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
      const filtered = brand ? (data ?? []).filter((p: any) => p.brand === brand) : data;
      return { content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }] };
    }
  );

  server.tool(
    "get_package",
    "Get full details for a specific package including features and pricing.",
    { id: z.string().uuid() },
    async ({ id }) => {
      const supabase = createMcpServiceClient();
      const { data, error } = await supabase.from("packages").select("*").eq("id", id).single();
      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
