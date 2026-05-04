import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/api-auth";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("animated_proposals")
    .update({ archived_at: new Date().toISOString(), status: "archived" })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: user!.id,
    event: "animated_proposal_archived",
    properties: { proposal_id: id },
  });

  return NextResponse.json({ success: true });
}
