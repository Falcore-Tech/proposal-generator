import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { requireAuth } from "@/lib/auth/api";
import { eventSchema } from "@/lib/animated-proposal-schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("animated_proposal_events")
    .select("*")
    .eq("proposal_id", id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceClient();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ua = request.headers.get("user-agent") ?? null;

  const { error } = await supabase.from("animated_proposal_events").insert({
    proposal_id: id,
    event_type: parsed.data.event_type,
    meta: parsed.data.meta ?? null,
    ip,
    ua,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
