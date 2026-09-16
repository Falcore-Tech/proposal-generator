import { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db, animatedProposals } from "@/lib/db";
import { requireAdminRole } from "@/lib/auth/page";
import { commonClasses } from "@/lib/design-system";
import ReportsClient from "./ReportsClient";

export const metadata: Metadata = {
  title: "Reports - Falcore",
  description: "View proposal analytics and reports",
};

export const dynamic = "force-dynamic";

function toReportsProposal(proposal: typeof animatedProposals.$inferSelect) {
  return {
    id: proposal.id,
    status: proposal.status,
    created_at: proposal.created_at,
    proposal_data: {
      includePackage: true,
      includeTax: false,
      selectedPackage: { price: proposal.total_price_cents / 100 },
      selectedServices: [],
    },
  };
}

export default async function ReportsPage() {
  await requireAdminRole();
  const proposals = await db.select().from(animatedProposals).orderBy(desc(animatedProposals.created_at));

  return (
    <div className={commonClasses.pageContainer}>
      <div className={commonClasses.contentContainer}>
        <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>
        <ReportsClient initialProposals={proposals.map(toReportsProposal) as never} />
      </div>
    </div>
  );
}
