import { NextResponse } from "next/server";
import { resolveAuthContext } from "@/lib/auth/core";

export async function GET() {
  const ctx = await resolveAuthContext();
  if (ctx.kind === "anonymous") return NextResponse.json({ user: null, role: null });
  const role = ctx.kind === "authenticated" ? ctx.role : ctx.kind === "deactivated" ? "deactivated" : null;
  return NextResponse.json({ user: ctx.user, role });
}
