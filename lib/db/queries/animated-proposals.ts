import { and, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { animatedProposals, type ProposalStatus } from "@/lib/db/schema";
import type { AnimatedProposal } from "@/types/animated-proposal";

export const PUBLICLY_VISIBLE_STATUSES: ProposalStatus[] = ["approved", "sent", "client_signed", "counter_signed", "paid"];

export async function fetchPublicProposalByToken(token: string): Promise<AnimatedProposal | null> {
  const [row] = await db
    .select()
    .from(animatedProposals)
    .where(
      and(
        eq(animatedProposals.token, token),
        inArray(animatedProposals.status, PUBLICLY_VISIBLE_STATUSES),
        or(isNull(animatedProposals.expires_at), gt(animatedProposals.expires_at, sql`now()`)),
        isNull(animatedProposals.archived_at)
      )
    )
    .limit(1);
  return (row as unknown as AnimatedProposal | undefined) ?? null;
}

export async function fetchProposalById(id: string): Promise<AnimatedProposal | null> {
  const [row] = await db.select().from(animatedProposals).where(eq(animatedProposals.id, id)).limit(1);
  return (row as unknown as AnimatedProposal | undefined) ?? null;
}

export function withArchivedAt<T extends { status?: string; archived_at?: string | null }>(updates: T): T {
  if (updates.status === "archived" && !updates.archived_at) {
    return { ...updates, archived_at: new Date().toISOString() };
  }
  return updates;
}
