import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, packageTosMappings, tosTemplates } from "@/lib/db";
import { requireAuth } from "@/lib/auth/api";

export async function GET(_request: Request, { params }: { params: Promise<{ packageId: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { packageId } = await params;
  const rows = await db
    .select({ template: tosTemplates, is_default: packageTosMappings.is_default })
    .from(packageTosMappings)
    .innerJoin(tosTemplates, eq(packageTosMappings.tos_template_id, tosTemplates.id))
    .where(and(eq(packageTosMappings.package_id, packageId), eq(tosTemplates.is_active, true)))
    .orderBy(desc(packageTosMappings.is_default));

  const templates = rows.map(({ template, is_default }) => ({ ...template, is_default }));
  return NextResponse.json({ templates });
}
