import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(request: Request) {
  try {
    // Require authentication (admin or sales_rep)
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const supabase = await createClient();
    const body = await request.json();
    const { proposalId } = body;

    if (!proposalId) {
      return NextResponse.json(
        { error: "Proposal ID is required" },
        { status: 400 }
      );
    }

    // First, check if the proposal exists and if the user has permission to archive it
    const { data: proposal, error: fetchError } = await supabase
      .from("proposals")
      .select("id, created_by, title, company_name, archived_at")
      .eq("id", proposalId)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Check if proposal is already archived
    if (proposal.archived_at) {
      return NextResponse.json(
        { error: "Proposal is already archived" },
        { status: 400 }
      );
    }

    // Get user role to check permissions
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Check permissions: admin can archive any, sales_rep can only archive their own
    if (profile?.role !== "admin" && proposal.created_by !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to archive this proposal" },
        { status: 403 }
      );
    }

    // Archive the proposal
    const { data: archivedProposal, error: archiveError } = await supabase
      .from("proposals")
      .update({
        archived_at: new Date().toISOString(),
        archived_by: user.id
      })
      .eq("id", proposalId)
      .select()
      .single();

    if (archiveError) {
      console.error("Error archiving proposal:", archiveError);
      return NextResponse.json(
        { error: "Failed to archive proposal" },
        { status: 500 }
      );
    }

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: user.id,
      event: "classic_proposal_archived",
      properties: {
        proposal_id: proposalId,
        company_name: proposal.company_name,
      },
    });

    return NextResponse.json({
      message: "Proposal archived successfully",
      proposal: archivedProposal
    });

  } catch (error) {
    console.error("Error in proposal archive:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get("proposalId");

    if (!proposalId) {
      return NextResponse.json(
        { error: "Proposal ID is required" },
        { status: 400 }
      );
    }

    // First, check if the proposal exists and if the user has permission to restore it
    const { data: proposal, error: fetchError } = await supabase
      .from("proposals")
      .select("id, created_by, title, company_name, archived_at")
      .eq("id", proposalId)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Check if proposal is not archived
    if (!proposal.archived_at) {
      return NextResponse.json(
        { error: "Proposal is not archived" },
        { status: 400 }
      );
    }

    // Get user role to check permissions
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Check permissions: admin can restore any, sales_rep can only restore their own
    if (profile?.role !== "admin" && proposal.created_by !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to restore this proposal" },
        { status: 403 }
      );
    }

    // Restore the proposal (remove archive fields)
    const { data: restoredProposal, error: restoreError } = await supabase
      .from("proposals")
      .update({
        archived_at: null,
        archived_by: null
      })
      .eq("id", proposalId)
      .select()
      .single();

    if (restoreError) {
      console.error("Error restoring proposal:", restoreError);
      return NextResponse.json(
        { error: "Failed to restore proposal" },
        { status: 500 }
      );
    }

    // Log the restore activity (the database trigger will handle this automatically)

    return NextResponse.json({
      message: "Proposal restored successfully",
      proposal: restoredProposal
    });

  } catch (error) {
    console.error("Error in proposal restore:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}