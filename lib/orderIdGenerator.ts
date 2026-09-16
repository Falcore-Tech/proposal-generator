import { desc, isNotNull, like, and } from "drizzle-orm";
import { db, animatedProposals } from "@/lib/db";

export function generateOrderId(sequentialNumber: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const validSequence = Number.isFinite(sequentialNumber) ? sequentialNumber : 1;
  return `FAL-${year}-${month}-${String(validSequence).padStart(5, "0")}`;
}

export async function getNextSequentialNumber(): Promise<number> {
  const now = new Date();
  const pattern = `FAL-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-%`;

  const [latest] = await db
    .select({ order_id: animatedProposals.order_id })
    .from(animatedProposals)
    .where(and(isNotNull(animatedProposals.order_id), like(animatedProposals.order_id, pattern)))
    .orderBy(desc(animatedProposals.order_id))
    .limit(1);

  const lastSequence = parseInt(latest?.order_id?.split("-").pop() ?? "", 10);
  return Number.isFinite(lastSequence) && lastSequence > 0 ? lastSequence + 1 : 1;
}
