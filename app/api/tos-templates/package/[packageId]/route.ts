import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireAuth } from "@/lib/auth/api";

// GET /api/tos-templates/package/[packageId] - Get available ToS for a package
export async function GET(
  request: NextRequest,
  { params }: { params: { packageId: string } }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = await createClient();

  // Get all ToS templates assigned to this package
  const { data: mappings, error: fetchError } = await supabase
    .from("package_tos_mappings")
    .select(`
      *,
      tos_template:tos_templates(*)
    `)
    .eq("package_id", params.packageId)
    .eq("tos_template.is_active", true)
    .order("is_default", { ascending: false });

  if (fetchError) {
    return NextResponse.json(
      { error: fetchError.message },
      { status: 500 }
    );
  }

  // Format the response
  const templates = mappings
    .filter(m => m.tos_template)
    .map(m => ({
      ...m.tos_template,
      is_default: m.is_default
    }));

  return NextResponse.json({ templates });
}