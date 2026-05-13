import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/auth/api";

// PUT /api/admin/package-tos/[id] - Update mapping (e.g., set as default)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const supabase = await createClient();

  try {
    const body = await request.json();
    const { is_default } = body;

    // Get the mapping to find the package_id
    const { data: mapping } = await supabase
      .from("package_tos_mappings")
      .select("package_id")
      .eq("id", params.id)
      .single();

    if (!mapping) {
      return NextResponse.json(
        { error: "Mapping not found" },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults for this package
    if (is_default) {
      await supabase
        .from("package_tos_mappings")
        .update({ is_default: false })
        .eq("package_id", mapping.package_id);
    }

    // Update the mapping
    const { data: updatedMapping, error: updateError } = await supabase
      .from("package_tos_mappings")
      .update({ is_default })
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ mapping: updatedMapping });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// DELETE /api/admin/package-tos/[id] - Remove mapping
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("package_tos_mappings")
    .delete()
    .eq("id", params.id);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}