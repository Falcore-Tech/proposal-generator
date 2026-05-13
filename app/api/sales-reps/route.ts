import { createClient } from "@/utils/supabase/server";
import { requireAuth } from "@/lib/auth/api";

export async function GET(request: Request) {
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

    // Get all sales reps
    const { data: salesReps } = await supabase
      .from("profiles")
      .select(`
        id,
        name,
        email,
        created_at,
        role
      `)
      .eq("role", "sales_rep")
      .order("created_at", { ascending: false });

    // Get proposal stats for each sales rep
    const salesRepStats = salesReps ? await Promise.all(
      salesReps.map(async (rep) => {
        const { data: activeProposals } = await supabase
          .from("proposals")
          .select("id, status")
          .eq("created_by", rep.id)
          .is("archived_at", null);

        const { data: archivedProposals } = await supabase
          .from("proposals")
          .select("id")
          .eq("created_by", rep.id)
          .not("archived_at", "is", null);

        const statusCounts = activeProposals?.reduce((acc, proposal) => {
          const status = proposal.status || "draft";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        return {
          ...rep,
          totalActive: activeProposals?.length || 0,
          totalArchived: archivedProposals?.length || 0,
          statusCounts
        };
      })
    ) : [];

    return Response.json({
      salesReps: salesReps || [],
      salesRepStats
    });

  } catch (error) {
    console.error("Error fetching sales team data:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}