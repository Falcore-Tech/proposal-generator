import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api";
import { getGlobalTheme, setGlobalTheme } from "@/lib/db/queries/settings";
import { isThemeId } from "@/lib/proposal-themes";

export async function GET() {
  return NextResponse.json({ proposal_theme: await getGlobalTheme() });
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const theme = body?.proposal_theme;
  if (!isThemeId(theme)) {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
  }

  return NextResponse.json({ proposal_theme: await setGlobalTheme(theme, user.id) });
}
