import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/auth/api";

// GET /api/admin/tos-templates - List all ToS templates
export async function GET() {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const supabase = await createClient();

  const { data: templates, error: fetchError } = await supabase
    .from("tos_templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (fetchError) {
    return NextResponse.json(
      { error: fetchError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ templates });
}

// POST /api/admin/tos-templates - Create new ToS template
export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const supabase = await createClient();

  try {
    const body = await request.json();
    const { name, description, payment_type, terms, variables } = body;

    if (!name || !terms || !Array.isArray(terms)) {
      return NextResponse.json(
        { error: "Name and terms array are required" },
        { status: 400 }
      );
    }

    const { data: template, error: insertError } = await supabase
      .from("tos_templates")
      .insert({
        name,
        description,
        payment_type,
        terms,
        variables: variables || {},
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}