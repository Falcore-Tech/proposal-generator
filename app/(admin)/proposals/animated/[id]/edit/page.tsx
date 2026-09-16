import Link from "next/link";
import { asc } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/page";
import { db, packages, tosTemplates } from "@/lib/db";
import { fetchProposalById } from "@/lib/db/queries/animated-proposals";
import { commonClasses } from "@/lib/design-system";
import { AnimatedProposalForm } from "@/components/proposal/AnimatedProposalForm";

export const dynamic = "force-dynamic";

export default async function EditAnimatedProposalPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "sales_rep"]);
  const { id } = await params;

  const [proposal, packageOptions, tosTemplateOptions] = await Promise.all([
    fetchProposalById(id),
    db.select({ id: packages.id, name: packages.name, price: packages.price, currency: packages.currency, usd_price: packages.usd_price }).from(packages).orderBy(asc(packages.name)),
    db.select({ id: tosTemplates.id, name: tosTemplates.name, terms: tosTemplates.terms }).from(tosTemplates).orderBy(asc(tosTemplates.name)),
  ]);

  if (!proposal) {
    return (
      <div className={commonClasses.pageContainer}>
        <div className={commonClasses.contentContainer}>
          <p className="text-semantic-error">Proposal not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={commonClasses.pageContainer}>
      <div className={commonClasses.contentContainer}>
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/proposals/animated/${id}`} className="text-text-muted hover:text-text-primary transition-colors flex items-center gap-2">
            <ArrowLeft size={16} />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Animated Proposal</h1>
            <p className="text-text-muted text-sm mt-1">{proposal.company_name} — {proposal.project_title}</p>
          </div>
        </div>

        <AnimatedProposalForm proposal={proposal} packages={packageOptions} tosTemplates={tosTemplateOptions} />
      </div>
    </div>
  );
}
