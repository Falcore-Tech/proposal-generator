import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, animatedProposals } from "@/lib/db";
import { requireAuth } from "@/lib/auth/api";
import { updateAnimatedProposalSchema, ANIMATED_STATUS_TRANSITIONS, type AnimatedStatus } from "@/lib/animated-proposal-schema";
import { fetchProposalById } from "@/lib/db/queries/animated-proposals";
import { getPostHogClient } from "@/lib/posthog-server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const parsed = updateAnimatedProposalSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.status) {
    const [current] = await db.select({ status: animatedProposals.status }).from(animatedProposals).where(eq(animatedProposals.id, id)).limit(1);
    if (current) {
      const allowed = ANIMATED_STATUS_TRANSITIONS[current.status as AnimatedStatus] ?? [];
      if (!allowed.includes(parsed.data.status as AnimatedStatus)) {
        return NextResponse.json({ error: `Cannot transition from '${current.status}' to '${parsed.data.status}'` }, { status: 400 });
      }
    }
  }

  const { override_warnings: _ow, ...updateFields } = parsed.data;
  const [data] = await db.update(animatedProposals).set(updateFields as never).where(eq(animatedProposals.id, id)).returning();
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.status) {
    getPostHogClient().capture({
      distinctId: user.id,
      event: "animated_proposal_status_updated",
      properties: { proposal_id: id, new_status: parsed.data.status },
    });
  }

  return NextResponse.json(data);
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const data = await fetchProposalById(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
