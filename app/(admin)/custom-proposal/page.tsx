import { requireRole } from "@/lib/auth/page";
import CustomProposalClient from "@/components/proposal/CustomProposalClient";

export default async function CustomProposalPage() {
  const user = await requireRole(["admin", "sales_rep"]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Custom Proposal Generator</h1>
      <CustomProposalClient />
    </div>
  );
}