import { desc, eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { db, animatedProposalEvents } from "@/lib/db";
import { requireAuth } from "@/lib/auth/api";
import { eventSchema } from "@/lib/animated-proposal-schema";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const data = await db
    .select()
    .from(animatedProposalEvents)
    .where(eq(animatedProposalEvents.proposal_id, id))
    .orderBy(desc(animatedProposalEvents.created_at))
    .limit(100);

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await db.insert(animatedProposalEvents).values({
    proposal_id: id,
    event_type: parsed.data.event_type,
    meta: parsed.data.meta ?? null,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    ua: request.headers.get("user-agent") ?? null,
  });

  return NextResponse.json({ ok: true });
}
