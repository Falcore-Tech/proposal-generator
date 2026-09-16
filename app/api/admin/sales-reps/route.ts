import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, profiles } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { requireAdmin } from "@/lib/auth/api";

export async function POST(request: Request) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { email, password, name } = await request.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const [existingProfile] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1);
  if (existingProfile) {
    return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
  }

  const { data: created, error: createError } = await auth.admin.createUser({
    email,
    password,
    name: name || email.split("@")[0],
    role: "user",
  });
  if (createError || !created?.user) {
    return NextResponse.json({ error: createError?.message ?? "Failed to create user account" }, { status: 400 });
  }

  const [profile] = await db
    .insert(profiles)
    .values({ id: created.user.id, email: created.user.email, name: name || null, role: "sales_rep" })
    .returning();

  return NextResponse.json({
    message: "Sales representative created successfully",
    user: { id: profile.id, email: profile.email, name: profile.name, role: profile.role, created_at: profile.created_at },
  });
}

export async function GET() {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const salesReps = await db
    .select({ id: profiles.id, email: profiles.email, name: profiles.name, role: profiles.role, created_at: profiles.created_at, updated_at: profiles.updated_at })
    .from(profiles)
    .where(eq(profiles.role, "sales_rep"))
    .orderBy(desc(profiles.created_at));

  return NextResponse.json({ salesReps });
}
