import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { DEFAULT_THEME_ID, isThemeId } from "@/lib/proposal-themes";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings" as any)
    .select("proposal_theme")
    .eq("id", true)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const theme = (data as { proposal_theme?: string } | null)?.proposal_theme;
  return NextResponse.json({
    proposal_theme: isThemeId(theme) ? theme : DEFAULT_THEME_ID,
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const theme = body?.proposal_theme;
  if (!isThemeId(theme)) {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("app_settings" as any)
    .update({ proposal_theme: theme, updated_at: new Date().toISOString(), updated_by: user.id } as any)
    .eq("id", true)
    .select("proposal_theme")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    proposal_theme: (data as { proposal_theme: string }).proposal_theme,
  });
}
