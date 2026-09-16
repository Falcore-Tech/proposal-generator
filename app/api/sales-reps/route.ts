import { desc, eq } from "drizzle-orm";
import { db, animatedProposals, profiles } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/api";

export async function GET() {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const [salesReps, proposals] = await Promise.all([
    db
      .select({ id: profiles.id, name: profiles.name, email: profiles.email, created_at: profiles.created_at, role: profiles.role })
      .from(profiles)
      .where(eq(profiles.role, "sales_rep"))
      .orderBy(desc(profiles.created_at)),
    db
      .select({ created_by: animatedProposals.created_by, status: animatedProposals.status, archived_at: animatedProposals.archived_at })
      .from(animatedProposals),
  ]);

  const salesRepStats = salesReps.map((rep) => {
    const own = proposals.filter((p) => p.created_by === rep.id);
    const active = own.filter((p) => p.archived_at === null);
    const statusCounts = active.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    }, {});
    return { ...rep, totalActive: active.length, totalArchived: own.length - active.length, statusCounts };
  });

  return Response.json({ salesReps, salesRepStats });
}
