import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/auth/api";

// POST /api/admin/package-tos - Assign ToS to package
export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const supabase = await createClient();

  try {
    const body = await request.json();
    const { package_id, tos_template_id, is_default } = body;

    if (!package_id || !tos_template_id) {
      return NextResponse.json(
        { error: "package_id and tos_template_id are required" },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults for this package
    if (is_default) {
      await supabase
        .from("package_tos_mappings")
        .update({ is_default: false })
        .eq("package_id", package_id);
    }

    // Create or update the mapping
    const { data: mapping, error: upsertError } = await supabase
      .from("package_tos_mappings")
      .upsert({
        package_id,
        tos_template_id,
        is_default: is_default || false,
      })
      .select()
      .single();

    if (upsertError) {
      return NextResponse.json(
        { error: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ mapping }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// GET /api/admin/package-tos - Get all mappings
export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const packageId = searchParams.get("package_id");

  let query = supabase
    .from("package_tos_mappings")
    .select(`
      *,
      package:packages(*),
      tos_template:tos_templates(*)
    `);

  if (packageId) {
    query = query.eq("package_id", packageId);
  }

  const { data: mappings, error: fetchError } = await query
    .order("created_at", { ascending: false });

  if (fetchError) {
    return NextResponse.json(
      { error: fetchError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ mappings });
}