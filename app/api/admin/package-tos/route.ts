import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, packages, packageTosMappings, tosTemplates } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/api";

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const { package_id, tos_template_id, is_default } = body ?? {};
  if (!package_id || !tos_template_id) {
    return NextResponse.json({ error: "package_id and tos_template_id are required" }, { status: 400 });
  }

  if (is_default) {
    await db.update(packageTosMappings).set({ is_default: false }).where(eq(packageTosMappings.package_id, package_id));
  }

  const [mapping] = await db
    .insert(packageTosMappings)
    .values({ package_id, tos_template_id, is_default: is_default ?? false })
    .onConflictDoUpdate({
      target: [packageTosMappings.package_id, packageTosMappings.tos_template_id],
      set: { is_default: is_default ?? false },
    })
    .returning();

  return NextResponse.json({ mapping }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const packageId = new URL(request.url).searchParams.get("package_id");
  const rows = await db
    .select({ mapping: packageTosMappings, package: packages, tos_template: tosTemplates })
    .from(packageTosMappings)
    .leftJoin(packages, eq(packageTosMappings.package_id, packages.id))
    .leftJoin(tosTemplates, eq(packageTosMappings.tos_template_id, tosTemplates.id))
    .where(packageId ? eq(packageTosMappings.package_id, packageId) : undefined)
    .orderBy(desc(packageTosMappings.created_at));

  const mappings = rows.map(({ mapping, package: pkg, tos_template }) => ({ ...mapping, package: pkg, tos_template }));
  return NextResponse.json({ mappings });
}
