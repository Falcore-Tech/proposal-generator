import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireAuth } from "@/lib/auth/api";

// GET /api/tos-templates - List active ToS templates (accessible to all authenticated users)
export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = await createClient();

  const { data: templates, error: fetchError } = await supabase
    .from("tos_templates")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (!fetchError && templates) {
    templates.sort((a, b) => {
      const aDefault = a.variables?.is_default === true;
      const bDefault = b.variables?.is_default === true;
      if (aDefault && !bDefault) return -1;
      if (!aDefault && bDefault) return 1;
      return 0;
    });
  }

  if (fetchError) {
    return NextResponse.json(
      { error: fetchError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ templates });
}