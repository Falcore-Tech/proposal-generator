import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/api-auth";

// GET /api/admin/tos-templates/[id] - Get single ToS template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const supabase = await createClient();

  const { data: template, error: fetchError } = await supabase
    .from("tos_templates")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchError) {
    return NextResponse.json(
      { error: fetchError.message },
      { status: 404 }
    );
  }

  return NextResponse.json({ template });
}

// PUT /api/admin/tos-templates/[id] - Update ToS template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const supabase = await createClient();

  try {
    const body = await request.json();
    const { name, description, payment_type, terms, variables, is_active } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (payment_type !== undefined) updateData.payment_type = payment_type;
    if (terms !== undefined) updateData.terms = terms;
    if (variables !== undefined) updateData.variables = variables;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: template, error: updateError } = await supabase
      .from("tos_templates")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// DELETE /api/admin/tos-templates/[id] - Soft delete ToS template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const supabase = await createClient();

  // Check if template is in use
  const { data: mappings } = await supabase
    .from("package_tos_mappings")
    .select("id")
    .eq("tos_template_id", params.id)
    .limit(1);

  if (mappings && mappings.length > 0) {
    return NextResponse.json(
      { error: "Cannot delete template that is assigned to packages" },
      { status: 400 }
    );
  }

  // Soft delete by setting is_active to false
  const { error: updateError } = await supabase
    .from("tos_templates")
    .update({ is_active: false })
    .eq("id", params.id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}