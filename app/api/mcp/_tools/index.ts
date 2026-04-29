import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpAuthContext } from "../_lib/auth";
import { registerPackageTools } from "./packages";
import { registerTosTools } from "./tos";
import { registerSnippetTools } from "./snippets";
import { registerCreateProposalTool } from "./create-proposal";

export function registerAllTools(server: McpServer, ctx: McpAuthContext) {
  registerPackageTools(server);
  registerTosTools(server);
  registerSnippetTools(server);
  registerCreateProposalTool(server, ctx);
}
