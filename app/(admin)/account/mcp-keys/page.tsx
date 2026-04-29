import { requireAuthenticatedUser } from "@/lib/auth-helpers";
import { createClient } from "@/utils/supabase/server";
import McpKeysClient from "./_components/McpKeysClient";

export default async function McpKeysPage() {
  const user = await requireAuthenticatedUser();
  const supabase = await createClient();

  const { data: keys } = await supabase
    .from("mcp_api_keys")
    .select("id, name, key_prefix, last_used_at, created_at, revoked_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-10">
      <McpKeysClient initialKeys={keys ?? []} />
    </div>
  );
}
