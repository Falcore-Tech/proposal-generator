import { Suspense } from "react";
import { Metadata } from "next";
import { and, desc, eq, isNotNull, isNull, type SQL } from "drizzle-orm";
import { db, animatedProposals } from "@/lib/db";
import { requireRole } from "@/lib/auth/page";
import { commonClasses } from "@/lib/design-system";
import ProposalsList from "@/components/proposal/ProposalsList";
import ProposalsListSkeleton from "@/components/proposal/ProposalsListSkeleton";
import type { AnimatedProposal } from "@/types/animated-proposal";

export const metadata: Metadata = {
  title: "All Proposals - Falcore",
  description: "View and manage all client proposals",
};

export const dynamic = "force-dynamic";

async function getAnimatedProposals(showArchived: boolean, filterByCreator?: string): Promise<AnimatedProposal[]> {
  const conditions: SQL[] = [showArchived ? isNotNull(animatedProposals.archived_at) : isNull(animatedProposals.archived_at)];
  if (filterByCreator) conditions.push(eq(animatedProposals.created_by, filterByCreator));

  const rows = await db.select().from(animatedProposals).where(and(...conditions)).orderBy(desc(animatedProposals.created_at));
  return rows as unknown as AnimatedProposal[];
}

interface ProposalsContentProps {
  userRole: "admin" | "sales_rep";
  showArchived: boolean;
  filterByCreator?: string;
}

async function ProposalsContent({ userRole, showArchived, filterByCreator }: ProposalsContentProps) {
  const proposals = await getAnimatedProposals(showArchived, filterByCreator);
  return <ProposalsList initialProposals={proposals} userRole={userRole} />;
}

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; search?: string; created_by?: string }>;
}) {
  const user = await requireRole(["admin", "sales_rep"]);
  const params = await searchParams;

  return (
    <div className={commonClasses.pageContainer}>
      <div className={commonClasses.contentContainer}>
        <h1 className="text-3xl font-bold mb-6">All Proposals</h1>
        <Suspense fallback={<ProposalsListSkeleton />}>
          <ProposalsContent
            userRole={user.role}
            showArchived={params.filter === "archived"}
            filterByCreator={params.created_by}
          />
        </Suspense>
      </div>
    </div>
  );
}
