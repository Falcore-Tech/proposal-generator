import { eq } from "drizzle-orm";
import { db, profiles } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/api";

export async function POST(request: Request) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { salesRepId } = await request.json().catch(() => ({}));
  if (!salesRepId) {
    return Response.json({ error: "Sales rep ID is required" }, { status: 400 });
  }

  const [target] = await db
    .select({ id: profiles.id, role: profiles.role, email: profiles.email })
    .from(profiles)
    .where(eq(profiles.id, salesRepId))
    .limit(1);

  if (!target) return Response.json({ error: "Sales representative not found" }, { status: 404 });
  if (target.role !== "sales_rep") {
    return Response.json({ error: `Target user is not a sales representative. Current role: ${target.role}` }, { status: 400 });
  }

  await db.update(profiles).set({ role: "deactivated", updated_at: new Date().toISOString() }).where(eq(profiles.id, salesRepId));

  return Response.json({ message: "Sales representative deactivated successfully", email: target.email });
}
