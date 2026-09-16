import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, tosTemplates } from "@/lib/db";
import { requireAuth } from "@/lib/auth/api";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const templates = await db.select().from(tosTemplates).where(eq(tosTemplates.is_active, true)).orderBy(asc(tosTemplates.name));
  const isDefault = (template: (typeof templates)[number]) => template.variables?.is_default === true;
  templates.sort((a, b) => Number(isDefault(b)) - Number(isDefault(a)));

  return NextResponse.json({ templates });
}
