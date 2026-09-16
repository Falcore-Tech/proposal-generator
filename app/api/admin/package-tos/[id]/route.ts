import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, packageTosMappings } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/api";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { is_default } = body;

  const [mapping] = await db.select({ package_id: packageTosMappings.package_id }).from(packageTosMappings).where(eq(packageTosMappings.id, id)).limit(1);
  if (!mapping) return NextResponse.json({ error: "Mapping not found" }, { status: 404 });

  if (is_default && mapping.package_id) {
    await db.update(packageTosMappings).set({ is_default: false }).where(eq(packageTosMappings.package_id, mapping.package_id));
  }

  const [updatedMapping] = await db.update(packageTosMappings).set({ is_default }).where(eq(packageTosMappings.id, id)).returning();
  return NextResponse.json({ mapping: updatedMapping });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await db.delete(packageTosMappings).where(eq(packageTosMappings.id, id));
  return NextResponse.json({ success: true });
}
