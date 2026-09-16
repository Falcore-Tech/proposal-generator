import { desc } from "drizzle-orm";
import { requireAdminRole } from "@/lib/auth/page";
import { db, tosTemplates } from "@/lib/db";
import ToSManagementClient from "./ToSManagementClient";

export const dynamic = "force-dynamic";

export default async function ToSManagementPage() {
  await requireAdminRole();
  const templates = await db.select().from(tosTemplates).orderBy(desc(tosTemplates.created_at));
  return <ToSManagementClient initialTemplates={templates as never} />;
}
