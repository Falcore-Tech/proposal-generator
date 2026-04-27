import { Suspense } from "react";
import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { requireRole } from "@/lib/auth-helpers";
import { commonClasses } from "@/lib/design-system";
import ProposalsList from "@/components/proposal/ProposalsList";
import ProposalsListSkeleton from "@/components/proposal/ProposalsListSkeleton";
import type { AnimatedProposal } from "@/types/animated-proposal";

export const metadata: Metadata = {
  title: "All Proposals - XMA Agency",
  description: "View and manage all client proposals",
};

async function getClassicProposals(userId: string, userRole: "admin" | "sales_rep", showArchived: boolean, filterByCreator?: string) {
  try {
    const supabase = await createClient();
    let query = supabase.from("proposals").select(`
      *,
      client:clients(*),
      links:proposal_links(*),
      package:packages(*),
      created_by_profile:profiles!created_by(name, email)
    `);

    if (userRole === "sales_rep") {
      query = query.eq("created_by", userId);
    } else if (filterByCreator) {
      query = query.eq("created_by", filterByCreator);
    }

    if (showArchived) {
      query = query.not("archived_at", "is", null);
    } else {
      query = query.is("archived_at", null);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

async function getAnimatedProposals(userId: string, userRole: "admin" | "sales_rep", showArchived: boolean, filterByCreator?: string): Promise<AnimatedProposal[]> {
  try {
    const supabase = await createClient();
    let query = (supabase as any)
      .from("animated_proposals")
      .select("id, token, slug, status, brand, client_full_name, company_name, project_title, total_price_cents, currency, created_at, updated_at, archived_at, expires_at, created_by, client_signed_at, provider_signed_at")
      .order("created_at", { ascending: false });

    if (userRole === "sales_rep") {
      query = query.eq("created_by", userId);
    } else if (filterByCreator) {
      query = query.eq("created_by", filterByCreator);
    }

    if (showArchived) {
      query = query.not("archived_at", "is", null);
    } else {
      query = query.is("archived_at", null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

interface ProposalsContentProps {
  userId: string;
  userRole: "admin" | "sales_rep";
  showArchived: boolean;
  filterByCreator?: string;
}

async function ProposalsContent({ userId, userRole, showArchived, filterByCreator }: ProposalsContentProps) {
  const [classic, animated] = await Promise.all([
    getClassicProposals(userId, userRole, showArchived, filterByCreator),
    getAnimatedProposals(userId, userRole, showArchived, filterByCreator),
  ]);

  return <ProposalsList initialClassic={classic} initialAnimated={animated} userRole={userRole} />;
}

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; search?: string; created_by?: string }>;
}) {
  const user = await requireRole(["admin", "sales_rep"]);
  const params = await searchParams;

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
