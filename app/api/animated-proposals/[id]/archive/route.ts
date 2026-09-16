import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, animatedProposals } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/api";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  await db
    .update(animatedProposals)
    .set({ archived_at: new Date().toISOString(), status: "archived" })
    .where(eq(animatedProposals.id, id));

  getPostHogClient().capture({
    distinctId: user.id,
    event: "animated_proposal_archived",
    properties: { proposal_id: id },
  });

  return NextResponse.json({ success: true });
}
