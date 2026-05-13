import { createClient } from "@/utils/supabase/server";
import { requireAuth } from "@/lib/auth/api";

export async function POST(request: Request) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const supabase = await createClient();

    // Verify user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return Response.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { salesRepId } = body;

    if (!salesRepId) {
      return Response.json(
        { error: "Sales rep ID is required" },
        { status: 400 }
      );
    }

    // Verify the target user is a sales rep
    const { data: targetProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, email")
      .eq("id", salesRepId)
      .single();

    console.log("Target profile lookup:", { targetProfile, profileError, salesRepId });

    if (profileError || !targetProfile) {
      return Response.json(
        { error: "Sales representative not found", details: profileError?.message },
        { status: 404 }
      );
    }

    if (targetProfile.role !== "sales_rep") {
      return Response.json(
        { error: `Target user is not a sales representative. Current role: ${targetProfile.role}` },
        { status: 400 }
      );
    }

    // Note: We're not automatically archiving proposals - admin can do that separately if needed

    // Deactivate the sales rep by changing their role to 'deactivated'
    const { data: updateResult, error: deactivateError } = await supabase
      .from("profiles")
      .update({ 
        role: "deactivated",
        updated_at: new Date().toISOString()
      })
      .eq("id", salesRepId)
      .select();

    console.log("Deactivation result:", { updateResult, deactivateError, salesRepId });

    if (deactivateError) {
      console.error("Error deactivating sales rep:", deactivateError);
      return Response.json(
        { error: "Failed to deactivate sales representative" },
        { status: 500 }
      );
    }

    if (!updateResult || updateResult.length === 0) {
      return Response.json(
        { error: "No user was updated - sales rep may not exist" },
        { status: 404 }
      );
    }

    return Response.json({
      message: "Sales representative deactivated successfully",
      email: targetProfile.email
    });

  } catch (error) {
    console.error("Error deactivating sales rep:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}