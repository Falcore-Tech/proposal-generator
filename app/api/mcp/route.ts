import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { verifyMcpKey } from "./_lib/auth";
import { registerAllTools } from "./_tools";

async function handleMcpRequest(req: Request): Promise<Response> {
  const auth = await verifyMcpKey(req);
  if (!auth) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Bearer realm="xma-proposals"' },
    });
  }

  const server = new McpServer({ name: "xma-proposals", version: "1.0.0" });
  registerAllTools(server, auth);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  const response = await transport.handleRequest(req);
  await server.close();

  return response;
}

export { handleMcpRequest as GET, handleMcpRequest as POST, handleMcpRequest as DELETE };
