import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_URL = process.env.MCP_URL ?? "http://localhost:3000/api/mcp";
const KEY = process.env.MCP_API_KEY;

if (!KEY) {
  console.error("Set MCP_API_KEY env var");
  process.exit(1);
}

function textOf(result) {
  return result?.content?.map((c) => c.text).join("\n") ?? "";
}

async function main() {
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: { headers: { Authorization: `Bearer ${KEY}` } },
  });
  const client = new Client({ name: "test-mcp", version: "1.0.0" });
  await client.connect(transport);

  const tools = await client.listTools();
  console.log("TOOLS:", tools.tools.map((t) => t.name).join(", "));

  const packages = await client.callTool({ name: "list_packages", arguments: {} });
  console.log("\nlist_packages isError:", packages.isError ?? false);
  console.log(textOf(packages).slice(0, 300));

  const list = await client.callTool({ name: "list_animated_proposals", arguments: { limit: 3 } });
  console.log("\nlist_animated_proposals isError:", list.isError ?? false);
  console.log(textOf(list).slice(0, 300));

  const created = await client.callTool({
    name: "create_animated_proposal",
    arguments: {
      slug: "mcp-smoke-test-" + Math.floor(Math.random() * 1e6),
      client_first_name: "Test",
      client_full_name: "Test Client",
      company_name: "Test Co",
      project_title: "MCP Smoke Test",
      provider_name: "Faez A.",
      intro_paragraph: "Intro.",
      challenge_intro: "The challenge.",
      problems: [
        { title: "P1", desc: "d1" },
        { title: "P2", desc: "d2" },
        { title: "P3", desc: "d3" },
      ],
      solution_intro: "The solution.",
      solutions: [
        { title: "S1", desc: "d1" },
        { title: "S2", desc: "d2" },
        { title: "S3", desc: "d3" },
      ],
      scope_items: [{ title: "Scope 1", desc: "d" }],
      timeline_nodes: [
        { label: "Kickoff", days: 1, desc: "start" },
        { label: "Delivery", days: 10, desc: "ship" },
      ],
      total_price_cents: 750000,
      currency: "AED",
    },
  });
  console.log("\ncreate_animated_proposal isError:", created.isError ?? false);
  const createdText = textOf(created);
  console.log(createdText.slice(0, 400));

  let createdId, token;
  try {
    const obj = JSON.parse(createdText);
    createdId = obj.id;
    token = obj.token;
  } catch {}

  if (createdId) {
    const got = await client.callTool({ name: "get_animated_proposal", arguments: { id: createdId } });
    console.log("\nget_animated_proposal isError:", got.isError ?? false);
    console.log("PUBLIC_URL:", `http://localhost:3000/proposal/${token}`);
  }

  await client.close();
  console.log("\nDONE");
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
