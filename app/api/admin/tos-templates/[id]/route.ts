import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, packageTosMappings, tosTemplates } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const [template] = await db.select().from(tosTemplates).where(eq(tosTemplates.id, id)).limit(1);
  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });
  return NextResponse.json({ template });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { name, description, payment_type, terms, variables, is_active } = body;
  const updateData = Object.fromEntries(
    Object.entries({ name, description, payment_type, terms, variables, is_active }).filter(([, value]) => value !== undefined)
  );

  const [template] = await db.update(tosTemplates).set(updateData).where(eq(tosTemplates.id, id)).returning();
  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });
  return NextResponse.json({ template });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const [mapping] = await db.select({ id: packageTosMappings.id }).from(packageTosMappings).where(eq(packageTosMappings.tos_template_id, id)).limit(1);
  if (mapping) {
    return NextResponse.json({ error: "Cannot delete template that is assigned to packages" }, { status: 400 });
  }

  await db.update(tosTemplates).set({ is_active: false }).where(eq(tosTemplates.id, id));
  return NextResponse.json({ success: true });
}
