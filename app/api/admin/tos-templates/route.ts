import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, tosTemplates } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/api";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const templates = await db.select().from(tosTemplates).orderBy(desc(tosTemplates.created_at));
  return NextResponse.json({ templates });
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const { name, description, payment_type, terms, variables } = body ?? {};
  if (!name || !terms || !Array.isArray(terms)) {
    return NextResponse.json({ error: "Name and terms array are required" }, { status: 400 });
  }

  const [template] = await db
    .insert(tosTemplates)
    .values({ name, description, payment_type, terms, variables: variables ?? {}, created_by: user.id })
    .returning();

  return NextResponse.json({ template }, { status: 201 });
}
