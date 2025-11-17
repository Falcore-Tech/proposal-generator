import { Suspense } from "react";
import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { requireRole } from "@/lib/auth-helpers";
import { commonClasses } from "@/lib/design-system";
import ProposalsList from "@/components/proposal/ProposalsList";
import ProposalsListSkeleton from "@/components/proposal/ProposalsListSkeleton";

export const metadata: Metadata = {
  title: "All Proposals - XMA Agency",
  description: "View and manage all client proposals",
};

async function getProposalsData(
  userId: string,
  userRole: "admin" | "sales_rep",
  showArchived: boolean = false,
  filterByCreator?: string
) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("proposals")
      .select(
        `
        *,
        client:clients(*),
        links:proposal_links(*),
        package:packages(*),
        created_by_profile:profiles!created_by(name, email)
      `
      );

    // Apply filters
    if (userRole === "sales_rep") {
      // Sales reps can only see their own proposals
      query = query.eq("created_by", userId);
    } else if (filterByCreator) {
      // Admin filtering by specific creator
      query = query.eq("created_by", filterByCreator);
    }

    // Archive filtering
    if (showArchived) {
      query = query.not("archived_at", "is", null);
    } else {
      query = query.is("archived_at", null);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return [];
  }
}

interface ProposalsContentProps {
  userId: string;
  userRole: "admin" | "sales_rep";
  showArchived: boolean;
  filterByCreator?: string;
}

async function ProposalsContent({
  userId,
  userRole,
  showArchived,
  filterByCreator,
}: ProposalsContentProps) {
  const proposals = await getProposalsData(userId, userRole, showArchived, filterByCreator);

  return <ProposalsList initialProposals={proposals} userRole={userRole} />;
}

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{
    filter?: string;
    search?: string;
    created_by?: string;
  }>;
}) {
  const user = await requireRole(["admin", "sales_rep"]);
  const params = await searchParams;

  // Determine what proposals to fetch based on URL params
  const showArchived = params.filter === "archived";
  const filterByCreator = params.created_by;

  return (
    <div className={commonClasses.pageContainer}>
      <div className={commonClasses.contentContainer}>
        <h1 className="text-3xl font-bold mb-6">
          {user.role === "sales_rep" ? "My Proposals" : "All Proposals"}
        </h1>
        <Suspense fallback={<ProposalsListSkeleton />}>
          <ProposalsContent
            userId={user.id}
            userRole={user.role!}
            showArchived={showArchived}
            filterByCreator={filterByCreator}
          />
        </Suspense>
      </div>
    </div>
  );
}
